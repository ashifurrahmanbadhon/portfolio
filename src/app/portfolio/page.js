"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  MessageSquare,
  Clock,
  Layers,
  Home,
  CheckCircle2,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";
import { PortfolioLogo } from "@/components/WebsiteLogos";

// Resilient default fallbacks matching portfolio.db
const INITIAL_HERO = {
  name: "ASHIFUR RAHMAN",
  title: "Electrical & Electronic Engineer",
  badge_text: "Available for Engineering, Technology & AI Opportunities",
  introduction:
    "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies.",
  profile_image: "/ashifur.jpeg",
  primary_btn_text: "Contact Me",
  primary_btn_link: "/contact",
  secondary_btn_text: "Download CV",
  secondary_btn_link: "/resume.pdf",
  spec_badge_label: "Specialization",
  spec_badge_title: "Engineering, Management & AI",
};

const INITIAL_ABOUT = {
  subtitle: "About Ashifur",
  title: "Engineering Reliability, Efficiency & Innovation",
  description1:
    "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.",
  description2:
    "Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.",
  focus1_title: "Substation Engineering & SLDs",
  focus1_text: "High voltage equipment, switchgear, and single line diagrams.",
  focus2_title: "GIS & Spatial Utility Systems",
  focus2_text: "Mapping 11kV/0.4kV feeders, asset tracking, and spatial analysis.",
};

const INITIAL_HIGHLIGHTS = [
  { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree" },
  { metric_value: "15+", metric_label: "CAD & Power Projects", metric_subtext: "SLDs, GIS Maps & Simulations" },
  { metric_value: "100%", metric_label: "Safety & Compliance Focus", metric_subtext: "Standard Operating Protocols" },
  { metric_value: "6+", metric_label: "Core Software Tools", metric_subtext: "AutoCAD, ETAP, MATLAB, GIS" },
];

const INITIAL_SKILLS = [
  { id: 1, category: "Design & Simulation", name: "AutoCAD (Electrical/2D)", level: 90, icon: "monitor" },
  { id: 2, category: "Design & Simulation", name: "MATLAB / Simulink", level: 85, icon: "monitor" },
  { id: 3, category: "Design & Simulation", name: "ETAP (Power System Analysis)", level: 80, icon: "monitor" },
  { id: 4, category: "Design & Simulation", name: "PSNA / PVSyst", level: 75, icon: "monitor" },
  { id: 5, category: "GIS & Data Systems", name: "GIS (ArcGIS / QGIS)", level: 85, icon: "database" },
  { id: 6, category: "GIS & Data Systems", name: "MS Excel (Advanced / Data)", level: 90, icon: "database" },
  { id: 7, category: "GIS & Data Systems", name: "Spatial Network Mapping", level: 80, icon: "database" },
  { id: 8, category: "GIS & Data Systems", name: "Technical Sales Analytics", level: 85, icon: "database" },
  { id: 9, category: "Power Systems & Field", name: "Substation Operations & Testing", level: 88, icon: "shield" },
  { id: 10, category: "Power Systems & Field", name: "Single Line Diagrams (SLD)", level: 92, icon: "shield" },
  { id: 11, category: "Power Systems & Field", name: "Switchgear & Relay Coordination", level: 82, icon: "shield" },
  { id: 12, category: "Power Systems & Field", name: "Distribution Network & BOQ", level: 86, icon: "shield" },
];

const INITIAL_PROJECTS = [
  {
    id: 1,
    project_number: "01",
    title: "Design & Development of a Buck Converter for Solar Battery Charging",
    category: "Power Electronics",
    short_description:
      "Designed and developed a DC-DC buck converter for regulated battery charging from a solar power system, focusing on voltage conversion, circuit design, power efficiency, and renewable energy integration.",
    tags: ["Power Electronics", "Buck Converter", "Solar Energy"],
    project_date: "2022",
    is_featured: true,
    is_published: true,
  },
  {
    id: 2,
    project_number: "02",
    title: "132/33kV Grid Substation SLD & Protection Design",
    category: "Substation Design",
    short_description:
      "Engineered comprehensive Single Line Diagrams, busbar configurations, transformer protection schemes, and overcurrent relay coordination in AutoCAD.",
    tags: ["AutoCAD", "ETAP", "Power Systems"],
    project_date: "2023",
    is_featured: true,
    is_published: true,
  },
  {
    id: 3,
    project_number: "03",
    title: "GIS-Based Power Distribution Asset Mapping",
    category: "GIS & Infrastructure",
    short_description:
      "Spatial mapping of 11kV/0.4kV distribution feeders, pole infrastructure, transformers, and load points with GIS geodatabases for outage tracking.",
    tags: ["ArcGIS", "QGIS", "Spatial Analysis"],
    project_date: "2023",
    is_featured: true,
    is_published: true,
  },
  {
    id: 4,
    project_number: "04",
    title: "Automatic Power Factor Correction (APFC) Simulation",
    category: "Control & Simulation",
    short_description:
      "Designed an intelligent reactive power compensation model in MATLAB/Simulink to maintain power factor above 0.95 under variable inductive industrial loads.",
    tags: ["MATLAB", "Simulink", "Industrial Control"],
    project_date: "2022",
    is_featured: false,
    is_published: true,
  },
  {
    id: 5,
    project_number: "05",
    title: "50kW Rooftop Solar PV Feasibility & Sizing",
    category: "Solar & Renewable",
    short_description:
      "Conducted solar irradiance modeling, inverter sizing, shadow analysis, string sizing, and cost-benefit ROI analysis with PVSyst and AutoCAD.",
    tags: ["PVSyst", "Solar PV", "AutoCAD"],
    project_date: "2023",
    is_featured: false,
    is_published: true,
  },
  {
    id: 6,
    project_number: "06",
    title: "Industrial Motor Control & Protective Schematics",
    category: "Motor Control",
    short_description:
      "Designed star-delta starting schematics, safety interlocks, overload relay calculations, and automated motor control sequences.",
    tags: ["PSNA", "Motor Control", "AutoCAD"],
    project_date: "2023",
    is_featured: false,
    is_published: true,
  },
  {
    id: 7,
    project_number: "07",
    title: "Automated Sales & Quotation Management Engine",
    category: "Analytics & Management",
    short_description:
      "Developed an automated MS Excel dashboard with dynamic pricing models, bill of quantities (BOQ) generators, and margin analysis.",
    tags: ["MS Excel", "Data Analytics", "BOQ"],
    project_date: "2024",
    is_featured: true,
    is_published: true,
  },
];

const INITIAL_EXPERIENCE = [
  {
    id: 1,
    role: "Executive Officer",
    organization: "Ventech Digital — Sales & Management | Remote",
    period: "January 2023 – January 2025",
    location: "Remote",
    description_points: [
      "Categorized and pre-processed large datasets for operational use.",
      "Prepared production capacity forecasts to support marketing activities.",
      "Developed work plans based on manpower and time requirements.",
      "Managed workflow from order processing through sales completion.",
      "Coordinated with management and teams to maintain efficient supply chain operations.",
      "Prepared management reports on targets, achievements, and operational performance.",
    ],
  },
  {
    id: 2,
    role: "Internee Engineer",
    organization: "Dhaka Electric Supply Company Ltd. (DESCO) — Uttara, Dhaka",
    period: "February 2023 – March 2023",
    location: "Uttara, Dhaka",
    description_points: [
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
    start_year: "2018",
    end_year: "2022",
    result: "Graduate",
    badge_text: "Graduate",
    description: "Power System Analysis, High Voltage Engineering, Switchgear & Protection, Control Systems, AutoCAD Electrical.",
  },
  {
    id: 2,
    degree: "Higher Secondary Certificate (HSC) — Science",
    institution: "General Mahmudul Hasan Adarsha College, Tangail",
    start_year: "2015",
    end_year: "2017",
    result: "Passed",
    badge_text: "Passed",
    description: "Physics, Chemistry, Higher Mathematics, and Engineering Fundamentals.",
  },
  {
    id: 3,
    degree: "Secondary School Certificate (SSC) — Science",
    institution: "Bindu Bashini Government Boys' High School, Tangail",
    start_year: "2013",
    end_year: "2015",
    result: "Passed",
    badge_text: "Passed",
    description: "Foundation studies in Science, General Mathematics, and Physics.",
  },
];

const INITIAL_CONTACT = {
  email: "ashifur.badhon@gmail.com",
  phone: "+880 1521 417284",
  whatsapp: "+8801521417284",
  linkedin: "https://www.linkedin.com/in/ashifurrahmanbadhon",
  location: "Tangail, Dhaka, Bangladesh",
  maps_url: "https://maps.google.com/?q=Tangail,+Dhaka,+Bangladesh",
};

function PortfolioCMSContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "home";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  // States
  const [hero, setHero] = useState(INITIAL_HERO);
  const [about, setAbout] = useState(INITIAL_ABOUT);
  const [highlights, setHighlights] = useState(INITIAL_HIGHLIGHTS);
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCE);
  const [educations, setEducations] = useState(INITIAL_EDUCATION);
  const [contact, setContact] = useState(INITIAL_CONTACT);
  const [cvPath, setCvPath] = useState("/resume.pdf");
  const [messages, setMessages] = useState([]);

  // Fetch live from database
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getPortfolioContent();
        if (res && res.success) {
          if (res.hero?.name) setHero((prev) => ({ ...prev, ...res.hero }));
          if (res.about?.title) setAbout((prev) => ({ ...prev, ...res.about }));
          if (Array.isArray(res.highlights) && res.highlights.length > 0) {
            setHighlights(res.highlights);
          }
          if (Array.isArray(res.skills) && res.skills.length > 0) {
            setSkills(res.skills);
          }
          if (Array.isArray(res.projects) && res.projects.length > 0) {
            setProjects(
              res.projects.map((p, i) => ({
                id: p.id || i + 1,
                project_number: p.project_number || String(i + 1).padStart(2, "0"),
                title: p.title,
                category: p.category || "Engineering",
                short_description: p.short_description || p.description || "",
                full_description: p.full_description || "",
                tags: Array.isArray(p.tags) ? p.tags : (p.tags_json ? JSON.parse(p.tags_json) : []),
                project_date: p.project_date || "2023",
                is_featured: Boolean(p.is_featured),
                is_published: p.is_published !== undefined ? Boolean(p.is_published) : true,
              }))
            );
          }
          if (Array.isArray(res.experiences) && res.experiences.length > 0) {
            setExperiences(
              res.experiences.map((e, i) => ({
                id: e.id || i + 1,
                role: e.role,
                organization: e.organization,
                period: e.period,
                location: e.location || "",
                description_points: Array.isArray(e.description_points)
                  ? e.description_points
                  : (e.description_points ? JSON.parse(e.description_points) : []),
              }))
            );
          }
          if (Array.isArray(res.educations) && res.educations.length > 0) {
            setEducations(res.educations);
          }
          if (res.social_links && res.social_links.email) {
            setContact((prev) => ({ ...prev, ...res.social_links }));
          }
          if (res.resume && res.resume.file_url) {
            setCvPath(res.resume.file_url);
          }
        }
      } catch (e) {
        console.warn("Using offline portfolio snapshot:", e);
      }
    }
    loadData();
  }, []);

  // Fetch messages if contact tab is selected
  useEffect(() => {
    if (activeTab === "contact") {
      api.getContactMessages()
        .then((res) => {
          if (res && res.success && Array.isArray(res.messages)) {
            setMessages(res.messages);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const handleSave = async (sectionKey) => {
    setSaving(true);
    try {
      if (sectionKey === "home") {
        await api.savePortfolioSection("hero", hero);
        await api.savePortfolioSection("highlights", { items: highlights });
      } else if (sectionKey === "about") {
        await api.savePortfolioSection("about", about);
      } else if (sectionKey === "experience") {
        await api.savePortfolioSection("experiences", { items: experiences });
      } else if (sectionKey === "projects") {
        await api.savePortfolioSection("projects", { items: projects });
      } else if (sectionKey === "skills") {
        await api.savePortfolioSection("skills", { items: skills });
      } else if (sectionKey === "education") {
        await api.savePortfolioSection("educations", { items: educations });
      } else if (sectionKey === "contact") {
        await api.savePortfolioSection("social", contact);
      } else if (sectionKey === "cv") {
        await api.savePortfolioSection("resume", { file_url: cvPath, file_name: "Ashifur_Rahman_CV.pdf" });
      }

      setSavedStatus(true);
      if (showToast) {
        showToast(`${sectionKey.toUpperCase()} page changes saved to database!`, "success");
      }
      setTimeout(() => setSavedStatus(false), 2500);
    } catch (err) {
      if (showToast) {
        showToast(`Failed to save: ${err.message}`, "error");
      }
    } finally {
      setSaving(false);
    }
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
        showToast("Profile photo uploaded! Click Save to apply.", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Nav tabs matching all individual website pages
  const tabs = [
    { id: "home", label: "Home Page (/)", icon: Home, count: null },
    { id: "about", label: "About Page (/about)", icon: User, count: null },
    { id: "experience", label: "Experience (/experience)", icon: Briefcase, count: experiences.length },
    { id: "projects", label: "Projects (/projects)", icon: FolderGit2, count: projects.length },
    { id: "skills", label: "Skills (/skills)", icon: Code2, count: skills.length },
    { id: "education", label: "Education (/education)", icon: GraduationCap, count: educations.length },
    { id: "contact", label: "Contact (/contact)", icon: Mail, count: messages.length ? `${messages.length} msgs` : null },
    { id: "cv", label: "CV & Resume (/resume)", icon: FileDown, count: null },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Managing Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:border-emerald-500/30">
        <div className="flex items-center gap-3">
          <PortfolioLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Website CMS: <span className="text-emerald-400">Ashifur Rahman Portfolio</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span>
                Database Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Edit any page's content instantly without editing code. All changes update the website in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono interactive-btn cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>← Central Hub</span>
          </Link>
          <Link
            href={activeTab === "home" ? "/" : `/${activeTab}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium interactive-btn cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View /{activeTab === "home" ? "" : activeTab}</span>
          </Link>
        </div>
      </div>

      {/* INDIVIDUAL PAGE TABS BAR */}
      <div className="flex border-b border-[#1E2638] gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3.5 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
                isActive
                  ? "border-emerald-400 text-emerald-300 font-bold bg-emerald-500/5 rounded-t-lg"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161E30] text-slate-400 border border-[#1E2638]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOME PAGE CMS */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Home Page CMS (/) — Hero &amp; Highlights</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the main entrance headlines, hero card, intro, and key metric counters.
              </p>
            </div>
            <button
              onClick={() => handleSave("home")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
              <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Home Page"}</span>
            </button>
          </div>

          {/* Profile Photo Live Card */}
          <div className="p-5 rounded-2xl bg-[#111622] border border-[#1E2638] flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-[#0B0F17] shadow-xl relative">
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
                  <span className="text-[10px] font-mono">Upload</span>
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
                    <span>Hero Profile Photo</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload a custom portrait or enter a public image URL.
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
                </div>
              </div>

              <input
                type="text"
                value={hero.profile_image || ""}
                onChange={(e) => setHero({ ...hero, profile_image: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#0B0F17] border border-[#1E2638] focus:border-emerald-500 rounded-xl text-xs text-white font-mono outline-none transition"
                placeholder="/ashifur.jpeg or https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Hero Content Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Full Display Name
              </label>
              <input
                type="text"
                value={hero.name}
                onChange={(e) => setHero({ ...hero, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Professional Title / Role
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Opportunity / Availability Badge
              </label>
              <input
                type="text"
                value={hero.badge_text}
                onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Hero Introduction Narrative
              </label>
              <textarea
                rows={3}
                value={hero.introduction}
                onChange={(e) => setHero({ ...hero, introduction: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Primary Button Label &amp; Link
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={hero.primary_btn_text}
                  onChange={(e) => setHero({ ...hero, primary_btn_text: e.target.value })}
                  placeholder="Text"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  value={hero.primary_btn_link}
                  onChange={(e) => setHero({ ...hero, primary_btn_link: e.target.value })}
                  placeholder="Link (/contact)"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Secondary Button Label &amp; Link
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={hero.secondary_btn_text}
                  onChange={(e) => setHero({ ...hero, secondary_btn_text: e.target.value })}
                  placeholder="Text"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  value={hero.secondary_btn_link}
                  onChange={(e) => setHero({ ...hero, secondary_btn_link: e.target.value })}
                  placeholder="Link (/resume.pdf)"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Highlights / Metric Counters Editor */}
          <div className="pt-6 border-t border-[#1E2638] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Highlight Metrics Bar (4 Metric Slots)
                </h4>
                <p className="text-[11px] text-slate-400">Counters displayed across the top of the homepage and about page.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((h, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E2638] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400">Metric #{idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={h.metric_value}
                    onChange={(e) => {
                      const updated = [...highlights];
                      updated[idx].metric_value = e.target.value;
                      setHighlights(updated);
                    }}
                    placeholder="e.g. 15+"
                    className="w-full px-2.5 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-xs font-mono font-bold text-[#10B981] outline-none"
                  />
                  <input
                    type="text"
                    value={h.metric_label}
                    onChange={(e) => {
                      const updated = [...highlights];
                      updated[idx].metric_label = e.target.value;
                      setHighlights(updated);
                    }}
                    placeholder="Label"
                    className="w-full px-2.5 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-xs font-mono text-white outline-none"
                  />
                  <input
                    type="text"
                    value={h.metric_subtext}
                    onChange={(e) => {
                      const updated = [...highlights];
                      updated[idx].metric_subtext = e.target.value;
                      setHighlights(updated);
                    }}
                    placeholder="Subtext"
                    className="w-full px-2.5 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-[11px] font-mono text-slate-400 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ABOUT PAGE CMS */}
      {/* ========================================================================= */}
      {activeTab === "about" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>About Page CMS (/about)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the full biography narrative, engineering focus pillars, and career mission.
              </p>
            </div>
            <button
              onClick={() => handleSave("about")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
              <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save About Page"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Page Subtitle Badge
              </label>
              <input
                type="text"
                value={about.subtitle || ""}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Main Headline Title
              </label>
              <input
                type="text"
                value={about.title || ""}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Biography Narrative — Paragraph 1
              </label>
              <textarea
                rows={4}
                value={about.description1 || ""}
                onChange={(e) => setAbout({ ...about, description1: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Biography Narrative — Paragraph 2 (AI Vision &amp; Goals)
              </label>
              <textarea
                rows={4}
                value={about.description2 || ""}
                onChange={(e) => setAbout({ ...about, description2: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Focus Area 1 (Title &amp; Subtitle)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={about.focus1_title || ""}
                  onChange={(e) => setAbout({ ...about, focus1_title: e.target.value })}
                  placeholder="Focus Title"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  value={about.focus1_text || ""}
                  onChange={(e) => setAbout({ ...about, focus1_text: e.target.value })}
                  placeholder="Focus Subtext"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Focus Area 2 (Title &amp; Subtitle)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={about.focus2_title || ""}
                  onChange={(e) => setAbout({ ...about, focus2_title: e.target.value })}
                  placeholder="Focus Title"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  value={about.focus2_text || ""}
                  onChange={(e) => setAbout({ ...about, focus2_text: e.target.value })}
                  placeholder="Focus Subtext"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXPERIENCE PAGE CMS */}
      {/* ========================================================================= */}
      {activeTab === "experience" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Experience Page CMS (/experience)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, or reorder career positions, responsibilities, and industrial organizations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setExperiences([
                    ...experiences,
                    {
                      id: Date.now(),
                      role: "New Engineering Role",
                      organization: "Company Name | Location",
                      period: "2024 – Present",
                      location: "Dhaka, Bangladesh",
                      description_points: ["Key achievement or engineering task."],
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#111622] hover:bg-[#161E30] text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono interactive-btn cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
              <button
                onClick={() => handleSave("experience")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
                <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Experiences"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {experiences.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] space-y-4 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Position #{idx + 1}</span>
                  <button
                    onClick={() => {
                      setExperiences(experiences.filter((_, i) => i !== idx));
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Delete Position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].role = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={exp.organization}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].organization = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Tenure Period</label>
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].period = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Responsibilities &amp; Achievements (One bullet point per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(exp.description_points || []).join("\n")}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].description_points = e.target.value.split("\n").filter((p) => p.trim() !== "");
                      setExperiences(updated);
                    }}
                    className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROJECTS PAGE CMS */}
      {/* ========================================================================= */}
      {activeTab === "projects" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>Projects Page CMS (/projects)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, update, or publish engineering case studies, CAD schematics, and simulation models.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newNum = String(projects.length + 1).padStart(2, "0");
                  setProjects([
                    ...projects,
                    {
                      id: Date.now(),
                      project_number: newNum,
                      title: "New Engineering Project",
                      category: "Power Systems",
                      short_description: "Detailed description of engineering methodology and results.",
                      tags: ["AutoCAD", "Simulation"],
                      project_date: "2024",
                      is_featured: false,
                      is_published: true,
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#111622] hover:bg-[#161E30] text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono interactive-btn cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
              <button
                onClick={() => handleSave("projects")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
                <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Projects"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {projects.map((proj, idx) => (
              <div
                key={proj.id || idx}
                className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] space-y-4 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      PROJECT #{proj.project_number || String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({proj.category})</span>
                  </div>
                  <button
                    onClick={() => {
                      setProjects(projects.filter((_, i) => i !== idx));
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].title = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Category / Domain</label>
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].category = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Case Study Summary</label>
                  <textarea
                    rows={2}
                    value={proj.short_description || ""}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[idx].short_description = e.target.value;
                      setProjects(updated);
                    }}
                    className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Technical Tags (Comma separated: e.g. AutoCAD, ETAP, Power Systems)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(proj.tags) ? proj.tags.join(", ") : ""}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[idx].tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                      setProjects(updated);
                    }}
                    className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SKILLS PAGE CMS */}
      {/* ========================================================================= */}
      {activeTab === "skills" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Skills Page CMS (/skills)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage technical competencies, software tool meters, and proficiency percentages.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSkills([
                    ...skills,
                    {
                      id: Date.now(),
                      category: "Design & Simulation",
                      name: "New Technical Skill",
                      level: 80,
                      icon: "monitor",
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#111622] hover:bg-[#161E30] text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono interactive-btn cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
              <button
                onClick={() => handleSave("skills")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
                <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Skills"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E2638] space-y-3 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={s.category}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[idx].category = e.target.value;
                      setSkills(updated);
                    }}
                    placeholder="Category"
                    className="px-2 py-0.5 bg-[#111622] border border-[#1E2638] rounded text-[10px] font-mono text-emerald-400 outline-none w-36"
                  />
                  <button
                    onClick={() => {
                      setSkills(skills.filter((_, i) => i !== idx));
                    }}
                    className="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[idx].name = e.target.value;
                      setSkills(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-[#111622] border border-[#1E2638] rounded-lg text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Proficiency Meter</span>
                    <span className="text-emerald-400 font-bold">{s.level}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={s.level}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[idx].level = Number(e.target.value);
                      setSkills(updated);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: EDUCATION PAGE CMS */}
      {/* ========================================================================= */}
      {activeTab === "education" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Education Page CMS (/education)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage university degree qualifications, accredited institutions, and coursework details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEducations([
                    ...educations,
                    {
                      id: Date.now(),
                      degree: "New Degree or Qualification",
                      institution: "University / Institution",
                      start_year: "2020",
                      end_year: "2024",
                      result: "Graduate",
                      description: "Key engineering coursework and modules.",
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#111622] hover:bg-[#161E30] text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono interactive-btn cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Credential</span>
              </button>
              <button
                onClick={() => handleSave("education")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
                <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Education"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {educations.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] space-y-4 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Credential #{idx + 1}</span>
                  <button
                    onClick={() => {
                      setEducations(educations.filter((_, i) => i !== idx));
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Delete Credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Degree Title</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].degree = e.target.value;
                        setEducations(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">University / College</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].institution = e.target.value;
                        setEducations(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Start &amp; End Year</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.start_year || ""}
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[idx].start_year = e.target.value;
                          setEducations(updated);
                        }}
                        placeholder="Start (2018)"
                        className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={edu.end_year || ""}
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[idx].end_year = e.target.value;
                          setEducations(updated);
                        }}
                        placeholder="End (2022)"
                        className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Result Status</label>
                    <input
                      type="text"
                      value={edu.result || ""}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].result = e.target.value;
                        setEducations(updated);
                      }}
                      placeholder="Graduate / CGPA"
                      className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Coursework Description</label>
                  <textarea
                    rows={2}
                    value={edu.description || ""}
                    onChange={(e) => {
                      const updated = [...educations];
                      updated[idx].description = e.target.value;
                      setEducations(updated);
                    }}
                    className="w-full px-3 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CONTACT PAGE CMS & INBOX */}
      {/* ========================================================================= */}
      {activeTab === "contact" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Contact Page CMS (/contact) &amp; Visitor Inbox</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update communication channels and review messages submitted through the website form.
              </p>
            </div>
            <button
              onClick={() => handleSave("contact")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
              <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Contact Info"}</span>
            </button>
          </div>

          {/* Contact Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Direct Email Address
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Phone Number
              </label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                value={contact.whatsapp}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                value={contact.linkedin}
                onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Location (City, District, Country)
              </label>
              <input
                type="text"
                value={contact.location}
                onChange={(e) => setContact({ ...contact, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Visitor Messages Inbox */}
          <div className="pt-6 border-t border-[#1E2638] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Visitor Messages Inbox ({messages.length})</span>
                </h4>
                <p className="text-[11px] text-slate-400">Direct inquiries received through the `/contact` webpage form.</p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0B0F17] border border-[#1E2638] text-center text-xs text-slate-400 font-mono">
                No visitor inquiries recorded yet. Any message sent from `/contact` will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E2638] space-y-2 hover:border-emerald-500/30 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{msg.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">&lt;{msg.email}&gt;</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-400 font-mono">
                      Subject: {msg.subject}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#111622] p-3 rounded-lg border border-[#1E2638]/50">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SpotlightCard>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: CV & RESUME CMS */}
      {/* ========================================================================= */}
      {activeTab === "cv" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>CV &amp; Resume Download Link</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the PDF download destination and link used across all navigation buttons.
              </p>
            </div>
            <button
              onClick={() => handleSave("cv")}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {savedStatus ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
              <span>{savedStatus ? "Saved!" : saving ? "Saving..." : "Save Resume Link"}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">Curriculum Vitae (PDF Document)</h4>
                <p className="text-[11px] text-slate-400">Current target path: {cvPath}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 font-bold">
                Resume File URL or Path
              </label>
              <input
                type="text"
                value={cvPath}
                onChange={(e) => setCvPath(e.target.value)}
                placeholder="/resume.pdf or https://drive.google.com/..."
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={cvPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-emerald-400 border border-emerald-500/30 text-xs font-mono interactive-btn cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Open Resume</span>
              </a>
              <button
                type="button"
                onClick={() => setCvPath("/resume.pdf")}
                className="px-3 py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-400 hover:text-white border border-[#1E2638] text-xs font-mono cursor-pointer transition"
              >
                Reset to Default (/resume.pdf)
              </button>
            </div>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}

export default function PortfolioCMS() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Loading Portfolio CMS...
        </div>
      }
    >
      <PortfolioCMSContent />
    </Suspense>
  );
}
