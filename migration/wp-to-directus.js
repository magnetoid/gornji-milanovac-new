#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { createReadStream, createWriteStream } = require('fs');

const args = process.argv.slice(2);
let wpExportPath = '';
let directusUrl = 'http://localhost:8055';
let directusToken = '';
let resumeFromId = 0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--wp-export' && args[i + 1]) {
    wpExportPath = args[i + 1];
    i++;
  } else if (args[i] === '--directus-url' && args[i + 1]) {
    directusUrl = args[i + 1];
    i++;
  } else if (args[i] === '--directus-token' && args[i + 1]) {
    directusToken = args[i + 1];
    i++;
  } else if (args[i] === '--resume-from' && args[i + 1]) {
    resumeFromId = parseInt(args[i + 1], 10);
    i++;
  }
}

if (!wpExportPath || !directusToken) {
  console.log(`
Migracija WordPress-a u Directus

Korišćenje:
  node wp-to-directus.js --wp-export ./export.xml --directus-url http://localhost:8055 --directus-token TOKEN

Opcije:
  --wp-export      Putanja do WordPress WXR XML export fajla (obavezno)
  --directus-url   URL Directus instance (default: http://localhost:8055)
  --directus-token Directus statički API token (obavezno)
  --resume-from    WordPress post ID od kojeg nastaviti migraciju

Primer:
  node wp-to-directus.js --wp-export ./wordpress-export.xml --directus-url http://localhost:8055 --directus-token my-token
`);
  process.exit(1);
}

const progressFile = path.join(path.dirname(wpExportPath), '.migration-progress.json');

function loadProgress() {
  try {
    if (fs.existsSync(progressFile)) {
      return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    }
  } catch (e) {
    console.log('Napomena: Nije moguće učitati prethodni progres');
  }
  return { categories: {}, tags: {}, posts: [], lastPostId: 0 };
}

function saveProgress(progress) {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

async function directusRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, directusUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json.data || json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function uploadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    client.get(imageUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return uploadImage(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      const contentType = res.headers['content-type'] || 'image/jpeg';
      const fileName = path.basename(url.pathname) || 'image.jpg';
      const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

      const directusUrl_obj = new URL('/files', directusUrl);
      const isDirectusHttps = directusUrl_obj.protocol === 'https:';
      const directusClient = isDirectusHttps ? https : http;

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const imageBuffer = Buffer.concat(chunks);

        const prefix = Buffer.from(
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
          `Content-Type: ${contentType}\r\n\r\n`
        );
        const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
        const body = Buffer.concat([prefix, imageBuffer, suffix]);

        const uploadOptions = {
          hostname: directusUrl_obj.hostname,
          port: directusUrl_obj.port || (isDirectusHttps ? 443 : 80),
          path: '/files',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${directusToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length,
          },
        };

        const uploadReq = directusClient.request(uploadOptions, (uploadRes) => {
          let uploadBody = '';
          uploadRes.on('data', chunk => uploadBody += chunk);
          uploadRes.on('end', () => {
            try {
              const json = JSON.parse(uploadBody);
              if (uploadRes.statusCode >= 200 && uploadRes.statusCode < 300) {
                resolve(json.data?.id || null);
              } else {
                reject(new Error(`Upload failed: ${uploadBody}`));
              }
            } catch (e) {
              reject(new Error(`Parse error: ${uploadBody}`));
            }
          });
        });

        uploadReq.on('error', reject);
        uploadReq.write(body);
        uploadReq.end();
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseWXR(xmlContent) {
  const items = [];
  const categories = [];
  const tags = [];

  const categoryMatches = xmlContent.matchAll(/<wp:category>[\s\S]*?<\/wp:category>/g);
  for (const match of categoryMatches) {
    const cat = match[0];
    const nicename = cat.match(/<wp:category_nicename>([^<]*)<\/wp:category_nicename>/)?.[1] || '';
    const name = cat.match(/<wp:cat_name><!\[CDATA\[([\s\S]*?)\]\]><\/wp:cat_name>/)?.[1] || '';
    const parent = cat.match(/<wp:category_parent>([^<]*)<\/wp:category_parent>/)?.[1] || '';
    categories.push({ slug: nicename, name, parent });
  }

  const tagMatches = xmlContent.matchAll(/<wp:tag>[\s\S]*?<\/wp:tag>/g);
  for (const match of tagMatches) {
    const tag = match[0];
    const slug = tag.match(/<wp:tag_slug>([^<]*)<\/wp:tag_slug>/)?.[1] || '';
    const name = tag.match(/<wp:tag_name><!\[CDATA\[([\s\S]*?)\]\]><\/wp:tag_name>/)?.[1] || '';
    tags.push({ slug, name });
  }

  const itemMatches = xmlContent.matchAll(/<item>[\s\S]*?<\/item>/g);
  for (const match of itemMatches) {
    const item = match[0];
    const postType = item.match(/<wp:post_type><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_type>/)?.[1] || '';

    if (postType !== 'post' && postType !== 'page') continue;

    const wpId = parseInt(item.match(/<wp:post_id>(\d+)<\/wp:post_id>/)?.[1] || '0', 10);
    const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
                  item.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    const slug = item.match(/<wp:post_name><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_name>/)?.[1] ||
                 item.match(/<wp:post_name>([^<]*)<\/wp:post_name>/)?.[1] || '';
    const content = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || '';
    const excerpt = item.match(/<excerpt:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/excerpt:encoded>/)?.[1] || '';
    const pubDate = item.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1] || '';
    const status = item.match(/<wp:status><!\[CDATA\[([\s\S]*?)\]\]><\/wp:status>/)?.[1] || 'draft';

    const categoryMatch = item.match(/<category domain="category"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/category>/);
    const categoryName = categoryMatch?.[1] || '';

    const tagNames = [];
    const tagMatches = item.matchAll(/<category domain="post_tag"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g);
    for (const tagMatch of tagMatches) {
      tagNames.push(tagMatch[1]);
    }

    const featuredImageMatch = item.match(/<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/);
    const featuredImageId = featuredImageMatch?.[1] || null;

    const linkMatch = item.match(/<link>([^<]*)<\/link>/);
    const sourceUrl = linkMatch?.[1] || '';

    items.push({
      wpId,
      postType,
      title,
      slug: slug || `post-${wpId}`,
      content,
      excerpt,
      pubDate,
      status: status === 'publish' ? 'published' : status === 'future' ? 'scheduled' : 'draft',
      category: categoryName,
      tags: tagNames,
      featuredImageId,
      sourceUrl,
    });
  }

  const attachments = {};
  const attachmentMatches = xmlContent.matchAll(/<item>[\s\S]*?<\/item>/g);
  for (const match of attachmentMatches) {
    const item = match[0];
    const postType = item.match(/<wp:post_type><!\[CDATA\[([\s\S]*?)\]\]><\/wp:post_type>/)?.[1] || '';
    if (postType !== 'attachment') continue;

    const wpId = item.match(/<wp:post_id>(\d+)<\/wp:post_id>/)?.[1] || '';
    const attachmentUrl = item.match(/<wp:attachment_url><!\[CDATA\[([\s\S]*?)\]\]><\/wp:attachment_url>/)?.[1] ||
                          item.match(/<wp:attachment_url>([^<]*)<\/wp:attachment_url>/)?.[1] || '';
    if (wpId && attachmentUrl) {
      attachments[wpId] = attachmentUrl;
    }
  }

  return { items, categories, tags, attachments };
}

function progressBar(current, total, label = '') {
  const width = 40;
  const percent = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r${label} [${bar}] ${percent}% (${current}/${total})`);
}

async function migrate() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       WordPress to Directus Migration - Gornji Milanovac     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  console.log('📂 Učitavanje WordPress export fajla...');
  const xmlContent = fs.readFileSync(wpExportPath, 'utf8');
  const { items, categories, tags, attachments } = parseWXR(xmlContent);

  console.log(`   Pronađeno: ${items.length} stavki, ${categories.length} kategorija, ${tags.length} tagova`);
  console.log('');

  const progress = loadProgress();

  console.log('📁 Migracija kategorija...');
  const categoryMap = { ...progress.categories };
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    progressBar(i + 1, categories.length, 'Kategorije');

    if (categoryMap[cat.slug]) continue;

    try {
      const existing = await directusRequest('GET', `/items/categories?filter[slug][_eq]=${encodeURIComponent(cat.slug)}`);
      if (existing && existing.length > 0) {
        categoryMap[cat.slug] = existing[0].id;
      } else {
        const created = await directusRequest('POST', '/items/categories', {
          name: cat.name,
          slug: cat.slug,
        });
        categoryMap[cat.slug] = created.id;
      }
      progress.categories = categoryMap;
      saveProgress(progress);
    } catch (e) {
      console.log(`\n   ⚠️  Greška kod kategorije ${cat.name}: ${e.message}`);
    }
  }
  console.log('\n');

  for (const cat of categories) {
    if (cat.parent && categoryMap[cat.parent] && categoryMap[cat.slug]) {
      try {
        await directusRequest('PATCH', `/items/categories/${categoryMap[cat.slug]}`, {
          parent: categoryMap[cat.parent],
        });
      } catch (e) {
        // Ignore
      }
    }
  }

  console.log('🏷️  Migracija tagova...');
  const tagMap = { ...progress.tags };
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    progressBar(i + 1, tags.length, 'Tagovi   ');

    if (tagMap[tag.name]) continue;

    try {
      const existing = await directusRequest('GET', `/items/tags?filter[slug][_eq]=${encodeURIComponent(tag.slug)}`);
      if (existing && existing.length > 0) {
        tagMap[tag.name] = existing[0].id;
      } else {
        const created = await directusRequest('POST', '/items/tags', {
          name: tag.name,
          slug: tag.slug,
        });
        tagMap[tag.name] = created.id;
      }
      progress.tags = tagMap;
      saveProgress(progress);
    } catch (e) {
      console.log(`\n   ⚠️  Greška kod taga ${tag.name}: ${e.message}`);
    }
  }
  console.log('\n');

  console.log('📰 Migracija postova...');
  const posts = items.filter(i => i.postType === 'post').sort((a, b) => a.wpId - b.wpId);
  const migratedPosts = new Set(progress.posts || []);
  const startFrom = resumeFromId || progress.lastPostId || 0;

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    progressBar(i + 1, posts.length, 'Postovi  ');

    if (post.wpId <= startFrom || migratedPosts.has(post.wpId)) continue;

    try {
      const existing = await directusRequest('GET', `/items/posts?filter[wp_id][_eq]=${post.wpId}`);
      if (existing && existing.length > 0) {
        migratedPosts.add(post.wpId);
        continue;
      }

      let featuredImageFileId = null;
      if (post.featuredImageId && attachments[post.featuredImageId]) {
        try {
          featuredImageFileId = await uploadImage(attachments[post.featuredImageId]);
        } catch (e) {
          // Ignore image errors
        }
      }

      const categorySlug = categories.find(c => c.name === post.category)?.slug;
      const categoryId = categorySlug ? categoryMap[categorySlug] : null;

      const tagIds = post.tags.map(t => tagMap[t]).filter(Boolean);

      const postData = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || null,
        status: post.status,
        published_at: post.pubDate ? new Date(post.pubDate).toISOString() : null,
        category: categoryId,
        featured_image: featuredImageFileId,
        source_url: post.sourceUrl,
        source_name: 'WordPress Import',
        wp_id: post.wpId,
      };

      const created = await directusRequest('POST', '/items/posts', postData);

      if (tagIds.length > 0 && created.id) {
        for (const tagId of tagIds) {
          try {
            await directusRequest('POST', '/items/posts_tags', {
              posts_id: created.id,
              tags_id: tagId,
            });
          } catch (e) {
            // Ignore tag relation errors
          }
        }
      }

      migratedPosts.add(post.wpId);
      progress.posts = Array.from(migratedPosts);
      progress.lastPostId = post.wpId;
      saveProgress(progress);
      successCount++;
    } catch (e) {
      errorCount++;
      console.log(`\n   ⚠️  Greška kod posta ${post.wpId}: ${e.message}`);
    }
  }
  console.log('\n');

  console.log('📄 Migracija stranica...');
  const pages = items.filter(i => i.postType === 'page');
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    progressBar(i + 1, pages.length, 'Stranice ');

    try {
      const existing = await directusRequest('GET', `/items/pages?filter[slug][_eq]=${encodeURIComponent(page.slug)}`);
      if (existing && existing.length > 0) continue;

      await directusRequest('POST', '/items/pages', {
        title: page.title,
        slug: page.slug,
        content: page.content,
        status: page.status,
      });
    } catch (e) {
      console.log(`\n   ⚠️  Greška kod stranice ${page.title}: ${e.message}`);
    }
  }
  console.log('\n');

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      Migracija završena!                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`   ✅ Uspešno migrirano postova: ${successCount}`);
  console.log(`   ❌ Grešaka: ${errorCount}`);
  console.log(`   📁 Kategorije: ${Object.keys(categoryMap).length}`);
  console.log(`   🏷️  Tagovi: ${Object.keys(tagMap).length}`);
  console.log('');
}

migrate().catch((e) => {
  console.error('Fatalna greška:', e);
  process.exit(1);
});
