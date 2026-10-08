const { neon } = require('@neondatabase/serverless');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = 'postgresql://neondb_owner:npg_v17ZYeNzLJbo@ep-round-glitter-b3y093zb-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const pg = neon(databaseUrl);
const sqlite = new DatabaseSync('portfolio.db');

async function runPg(query, params = []) {
  return await pg.query(query, params);
}

function runSqlite(query, params = []) {
  return sqlite.prepare(query).run(...params);
}

async function syncAll() {
  console.log("==================================================");
  console.log("Starting Full Sync: Netlify Portfolio -> DB & CMS");
  console.log("==================================================");

  const now = new Date().toISOString();

  // 1. HERO SECTION
  console.log("Updating Hero Section...");
  const heroData = {
    name: "ASHIFUR RAHMAN",
    title: "Electrical & Electronic Engineer",
    badge_text: "Available for Engineering, Technology & AI Opportunities",
    introduction: "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies.",
    profile_image: "/ashifur.jpeg",
    primary_btn_text: "Contact Me",
    primary_btn_link: "/contact",
    secondary_btn_text: "Download CV",
    secondary_btn_link: "/resume.pdf",
    spec_badge_label: "Specialization",
    spec_badge_title: "Engineering, Management & AI"
  };

  await runPg(`
    UPDATE hero SET
      name = $1,
      title = $2,
      badge_text = $3,
      introduction = $4,
      profile_image = $5,
      primary_btn_text = $6,
      primary_btn_link = $7,
      secondary_btn_text = $8,
      secondary_btn_link = $9,
      spec_badge_label = $10,
      spec_badge_title = $11,
      updated_at = $12
    WHERE id = 1
  `, [
    heroData.name, heroData.title, heroData.badge_text, heroData.introduction,
    heroData.profile_image, heroData.primary_btn_text, heroData.primary_btn_link,
    heroData.secondary_btn_text, heroData.secondary_btn_link, heroData.spec_badge_label,
    heroData.spec_badge_title, now
  ]);

  runSqlite(`
    UPDATE hero SET
      name = ?,
      title = ?,
      badge_text = ?,
      introduction = ?,
      profile_image = ?,
      primary_btn_text = ?,
      primary_btn_link = ?,
      secondary_btn_text = ?,
      secondary_btn_link = ?,
      spec_badge_label = ?,
      spec_badge_title = ?,
      updated_at = ?
    WHERE id = 1
  `, [
    heroData.name, heroData.title, heroData.badge_text, heroData.introduction,
    heroData.profile_image, heroData.primary_btn_text, heroData.primary_btn_link,
    heroData.secondary_btn_text, heroData.secondary_btn_link, heroData.spec_badge_label,
    heroData.spec_badge_title, now
  ]);

  // 2. ABOUT SECTION
  console.log("Updating About Section...");
  const pillars = [
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
  ];

  const principles = [
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
  ];

  const aboutData = {
    subtitle: "Background & Vision",
    title: "Engineering Precision With Analytical Rigor",
    description1: "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.",
    description2: "Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.",
    profile_image: "/ashifur.jpeg",
    focus1_title: "Energy Systems & Digital Innovation",
    focus1_text: "Focus Area",
    focus2_title: "AutoCAD & GIS",
    focus2_text: "Mapping & CAD",
    pillars_json: JSON.stringify(pillars),
    principles_json: JSON.stringify(principles)
  };

  await runPg(`
    UPDATE about SET
      subtitle = $1,
      title = $2,
      description1 = $3,
      description2 = $4,
      profile_image = $5,
      focus1_title = $6,
      focus1_text = $7,
      focus2_title = $8,
      focus2_text = $9,
      pillars_json = $10,
      principles_json = $11,
      updated_at = $12
    WHERE id = 1
  `, [
    aboutData.subtitle, aboutData.title, aboutData.description1, aboutData.description2,
    aboutData.profile_image, aboutData.focus1_title, aboutData.focus1_text,
    aboutData.focus2_title, aboutData.focus2_text, aboutData.pillars_json,
    aboutData.principles_json, now
  ]);

  runSqlite(`
    UPDATE about SET
      subtitle = ?,
      title = ?,
      description1 = ?,
      description2 = ?,
      profile_image = ?,
      focus1_title = ?,
      focus1_text = ?,
      focus2_title = ?,
      focus2_text = ?,
      pillars_json = ?,
      principles_json = ?,
      updated_at = ?
    WHERE id = 1
  `, [
    aboutData.subtitle, aboutData.title, aboutData.description1, aboutData.description2,
    aboutData.profile_image, aboutData.focus1_title, aboutData.focus1_text,
    aboutData.focus2_title, aboutData.focus2_text, aboutData.pillars_json,
    aboutData.principles_json, now
  ]);

  // 3. HIGHLIGHTS STATS BAR
  console.log("Updating Highlights Bar...");
  const highlights = [
    { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree", sort_order: 1 },
    { metric_value: "15+", metric_label: "CAD & Power Projects", metric_subtext: "SLDs, GIS Maps & Simulations", sort_order: 2 },
    { metric_value: "100%", metric_label: "Safety & Compliance", metric_subtext: "Adhering to IEEE & BNBC standards", sort_order: 3 },
    { metric_value: "6+", metric_label: "Core Software Tools", metric_subtext: "AutoCAD, ETAP, MATLAB, GIS", sort_order: 4 }
  ];

  await runPg("DELETE FROM highlights");
  runSqlite("DELETE FROM highlights");

  for (const h of highlights) {
    await runPg(`
      INSERT INTO highlights (metric_value, metric_label, metric_subtext, sort_order)
      VALUES ($1, $2, $3, $4)
    `, [h.metric_value, h.metric_label, h.metric_subtext, h.sort_order]);

    runSqlite(`
      INSERT INTO highlights (metric_value, metric_label, metric_subtext, sort_order)
      VALUES (?, ?, ?, ?)
    `, [h.metric_value, h.metric_label, h.metric_subtext, h.sort_order]);
  }

  // 4. SKILLS MATRIX (4 Categories with exact Netlify percentages)
  console.log("Updating Skills Matrix...");
  const skills = [
    // Design & Simulation
    { category: "Design & Simulation", name: "AutoCAD (Electrical/2D)", level: 90, icon: "monitor", sort_order: 1 },
    { category: "Design & Simulation", name: "MATLAB / Simulink", level: 85, icon: "cpu", sort_order: 2 },
    { category: "Design & Simulation", name: "ETAP (Power System)", level: 80, icon: "zap", sort_order: 3 },
    { category: "Design & Simulation", name: "PSNA / PVSyst", level: 75, icon: "sun", sort_order: 4 },
    // GIS & Data Systems
    { category: "GIS & Data Systems", name: "GIS (ArcGIS / QGIS)", level: 85, icon: "map", sort_order: 5 },
    { category: "GIS & Data Systems", name: "MS Excel (Advanced)", level: 90, icon: "table", sort_order: 6 },
    { category: "GIS & Data Systems", name: "Network Asset Mapping", level: 80, icon: "share-2", sort_order: 7 },
    { category: "GIS & Data Systems", name: "Sales & Cost Modeling", level: 85, icon: "trending-up", sort_order: 8 },
    // Power Systems
    { category: "Power Systems", name: "Substation Layout & Operations", level: 88, icon: "activity", sort_order: 9 },
    { category: "Power Systems", name: "Single Line Diagrams (SLD)", level: 92, icon: "git-branch", sort_order: 10 },
    { category: "Power Systems", name: "Switchgear & Relay Coordination", level: 82, icon: "shield", sort_order: 11 },
    { category: "Power Systems", name: "Power Distribution & BOQ", level: 86, icon: "layers", sort_order: 12 },
    // AI & Automation
    { category: "AI & Automation", name: "AI Tools & Generative AI", level: 82, icon: "cpu", sort_order: 13 },
    { category: "AI & Automation", name: "Prompt Engineering", level: 85, icon: "terminal", sort_order: 14 },
    { category: "AI & Automation", name: "AI-based Automation", level: 78, icon: "refresh-cw", sort_order: 15 },
    { category: "AI & Automation", name: "Data Management & Reporting", level: 88, icon: "bar-chart-2", sort_order: 16 }
  ];

  await runPg("DELETE FROM skills");
  runSqlite("DELETE FROM skills");

  for (const s of skills) {
    await runPg(`
      INSERT INTO skills (category, name, level, icon, sort_order)
      VALUES ($1, $2, $3, $4, $5)
    `, [s.category, s.name, s.level, s.icon, s.sort_order]);

    runSqlite(`
      INSERT INTO skills (category, name, level, icon, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `, [s.category, s.name, s.level, s.icon, s.sort_order]);
  }

  // 5. SKILL BADGES (12 from Netlify)
  console.log("Updating Skill Badges...");
  const badges = [
    "AutoCAD", "PSNA", "GIS", "MATLAB", "ETAP", "MS Excel",
    "Power Distribution", "Relay Testing", "Generative AI",
    "Prompt Engineering", "AI Automation", "Data Reporting"
  ];

  await runPg("DELETE FROM skill_badges");
  runSqlite("DELETE FROM skill_badges");

  for (let i = 0; i < badges.length; i++) {
    await runPg(`
      INSERT INTO skill_badges (name, sort_order)
      VALUES ($1, $2)
    `, [badges[i], i + 1]);

    runSqlite(`
      INSERT INTO skill_badges (name, sort_order)
      VALUES (?, ?)
    `, [badges[i], i + 1]);
  }

  // 6. WORK EXPERIENCES
  console.log("Updating Work Experiences...");
  const experiences = [
    {
      role: "Executive Officer",
      organization: "Ventech Digital",
      period: "January 2023 – January 2025",
      location: "Remote",
      points: [
        "Categorized and pre-processed large datasets for operational use.",
        "Prepared production capacity forecasts to support marketing activities.",
        "Developed work plans based on manpower and time requirements.",
        "Managed workflow from order processing through sales completion.",
        "Coordinated with management and teams to maintain efficient supply chain operations.",
        "Prepared management reports on targets, achievements, and operational performance."
      ],
      sort_order: 1
    },
    {
      role: "Internee Engineer",
      organization: "Dhaka Electric Supply Company Ltd. (DESCO) — Systemic & Commercial Operation Department",
      period: "February 2023 – March 2023",
      location: "Uttara (West), Dhaka",
      points: [
        "Supported operation and maintenance activities at 33/11 kV substations.",
        "Observed and assisted with control room operations and load monitoring.",
        "Conducted field visits and reviewed daily operational reports.",
        "Gained practical exposure to power distribution systems and high voltage field operations."
      ],
      sort_order: 2
    }
  ];

  await runPg("DELETE FROM experiences");
  runSqlite("DELETE FROM experiences");

  for (const exp of experiences) {
    const pointsJson = JSON.stringify(exp.points);
    await runPg(`
      INSERT INTO experiences (
        role, organization, period, is_current, description_points, location, sort_order, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [exp.role, exp.organization, exp.period, 0, pointsJson, exp.location, exp.sort_order, now]);

    runSqlite(`
      INSERT INTO experiences (
        role, organization, period, is_current, description_points, location, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [exp.role, exp.organization, exp.period, 0, pointsJson, exp.location, exp.sort_order, now]);
  }

  // 7. PROJECTS (7 Case Studies from Netlify)
  console.log("Updating Projects...");
  const projects = [
    {
      project_number: "01",
      title: "Design & Development of a Buck Converter for Solar Battery Charging",
      category: "Power Electronics",
      short_description: "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
      full_description: "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
      tags: ["Power Electronics", "Buck Converter", "Solar Energy"],
      is_featured: 1,
      sort_order: 1
    },
    {
      project_number: "02",
      title: "132/33kV Grid Substation SLD & Protection Design",
      category: "Substation Design",
      short_description: "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
      full_description: "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
      tags: ["AutoCAD", "ETAP", "Power Systems"],
      is_featured: 1,
      sort_order: 2
    },
    {
      project_number: "03",
      title: "GIS-Based Power Distribution Asset Mapping",
      category: "GIS & Infrastructure",
      short_description: "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
      full_description: "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
      tags: ["ArcGIS", "QGIS", "Spatial Analysis"],
      is_featured: 1,
      sort_order: 3
    },
    {
      project_number: "04",
      title: "Automatic Power Factor Correction (APFC) Simulation",
      category: "Control & Simulation",
      short_description: "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
      full_description: "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
      tags: ["MATLAB", "Simulink", "Industrial Control"],
      is_featured: 0,
      sort_order: 4
    },
    {
      project_number: "05",
      title: "50kW Rooftop Solar PV Feasibility & Sizing",
      category: "Solar & Renewable",
      short_description: "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
      full_description: "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
      tags: ["PVSyst", "Solar PV", "AutoCAD"],
      is_featured: 0,
      sort_order: 5
    },
    {
      project_number: "06",
      title: "Industrial Motor Control & Protective Schematics",
      category: "Industrial Automation",
      short_description: "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
      full_description: "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
      tags: ["PSNA", "Motor Control", "AutoCAD"],
      is_featured: 0,
      sort_order: 6
    },
    {
      project_number: "07",
      title: "Automated Sales & Quotation Management Engine",
      category: "Analytics & Sales",
      short_description: "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
      full_description: "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
      tags: ["MS Excel", "Data Analytics", "BOQ"],
      is_featured: 0,
      sort_order: 7
    }
  ];

  await runPg("DELETE FROM projects");
  runSqlite("DELETE FROM projects");

  for (const p of projects) {
    const tagsJson = JSON.stringify(p.tags);
    await runPg(`
      INSERT INTO projects (
        project_number, title, short_description, full_description, image_url,
        additional_images_json, tags_json, category, live_url, github_url,
        project_date, is_featured, is_published, sort_order, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      p.project_number, p.title, p.short_description, p.full_description, "",
      "[]", tagsJson, p.category, "", "", "2024", p.is_featured, 1, p.sort_order, now
    ]);

    runSqlite(`
      INSERT INTO projects (
        project_number, title, short_description, full_description, image_url,
        additional_images_json, tags_json, category, live_url, github_url,
        project_date, is_featured, is_published, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.project_number, p.title, p.short_description, p.full_description, "",
      "[]", tagsJson, p.category, "", "", "2024", p.is_featured, 1, p.sort_order, now
    ]);
  }

  // 8. EDUCATION & ACADEMIC CREDENTIALS
  console.log("Updating Educations...");
  const educations = [
    {
      degree: "Bachelor of Science in Electrical & Electronic Engineering (EEE)",
      institution: "IUBAT – International University of Business Agriculture and Technology",
      period: "2018 – 2022",
      result: "Graduate",
      badge_text: "Graduated",
      description: "Comprehensive curriculum in Power Systems Analysis, High Voltage Engineering, Switchgear & Protection, Electrical Machines, Telecommunications, and Control Systems.",
      sort_order: 1
    },
    {
      degree: "Higher Secondary Certificate (HSC) — Science",
      institution: "General Mahmudul Hasan Adarsha College, Tangail",
      period: "2015 – 2017",
      result: "Passed",
      badge_text: "Higher Secondary",
      description: "Focused coursework in Physics, Chemistry, Higher Mathematics, and Basic Computing.",
      sort_order: 2
    },
    {
      degree: "Secondary School Certificate (SSC) — Science",
      institution: "Bindu Bashini Government Boys' High School, Tangail",
      period: "2013 – 2015",
      result: "Passed",
      badge_text: "Secondary School",
      description: "Strong foundational academics with distinction in Science, General Mathematics, and Physics.",
      sort_order: 3
    }
  ];

  await runPg("DELETE FROM educations");
  runSqlite("DELETE FROM educations");

  for (const ed of educations) {
    await runPg(`
      INSERT INTO educations (
        degree, institution, subject, start_year, end_year, result, badge_text, description, sort_order, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [ed.degree, ed.institution, "Science", "", "", ed.result, ed.badge_text, ed.description, ed.sort_order, now]);

    runSqlite(`
      INSERT INTO educations (
        degree, institution, subject, start_year, end_year, result, badge_text, description, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [ed.degree, ed.institution, "Science", "", "", ed.result, ed.badge_text, ed.description, ed.sort_order, now]);
  }

  // 9. SERVICES (4 Core Competency Domains from Netlify)
  console.log("Updating Services...");
  const services = [
    {
      title: "Substation Operations",
      description: "Transformer inspection, switchgear testing, SLD verification, relay configuration, and high voltage safety management.",
      icon: "zap",
      sort_order: 1
    },
    {
      title: "AutoCAD Electrical",
      description: "2D layouts, cable conduit routings, substation layouts, motor control schematics, and Single Line Diagrams.",
      icon: "layout",
      sort_order: 2
    },
    {
      title: "GIS & Asset Mapping",
      description: "Spatial infrastructure analysis, power line path planning, pole mapping, and feeder network geodatabases.",
      icon: "map",
      sort_order: 3
    },
    {
      title: "Technical Sales & Data",
      description: "BOQ preparation, equipment sizing, proposal drafting, capacity forecasting, and dynamic Excel data analytics.",
      icon: "trending-up",
      sort_order: 4
    }
  ];

  await runPg("DELETE FROM services");
  runSqlite("DELETE FROM services");

  for (const s of services) {
    await runPg(`
      INSERT INTO services (title, description, icon, sort_order)
      VALUES ($1, $2, $3, $4)
    `, [s.title, s.description, s.icon, s.sort_order]);

    runSqlite(`
      INSERT INTO services (title, description, icon, sort_order)
      VALUES (?, ?, ?, ?)
    `, [s.title, s.description, s.icon, s.sort_order]);
  }

  // 10. SOCIAL LINKS & CONTACT
  console.log("Updating Social Links...");
  const social = {
    email: "ashifur.badhon@gmail.com",
    phone: "+880 1521 417284",
    whatsapp: "+880 1521 417284",
    linkedin: "https://www.linkedin.com/in/ashifurrahmanbadhon",
    github: "https://github.com/ashifurrahmanbadhon",
    facebook: "https://facebook.com",
    location: "Tangail, Dhaka, Bangladesh",
    maps_url: "https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh"
  };

  await runPg(`
    UPDATE social_links SET
      email = $1,
      phone = $2,
      whatsapp = $3,
      linkedin = $4,
      github = $5,
      facebook = $6,
      location = $7,
      maps_url = $8,
      updated_at = $9
    WHERE id = 1
  `, [
    social.email, social.phone, social.whatsapp, social.linkedin,
    social.github, social.facebook, social.location, social.maps_url, now
  ]);

  runSqlite(`
    UPDATE social_links SET
      email = ?,
      phone = ?,
      whatsapp = ?,
      linkedin = ?,
      github = ?,
      facebook = ?,
      location = ?,
      maps_url = ?,
      updated_at = ?
    WHERE id = 1
  `, [
    social.email, social.phone, social.whatsapp, social.linkedin,
    social.github, social.facebook, social.location, social.maps_url, now
  ]);

  // 11. RESUMES
  console.log("Updating Resumes...");
  await runPg(`
    UPDATE resumes SET
      file_name = $1,
      file_url = $2,
      is_active = 1
    WHERE id = 1
  `, ["Ashifur_Rahman_CV.pdf", "/resume.pdf"]);

  runSqlite(`
    UPDATE resumes SET
      file_name = ?,
      file_url = ?,
      is_active = 1
    WHERE id = 1
  `, ["Ashifur_Rahman_CV.pdf", "/resume.pdf"]);

  // 12. SITE SETTINGS
  console.log("Updating Site Settings...");
  await runPg(`
    UPDATE site_settings SET
      site_title = $1,
      meta_description = $2,
      updated_at = $3
    WHERE id = 1
  `, [
    "Ashifur Rahman | Electrical & Electronic Engineer",
    "Portfolio of Ashifur Rahman — Electrical & Electronic Engineer specializing in Substation Operations, AutoCAD Electrical, GIS Mapping, and AI Innovations.",
    now
  ]);

  runSqlite(`
    UPDATE site_settings SET
      site_title = ?,
      meta_description = ?,
      updated_at = ?
    WHERE id = 1
  `, [
    "Ashifur Rahman | Electrical & Electronic Engineer",
    "Portfolio of Ashifur Rahman — Electrical & Electronic Engineer specializing in Substation Operations, AutoCAD Electrical, GIS Mapping, and AI Innovations.",
    now
  ]);

  // 13. PAGE HEADERS
  console.log("Updating Page Headers...");
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
      page_key: "contact",
      badge_text: "COMMUNICATION & INQUIRIES",
      title: "Let's Discuss Engineering &",
      highlight_word: "Technical Solutions",
      description: "Reach out directly for substation engineering consultations, AutoCAD schematics, GIS asset mapping, operational analytics, or technology collaborations."
    }
  ];

  for (const ph of headers) {
    await runPg(`
      INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (page_key) DO UPDATE SET
        badge_text = EXCLUDED.badge_text,
        title = EXCLUDED.title,
        highlight_word = EXCLUDED.highlight_word,
        description = EXCLUDED.description
    `, [ph.page_key, ph.badge_text, ph.title, ph.highlight_word, ph.description]);

    runSqlite(`
      INSERT INTO page_headers (page_key, badge_text, title, highlight_word, description)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (page_key) DO UPDATE SET
        badge_text = excluded.badge_text,
        title = excluded.title,
        highlight_word = excluded.highlight_word,
        description = excluded.description
    `, [ph.page_key, ph.badge_text, ph.title, ph.highlight_word, ph.description]);
  }

  // 14. Activity Log
  try {
    await runPg(`
      INSERT INTO activity_logs (website_name, action, details, "user", created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, ["Central CMS", "Full Data Sync from Netlify", "Synchronized all portfolio sections, skills, projects, and experiences with ashifurrahman.netlify.app", "admin", now]);

    runSqlite(`
      INSERT INTO activity_logs (website_name, action, details, "user", created_at)
      VALUES (?, ?, ?, ?, ?)
    `, ["Central CMS", "Full Data Sync from Netlify", "Synchronized all portfolio sections, skills, projects, and experiences with ashifurrahman.netlify.app", "admin", now]);
  } catch (e) {
    console.warn("Activity log insert notice:", e.message);
  }

  console.log("==================================================");
  console.log("SUCCESS: All databases synchronized with Netlify!");
  console.log("==================================================");
}

syncAll().catch(err => {
  console.error("Sync failed:", err);
  process.exit(1);
});
