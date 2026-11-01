"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  ChevronDown,
  LogOut,
  X,
  Check,
  Camera,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./Toast";
import { parsePhotoPosition } from "@/lib/photoPosition";
import ImageUploadBox, { downscalePhotoToWebP } from "@/components/admin/ImageUploadBox";
import { api } from "@/lib/api";

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

export default function TopBar({ setMobileOpen, ...props }) {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);

  // Photo-only modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "/ashifur.jpeg");
  const [editAvatarPosition, setEditAvatarPosition] = useState(user?.avatar_position || "50% 50%");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  const displayName = user?.full_name || user?.username || "Ashifur Rahman";
  const displayEmail = user?.email || "ashifur.badhon@gmail.com";
  const userAvatar = user?.avatar || "/ashifur.jpeg";

  useEffect(() => {
    if (user) {
      if (user.avatar) setEditAvatar(user.avatar);
      if (user.avatar_position) setEditAvatarPosition(user.avatar_position);
    }
  }, [user, photoModalOpen]);

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

  const handleSavePhoto = async () => {
    setSavingPhoto(true);
    setPhotoError("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("cms_auth_token") || "" : "";
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          avatar: editAvatar || "/ashifur.jpeg",
          avatar_position: editAvatarPosition || "50% 50%",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile photo.");
      }

      if (updateUser) {
        updateUser({
          avatar: editAvatar || "/ashifur.jpeg",
          avatar_position: editAvatarPosition || "50% 50%",
        });
      }

      setSavingPhoto(false);
      setPhotoModalOpen(false);
      if (showToast) {
        showToast("Profile photo updated successfully!", "success");
      }
    } catch (err) {
      setSavingPhoto(false);
      setPhotoError(err.message || "Failed to update profile photo.");
    }
  };

  return (
    <>
      <header className="h-14 px-4 sm:px-6 border-b border-[#23242B] bg-[#0A0B10] sticky top-0 z-40 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger menu & breadcrumb title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileOpen?.(true)}
            className="lg:hidden p-1.5 rounded-none bg-[#06070B] text-[#8E8B82] hover:text-[#F5F2EA] border border-[#23242B] hover:border-[#F59E0B] transition cursor-pointer shrink-0"
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

        {/* Right: Live status pill, presence pill, profile box LAST (corner) */}
        <div className="flex items-center gap-3 relative z-50 shrink-0">
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

          {/* Profile box sits on the extreme RIGHT corner */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="stat-box flex items-center gap-2 px-2.5 py-1.5 rounded-none bg-[#06070B] border border-[#23242B] hover:border-[#F59E0B] transition cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-[#06070B] border border-[#23242B] text-[#F59E0B] text-xs font-bold font-mono flex items-center justify-center shrink-0">
                <Image
                  src={userAvatar || "/ashifur.jpeg"}
                  alt={displayName}
                  width={32}
                  height={32}
                  unoptimized
                  style={parsePhotoPosition(user?.avatar_position || "50% 50%").style}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#F5F2EA] leading-tight truncate max-w-[130px]">
                  {displayName}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8E8B82] transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Click-away backdrop to dismiss dropdown smoothly */}
            {profileOpen && (
              <div
                className="fixed inset-0 z-[60] bg-transparent cursor-default"
                onClick={() => setProfileOpen(false)}
              />
            )}

            {/* Dropdown Menu (Fixed anchored to viewport under profile box) */}
            {profileOpen && (
              <div className="animate-dropdown fixed right-3 top-[64px] w-64 max-w-[calc(100vw-24px)] bg-[#0A0B10] border border-[#23242B] shadow-2xl py-2 z-[70] text-xs rounded-none stat-box">
                {/* Header (keeps name + email, NO ROOT ADMIN badge) */}
                <div className="px-4 py-2.5 border-b border-[#23242B]">
                  <p className="font-bold text-[#F5F2EA] truncate text-sm">{displayName}</p>
                  <p className="text-[11px] text-[#8E8B82] font-mono truncate mt-0.5">{displayEmail}</p>
                </div>

                <div className="py-1">
                  {/* 1. Change Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setEditAvatar(user?.avatar || "/ashifur.jpeg");
                      setEditAvatarPosition(user?.avatar_position || "50% 50%");
                      setPhotoModalOpen(true);
                    }}
                    className="stat-box w-full flex items-center justify-between px-4 py-2 text-[#B9B5A9] hover:text-[#FBBF24] border border-transparent hover:border-[#F59E0B] transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="font-medium">Change Photo</span>
                    </div>
                    <span className="stat-box text-[10px] bg-[#06070B] text-[#8E8B82] border border-[#23242B] px-1.5 py-0.5 font-mono">
                      Photo
                    </span>
                  </button>

                  {/* 2. Sign Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="stat-box w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 border border-transparent border-t-[#23242B] mt-1 pt-2 font-mono text-xs cursor-pointer text-left"
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

      {/* Change Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div
            className="bg-[#0A0B10] border border-[#23242B] max-w-md w-full shadow-2xl overflow-hidden rounded-none flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#23242B] flex items-center justify-between bg-[#06070B] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F2EA] leading-tight">Change Profile Photo</h3>
                  <p className="text-[10px] text-[#8E8B82] font-mono">Upload, reposition, and crop administrator avatar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="stat-box p-1.5 text-[#8E8B82] hover:text-[#F5F2EA] border border-transparent transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {photoError && (
                <div className="stat-box p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {photoError}
                </div>
              )}

              <ImageUploadBox
                value={editAvatar || userAvatar || "/ashifur.jpeg"}
                type="image"
                label="Administrator Profile Photo"
                description="Square avatar photo displayed across admin console and top bar"
                previewAspect="1/1"
                aspectRatio="square"
                positionValue={editAvatarPosition || "50% 50%"}
                onPositionChange={(pos) => setEditAvatarPosition(pos)}
                defaultValue="/ashifur.jpeg"
                defaultPosition="50% 50%"
                uploading={avatarUploading}
                uploadProgress={avatarProgress}
                onPickFile={() => document.getElementById("admin-photo-modal-file-input")?.click()}
                onReset={() => {
                  setEditAvatar("/ashifur.jpeg");
                  setEditAvatarPosition("50% 50%");
                  if (showToast) showToast("Avatar reset to default!", "info");
                }}
                urlValue={editAvatar || ""}
                onUrlChange={(url) => setEditAvatar(url)}
                onUrlApply={(url) => {
                  if (url) setEditAvatar(url);
                }}
              >
                <input
                  id="admin-photo-modal-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelected}
                  className="hidden"
                />
              </ImageUploadBox>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[#23242B] bg-[#06070B] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="stat-box px-3.5 py-2 text-xs font-mono text-[#8E8B82] hover:text-[#F5F2EA] transition cursor-pointer rounded-none border border-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingPhoto || avatarUploading}
                onClick={handleSavePhoto}
                className="stat-box px-4 py-2 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 rounded-none disabled:opacity-50"
              >
                {savingPhoto ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Photo...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
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
