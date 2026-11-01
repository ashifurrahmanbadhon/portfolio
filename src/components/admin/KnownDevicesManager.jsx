"use client";

import { useState, useEffect } from "react";
import { Laptop, Smartphone, Monitor, Trash2, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

function formatDhakaTime(dateStr) {
  if (!dateStr) return "Unknown";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getDeviceIcon(ua = "") {
  const lower = (ua || "").toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return Smartphone;
  }
  if (lower.includes("macintosh") || lower.includes("windows") || lower.includes("linux")) {
    return Laptop;
  }
  return Monitor;
}

export default function KnownDevicesManager() {
  const { showToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await api.getDevices();
      if (res && res.success && Array.isArray(res.devices)) {
        setDevices(res.devices);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      showToast("Failed to load registered devices.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRemove = async (id) => {
    try {
      setRemovingId(id);
      const res = await api.removeDevice(id);
      if (res && res.success) {
        showToast("Device removed. Next login will require verification.", "success");
        setConfirmId(null);
        await fetchDevices();
      } else {
        showToast(res?.error || "Failed to remove device.", "error");
      }
    } catch (err) {
      console.error("Error removing device:", err);
      showToast("Error removing device.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-6 sm:p-8 space-y-6 rounded-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#23242B] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F5F2EA]">Known Devices</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-[#12131A] text-[#B9B5A9] border border-[#23242B]">
                {devices.length} {devices.length === 1 ? "device" : "devices"}
              </span>
            </div>
            <p className="text-xs text-[#8E8B82] font-mono mt-0.5">
              Recognized browser sessions permitted to authenticate into Central CMS
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDevices}
          disabled={loading}
          className="stat-box self-start sm:self-auto px-3 py-1.5 bg-[#06070B] border border-[#23242B] text-xs font-mono text-[#8E8B82] hover:text-[#F59E0B] hover:border-[#F59E0B] transition flex items-center gap-2 cursor-pointer rounded-none disabled:opacity-50"
          title="Refresh devices list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#F59E0B]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Device List */}
      {loading && devices.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[#8E8B82]">
          Loading registered devices...
        </div>
      ) : devices.length === 0 ? (
        <div className="stat-box p-8 text-center bg-[#06070B] border border-[#23242B] rounded-none">
          <p className="text-xs text-[#8E8B82] font-mono">No devices recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const Icon = getDeviceIcon(device.user_agent);
            const isConfirming = confirmId === device.id;
            const isRemoving = removingId === device.id;

            return (
              <div
                key={device.id}
                className={`stat-box p-4 bg-[#06070B] border transition-all rounded-none ${
                  device.is_current
                    ? "border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.06)]"
                    : "border-[#23242B] hover:border-[#F59E0B]/40"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Icon & Summary */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-none border shrink-0 mt-0.5 ${
                        device.is_current
                          ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                          : "bg-[#12131A] border-[#23242B] text-[#8E8B82]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#F5F2EA] truncate">
                          {device.browser_summary || "Unknown Browser / OS"}
                        </span>

                        {device.is_current && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 rounded-none shrink-0">
                            This device
                          </span>
                        )}

                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#12131A] text-[#8E8B82] border border-[#23242B] rounded-none uppercase shrink-0">
                          {device.last_login_method || "password"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[11px] font-mono text-[#8E8B82] pt-1">
                        <div>
                          <span className="text-[#555660]">IP:</span>{" "}
                          <span className="text-[#B9B5A9]">{device.ip_last || device.ip_first || "127.0.0.1"}</span>
                        </div>
                        <div>
                          <span className="text-[#555660]">First seen:</span>{" "}
                          <span className="text-[#B9B5A9]">{formatDhakaTime(device.first_seen_at)}</span>
                        </div>
                        <div>
                          <span className="text-[#555660]">Last seen:</span>{" "}
                          <span className="text-[#B9B5A9]">{formatDhakaTime(device.last_seen_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Hidden for current device) */}
                  {!device.is_current && (
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isConfirming ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                          <button
                            type="button"
                            onClick={() => handleRemove(device.id)}
                            disabled={isRemoving}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold rounded-none transition cursor-pointer"
                          >
                            {isRemoving ? "Removing..." : "Confirm Remove"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={isRemoving}
                            className="px-2 py-1 bg-[#12131A] hover:bg-[#1a1b22] text-[#8E8B82] text-[11px] font-mono rounded-none border border-[#23242B] transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(device.id)}
                          className="stat-box px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:border-rose-500/50 bg-[#06070B] border border-[#23242B] text-[11px] font-mono rounded-none transition flex items-center gap-1.5 cursor-pointer"
                          title="Revoke and remove device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
