try { process.loadEnvFile('.env.local'); } catch (_) {}
const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('FATAL: DATABASE_URL is required in .env.local');
}
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

const PACKAGE_INQUIRY_DEFAULTS = {
  "Business Website": {
    label: "BUSINESS / CURRENT WEBSITE (OPTIONAL)",
    placeholder: "e.g. MyBrand Store (https://mybrand.com)",
    template: "Business name:\nPages you need:\nReference website (if any):"
  },
  "Portfolio Website": {
    label: "YOUR PROFESSION",
    placeholder: "e.g. Graphic Designer, Photographer",
    template: "Your profession:\nSections you want:\nReference website (if any):"
  },
  "Landing Page": {
    label: "PRODUCT / CAMPAIGN NAME",
    placeholder: "e.g. Summer Sale — Skin Care Bundle",
    template: "Product / offer:\nMain goal (sale / lead / call):\nTraffic source:"
  },
  "AI Chatbot for Business": {
    label: "YOUR WEBSITE (OPTIONAL)",
    placeholder: "e.g. https://mybusiness.com",
    template: "Business type:\nTop customer questions:\nInfo the bot should collect:"
  },
  "Meta Pixel + Conversions API Setup": {
    label: "YOUR WEBSITE",
    placeholder: "e.g. https://myshop.com",
    template: "Website URL:\nAd platform:\nEvents to track:"
  },
  "Tracking Audit": {
    label: "YOUR WEBSITE",
    placeholder: "e.g. https://myshop.com",
    template: "Website URL:\nTools in use:\nMain concern:"
  },
  "n8n Workflow Automation": {
    label: "WHAT SHOULD BE AUTOMATED?",
    placeholder: "e.g. Orders from my page saved to Google Sheets",
    template: "Task to automate:\nTools involved:\nHow often it runs:"
  },
  "Design Services": {
    label: "WHICH DESIGN DO YOU NEED?",
    placeholder: "Email Template / YouTube Thumbnail / Social Media Post",
    template: "Design type:\nText / content:\nQuantity needed:"
  }
};

const DEFAULT_INQUIRY = {
  label: "WEBSITE / BUSINESS (OPTIONAL)",
  placeholder: "",
  template: "Goal:\nDetails:\nDeadline (if any):"
};

const SEO_DEFAULTS = {
  home: {
    seo_title: "Ashifur Rahman • Portfolio",
    seo_description: "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services."
  },
  about: {
    seo_title: "Ashifur Rahman • About",
    seo_description: "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence."
  },
  projects: {
    seo_title: "Ashifur Rahman • Projects",
    seo_description: "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV sizing, motor control schematics, and more."
  },
  work: {
    seo_title: "Work — Service Packages | Ashifur Rahman",
    seo_description: "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start."
  },
  experience: {
    seo_title: "Ashifur Rahman • Experience",
    seo_description: "Professional experience of Ashifur Rahman — substation operations, technical design, AutoCAD Electrical, GIS, and engineering services."
  },
  skills: {
    seo_title: "Ashifur Rahman • Skills",
    seo_description: "Technical skills of Ashifur Rahman: substation operations, AutoCAD Electrical, GIS & asset mapping, power system analysis, and AI technologies."
  },
  education: {
    seo_title: "Ashifur Rahman • Education & Training",
    seo_description: "EEE degree from IUBAT, on-site utility training at DESCO, and AutoCAD Electrical and GIS training — the education and professional development of Ashifur Rahman."
  },
  contact: {
    seo_title: "Ashifur Rahman • Contact",
    seo_description: "Contact Ashifur Rahman for engineering, technology, and AI opportunities — email, WhatsApp, LinkedIn, and GitHub."
  }
};

const PROCESS_STEPS_SEEDS = [
  {
    title: "Consult",
    description: "We discuss your requirement — substation, design, GIS or automation — and I confirm scope honestly.",
    sort_order: 1
  },
  {
    title: "Plan",
    description: "You get a clear plan: deliverables, tools (AutoCAD, ETAP, GIS, AI) and a timeline before work starts.",
    sort_order: 2
  },
  {
    title: "Execute",
    description: "Work is done to standard — IEEE & BNBC compliant for engineering, tested end-to-end for automation.",
    sort_order: 3
  },
  {
    title: "Support",
    description: "Clean handover with documentation, plus support after delivery so nothing is left unclear.",
    sort_order: 4
  }
];

const SITE_TEXT_COLUMNS = [
  'site_texts_json',
  'chat_welcome',
  'chat_chips',
  'nav_items_json',
  'home_featured_projects_heading',
  'home_featured_projects_btn',
  'home_experience_heading',
  'home_experience_btn',
  'home_skills_heading',
  'home_skills_btn',
  'home_education_heading',
  'home_education_btn',
  'home_services_heading',
  'home_packages_heading',
  'home_packages_btn',
  'home_how_i_work_heading',
  'hero_badge_label',
  'about_read_bio_btn',
  'about_focus_heading',
  'about_photo_caption',
  'about_domains_heading',
  'about_domains_subtext',
  'about_principles_heading',
  'about_principles_subtext',
  'projects_filter_label',
  'projects_tools_badge',
  'work_bottom_cta_title',
  'work_bottom_cta_desc',
  'work_bottom_cta_btn',
  'experience_roles_heading',
  'experience_roles_subtext',
  'education_degrees_heading',
  'education_degrees_subtext',
  'education_coursework_heading',
  'education_coursework_subtext',
  'education_certs_heading',
  'education_certs_subtext',
  'footer_rights_text',
  'nav_status_badge'
];

const SITE_TEXT_DEFAULTS = {
  home_featured_projects_heading: "Featured Engineering Projects",
  home_featured_projects_btn: "Explore All Projects",
  home_experience_heading: "Career Journey & Field Work",
  home_experience_btn: "View Full Timeline",
  home_skills_heading: "Technical Skills & Tools",
  home_skills_btn: "View Full Matrix",
  home_education_heading: "Education & Credentials",
  home_education_btn: "View All Credentials",
  home_services_heading: "Engineering Services",
  home_packages_heading: "Digital Services",
  home_packages_btn: "View All Packages →",
  home_how_i_work_heading: "How I Work",
  hero_badge_label: "THE ENGINEER",
  about_read_bio_btn: "Read Full Biography",
  about_focus_heading: "Core Focus Domains",
  about_photo_caption: "ENGINEERING PROFILE",
  about_domains_heading: "Engineering Domains & Capabilities",
  about_domains_subtext: "Structured pillars representing comprehensive technical disciplines, engineering competencies, and professional methodologies.",
  about_principles_heading: "Operating Principles & Engineering Mindset",
  about_principles_subtext: "Core working ethos governing precision, compliance, continuous research, and analytical problem-solving.",
  projects_filter_label: "FILTER BY DOMAIN:",
  projects_tools_badge: "AUTOCAD • GIS • MATLAB • SUBSTATION",
  work_bottom_cta_title: "Need something different?",
  work_bottom_cta_desc: "If your requirement does not match a package, describe it in a few lines - I will tell you honestly if I can do it, how long it takes, and what it costs.",
  work_bottom_cta_btn: "Open Contact Page →",
  experience_roles_heading: "Engineering & Management Roles",
  experience_roles_subtext: "Practical industry exposure demonstrating reliable execution, operational ownership, and technical adaptability.",
  education_degrees_heading: "Academic Qualifications",
  education_degrees_subtext: "A solid academic foundation covering electrical theories, mathematical modeling, and engineering principles.",
  education_coursework_heading: "Undergraduate Engineering Coursework",
  education_coursework_subtext: "Theoretical rigor paired with laboratory experimentation at university.",
  education_certs_heading: "Training & Certifications",
  education_certs_subtext: "Hands-on technical training in power software, substation protocol, and geospatial modeling, plus certified learning.",
  footer_rights_text: "ALL RIGHTS RESERVED.",
  nav_status_badge: "OPEN FOR WORK",
  nav_items_json: JSON.stringify([
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Work", href: "/work" },
    { name: "Experience", href: "/experience" },
    { name: "Skills", href: "/skills" },
    { name: "Education", href: "/education" },
    { name: "Contact", href: "/contact" }
  ]),
  chat_welcome: "Hello! I am Ashifur's AI Assistant. Ask me anything about his electrical engineering background, substation operations, AutoCAD & GIS skills, or projects.",
  chat_chips: JSON.stringify([
    { label: "Skills?", question: "What are your core engineering skills and software tools?" },
    { label: "Projects", question: "Can you highlight your top engineering projects?" },
    { label: "Experience?", question: "What is your background and work experience?" },
    { label: "Hire him", question: "How can I hire or contact Ashifur for engineering work?" }
  ])
};

async function migrate() {
  console.log("Starting Step 2 Dual-Database Migration...");

  // 1. Process steps table
  console.log("1. Creating process_steps table...");
  await pg.query(`
    CREATE TABLE IF NOT EXISTS process_steps (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1
    );
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS process_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Seed process steps if empty
  const pgPsCount = (await pg.query("SELECT COUNT(*) as c FROM process_steps"))[0]?.c || 0;
  const sqlitePsCount = sqlite.prepare("SELECT COUNT(*) as c FROM process_steps").get()?.c || 0;

  if (Number(pgPsCount) === 0) {
    for (const step of PROCESS_STEPS_SEEDS) {
      await pg.query("INSERT INTO process_steps (title, description, sort_order, is_active) VALUES ($1, $2, $3, 1)", [step.title, step.description, step.sort_order]);
    }
    console.log("Seeded process_steps in Neon PG.");
  }

  if (Number(sqlitePsCount) === 0) {
    const stmt = sqlite.prepare("INSERT INTO process_steps (title, description, sort_order, is_active) VALUES (?, ?, ?, 1)");
    for (const step of PROCESS_STEPS_SEEDS) {
      stmt.run(step.title, step.description, step.sort_order);
    }
    console.log("Seeded process_steps in SQLite.");
  }

  // 2. Work Packages new columns & backfill
  console.log("2. Adding inquiry columns to work_packages...");
  for (const col of ['inquiry_field_label', 'inquiry_field_placeholder', 'inquiry_template']) {
    try {
      await pg.query(`ALTER TABLE work_packages ADD COLUMN IF NOT EXISTS ${col} TEXT;`);
    } catch (_) {}
    try {
      const existing = sqlite.prepare("PRAGMA table_info(work_packages)").all();
      if (!existing.some(c => c.name === col)) {
        sqlite.exec(`ALTER TABLE work_packages ADD COLUMN ${col} TEXT;`);
      }
    } catch (_) {}
  }

  // Backfill 8 work packages
  const pgWp = await pg.query("SELECT id, title FROM work_packages");
  for (const pkg of pgWp) {
    const cfg = PACKAGE_INQUIRY_DEFAULTS[pkg.title] || DEFAULT_INQUIRY;
    await pg.query(
      "UPDATE work_packages SET inquiry_field_label = $1, inquiry_field_placeholder = $2, inquiry_template = $3 WHERE id = $4",
      [cfg.label, cfg.placeholder, cfg.template, pkg.id]
    );
    sqlite.prepare(
      "UPDATE work_packages SET inquiry_field_label = ?, inquiry_field_placeholder = ?, inquiry_template = ? WHERE id = ?"
    ).run(cfg.label, cfg.placeholder, cfg.template, pkg.id);
  }
  console.log(`Backfilled ${pgWp.length} work packages with inquiry configs.`);

  // 3. Page Headers SEO columns
  console.log("3. Adding seo columns to page_headers...");
  for (const col of ['seo_title', 'seo_description']) {
    try {
      await pg.query(`ALTER TABLE page_headers ADD COLUMN IF NOT EXISTS ${col} TEXT;`);
    } catch (_) {}
    try {
      const existing = sqlite.prepare("PRAGMA table_info(page_headers)").all();
      if (!existing.some(c => c.name === col)) {
        sqlite.exec(`ALTER TABLE page_headers ADD COLUMN ${col} TEXT;`);
      }
    } catch (_) {}
  }

  // Seed / update SEO titles and descriptions for all 8 pages
  for (const [key, seo] of Object.entries(SEO_DEFAULTS)) {
    await pg.query(
      `UPDATE page_headers SET seo_title = COALESCE(seo_title, $1), seo_description = COALESCE(seo_description, $2) WHERE page_key = $3`,
      [seo.seo_title, seo.seo_description, key]
    );
    sqlite.prepare(
      `UPDATE page_headers SET seo_title = CASE WHEN seo_title IS NULL OR seo_title = '' THEN ? ELSE seo_title END, seo_description = CASE WHEN seo_description IS NULL OR seo_description = '' THEN ? ELSE seo_description END WHERE page_key = ?`
    ).run(seo.seo_title, seo.seo_description, key);
  }
  console.log("Seeded SEO titles and descriptions in page_headers.");

  // 4. Site Settings text columns
  console.log("4. Adding text columns to site_settings...");
  for (const col of SITE_TEXT_COLUMNS) {
    try {
      await pg.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ${col} TEXT;`);
    } catch (_) {}
    try {
      const existing = sqlite.prepare("PRAGMA table_info(site_settings)").all();
      if (!existing.some(c => c.name === col)) {
        sqlite.exec(`ALTER TABLE site_settings ADD COLUMN ${col} TEXT;`);
      }
    } catch (_) {}
  }

  // Backfill site_settings row 1 with defaults where empty
  const pgSs = (await pg.query("SELECT * FROM site_settings WHERE id = 1"))[0] || {};
  const sqliteSs = sqlite.prepare("SELECT * FROM site_settings WHERE id = 1").get() || {};

  for (const [col, defVal] of Object.entries(SITE_TEXT_DEFAULTS)) {
    if (!pgSs[col]) {
      await pg.query(`UPDATE site_settings SET ${col} = $1 WHERE id = 1`, [defVal]);
    }
    if (!sqliteSs[col]) {
      sqlite.prepare(`UPDATE site_settings SET ${col} = ? WHERE id = 1`).run(defVal);
    }
  }
  console.log("Populated site_settings defaults.");

  console.log("Step 2 Dual-Database Migration Finished Successfully!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

