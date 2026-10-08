const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function verifyAll() {
  console.log("=================================================");
  console.log("       COMPREHENSIVE DATABASE AUDIT CHECK        ");
  console.log("=================================================\n");

  // 1. SQLite Tables
  console.log("--- [1] SQLite (portfolio.db) Tables ---");
  const sqliteTables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  for (const t of sqliteTables) {
    try {
      const count = sqlite.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get();
      console.log(`  ✓ Table: ${t.name.padEnd(25)} -> ${count.c} rows`);
    } catch (e) {
      console.log(`  ! Table: ${t.name.padEnd(25)} -> Error: ${e.message}`);
    }
  }

  // 2. Neon Tables
  console.log("\n--- [2] Neon PostgreSQL Cloud Tables ---");
  const pgTables = await pg`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  for (const t of pgTables) {
    try {
      const res = await pg.query(`SELECT COUNT(*) as c FROM "${t.table_name}"`);
      console.log(`  ✓ Table: ${t.table_name.padEnd(25)} -> ${res[0].c} rows`);
    } catch (e) {
      console.log(`  ! Table: ${t.table_name.padEnd(25)} -> Error: ${e.message}`);
    }
  }

  // 3. Check Hero Profile Image
  console.log("\n--- [3] Hero Data Check ---");
  const sqliteHero = sqlite.prepare("SELECT name, title, profile_image FROM hero LIMIT 1").get();
  console.log("  SQLite Hero:", sqliteHero);
  const pgHero = await pg`SELECT name, title, profile_image FROM hero LIMIT 1`;
  console.log("  Neon Hero:  ", pgHero[0]);

  // 4. Check About Profile Image
  console.log("\n--- [4] About Data Check ---");
  const sqliteAbout = sqlite.prepare("SELECT subtitle, profile_image FROM about LIMIT 1").get();
  console.log("  SQLite About:", sqliteAbout);
  const pgAbout = await pg`SELECT subtitle, profile_image FROM about LIMIT 1`;
  console.log("  Neon About:  ", pgAbout[0]);

  // 5. Check Contact Channels
  console.log("\n--- [5] Contact Channels (Separate Table) Check ---");
  const sqliteChannels = sqlite.prepare("SELECT channel_key, label, value, url, is_active FROM contact_channels ORDER BY sort_order").all();
  console.log("  SQLite Contact Channels:", sqliteChannels);
  const pgChannels = await pg`SELECT channel_key, label, value, url, is_active FROM contact_channels ORDER BY sort_order`;
  console.log("  Neon Contact Channels:  ", pgChannels);

  console.log("\n=================================================");
  console.log("              AUDIT CHECK COMPLETED              ");
  console.log("=================================================");
}

verifyAll().catch(console.error);
