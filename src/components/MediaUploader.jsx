"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link2,
  FolderOpen,
  Eye,
  Film,
  Download
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

async function optimizeImageIfNeeded(file) {
  if (!file || !file.type || !file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }
  if (file.size <= 800 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                  type: "image/webp",
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            "image/webp",
            0.88
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}

export default function MediaUploader({
  value = "",
  onChange,
  label = "Upload Media",
  description = "Drag & drop file or browse from device",
  type = "image", // 'image' | 'video' | 'media' | 'document'
  accept,
  maxSizeMB = 15,
  aspectRatio = "wide", // 'square' | 'portrait' | 'video' | 'wide'
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mode, setMode] = useState("upload"); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(value || "");

  // Determine accept attribute
  const defaultAccept =
    accept ||
    (type === "image"
      ? "image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
      : type === "video"
      ? "video/mp4,video/webm,video/ogg"
      : type === "document"
      ? ".pdf,application/pdf"
      : "image/*,video/*,.pdf");

  const isVideo =
    type === "video" ||
    (value && (value.endsWith(".mp4") || value.endsWith(".webm") || value.endsWith(".ogg")));

  const isPdf =
    type === "document" ||
    (value && value.toLowerCase().endsWith(".pdf"));

  // Handle actual file upload
  const handleFileUpload = async (rawFile) => {
    if (!rawFile) return;

    // Check size limit
    const sizeInMB = rawFile.size / (1024 * 1024);
    const limit = type === "video" ? Math.max(maxSizeMB, 50) : maxSizeMB;
    if (sizeInMB > limit) {
      showToast(`File size (${sizeInMB.toFixed(1)}MB) exceeds ${limit}MB limit.`, "error");
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      // Auto-optimize image for instant upload and Vercel compatibility
      const file = await optimizeImageIfNeeded(rawFile);
      setUploadProgress(35);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await api.uploadMedia(file);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (res && res.success && res.url) {
        showToast("Media uploaded successfully!", "success");
        if (onChange) {
          onChange(res.url, res.file_name);
        }
        setUrlInput(res.url);
      } else {
        // Fallback for image to ensure admin is never blocked
        if (rawFile.type.startsWith("image/") && rawFile.size < 4 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result;
            if (dataUrl && onChange) {
              onChange(dataUrl, rawFile.name);
              setUrlInput(dataUrl);
              showToast("Loaded image directly", "info");
            }
          };
          reader.readAsDataURL(rawFile);
        } else {
          showToast(res?.error || "Failed to upload media.", "error");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (rawFile.type.startsWith("image/") && rawFile.size < 4 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result;
          if (dataUrl && onChange) {
            onChange(dataUrl, rawFile.name);
            setUrlInput(dataUrl);
            showToast("Loaded image directly", "info");
          }
        };
        reader.readAsDataURL(rawFile);
      } else {
        showToast("Server upload error. Please check your connection.", "error");
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    if (onChange) onChange("", "");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlApply = () => {
    if (onChange) onChange(urlInput.trim(), "");
    showToast("Media URL updated!", "info");
  };

  return (
    <div className="space-y-2 text-xs">
      {/* Label and mode switcher header */}
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300 flex items-center gap-1.5">
          {type === "document" ? (
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
          ) : isVideo ? (
            <Film className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{label}</span>
        </label>

        <button
          type="button"
          onClick={() => setMode(mode === "upload" ? "url" : "upload")}
          className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
        >
          {mode === "upload" ? (
            <>
              <Link2 className="w-3 h-3" /> Switch to URL
            </>
          ) : (
            <>
              <FolderOpen className="w-3 h-3" /> Browse / Upload File
            </>
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={defaultAccept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* URL Input Mode */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://... or /uploads/..."
              className="flex-1 bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>
          {value && (
            <p className="text-[11px] font-mono text-slate-400 truncate">
              Current: <span className="text-emerald-400">{value}</span>
            </p>
          )}
        </div>
      )}

      {/* Upload & Drag-and-Drop Mode */}
      {mode === "upload" && (
        <div>
          {/* Case 1: Value exists -> Show Live Preview Card */}
          {value ? (
            <div className="bg-[#0A0D12] border border-[#1E2638] hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 space-y-3 transition">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="font-mono text-[11px] text-slate-300 truncate">
                    {value}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-[#161C2A] text-slate-300 hover:text-white border border-[#1E2638]"
                    title="Open Full File"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={value}
                    download={value.split("/").pop()}
                    className="p-1.5 rounded-lg bg-[#161C2A] text-slate-300 hover:text-emerald-400 border border-[#1E2638] transition cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-[#161C2A] hover:bg-[#1E2638] text-emerald-400 font-semibold border border-emerald-500/20 text-[11px] flex items-center gap-1 transition cursor-pointer"
                    title="Replace with new file"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg bg-[#161C2A] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#1E2638] transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Media Preview Box */}
              <div className="relative rounded-xl overflow-hidden bg-[#070A0F] border border-[#1E2638] flex items-center justify-center">
                {isPdf ? (
                  <div className="py-6 px-4 flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">PDF Document Loaded</p>
                      <p className="text-[10px] font-mono text-slate-400">{value.split("/").pop()}</p>
                    </div>
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-1 font-mono"
                    >
                      <Eye className="w-3 h-3" /> View / Test PDF
                    </a>
                  </div>
                ) : isVideo ? (
                  <video
                    src={value}
                    controls
                    className="w-full max-h-60 rounded-xl object-contain bg-black"
                  />
                ) : (
                  <div className="relative w-full h-44 sm:h-52">
                    <Image
                      src={value}
                      alt="Uploaded media preview"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Case 2: No value -> Show Drag & Drop Upload Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                  : "border-[#1E2638] hover:border-emerald-500/50 bg-[#0A0D12]/70 hover:bg-[#0A0D12]"
              }`}
            >
              {uploading ? (
                <div className="space-y-3 py-2">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-mono text-emerald-400 font-bold">
                    Uploading {uploadProgress}%...
                  </p>
                  <div className="w-48 mx-auto h-1.5 bg-[#161C2A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                    {type === "document" ? (
                      <FileText className="w-6 h-6" />
                    ) : type === "video" ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-white text-xs group-hover:text-emerald-300 transition">
                      Click to Browse or Drag &amp; Drop
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161C2A] border border-[#1E2638] text-[10px] font-mono text-slate-400">
                    <span>
                      Max {type === "video" ? "50MB" : `${maxSizeMB}MB`}
                    </span>
                    <span>•</span>
                    <span className="uppercase">
                      {type === "document" ? "PDF" : type === "video" ? "MP4, WebM" : "JPG, PNG, WebP"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
