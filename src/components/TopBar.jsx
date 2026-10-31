"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  KeyRound,
  X,
  Check,
  Eye,
  EyeOff,
  Camera,
  Upload,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./Toast";
import { parsePhotoPosition } from "@/lib/photoPosition";
import ImageUploadBox from "@/components/admin/ImageUploadBox";

const BREADCRUMB_MAP = {
  dashboard: { group: "Overview", tab: "Dashboard" },
  home: { group: "Pages", tab: "Home & Hero" },
  about: { group: "Pages", tab: "About" },
  projects: { group: "Pages", tab: "Projects" },
  work: { group: "Pages", tab: "Work Packages" },
  experience: { group: "Pages", tab: "Experience" },
  skills: { group: "Pages", tab: "Skills" },
  education: { group: "Pages", tab: "Education" },
  contact: { group: "Pages", tab: "Contact" },
  settings: { group: "Site Content", tab: "Page Headers & Settings" },
  headings: { group: "Site Content", tab: "Headings & Texts" },
  seo: { group: "Site Content", tab: "SEO Titles" },
  inbox: { group: "Site Content", tab: "Inbox" },
  ai_chat: { group: "System", tab: "AI Chat" },
  security: { group: "System", tab: "Security" },
  system_settings: { group: "System", tab: "Settings" },
};

function BreadcrumbDisplay() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const item = BREADCRUMB_MAP[tab] || { group: "Pages", tab: "Home & Hero" };

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      <span className="text-[#8E8B82]">{item.group}</span>
      <span className="text-[#23242B]">/</span>
      <span className="text-[#F5F2EA] font-semibold">{item.tab}</span>
    </div>
  );
}

export default function TopBar({ setMobileOpen, setCollapsed, collapsed }) {
  const pathname = usePathname();
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);

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
      } catch (_) { }
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
        } catch (e) { }
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
      <header className="h-14 px-4 sm:px-6 border-b border-[#23242B] bg-[#0A0B10] sticky top-0 z-40 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger menu & breadcrumb title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileOpen?.(true)}
            className="lg:hidden p-1.5 rounded-lg bg-[#06070B] text-[#8E8B82] hover:text-[#F5F2EA] border border-[#23242B] transition cursor-pointer shrink-0"
            title="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Suspense fallback={<div className="text-xs font-mono text-[#8E8B82]">Overview / Dashboard</div>}>
            <BreadcrumbDisplay />
          </Suspense>
        </div>

        {/* Click-away backdrop to dismiss dropdown smoothly */}
        {profileOpen && (
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => setProfileOpen(false)}
          />
        )}

        {/* Right: Live status pill, presence pill, admin profile */}
        <div className="flex items-center gap-3 relative z-50">
          {/* Live Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12131A] border border-[#23242B] text-[11px] font-mono text-[#8E8B82]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Production Live</span>
          </div>

          {/* Presence Pill */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12131A] border border-[#23242B] text-[11px] font-mono text-[#8E8B82]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
            <span>Ashifur · online</span>
          </div>

          {/* Super Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#12131A] border border-transparent hover:border-[#23242B] transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#06070B] border border-[#23242B] text-[#F59E0B] text-xs font-bold font-mono flex items-center justify-center shrink-0">
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
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-[#F5F2EA] leading-tight">{displayName}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8E8B82] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="animate-dropdown absolute right-0 mt-2 w-64 bg-[#0A0B10] border border-[#23242B] rounded-xl shadow-2xl py-2 z-50 text-xs">
                {/* Header Profile Badge */}
                <div className="px-4 py-2.5 border-b border-[#23242B]">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#F5F2EA] truncate text-sm">{displayName}</p>
                    <span className="text-[9px] bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 font-mono px-1.5 py-0.5 rounded font-semibold">
                      ROOT ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E8B82] font-mono truncate mt-0.5">{displayEmail}</p>
                </div>

                <div className="py-1">
                  {/* 1. Edit Profile */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-[#B9B5A9] hover:text-[#F5F2EA] hover:bg-[#12131A] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="font-medium">Edit Profile</span>
                    </div>
                    <span className="text-[10px] bg-[#161B26] text-[#8E8B82] border border-[#23242B] px-1.5 py-0.5 rounded font-mono">
                      Edit
                    </span>
                  </button>

                  {/* 2. Change Password */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-[#B9B5A9] hover:text-[#F5F2EA] hover:bg-[#12131A] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="font-medium">Change Password</span>
                    </div>
                    <span className="text-[10px] bg-[#161B26] text-[#8E8B82] border border-[#23242B] px-1.5 py-0.5 rounded font-mono">
                      Key
                    </span>
                  </button>

                  {/* 3. Sign Out */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border-t border-[#23242B] mt-1 pt-2 font-mono text-xs cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Admin Profile & Password Security Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className="bg-[#0A0B10] border border-[#23242B] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#23242B] flex items-center justify-between bg-[#06070B] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F2EA] leading-tight">Super Admin Profile</h3>
                  <p className="text-[10px] text-[#8E8B82] font-mono">Manage email address & security credentials</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8E8B82] hover:text-[#F5F2EA] hover:bg-[#12131A] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Middle: Avatar & Form Fields */}
            <form id="admin-profile-form" onSubmit={handleSaveProfile} className="flex-1 min-h-0 overflow-y-auto">
              {/* Profile Avatar & Super Admin Badge */}
              <div className="p-5 border-b border-[#23242B] bg-[#06070B]/50 space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#F5F2EA] truncate">{displayName}</h4>
                  <span className="text-[9px] bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                    ACTIVE
                  </span>
                  <span className="text-[11px] text-[#8E8B82] font-mono truncate ml-auto">{displayEmail}</span>
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
                  <label className="text-[11px] font-mono text-[#8E8B82] flex items-center gap-1.5 uppercase">
                    <User className="w-3.5 h-3.5 text-[#8E8B82]" />
                    <span>Admin Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-lg text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition"
                    placeholder="Full Name"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#8E8B82] flex items-center gap-1.5 uppercase">
                    <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Super Admin Email</span>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-lg text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono"
                    placeholder="ashifur.badhon@gmail.com"
                    required
                  />
                </div>

                {/* Password Section Divider */}
                <div className="pt-2 border-t border-[#23242B]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-mono text-[#8E8B82] flex items-center gap-1.5 uppercase font-semibold">
                      <Key className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Change Admin Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-[#8E8B82] hover:text-[#F5F2EA] font-mono flex items-center gap-1 cursor-pointer transition"
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
                        className="w-full px-3 py-2 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-lg text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono"
                        placeholder="Current Password (optional for super admin)"
                      />
                    </div>
                    <div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="w-full px-3 py-2 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-lg text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono"
                        placeholder="New Password (min. 6 characters)"
                      />
                    </div>
                    <div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        className="w-full px-3 py-2 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-lg text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono"
                        placeholder="Confirm New Password"
                      />
                    </div>
                    <p className="text-[10px] text-[#8E8B82] font-mono">
                      Leave password fields blank if you only want to update the email address.
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* Action Buttons Footer */}
            <div className="px-5 py-3.5 border-t border-[#23242B] bg-[#06070B] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-3.5 py-2 text-xs font-mono text-[#8E8B82] hover:text-[#F5F2EA] rounded-lg hover:bg-[#12131A] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-profile-form"
                disabled={savingProfile}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
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
