"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Wrench,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Plus,
  Zap,
  Clock,
  Activity,
  Sliders,
  BarChart2,
  X,
  Check,
  CloudSun,
  Power,
  ToggleLeft,
  ToggleRight,
  History,
  ArrowRight,
} from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";
import CountUp from "@/components/CountUp";
import SpotlightCard from "@/components/SpotlightCard";
import ShimmerBadge from "@/components/ShimmerBadge";
import LiveHeaderMeta from "@/components/LiveHeaderMeta";
import WebsiteLogo from "@/components/WebsiteLogos";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

// Portfolio CMS is FIRST, then ToolGhor CMS as requested
const INITIAL_WEBSITES = [
  {
    id: "site-1",
    name: "Portfolio",
    subId: null,
    slug: "portfolio",
    url: "https://ashifurrahman.netlify.app",
    description: "Ashifur Rahman official engineering portfolio & interactive showcase.",
    status: "active",
    cmsPath: "/portfolio",
    updated_at: "2026-10-07",
    logoType: "ar",
  },
  {
    id: "site-2",
    name: "ToolGhor",
    subId: null,
    slug: "toolghor",
    url: "https://toolghor.netlify.app/",
    description: "All-in-one web tools platform with 27+ document, image, calculator, QR, media & resume utilities.",
    status: "active",
    cmsPath: "/toolghor",
    updated_at: "2026-10-07",
    logoType: "tg",
  },
  {
    id: "site-3",
    name: "DevDocs Hub",
    subId: "1791350575",
    slug: "devdocs",
    url: "https://devdocs.example.com",
    description: "Developer documentation portal",
    status: "inactive",
    cmsPath: "/websites",
    updated_at: "2026-10-07",
    logoType: "dev",
  },
];

export default function CentralDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [websites, setWebsites] = useState(INITIAL_WEBSITES);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Dynamic greeting that changes according to time periods
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good morning");
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting("Good afternoon");
      } else if (currentHour >= 17 && currentHour < 22) {
        setGreeting("Good evening");
      } else {
        setGreeting("Good night");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 30000);
    return () => clearInterval(interval);
  }, []);

  // Recent Change History logs for dashboard overview
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    api.getHistory({ limit: 4 })
      .then((res) => {
        if (res && res.history) setRecentLogs(res.history);
      })
      .catch(() => {});
  }, []);

  // Form for adding a website
  const [newSite, setNewSite] = useState({
    name: "",
    url: "",
    description: "",
    status: "active",
    type: "Web Application",
  });

  // Modal scroll-lock
  useEffect(() => {
    if (addModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [addModalOpen]);

  // Dynamic KPI counts based on active/inactive states
  const totalWebsites = websites.length;
  const activeWebsites = websites.filter((s) => s.status === "active").length;
  const inactiveWebsites = websites.filter((s) => s.status !== "active").length;
  const recentUpdates = 20;

  // Toggle Active / Inactive for a specific website
  const toggleSiteStatus = (siteId) => {
    const target = websites.find((s) => s.id === siteId);
    if (!target) return;
    const nextStatus = target.status === "active" ? "inactive" : "active";
    setWebsites((prev) =>
      prev.map((site) => (site.id === siteId ? { ...site, status: nextStatus } : site))
    );
    if (showToast) {
      showToast(
        `${target.name} hub set to ${nextStatus.toUpperCase()}`,
        nextStatus === "active" ? "success" : "info"
      );
    }
  };

  // Toggle All Hubs Active or Inactive
  const setAllHubsStatus = (status) => {
    setWebsites((prev) => prev.map((site) => ({ ...site, status })));
    if (showToast) {
      showToast(
        `All hubs switched to ${status.toUpperCase()}`,
        status === "active" ? "success" : "info"
      );
    }
  };

  const handleAddWebsite = (e) => {
    e.preventDefault();
    if (!newSite.name || !newSite.url) return;

    const created = {
      id: "site-" + Date.now(),
      name: newSite.name,
      subId: String(Math.floor(Math.random() * 900000000 + 100000000)),
      slug: newSite.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      url: newSite.url,
      description: newSite.description || `${newSite.name} registered node on Central CMS.`,
      status: newSite.status,
      cmsPath: "/websites",
      updated_at: new Date().toISOString().split("T")[0],
      logoType: "dev",
    };

    setWebsites((prev) => [...prev, created]);
    setAddModalOpen(false);
    if (showToast) {
      showToast(`Registered "${created.name}" successfully!`, "success");
    }
    setNewSite({
      name: "",
      url: "",
      description: "",
      status: "active",
      type: "Web Application",
    });
  };

  const displayName = user?.full_name || "Super Admin";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Greeting Banner matching screenshot (Date, Day, Time, Weather, no "Central Control Center") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]/70">
        <div className="space-y-2">
          {/* Metadata Badges: Live Dot, Day, Date, Time, Weather (Isolated to prevent root re-render) */}
          <LiveHeaderMeta />

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {displayName} 👋
          </h2>
          <p className="text-xs text-slate-400">
            Manage all your digital properties, sync content, and track operational metrics from one place.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 transition duration-200 shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer interactive-btn"
          >
            <Plus className="w-4 h-4" /> Add Website
          </button>
        </div>
      </div>

      {/* 2. Stats Cards Grid (4 Cards) with React Bits / Aceternity SpotlightCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Websites */}
        <SpotlightCard className="p-4 group interactive-card">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium text-slate-300">Total Websites</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] group-hover:bg-emerald-500/15 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            <CountUp to={totalWebsites} duration={450} />
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Registered domains</span>
          </div>
        </SpotlightCard>

        {/* Active Websites */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.12)"
          borderColor="rgba(16, 185, 129, 0.25)"
          className="p-4 group interactive-card"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium text-slate-300">Active Websites</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            <CountUp to={activeWebsites} duration={450} />
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{Math.round((activeWebsites / Math.max(1, totalWebsites)) * 100)}% operational</span>
          </div>
        </SpotlightCard>

        {/* Inactive Websites */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.08)"
          borderColor="rgba(245, 158, 11, 0.15)"
          className="p-4 group interactive-card"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium text-slate-300">Inactive Websites</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] text-slate-500 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-300 font-mono">
            <CountUp to={inactiveWebsites} duration={450} />
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Standby / Inactive</span>
          </div>
        </SpotlightCard>

        {/* Recent Updates */}
        <SpotlightCard
          spotlightColor="rgba(6, 182, 212, 0.08)"
          borderColor="rgba(6, 182, 212, 0.15)"
          className="p-4 group interactive-card"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium text-slate-300">Recent Updates</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] group-hover:bg-cyan-500/15 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            <CountUp to={recentUpdates} duration={500} />
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mt-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Content syncs</span>
          </div>
        </SpotlightCard>
      </div>



      {/* 4. Websites Section (With Active/Inactive toggle options for all hubs) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Websites Directory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click status switches to instantly toggle Active or Inactive status for any connected hub.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Active/Inactive quick toggles */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111622] border border-[#1E2638] text-[11px] font-mono flex-wrap">
              <span className="text-slate-400 px-2">Hub Controls:</span>
              <button
                onClick={() => setAllHubsStatus("active")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition interactive-btn cursor-pointer"
                title="Activate all hubs"
              >
                All Active
              </button>
              <button
                onClick={() => setAllHubsStatus("inactive")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition interactive-btn cursor-pointer"
                title="Deactivate all hubs"
              >
                All Inactive
              </button>
            </div>

            <Link href="/websites" className="text-xs text-emerald-400 hover:text-emerald-300 font-mono transition ml-2 interactive-btn">
              View All &rarr;
            </Link>
          </div>
        </div>

        {/* Websites Cards Grid: Portfolio FIRST, ToolGhor SECOND */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => {
            const isToolGhor = site.slug === "toolghor";
            const isPortfolio = site.slug === "portfolio";
            const isActive = site.status === "active";

            return (
              <SpotlightCard
                key={site.id}
                spotlightColor={
                  !isActive
                    ? "rgba(245, 158, 11, 0.14)"
                    : isPortfolio
                    ? "rgba(16, 185, 129, 0.12)"
                    : isToolGhor
                    ? "rgba(20, 184, 166, 0.12)"
                    : "rgba(148, 163, 184, 0.08)"
                }
                borderColor={
                  !isActive
                    ? "rgba(245, 158, 11, 0.45)"
                    : isPortfolio
                    ? "rgba(16, 185, 129, 0.3)"
                    : isToolGhor
                    ? "rgba(20, 184, 166, 0.3)"
                    : "rgba(30, 38, 56, 1)"
                }
                className={`p-5 flex flex-col justify-between space-y-4 group interactive-card transition-colors duration-200 ${
                  !isActive
                    ? "hover:border-amber-500/40 hover:bg-[#16120c]/60"
                    : "hover:border-emerald-500/30"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header with Active/Inactive Toggle Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Official Website Brand Logo */}
                      <WebsiteLogo slug={site.slug} name={site.name} size={38} />

                      <div className="leading-tight">
                        <div
                          className={`text-sm font-bold text-white transition ${
                            isActive
                              ? "group-hover:text-emerald-400"
                              : "group-hover:text-amber-400"
                          }`}
                        >
                          {site.name}
                        </div>
                        {site.subId && (
                          <div className="text-[10px] text-slate-500 font-mono">{site.subId}</div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[190px]">
                          {site.url}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Active/Inactive Switch Button */}
                    <button
                      onClick={() => toggleSiteStatus(site.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium transition-all duration-200 cursor-pointer interactive-btn ${
                        isActive
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/10"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs shadow-amber-500/10"
                      }`}
                      title={`Click to switch to ${isActive ? "Inactive" : "Active"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`}
                      ></span>
                      <span className="capitalize">{isActive ? "Active" : "Inactive"}</span>
                      {isActive ? (
                        <ToggleRight className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                      ) : (
                        <ToggleLeft className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[36px]">
                    {site.description}
                  </p>

                  {/* Status & Last Updated */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-[#1E2638]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`}
                      ></span>
                      <span className={isActive ? "text-slate-300" : "text-amber-400/90 font-medium"}>
                        {isActive ? "Live Linked" : "Standby Mode"}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Updated: <span className="text-slate-300">{site.updated_at}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#1E2638]">
                  <Link
                    href={site.cmsPath}
                    className={`flex-1 py-2 px-3 rounded-xl text-black text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm interactive-btn ${
                      isActive
                        ? "bg-emerald-500 hover:bg-emerald-400"
                        : "bg-amber-500 hover:bg-amber-400"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Manage CMS</span>
                  </Link>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 hover:text-white text-xs font-semibold border border-[#1E2638] flex items-center justify-center gap-1.5 transition active:scale-95 interactive-btn"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Site</span>
                  </a>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Change History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Recent Change History</h3>
              <p className="text-[11px] text-slate-400">Live feed of all administrative edits and modifications across Central CMS</p>
            </div>
          </div>

          <Link
            href="/history"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition group"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentLogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentLogs.map((log) => (
              <SpotlightCard key={log.id} className="p-3.5 interactive-card flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 truncate max-w-[120px]">
                      {log.website_name || "Central CMS"}
                    </span>
                    <span className="text-slate-500">
                      {log.created_at ? log.created_at.split("T")[1]?.slice(0, 5) || "Just now" : "Recent"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate pt-0.5" title={log.action}>
                    {log.action}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed" title={log.details}>
                    {log.details || "Administrative update performed."}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1E2638] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>By: <strong className="text-slate-300 font-normal">{log.user || "Ashifur Rahman"}</strong></span>
                  <span className="text-emerald-400/80">Logged</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] text-xs font-mono text-slate-400 text-center">
            Synchronizing recent change history...
          </div>
        )}
      </div>

      {/* 5. Add Website Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-modal-backdrop overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto my-auto bg-[#0B0F17] border border-[#1E2638] rounded-2xl shadow-2xl animate-modal-content">
            <div className="p-5 border-b border-[#1E2638] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register Website Property</h3>
                  <p className="text-[11px] text-slate-400">Connect a new domain to Central CMS</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#111622] cursor-pointer interactive-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWebsite} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">WEBSITE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Documentation Hub"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#111622] border border-[#1E2638] text-white text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">LIVE URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={newSite.url}
                  onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#111622] border border-[#1E2638] text-white text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 block">CATEGORY / TYPE</label>
                  <select
                    value={newSite.type}
                    onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#111622] border border-[#1E2638] text-white text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="Web Application">Web Application</option>
                    <option value="Personal Brand & Showcase">Personal Brand & Showcase</option>
                    <option value="E-Commerce Platform">E-Commerce Platform</option>
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="Web Utility Suite">Web Utility Suite</option>
                    <option value="Developer API Hub">Developer API Hub</option>
                    <option value="Blog & Publishing">Blog & Publishing</option>
                    <option value="Documentation Portal">Documentation Portal</option>
                    <option value="Educational Portal">Educational Portal</option>
                    <option value="AI & Machine Learning Tool">AI & Machine Learning Tool</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 block">INITIAL STATUS</label>
                  <select
                    value={newSite.status}
                    onChange={(e) => setNewSite({ ...newSite, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#111622] border border-[#1E2638] text-white text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this website property..."
                  value={newSite.description}
                  onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#111622] border border-[#1E2638] text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-300 text-xs font-mono cursor-pointer interactive-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer interactive-btn"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Register Node</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
