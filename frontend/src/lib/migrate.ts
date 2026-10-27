// At server start: loads db/init.sql into an empty database, then applies
// frontend/migrations/*.sql in name order, once each. Migration files must be
// idempotent (IF NOT EXISTS / ON CONFLICT), since init.sql already contains
// every table on a fresh install and the files then run as no-ops.

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { db } from './db';

// Arbitrary constant for pg_advisory_lock so concurrent instances wait their turn
const MIGRATION_LOCK_ID = 726301;

export async function runMigrations(
  dir: string = join(process.cwd(), 'migrations'),
  schemaFile: string = join(process.cwd(), 'db', 'init.sql')
): Promise<string[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const client = await db.getClient();
  const applied: string[] = [];
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    try {
      // No users table means the base schema was never loaded
      const { rows } = await client.query<{ missing: boolean }>(
        "SELECT to_regclass('public.users') IS NULL AS missing"
      );
      if (rows[0].missing) {
        const sql = await readFile(schemaFile, 'utf8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw new Error(`Schema init.sql failed: ${error instanceof Error ? error.message : error}`);
        }
        applied.push('init.sql');
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          name VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      const done = new Set(
        (await client.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name)
      );
      for (const file of files) {
        if (done.has(file)) continue;
        const sql = await readFile(join(dir, file), 'utf8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw new Error(`Migration ${file} failed: ${error instanceof Error ? error.message : error}`);
        }
        applied.push(file);
      }
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
    }
  } finally {
    client.release();
  }
  return applied;
}
