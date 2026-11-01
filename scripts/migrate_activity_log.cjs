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
  console.log('=== RUNNING MIGRATION: Activity Log Table ===\n');

  // 1. SQLite Migration
  console.log('--- 1. SQLite ---');
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      event TEXT NOT NULL,
      detail TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
  `);
  console.log('[SQLite] Created activity_log table & index if not exists.');

  // 2. Neon PostgreSQL Migration
  console.log('\n--- 2. Neon PostgreSQL ---');
  await pg.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER,
      event VARCHAR(64) NOT NULL,
      detail TEXT,
      ip VARCHAR(64),
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC)
  `);
  console.log('[PG] Created activity_log table & index if not exists.');

  console.log('\n=== MIGRATION COMPLETE ===');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
