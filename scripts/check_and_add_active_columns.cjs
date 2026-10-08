const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function ensureActiveColumns() {
  console.log("=== Checking and Adding is_active Columns ===");

  const tables = [
    'experiences',
    'educations',
    'projects',
    'skills',
    'certifications',
    'highlights',
    'experience_metrics',
    'software_tools',
    'skill_badges',
    'coursework_pillars',
    'project_methodologies'
  ];

  for (const table of tables) {
    // 1. PostgreSQL
    try {
      await pg.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1`);
      // Ensure all existing rows have is_active = 1 if null
      await pg.query(`UPDATE ${table} SET is_active = 1 WHERE is_active IS NULL`);
      console.log(`[PG] ${table}: is_active verified.`);
    } catch (err) {
      console.warn(`[PG] Error on ${table}:`, err.message);
    }

    // 2. SQLite
    try {
      const info = sqlite.prepare(`PRAGMA table_info(${table})`).all();
      const hasCol = info.some(c => c.name === 'is_active');
      if (!hasCol) {
        sqlite.prepare(`ALTER TABLE ${table} ADD COLUMN is_active INTEGER DEFAULT 1`).run();
      }
      sqlite.prepare(`UPDATE ${table} SET is_active = 1 WHERE is_active IS NULL`).run();
      console.log(`[SQLite] ${table}: is_active verified.`);
    } catch (err) {
      console.warn(`[SQLite] Error on ${table}:`, err.message);
    }
  }

  console.log("=== All Tables Verified with is_active = 1 ===");
}

ensureActiveColumns().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
