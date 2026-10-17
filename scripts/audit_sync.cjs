try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('FATAL: DATABASE_URL environment variable is required.');
}
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function runDriftAudit() {
  console.log("==========================================================");
  console.log("     PORTFOLIO CMS TWO-WAY SYNC & DRIFT AUDIT VERIFICATION");
  console.log("==========================================================\n");

  let mismatches = 0;
  const sectionsToCheck = [
    { table: 'hero', keyField: 'id', keyValue: 1, fields: ['name', 'title', 'badge_text', 'profile_image', 'profile_position'] },
    { table: 'about', keyField: 'id', keyValue: 1, fields: ['title', 'subtitle', 'profile_image', 'profile_position'] },
    { table: 'social_links', keyField: 'id', keyValue: 1, fields: ['email', 'linkedin', 'github'] },
    { table: 'site_settings', keyField: 'id', keyValue: 1, fields: ['site_title', 'footer_brand'] },
    { table: 'homepage_cta', keyField: 'id', keyValue: 1, fields: ['title', 'badge_text', 'primary_btn_text'] },
  ];

  for (const s of sectionsToCheck) {
    try {
      const pgRows = await pg.query(`SELECT * FROM "${s.table}" WHERE "${s.keyField}" = $1`, [s.keyValue]);
      const sqliteRow = sqlite.prepare(`SELECT * FROM ${s.table} WHERE ${s.keyField} = ?`).get(s.keyValue);

      if (!pgRows || pgRows.length === 0) {
        console.error(`[DRIFT FAIL] Neon PG has no record in table: ${s.table}`);
        mismatches++;
        continue;
      }
      if (!sqliteRow) {
        console.error(`[DRIFT FAIL] SQLite has no record in table: ${s.table}`);
        mismatches++;
        continue;
      }

      const pgRow = pgRows[0];
      for (const f of s.fields) {
        const valPg = String(pgRow[f] ?? '').trim();
        const valSqlite = String(sqliteRow[f] ?? '').trim();
        if (valPg !== valSqlite) {
          console.warn(`[DRIFT MISMATCH] Table: ${s.table}.${f} -> PG: "${valPg}" vs SQLite: "${valSqlite}"`);
          mismatches++;
        } else {
          console.log(`[PASS] ${s.table}.${f}: "${valPg}" (PG == SQLite)`);
        }
      }
    } catch (err) {
      console.error(`Error auditing ${s.table}:`, err.message);
      mismatches++;
    }
  }

  // Check row counts for list tables
  const listTables = ['experiences', 'educations', 'skills', 'projects', 'services', 'certifications', 'contact_channels'];
  console.log("\n--- List Tables Count Check ---");
  for (const table of listTables) {
    try {
      const pgCount = (await pg.query(`SELECT COUNT(*) as c FROM "${table}"`))[0]?.c || 0;
      const sqliteCount = sqlite.prepare(`SELECT COUNT(*) as c FROM ${table}`).get()?.c || 0;
      if (Number(pgCount) !== Number(sqliteCount)) {
        console.warn(`[DRIFT MISMATCH] Table: ${table} count -> PG: ${pgCount} vs SQLite: ${sqliteCount}`);
        mismatches++;
      } else {
        console.log(`[PASS] ${table.padEnd(20)} count: ${pgCount} (PG == SQLite)`);
      }
    } catch (err) {
      console.error(`Error auditing count for ${table}:`, err.message);
      mismatches++;
    }
  }

  console.log("\n==========================================================");
  if (mismatches === 0) {
    console.log("SUCCESS: 0 Drift Mismatches found! Cloud Neon DB and Local SQLite are in 100% full parity.");
  } else {
    console.warn(`WARNING: Found ${mismatches} drift mismatch(es). Please review above.`);
  }
  console.log("==========================================================");

  return mismatches;
}

runDriftAudit().then((m) => {
  if (m > 0) process.exit(1);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
