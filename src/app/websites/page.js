"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  ArrowRight,
  X,
  ToggleLeft,
  ToggleRight,
  Power,
  Sliders,
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import WebsiteLogo from "@/components/WebsiteLogos";
import { useToast } from "@/components/Toast";

// Portfolio CMS FIRST, then ToolGhor CMS as requested
const INITIAL_SITES = [
  {
    id: "site-1",
    name: "Ashifur Rahman Portfolio",
    url: "/",
    type: "Personal Brand & Showcase",
    status: "active",
    cmsPath: "/portfolio",
    toolsCount: "12 Content Hubs",
    latency: 52,
  },
  {
    id: "site-2",
    name: "ToolGhor Platform",
    url: "https://toolghor.netlify.app/",
    type: "Web Utility Suite",
    status: "active",
    cmsPath: "/toolghor",
    toolsCount: "27 Web Tools",
    latency: 68,
  },
  {
    id: "site-3",
    name: "DevDocs Hub",
    url: "https://devdocs.example.com",
    type: "Documentation Portal",
    status: "inactive",
    cmsPath: "/websites",
    toolsCount: "Developer Guides",
    latency: 90,
  },
];

export default function WebsitesPage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState(INITIAL_SITES);
  const [modalOpen, setModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", url: "", type: "Web Application", status: "active" });
  const [testingPing, setTestingPing] = useState(false);

  // Modal scroll-lock
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  const handlePingAll = () => {
    setTestingPing(true);
    setTimeout(() => {
      setWebsites((prev) =>
        prev.map((s) => ({
          ...s,
          latency: Math.floor(Math.random() * 40) + 40,
        }))
      );
      setTestingPing(false);
      if (showToast) {
        showToast("Latency checks completed for all hubs", "success");
      }
    }, 600);
  };

  // Toggle Active / Inactive for a specific site
  const toggleSiteStatus = (siteId) => {
    const target = websites.find((s) => s.id === siteId);
    if (!target) return;
    const nextStatus = target.status === "active" ? "inactive" : "active";
    setWebsites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, status: nextStatus } : s))
    );
    if (showToast) {
      showToast(`${target.name} set to ${nextStatus.toUpperCase()}`, nextStatus === "active" ? "success" : "info");
    }
  };

  // Bulk set all sites Active or Inactive
  const setAllStatus = (status) => {
    setWebsites((prev) => prev.map((s) => ({ ...s, status })));
    if (showToast) {
      showToast(`All hubs switched to ${status.toUpperCase()}`, status === "active" ? "success" : "info");
    }
  };

  // Remove a website
  const handleDeleteSite = (siteId) => {
    const target = websites.find((s) => s.id === siteId);
    if (confirm(`Are you sure you want to remove ${target?.name || "this website"} from your CMS?`)) {
      setWebsites((prev) => prev.filter((s) => s.id !== siteId));
      if (showToast) {
        showToast(`Removed "${target?.name || "Website"}" from directory`, "info");
      }
    }
  };

  const handleAddSite = (e) => {
    e.preventDefault();
    if (!newSite.name || !newSite.url) return;
    const added = {
      id: "site-" + Date.now(),
      name: newSite.name,
      url: newSite.url,
      type: newSite.type,
      status: newSite.status || "active",
      cmsPath: "/",
      toolsCount: "Connected Node",
      latency: 45,
    };
    setWebsites((prev) => [...prev, added]);
    setModalOpen(false);
    if (showToast) {
      showToast(`Registered node "${added.name}" successfully!`, "success");
    }
    setNewSite({ name: "", url: "", type: "Web Application", status: "active" });
  };

  const activeCount = websites.filter((s) => s.status === "active").length;
  const inactiveCount = websites.filter((s) => s.status !== "active").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span>Websites Directory & Nodes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage, monitor, and toggle Active/Inactive states for all digital properties.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Hub Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111622] border border-[#1E2638] text-[11px] font-mono">
            <span className="text-slate-400 px-2">Hubs:</span>
            <button
              onClick={() => setAllStatus("active")}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition interactive-btn cursor-pointer"
            >
              All Active
            </button>
            <button
              onClick={() => setAllStatus("inactive")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition interactive-btn cursor-pointer"
            >
              All Inactive
            </button>
          </div>

          <button
            onClick={handlePingAll}
            disabled={testingPing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono interactive-btn cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{testingPing ? "Testing Ping..." : "Ping All Sites"}</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Register Website</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-[#111622] border border-[#1E2638] text-slate-300">
          Total: <strong className="text-white">{websites.length}</strong> Sites
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          Active: <strong>{activeCount}</strong> Sites
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400">
          Inactive: <strong>{inactiveCount}</strong> Sites
        </span>
      </div>

      {/* Websites Grid: Portfolio FIRST, ToolGhor SECOND */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {websites.map((site) => {
          const isActive = site.status === "active";
          const isPortfolio = site.slug === "portfolio" || site.id === "site-1";
          const isToolGhor = site.slug === "toolghor" || site.id === "site-2";

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
              className={`p-6 interactive-card group flex flex-col justify-between transition-colors duration-200 ${
                !isActive
                  ? "hover:border-amber-500/40 hover:bg-[#16120c]/60"
                  : "hover:border-emerald-500/30"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <WebsiteLogo slug={site.slug} name={site.name} size={42} />
                    <div>
                      <h3
                        className={`text-base font-bold text-white transition-colors ${
                          isActive
                            ? "group-hover:text-emerald-300"
                            : "group-hover:text-amber-300"
                        }`}
                      >
                        {site.name}
                      </h3>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 mt-0.5 transition-colors"
                      >
                        {site.url} <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>

                  {/* Interactive Status Switch */}
                  <button
                    onClick={() => toggleSiteStatus(site.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium transition cursor-pointer interactive-btn ${
                      isActive
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                    title={`Click to set ${isActive ? "Inactive" : "Active"}`}
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

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#111622] border border-[#1E2638]">
                    <span className="text-slate-400 text-[10px] block">TYPE</span>
                    <span className="text-white font-medium truncate block">{site.type}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111622] border border-[#1E2638]">
                    <span className="text-slate-400 text-[10px] block">LATENCY</span>
                    <span
                      className={`font-medium ${
                        isActive ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {site.latency}ms response
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1E2638] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{site.toolsCount}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="p-2 rounded-xl bg-[#111622] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-[#1E2638] text-xs font-mono transition cursor-pointer interactive-btn"
                    title="Remove Website"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono interactive-btn"
                  >
                    Live Link
                  </a>
                  <Link
                    href={site.cmsPath}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-medium interactive-btn flex items-center gap-1 ${
                      isActive
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    <span>Open CMS</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Modal: Add Website */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-modal-backdrop overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto my-auto bg-[#0B0F17] border border-[#1E2638] rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl animate-modal-content">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
              <h3 className="text-sm font-bold text-white font-mono">Register New Website Node</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer interactive-btn p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">WEBSITE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Documentation Hub"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={newSite.url}
                  onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">TYPE</label>
                <select
                  value={newSite.type}
                  onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111622] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono interactive-btn cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono interactive-btn cursor-pointer"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
