#!/usr/bin/env node
// Create an admin user or reset its password.
//
//   DATABASE_URL=... node scripts/set-admin-password.js <email> [password] [name]
//
// The password can also come from ADMIN_PASSWORD so it stays out of shell history.
// In the Docker deployment:
//   docker compose exec -e ADMIN_PASSWORD='...' nextjs node scripts/set-admin-password.js admin@gornji-milanovac.com

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function main() {
  const [email, passwordArg, name = 'Admin'] = process.argv.slice(2);
  const password = passwordArg || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Usage: node scripts/set-admin-password.js <email> [password] [name]');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, role = 'admin', active = true, updated_at = NOW()
       RETURNING (xmax = 0) AS created`,
      [email.trim().toLowerCase(), hash, name]
    );
    console.log(result.rows[0].created ? `Created admin ${email}` : `Password reset for ${email}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
