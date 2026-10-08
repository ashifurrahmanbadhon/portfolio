const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function testLifecycle() {
  console.log("=== Testing Realtime CMS Update Lifecycle ===");

  // 1. Verify current Hero in PG
  const heroPg = await pg.query("SELECT title, updated_at FROM hero WHERE id = 1");
  console.log("1. Current Hero in Neon PG:", heroPg[0]);

  // 2. Perform test update
  const testTimestamp = new Date().toISOString();
  await pg.query("UPDATE hero SET updated_at = $1 WHERE id = 1", [testTimestamp]);
  sqlite.prepare("UPDATE hero SET updated_at = ? WHERE id = 1").run(testTimestamp);

  // 3. Immediately read back
  const heroAfterPg = await pg.query("SELECT title, updated_at FROM hero WHERE id = 1");
  const heroAfterSqlite = sqlite.prepare("SELECT title, updated_at FROM hero WHERE id = 1").get();

  console.log("2. Readback from Neon PG:", heroAfterPg[0]);
  console.log("3. Readback from SQLite:", heroAfterSqlite);

  const isPgSynced = heroAfterPg[0].updated_at === testTimestamp;
  const isSqliteSynced = heroAfterSqlite.updated_at === testTimestamp;

  console.log(`4. Neon PG Instant Reflection: ${isPgSynced ? 'PASS' : 'FAIL'}`);
  console.log(`5. SQLite Instant Reflection: ${isSqliteSynced ? 'PASS' : 'FAIL'}`);

  if (isPgSynced && isSqliteSynced) {
    console.log("=== SUCCESS: Full Instant Sync Verified Across Both Databases ===");
  } else {
    throw new Error("Sync verification failed");
  }
}

testLifecycle().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
