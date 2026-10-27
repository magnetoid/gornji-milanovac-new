// Scheduled background jobs (the site's cron): a one-minute tick runs every job
// that is due. Job state lives in the jobs table, so restarts and several app
// instances agree on what already ran. /admin/zadaci shows it and can run a job now.

import { db, invalidateCache } from './db';
import { importAllSources } from './rss';
import { backupDatabase } from './backup';

export type Schedule = { everyMinutes: number } | { dailyAt: number };

export interface Job {
  name: string;
  label: string;
  schedule: Schedule;
  // Returns a one-line summary shown in /admin/zadaci
  run: () => Promise<string>;
  // Routine runs are not logged (jobs that run every minute)
  quiet?: boolean;
}

export interface JobState {
  name: string;
  last_started_at: Date | null;
  last_finished_at: Date | null;
  last_status: 'running' | 'ok' | 'error' | null;
  last_message: string | null;
  last_duration_ms: number | null;
}

export interface JobResult {
  status: 'ok' | 'error';
  message: string;
}

// Daily jobs run at local time in Serbia
const TIME_ZONE = 'Europe/Belgrade';
const TICK_MS = 60_000;
// A job still "running" after this long is assumed to have died with its process
const STALE_RUN_SECONDS = 3600;

async function publishScheduledPosts(): Promise<string> {
  const result = await db.query<{ slug: string }>(`
    UPDATE posts SET status = 'published', updated_at = NOW()
    WHERE status = 'scheduled' AND published_at <= NOW()
    RETURNING slug
  `);
  if (result.rows.length) {
    await invalidateCache('posts:*');
    for (const row of result.rows) await invalidateCache(`post:${row.slug}`);
  }
  return `Objavljeno zakazanih vesti: ${result.rows.length}`;
}

async function importNews(): Promise<string> {
  const results = await importAllSources();
  if (results === null) return 'Uvoz je već bio u toku';
  const imported = results.reduce((sum, r) => sum + r.imported, 0);
  const failed = results.filter((r) => r.error).map((r) => `${r.name}: ${r.error}`);
  return `Novih vesti: ${imported} iz ${results.length} izvora${failed.length ? `; greške: ${failed.join('; ')}` : ''}`;
}

async function expireListings(): Promise<string> {
  const result = await db.query(`
    UPDATE listings SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND expires_at < NOW()
  `);
  if (result.rowCount) await invalidateCache('listings:*');
  return `Isteklo oglasa: ${result.rowCount || 0}`;
}

function buildJobs(): Job[] {
  const rssMinutes = Number(process.env.RSS_IMPORT_INTERVAL_MINUTES ?? 30);
  const jobs: Job[] = [
    { name: 'publish-scheduled', label: 'Objava zakazanih vesti', schedule: { everyMinutes: 1 }, run: publishScheduledPosts, quiet: true },
  ];
  // RSS_IMPORT_INTERVAL_MINUTES=0 turns the automatic import off
  if (rssMinutes > 0) {
    jobs.push({ name: 'rss-import', label: 'Uvoz vesti iz RSS izvora', schedule: { everyMinutes: rssMinutes }, run: importNews });
  }
  jobs.push(
    { name: 'db-backup', label: 'Rezervna kopija baze', schedule: { dailyAt: 3 }, run: backupDatabase },
    { name: 'expire-listings', label: 'Isticanje starih oglasa', schedule: { dailyAt: 4 }, run: expireListings },
  );
  return jobs;
}

export const JOBS: Job[] = buildJobs();

export function describeSchedule(schedule: Schedule): string {
  if ('dailyAt' in schedule) return `svaki dan u ${String(schedule.dailyAt).padStart(2, '0')}:00`;
  return schedule.everyMinutes === 1 ? 'svakog minuta' : `na svakih ${schedule.everyMinutes} min`;
}

function localParts(date: Date): { day: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

// The day whose daily run a moment belongs to: from dailyAt on it is that day's,
// before it the previous day's
function dailySlot(date: Date, hour: number): string {
  const local = localParts(date);
  return local.hour >= hour ? local.day : localParts(new Date(date.getTime() - 86_400_000)).day;
}

export function isDue(job: Job, state: JobState | undefined, now: Date = new Date()): boolean {
  const last = state?.last_started_at;
  if (!last) return true;
  if (state.last_status === 'running' && now.getTime() - last.getTime() < STALE_RUN_SECONDS * 1000) return false;
  if ('dailyAt' in job.schedule) {
    return dailySlot(now, job.schedule.dailyAt) !== dailySlot(last, job.schedule.dailyAt);
  }
  // A few seconds of slack so tick jitter does not skip a whole interval
  return now.getTime() - last.getTime() >= job.schedule.everyMinutes * 60_000 - 5_000;
}

export async function getJobStates(): Promise<Map<string, JobState>> {
  const result = await db.query<JobState>('SELECT * FROM jobs');
  return new Map(result.rows.map((row) => [row.name, row]));
}

// Marks the job running unless another process started it first. Scheduled runs
// only claim it if last_started_at is still what this process saw.
async function claim(name: string, seenStartedAt: Date | null, force: boolean): Promise<boolean> {
  await db.query('INSERT INTO jobs (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
  const result = await db.query(`
    UPDATE jobs SET last_started_at = date_trunc('milliseconds', clock_timestamp()), last_status = 'running'
    WHERE name = $1
      AND (last_status IS DISTINCT FROM 'running' OR last_started_at < NOW() - make_interval(secs => $2))
      AND ($3 OR last_started_at IS NOT DISTINCT FROM $4::timestamptz)
    RETURNING name
  `, [name, STALE_RUN_SECONDS, force, seenStartedAt]);
  return result.rowCount === 1;
}

async function execute(job: Job, seenStartedAt: Date | null, force: boolean): Promise<JobResult | null> {
  if (!(await claim(job.name, seenStartedAt, force))) return null;

  const started = Date.now();
  let result: JobResult;
  try {
    result = { status: 'ok', message: await job.run() };
  } catch (error) {
    result = { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
  await db.query(`
    UPDATE jobs SET last_finished_at = NOW(), last_status = $2, last_message = $3, last_duration_ms = $4
    WHERE name = $1
  `, [job.name, result.status, result.message.slice(0, 1000), Date.now() - started]);

  if (result.status === 'error') console.error(`Job ${job.name} failed: ${result.message}`);
  else if (!job.quiet) console.log(`Job ${job.name}: ${result.message}`);
  return result;
}

// "Pokreni sada" in /admin/zadaci; null if the job is already running
export async function runJobNow(name: string): Promise<JobResult | null> {
  const job = JOBS.find((j) => j.name === name);
  if (!job) throw new Error(`Unknown job ${name}`);
  return execute(job, null, true);
}

export async function runDueJobs(now: Date = new Date()): Promise<void> {
  const states = await getJobStates();
  for (const job of JOBS) {
    const state = states.get(job.name);
    if (isDue(job, state, now)) await execute(job, state?.last_started_at ?? null, false);
  }
}

export function startJobScheduler() {
  if (!process.env.DATABASE_URL) return;

  let busy = false;
  const tick = async () => {
    // A long job (backup) can outlast a tick; the next tick picks up what is still due
    if (busy) return;
    busy = true;
    try {
      await runDueJobs();
    } catch (error) {
      console.error('Scheduled jobs failed:', error);
    } finally {
      busy = false;
    }
  };

  // First run shortly after start, once the database is reachable
  setTimeout(tick, 30_000).unref();
  setInterval(tick, TICK_MS).unref();
}
