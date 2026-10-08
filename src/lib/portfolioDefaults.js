export const DEFAULT_HERO = {
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

export const DEFAULT_ABOUT = {
  subtitle: "About Ashifur",
  title: "Engineering Precision With Analytical Rigor",
  description1: "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.",
  description2: "Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.",
  profile_image: "/api/media/1791451216945_af4f456a.webp",
  focus1_title: "Energy Systems & Digital Innovation",
  focus1_text: "Focus Area",
  focus2_title: "AutoCAD & GIS",
  focus2_text: "Mapping & CAD",
  pillars: [
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
  ],
  principles: [
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
  ]
};

export const DEFAULT_HIGHLIGHTS = [
  { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree" },
  { metric_value: "15+", metric_label: "CAD & Engineering Projects", metric_subtext: "SLDs, GIS Maps & Simulations" },
  { metric_value: "100%", metric_label: "Safety & Compliance Focus", metric_subtext: "Standard Operating Protocols" },
  { metric_value: "6+", metric_label: "Core Industry Tools", metric_subtext: "AutoCAD, GIS, ETAP, MATLAB" },
];

export const DEFAULT_EXPERIENCE_METRICS = [
  { metric: "2+", label: "Years Total Experience", subtext: "Engineering + Management Analytics" },
  { metric: "15+", label: "Projects & Simulations", subtext: "CAD, GIS, MATLAB & Solar Design" },
  { metric: "100%", label: "Operational Safety", subtext: "Strict High-Voltage Protocols" }
];

export const DEFAULT_EXPERIENCES = [
  {
    role: "Executive Officer",
    organization: "Ventech Digital — Sales & Management | Remote",
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
    tools: ["MS Excel", "Data Analytics", "Work Planning", "Operational Reporting"]
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
    tools: ["Substation Maintenance", "Switchgear", "Transformer Inspection", "Single Line Diagrams"]
  }
];

export const DEFAULT_EDUCATIONS = [
  {
    degree: "Bachelor of Science in Electrical & Electronic Engineering (EEE)",
    institution: "IUBAT – International University of Business Agriculture and Technology",
    period: "2018 – 2022",
    result: "Graduate",
    badge_text: "Graduated",
    description: "Comprehensive curriculum in Power Systems Analysis, High Voltage Engineering, Switchgear & Protection, Electrical Machines, Telecommunications, and Control Systems.",
    highlights: ["Senior Engineering Capstone Project", "Power System Modeling", "AutoCAD Electrical Certification"]
  },
  {
    degree: "Higher Secondary Certificate (HSC) — Science",
    institution: "General Mahmudul Hasan Adarsha College, Tangail",
    period: "2015 – 2017",
    result: "Passed",
    badge_text: "Higher Secondary",
    description: "Focused coursework in Physics, Chemistry, Higher Mathematics, and Basic Computing.",
    highlights: ["Science Club Member", "Advanced Mathematics"]
  },
  {
    degree: "Secondary School Certificate (SSC) — Science",
    institution: "Bindu Bashini Government Boys' High School, Tangail",
    period: "2013 – 2015",
    result: "Passed",
    badge_text: "Secondary School",
    description: "Strong foundational academics with distinction in Science, General Mathematics, and Physics.",
    highlights: ["Historic High School", "Academic Distinction"]
  }
];

export const DEFAULT_COURSEWORK_PILLARS = [
  {
    title: "Power Systems & Energy",
    courses: [
      "Power System Analysis I & II",
      "Switchgear & Protective Relaying",
      "Electrical Machines (AC & DC)",
      "High Voltage Engineering (HVE)",
      "Transmission & Distribution Design",
      "Renewable Energy Systems (Solar PV)"
    ]
  },
  {
    title: "Electronics & Control",
    courses: [
      "Power Electronics & Drives",
      "Control Systems Engineering",
      "Digital Signal Processing (DSP)",
      "Industrial Automation & PLC",
      "Circuit Analysis & Synthesis",
      "Electromagnetic Fields & Waves"
    ]
  },
  {
    title: "AI, Computing & Tools",
    courses: [
      "Python for Engineering Computations",
      "Artificial Intelligence Fundamentals",
      "Engineering Statistics & Regression",
      "AutoCAD Electrical 2D Systems",
      "GIS Spatial Utility Analysis",
      "Technical Sales BOQ Modeling"
    ]
  }
];

export const DEFAULT_CERTIFICATIONS = [
  {
    title: "AutoCAD Electrical 2D & SLD Master Certification",
    issuer: "Engineering Design & CAD Academy",
    year: "2023",
    description: "Industrial Single Line Diagrams, panel wiring schematics, and substation layout drafting.",
    is_verified: true
  },
  {
    title: "Substation Operations & High Voltage Safety Protocols",
    issuer: "Dhaka Electric Supply Company Ltd. (DESCO)",
    year: "2023",
    description: "Practical training on 33/11 kV transformer maintenance, circuit breaker operation, and field safety protocols.",
    is_verified: true
  },
  {
    title: "GIS Spatial Data Analysis & Utility Network Management",
    issuer: "Spatial Information Systems Workshop",
    year: "2023",
    description: "Spatial geodatabases, feeder routing, and utility infrastructure asset mapping with ArcGIS/QGIS.",
    is_verified: true
  }
];

export const DEFAULT_SKILLS = [
  {
    category: "Design & Simulation",
    icon: "monitor",
    items: [
      { name: "AutoCAD (Electrical/2D)", level: 90 },
      { name: "MATLAB / Simulink", level: 85 },
      { name: "ETAP (Power System Analysis)", level: 80 },
      { name: "PSNA / PVSyst", level: 75 }
    ]
  },
  {
    category: "GIS & Data Systems",
    icon: "database",
    items: [
      { name: "GIS (ArcGIS / QGIS)", level: 85 },
      { name: "MS Excel (Advanced / Data)", level: 90 },
      { name: "Spatial Network Mapping", level: 80 },
      { name: "Technical Sales Analytics", level: 85 }
    ]
  },
  {
    category: "Power Systems & Field",
    icon: "shield",
    items: [
      { name: "Substation Operations & Testing", level: 88 },
      { name: "Single Line Diagrams (SLD)", level: 92 },
      { name: "Switchgear & Relay Coordination", level: 82 },
      { name: "Distribution Network & BOQ", level: 86 }
    ]
  }
];

export const DEFAULT_SOFTWARE_TOOLS = [
  {
    name: "AutoCAD Electrical",
    tool_type: "Drafting & Schematics",
    icon: "Monitor",
    level: "Advanced",
    summary: "Single Line Diagrams (SLDs), substation layout drafting, panel layout design, conduit routing, and technical engineering drawings."
  },
  {
    name: "ArcGIS & QGIS",
    tool_type: "Spatial GIS Mapping",
    icon: "Database",
    level: "Proficient",
    summary: "Georeferenced distribution networks, 11kV/0.4kV electrical feeder mapping, transformer asset tagging, and geospatial topology analysis."
  },
  {
    name: "MATLAB & Simulink",
    tool_type: "Simulation & Modeling",
    icon: "Cpu",
    level: "Proficient",
    summary: "Power electronics simulations, converter circuit design (Buck converter), reactive power compensation (APFC), and mathematical modeling."
  },
  {
    name: "ETAP & PVSyst",
    tool_type: "Power Systems & Solar",
    icon: "Zap",
    level: "Intermediate",
    summary: "Load flow analysis, short circuit calculations, relay coordination curves, solar PV irradiance modeling, and ROI feasibility analysis."
  }
];

export const DEFAULT_SKILL_BADGES = [
  "Substation Operations",
  "AutoCAD Electrical",
  "GIS Asset Mapping",
  "Single Line Diagrams (SLD)",
  "Power Transformers",
  "Switchgear & Relays",
  "MATLAB & Simulink",
  "ETAP Load Flow",
  "Technical Sales Analytics",
  "Artificial Intelligence"
];

export const DEFAULT_PROJECTS = [
  {
    id: "01",
    project_number: "01",
    title: "Design & Development of a Buck Converter for Solar Battery Charging",
    category: "Power Electronics",
    short_description: "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
    description: "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
    tags: ["Power Electronics", "Buck Converter", "Solar Energy"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: true
  },
  {
    id: "02",
    project_number: "02",
    title: "132/33kV Grid Substation SLD & Protection Design",
    category: "Substation Design",
    short_description: "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
    description: "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
    tags: ["AutoCAD", "ETAP", "Power Systems"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: true
  },
  {
    id: "03",
    project_number: "03",
    title: "GIS-Based Power Distribution Asset Mapping",
    category: "GIS & Infrastructure",
    short_description: "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
    description: "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
    tags: ["ArcGIS", "QGIS", "Spatial Analysis"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: true
  },
  {
    id: "04",
    project_number: "04",
    title: "Automatic Power Factor Correction (APFC) Simulation",
    category: "Control & Simulation",
    short_description: "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
    description: "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
    tags: ["MATLAB", "Simulink", "Industrial Control"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: false
  },
  {
    id: "05",
    project_number: "05",
    title: "50kW Rooftop Solar PV Feasibility & Sizing",
    category: "Solar & Renewable",
    short_description: "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
    description: "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
    tags: ["PVSyst", "Solar PV", "AutoCAD"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: false
  },
  {
    id: "06",
    project_number: "06",
    title: "Industrial Motor Control & Protective Schematics",
    category: "Industrial Automation",
    short_description: "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
    description: "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
    tags: ["PSNA", "Motor Control", "AutoCAD"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: false
  },
  {
    id: "07",
    project_number: "07",
    title: "Automated Sales & Quotation Management Engine",
    category: "Analytics & Sales",
    short_description: "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
    description: "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
    tags: ["MS Excel", "Data Analytics", "BOQ"],
    image_url: "",
    live_url: "",
    github_url: "",
    is_featured: false
  }
];

export const DEFAULT_PROJECT_METHODOLOGIES = [
  {
    step_number: "01",
    title: "Specification & Requirements",
    description: "Defining voltage ratings, boundary limits, load demands, and IEEE/IEC design compliance parameters."
  },
  {
    step_number: "02",
    title: "Modeling & Simulation",
    description: "Executing mathematical simulations in MATLAB, power flow in ETAP, or solar yield modeling in PVSyst."
  },
  {
    step_number: "03",
    title: "Drafting & GIS Implementation",
    description: "Producing precise Single Line Diagrams in AutoCAD Electrical or spatial geodatabases in ArcGIS/QGIS."
  },
  {
    step_number: "04",
    title: "Verification & Documentation",
    description: "Generating detailed BOQ, component schedules, safety verification reports, and operational manuals."
  }
];

export const DEFAULT_CONTACT = {
  email: "ashifur.badhon@gmail.com",
  phone: "+880 1521 417284",
  whatsapp: "+880 1521 417284",
  whatsapp_url: "https://wa.me/8801521417284",
  linkedin: "linkedin.com/in/ashifurrahmanbadhon",
  linkedin_url: "https://www.linkedin.com/in/ashifurrahmanbadhon",
  location: "Tangail, Dhaka, Bangladesh",
  maps_url: "https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh"
};

export const DEFAULT_PAGE_HEADERS = {
  home: {
    page_key: "home",
    badge_text: "Available for Engineering, Technology & AI Opportunities",
    title: "ASHIFUR RAHMAN",
    highlight_word: "Electrical & Electronic Engineer",
    description: "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies."
  },
  about: {
    page_key: "about",
    badge_text: "ENGINEER & INNOVATOR",
    title: "About Ashifur Rahman —",
    highlight_word: "Engineering & AI",
    description: "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence."
  },
  experience: {
    page_key: "experience",
    badge_text: "PROFESSIONAL JOURNEY",
    title: "Work Experience &",
    highlight_word: "Field Operations",
    description: "A dual-faceted career track combining high-voltage power distribution operations at DESCO with data analytics and workflow planning at Ventech Digital."
  },
  education: {
    page_key: "education",
    badge_text: "ACADEMIC BACKGROUND",
    title: "Academic Credentials &",
    highlight_word: "Certifications",
    description: "Formal degree in Electrical & Electronic Engineering complemented by on-site utility training at DESCO and accredited CAD and GIS certifications."
  },
  skills: {
    page_key: "skills",
    badge_text: "TECHNICAL PROFICIENCY",
    title: "Technical Skills Matrix &",
    highlight_word: "Tool Competency",
    description: "Applied expertise across electrical design, power system analysis software, spatial GIS utilities, data modeling, and industrial programming."
  },
  projects: {
    page_key: "projects",
    badge_text: "ENGINEERING CASE STUDIES",
    title: "Featured Engineering &",
    highlight_word: "Technical Projects",
    description: "Comprehensive engineering case studies spanning substation SLDs, GIS network mapping, solar converter hardware, and industrial power factor simulations."
  },
  contact: {
    page_key: "contact",
    badge_text: "COMMUNICATION & INQUIRIES",
    title: "Let's Discuss Engineering &",
    highlight_word: "Technical Solutions",
    description: "Reach out directly for substation engineering consultations, AutoCAD schematics, GIS asset mapping, operational analytics, or technology collaborations."
  }
};

export const DEFAULT_HOMEPAGE_CTA = {
  badge_text: "Open for Engineering & AI Opportunities",
  title: "Let's Collaborate on Engineering Solutions",
  description: "Whether you need substation consultation, AutoCAD schematics, GIS utility analysis, or want to discuss technical roles, let's connect.",
  primary_btn_text: "Open Contact Hub",
  primary_btn_link: "/contact",
  secondary_btn_text: "Download Official CV",
  secondary_btn_link: "/resume.pdf"
};
