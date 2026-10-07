import { Monitor, Database, ShieldCheck, Briefcase } from 'lucide-react';

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
  title: "Engineering Reliability, Efficiency & Innovation",
  description1: "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.",
  description2: "Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.",
  focus1_title: "Substation Engineering & SLDs",
  focus1_text: "High voltage equipment, switchgear, and single line diagrams.",
  focus2_title: "GIS & Spatial Utility Systems",
  focus2_text: "Mapping 11kV/0.4kV feeders, asset tracking, and spatial analysis."
};

export const DEFAULT_HIGHLIGHTS = [
  { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree" },
  { metric_value: "15+", metric_label: "CAD & Engineering Projects", metric_subtext: "SLDs, GIS Maps & Simulations" },
  { metric_value: "100%", metric_label: "Safety & Compliance Focus", metric_subtext: "Standard Operating Protocols" },
  { metric_value: "6+", metric_label: "Core Industry Tools", metric_subtext: "AutoCAD, GIS, ETAP, MATLAB" },
];

export const DEFAULT_SKILLS = [
  {
    category: 'Design & Simulation',
    icon: 'monitor',
    items: [
      { name: 'AutoCAD (Electrical/2D)', level: 90 },
      { name: 'MATLAB / Simulink', level: 85 },
      { name: 'ETAP (Power System Analysis)', level: 80 },
      { name: 'PSNA / PVSyst', level: 75 },
    ]
  },
  {
    category: 'GIS & Data Systems',
    icon: 'database',
    items: [
      { name: 'GIS (ArcGIS / QGIS)', level: 85 },
      { name: 'MS Excel (Advanced / Data)', level: 90 },
      { name: 'Spatial Network Mapping', level: 80 },
      { name: 'Technical Sales Analytics', level: 85 },
    ]
  },
  {
    category: 'Power Systems & Field',
    icon: 'shield',
    items: [
      { name: 'Substation Operations & Testing', level: 88 },
      { name: 'Single Line Diagrams (SLD)', level: 92 },
      { name: 'Switchgear & Relay Coordination', level: 82 },
      { name: 'Distribution Network & BOQ', level: 86 },
    ]
  }
];

export const DEFAULT_PROJECTS = [
  {
    id: '01',
    title: 'Design & Development of a Buck Converter for Solar Battery Charging',
    category: 'Power Electronics',
    description: 'Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.',
    tags: ['Power Electronics', 'Buck Converter', 'Solar Energy']
  },
  {
    id: '02',
    title: '132/33kV Grid Substation SLD & Protection Design',
    category: 'Substation Design',
    description: 'Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.',
    tags: ['AutoCAD', 'ETAP', 'Power Systems']
  },
  {
    id: '03',
    title: 'GIS-Based Power Distribution Asset Mapping',
    category: 'GIS & Infrastructure',
    description: 'Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.',
    tags: ['ArcGIS', 'QGIS', 'Spatial Analysis']
  },
  {
    id: '04',
    title: 'Automatic Power Factor Correction (APFC) Simulation',
    category: 'Control & Simulation',
    description: 'Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.',
    tags: ['MATLAB', 'Simulink', 'Industrial Control']
  },
  {
    id: '05',
    title: '50kW Rooftop Solar PV Feasibility & Sizing',
    category: 'Solar & Renewable',
    description: 'Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.',
    tags: ['PVSyst', 'Solar PV', 'AutoCAD']
  },
  {
    id: '06',
    title: 'Industrial Motor Control & Protective Schematics',
    category: 'Motor Control',
    description: 'Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.',
    tags: ['PSNA', 'Motor Control', 'AutoCAD']
  },
  {
    id: '07',
    title: 'Automated Sales & Quotation Management Engine',
    category: 'Analytics & Management',
    description: 'Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.',
    tags: ['MS Excel', 'Data Analytics', 'BOQ']
  }
];

export const DEFAULT_EXPERIENCES = [
  {
    role: 'Executive Officer',
    organization: 'Ventech Digital — Sales & Management | Remote',
    period: 'January 2023 – January 2025',
    location: 'Remote',
    points: [
      'Categorized and pre-processed large datasets for operational use.',
      'Prepared production capacity forecasts to support marketing activities.',
      'Developed work plans based on manpower and time requirements.',
      'Managed workflow from order processing through sales completion.',
      'Coordinated with management and teams to maintain efficient supply chain operations.',
      'Prepared management reports on targets, achievements, and operational performance.'
    ],
    tools: ['MS Excel', 'Data Analytics', 'Work Planning', 'Operational Reporting']
  },
  {
    role: 'Internee Engineer',
    organization: 'Dhaka Electric Supply Company Ltd. (DESCO) — Systemic & Commercial Operation Department',
    period: 'February 2023 – March 2023',
    location: 'Uttara (West), Dhaka',
    points: [
      'Supported operation and maintenance activities at 33/11 kV substations.',
      'Observed and assisted with control room operations and load monitoring.',
      'Conducted field visits and reviewed daily operational reports.',
      'Gained practical exposure to power distribution systems and high voltage field operations.'
    ],
    tools: ['Substation Maintenance', 'Switchgear', 'Transformer Inspection', 'Single Line Diagrams']
  }
];

export const DEFAULT_EDUCATIONS = [
  {
    degree: 'Bachelor of Science in Electrical & Electronic Engineering (EEE)',
    institution: 'IUBAT – International University of Business Agriculture and Technology',
    period: '2018 – 2022',
    result: 'Graduate',
    description: 'Comprehensive curriculum in Power Systems Analysis, High Voltage Engineering, Switchgear & Protection, Electrical Machines, Telecommunications, and Control Systems.',
    highlights: ['Senior Engineering Capstone Project', 'Power System Modeling', 'AutoCAD Electrical Certification']
  },
  {
    degree: 'Higher Secondary Certificate (HSC) — Science',
    institution: 'General Mahmudul Hasan Adarsha College, Tangail',
    period: '2015 – 2017',
    result: 'Passed',
    description: 'Focused coursework in Physics, Chemistry, Higher Mathematics, and Basic Computing.',
    highlights: ['Science Club Member', 'Advanced Mathematics']
  },
  {
    degree: 'Secondary School Certificate (SSC) — Science',
    institution: "Bindu Bashini Government Boys' High School, Tangail",
    period: '2013 – 2015',
    result: 'Passed',
    description: 'Strong foundational academics with distinction in Science, General Mathematics, and Physics.',
    highlights: ['Historic High School', 'Academic Distinction']
  }
];

export const DEFAULT_CERTIFICATIONS = [
  {
    title: 'AutoCAD Electrical 2D & SLD Master Certification',
    issuer: 'Engineering Design & CAD Academy',
    year: '2023',
    description: 'Industrial Single Line Diagrams, panel wiring schematics, and substation layout drafting.'
  },
  {
    title: 'Substation Operations & High Voltage Safety Protocols',
    issuer: 'Dhaka Electric Supply Company Ltd. (DESCO)',
    year: '2023',
    description: 'Practical training on 33/11 kV transformer maintenance, circuit breaker operation, and field safety protocols.'
  },
  {
    title: 'GIS Spatial Data Analysis & Utility Network Management',
    issuer: 'Spatial Information Systems Workshop',
    year: '2023',
    description: 'Spatial geodatabases, feeder routing, and utility infrastructure asset mapping with ArcGIS/QGIS.'
  }
];

export const DEFAULT_CONTACT = {
  email: 'ashifur.badhon@gmail.com',
  phone: '+880 1521 417284',
  whatsapp: '+880 1521 417284',
  whatsapp_url: 'https://wa.me/8801521417284',
  linkedin: 'linkedin.com/in/ashifurrahmanbadhon',
  linkedin_url: 'https://www.linkedin.com/in/ashifurrahmanbadhon',
  location: 'Tangail, Dhaka, Bangladesh',
  maps_url: 'https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh'
};
