// @ts-nocheck
import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent: number | null;
  wp_id: number | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  wp_id: number | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  featured_image: string | null;
  author: string | null;
  published_at: string | null;
  category: number | Category | null;
  tags: Array<{ tags_id: Tag }>;
  source_url: string | null;
  source_name: string | null;
  wp_id: number | null;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  status: 'published' | 'draft';
}

export interface ListingCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Listing {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  price: number | null;
  category: number | ListingCategory | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'sold';
  images: Array<{ directus_files_id: string }>;
  expires_at: string | null;
}

interface Schema {
  categories: Category[];
  tags: Tag[];
  posts: Post[];
  pages: Page[];
  listings_categories: ListingCategory[];
  listings: Listing[];
}

const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN;

export const directus = createDirectus<Schema>(directusUrl).with(rest());

export async function getPosts(options?: {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
}) {
  const { limit = 12, page = 1, category, status = 'published' } = options || {};

  const filter: Record<string, unknown> = { status: { _eq: status } };

  if (category) {
    filter.category = { slug: { _eq: category } };
  }

  const posts = await directus.request(
    readItems('posts', {
      fields: ['*', { category: ['id', 'name', 'slug'] }] as any,
      filter,
      sort: ['-published_at'],
      limit,
      page,
    })
  );

  return posts;
}

export async function getPost(slug: string) {
  const posts = await directus.request(
    readItems('posts', {
      fields: ['*', { category: ['id', 'name', 'slug'] }] as any,
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );

  return posts[0] || null;
}

export async function getCategories() {
  const categories = await directus.request(
    readItems('categories', {
      fields: ['*'],
      sort: ['name'],
    })
  );

  return categories;
}

export async function getListings(options?: {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
}) {
  const { limit = 12, page = 1, category, status = 'active' } = options || {};

  const filter: Record<string, unknown> = { status: { _eq: status } };

  if (category) {
    filter.category = { slug: { _eq: category } };
  }

  const listings = await directus.request(
    readItems('listings', {
      fields: [
        '*',
        { category: ['id', 'name', 'slug'] },
        { images: ['directus_files_id'] },
      ],
      filter,
      sort: ['-id'],
      limit,
      page,
    })
  );

  return listings;
}

export async function getListing(slug: string) {
  const listings = await directus.request(
    readItems('listings', {
      fields: [
        '*',
        { category: ['id', 'name', 'slug'] },
        { images: ['directus_files_id'] },
      ],
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );

  return listings[0] || null;
}

export async function getListingCategories() {
  const categories = await directus.request(
    readItems('listings_categories', {
      fields: ['*'],
      sort: ['name'],
    })
  );

  return categories;
}

export function getAssetUrl(fileId: string | null, options?: { width?: number; height?: number; quality?: number }) {
  if (!fileId) return null;

  const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  let url = `${publicUrl}/assets/${fileId}`;

  const params = new URLSearchParams();
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.quality) params.set('quality', options.quality.toString());

  const paramString = params.toString();
  if (paramString) url += `?${paramString}`;

  return url;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const months = [
    'januar', 'februar', 'mart', 'april', 'maj', 'jun',
    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}. ${month} ${year}.`;
}
