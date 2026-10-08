"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  User,
  Briefcase,
  GraduationCap,
  Cpu,
  FolderGit2,
  Mail,
  Sliders,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  Eye,
  FileDown,
  Globe,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";
import MediaUploader from "@/components/MediaUploader";

// Default fallbacks matching portfolio initial state
const DEFAULT_HERO = {
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

const DEFAULT_ABOUT = {
  subtitle: "About Ashifur",
  title: "Engineering Reliability, Efficiency & Innovation",
  description1:
    "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.",
  description2:
    "Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.",
  profile_image: "/ashifur.jpeg",
  focus1_title: "Substation Engineering & SLDs",
  focus1_text: "High voltage equipment, switchgear, and single line diagrams.",
  focus2_title: "GIS & Spatial Utility Systems",
  focus2_text: "Mapping 11kV/0.4kV feeders, asset tracking, and spatial analysis.",
};

const DEFAULT_HIGHLIGHTS = [
  { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree" },
  { metric_value: "15+", metric_label: "CAD & Power Projects", metric_subtext: "SLDs, GIS Maps & Simulations" },
  { metric_value: "100%", metric_label: "Safety & Compliance Focus", metric_subtext: "Standard Operating Protocols" },
  { metric_value: "6+", metric_label: "Core Software Tools", metric_subtext: "AutoCAD, ETAP, MATLAB, GIS" },
];

function AdminConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "home";
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [resume, setResume] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [messages, setMessages] = useState([]);

  // Active category filter for skills & projects
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("all");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");

  // Modals state
  const [modalType, setModalType] = useState(null); // 'experience' | 'education' | 'skill' | 'project' | 'highlight'
  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  // Load content from API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getPortfolioContent();
      if (res) {
        if (res.hero && res.hero.name) setHero(res.hero);
        if (res.about && res.about.title) setAbout(res.about);
        if (Array.isArray(res.highlights) && res.highlights.length > 0) setHighlights(res.highlights);
        if (Array.isArray(res.experiences)) setExperiences(res.experiences);
        if (Array.isArray(res.educations)) setEducations(res.educations);
        if (Array.isArray(res.skills)) setSkills(res.skills);
        if (Array.isArray(res.projects)) setProjects(res.projects);
        if (res.social_links) setSocialLinks(res.social_links);
        if (res.resume) setResume(res.resume);
        if (res.site_settings) setSiteSettings(res.site_settings);
      }

      // Load inbox messages
      const msgRes = await api.getContactMessages();
      if (msgRes && msgRes.messages) {
        setMessages(msgRes.messages);
      }
    } catch (err) {
      console.error("Failed to load portfolio content:", err);
      showToast("Notice: Using local defaults while syncing database.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchTab = (tab) => {
    router.push(`/admin?tab=${tab}`);
  };

  // Generic section saver
  const handleSaveSection = async (section, data, successMsg) => {
    setSaving(true);
    try {
      const res = await api.savePortfolioSection(section, data);
      if (res && res.success) {
        showToast(successMsg || `${section.toUpperCase()} updated successfully!`, "success");
      } else {
        showToast(res?.error || "Save error occurred", "error");
      }
    } catch (err) {
      showToast("Failed to save changes. Please check connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reorder helper
  const moveItem = (list, setList, index, direction, sectionKey) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const updated = [...list];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setList(updated);
    handleSaveSection(sectionKey, { items: updated }, "Order updated successfully!");
  };

  // Delete helper
  const deleteItem = (list, setList, index, sectionKey, itemLabel) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel}?`)) return;
    const updated = list.filter((_, idx) => idx !== index);
    setList(updated);
    handleSaveSection(sectionKey, { items: updated }, `${itemLabel} removed successfully!`);
  };

  // Tab definitions
  const tabs = [
    { id: "home", label: "1. Home & Hero", icon: Home, liveUrl: "/" },
    { id: "about", label: "2. About", icon: User, liveUrl: "/about" },
    { id: "experience", label: "3. Experience", icon: Briefcase, liveUrl: "/experience", count: experiences.length },
    { id: "education", label: "4. Education", icon: GraduationCap, liveUrl: "/education", count: educations.length },
    { id: "skills", label: "5. Skills", icon: Cpu, liveUrl: "/skills", count: skills.length },
    { id: "projects", label: "6. Projects", icon: FolderGit2, liveUrl: "/projects", count: projects.length },
    { id: "contact", label: "7. Contact & Inbox", icon: Mail, liveUrl: "/contact", badge: messages.filter((m) => !m.is_read).length },
    { id: "settings", label: "Preferences", icon: Sliders, liveUrl: "/" },
  ];

  const currentTabObj = tabs.find((t) => t.id === currentTab) || tabs[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Tab Header */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Content Management System
              </span>
              <span className="text-xs font-mono text-slate-400">• Neon PostgreSQL Cloud</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Portfolio Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live editor for all 7 webpages. Add, edit, or remove content dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <a
              href={currentTabObj.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition group"
            >
              <span>View Live Page</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Horizontal 7-Tab Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-[#1E2638] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-[#161C2A] border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-slate-950/20 text-slate-900" : "bg-[#1E2638] text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HOME & HERO SECTION                                     */}
      {/* ============================================================== */}
      {currentTab === "home" && (
        <div className="space-y-6">
          <SpotlightCard className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2638] mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-400" />
                  Hero Section Content
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  The primary showcase that visitors see when arriving at <code className="text-emerald-400">/</code>
                </p>
              </div>

              <button
                onClick={() => handleSaveSection("hero", hero, "Hero section saved!")}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Hero"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={hero.name || ""}
                  onChange={(e) => setHero({ ...hero, name: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Professional Headline / Role</label>
                <input
                  type="text"
                  value={hero.title || ""}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-300 mb-1.5">Status Badge Text</label>
                <input
                  type="text"
                  value={hero.badge_text || ""}
                  onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-300 mb-1.5">Introduction Summary Bio</label>
                <textarea
                  rows={3}
                  value={hero.introduction || ""}
                  onChange={(e) => setHero({ ...hero, introduction: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition resize-none leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <MediaUploader
                  value={hero.profile_image || ""}
                  onChange={(url) => setHero({ ...hero, profile_image: url })}
                  label="Hero Profile Photo (Headshot / Portrait)"
                  description="Upload your high-res profile photo or drag & drop directly from device"
                  type="image"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Specialization Badge</label>
                <input
                  type="text"
                  value={hero.spec_badge_title || ""}
                  onChange={(e) => setHero({ ...hero, spec_badge_title: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Primary Button Text & Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.primary_btn_text || ""}
                    onChange={(e) => setHero({ ...hero, primary_btn_text: e.target.value })}
                    placeholder="Button text"
                    className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={hero.primary_btn_link || ""}
                    onChange={(e) => setHero({ ...hero, primary_btn_link: e.target.value })}
                    placeholder="/contact"
                    className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Secondary Button Text & Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.secondary_btn_text || ""}
                    onChange={(e) => setHero({ ...hero, secondary_btn_text: e.target.value })}
                    placeholder="Download CV"
                    className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={hero.secondary_btn_link || ""}
                    onChange={(e) => setHero({ ...hero, secondary_btn_link: e.target.value })}
                    placeholder="/resume.pdf"
                    className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Highlights Metrics Cards */}
          <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Hero Highlights & Metrics Cards
                </h3>
                <p className="text-xs text-slate-400">Featured metric banners appearing right under the hero headline.</p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({ metric_value: "", metric_label: "", metric_subtext: "" });
                  setEditingIndex(-1);
                  setModalType("highlight");
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0A0D12] border border-[#1E2638] hover:border-emerald-500/40 p-4 rounded-xl space-y-2 group relative transition"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xl font-extrabold text-emerald-400 font-mono">{item.metric_value}</p>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingItem({ ...item });
                          setEditingIndex(idx);
                          setModalType("highlight");
                        }}
                        className="p-1 hover:text-emerald-400 text-slate-400 transition"
                        title="Edit Metric"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(highlights, setHighlights, idx, "highlights", "metric")}
                        className="p-1 hover:text-red-400 text-slate-400 transition"
                        title="Delete Metric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white">{item.metric_label}</p>
                  <p className="text-[11px] text-slate-400">{item.metric_subtext}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ABOUT ASHIFUR PAGE                                      */}
      {/* ============================================================== */}
      {currentTab === "about" && (
        <SpotlightCard className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                About Page Content
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configures the narrative, technical pillars, and bio displayed at <code className="text-emerald-400">/about</code>
              </p>
            </div>

            <button
              onClick={() => handleSaveSection("about", about, "About page updated successfully!")}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save About Page"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Page Subtitle / Tag</label>
              <input
                type="text"
                value={about.subtitle || ""}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Main Biography Headline</label>
              <input
                type="text"
                value={about.title || ""}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1.5">Biography Paragraph 1</label>
              <textarea
                rows={3}
                value={about.description1 || ""}
                onChange={(e) => setAbout({ ...about, description1: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1.5">Biography Paragraph 2</label>
              <textarea
                rows={3}
                value={about.description2 || ""}
                onChange={(e) => setAbout({ ...about, description2: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <MediaUploader
                value={about.profile_image || ""}
                onChange={(url) => setAbout({ ...about, profile_image: url })}
                label="About Section Showcase Photo"
                description="Professional photo or engineering field showcase image"
                type="image"
              />
            </div>

            {/* Core Focus Area 1 */}
            <div className="p-4 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-3">
              <div className="font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Focus Pillar 1
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={about.focus1_title || ""}
                  onChange={(e) => setAbout({ ...about, focus1_title: e.target.value })}
                  className="w-full bg-[#111622] border border-[#1E2638] focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={about.focus1_text || ""}
                  onChange={(e) => setAbout({ ...about, focus1_text: e.target.value })}
                  className="w-full bg-[#111622] border border-[#1E2638] focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none resize-none"
                />
              </div>
            </div>

            {/* Core Focus Area 2 */}
            <div className="p-4 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-3">
              <div className="font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Focus Pillar 2
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={about.focus2_title || ""}
                  onChange={(e) => setAbout({ ...about, focus2_title: e.target.value })}
                  className="w-full bg-[#111622] border border-[#1E2638] focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={about.focus2_text || ""}
                  onChange={(e) => setAbout({ ...about, focus2_text: e.target.value })}
                  className="w-full bg-[#111622] border border-[#1E2638] focus:border-emerald-500 rounded-lg px-3 py-2 text-white outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* ============================================================== */}
      {/* TAB 3: WORK EXPERIENCE                                         */}
      {/* ============================================================== */}
      {currentTab === "experience" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] border border-[#1E2638] p-5 rounded-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                Work Experience Timeline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all career positions shown on <code className="text-emerald-400">/experience</code>. Total positions: {experiences.length}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  role: "",
                  organization: "",
                  period: "",
                  location: "Dhaka, Bangladesh",
                  website: "",
                  description_points: [""],
                  is_current: false,
                });
                setEditingIndex(-1);
                setModalType("experience");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Experience</span>
            </button>
          </div>

          <div className="space-y-3">
            {experiences.length === 0 ? (
              <div className="p-8 text-center bg-[#111622] border border-[#1E2638] rounded-2xl text-slate-400 text-xs">
                No experiences added yet. Click &quot;Add New Experience&quot; to create your first entry.
              </div>
            ) : (
              experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-[#111622] border border-[#1E2638] hover:border-emerald-500/40 p-5 rounded-2xl transition group relative space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2638] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <h3 className="text-sm sm:text-base font-bold text-white">{exp.role}</h3>
                        {exp.is_current ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Present
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-300">{exp.organization}</span> • {exp.period} • {exp.location || "Dhaka"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => moveItem(experiences, setExperiences, idx, -1, "experiences")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(experiences, setExperiences, idx, 1, "experiences")}
                        disabled={idx === experiences.length - 1}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({
                            ...exp,
                            description_points: Array.isArray(exp.description_points)
                              ? [...exp.description_points]
                              : (exp.points || []),
                          });
                          setEditingIndex(idx);
                          setModalType("experience");
                        }}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-emerald-400 hover:bg-emerald-500/20"
                        title="Edit Experience"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(experiences, setExperiences, idx, "experiences", "experience entry")}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-red-400 hover:bg-red-500/20"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bullet points display */}
                  {exp.description_points && exp.description_points.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc marker:text-emerald-400">
                      {exp.description_points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: EDUCATION & DEGREES                                     */}
      {/* ============================================================== */}
      {currentTab === "education" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] border border-[#1E2638] p-5 rounded-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                Education &amp; Qualifications
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage degrees, institutions, and academic accolades at <code className="text-emerald-400">/education</code>.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  degree: "",
                  institution: "",
                  subject: "",
                  start_year: "",
                  end_year: "",
                  result: "",
                  badge_text: "",
                  description: "",
                });
                setEditingIndex(-1);
                setModalType("education");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-3">
            {educations.length === 0 ? (
              <div className="p-8 text-center bg-[#111622] border border-[#1E2638] rounded-2xl text-slate-400 text-xs">
                No education records yet. Click &quot;Add Education&quot; to begin.
              </div>
            ) : (
              educations.map((ed, idx) => (
                <div
                  key={idx}
                  className="bg-[#111622] border border-[#1E2638] hover:border-emerald-500/40 p-5 rounded-2xl transition group relative space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2638] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm sm:text-base font-bold text-white">{ed.degree}</h3>
                        {ed.badge_text && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {ed.badge_text}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-200">{ed.institution}</span> • {ed.start_year} – {ed.end_year || "Present"} • {ed.result}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => moveItem(educations, setEducations, idx, -1, "educations")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(educations, setEducations, idx, 1, "educations")}
                        disabled={idx === educations.length - 1}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({ ...ed });
                          setEditingIndex(idx);
                          setModalType("education");
                        }}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(educations, setEducations, idx, "educations", "education item")}
                        className="p-1.5 rounded-lg bg-[#161C2A] text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {ed.description && <p className="text-xs text-slate-300 leading-relaxed">{ed.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SKILLS MATRIX                                           */}
      {/* ============================================================== */}
      {currentTab === "skills" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] border border-[#1E2638] p-5 rounded-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Technical Skills Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Categorized engineering skills &amp; software tools displayed at <code className="text-emerald-400">/skills</code>.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  name: "",
                  category: "Design & Simulation",
                  level: 85,
                  icon: "monitor",
                });
                setEditingIndex(-1);
                setModalType("skill");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skill</span>
            </button>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["all", "Design & Simulation", "GIS & Data Systems", "Power Systems & Field", "Automation & AI"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                    skillCategoryFilter === cat
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-[#111622] text-slate-400 hover:text-white border border-[#1E2638]"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {skills
              .filter((s) => skillCategoryFilter === "all" || s.category === skillCategoryFilter)
              .map((skill, idx) => {
                const originalIndex = skills.indexOf(skill);
                return (
                  <div
                    key={idx}
                    className="bg-[#111622] border border-[#1E2638] hover:border-emerald-500/40 p-4 rounded-xl space-y-3 transition group relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C2A] text-slate-400 border border-[#1E2638]">
                        {skill.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem({ ...skill });
                            setEditingIndex(originalIndex);
                            setModalType("skill");
                          }}
                          className="p-1 hover:text-emerald-400 text-slate-400 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(skills, setSkills, originalIndex, "skills", "skill")}
                          className="p-1 hover:text-red-400 text-slate-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{skill.name}</span>
                        <span className="font-mono text-emerald-400 font-bold">{skill.level}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0A0D12] rounded-full overflow-hidden border border-[#1E2638]">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: PROJECTS PORTFOLIO                                      */}
      {/* ============================================================== */}
      {currentTab === "projects" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] border border-[#1E2638] p-5 rounded-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-400" />
                Engineering Projects Portfolio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical showcase cards displayed at <code className="text-emerald-400">/projects</code>. Total projects: {projects.length}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  project_number: String(projects.length + 1).padStart(2, "0"),
                  title: "",
                  category: "Power Electronics",
                  short_description: "",
                  full_description: "",
                  tags: ["AutoCAD", "Simulation"],
                  live_url: "",
                  github_url: "",
                  is_featured: false,
                  is_published: true,
                });
                setEditingIndex(-1);
                setModalType("project");
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="bg-[#111622] border border-[#1E2638] hover:border-emerald-500/40 p-5 rounded-2xl space-y-3.5 transition group relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        #{proj.project_number || String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        {proj.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveItem(projects, setProjects, idx, -1, "projects")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg bg-[#161C2A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(projects, setProjects, idx, 1, "projects")}
                        disabled={idx === projects.length - 1}
                        className="p-1 rounded-lg bg-[#161C2A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({
                            ...proj,
                            tags: Array.isArray(proj.tags) ? [...proj.tags] : [],
                          });
                          setEditingIndex(idx);
                          setModalType("project");
                        }}
                        className="p-1 rounded-lg bg-[#161C2A] text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(projects, setProjects, idx, "projects", "project")}
                        className="p-1 rounded-lg bg-[#161C2A] text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {proj.short_description || proj.full_description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1E2638]">
                  {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0A0D12] text-slate-400 border border-[#1E2638]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-3">
                      {proj.live_url && (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          Live <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          Code <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {proj.is_featured ? "⭐ Featured" : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: CONTACT, RESUME & MESSAGES                              */}
      {/* ============================================================== */}
      {currentTab === "contact" && (
        <div className="space-y-6">
          {/* Section A: Contact Details & Social Links */}
          <SpotlightCard className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  Contact Details &amp; Social Channels
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shown on <code className="text-emerald-400">/contact</code> and in the footer across all 7 pages.
                </p>
              </div>

              <button
                onClick={() => handleSaveSection("social_links", socialLinks, "Contact & Social links saved!")}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Contact Info"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={socialLinks.email || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, email: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number
                </label>
                <input
                  type="text"
                  value={socialLinks.phone || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, phone: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">WhatsApp Number</label>
                <input
                  type="text"
                  value={socialLinks.whatsapp || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Location / Address
                </label>
                <input
                  type="text"
                  value={socialLinks.location || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, location: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={socialLinks.linkedin || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">GitHub Profile URL</label>
                <input
                  type="text"
                  value={socialLinks.github || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>
            </div>
          </SpotlightCard>

          {/* Section B: Resume / CV Management */}
          <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-emerald-400" />
                  Curriculum Vitae (CV) &amp; Resume Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Target of the &quot;Download CV&quot; button and interactive resume viewer modal.
                </p>
              </div>

              <button
                onClick={() => handleSaveSection("resume", resume, "Resume link saved successfully!")}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Resume</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full">
                <MediaUploader
                  value={resume.file_url || ""}
                  onChange={(url, fileName) =>
                    setResume({
                      ...resume,
                      file_url: url,
                      file_name: fileName || resume.file_name || "Ashifur_Rahman_CV.pdf",
                    })
                  }
                  label="Curriculum Vitae (PDF Document Upload)"
                  description="Upload your latest PDF CV/Resume file directly from your computer"
                  type="document"
                  accept=".pdf,application/pdf"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Display Download File Name</label>
                <input
                  type="text"
                  value={resume.file_name || ""}
                  onChange={(e) => setResume({ ...resume, file_name: e.target.value })}
                  placeholder="Ashifur_Rahman_CV.pdf"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section C: Inbound Messages Inbox */}
          <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Inbound Messages Inbox
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {messages.length} total
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct inquiries submitted by visitors from the <code className="text-emerald-400">/contact</code> page.
                </p>
              </div>

              <button
                onClick={async () => {
                  const res = await api.getContactMessages();
                  if (res && res.messages) {
                    setMessages(res.messages);
                    showToast("Inbox refreshed!", "info");
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#161C2A] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Inbox</span>
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No inquiries received yet. New visitor messages will show up here immediately.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border transition space-y-2 ${
                      msg.is_read
                        ? "bg-[#0A0D12] border-[#1E2638]"
                        : "bg-[#0E1524] border-emerald-500/40 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2638] pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            msg.is_read ? "bg-slate-600" : "bg-emerald-400 animate-pulse"
                          }`}
                        />
                        <span className="font-bold text-white text-xs">{msg.name}</span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-[11px] font-mono text-emerald-400 hover:underline"
                        >
                          &lt;{msg.email}&gt;
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                        </span>
                        {!msg.is_read && (
                          <button
                            onClick={async () => {
                              await api.markContactMessageRead(msg.id, 1);
                              setMessages(messages.map((m) => (m.id === msg.id ? { ...m, is_read: 1 } : m)));
                              showToast("Message marked as read", "success");
                            }}
                            className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!window.confirm("Delete this message?")) return;
                            await api.deleteContactMessage(msg.id);
                            setMessages(messages.filter((m) => m.id !== msg.id));
                            showToast("Message deleted", "info");
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {msg.subject && (
                      <p className="text-xs font-semibold text-slate-200">
                        Subject: {msg.subject}
                      </p>
                    )}
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: PREFERENCES & SETTINGS                                  */}
      {/* ============================================================== */}
      {currentTab === "settings" && (
        <SpotlightCard className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Global Portfolio Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Site metadata, copyright strings, and global branding parameters.
              </p>
            </div>

            <button
              onClick={() => handleSaveSection("site_settings", siteSettings, "Site settings saved!")}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Site Title (Browser Tab)</label>
              <input
                type="text"
                value={siteSettings.site_title || "Ashifur Rahman | Engineering Portfolio"}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_title: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Footer Brand Text</label>
              <input
                type="text"
                value={siteSettings.footer_brand || "Ashifur Rahman"}
                onChange={(e) => setSiteSettings({ ...siteSettings, footer_brand: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1.5">Meta Description (SEO)</label>
              <textarea
                rows={2}
                value={siteSettings.meta_description || "Official engineering portfolio of Ashifur Rahman. Electrical & Electronic Engineer."}
                onChange={(e) => setSiteSettings({ ...siteSettings, meta_description: e.target.value })}
                className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* ============================================================== */}
      {/* UNIVERSAL CRUD MODALS                                          */}
      {/* ============================================================== */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-base font-bold text-white capitalize">
                {editingIndex >= 0 ? "Edit" : "Add"} {modalType}
              </h3>
              <button
                onClick={() => {
                  setModalType(null);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg hover:bg-[#1E2638] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Highlight */}
            {modalType === "highlight" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Metric Value (e.g. 15+, B.Sc.)</label>
                  <input
                    type="text"
                    value={editingItem.metric_value || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, metric_value: e.target.value })}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Metric Label</label>
                  <input
                    type="text"
                    value={editingItem.metric_label || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, metric_label: e.target.value })}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Subtext / Explanation</label>
                  <input
                    type="text"
                    value={editingItem.metric_subtext || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, metric_subtext: e.target.value })}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Body: Experience */}
            {modalType === "experience" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Job Role / Designation</label>
                    <input
                      type="text"
                      value={editingItem.role || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                      placeholder="e.g. Executive Engineer"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Organization / Company</label>
                    <input
                      type="text"
                      value={editingItem.organization || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                      placeholder="e.g. Energy Division"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Duration / Period</label>
                    <input
                      type="text"
                      value={editingItem.period || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                      placeholder="e.g. 2023 - Present"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={editingItem.location || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      placeholder="Dhaka, Bangladesh"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                {/* Bullet Points */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-medium text-slate-300">Responsibility Bullet Points</label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          description_points: [...(editingItem.description_points || []), ""],
                        })
                      }
                      className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3" /> Add Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingItem.description_points || [""]).map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pt}
                          onChange={(e) => {
                            const updated = [...editingItem.description_points];
                            updated[pIdx] = e.target.value;
                            setEditingItem({ ...editingItem, description_points: updated });
                          }}
                          placeholder={`Key responsibility point ${pIdx + 1}`}
                          className="flex-1 bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingItem.description_points.filter((_, i) => i !== pIdx);
                            setEditingItem({ ...editingItem, description_points: updated });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Education */}
            {modalType === "education" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={editingItem.degree || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                    placeholder="e.g. B.Sc. in Electrical & Electronic Engineering"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editingItem.institution || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    placeholder="e.g. American International University-Bangladesh"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Start Year</label>
                    <input
                      type="text"
                      value={editingItem.start_year || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, start_year: e.target.value })}
                      placeholder="2019"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">End Year</label>
                    <input
                      type="text"
                      value={editingItem.end_year || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, end_year: e.target.value })}
                      placeholder="2023"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Result / CGPA</label>
                    <input
                      type="text"
                      value={editingItem.result || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, result: e.target.value })}
                      placeholder="CGPA 3.85 / 4.00"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Honors / Badge Text</label>
                    <input
                      type="text"
                      value={editingItem.badge_text || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, badge_text: e.target.value })}
                      placeholder="Dean's List Honor"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Description / Major Highlights</label>
                  <textarea
                    rows={2}
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Body: Skill */}
            {modalType === "skill" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. AutoCAD Electrical"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingItem.category || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="Design & Simulation, GIS & Data Systems, etc."
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-300">Proficiency Percentage</label>
                    <span className="font-mono text-emerald-400 font-bold">{editingItem.level || 80}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={editingItem.level || 80}
                    onChange={(e) => setEditingItem({ ...editingItem, level: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Modal Body: Project */}
            {modalType === "project" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Project Number</label>
                    <input
                      type="text"
                      value={editingItem.project_number || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, project_number: e.target.value })}
                      placeholder="01"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingItem.category || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      placeholder="Power Electronics, Substation GIS, etc."
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={editingItem.title || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Full project headline"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Short Summary</label>
                  <textarea
                    rows={2}
                    value={editingItem.short_description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, short_description: e.target.value })}
                    placeholder="Brief description shown on cards"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <MediaUploader
                    value={editingItem.image_url || ""}
                    onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
                    label="Project Media / Thumbnail (Image or Video Demo)"
                    description="Upload project demo screenshot, schematic diagram, or video showcase"
                    type="media"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="MATLAB, Simulink, PCB Design"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Live URL (optional)</label>
                    <input
                      type="text"
                      value={editingItem.live_url || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, live_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">GitHub / Code URL</label>
                    <input
                      type="text"
                      value={editingItem.github_url || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer: Save & Cancel */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2638]">
              <button
                type="button"
                onClick={() => {
                  setModalType(null);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#161C2A] text-slate-400 hover:text-white text-xs font-mono transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (modalType === "highlight") {
                    const updated = [...highlights];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setHighlights(updated);
                    handleSaveSection("highlights", { items: updated }, "Metric saved!");
                  } else if (modalType === "experience") {
                    const updated = [...experiences];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setExperiences(updated);
                    handleSaveSection("experiences", { items: updated }, "Experience saved!");
                  } else if (modalType === "education") {
                    const updated = [...educations];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setEducations(updated);
                    handleSaveSection("educations", { items: updated }, "Education saved!");
                  } else if (modalType === "skill") {
                    const updated = [...skills];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setSkills(updated);
                    handleSaveSection("skills", { items: updated }, "Skill saved!");
                  } else if (modalType === "project") {
                    const updated = [...projects];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setProjects(updated);
                    handleSaveSection("projects", { items: updated }, "Project saved!");
                  }
                  setModalType(null);
                  setEditingItem(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-emerald-400">Loading Portfolio Admin Console...</p>
        </div>
      }
    >
      <AdminConsoleContent />
    </Suspense>
  );
}
