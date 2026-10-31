"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  Loader2,
} from "lucide-react";

export default function FloatingAdminPanel() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const panelRef = useRef(null);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("cms_auth_token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/auth/me", { headers, credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch (_) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkSession();
    const handleFocus = () => checkSession();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkSession();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("cms_auth_token") : null;
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    } finally {
      try {
        localStorage.removeItem("cms_auth_token");
        localStorage.removeItem("cms_auth_user");
        localStorage.removeItem("cms_auth_exp");
        document.cookie = "cms_auth_token=; path=/; max-age=0;";
      } catch (_) {}
      setUser(null);
      setIsOpen(false);
      setLoggingOut(false);
      router.refresh();
    }
  };

  if (!user) return null;

  return (
    <div ref={panelRef}>
      {/* Trigger Pill at bottom-left */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Admin Panel"
        aria-expanded={isOpen}
        className="fixed bottom-[22px] left-[22px] z-40 flex items-center gap-2 h-11 px-4 rounded-full bg-[#0A0B10]/95 backdrop-blur-md border border-[#23242B] text-[#F5F2EA] hover:text-[#F59E0B] hover:border-[#F59E0B]/60 shadow-lg shadow-black/40 text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none"
      >
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
        <Shield size={14} className="text-[#F59E0B]" />
        <span>Admin</span>
      </button>

      {/* Popup Panel above pill */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Admin Quick Links"
          className="fixed bottom-[74px] left-[22px] z-40 w-[270px] max-w-[calc(100vw-44px)] bg-[#0A0B10] border border-[#23242B] rounded-2xl shadow-2xl p-3 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#23242B] mb-1">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#F5F2EA] tracking-wide">Central Admin</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#8E8B82] hover:text-white hover:bg-white/5 transition cursor-pointer"
              aria-label="Close admin panel"
            >
              <X size={15} />
            </button>
          </div>

          {/* Quick Links */}
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#B9B5A9] hover:text-[#F59E0B] hover:bg-white/5 transition cursor-pointer"
          >
            <LayoutDashboard size={15} className="text-[#F59E0B]" />
            <span>Admin Dashboard</span>
          </Link>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#B9B5A9] hover:text-[#F59E0B] hover:bg-white/5 transition cursor-pointer"
          >
            <Settings size={15} className="text-[#F59E0B]" />
            <span>Settings</span>
          </Link>

          <div className="border-t border-[#23242B] my-1 pt-1" />

          {/* Log Out Button */}
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut size={14} />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
