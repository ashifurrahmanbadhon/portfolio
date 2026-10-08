const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function updateEducationAndParity() {
  console.log("1. Adding period & highlights_json columns to educations if missing...");

  try {
    await pg.query('ALTER TABLE educations ADD COLUMN IF NOT EXISTS period TEXT');
  } catch (e) {
    console.log("PG period add note:", e.message);
  }

  try {
    await pg.query('ALTER TABLE educations ADD COLUMN IF NOT EXISTS highlights_json TEXT');
  } catch (e) {
    console.log("PG highlights_json add note:", e.message);
  }

  try {
    sqlite.prepare('ALTER TABLE educations ADD COLUMN period TEXT').run();
  } catch (e) {
    // Already exists
  }

  try {
    sqlite.prepare('ALTER TABLE educations ADD COLUMN highlights_json TEXT').run();
  } catch (e) {
    // Already exists
  }

  console.log("2. Updating education items with exact periods and highlights...");

  const updates = [
    {
      id: 4,
      degree: "Bachelor of Science in Electrical & Electronic Engineering (EEE)",
      institution: "IUBAT – International University of Business Agriculture and Technology",
      start_year: "2018",
      end_year: "2022",
      period: "2018 – 2022",
      result: "Graduate",
      badge_text: "Graduated",
      description: "Comprehensive curriculum in Power Systems Analysis, High Voltage Engineering, Switchgear & Protection, Electrical Machines, Telecommunications, and Control Systems.",
      highlights: JSON.stringify([
        "Major in Power Systems & High Voltage Engineering",
        "Substation Protection & Switchgear Modeling",
        "Control Systems & MATLAB Dynamic Simulation",
        "Senior Design Capstone: Solar Power Systems"
      ])
    },
    {
      id: 5,
      degree: "Higher Secondary Certificate (HSC) — Science",
      institution: "General Mahmudul Hasan Adarsha College, Tangail",
      start_year: "2015",
      end_year: "2017",
      period: "2015 – 2017",
      result: "Passed",
      badge_text: "Higher Secondary",
      description: "Focused coursework in Physics, Chemistry, Higher Mathematics, and Basic Computing.",
      highlights: JSON.stringify([
        "Physics & Electromagnetism",
        "Higher Mathematics & Calculus",
        "Chemistry & Laboratory Science"
      ])
    },
    {
      id: 6,
      degree: "Secondary School Certificate (SSC) — Science",
      institution: "Bindu Bashini Government Boys' High School, Tangail",
      start_year: "2013",
      end_year: "2015",
      period: "2013 – 2015",
      result: "Passed",
      badge_text: "Secondary School",
      description: "Strong foundational academics with distinction in Science, General Mathematics, and Physics.",
      highlights: JSON.stringify([
        "General Science & Mathematics",
        "Physics & Basic Electronics Foundations"
      ])
    }
  ];

  for (const item of updates) {
    await pg.query(
      `UPDATE educations SET 
        start_year = $1, 
        end_year = $2, 
        period = $3, 
        result = $4, 
        badge_text = $5, 
        description = $6, 
        highlights_json = $7 
       WHERE id = $8`,
      [
        item.start_year,
        item.end_year,
        item.period,
        item.result,
        item.badge_text,
        item.description,
        item.highlights,
        item.id
      ]
    );

    sqlite.prepare(
      `UPDATE educations SET 
        start_year = ?, 
        end_year = ?, 
        period = ?, 
        result = ?, 
        badge_text = ?, 
        description = ?, 
        highlights_json = ? 
       WHERE id = ?`
    ).run(
      item.start_year,
      item.end_year,
      item.period,
      item.result,
      item.badge_text,
      item.description,
      item.highlights,
      item.id
    );
  }

  console.log("3. Verifying updated educations...");
  const pgRows = await pg.query("SELECT id, degree, period, start_year, end_year, highlights_json FROM educations ORDER BY sort_order ASC");
  const sqRows = sqlite.prepare("SELECT id, degree, period, start_year, end_year, highlights_json FROM educations ORDER BY sort_order ASC").all();

  console.log("Neon PG Educations:", pgRows);
  console.log("SQLite Educations:", sqRows);

  console.log("SUCCESS: Education data fully synced and updated!");
}

updateEducationAndParity().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
