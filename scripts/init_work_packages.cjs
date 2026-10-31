try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const pg = neon(process.env.DATABASE_URL);
const sqlite = new DatabaseSync('portfolio.db');

const SEED_PACKAGES = [
  {
    category: "WEBSITE",
    title: "Business Website",
    description: "A complete online home for your business — present your services properly, look trustworthy, and turn visitors into inquiries, orders and calls.",
    deliverables: "Home, services, gallery & about pages\nOrder / inquiry buttons connected to WhatsApp\nPrice list or product showcase section\nYou can update text & photos yourself later",
    tags: "Next.js, CMS Admin, WhatsApp Orders",
    sort_order: 1,
    is_active: 1
  },
  {
    category: "WEBSITE",
    title: "Portfolio Website",
    description: "Your CV, upgraded into a website — projects, skills and experience presented in a way that makes clients and employers take you seriously.",
    deliverables: "Project showcase with photos & details\nSkills, experience & education pages\nMessages land directly in your admin inbox\nEdit everything yourself — no coding needed",
    tags: "Next.js, Admin Panel, Contact Inbox",
    sort_order: 2,
    is_active: 1
  },
  {
    category: "WEBSITE",
    title: "Landing Page",
    description: "One focused page for one goal — a product launch, a campaign, or collecting leads from your Facebook ads without distractions.",
    deliverables: "Headline & offer written around your goal\nLead form + WhatsApp chat button\nLoads fast even on slow mobile networks\nReady for ad traffic: pixel can be added anytime",
    tags: "Ad Campaigns, Lead Form, Fast Load",
    sort_order: 3,
    is_active: 1
  },
  {
    category: "AI",
    title: "AI Chatbot for Business",
    description: "Your website answers customers while you sleep — prices, services, delivery, common questions — in your own business's words.",
    deliverables: "Answers built from your real business info\nHandles price / service / timing questions 24/7\nCustomer details collected for follow-up\nYou can reach out personally when it matters",
    tags: "Gemini / OpenAI, Website Widget, Lead Capture",
    sort_order: 4,
    is_active: 1
  },
  {
    category: "TRACKING",
    title: "Meta Pixel + Conversions API Setup",
    description: "Stop guessing which ads work. Browser + server tracking together, so every sale and lead is counted — even the ones ad-blockers hide.",
    deliverables: "Pixel installed with all key events\nServer-side Conversions API for missed events\nDuplicate events removed, data cleaned\nFinal check together in Events Manager",
    tags: "Meta Pixel, Server-Side CAPI, Event Deduplication",
    sort_order: 5,
    is_active: 1
  },
  {
    category: "TRACKING",
    title: "Tracking Audit",
    description: "Already running ads but the numbers feel wrong? I go through your whole setup, find the leaks, fix them, and explain it in simple words.",
    deliverables: "Pixel, GA4 & GTM checked end to end\nMissing / duplicate events found & repaired\niOS & consent-related data loss reviewed\nSimple written summary of what was fixed",
    tags: "Pixel Check, GA4, Fix Report",
    sort_order: 6,
    is_active: 1
  },
  {
    category: "AUTOMATION",
    title: "n8n Workflow Automation",
    description: "The boring repeat work — copying orders to sheets, sending confirmations, following up — done automatically, exactly the same way, every time.",
    deliverables: "Orders & inquiries saved to Google Sheets / CRM\nAutomatic confirmation messages to customers\nDaily summary or instant alerts to you\nFull setup explained so you are never locked in",
    tags: "n8n, Google Sheets, Auto Notifications",
    sort_order: 7,
    is_active: 1
  }
];

async function init() {
  console.log("Initializing work_packages table in SQLite and Neon PG...");

  // SQLite table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS work_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      title TEXT,
      description TEXT,
      deliverables TEXT,
      tags TEXT,
      sort_order INTEGER,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Neon PG table
  await pg.query(`
    CREATE TABLE IF NOT EXISTS work_packages (
      id SERIAL PRIMARY KEY,
      category TEXT,
      title TEXT,
      description TEXT,
      deliverables TEXT,
      tags TEXT,
      sort_order INTEGER,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Check counts
  const sqliteCount = sqlite.prepare("SELECT COUNT(*) as c FROM work_packages").get().c;
  const pgCount = (await pg.query("SELECT COUNT(*) as c FROM work_packages"))[0]?.c || 0;

  console.log(`Current counts: SQLite = ${sqliteCount}, Neon PG = ${pgCount}`);

  if (sqliteCount === 0) {
    console.log("Seeding SQLite work_packages...");
    const stmt = sqlite.prepare(`
      INSERT INTO work_packages (category, title, description, deliverables, tags, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of SEED_PACKAGES) {
      stmt.run(p.category, p.title, p.description, p.deliverables, p.tags, p.sort_order, p.is_active);
    }
  }

  if (Number(pgCount) === 0) {
    console.log("Seeding Neon PG work_packages...");
    for (const p of SEED_PACKAGES) {
      await pg.query(`
        INSERT INTO work_packages (category, title, description, deliverables, tags, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [p.category, p.title, p.description, p.deliverables, p.tags, p.sort_order, p.is_active]);
    }
  }

  const finalSqliteCount = sqlite.prepare("SELECT COUNT(*) as c FROM work_packages").get().c;
  const finalPgCount = (await pg.query("SELECT COUNT(*) as c FROM work_packages"))[0]?.c || 0;

  console.log(`Final counts: SQLite = ${finalSqliteCount}, Neon PG = ${finalPgCount}`);
  console.log("Work packages initialized and seeded successfully!");
}

init().catch(err => {
  console.error("Initialization error:", err);
  process.exit(1);
});
