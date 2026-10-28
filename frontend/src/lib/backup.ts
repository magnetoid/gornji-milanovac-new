// Daily database backup: pg_dump in its compressed custom format into BACKUP_DIR,
// keeping the newest BACKUP_KEEP files. Restore with pg_restore (see README).

import { spawn } from 'child_process';
import { mkdir, readdir, rename, stat, unlink } from 'fs/promises';
import { join } from 'path';

const BACKUP_PATTERN = /^gm-[\d-]+\.dump$/;

function pgDump(file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('pg_dump', ['--format=custom', '--no-owner', '--file', file, process.env.DATABASE_URL || ''], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error: NodeJS.ErrnoException) =>
      reject(error.code === 'ENOENT' ? new Error('pg_dump nije instaliran') : error)
    );
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(stderr.trim().slice(0, 500) || `pg_dump exit ${code}`))
    );
  });
}

export async function backupDatabase(): Promise<string> {
  const dir = process.env.BACKUP_DIR || './backups';
  const keep = Math.max(1, Number(process.env.BACKUP_KEEP || 14));
  await mkdir(dir, { recursive: true });

  // gm-2026-10-28-02-00.dump (UTC)
  const name = `gm-${new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-')}.dump`;
  const file = join(dir, name);
  // Dump to a temp name so a failed run never looks like a good backup
  await pgDump(`${file}.tmp`);
  await rename(`${file}.tmp`, file);
  const { size } = await stat(file);

  const backups = (await readdir(dir)).filter((f) => BACKUP_PATTERN.test(f)).sort().reverse();
  for (const old of backups.slice(keep)) {
    await unlink(join(dir, old));
  }

  const shown = size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${name} (${shown}), čuva se ${Math.min(backups.length, keep)} kopija`;
}
