"use client";

import { useState, useEffect } from "react";
import { Activity, RefreshCw, Clock, Shield, Database, Lock, UserCheck, Key, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const EVENT_LABELS = {
  login: "Login",
  password_locked: "Password door locked",
  authenticator_locked: "Authenticator door locked",
  device_removed: "Device removed",
  profile_updated: "Profile updated",
  "2fa_enabled": "2FA enabled",
  "2fa_disabled": "2FA disabled",
  recovery_codes_regenerated: "Recovery codes regenerated",
  content_updated: "Content updated",
};

function formatDhakaTime(dateStr) {
  if (!dateStr) return "Unknown";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getEventBadge(event) {
  switch (event) {
    case "login":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "password_locked":
    case "authenticator_locked":
    case "2fa_disabled":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    case "2fa_enabled":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "recovery_codes_regenerated":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "device_removed":
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "profile_updated":
      return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    case "content_updated":
      return "bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30";
    default:
      return "bg-[#12131A] text-[#B9B5A9] border-[#23242B]";
  }
}

export default function ActivityLogManager() {
  const { showToast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.getActivityLog();
      if (res && res.success && Array.isArray(res.activities)) {
        setActivities(res.activities);
      }
    } catch (err) {
      console.error("Failed to load activity log:", err);
      showToast("Failed to load activity logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-6 sm:p-8 space-y-6 rounded-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#23242B] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F5F2EA]">Activity Log</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-[#12131A] text-[#B9B5A9] border border-[#23242B]">
                Last 30 events
              </span>
            </div>
            <p className="text-xs text-[#8E8B82] font-mono mt-0.5">
              Chronological security audit trail and content modifications (Asia/Dhaka time)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchActivities}
          disabled={loading}
          className="stat-box self-start sm:self-auto px-3 py-1.5 bg-[#06070B] border border-[#23242B] text-xs font-mono text-[#8E8B82] hover:text-[#F59E0B] hover:border-[#F59E0B] transition flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
          title="Refresh activity logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#F59E0B]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Activity Log List */}
      {loading && activities.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[#8E8B82]">
          Loading activity log...
        </div>
      ) : activities.length === 0 ? (
        <div className="stat-box p-8 text-center bg-[#06070B] border border-[#23242B] rounded-none">
          <p className="text-xs text-[#8E8B82] font-mono">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#23242B]/60 border border-[#23242B] bg-[#06070B] overflow-hidden rounded-none">
          {activities.map((act) => {
            const label = EVENT_LABELS[act.event] || act.event;
            const badgeClass = getEventBadge(act.event);

            return (
              <div
                key={act.id}
                className="stat-box p-3.5 hover:bg-[#0A0B10]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-none"
              >
                {/* Left: Event label & detail */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-none shrink-0 ${badgeClass}`}
                  >
                    {label}
                  </span>

                  <span className="text-xs text-[#F5F2EA] truncate font-mono">
                    {act.detail || "—"}
                  </span>
                </div>

                {/* Right: IP & Timestamp */}
                <div className="flex items-center gap-4 text-[11px] font-mono text-[#8E8B82] shrink-0 self-end sm:self-auto">
                  <span className="text-[#6E6B64]">{act.ip || "127.0.0.1"}</span>
                  <span className="text-[#B9B5A9]">{formatDhakaTime(act.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
