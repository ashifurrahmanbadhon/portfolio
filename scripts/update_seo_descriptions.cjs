try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('FATAL: DATABASE_URL environment variable is required.');
}
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

const SEO_FIXES = {
  about: {
    seo_description: "Electrical & Electronic Engineer passionate about substation design, spatial utility systems, and the transformative potential of Artificial Intelligence.",
  },
  projects: {
    seo_description: "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV sizing, and motor control schematics.",
  },
  education: {
    seo_description: "EEE degree from IUBAT, on-site utility training at DESCO, plus AutoCAD Electrical and GIS training — the education of Ashifur Rahman.",
  },
  work: {
    badge_text: "SERVICE PACKAGES",
    title: "Work & Service",
    highlight_word: "Packages",
    description: "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start.",
    seo_title: "Work — Service Packages | Ashifur Rahman",
    seo_description: "Digital services by Ashifur Rahman: business & portfolio websites, landing pages, AI chatbots, Meta Pixel tracking, n8n automation, and design services.",
  }
};

async function run() {
  console.log("=== UPDATING SEO DESCRIPTIONS (Fix 2) ===");

  // 1. Update / Insert in SQLite
  console.log("\n--- SQLite ---");
  for (const [key, val] of Object.entries(SEO_FIXES)) {
    const existing = sqlite.prepare("SELECT * FROM page_headers WHERE page_key = ?").get(key);
    if (existing) {
      sqlite.prepare("UPDATE page_headers SET seo_description = ? WHERE page_key = ?").run(val.seo_description, key);
      console.log(`[SQLite] Updated page_headers (${key}) -> seo_description (${val.seo_description.length} chars)`);
    } else {
      sqlite.prepare(
        "INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(key, val.badge_text, val.title, val.highlight_word, val.description, val.seo_title, val.seo_description);
      console.log(`[SQLite] Created page_headers (${key}) -> seo_description (${val.seo_description.length} chars)`);
    }
  }

  // 2. Update / Insert in Neon PostgreSQL
  console.log("\n--- Neon PostgreSQL ---");
  for (const [key, val] of Object.entries(SEO_FIXES)) {
    const existing = await pg.query("SELECT * FROM page_headers WHERE page_key = $1", [key]);
    if (existing && existing.length > 0) {
      await pg.query("UPDATE page_headers SET seo_description = $1 WHERE page_key = $2", [val.seo_description, key]);
      console.log(`[PG] Updated page_headers (${key}) -> seo_description (${val.seo_description.length} chars)`);
    } else {
      await pg.query(
        "INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description, seo_title, seo_description) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [key, val.badge_text, val.title, val.highlight_word, val.description, val.seo_title, val.seo_description]
      );
      console.log(`[PG] Created page_headers (${key}) -> seo_description (${val.seo_description.length} chars)`);
    }
  }

  // 3. Increment content_version in site_settings on both DBs
  const now = new Date().toISOString();
  sqlite.prepare("UPDATE site_settings SET content_version = COALESCE(content_version, 1) + 1, updated_at = ? WHERE id = 1").run(now);
  await pg.query("UPDATE site_settings SET content_version = COALESCE(content_version, 1) + 1, updated_at = $1 WHERE id = 1", [now]);
  console.log("\n[Sync] Incremented content_version in site_settings on both SQLite and Neon PG.");

  // 4. Verify results
  console.log("\n=== VERIFICATION ===");
  const sqlCheck = sqlite.prepare("SELECT page_key, seo_title, length(seo_description) as len, seo_description FROM page_headers WHERE page_key IN ('about', 'projects', 'work', 'education')").all();
  console.log("SQLite verification:");
  console.log(sqlCheck);

  const pgCheck = await pg.query("SELECT page_key, seo_title, length(seo_description) as len, seo_description FROM page_headers WHERE page_key IN ('about', 'projects', 'work', 'education')");
  console.log("Neon PG verification:");
  console.log(pgCheck);

  console.log("\nSUCCESS: All 4 SEO descriptions updated to exact requested texts.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

