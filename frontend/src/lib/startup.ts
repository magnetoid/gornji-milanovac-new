import { runMigrations } from './migrate';
import { ensureAdminFromEnv } from './bootstrap-admin';
import { startRssSchedule } from './rss-schedule';

// Runs once per server start, before requests are served
export async function onServerStart() {
  if (!process.env.DATABASE_URL) return;

  try {
    const applied = await runMigrations();
    if (applied.length) console.log(`Applied migrations: ${applied.join(', ')}`);
  } catch (error) {
    console.error('Database migrations failed:', error);
  }

  try {
    const email = await ensureAdminFromEnv();
    if (email) console.log(`Admin account ${email} set from ADMIN_PASSWORD`);
  } catch (error) {
    console.error('Admin account setup failed:', error);
  }

  startRssSchedule();
}
