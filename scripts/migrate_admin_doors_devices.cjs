try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('FATAL: DATABASE_URL environment variable is required.');
}

const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function migrate() {
  console.log('=== RUNNING MIGRATION: Admin Doors & Devices Table ===\n');

  // 1. SQLite Migration
  console.log('--- 1. SQLite ---');
  const sqliteCols = sqlite.prepare("PRAGMA table_info(admins)").all().map(c => c.name);
  if (!sqliteCols.includes('last_totp_step')) {
    sqlite.exec("ALTER TABLE admins ADD COLUMN last_totp_step INTEGER DEFAULT 0;");
    console.log('[SQLite] Added last_totp_step column to admins table.');
  } else {
    console.log('[SQLite] Column last_totp_step already exists in admins table.');
  }

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admin_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      device_hash TEXT UNIQUE NOT NULL,
      user_agent TEXT,
      ip_first TEXT,
      ip_last TEXT,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      last_login_method TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_admin_devices_hash ON admin_devices(device_hash);
  `);
  console.log('[SQLite] Created admin_devices table & index if not exists.');

  // 2. Neon PostgreSQL Migration
  console.log('\n--- 2. Neon PostgreSQL ---');
  const pgCols = await pg.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admins'");
  const pgColNames = pgCols.map(c => c.column_name);

  if (!pgColNames.includes('last_totp_step')) {
    await pg.query("ALTER TABLE admins ADD COLUMN last_totp_step INTEGER DEFAULT 0;");
    console.log('[PG] Added last_totp_step column to admins table.');
  } else {
    console.log('[PG] Column last_totp_step already exists in admins table.');
  }

  await pg.query(`
    CREATE TABLE IF NOT EXISTS admin_devices (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER NOT NULL,
      device_hash VARCHAR(64) UNIQUE NOT NULL,
      user_agent TEXT,
      ip_first VARCHAR(64),
      ip_last VARCHAR(64),
      first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      last_login_method VARCHAR(32)
    )
  `);
  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_devices_hash ON admin_devices(device_hash)
  `);
  console.log('[PG] Created admin_devices table & index if not exists.');

  console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
