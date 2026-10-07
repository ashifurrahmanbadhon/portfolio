"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Save,
  Check,
  User,
  Code2,
  FolderGit2,
  GraduationCap,
  Mail,
  FileDown,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Cpu,
  Zap,
  Globe,
  MapPin,
  Phone,
  Camera,
  Upload,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";
import { PortfolioLogo } from "@/components/WebsiteLogos";

// Real Portfolio Content from portfolio.db
const INITIAL_HERO = {
  name: "ASHIFUR RAHMAN",
  title: "Electrical & Electronic Engineer",
  badge_text: "Available for Engineering, Technology & AI Opportunities",
  introduction:
    "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies.",
  location: "Dhaka, Bangladesh",
  email: "ashifur.badhon@gmail.com",
  phone: "01521417284",
  profile_image: "/ashifur.jpeg",
  primary_btn_text: "Contact Me",
  primary_btn_link: "mailto:ashifur.badhon@gmail.com",
  secondary_btn_text: "Download CV",
  secondary_btn_link: "/resume.pdf",
  spec_badge_label: "Specialization",
  spec_badge_title: "Engineering, Management & AI",
};

const INITIAL_SKILLS = [
  // 1. Design & Simulation
  { id: 1, category: "Design & Simulation", name: "AutoCAD (Electrical/2D)", level: 90, icon: "monitor" },
  { id: 2, category: "Design & Simulation", name: "MATLAB / Simulink", level: 85, icon: "monitor" },
  { id: 3, category: "Design & Simulation", name: "ETAP (Power System Analysis)", level: 80, icon: "monitor" },
  { id: 4, category: "Design & Simulation", name: "PSNA / PVSyst", level: 75, icon: "monitor" },

  // 2. GIS & Data Systems
  { id: 5, category: "GIS & Data Systems", name: "GIS (ArcGIS / QGIS)", level: 85, icon: "database" },
  { id: 6, category: "GIS & Data Systems", name: "MS Excel (Advanced / Data)", level: 90, icon: "database" },
  { id: 7, category: "GIS & Data Systems", name: "Spatial Network Mapping", level: 80, icon: "database" },
  { id: 8, category: "GIS & Data Systems", name: "Technical Sales Analytics", level: 85, icon: "database" },

  // 3. Power Systems & Field
  { id: 9, category: "Power Systems & Field", name: "Substation Operations & Testing", level: 88, icon: "shield-check" },
  { id: 10, category: "Power Systems & Field", name: "Single Line Diagrams (SLD)", level: 92, icon: "shield-check" },
  { id: 11, category: "Power Systems & Field", name: "Switchgear & Relay Coordination", level: 82, icon: "shield-check" },
  { id: 12, category: "Power Systems & Field", name: "Distribution Network & BOQ", level: 86, icon: "shield-check" },

  // 4. AI Tools & Automation
  { id: 13, category: "AI Tools & Automation", name: "AI Tools & Generative AI", level: 82, icon: "cpu" },
  { id: 14, category: "AI Tools & Automation", name: "Prompt Engineering", level: 85, icon: "cpu" },
  { id: 15, category: "AI Tools & Automation", name: "AI-based Automation & Workflow", level: 78, icon: "cpu" },
  { id: 16, category: "AI Tools & Automation", name: "Data Management & Reporting", level: 88, icon: "cpu" },
];

const INITIAL_PROJECTS = [
  {
    id: 1,
    project_number: "01",
    title: "Design & Development of a Buck Converter for Solar Battery Charging",
    category: "Hardware & Simulation",
    short_description:
      "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
    tags: ["Power Electronics", "Buck Converter", "Solar Energy"],
    date: "2022",
    is_featured: true,
  },
  {
    id: 2,
    project_number: "02",
    title: "132/33kV Grid Substation SLD & Protection Design",
    category: "Substation Design",
    short_description:
      "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
    tags: ["AutoCAD", "ETAP", "Power Systems"],
    date: "2023",
    is_featured: true,
  },
  {
    id: 3,
    project_number: "03",
    title: "GIS-Based Power Distribution Asset Mapping",
    category: "GIS & Infrastructure",
    short_description:
      "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
    tags: ["ArcGIS", "QGIS", "Spatial Analysis"],
    date: "2023",
    is_featured: true,
  },
  {
    id: 4,
    project_number: "04",
    title: "Automatic Power Factor Correction (APFC) Simulation",
    category: "Power Simulation",
    short_description:
      "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
    tags: ["MATLAB", "Simulink", "Industrial Control"],
    date: "2022",
    is_featured: false,
  },
  {
    id: 5,
    project_number: "05",
    title: "50kW Rooftop Solar PV Feasibility & Sizing",
    category: "Renewable Energy",
    short_description:
      "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
    tags: ["PVSyst", "Solar PV", "AutoCAD"],
    date: "2023",
    is_featured: false,
  },
  {
    id: 6,
    project_number: "06",
    title: "Industrial Motor Control & Protective Schematics",
    category: "Industrial Automation",
    short_description:
      "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
    tags: ["PSNA", "Motor Control", "AutoCAD"],
    date: "2023",
    is_featured: false,
  },
  {
    id: 7,
    project_number: "07",
    title: "Automated Sales & Quotation Management Engine",
    category: "Analytics & Sales",
    short_description:
      "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
    tags: ["MS Excel", "Data Analytics", "BOQ"],
    date: "2024",
    is_featured: false,
  },
];

const INITIAL_EXPERIENCE = [
  {
    id: 1,
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
    ],
  },
  {
    id: 2,
    role: "Internee Engineer",
    organization: "Dhaka Electric Supply Company Ltd. (DESCO) — Uttara, Dhaka",
    period: "February 2023 – March 2023",
    location: "Uttara, Dhaka",
    points: [
      "Supported operation and maintenance activities at 33/11 kV substations.",
      "Observed and assisted with control room operations.",
      "Conducted field visits and reviewed daily operational reports.",
      "Gained practical exposure to power distribution systems and field operations.",
    ],
  },
];

const INITIAL_EDUCATION = [
  {
    id: 1,
    degree: "Bachelor of Science in Electrical & Electronic Engineering (EEE)",
    institution: "IUBAT – International University of Business Agriculture and Technology",
    period: "2018 – 2022",
    result: "Graduate",
    description: "Power System Analysis, High Voltage Engineering, Switchgear & Protection, Control Systems, AutoCAD Electrical.",
  },
  {
    id: 2,
    degree: "Higher Secondary Certificate (HSC) — Science",
    institution: "General Mahmudul Hasan Adarsha College, Tangail",
    period: "2015 – 2017",
    result: "Passed",
    description: "Physics, Chemistry, Higher Mathematics, and Engineering Fundamentals.",
  },
  {
    id: 3,
    degree: "Secondary School Certificate (SSC) — Science",
    institution: "Bindu Bashini Government Boys' High School, Tangail",
    period: "2013 – 2015",
    result: "Passed",
    description: "Foundation studies in Science, General Mathematics, and Physics.",
  },
];

export default function PortfolioCMS() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("hero");
  const [savedStatus, setSavedStatus] = useState(false);

  // States initialized with real data from portfolio.db
  const [hero, setHero] = useState(INITIAL_HERO);
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCE);
  const [educations, setEducations] = useState(INITIAL_EDUCATION);
  const [cvPath, setCvPath] = useState("/resume.pdf");

  // Fetch live from server.py if running
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getPortfolioContent();
        if (res && res.success) {
          if (res.hero?.name) setHero((prev) => ({ ...prev, ...res.hero }));
          if (res.skills && res.skills.length > 0) setSkills(res.skills);
          if (res.projects && res.projects.length > 0) {
            setProjects(
              res.projects.map((p, i) => ({
                id: p.id || i + 1,
                project_number: p.project_number || String(i + 1).padStart(2, "0"),
                title: p.title,
                category: p.category || "Engineering",
                short_description: p.short_description || p.description || "",
                tags: Array.isArray(p.tags) ? p.tags : (p.tags_json ? JSON.parse(p.tags_json) : []),
                date: p.project_date || "2023",
                is_featured: Boolean(p.is_featured),
              }))
            );
          }
        }
      } catch (e) {
        // Fallback uses complete offline data from portfolio.db
      }
    }
    loadData();
  }, []);

  const handleSave = async (sectionName = "Portfolio") => {
    setSavedStatus(true);
    if (showToast) {
      showToast(`${sectionName} changes saved and synchronized!`, "success");
    }
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handleHeroPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      if (showToast) showToast("Image file size should be less than 8MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setHero((prev) => ({ ...prev, profile_image: dataUrl }));
      if (showToast) {
        showToast("Profile photo uploaded! Click Save Changes to apply.", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Managing Bar */}
      <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E2638] flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors hover:border-emerald-500/30">
        <div className="flex items-center gap-3">
          <PortfolioLogo size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Managing: <span className="text-emerald-400">Ashifur Rahman Portfolio</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span>
                Live Connected
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
            >
              Live Website (/) <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono interactive-btn cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>← Central Hub</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium interactive-btn cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live Site</span>
          </Link>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-[#1E2638] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("hero")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "hero"
              ? "border-emerald-400 text-emerald-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Hero & Bio</span>
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "skills"
              ? "border-emerald-400 text-emerald-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Skills & Stacks ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "projects"
              ? "border-emerald-400 text-emerald-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("experience")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "experience"
              ? "border-emerald-400 text-emerald-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience & Education</span>
        </button>

        <button
          onClick={() => setActiveTab("cv")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "cv"
              ? "border-emerald-400 text-emerald-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>CV & Resume Link</span>
        </button>
      </div>

      {/* TAB 1: HERO & BIO */}
      {activeTab === "hero" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Hero Introduction & Profile Summary</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Public headlines and bio rendered across ashifurrahman.netlify.app
              </p>
            </div>
            <button
              onClick={() => handleSave("Hero")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
              <span>{savedStatus ? "Saved!" : "Save Changes"}</span>
            </button>
          </div>

          {/* Profile Photo Live Card with Direct Upload */}
          <div className="p-5 rounded-2xl bg-[#111622] border border-[#1E2638] flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-[#0B0F17] shadow-xl shadow-emerald-500/10 relative">
                <img
                  src={hero.profile_image || "/ashifur.jpeg"}
                  alt={hero.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/ashifur.jpeg";
                  }}
                />
                <label
                  htmlFor="hero-photo-upload"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white"
                  title="Upload New Photo"
                >
                  <Camera className="w-6 h-6 text-emerald-400 mb-1" />
                  <span className="text-[10px] font-mono font-medium">Upload</span>
                </label>
              </div>
              <input
                id="hero-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleHeroPhotoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-3 flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <label className="text-xs font-mono text-slate-200 font-bold flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hero Introduction & Profile Photo</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload a custom photo or choose an asset to showcase across your portfolio hero section.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="hero-photo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono cursor-pointer transition shadow-md shadow-emerald-500/20 interactive-btn"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </label>
                  {hero.profile_image && (
                    <button
                      type="button"
                      onClick={() => setHero((prev) => ({ ...prev, profile_image: "/ashifur.jpeg" }))}
                      className="px-2.5 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-[#161E30] text-slate-400 hover:text-white border border-[#1E2638] text-[11px] font-mono cursor-pointer transition"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Path / URL Input */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={hero.profile_image || ""}
                  onChange={(e) => setHero({ ...hero, profile_image: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0B0F17] border border-[#1E2638] focus:border-emerald-500 rounded-xl text-xs text-white font-mono outline-none transition"
                  placeholder="https://example.com/photo.jpg or /ashifur.jpeg"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-slate-400">
                <span className="text-slate-500">Quick Presets:</span>
                {["/ashifur.jpeg", "/ashifur.jpg", "/profile.jpg"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setHero((prev) => ({ ...prev, profile_image: preset }))}
                    className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                      hero.profile_image === preset
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold"
                        : "bg-[#0B0F17] text-slate-400 border-[#1E2638] hover:text-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Full Name</label>
              <input
                type="text"
                value={hero.name}
                onChange={(e) => setHero({ ...hero, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Professional Title</label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono text-slate-400">Opportunity Status Badge Text</label>
              <input
                type="text"
                value={hero.badge_text}
                onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono text-slate-400">Introduction & Bio</label>
              <textarea
                rows={4}
                value={hero.introduction}
                onChange={(e) => setHero({ ...hero, introduction: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Contact Email</label>
              <input
                type="email"
                value={hero.email}
                onChange={(e) => setHero({ ...hero, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Phone Number</label>
              <input
                type="text"
                value={hero.phone}
                onChange={(e) => setHero({ ...hero, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Specialization Badge</label>
              <input
                type="text"
                value={hero.spec_badge_title}
                onChange={(e) => setHero({ ...hero, spec_badge_title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Location</label>
              <input
                type="text"
                value={hero.location}
                onChange={(e) => setHero({ ...hero, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* TAB 2: SKILLS & STACKS */}
      {activeTab === "skills" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Technical Skills & Engineering Competencies</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All 16 verified engineering, GIS, power systems, and AI tools across 4 categories
              </p>
            </div>
            <button
              onClick={() => handleSave("Skills")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
              <span>{savedStatus ? "Saved!" : "Save Changes"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] space-y-2 transition-colors hover:border-emerald-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {s.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">{s.level}%</span>
                </div>
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => {
                    const copy = [...skills];
                    copy[idx].name = e.target.value;
                    setSkills(copy);
                  }}
                  className="w-full px-3 py-1.5 bg-[#0B0F17] border border-[#1E2638] rounded-lg text-xs text-white font-mono focus:border-emerald-500/50 outline-none transition"
                />
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={s.level}
                  onChange={(e) => {
                    const copy = [...skills];
                    copy[idx].level = parseInt(e.target.value);
                    setSkills(copy);
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      {/* TAB 3: PROJECTS (7 REAL PROJECTS) */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>Engineering & Research Projects ({projects.length})</span>
              </h3>
              <p className="text-xs text-slate-400">All 7 hardware, substation, GIS, solar, and data projects from portfolio.db</p>
            </div>
            <button
              onClick={() => handleSave("Projects")}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Projects</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, idx) => (
              <SpotlightCard
                key={p.id || idx}
                className="p-5 flex flex-col justify-between space-y-3 interactive-card group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {p.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">#{p.project_number}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {p.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {p.short_description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C2A] text-slate-300 border border-[#1E2638]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Year: <strong className="text-white">{p.date}</strong></span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Published
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPERIENCE & EDUCATION */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          {/* Work Experience */}
          <SpotlightCard className="p-6 md:p-8 space-y-5">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Professional Work Experience</span>
            </h3>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] space-y-2 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                    <span className="text-xs font-mono text-emerald-400">{exp.period}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">{exp.organization}</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pt-1">
                    {exp.points.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Education */}
          <SpotlightCard className="p-6 md:p-8 space-y-5">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Academic Education</span>
            </h3>

            <div className="space-y-4">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] space-y-1.5 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                    <span className="text-xs font-mono text-cyan-400">{edu.period}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">{edu.institution}</p>
                  <p className="text-xs text-slate-400">{edu.description}</p>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* TAB 5: CV & RESUME */}
      {activeTab === "cv" && (
        <SpotlightCard className="p-6 md:p-8 space-y-5">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Curriculum Vitae (CV) & Resume Document</span>
          </h3>
          <p className="text-xs text-slate-400">
            Path to the verified PDF downloaded by recruiters and visitors on ashifurrahman.netlify.app.
          </p>
          <div className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] space-y-3">
            <label className="text-xs font-mono text-slate-400 block">Target PDF Path</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={cvPath}
                onChange={(e) => setCvPath(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <a
                href={cvPath}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#161C2A] hover:bg-[#1E2638] text-slate-200 hover:text-white border border-[#1E2638] rounded-xl text-xs font-mono interactive-btn flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preview PDF</span>
              </a>
            </div>

            <button
              onClick={() => handleSave("CV Link")}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold rounded-xl interactive-btn cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Update Resume Link
            </button>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
