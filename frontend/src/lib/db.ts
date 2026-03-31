import { Pool } from 'pg';
import { createClient, RedisClientType } from 'redis';

// PostgreSQL pool - lazy connection, short timeout
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 3000, // fail fast during build
});

pool.on('error', () => {}); // suppress errors during build

export const db = {
  query: <T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> =>
    pool.query(text, params),
  getClient: () => pool.connect(),
};

// Redis client singleton
let redisClient: RedisClientType | null = null;
let redisConnecting = false;

export async function getRedis(): Promise<RedisClientType | null> {
  // Skip Redis during build time
  if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  if (redisClient) return redisClient;
  if (redisConnecting) return null;
  
  try {
    redisConnecting = true;
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: { connectTimeout: 2000 }
    });
    redisClient.on('error', () => { redisClient = null; redisConnecting = false; });
    await redisClient.connect();
    redisConnecting = false;
    return redisClient;
  } catch {
    redisConnecting = false;
    return null;
  }
}

// Cache helper - gracefully skips Redis if unavailable
export async function withCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  try {
    const redis = await getRedis();
    if (redis) {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    }
    const result = await fn();
    if (redis) {
      await redis.setEx(key, ttl, JSON.stringify(result));
    }
    return result;
  } catch {
    return fn();
  }
}
