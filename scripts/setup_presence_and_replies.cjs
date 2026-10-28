try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('FATAL: DATABASE_URL environment variable is required.');
}
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function setup() {
  console.log("Setting up admin_presence and contact_replies tables...");

  // 1. Neon PG
  console.log("1. Configuring Neon PostgreSQL...");
  await pg.query(`
    CREATE TABLE IF NOT EXISTS admin_presence (
      id INTEGER PRIMARY KEY,
      last_seen TIMESTAMPTZ
    );
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS contact_replies (
      id SERIAL PRIMARY KEY,
      message_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Ensure default row id=1 exists in admin_presence
  await pg.query(`
    INSERT INTO admin_presence (id, last_seen)
    VALUES (1, NULL)
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log("✓ Neon PostgreSQL tables created & verified.");

  // 2. SQLite
  console.log("2. Configuring SQLite (portfolio.db)...");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admin_presence (
      id INTEGER PRIMARY KEY,
      last_seen TEXT
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS contact_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const existingPresence = sqlite.prepare("SELECT id FROM admin_presence WHERE id = 1").get();
  if (!existingPresence) {
    sqlite.prepare("INSERT INTO admin_presence (id, last_seen) VALUES (1, NULL)").run();
  }
  console.log("✓ SQLite tables created & verified.");

  console.log("Setup completed successfully!");
}

setup().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
