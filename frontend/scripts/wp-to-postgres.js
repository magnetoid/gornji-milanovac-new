#!/usr/bin/env node
// Import a WordPress export (WXR, Tools → Export → All content) into the portal database.
//
//   DATABASE_URL=... node scripts/wp-to-postgres.js --wp-export export.xml [--site-url https://gornji-milanovac.com] [--dry-run]
//
// Imports categories (with parents), published/draft posts with tags and featured
// images, pages, and the RSS sources configured in WP RSS Aggregator, Feedzy or
// WPeMatico, so the new aggregator keeps pulling from the same outlets. Posts and pages keep their WordPress slugs, so old URLs keep
// working through the legacy redirects. Re-running is safe: existing slugs are skipped.
// Image URLs under <site-url>/wp-content/uploads/ are rewritten to /uploads/; copy the
// wp-content/uploads directory into UPLOAD_DIR (the "uploads" volume) to serve them.

const fs = require('fs');
const { Pool } = require('pg');

function parseArgs(argv) {
  const args = { siteUrl: 'https://gornji-milanovac.com', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--wp-export') args.file = argv[++i];
    else if (argv[i] === '--site-url') args.siteUrl = argv[++i];
    else if (argv[i] === '--dry-run') args.dryRun = true;
  }
  return args;
}

// ── XML helpers (WXR fields are either CDATA or plain escaped text) ──

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&');
}

function fieldValue(raw) {
  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(raw);
  return cdata ? cdata[1] : decodeEntities(raw.trim());
}

function field(xml, tag) {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(xml);
  return match ? fieldValue(match[1]) : '';
}

function blocks(xml, tag) {
  return Array.from(xml.matchAll(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'g')), (m) => m[0]);
}

function postMeta(item) {
  const meta = {};
  for (const block of blocks(item, 'wp:postmeta')) {
    meta[field(block, 'wp:meta_key')] = field(block, 'wp:meta_value');
  }
  return meta;
}

function terms(item, domain) {
  const pattern = new RegExp(`<category domain="${domain}" nicename="([^"]*)"[^>]*>([\\s\\S]*?)</category>`, 'g');
  return Array.from(item.matchAll(pattern), (m) => ({ slug: decodeSlug(m[1]), name: fieldValue(m[2]) }));
}

// ── Text helpers ──

const cyrillic = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e', ж: 'z', з: 'z', и: 'i', ј: 'j', к: 'k',
  л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'c', у: 'u',
  ф: 'f', х: 'h', ц: 'c', ч: 'c', џ: 'dz', ш: 's',
};

function slugify(text) {
  return Array.from(text.toLowerCase(), (ch) => cyrillic[ch] ?? ch)
    .join('')
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

// WordPress stores non-ASCII slugs percent-encoded
function decodeSlug(slug) {
  let decoded = slug;
  try { decoded = decodeURIComponent(slug); } catch {}
  return /^[a-z0-9-]+$/.test(decoded) ? decoded : slugify(decoded);
}

function stripHtml(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' '))
    .replace(/\[[^\]]+\]/g, ' ') // shortcodes
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptOf(text, max = 300) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).replace(/[\s,.;:–-]+$/, '')}…`;
}

// "2024-03-12 08:15:00" (GMT) -> Date; WordPress uses zeros for unscheduled drafts
function wpDate(gmt, local, pubDate) {
  if (gmt && !gmt.startsWith('0000')) return new Date(`${gmt.replace(' ', 'T')}Z`);
  if (pubDate) {
    const date = new Date(pubDate);
    if (!Number.isNaN(date.getTime())) return date;
  }
  if (local && !local.startsWith('0000')) return new Date(`${local.replace(' ', 'T')}+01:00`);
  return null;
}

const postStatus = { publish: 'published', future: 'scheduled', draft: 'draft', pending: 'draft', private: 'draft' };

// Original-article URL meta keys used by common WordPress aggregator plugins
const sourceUrlKeys = ['wprss_item_permalink', 'feedzy_item_url', 'wpe_sourcepermalink', 'syndication_permalink', 'original_link', 'source_url', '_source_url'];

// Strings inside a PHP-serialized value: a:1:{i:0;s:22:"https://primer.rs/feed";}
function phpStrings(value) {
  return Array.from((value || '').matchAll(/s:\d+:"([^"]*)"/g), (m) => m[1]);
}

function splitList(value) {
  return (value || '').split(/[\s,]+/).filter(Boolean);
}

// The old site keeps only news that mention Gornji Milanovac
const DEFAULT_KEYWORDS = 'gornj* milanov*';

// Feed definitions stored by WordPress aggregator plugins (they export as custom post types)
function feedSources(items) {
  const sources = [];
  for (const item of items) {
    const type = field(item, 'wp:post_type');
    if (['trash', 'auto-draft'].includes(field(item, 'wp:status'))) continue;
    const meta = postMeta(item);
    let urls;
    let keywords;
    if (type === 'wprss_feed') {
      urls = [meta.wprss_url];
      keywords = meta.wprss_keywords;
    } else if (type === 'feedzy_imports') {
      urls = splitList(meta.source);
      keywords = meta.inc_key;
    } else if (type === 'feedzy_categories') {
      urls = splitList(meta.feedzy_category_feed);
    } else if (type === 'wpematico') {
      urls = phpStrings(meta.campaign_feeds);
      keywords = phpStrings(meta.campaign_kwords).join(', ');
    } else {
      continue;
    }
    const valid = urls.map((u) => (u || '').trim()).filter((u) => /^https?:\/\/\S+$/.test(u));
    for (const url of valid) {
      let name = field(item, 'title');
      if (!name || valid.length > 1) {
        try { name = new URL(url).hostname.replace(/^www\./, ''); } catch {}
      }
      sources.push({ name, url, keywords: (keywords || '').trim() || DEFAULT_KEYWORDS });
    }
  }
  return sources;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) {
    console.error('Usage: node scripts/wp-to-postgres.js --wp-export export.xml [--site-url https://gornji-milanovac.com] [--dry-run]');
    process.exit(1);
  }

  const host = new URL(args.siteUrl).host.replace(/^www\./, '').replace(/\./g, '\\.');
  const uploadsPattern = new RegExp(`https?://(?:www\\.)?${host}/wp-content/uploads/`, 'g');
  const rewriteUploads = (html) => html.replace(uploadsPattern, '/uploads/');
  // Featured images are stored relative to UPLOAD_DIR, like files from /api/upload
  const uploadPath = (url) => {
    const local = url.replace(uploadsPattern, '/uploads/');
    return local.startsWith('/uploads/') ? local.slice('/uploads/'.length) : url;
  };

  console.log(`Reading ${args.file}…`);
  const xml = fs.readFileSync(args.file, 'utf8');
  const items = blocks(xml, 'item');

  const attachments = {};
  for (const item of items) {
    if (field(item, 'wp:post_type') === 'attachment') {
      attachments[field(item, 'wp:post_id')] = field(item, 'wp:attachment_url');
    }
  }

  const categories = blocks(xml, 'wp:category').map((block) => ({
    slug: decodeSlug(field(block, 'wp:category_nicename')),
    name: field(block, 'wp:cat_name'),
    parent: decodeSlug(field(block, 'wp:category_parent')),
    description: field(block, 'wp:category_description'),
  })).filter((c) => c.slug && c.name);

  const posts = items.filter((item) => field(item, 'wp:post_type') === 'post');
  const pages = items.filter((item) => field(item, 'wp:post_type') === 'page');
  const sources = feedSources(items);
  console.log(`Found ${categories.length} categories, ${posts.length} posts, ${pages.length} pages, ${Object.keys(attachments).length} attachments, ${sources.length} RSS sources.`);
  for (const source of sources) console.log(`  RSS: ${source.name} <${source.url}> keywords: ${source.keywords}`);
  if (args.dryRun) return;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  const stats = { categories: 0, posts: 0, pages: 0, sources: 0, skipped: 0 };

  try {
    // Categories, then parents once every slug exists
    for (const category of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING RETURNING id`,
        [category.name, category.slug, category.description || null]
      );
      stats.categories += result.rowCount;
    }
    for (const category of categories.filter((c) => c.parent)) {
      await client.query(
        `UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = $2)
         WHERE slug = $1 AND parent_id IS NULL`,
        [category.slug, category.parent]
      );
    }
    const categoryIds = Object.fromEntries(
      (await client.query('SELECT id, slug FROM categories')).rows.map((row) => [row.slug, row.id])
    );

    for (let i = 0; i < posts.length; i++) {
      const item = posts[i];
      const status = postStatus[field(item, 'wp:status')];
      if (!status) { stats.skipped++; continue; }

      const wpId = field(item, 'wp:post_id');
      const title = field(item, 'title') || '(bez naslova)';
      const slug = decodeSlug(field(item, 'wp:post_name')) || `${slugify(title) || 'vest'}-${wpId}`;
      const content = rewriteUploads(field(item, 'content:encoded'));
      const excerpt = stripHtml(field(item, 'excerpt:encoded')) || excerptOf(stripHtml(content));
      const meta = postMeta(item);
      const sourceUrl = sourceUrlKeys.map((key) => meta[key]).find((v) => /^https?:\/\//.test(v || '')) || null;
      let sourceName = null;
      if (sourceUrl) {
        try { sourceName = new URL(sourceUrl).hostname.replace(/^www\./, ''); } catch {}
      }
      const category = terms(item, 'category')[0];
      const tags = terms(item, 'post_tag').map((t) => t.name);
      const image = attachments[meta._thumbnail_id];

      const result = await client.query(
        `INSERT INTO posts (status, title, slug, excerpt, content, featured_image, category_id, tags,
                            source_name, source_url, published_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($11, NOW()))
         ON CONFLICT (slug) DO NOTHING RETURNING id`,
        [
          status,
          title.slice(0, 500),
          slug.slice(0, 500),
          excerpt || null,
          content || null,
          image ? uploadPath(image).slice(0, 500) : null,
          category ? categoryIds[category.slug] || null : null,
          tags.length ? tags : null,
          sourceName,
          sourceUrl ? sourceUrl.slice(0, 500) : null,
          wpDate(field(item, 'wp:post_date_gmt'), field(item, 'wp:post_date'), field(item, 'pubDate')),
        ]
      );
      if (result.rowCount) stats.posts++;
      else stats.skipped++;
      if ((i + 1) % 250 === 0) console.log(`  posts ${i + 1}/${posts.length}`);
    }

    // Pages, then parents by WordPress id
    const pageIds = {};
    const pageParents = [];
    for (const item of pages) {
      const status = field(item, 'wp:status') === 'publish' ? 'published' : 'draft';
      if (['trash', 'auto-draft', 'inherit'].includes(field(item, 'wp:status'))) { stats.skipped++; continue; }
      const title = field(item, 'title') || '(bez naslova)';
      const wpId = field(item, 'wp:post_id');
      const slug = decodeSlug(field(item, 'wp:post_name')) || `${slugify(title)}-${wpId}`;
      const result = await client.query(
        `INSERT INTO pages (status, title, slug, content, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET slug = pages.slug
         RETURNING id, (xmax = 0) AS created`,
        [status, title.slice(0, 500), slug.slice(0, 255), rewriteUploads(field(item, 'content:encoded')) || null,
         parseInt(field(item, 'wp:menu_order') || '0', 10) || 0]
      );
      pageIds[wpId] = result.rows[0].id;
      if (result.rows[0].created) stats.pages++;
      else stats.skipped++;
      const parent = field(item, 'wp:post_parent');
      if (parent && parent !== '0') pageParents.push([result.rows[0].id, parent]);
    }
    for (const [id, parentWpId] of pageParents) {
      if (pageIds[parentWpId]) {
        await client.query('UPDATE pages SET parent_id = $1 WHERE id = $2 AND parent_id IS NULL', [pageIds[parentWpId], id]);
      }
    }

    for (const source of sources) {
      const result = await client.query(
        `INSERT INTO news_sources (name, feed_url, keywords) VALUES ($1, $2, $3)
         ON CONFLICT (feed_url) DO NOTHING RETURNING id`,
        [source.name.slice(0, 255), source.url.slice(0, 1000), source.keywords.slice(0, 500)]
      );
      stats.sources += result.rowCount;
    }

    // Outlets the old posts link to, as a starting point when no plugin feeds were exported
    const hosts = await client.query(`
      SELECT source_name, COUNT(*) AS posts FROM posts
      WHERE source_name IS NOT NULL GROUP BY source_name ORDER BY COUNT(*) DESC LIMIT 20
    `);
    if (hosts.rows.length) {
      console.log('Most linked sources in the imported posts:');
      for (const row of hosts.rows) console.log(`  ${row.source_name}: ${row.posts}`);
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`Done: ${stats.categories} categories, ${stats.posts} posts, ${stats.pages} pages, ${stats.sources} RSS sources imported; ${stats.skipped} skipped (already present or trashed).`);
  console.log('Next: copy wp-content/uploads into UPLOAD_DIR and clear the cache (docker compose exec redis redis-cli FLUSHALL).');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
