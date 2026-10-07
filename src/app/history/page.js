"use client";

import { useState, useEffect, useMemo } from "react";
import {
  History,
  RotateCw,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  Sparkles,
  Wrench,
  Globe,
  Settings,
  KeyRound,
  FileEdit,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import ShimmerBadge from "@/components/ShimmerBadge";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

// Format ISO date to friendly string
function formatEventTime(isoString) {
  if (!isoString) return { relative: "Recently", full: "Just now" };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { relative: "Recently", full: isoString };

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    let relative = "";
    if (diffSec < 60) relative = "Just now";
    else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)}m ago`;
    else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)}h ago`;
    else relative = `${Math.floor(diffSec / 86400)}d ago`;

    const full = d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return { relative, full };
  } catch (e) {
    return { relative: "Recently", full: isoString };
  }
}

// Map action type to color, badge, and icon
function getActionMeta(action = "", details = "") {
  const lower = (action + " " + details).toLowerCase();

  if (lower.includes("2fa") || lower.includes("security") || lower.includes("lockout")) {
    return {
      Icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      tag: "Security",
    };
  }
  if (lower.includes("login") || lower.includes("authenticated")) {
    return {
      Icon: LogIn,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      tag: "Session",
    };
  }
  if (lower.includes("logout") || lower.includes("signed out")) {
    return {
      Icon: LogOut,
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/30",
      tag: "Session",
    };
  }
  if (lower.includes("password") || lower.includes("reset")) {
    return {
      Icon: KeyRound,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      tag: "Auth & Key",
    };
  }
  if (lower.includes("toolghor") || lower.includes("tool")) {
    return {
      Icon: Wrench,
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30",
      tag: "ToolGhor",
    };
  }
  if (lower.includes("portfolio") || lower.includes("project") || lower.includes("skill")) {
    return {
      Icon: Sparkles,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      tag: "Portfolio",
    };
  }
  return {
    Icon: FileEdit,
    color: "text-slate-300",
    bgColor: "bg-slate-800/60",
    borderColor: "border-[#1E2638]",
    tag: "Dashboard Change",
  };
}

export default function ChangeHistoryPage() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filterTabs = [
    { id: "all", label: "All History" },
    { id: "security", label: "Security & 2FA" },
    { id: "session", label: "Logins & Sessions" },
    { id: "portfolio", label: "Portfolio Updates" },
    { id: "toolghor", label: "ToolGhor Platform" },
  ];

  const fetchHistory = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getHistory({ limit: 120 });
      if (res && res.success) {
        setHistory(res.history || []);
        setTotalCount(res.total || (res.history || []).length);
        if (isManual && showToast) {
          showToast("Change history refreshed!", "success");
        }
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      if (isManual && showToast) {
        showToast("Failed to refresh history.", "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory(false);
  }, []);

  // Filtered items based on search and active tab
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.action && item.action.toLowerCase().includes(q)) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        (item.website_name && item.website_name.toLowerCase().includes(q)) ||
        (item.user && item.user.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedFilter === "all") return true;
      const lower = ((item.action || "") + " " + (item.details || "")).toLowerCase();
      if (selectedFilter === "security") {
        return lower.includes("2fa") || lower.includes("security") || lower.includes("password") || lower.includes("lockout");
      }
      if (selectedFilter === "session") {
        return lower.includes("login") || lower.includes("logout") || lower.includes("session");
      }
      if (selectedFilter === "portfolio") {
        return lower.includes("portfolio") || (item.website_name && item.website_name.toLowerCase().includes("portfolio"));
      }
      if (selectedFilter === "toolghor") {
        return lower.includes("tool") || (item.website_name && item.website_name.toLowerCase().includes("toolghor"));
      }
      return true;
    });
  }, [history, search, selectedFilter]);

  // Metric counts
  const securityCount = useMemo(() => {
    return history.filter((h) => {
      const l = ((h.action || "") + " " + (h.details || "")).toLowerCase();
      return l.includes("2fa") || l.includes("security") || l.includes("password");
    }).length;
  }, [history]);

  const sessionCount = useMemo(() => {
    return history.filter((h) => {
      const l = ((h.action || "") + " " + (h.details || "")).toLowerCase();
      return l.includes("login") || l.includes("logout");
    }).length;
  }, [history]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Change History & Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time chronological log of all administrative modifications, content updates, security events, and logins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ShimmerBadge variant="emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span>
            <span>Real-time Log Active</span>
          </ShimmerBadge>

          <button
            onClick={() => fetchHistory(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-[#111622] hover:bg-[#161C2A] text-slate-300 hover:text-white border border-[#1E2638] transition flex items-center gap-2 cursor-pointer interactive-btn shadow-sm"
            title="Refresh history logs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* 2. Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <SpotlightCard className="p-4 interactive-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-300">Total Logged Changes</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] text-emerald-400 flex items-center justify-center">
              <History className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{totalCount}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Audit log records</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 interactive-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-300">Security Events</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{securityCount}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">2FA, auth & security</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 interactive-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-300">Admin Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] text-sky-400 flex items-center justify-center">
              <LogIn className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-400 font-mono">{sessionCount}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Authentications</p>
        </SpotlightCard>

        <SpotlightCard className="p-4 interactive-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-300">Active Admin</span>
            <div className="w-7 h-7 rounded-lg bg-[#161C2A] text-purple-400 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-sm font-bold text-white truncate">Ashifur Rahman</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-1">Super Admin Role</p>
        </SpotlightCard>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#111622] border border-[#1E2638]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search changes by action, details, or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 font-mono outline-none transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => {
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/20"
                    : "bg-[#0A0D12] text-slate-400 hover:text-white border border-[#1E2638]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Timeline Event Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading Change History logs...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#111622] border border-[#1E2638] p-6">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No history records found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? `No change logs match your search query "${search}".`
                : "No activity logs recorded under this category yet."}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const meta = getActionMeta(item.action, item.details);
            const ActionIcon = meta.Icon;
            const time = formatEventTime(item.created_at);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] hover:border-emerald-500/30 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Icon, Action, Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.bgColor} ${meta.borderColor} ${meta.color} group-hover:scale-105 transition-transform`}
                  >
                    <ActionIcon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {item.action}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${meta.bgColor} ${meta.borderColor} ${meta.color}`}
                      >
                        {meta.tag}
                      </span>
                      {item.website_name && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161C2A] text-slate-300 border border-[#1E2638]">
                          {item.website_name}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {item.details || "No additional metadata recorded."}
                    </p>
                  </div>
                </div>

                {/* Right: User & Timestamp */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 font-mono text-[11px] text-slate-400 gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1E2638]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.user || "Ashifur Rahman"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px]" title={time.full}>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{time.relative}</span>
                    <span className="hidden lg:inline">• {time.full}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
