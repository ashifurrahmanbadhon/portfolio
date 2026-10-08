const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function updateGithub() {
  const githubUrl = 'https://github.com/ashifurrahmanbadhon';
  console.log("Setting GitHub URL to:", githubUrl);

  // 1. Neon PG
  try {
    const res = await pg.query(`UPDATE social_links SET github = $1 WHERE id = 1`, [githubUrl]);
    console.log("[PG] Updated social_links github.");
    const row = await pg.query(`SELECT * FROM social_links WHERE id = 1`);
    console.log("[PG] Current social_links row:", row[0]);
  } catch (err) {
    console.error("[PG] Error:", err.message);
  }

  // 2. SQLite
  try {
    sqlite.prepare(`UPDATE social_links SET github = ? WHERE id = 1`).run(githubUrl);
    console.log("[SQLite] Updated social_links github.");
    const row = sqlite.prepare(`SELECT * FROM social_links WHERE id = 1`).get();
    console.log("[SQLite] Current social_links row:", row);
  } catch (err) {
    console.error("[SQLite] Error:", err.message);
  }
}

updateGithub();
