"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Search,
  Plus,
  ArrowLeft,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  Check,
  X,
  FileText,
  Image as ImageIcon,
  Calculator,
  QrCode,
  Video,
  FileBadge,
  Sparkles,
  Layers,
  Settings as SettingsIcon,
  Tag,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Save,
  Globe,
  Radio,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";
import { ToolGhorLogo } from "@/components/WebsiteLogos";

// 6 Real Categories from portfolio.db & toolghor_extracted.json
const REAL_CATEGORIES = [
  { id: 1, name: "Document Tools", slug: "documents", icon: "FileText", count: 6, desc: "PDF merge, split, compress, PDF to DOCX, Word to PDF" },
  { id: 2, name: "Image Tools", slug: "images", icon: "ImageIcon", count: 8, desc: "Image compress, resize, crop, merge, convert, passport photo, background remove" },
  { id: 3, name: "Calculators", slug: "calculators", icon: "Calculator", count: 6, desc: "Live currency rates, BMI, engineering units, percentage, age, timezone" },
  { id: 4, name: "QR Code Tools", slug: "qr", icon: "QrCode", count: 2, desc: "Custom QR code generator and image QR scanner / decoder" },
  { id: 5, name: "Video & Audio Tools", slug: "media", icon: "Video", count: 3, desc: "YouTube downloader, audio extractor from video, video cropper" },
  { id: 6, name: "Resume Builder", slug: "resume", icon: "FileBadge", count: 2, desc: "Professional resume builder and ATS-friendly CV templates" },
];

// 27 Real Tools from portfolio.db & toolghor_extracted.json
const REAL_TOOLS = [
  // Category 1: Document Tools (6 tools)
  {
    id: 1,
    name: "Merge PDF",
    slug: "merge-pdf",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "Combine multiple PDF documents into a single organized file seamlessly.",
    icon: "FileText",
    active: true,
    badge: "Popular",
  },
  {
    id: 2,
    name: "Split PDF",
    slug: "split-pdf",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "Extract selected pages or split large PDF files into separate documents.",
    icon: "FileText",
    active: true,
    badge: "Essential",
  },
  {
    id: 3,
    name: "Compress PDF",
    slug: "compress-pdf",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "Reduce PDF file size without sacrificing readability or image quality.",
    icon: "FileText",
    active: true,
    badge: "Popular",
  },
  {
    id: 4,
    name: "PDF to Image",
    slug: "pdf-to-image",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "Convert PDF pages to high-resolution PNG or JPG image files.",
    icon: "FileText",
    active: true,
    badge: "Utility",
  },
  {
    id: 5,
    name: "PDF to Word (DOCX)",
    slug: "pdf-to-doc",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "Convert PDF documents into fully editable Microsoft Word (.docx) documents.",
    icon: "FileText",
    active: true,
    badge: "Hot",
  },
  {
    id: 6,
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "Convert DOC and DOCX Word documents into standardized PDF format.",
    icon: "FileText",
    active: true,
    badge: "Popular",
  },

  // Category 2: Image Tools (8 tools)
  {
    id: 7,
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Convert JPG, PNG, and WebP images into a single multi-page PDF document.",
    icon: "ImageIcon",
    active: true,
    badge: "Popular",
  },
  {
    id: 8,
    name: "Compress Image",
    slug: "compress-image",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Reduce image file size significantly while retaining maximum visual clarity.",
    icon: "ImageIcon",
    active: true,
    badge: "Essential",
  },
  {
    id: 9,
    name: "Resize Image",
    slug: "resize-image",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Scale images to exact pixel dimensions, percentage ratios, or specific file sizes.",
    icon: "ImageIcon",
    active: true,
    badge: "Utility",
  },
  {
    id: 10,
    name: "Crop Image",
    slug: "crop-image",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Trim and crop unwanted areas from photos with custom or fixed aspect ratios.",
    icon: "ImageIcon",
    active: true,
    badge: "Utility",
  },
  {
    id: 11,
    name: "Merge Image",
    slug: "merge-image",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Stitch and combine multiple photos side-by-side or stacked vertically.",
    icon: "ImageIcon",
    active: true,
    badge: "Creative",
  },
  {
    id: 12,
    name: "Convert Image",
    slug: "convert-image",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Convert images between JPG, PNG, WebP, GIF, and SVG formats instantly.",
    icon: "ImageIcon",
    active: true,
    badge: "Essential",
  },
  {
    id: 13,
    name: "Passport Size Photo",
    slug: "passport-photo",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Create official passport & visa photos (35x45mm, 300x300px) with custom white/blue background.",
    icon: "ImageIcon",
    active: true,
    badge: "Popular",
  },
  {
    id: 14,
    name: "Remove Background",
    slug: "remove-background",
    category: "Image Tools",
    categorySlug: "images",
    desc: "Isolate subjects and create transparent PNGs or replace with solid studio backgrounds.",
    icon: "ImageIcon",
    active: true,
    badge: "AI Powered",
  },

  // Category 3: Calculators (6 tools)
  {
    id: 15,
    name: "Live Currency Converter",
    slug: "currency-converter",
    category: "Calculators",
    categorySlug: "calculators",
    desc: "Real-time currency exchange rates for BDT, USD, EUR, GBP, SAR, AED and 150+ currencies.",
    icon: "Calculator",
    active: true,
    badge: "Live Rates",
  },
  {
    id: 16,
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Calculators",
    categorySlug: "calculators",
    desc: "Calculate Body Mass Index (BMI), healthy weight ranges, and body category.",
    icon: "Calculator",
    active: true,
    badge: "Health",
  },
  {
    id: 17,
    name: "Unit Converter",
    slug: "unit-converter",
    category: "Calculators",
    categorySlug: "calculators",
    desc: "Universal metric and imperial converter for length, weight, area, volume, and temperature.",
    icon: "Calculator",
    active: true,
    badge: "Utility",
  },
  {
    id: 18,
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Calculators",
    categorySlug: "calculators",
    desc: "Quick percentage calculations: percentage of, percentage change, increase/decrease, and discount.",
    icon: "Calculator",
    active: true,
    badge: "Math",
  },
  {
    id: 19,
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Calculators",
    categorySlug: "calculators",
    desc: "Calculate exact age in years, months, days, hours, and find upcoming birthday countdowns.",
    icon: "Calculator",
    active: true,
    badge: "Utility",
  },
  {
    id: 20,
    name: "Time Zone Converter",
    slug: "time-zone-converter",
    category: "Calculators",
    categorySlug: "calculators",
    desc: "Compare and schedule across global time zones (BST, UTC, EST, PST, GMT, IST, etc.).",
    icon: "Calculator",
    active: true,
    badge: "Productivity",
  },

  // Category 4: QR Code Tools (2 tools)
  {
    id: 21,
    name: "QR Code Generator",
    slug: "qr-generator",
    category: "QR Code Tools",
    categorySlug: "qr",
    desc: "Generate customizable QR codes for URLs, WiFi networks, vCards, text, and WhatsApp.",
    icon: "QrCode",
    active: true,
    badge: "Popular",
  },
  {
    id: 22,
    name: "QR Code Decoder",
    slug: "qr-decoder",
    category: "QR Code Tools",
    categorySlug: "qr",
    desc: "Scan and decode QR codes from image files, screenshots, or device camera feed.",
    icon: "QrCode",
    active: true,
    badge: "Utility",
  },

  // Category 5: Video & Audio Tools (3 tools)
  {
    id: 23,
    name: "YouTube Downloader",
    slug: "youtube-downloader",
    category: "Video & Audio Tools",
    categorySlug: "media",
    desc: "Download YouTube videos and audio in MP4, WebM, and MP3 formats with high fidelity.",
    icon: "Video",
    active: true,
    badge: "Popular",
  },
  {
    id: 24,
    name: "Audio Extractor",
    slug: "audio-extractor",
    category: "Video & Audio Tools",
    categorySlug: "media",
    desc: "Extract crystal clear MP3, WAV, or AAC audio tracks from video files in your browser.",
    icon: "Video",
    active: true,
    badge: "Media",
  },
  {
    id: 25,
    name: "Social Media Video Cropper",
    slug: "social-video-cropper",
    category: "Video & Audio Tools",
    categorySlug: "media",
    desc: "Crop and resize videos for Instagram Reels (9:16), TikTok, YouTube Shorts, and feeds (1:1).",
    icon: "Video",
    active: true,
    badge: "Creator",
  },

  // Category 6: Resume Builder (2 tools)
  {
    id: 26,
    name: "Professional Resume",
    slug: "resume-builder",
    category: "Resume Builder",
    categorySlug: "resume",
    desc: "Build modern, ATS-friendly resumes and CVs with real-time PDF generation and instant export.",
    icon: "FileBadge",
    active: true,
    badge: "Career",
  },
  {
    id: 27,
    name: "CV Templates",
    slug: "cv-templates",
    category: "Resume Builder",
    categorySlug: "resume",
    desc: "Curated gallery of downloadable modern CV and resume templates for engineers & developers.",
    icon: "FileBadge",
    active: true,
    badge: "Templates",
  },
];

export default function ToolGhorCMS() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("tools");
  const [tools, setTools] = useState(REAL_TOOLS);
  const [categories, setCategories] = useState(REAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolForm, setToolForm] = useState({
    name: "",
    slug: "",
    category: "Document Tools",
    categorySlug: "documents",
    desc: "",
    badge: "Utility",
    icon: "FileText",
    active: true,
  });

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "", icon: "Layers" });

  // Banner Settings State
  const [bannerText, setBannerText] = useState(
    "⚡ ToolGhor Live: 27+ powerful tools for PDF, image, calculators, QR & media processing!"
  );

  // Load from API if available
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getToolGhorContent();
        if (res && res.success) {
          if (res.tools && res.tools.length > 0) {
            setTools(
              res.tools.map((t) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                category: t.category_name || t.category || "Document Tools",
                categorySlug: t.category_slug || "documents",
                desc: t.short_description || t.desc || "",
                icon: t.icon || "FileText",
                active: Boolean(t.is_active ?? t.active ?? true),
                badge: t.badge || "Popular",
              }))
            );
          }
          if (res.categories && res.categories.length > 0) {
            setCategories(
              res.categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                icon: c.icon || "Layers",
                count: tools.filter((t) => t.category === c.name || t.categorySlug === c.slug).length,
                desc: c.description || "",
              }))
            );
          }
          if (res.settings?.announcement_banner) {
            setBannerText(res.settings.announcement_banner);
          }
        }
      } catch (e) {
        // Fallback uses REAL_TOOLS & REAL_CATEGORIES
      }
    }
    loadData();
  }, []);

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.slug.toLowerCase().includes(search.toLowerCase()) ||
      tool.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      tool.category === selectedCategory ||
      tool.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle tool active status
  const toggleToolActive = (toolId) => {
    setTools((prev) =>
      prev.map((t) => {
        if (t.id === toolId) {
          const next = !t.active;
          if (showToast) {
            showToast(`${t.name} set to ${next ? "ACTIVE" : "INACTIVE"}`, next ? "success" : "info");
          }
          return { ...t, active: next };
        }
        return t;
      })
    );
  };

  // Open Add Tool Modal
  const handleOpenAddTool = () => {
    setEditingTool(null);
    setToolForm({
      name: "",
      slug: "",
      category: categories[0]?.name || "Document Tools",
      categorySlug: categories[0]?.slug || "documents",
      desc: "",
      badge: "Utility",
      icon: "FileText",
      active: true,
    });
    setToolModalOpen(true);
  };

  // Open Edit Tool Modal
  const handleOpenEditTool = (tool) => {
    setEditingTool(tool);
    setToolForm({
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      categorySlug: tool.categorySlug || "documents",
      desc: tool.desc,
      badge: tool.badge || "Utility",
      icon: tool.icon || "FileText",
      active: tool.active ?? true,
    });
    setToolModalOpen(true);
  };

  // Save Tool
  const handleSaveTool = async (e) => {
    e.preventDefault();
    if (!toolForm.name || !toolForm.slug) return;

    if (editingTool) {
      setTools((prev) =>
        prev.map((t) => (t.id === editingTool.id ? { ...t, ...toolForm } : t))
      );
      if (showToast) {
        showToast(`Saved changes to "${toolForm.name}"`, "success");
      }
    } else {
      const newTool = {
        id: "t-" + Date.now(),
        ...toolForm,
      };
      setTools((prev) => [newTool, ...prev]);
      if (showToast) {
        showToast(`Added "${toolForm.name}" to ToolGhor`, "success");
      }
    }
    setToolModalOpen(false);
  };

  // Delete Tool
  const handleDeleteTool = async (id) => {
    const target = tools.find((t) => t.id === id);
    if (confirm(`Are you sure you want to delete "${target?.name || "this tool"}"?`)) {
      setTools((prev) => prev.filter((t) => t.id !== id));
      if (showToast) {
        showToast("Tool removed from directory", "info");
      }
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (toolModalOpen || catModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [toolModalOpen, catModalOpen]);

  const activeToolsCount = tools.filter((t) => t.active).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Managing Bar */}
      <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E2638] flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors hover:border-teal-500/30">
        <div className="flex items-center gap-3">
          <ToolGhorLogo size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Managing: <span className="text-teal-400">ToolGhor Platform</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span>
                {activeToolsCount}/{tools.length} Tools Live
              </span>
            </div>
            <a
              href="https://toolghor.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
            >
              toolghor.netlify.app <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono interactive-btn cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>← Central Hub</span>
          </Link>
          <a
            href="https://toolghor.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-mono font-medium interactive-btn cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open ToolGhor Live</span>
          </a>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-[#1E2638] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("tools")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "tools"
              ? "border-teal-400 text-teal-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Tools Catalog ({tools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "categories"
              ? "border-teal-400 text-teal-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("banners")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "banners"
              ? "border-teal-400 text-teal-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Notice & Banners</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 cursor-pointer interactive-btn shrink-0 whitespace-nowrap ${
            activeTab === "settings"
              ? "border-teal-400 text-teal-300 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* TAB 1: TOOLS CATALOG (27 TOOLS) */}
      {activeTab === "tools" && (
        <div className="space-y-4">
          {/* Controls: Search, Category Filters, Add Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0B0F17] border border-[#1E2638]">
            <div className="flex-1 flex items-center gap-2 bg-[#111622] border border-[#1E2638] rounded-xl px-3.5 py-2 max-w-md focus-within:border-teal-500/50 transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search tools by name, slug or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-slate-500 hover:text-white text-xs">
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddTool}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-md shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tool</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer interactive-btn shrink-0 ${
                selectedCategory === "all"
                  ? "bg-teal-500/15 text-teal-300 border-teal-500/40 font-bold"
                  : "bg-[#0B0F17] text-slate-400 border-[#1E2638] hover:text-white"
              }`}
            >
              All Tools ({tools.length})
            </button>
            {categories.map((c) => {
              const cCount = tools.filter((t) => t.category === c.name || t.categorySlug === c.slug).length;
              const isSelected = selectedCategory === c.name || selectedCategory === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer interactive-btn shrink-0 ${
                    isSelected
                      ? "bg-teal-500/15 text-teal-300 border-teal-500/40 font-bold"
                      : "bg-[#0B0F17] text-slate-400 border-[#1E2638] hover:text-white"
                  }`}
                >
                  {c.name} ({cCount})
                </button>
              );
            })}
          </div>

          {/* Tools Grid (27 Real Tools) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <SpotlightCard
                key={tool.id}
                spotlightColor="rgba(20, 184, 166, 0.1)"
                borderColor="rgba(20, 184, 166, 0.25)"
                className="p-5 flex flex-col justify-between space-y-3.5 interactive-card group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {tool.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-tight">
                          {tool.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">/tools/{tool.slug}</span>
                      </div>
                    </div>

                    {/* Interactive Active / Inactive switch */}
                    <button
                      onClick={() => toggleToolActive(tool.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition interactive-btn cursor-pointer ${
                        tool.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                      title="Click to toggle status"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tool.active ? "bg-emerald-400" : "bg-slate-500"}`}></span>
                      <span>{tool.active ? "Live" : "Off"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[32px]">
                    {tool.desc}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C2A] text-slate-300 border border-[#1E2638]">
                      {tool.category}
                    </span>
                    {tool.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between">
                  <a
                    href={`https://toolghor.netlify.app/tools/${tool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Live Tool</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditTool(tool)}
                      className="p-1.5 rounded-lg bg-[#111622] hover:bg-[#161E30] text-slate-300 hover:text-white border border-[#1E2638] transition cursor-pointer interactive-btn"
                      title="Edit Tool"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTool(tool.id)}
                      className="p-1.5 rounded-lg bg-[#111622] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-[#1E2638] transition cursor-pointer interactive-btn"
                      title="Delete Tool"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES (6 CATEGORIES) */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Tool Categories Management ({categories.length})</span>
              </h3>
              <p className="text-xs text-slate-400">All 6 core modules powering ToolGhor Platform navigation</p>
            </div>
            <button
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-xs font-mono transition interactive-btn cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const toolCount = tools.filter(
                (t) => t.category === cat.name || t.categorySlug === cat.slug
              ).length;
              return (
                <SpotlightCard
                  key={cat.slug}
                  className="p-5 flex flex-col justify-between space-y-3 interactive-card group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                        <p className="text-xs font-mono text-slate-400">slug: /{cat.slug}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#111622] text-teal-400 border border-[#1E2638] text-xs font-mono">
                      {toolCount} Tools
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[32px]">{cat.desc}</p>

                  <div className="pt-2 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setActiveTab("tools");
                      }}
                      className="text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Tools &rarr;</span>
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BANNERS */}
      {activeTab === "banners" && (
        <SpotlightCard className="p-6 md:p-8 space-y-5">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>ToolGhor Announcement & Hero Notice Banner</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure the live announcement ticker and headline displayed on the ToolGhor homepage header.
          </p>

          <div className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] space-y-3">
            <label className="text-xs font-mono text-slate-400 block">Top Notice Announcement</label>
            <textarea
              rows={2}
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              onClick={() => {
                if (showToast) {
                  showToast("Notice banner updated successfully!", "success");
                }
              }}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black text-xs font-mono font-bold rounded-xl interactive-btn cursor-pointer shadow-md shadow-teal-500/20"
            >
              Save Announcement Banner
            </button>
          </div>
        </SpotlightCard>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === "settings" && (
        <SpotlightCard className="p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-teal-400" />
            <span>ToolGhor Platform Environment Configurations</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Production Website URL</label>
              <input
                type="text"
                readOnly
                value="https://toolghor.netlify.app"
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-teal-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Tools Base Dynamic Route</label>
              <input
                type="text"
                readOnly
                value="https://toolghor.netlify.app/tools/[slug]/"
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-teal-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Total Registered Tools</label>
              <input
                type="text"
                readOnly
                value={`${tools.length} Tools across ${categories.length} Categories`}
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Client Engine Mode</label>
              <input
                type="text"
                readOnly
                value="Zero-Upload Browser Canvas & WASM Processing"
                className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-emerald-400 font-mono"
              />
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* MODAL: ADD / EDIT TOOL */}
      {toolModalOpen && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-modal-backdrop">
          <div className="w-full max-w-lg bg-[#0B0F17] border border-[#1E2638] rounded-2xl shadow-2xl p-6 space-y-5 animate-modal-content my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-white text-sm font-mono">
                  {editingTool ? `Edit Tool: ${editingTool.name}` : "Register New Tool"}
                </h3>
              </div>
              <button
                onClick={() => setToolModalOpen(false)}
                className="text-slate-400 hover:text-white interactive-btn cursor-pointer p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTool} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">TOOL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PDF Watermark Adder"
                  value={toolForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                    setToolForm({
                      ...toolForm,
                      name: val,
                      slug: editingTool ? toolForm.slug : autoSlug,
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-teal-500/50 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">SLUG (URL PATH)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pdf-watermark"
                  value={toolForm.slug}
                  onChange={(e) => setToolForm({ ...toolForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-teal-500/50 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">CATEGORY</label>
                  <select
                    value={toolForm.category}
                    onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-teal-500/50 outline-none transition"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">BADGE</label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, Essential"
                    value={toolForm.badge}
                    onChange={(e) => setToolForm({ ...toolForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-teal-500/50 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Clear overview of what the tool accomplishes..."
                  value={toolForm.desc}
                  onChange={(e) => setToolForm({ ...toolForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-teal-500/50 outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toolForm.active}
                    onChange={(e) => setToolForm({ ...toolForm, active: e.target.checked })}
                    className="accent-teal-400 w-4 h-4"
                  />
                  <span>Active & Live on ToolGhor</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setToolModalOpen(false)}
                    className="px-4 py-2 bg-[#111622] hover:bg-[#161E30] text-slate-400 hover:text-white rounded-xl text-xs font-mono interactive-btn cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-md shadow-teal-500/20"
                  >
                    {editingTool ? "Update Tool" : "Register Tool"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
