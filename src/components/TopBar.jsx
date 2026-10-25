"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./Toast";
import AnimatedLogo from "./AnimatedLogo";
import { api } from "@/lib/api";
import { parsePhotoPosition, formatPhotoPosition } from "@/lib/photoPosition";
import ImageUploadBox, { downscalePhotoToWebP } from "@/components/admin/ImageUploadBox";

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

  const [editAvatarPosition, setEditAvatarPosition] = useState(user?.avatar_position || "50% 50%");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  useEffect(() => {
    if (user) {
      if (user.full_name) setEditName(user.full_name);
      if (user.email) setEditEmail(user.email);
      if (user.avatar) setEditAvatar(user.avatar);
      if (user.avatar_position) setEditAvatarPosition(user.avatar_position);
    }
  }, [user, profileModalOpen]);

  // Background upload of avatar with 1024x1024 WebP downscaling
  const executeAvatarUpload = async (file) => {
    setAvatarUploading(true);
    setAvatarProgress(20);

    try {
      const { file: optimizedFile, dataUrl } = await downscalePhotoToWebP(file);
      setAvatarProgress(45);

      const progressTimer = setInterval(() => {
        setAvatarProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await api.uploadMedia(optimizedFile || file);
      clearInterval(progressTimer);
      setAvatarProgress(100);

      if (res && res.success && res.url) {
        setEditAvatar(res.url);
        if (showToast) showToast("Photo uploaded successfully!", "success");
      } else if (dataUrl) {
        setEditAvatar(dataUrl);
        if (showToast) showToast("Loaded photo directly!", "info");
      }
    } catch {
      try {
        const { dataUrl } = await downscalePhotoToWebP(file);
        if (dataUrl) setEditAvatar(dataUrl);
      } catch (_) {}
    } finally {
      setTimeout(() => {
        setAvatarUploading(false);
        setAvatarProgress(0);
      }, 400);
    }
  };

  const handlePhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    executeAvatarUpload(file);
    if (e.target) e.target.value = "";
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
          avatar_position: editAvatarPosition || "50% 50%",
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
          avatar_position: editAvatarPosition || "50% 50%",
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
                <Image
                  src={userAvatar || "/ashifur.jpeg"}
                  alt={displayName}
                  width={28}
                  height={28}
                  unoptimized
                  style={parsePhotoPosition(editAvatarPosition).style}
                  className="w-full h-full object-cover"
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
            className="bg-[#0E131F] border border-[#1E2638] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-modal-enter max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#1E2638] flex items-center justify-between bg-[#111726]/60 shrink-0">
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

            {/* Scrollable Middle: Avatar & Form Fields */}
            <form id="admin-profile-form" onSubmit={handleSaveProfile} className="flex-1 min-h-0 overflow-y-auto">
              {/* Profile Avatar & Super Admin Badge */}
              <div className="p-5 border-b border-[#1E2638]/60 bg-[#0B0F17]/50 space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                    ACTIVE
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono truncate ml-auto">{displayEmail}</span>
                </div>

                <ImageUploadBox
                  value={editAvatar || userAvatar || "/ashifur.jpeg"}
                  type="image"
                  label="Super Admin Profile Photo"
                  description="Profile photo displayed across the administration console"
                  previewAspect="1/1"
                  aspectRatio="square"
                  positionValue={editAvatarPosition || "50% 50%"}
                  onPositionChange={(pos) => setEditAvatarPosition(pos)}
                  defaultValue="/ashifur.jpeg"
                  defaultPosition="50% 50%"
                  uploading={avatarUploading}
                  uploadProgress={avatarProgress}
                  onPickFile={() => document.getElementById("admin-avatar-file-input")?.click()}
                  onReset={() => {
                    setEditAvatar("/ashifur.jpeg");
                    setEditAvatarPosition("50% 50%");
                    if (showToast) showToast("Avatar reset to default!", "info");
                  }}
                  urlValue={editAvatar || ""}
                  onUrlChange={(url) => setEditAvatar(url)}
                  onUrlApply={(url) => {
                    if (url) {
                      setEditAvatar(url);
                    }
                  }}
                >
                  <input
                    id="admin-avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelected}
                    className="hidden"
                  />
                </ImageUploadBox>
              </div>

              {/* Form Body */}
              <div className="p-5 space-y-4">
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
              </div>
            </form>

            {/* Action Buttons Footer (Pinned) */}
            <div className="px-5 py-3.5 border-t border-[#1E2638] bg-[#0A0E18] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-xl hover:bg-[#141A29] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-profile-form"
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
          </div>
        </div>
      )}

    </>
  );
}
