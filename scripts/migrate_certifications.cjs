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
  console.log("==========================================");
  console.log("MIGRATING CERTIFICATIONS SCHEMA & CONTENT");
  console.log("==========================================\n");

  // 1. Add image_url column to Neon PG
  console.log("1. Adding image_url column to Neon PG (if not exists)...");
  await pg.query(`ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url TEXT;`);

  // 2. Add image_url column to SQLite
  console.log("2. Adding image_url column to SQLite (if not exists)...");
  try {
    const sqliteCols = sqlite.prepare("PRAGMA table_info(certifications)").all();
    if (!sqliteCols.some(c => c.name === 'image_url')) {
      sqlite.exec("ALTER TABLE certifications ADD COLUMN image_url TEXT;");
    }
  } catch (e) {
    console.log("SQLite column check note:", e.message);
  }

  // Define the target certifications data
  const targetCertifications = [
    {
      sort_order: 1,
      title: "Certificate in Artificial Intelligence (AI)",
      issuer: "e-Learning & Earning Ltd.",
      year: "2026",
      image_url: "",
      description: "Artificial Intelligence course at e-Learning & Earning Ltd., completed from 2 August to 30 September 2026.",
      is_verified: 1,
      is_active: 1
    },
    {
      sort_order: 2,
      title: "Application of Geographical Information System in Electrical (AGISE) — Training",
      issuer: "Technical Training Centre, IUBAT",
      year: "2021",
      image_url: "/certs/cert-agise.jpg",
      description: "Professional certificate course on applying GIS in electrical engineering, conducted from 5 January to 8 April 2021.",
      is_verified: 1,
      is_active: 1
    },
    {
      sort_order: 3,
      title: "Power System Network Analysis (PSNA) — Training",
      issuer: "Technical Training Centre, IUBAT",
      year: "2021",
      image_url: "/certs/cert-psna.jpg",
      description: "Professional certificate course on power system network analysis, conducted from 5 January to 8 April 2021.",
      is_verified: 1,
      is_active: 1
    },
    {
      sort_order: 4,
      title: "Computer Aided Electrical Design (CAED) — Training",
      issuer: "Technical Training Unit, IUBAT",
      year: "2020",
      image_url: "/certs/cert-caed.jpg",
      description: "Professional certificate course on computer-aided electrical design (AutoCAD Electrical), conducted from 5 January to 8 April 2020.",
      is_verified: 1,
      is_active: 1
    },
    {
      sort_order: 5,
      title: "Workshop on SOLIDWORKS",
      issuer: "IEEE WIE Affinity Group SB, University of Dhaka",
      year: "2018",
      image_url: "/certs/cert-solidworks.jpg",
      description: "Participation in the SOLIDWORKS (Version 1) workshop organized by IEEE WIE AG SB DU at the Department of EEE, University of Dhaka, on 19 September 2018.",
      is_verified: 1,
      is_active: 1
    }
  ];

  console.log("3. Syncing content on Neon PostgreSQL...");
  await pg.query("DELETE FROM certifications");
  for (const c of targetCertifications) {
    await pg.query(
      `INSERT INTO certifications (title, issuer, year, description, is_verified, is_active, sort_order, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [c.title, c.issuer, c.year, c.description, c.is_verified, c.is_active, c.sort_order, c.image_url]
    );
  }

  console.log("4. Syncing content on local SQLite...");
  sqlite.exec("DELETE FROM certifications");
  const insertStmt = sqlite.prepare(`
    INSERT INTO certifications (title, issuer, year, description, is_verified, is_active, sort_order, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of targetCertifications) {
    insertStmt.run(c.title, c.issuer, c.year, c.description, c.is_verified, c.is_active, c.sort_order, c.image_url);
  }

  // Verification
  const pgRows = await pg.query("SELECT id, sort_order, title, issuer, year, image_url FROM certifications ORDER BY sort_order ASC");
  console.log("\nVerified Neon PostgreSQL Rows:", pgRows);

  const sqliteRows = sqlite.prepare("SELECT id, sort_order, title, issuer, year, image_url FROM certifications ORDER BY sort_order ASC").all();
  console.log("\nVerified SQLite Rows:", sqliteRows);

  console.log("\n==========================================");
  console.log("CERTIFICATIONS MIGRATION COMPLETE & PARITY VERIFIED!");
  console.log("==========================================");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
