import { importAllSources } from './rss';

// Pull RSS sources every RSS_IMPORT_INTERVAL_MINUTES (default 30; 0 turns it off)
export function startRssSchedule() {
  const minutes = Number(process.env.RSS_IMPORT_INTERVAL_MINUTES ?? 30);
  if (!process.env.DATABASE_URL || !(minutes > 0)) return;

  const run = async () => {
    try {
      const results = await importAllSources();
      if (results === null) return;
      const imported = results.reduce((sum, r) => sum + r.imported, 0);
      const failed = results.filter((r) => r.error).map((r) => `${r.name}: ${r.error}`);
      console.log(`RSS import: ${imported} new posts from ${results.length} sources${failed.length ? `; errors: ${failed.join('; ')}` : ''}`);
    } catch (error) {
      console.error('RSS import failed:', error);
    }
  };

  // First run shortly after start, once the database is reachable
  setTimeout(run, 60_000).unref();
  setInterval(run, minutes * 60_000).unref();
}
