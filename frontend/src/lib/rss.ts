// RSS / Atom aggregator: pulls enabled news_sources and publishes matching
// items as posts with title, short excerpt, image and a link to the original.

import { createHash } from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { db, invalidateCache } from './db';
import { keywordMatcher, slugify, stripHtml, toLatin, truncate } from './text';

export interface FeedItem {
  title: string;
  link: string;
  summary: string;
  image: string | null;
  publishedAt: Date | null;
}

export interface NewsSource {
  id: string;
  name: string;
  feed_url: string;
  keywords: string | null;
  category_id: string | null;
}

export interface SourceResult {
  name: string;
  imported: number;
  error: string | null;
}

const MAX_FEED_BYTES = 5 * 1024 * 1024;
const MAX_ITEMS_PER_FEED = 100;
// Older items are ignored, so adding a source does not flood the front page
const MAX_ITEM_AGE_DAYS = 14;
const FETCH_TIMEOUT_MS = 20000;
const USER_AGENT = 'GornjiMilanovacPortal/1.0 (+https://gornji-milanovac.com)';
// Arbitrary constant for pg_try_advisory_lock so only one import runs at a time
const IMPORT_LOCK_ID = 726300;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  htmlEntities: true,
  // Keep text like "2026" or "007" as strings
  parseTagValue: false,
});

type XmlNode = string | number | { [key: string]: XmlNode } | XmlNode[] | undefined | null;

function list(node: XmlNode): XmlNode[] {
  if (node === undefined || node === null) return [];
  return Array.isArray(node) ? node : [node];
}

function text(node: XmlNode): string {
  if (node === undefined || node === null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node).trim();
  if (Array.isArray(node)) return text(node[0]);
  return text(node['#text']);
}

function attr(node: XmlNode, name: string): string {
  const first = list(node)[0];
  return first && typeof first === 'object' && !Array.isArray(first) ? text(first[`@_${name}`]) : '';
}

function absoluteUrl(url: string, base: string): string | null {
  if (!url) return null;
  try {
    const resolved = new URL(url, base);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.toString() : null;
  } catch {
    return null;
  }
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function firstImageInHtml(html: string): string {
  return /<img[^>]+src=["']([^"']+)["']/i.exec(html)?.[1] || '';
}

function imageFrom(item: { [key: string]: XmlNode }, html: string): string {
  for (const enclosure of list(item.enclosure)) {
    const type = attr(enclosure, 'type');
    if (!type || type.startsWith('image/')) {
      const url = attr(enclosure, 'url');
      if (url) return url;
    }
  }
  const group = list(item['media:group'])[0];
  const groupContent = group && typeof group === 'object' && !Array.isArray(group) ? group['media:content'] : undefined;
  return (
    attr(item['media:content'], 'url') ||
    attr(item['media:thumbnail'], 'url') ||
    attr(groupContent, 'url') ||
    firstImageInHtml(html)
  );
}

// Accepts RSS 2.0, Atom and RSS 1.0 (RDF)
export function parseFeed(xml: string, feedUrl: string): FeedItem[] {
  const doc = parser.parse(xml) as { [key: string]: any };
  const rssItems = list(doc.rss?.channel?.item ?? doc['rdf:RDF']?.item);
  const atomEntries = list(doc.feed?.entry);
  const items: FeedItem[] = [];

  for (const raw of rssItems) {
    const item = raw as { [key: string]: XmlNode };
    const html = text(item['content:encoded']) || text(item.description);
    const link = absoluteUrl(text(item.link) || text(item.guid), feedUrl);
    items.push({
      title: stripHtml(text(item.title)),
      link: link || '',
      summary: stripHtml(text(item.description) || html),
      image: absoluteUrl(imageFrom(item, html), link || feedUrl),
      publishedAt: parseDate(text(item.pubDate) || text(item['dc:date'])),
    });
  }

  for (const raw of atomEntries) {
    const entry = raw as { [key: string]: XmlNode };
    const links = list(entry.link);
    const alternate = links.find((l) => !attr(l, 'rel') || attr(l, 'rel') === 'alternate') ?? links[0];
    const link = absoluteUrl(attr(alternate, 'href'), feedUrl);
    const html = text(entry.content) || text(entry.summary);
    items.push({
      title: stripHtml(text(entry.title)),
      link: link || '',
      summary: stripHtml(text(entry.summary) || html),
      image: absoluteUrl(imageFrom(entry, html), link || feedUrl),
      publishedAt: parseDate(text(entry.published) || text(entry.updated)),
    });
  }

  return items.filter((item) => item.title && item.link);
}

function charsetOf(contentType: string | null, head: string): string {
  return (
    /charset=["']?([\w-]+)/i.exec(contentType || '')?.[1] ||
    /<\?xml[^>]*encoding=["']([\w-]+)["']/i.exec(head)?.[1] ||
    'utf-8'
  );
}

export async function fetchFeed(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) throw new Error('Adresa mora počinjati sa http:// ili https://');
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.5',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (Number(response.headers.get('content-length') || 0) > MAX_FEED_BYTES) throw new Error('Feed je prevelik');

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_FEED_BYTES) throw new Error('Feed je prevelik');

  const head = new TextDecoder('ascii').decode(bytes.slice(0, 200));
  try {
    return new TextDecoder(charsetOf(response.headers.get('content-type'), head)).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

function linkHash(link: string): string {
  return createHash('sha1').update(link).digest('hex').slice(0, 6);
}

export async function importSource(source: NewsSource, now: Date = new Date()): Promise<number> {
  const items = parseFeed(await fetchFeed(source.feed_url), source.feed_url);
  const matches = keywordMatcher(source.keywords);
  const cutoff = now.getTime() - MAX_ITEM_AGE_DAYS * 86400000;
  let imported = 0;

  for (const item of items.slice(0, MAX_ITEMS_PER_FEED)) {
    if (item.publishedAt && item.publishedAt.getTime() < cutoff) continue;
    if (!matches(`${item.title}\n${item.summary}`)) continue;

    const title = truncate(toLatin(item.title), 480);
    const excerpt = item.summary ? truncate(toLatin(item.summary), 400) : null;
    // Feeds sometimes carry future dates; never publish ahead of now
    const publishedAt = item.publishedAt && item.publishedAt < now ? item.publishedAt : now;

    const result = await db.query(`
      INSERT INTO posts (status, title, slug, excerpt, featured_image, source_name, source_url, category_id, published_at)
      SELECT 'published', $1, $2, $3, $4, $5, $6::varchar, $7::uuid, $8::timestamptz
      WHERE NOT EXISTS (SELECT 1 FROM posts WHERE source_url = $6::varchar)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `, [
      title,
      `${slugify(title) || 'vest'}-${linkHash(item.link)}`,
      excerpt,
      item.image,
      source.name,
      item.link.slice(0, 500),
      source.category_id,
      publishedAt,
    ]);
    imported += result.rowCount || 0;
  }

  return imported;
}

// Imports every enabled source; returns null if another import is running
export async function importAllSources(): Promise<SourceResult[] | null> {
  const client = await db.getClient();
  try {
    const lock = await client.query('SELECT pg_try_advisory_lock($1) AS locked', [IMPORT_LOCK_ID]);
    if (!lock.rows[0].locked) return null;

    try {
      const sources = await client.query<NewsSource>(
        'SELECT id, name, feed_url, keywords, category_id FROM news_sources WHERE enabled = true ORDER BY name'
      );
      const results: SourceResult[] = [];
      for (const source of sources.rows) {
        try {
          const imported = await importSource(source);
          await client.query(
            'UPDATE news_sources SET last_fetched_at = NOW(), last_imported = $1, last_error = NULL WHERE id = $2',
            [imported, source.id]
          );
          results.push({ name: source.name, imported, error: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          await client.query(
            'UPDATE news_sources SET last_fetched_at = NOW(), last_imported = 0, last_error = $1 WHERE id = $2',
            [message.slice(0, 500), source.id]
          );
          results.push({ name: source.name, imported: 0, error: message });
        }
      }
      if (results.some((r) => r.imported > 0)) {
        await invalidateCache('posts:*');
      }
      return results;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [IMPORT_LOCK_ID]);
    }
  } finally {
    client.release();
  }
}
