const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function setMasterAdmin() {
  const newPassword = 'Admin@Portfolio2026!';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(newPassword, salt, 100000, 32, 'sha256').toString('hex');
  const now = new Date().toISOString();

  // Reset or create master admin
  const existing = await sql`SELECT id FROM admins WHERE username = 'admin' OR id = 1`;
  if (existing && existing.length > 0) {
    await sql`
      UPDATE admins SET
        username = 'admin',
        email = 'ashifur.badhon@gmail.com',
        password_hash = ${hash},
        salt = ${salt},
        is_active = 1,
        role = 'super_admin',
        failed_login_attempts = 0,
        locked_until = NULL,
        two_factor_enabled = 0,
        updated_at = ${now}
      WHERE id = ${existing[0].id}
    `;
    console.log('Master admin updated successfully (ID:', existing[0].id, ')');
  } else {
    await sql`
      INSERT INTO admins (
        username, email, password_hash, salt, is_active, role,
        failed_login_attempts, two_factor_enabled, created_at, updated_at
      ) VALUES (
        'admin', 'ashifur.badhon@gmail.com', ${hash}, ${salt}, 1, 'super_admin',
        0, 0, ${now}, ${now}
      )
    `;
    console.log('Master admin created successfully');
  }

  // Also clean up any other test admins if present
  await sql`DELETE FROM admins WHERE username != 'admin' AND id != 1`;
  console.log('Cleaned up other admin accounts.');
}

setMasterAdmin().catch(console.error);
