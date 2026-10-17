"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  ExternalLink,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Globe,
  BarChart3,
  Settings,
  Lock,
  Mail,
  Key,
  X,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  Upload,
  Compass,
  Move,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./Toast";
import AnimatedLogo from "./AnimatedLogo";
import { api } from "@/lib/api";

export default function TopBar({ setMobileOpen, setCollapsed, collapsed }) {
  const pathname = usePathname();
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Admin Profile & Security Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || "Ashifur Rahman");
  const [editEmail, setEditEmail] = useState(user?.email || "ashifur.badhon@gmail.com");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "/ashifur.jpeg");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formError, setFormError] = useState("");

  const displayName = user?.full_name || user?.username || "Ashifur Rahman";
  const displayEmail = user?.email || "ashifur.badhon@gmail.com";
  const userAvatar = user?.avatar || "/ashifur.jpeg";

  const [timeGreeting, setTimeGreeting] = useState({ text: "Good Day", emoji: "✨" });
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setTimeGreeting({ text: "Good Morning", emoji: "🌅" });
      } else if (hour >= 12 && hour < 17) {
        setTimeGreeting({ text: "Good Afternoon", emoji: "☀️" });
      } else if (hour >= 17 && hour < 21) {
        setTimeGreeting({ text: "Good Evening", emoji: "🌆" });
      } else {
        setTimeGreeting({ text: "Good Night", emoji: "🌙" });
      }

      setLiveTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateGreeting();
    const timer = setInterval(updateGreeting, 1000);
    return () => clearInterval(timer);
  }, []);

  const [editAvatarPosition, setEditAvatarPosition] = useState("50% 15%");
  const [showAvatarReposition, setShowAvatarReposition] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const avatarDragRef = useRef({ startX: 0, startY: 0, initX: 50, initY: 15 });
  const avatarBoxRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPos = localStorage.getItem("admin_avatar_position");
      if (savedPos) setEditAvatarPosition(savedPos);
    }
  }, []);

  // Facebook-style Drag-to-Reposition for Super Admin Avatar
  const handleAvatarDragStart = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const parts = (editAvatarPosition || "50% 15%").split(" ");
    const initX = parseFloat(parts[0]) || 50;
    const initY = parseFloat(parts[1]) || 15;

    avatarDragRef.current = { startX: clientX, startY: clientY, initX, initY };
    setIsDraggingAvatar(true);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDraggingAvatar || !avatarBoxRef.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const rect = avatarBoxRef.current.getBoundingClientRect();
      const deltaX = clientX - avatarDragRef.current.startX;
      const deltaY = clientY - avatarDragRef.current.startY;

      const newX = Math.max(0, Math.min(100, Math.round(avatarDragRef.current.initX - (deltaX / rect.width) * 100)));
      const newY = Math.max(0, Math.min(100, Math.round(avatarDragRef.current.initY - (deltaY / rect.height) * 100)));

      const posStr = `${newX}% ${newY}%`;
      setEditAvatarPosition(posStr);
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_avatar_position", posStr);
      }
    };

    const handleEnd = () => {
      if (isDraggingAvatar) setIsDraggingAvatar(false);
    };

    if (isDraggingAvatar) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDraggingAvatar]);

  useEffect(() => {
    if (user) {
      if (user.full_name) setEditName(user.full_name);
      if (user.email) setEditEmail(user.email);
      if (user.avatar) setEditAvatar(user.avatar);
    }
  }, [user, profileModalOpen]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image must be smaller than 10MB");
      return;
    }

    try {
      const tempUrl = URL.createObjectURL(file);
      setEditAvatar(tempUrl);
    } catch {}

    setAvatarUploading(true);
    setAvatarProgress(15);

    try {
      const progressTimer = setInterval(() => {
        setAvatarProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await api.uploadMedia(file);
      clearInterval(progressTimer);
      setAvatarProgress(100);

      if (res && res.success && res.url) {
        setEditAvatar(res.url);
        if (showToast) showToast("Photo uploaded successfully!", "success");
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => setEditAvatar(event.target?.result);
      reader.readAsDataURL(file);
    } finally {
      setTimeout(() => {
        setAvatarUploading(false);
        setAvatarProgress(0);
      }, 400);
    }
  };

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      if (setMobileOpen) setMobileOpen((prev) => !prev);
    } else {
      if (setCollapsed) setCollapsed((prev) => !prev);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setFormError("");

    if (!editEmail || !editEmail.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (newPw) {
      if (newPw.length < 6) {
        setFormError("New password must be at least 6 characters.");
        return;
      }
      if (newPw !== confirmPw) {
        setFormError("New password and confirm password do not match.");
        return;
      }
    }

    setSavingProfile(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("cms_auth_token") || "" : "";
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          full_name: editName.trim() || "Ashifur Rahman",
          email: editEmail.trim(),
          avatar: editAvatar || "/ashifur.jpeg",
          current_password: currentPw || undefined,
          new_password: newPw || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      if (updateUser) {
        updateUser({
          full_name: editName.trim() || "Ashifur Rahman",
          email: editEmail.trim(),
          avatar: editAvatar || "/ashifur.jpeg",
        });
      }

      if (newPw) {
        try {
          localStorage.setItem("cms_admin_pw", newPw);
        } catch (e) {}
      }

      setSavingProfile(false);
      setProfileModalOpen(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      if (showToast) {
        showToast(
          newPw
            ? "Super Admin profile and password updated successfully!"
            : "Super Admin profile photo and details saved successfully!",
          "success"
        );
      }
    } catch (err) {
      setSavingProfile(false);
      setFormError(err.message || "Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <header className="h-16 px-3 sm:px-4 md:px-6 border-b border-[#1E2638] bg-[#0B0F17]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-2">
        {/* Left: Mobile/desktop toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg bg-[#111622] text-slate-300 hover:text-white border border-[#1E2638] interactive-btn cursor-pointer shrink-0"
            title="Toggle Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link href="/admin" className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 min-w-0">
            <AnimatedLogo size={26} showText={false} collapsed={collapsed} />
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <span className="text-xs sm:text-base font-bold text-white tracking-tight truncate">Ashifur Rahman</span>
              <span className="text-emerald-400 font-mono text-[11px] sm:text-sm font-medium hidden sm:inline">• Portfolio Admin</span>
            </div>
          </Link>
        </div>

        {/* Click-away backdrop to dismiss dropdowns smoothly */}
        {(notifOpen || profileOpen) && (
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => {
              setNotifOpen(false);
              setProfileOpen(false);
            }}
          />
        )}

        {/* Right: notifications, admin profile */}
        <div className="flex items-center gap-3 relative z-50">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#111622] border border-transparent hover:border-[#1E2638] transition-all duration-150 relative interactive-btn cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            {notifOpen && (
              <div className="animate-dropdown absolute right-0 mt-2 w-72 bg-[#111622] border border-[#1E2638] rounded-xl shadow-xl shadow-black/40 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-[#1E2638] flex justify-between font-mono">
                  <span className="text-white font-bold">System Status</span>
                  <span className="text-emerald-400 text-[10px]">Neon Cloud Connected</span>
                </div>
                <div className="p-3 border-b border-[#1E2638]/60 space-y-1 hover:bg-[#161E30]/50 transition-colors">
                  <p className="text-slate-200 font-medium">7 Webpages Dynamic</p>
                  <p className="text-slate-400 text-[11px]">All sections synchronized with cloud database.</p>
                </div>
                <div className="p-3 space-y-1 hover:bg-[#161E30]/50 transition-colors">
                  <p className="text-slate-200 font-medium">Master Admin Active</p>
                  <p className="text-slate-400 text-[11px]">Authorized session active with full write permissions.</p>
                </div>
              </div>
            )}
          </div>

          {/* Super Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pr-2 rounded-lg hover:bg-[#111622] border border-transparent hover:border-[#1E2638] transition-all duration-150 interactive-btn cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono flex items-center justify-center transition-transform duration-200 hover:scale-105 shrink-0">
                <img
                  src={userAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{displayName}</p>
                <p className="text-[9px] text-emerald-400 font-mono font-bold leading-none tracking-wider">SUPER ADMIN</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="animate-dropdown absolute right-0 mt-2 w-64 bg-[#111622] border border-[#1E2638] rounded-xl shadow-2xl shadow-black/60 py-2 z-50 text-xs">
                {/* Header Profile Badge */}
                <div className="px-4 py-2.5 border-b border-[#1E2638]">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white truncate text-sm">{displayName}</p>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono px-1.5 py-0.5 rounded font-semibold">
                      ROOT ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{displayEmail}</p>
                </div>

                <div className="py-1">
                  {/* 1. Admin Profile Modal Trigger */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-slate-200 hover:text-white hover:bg-[#161E30] transition-colors duration-150 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">Admin Profile</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                      Edit
                    </span>
                  </button>

                  {/* 2. System Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-[#161E30] transition-colors duration-150"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </Link>

                  {/* 6. Sign Out */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors duration-150 border-t border-[#1E2638] mt-1 pt-2 font-mono text-xs cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Logout Action Button */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors interactive-btn cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Profile & Password Security Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className="bg-[#0E131F] border border-[#1E2638] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#1E2638] flex items-center justify-between bg-[#111726]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Super Admin Profile</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Manage email address & security credentials</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2234] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Super Admin Badge */}
            <div className="p-5 border-b border-[#1E2638]/60 bg-[#0B0F17]/50 flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-500/15 border-2 border-emerald-500/40 shadow-lg shrink-0 relative">
                  <img
                    src={editAvatar || userAvatar}
                    alt={displayName}
                    style={{ objectPosition: editAvatarPosition }}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    onError={(e) => {
                      e.currentTarget.src = "/ashifur.jpeg";
                    }}
                  />
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center z-20 animate-in fade-in duration-150">
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-1" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400">{avatarProgress}%</span>
                    </div>
                  )}
                  <label
                    htmlFor="admin-avatar-file-input"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-5 h-5 text-emerald-400 mb-0.5" />
                    <span className="text-[9px] font-mono">Upload</span>
                  </label>
                </div>
                <input
                  id="admin-avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0E131F]" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">{displayEmail}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label
                    htmlFor="admin-avatar-file-input"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAvatarReposition(!showAvatarReposition)}
                    className="px-2.5 py-1 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-emerald-400 border border-emerald-500/25 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{showAvatarReposition ? "Done" : "Reposition"}</span>
                  </button>
                  {editAvatar && editAvatar !== "/ashifur.jpeg" && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditAvatar("/ashifur.jpeg");
                        setEditAvatarPosition("50% 15%");
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("admin_avatar_position");
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white text-[10px] font-mono transition cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar Reposition Panel (Facebook Style Drag) */}
            {showAvatarReposition && (
              <div className="p-4 border-b border-[#1E2638] bg-[#070A0F]/90 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Move className="w-3.5 h-3.5" /> Facebook Drag-to-Reposition:
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded bg-[#161C2A] border border-emerald-500/30">
                    {editAvatarPosition}
                  </span>
                </div>

                {/* Drag Canvas */}
                <div
                  ref={avatarBoxRef}
                  onMouseDown={handleAvatarDragStart}
                  onTouchStart={handleAvatarDragStart}
                  className={`relative w-full h-36 rounded-xl overflow-hidden bg-[#0B0F17] border select-none transition-all ${
                    isDraggingAvatar
                      ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-grabbing"
                      : "border-emerald-500/30 hover:border-emerald-500/60 cursor-grab"
                  }`}
                >
                  <img
                    src={editAvatar || userAvatar}
                    alt="Avatar Reposition"
                    draggable={false}
                    style={{ objectPosition: editAvatarPosition }}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />

                  {isDraggingAvatar && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-400/40 bg-emerald-500/5">
                      <div className="border-r border-b border-emerald-400/20" />
                      <div className="border-r border-b border-emerald-400/20" />
                      <div className="border-b border-emerald-400/20" />
                      <div className="border-r border-b border-emerald-400/20" />
                      <div className="border-r border-b border-emerald-400/20" />
                      <div className="border-b border-emerald-400/20" />
                      <div className="border-r border-emerald-400/20" />
                      <div className="border-r border-emerald-400/20" />
                      <div />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 text-[9px] font-mono text-emerald-300 border border-emerald-500/40 pointer-events-none">
                    <Move className="w-2.5 h-2.5" />
                    <span>{isDraggingAvatar ? "Dragging position..." : "Drag photo to reposition (Facebook style)"}</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                  {[
                    { label: "Top", pos: "50% 5%" },
                    { label: "Face", pos: "50% 15%" },
                    { label: "Center", pos: "50% 50%" },
                    { label: "Lower", pos: "50% 80%" },
                  ].map((p) => (
                    <button
                      key={p.pos}
                      type="button"
                      onClick={() => {
                        setEditAvatarPosition(p.pos);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("admin_avatar_position", p.pos);
                        }
                      }}
                      className={`py-1 rounded border text-center transition cursor-pointer ${
                        editAvatarPosition === p.pos
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold"
                          : "bg-[#161C2A] text-slate-300 border-[#1E2638] hover:border-emerald-500/30"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Vertical Offset (উল্লম্ব ফোকাস)</span>
                    <span className="text-emerald-400 font-bold">{editAvatarPosition.split(" ")[1] || "15%"}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parseFloat(editAvatarPosition.split(" ")[1]) || 15}
                    onChange={(e) => {
                      const x = editAvatarPosition.split(" ")[0] || "50%";
                      const pos = `${x} ${e.target.value}%`;
                      setEditAvatarPosition(pos);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("admin_avatar_position", pos);
                      }
                    }}
                    className="w-full accent-emerald-500 h-1 bg-[#161C2A] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin Full Name</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141A29] border border-[#1E2638] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
                  placeholder="Full Name"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Super Admin Email</span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">(Used for notifications & login)</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141A29] border border-[#1E2638] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition font-mono"
                  placeholder="ashifur.badhon@gmail.com"
                  required
                />
              </div>

              {/* Password Section Divider */}
              <div className="pt-2 border-t border-[#1E2638]/70">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Change Admin Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer transition"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141A29] border border-[#1E2638] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition font-mono"
                      placeholder="Current Password (optional for super admin)"
                    />
                  </div>
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141A29] border border-[#1E2638] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition font-mono"
                      placeholder="New Password (min. 6 characters)"
                    />
                  </div>
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141A29] border border-[#1E2638] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition font-mono"
                      placeholder="Confirm New Password"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Leave password fields blank if you only want to update the email address.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1E2638] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-xl hover:bg-[#141A29] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
