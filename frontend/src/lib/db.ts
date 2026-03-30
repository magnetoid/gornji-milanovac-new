import { Pool } from 'pg';
import { createClient, RedisClientType } from 'redis';

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const db = {
  query: <T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> =>
    pool.query(text, params),
  getClient: () => pool.connect(),
};

// Redis client singleton
let redisClient: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
  }
  return redisClient;
}

// Cache helper with TTL
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  try {
    const redis = await getRedis();
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    const result = await fn();
    await redis.setEx(key, ttlSeconds, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Cache error, falling back to direct query:', error);
    return fn(); // fallback if Redis fails
  }
}

// Invalidate cache by key or pattern
export async function invalidateCache(keyOrPattern: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (keyOrPattern.includes('*')) {
      // Pattern-based invalidation
      const keys = await redis.keys(keyOrPattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      await redis.del(keyOrPattern);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Type definitions for database records
export interface DbUser {
  id: string;
  created_at: Date;
  updated_at: Date;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'editor' | 'author';
  avatar: string | null;
  active: boolean;
}

export interface DbCategory {
  id: string;
  created_at: Date;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  post_count: number;
}

export interface DbPost {
  id: string;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  tags: string[] | null;
  view_count: number;
  featured: boolean;
  source_name: string | null;
  source_url: string | null;
  locale: string;
}

export interface DbPage {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: 'draft' | 'published';
  title: string;
  slug: string;
  content: string | null;
  template: string;
  sort_order: number;
  parent_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface DbMedia {
  id: string;
  created_at: Date;
  filename: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  url: string;
  uploaded_by: string | null;
}

export interface DbListingCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface DbListing {
  id: string;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;
  status: 'active' | 'expired' | 'pending' | 'deleted';
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  price_type: 'fixed' | 'negotiable' | 'free';
  images: string[] | null;
  category_id: string | null;
  location: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  views: number;
  featured: boolean;
}

export interface DbVendor {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: 'pending' | 'active' | 'suspended';
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  category: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  working_hours: string | null;
  featured: boolean;
  rating: number;
  review_count: number;
}

export interface DbProduct {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: string;
  vendor_id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  price_unit: string | null;
  price_negotiable: boolean;
  images: string[] | null;
  category: string | null;
  available: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  featured: boolean;
  view_count: number;
}

export interface DbService {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: string;
  vendor_id: string;
  title: string;
  slug: string;
  description: string | null;
  price_from: number | null;
  price_label: string | null;
  images: string[] | null;
  category: string | null;
  duration_minutes: number | null;
  booking_enabled: boolean;
  available_days: string[] | null;
  available_hours_start: string;
  available_hours_end: string;
  contact_phone: string | null;
  contact_email: string | null;
}

export interface DbBooking {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  service_id: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  requested_date: Date;
  requested_time: string;
  message: string | null;
  vendor_notes: string | null;
}

export interface DbSetting {
  key: string;
  value: string | null;
  type: 'string' | 'json' | 'boolean' | 'number';
  label: string | null;
  group_name: string;
}
