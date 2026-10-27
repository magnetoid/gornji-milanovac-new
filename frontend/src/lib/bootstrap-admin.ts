import bcrypt from 'bcryptjs';
import { db } from './db';

// ADMIN_PASSWORD (with optional ADMIN_EMAIL) in the environment creates the admin
// account, or resets its password when the stored one no longer matches.
export async function ensureAdminFromEnv(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  if (password.length < 12) {
    console.error('ADMIN_PASSWORD is shorter than 12 characters; admin account left unchanged.');
    return null;
  }
  const email = (process.env.ADMIN_EMAIL || 'admin@gornji-milanovac.com').trim().toLowerCase();

  const existing = await db.query<{ password_hash: string; role: string; active: boolean }>(
    'SELECT password_hash, role, active FROM users WHERE email = $1',
    [email]
  );
  const user = existing.rows[0];
  if (user && user.role === 'admin' && user.active && (await bcrypt.compare(password, user.password_hash))) {
    return null;
  }

  const hash = await bcrypt.hash(password, 12);
  await db.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, 'Admin', 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = 'admin', active = true, updated_at = NOW()`,
    [email, hash]
  );
  return email;
}
