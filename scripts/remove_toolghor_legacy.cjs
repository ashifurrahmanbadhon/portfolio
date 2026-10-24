/**
 * scripts/remove_toolghor_legacy.cjs
 * Backs up toolghor_tools, toolghor_categories, toolghor_settings to a JSON file
 * in the workspace root (ignored by git), then drops the 3 tables from Neon PostgreSQL and SQLite.
 */
try { process.loadEnvFile('.env.local'); } catch (_) {}
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

async function run() {
  console.log('=== Starting ToolGhor Legacy Database Removal ===');

  const databaseUrl = process.env.DATABASE_URL;
  const pg = databaseUrl ? neon(databaseUrl) : null;
  const sqlite = new DatabaseSync('portfolio.db');

  const backupData = {
    exportedAt: new Date().toISOString(),
    toolghor_categories: [],
    toolghor_tools: [],
    toolghor_settings: [],
  };

  // 1. Export rows (prefer PG if available, fallback SQLite)
  const tables = ['toolghor_categories', 'toolghor_tools', 'toolghor_settings'];

  for (const t of tables) {
    let rows = [];
    if (pg) {
      try {
        rows = await pg.query(`SELECT * FROM ${t} ORDER BY id ASC`);
      } catch (e) {
        console.warn(`PG select from ${t} error (might not exist):`, e.message);
      }
    }
    if ((!rows || rows.length === 0) && sqlite) {
      try {
        rows = sqlite.prepare(`SELECT * FROM ${t} ORDER BY id ASC`).all();
      } catch (e) {
        console.warn(`SQLite select from ${t} error (might not exist):`, e.message);
      }
    }
    backupData[t] = rows || [];
    console.log(`Exported ${backupData[t].length} row(s) from table "${t}"`);
  }

  // 2. Save backup file to workspace root
  const backupPath = path.join(process.cwd(), 'toolghor_legacy_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`Backup successfully written to: ${backupPath}`);
  console.log('Backup summary:', {
    categories: backupData.toolghor_categories.length,
    tools: backupData.toolghor_tools.length,
    settings: backupData.toolghor_settings.length,
  });

  // 3. Drop tables in Neon PostgreSQL
  if (pg) {
    for (const t of ['toolghor_tools', 'toolghor_categories', 'toolghor_settings']) {
      try {
        await pg.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
        console.log(`[PG] Dropped table IF EXISTS: ${t}`);
      } catch (err) {
        console.warn(`[PG] Error dropping ${t}:`, err.message);
      }
    }
  }

  // 4. Drop tables in SQLite
  for (const t of ['toolghor_tools', 'toolghor_categories', 'toolghor_settings']) {
    try {
      sqlite.prepare(`DROP TABLE IF EXISTS ${t}`).run();
      console.log(`[SQLite] Dropped table IF EXISTS: ${t}`);
    } catch (err) {
      console.warn(`[SQLite] Error dropping ${t}:`, err.message);
    }
  }

  console.log('=== Finished ToolGhor Legacy Database Removal ===');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Removal failed:', err);
    process.exit(1);
  });
