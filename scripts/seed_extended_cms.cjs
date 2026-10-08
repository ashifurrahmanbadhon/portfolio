const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function runPg(query, params = []) {
  return await pg.query(query, params);
}

async function setup() {
  console.log("=== Setting up Extended CMS Tables on Neon PostgreSQL & SQLite ===");

  // 1. Neon PG Schemas - individual queries
  await runPg("ALTER TABLE about ADD COLUMN IF NOT EXISTS pillars_json TEXT;");
  await runPg("ALTER TABLE about ADD COLUMN IF NOT EXISTS principles_json TEXT;");

  await runPg(`
    CREATE TABLE IF NOT EXISTS certifications (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      year TEXT,
      description TEXT,
      is_verified INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await runPg(`
    CREATE TABLE IF NOT EXISTS experience_metrics (
      id SERIAL PRIMARY KEY,
      metric TEXT NOT NULL,
      label TEXT NOT NULL,
      subtext TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await runPg(`
    CREATE TABLE IF NOT EXISTS coursework_pillars (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      courses_json TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER DEFAULT 0
    );
  `);

  await runPg(`
    CREATE TABLE IF NOT EXISTS software_tools (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tool_type TEXT,
      icon TEXT,
      level TEXT,
      summary TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await runPg(`
    CREATE TABLE IF NOT EXISTS project_methodologies (
      id SERIAL PRIMARY KEY,
      step_number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await runPg(`
    CREATE TABLE IF NOT EXISTS page_headers (
      page_key VARCHAR(50) PRIMARY KEY,
      badge_text TEXT,
      title TEXT,
      highlight_word TEXT,
      description TEXT
    );
  `);

  await runPg(`
    CREATE TABLE IF NOT EXISTS homepage_cta (
      id SERIAL PRIMARY KEY,
      badge_text TEXT,
      title TEXT,
      description TEXT,
      primary_btn_text TEXT,
      primary_btn_link TEXT,
      secondary_btn_text TEXT,
      secondary_btn_link TEXT
    );
  `);
  console.log("Neon PG tables & columns verified!");

  // 2. SQLite Schemas
  try {
    sqlite.prepare("ALTER TABLE about ADD COLUMN pillars_json TEXT").run();
  } catch (e) {}
  try {
    sqlite.prepare("ALTER TABLE about ADD COLUMN principles_json TEXT").run();
  } catch (e) {}

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      year TEXT,
      description TEXT,
      is_verified INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );
  `).run();

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS experience_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric TEXT NOT NULL,
      label TEXT NOT NULL,
      subtext TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `).run();

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS coursework_pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      courses_json TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER DEFAULT 0
    );
  `).run();

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS software_tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tool_type TEXT,
      icon TEXT,
      level TEXT,
      summary TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `).run();

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS project_methodologies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `).run();

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS page_headers (
      page_key TEXT PRIMARY KEY,
      badge_text TEXT,
      title TEXT,
      highlight_word TEXT,
      description TEXT
    );
  `).run();

  sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS homepage_cta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      badge_text TEXT,
      title TEXT,
      description TEXT,
      primary_btn_text TEXT,
      primary_btn_link TEXT,
      secondary_btn_text TEXT,
      secondary_btn_link TEXT
    );
  `).run();
  console.log("SQLite tables & columns verified!");

  // 3. Seed data
  const defaultPillars = JSON.stringify([
    {
      icon: "Zap",
      title: "Substation Engineering",
      subtitle: "Power Distribution & Safety",
      description: "Hands-on experience at DESCO 33/11 kV substations, observing power transformers, switchgear mechanisms, protective relays, and load flow continuity."
    },
    {
      icon: "Monitor",
      title: "AutoCAD Electrical",
      subtitle: "Single Line Diagrams & Schematics",
      description: "Drafting industrial Single Line Diagrams (SLDs), substation layout designs, motor starter schematics, and accurate technical drawings."
    },
    {
      icon: "Database",
      title: "GIS Utility Mapping",
      subtitle: "Spatial Data & Network Analysis",
      description: "Spatial mapping of 11kV/0.4kV distribution feeders, electrical assets, transformers, and consumer load nodes using ArcGIS & QGIS geodatabases."
    },
    {
      icon: "Briefcase",
      title: "Sales & Project Analytics",
      subtitle: "Operations, BOQ & Management",
      description: "Preparing Bill of Quantities (BOQ), dynamic quotation engines, production capacity forecasting, and operational dashboards in advanced MS Excel."
    },
    {
      icon: "Cpu",
      title: "AI & Emerging Technologies",
      subtitle: "Intelligent Engineering Systems",
      description: "Bridging core electrical engineering with artificial intelligence, automated reasoning, predictive analysis, and intelligent workflow systems."
    },
    {
      icon: "ShieldCheck",
      title: "Safety & Standards Compliance",
      subtitle: "IEEE, IEC & Standard Protocols",
      description: "Adhering strictly to standard operating procedures, high-voltage safety regulations, electrical clearance protocols, and operational safety."
    }
  ]);

  const defaultPrinciples = JSON.stringify([
    {
      number: "01.",
      title: "Precision & Accuracy",
      description: "Whether drafting an electrical schematic or configuring relay protection ratings, precision prevents failure."
    },
    {
      number: "02.",
      title: "Safety & Compliance",
      description: "Standard operating protocols and safety standards are paramount in both physical substations and digital systems."
    },
    {
      number: "03.",
      title: "Continuous Learning",
      description: "Staying at the frontier of engineering through self-driven AI exploration, modern tools, and system optimization."
    }
  ]);

  await runPg("UPDATE about SET pillars_json = COALESCE(pillars_json, $1), principles_json = COALESCE(principles_json, $2) WHERE id = 1", [defaultPillars, defaultPrinciples]);
  sqlite.prepare("UPDATE about SET pillars_json = COALESCE(pillars_json, ?), principles_json = COALESCE(principles_json, ?) WHERE id = 1").run(defaultPillars, defaultPrinciples);

  // Certifications
  const certCount = await runPg("SELECT COUNT(*) as cnt FROM certifications");
  if (Number(certCount[0]?.cnt || 0) === 0) {
    const certs = [
      {
        title: "AutoCAD Electrical 2D & SLD Master Certification",
        issuer: "Engineering Design & CAD Academy",
        year: "2023",
        description: "Industrial Single Line Diagrams, panel wiring schematics, and substation layout drafting."
      },
      {
        title: "Substation Operations & High Voltage Safety Protocols",
        issuer: "Dhaka Electric Supply Company Ltd. (DESCO)",
        year: "2023",
        description: "Practical training on 33/11 kV transformer maintenance, circuit breaker operation, and field safety protocols."
      },
      {
        title: "GIS Spatial Data Analysis & Utility Network Management",
        issuer: "Spatial Information Systems Workshop",
        year: "2023",
        description: "Spatial geodatabases, feeder routing, and utility infrastructure asset mapping with ArcGIS/QGIS."
      }
    ];
    for (let i = 0; i < certs.length; i++) {
      const c = certs[i];
      await runPg("INSERT INTO certifications (title, issuer, year, description, sort_order) VALUES ($1, $2, $3, $4, $5)", [c.title, c.issuer, c.year, c.description, i + 1]);
      sqlite.prepare("INSERT INTO certifications (title, issuer, year, description, sort_order) VALUES (?, ?, ?, ?, ?)").run(c.title, c.issuer, c.year, c.description, i + 1);
    }
  }

  // Experience Metrics
  const expMCount = await runPg("SELECT COUNT(*) as cnt FROM experience_metrics");
  if (Number(expMCount[0]?.cnt || 0) === 0) {
    const metrics = [
      { metric: "2+ Years", label: "Operational Leadership", subtext: "Remote team coordination & data forecasting" },
      { metric: "33/11 kV", label: "Substation Engineering", subtext: "DESCO power grid & control room operations" },
      { metric: "100%", label: "Safety & Compliance Focus", subtext: "Zero-incident field maintenance protocols" },
      { metric: "500+", label: "Datasets Analyzed", subtext: "Operational workflow & inventory BOQs" }
    ];
    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      await runPg("INSERT INTO experience_metrics (metric, label, subtext, sort_order) VALUES ($1, $2, $3, $4)", [m.metric, m.label, m.subtext, i + 1]);
      sqlite.prepare("INSERT INTO experience_metrics (metric, label, subtext, sort_order) VALUES (?, ?, ?, ?)").run(m.metric, m.label, m.subtext, i + 1);
    }
  }

  // Coursework Pillars
  const cwCount = await runPg("SELECT COUNT(*) as cnt FROM coursework_pillars");
  if (Number(cwCount[0]?.cnt || 0) === 0) {
    const cwPillars = [
      {
        title: "Power & High Voltage Systems",
        courses: ["Power System Analysis & Grid Stability", "High Voltage Engineering (HV Generation & Testing)", "Switchgear & Substation Protection", "Transmission & Distribution Systems"]
      },
      {
        title: "Electronics & Energy Conversion",
        courses: ["Power Electronics & Inverter Topologies", "Electrical Machines (Transformers, Induction & DC)", "Renewable Energy Systems & Solar PV Modeling", "Industrial Automation & Motor Controls"]
      },
      {
        title: "Control, Signals & Computing",
        courses: ["Control Systems Engineering", "Digital Signal Processing (DSP)", "Telecommunications Engineering", "Numerical Methods & MATLAB Simulation"]
      }
    ];
    for (let i = 0; i < cwPillars.length; i++) {
      const p = cwPillars[i];
      await runPg("INSERT INTO coursework_pillars (title, courses_json, sort_order) VALUES ($1, $2, $3)", [p.title, JSON.stringify(p.courses), i + 1]);
      sqlite.prepare("INSERT INTO coursework_pillars (title, courses_json, sort_order) VALUES (?, ?, ?)").run(p.title, JSON.stringify(p.courses), i + 1);
    }
  }

  // Software Tools
  const stCount = await runPg("SELECT COUNT(*) as cnt FROM software_tools");
  if (Number(stCount[0]?.cnt || 0) === 0) {
    const tools = [
      {
        name: "AutoCAD Electrical",
        tool_type: "CAD & Drafting",
        icon: "Monitor",
        level: "Advanced",
        summary: "Single Line Diagrams (SLD), industrial motor control schematics, substation civil & electrical layouts, and panel wiring."
      },
      {
        name: "MATLAB & Simulink",
        tool_type: "Mathematical Simulation",
        icon: "Terminal",
        level: "Proficient",
        summary: "Power system dynamic modeling, Automatic Power Factor Correction (APFC) simulation, DC-DC converter algorithms."
      },
      {
        name: "ETAP",
        tool_type: "Power System Analysis",
        icon: "Cpu",
        level: "Specialist",
        summary: "Load flow analysis, short circuit calculations, protective device coordination, and busbar rating verification."
      },
      {
        name: "ArcGIS & QGIS",
        tool_type: "Spatial Geographic Systems",
        icon: "Compass",
        level: "Advanced",
        summary: "Feeder routing, georeferenced electrical asset inventories, outage prediction mapping, and spatial network databases."
      },
      {
        name: "MS Excel (Advanced)",
        tool_type: "Analytics & Automation",
        icon: "FileSpreadsheet",
        level: "Mastery",
        summary: "Dynamic pricing models, automated Bill of Quantities (BOQ) generators, operational capacity forecasts, and pivot analytics."
      },
      {
        name: "PVSyst & Solar Tools",
        tool_type: "Renewable Feasibility",
        icon: "Sun",
        level: "Proficient",
        summary: "Solar irradiance modeling, string inverter sizing, tilt/pitch optimization, shading losses, and financial yield estimates."
      }
    ];
    for (let i = 0; i < tools.length; i++) {
      const t = tools[i];
      await runPg("INSERT INTO software_tools (name, tool_type, icon, level, summary, sort_order) VALUES ($1, $2, $3, $4, $5, $6)", [t.name, t.tool_type, t.icon, t.level, t.summary, i + 1]);
      sqlite.prepare("INSERT INTO software_tools (name, tool_type, icon, level, summary, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run(t.name, t.tool_type, t.icon, t.level, t.summary, i + 1);
    }
  }

  // Skill Badges
  const sbCount = await runPg("SELECT COUNT(*) as cnt FROM skill_badges");
  if (Number(sbCount[0]?.cnt || 0) === 0) {
    const badges = [
      'AutoCAD Electrical 2D',
      'ETAP Power Flow',
      'MATLAB / Simulink',
      'ArcGIS Utility Network',
      'QGIS Spatial Analysis',
      'PVSyst Solar Sizing',
      'MS Excel Advanced Data',
      'Substation Switchgear Operations',
      'Single Line Diagram (SLD) Drafting',
      'Protective Relay Coordination',
      'Bill of Quantities (BOQ) Modeling',
      'IEEE & IEC Safety Standards'
    ];
    for (let i = 0; i < badges.length; i++) {
      await runPg("INSERT INTO skill_badges (name, sort_order) VALUES ($1, $2)", [badges[i], i + 1]);
      sqlite.prepare("INSERT INTO skill_badges (name, sort_order) VALUES (?, ?)").run(badges[i], i + 1);
    }
  }

  // Project Methodologies
  const pmCount = await runPg("SELECT COUNT(*) as cnt FROM project_methodologies");
  if (Number(pmCount[0]?.cnt || 0) === 0) {
    const steps = [
      { step_number: "01", title: "Specification & Requirements", description: "Defining voltage ratings, boundary limits, load demands, and IEEE/IEC design compliance parameters." },
      { step_number: "02", title: "Modeling & Simulation", description: "Executing mathematical simulations in MATLAB, power flow in ETAP, or solar yield modeling in PVSyst." },
      { step_number: "03", title: "Drafting & GIS Implementation", description: "Producing precise Single Line Diagrams in AutoCAD Electrical or spatial geodatabases in ArcGIS/QGIS." },
      { step_number: "04", title: "Verification & Documentation", description: "Generating detailed BOQ, component schedules, safety verification reports, and operational manuals." }
    ];
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await runPg("INSERT INTO project_methodologies (step_number, title, description, sort_order) VALUES ($1, $2, $3, $4)", [s.step_number, s.title, s.description, i + 1]);
      sqlite.prepare("INSERT INTO project_methodologies (step_number, title, description, sort_order) VALUES (?, ?, ?, ?)").run(s.step_number, s.title, s.description, i + 1);
    }
  }

  // Page Headers
  const phCount = await runPg("SELECT COUNT(*) as cnt FROM page_headers");
  if (Number(phCount[0]?.cnt || 0) === 0) {
    const headers = [
      {
        page_key: "home",
        badge_text: "Available for Engineering, Technology & AI Opportunities",
        title: "ASHIFUR RAHMAN",
        highlight_word: "Electrical & Electronic Engineer",
        description: "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies."
      },
      {
        page_key: "about",
        badge_text: "ENGINEER & INNOVATOR",
        title: "About Ashifur Rahman —",
        highlight_word: "Engineering & AI",
        description: "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence."
      },
      {
        page_key: "experience",
        badge_text: "PROFESSIONAL JOURNEY",
        title: "Work Experience &",
        highlight_word: "Field Operations",
        description: "A dual-faceted career track combining high-voltage power distribution operations at DESCO with data analytics and workflow planning at Ventech Digital."
      },
      {
        page_key: "education",
        badge_text: "ACADEMIC BACKGROUND",
        title: "Academic Credentials &",
        highlight_word: "Certifications",
        description: "Formal degree in Electrical & Electronic Engineering complemented by on-site utility training at DESCO and accredited CAD and GIS certifications."
      },
      {
        page_key: "skills",
        badge_text: "TECHNICAL PROFICIENCY",
        title: "Technical Skills Matrix &",
        highlight_word: "Tool Competency",
        description: "Applied expertise across electrical design, power system analysis software, spatial GIS utilities, data modeling, and industrial programming."
      },
      {
        page_key: "projects",
        badge_text: "ENGINEERING CASE STUDIES",
        title: "Featured Engineering &",
        highlight_word: "Technical Projects",
        description: "Comprehensive engineering case studies spanning substation SLDs, GIS network mapping, solar converter hardware, and industrial power factor simulations."
      },
      {
        page_key: "contact",
        badge_text: "COMMUNICATION & INQUIRIES",
        title: "Let's Discuss Engineering &",
        highlight_word: "Technical Solutions",
        description: "Reach out directly for substation engineering consultations, AutoCAD schematics, GIS asset mapping, operational analytics, or technology collaborations."
      }
    ];
    for (const h of headers) {
      await runPg("INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (page_key) DO NOTHING", [h.page_key, h.badge_text, h.title, h.highlight_word, h.description]);
      sqlite.prepare("INSERT OR IGNORE INTO page_headers (page_key, badge_text, title, highlight_word, description) VALUES (?, ?, ?, ?, ?)").run(h.page_key, h.badge_text, h.title, h.highlight_word, h.description);
    }
  }

  // Homepage CTA
  const ctaCount = await runPg("SELECT COUNT(*) as cnt FROM homepage_cta");
  if (Number(ctaCount[0]?.cnt || 0) === 0) {
    const cta = {
      badge_text: "Open for Engineering & AI Opportunities",
      title: "Let's Collaborate on Engineering Solutions",
      description: "Whether you need substation consultation, AutoCAD schematics, GIS utility analysis, or want to discuss technical roles, let's connect.",
      primary_btn_text: "Open Contact Hub",
      primary_btn_link: "/contact",
      secondary_btn_text: "Download Official CV",
      secondary_btn_link: "/resume.pdf"
    };
    await runPg("INSERT INTO homepage_cta (badge_text, title, description, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link) VALUES ($1, $2, $3, $4, $5, $6, $7)", [cta.badge_text, cta.title, cta.description, cta.primary_btn_text, cta.primary_btn_link, cta.secondary_btn_text, cta.secondary_btn_link]);
    sqlite.prepare("INSERT INTO homepage_cta (badge_text, title, description, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link) VALUES (?, ?, ?, ?, ?, ?, ?)").run(cta.badge_text, cta.title, cta.description, cta.primary_btn_text, cta.primary_btn_link, cta.secondary_btn_text, cta.secondary_btn_link);
  }

  console.log("=== ALL EXTENDED CMS DATA SEEDED AND READY ===");
}

setup().then(() => process.exit(0)).catch(err => { console.error("Setup failed:", err); process.exit(1); });
