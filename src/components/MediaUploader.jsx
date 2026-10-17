"use client";

import { useState, useEffect, useRef } from "react";
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
  Compass,
  Sliders,
  Move,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";

function parsePosition(posStr) {
  if (!posStr || typeof posStr !== "string") return { x: 50, y: 15 };
  const parts = posStr.trim().split(/\s+/);
  let x = 50;
  let y = 15;
  if (parts.length >= 2) {
    if (parts[0] === "center") x = 50;
    else if (parts[0] === "left") x = 0;
    else if (parts[0] === "right") x = 100;
    else {
      const parsedX = parseFloat(parts[0]);
      if (!isNaN(parsedX)) x = parsedX;
    }

    if (parts[1] === "top") y = 0;
    else if (parts[1] === "center") y = 50;
    else if (parts[1] === "bottom") y = 100;
    else {
      const parsedY = parseFloat(parts[1]);
      if (!isNaN(parsedY)) y = parsedY;
    }
  } else if (parts.length === 1) {
    if (parts[0] === "top") { x = 50; y = 0; }
    else if (parts[0] === "bottom") { x = 50; y = 100; }
    else if (parts[0] === "center") { x = 50; y = 50; }
  }
  return { x: Math.max(0, Math.min(100, Math.round(x))), y: Math.max(0, Math.min(100, Math.round(y))) };
}

function getPreviewAspectStyle(previewAspect, fallbackAspect = "wide") {
  const raw = previewAspect || (fallbackAspect === "portrait" ? "4/5" : fallbackAspect === "square" ? "1/1" : "16/9");
  const normalized = String(raw).replace(":", "/").trim();
  const parts = normalized.split("/").map((n) => parseFloat(n.trim()));

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
    const num = parts[0];
    const den = parts[1];
    const ratio = num / den;

    if (ratio <= 1.05) {
      return {
        aspectRatio: `${num} / ${den}`,
        height: "min(380px, 50vh)",
        width: "auto",
        maxWidth: "100%",
        margin: "0 auto",
      };
    } else {
      return {
        aspectRatio: `${num} / ${den}`,
        width: "100%",
        maxHeight: "50vh",
        margin: "0 auto",
      };
    }
  }

  return {
    aspectRatio: "16 / 9",
    width: "100%",
    maxHeight: "50vh",
    margin: "0 auto",
  };
}

function getInlineAspectStyle(previewAspect, fallbackAspect = "wide") {
  const raw = previewAspect || (fallbackAspect === "portrait" ? "4/5" : fallbackAspect === "square" ? "1/1" : "16/9");
  const normalized = String(raw).replace(":", "/").trim();
  const parts = normalized.split("/").map((n) => parseFloat(n.trim()));

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
    const num = parts[0];
    const den = parts[1];
    const ratio = num / den;

    if (ratio <= 1.05) {
      return {
        aspectRatio: `${num} / ${den}`,
        height: "220px",
        width: "auto",
        maxWidth: "100%",
        margin: "0 auto",
      };
    } else {
      return {
        aspectRatio: `${num} / ${den}`,
        width: "100%",
        maxWidth: "340px",
        margin: "0 auto",
      };
    }
  }

  return {
    aspectRatio: "16 / 9",
    width: "100%",
    maxWidth: "340px",
    margin: "0 auto",
  };
}

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
  positionValue = "50% 15%",
  onPositionChange,
  label = "Upload Media",
  description = "Drag & drop file or browse from device",
  type = "image", // 'image' | 'video' | 'media' | 'document'
  accept,
  maxSizeMB = 15,
  aspectRatio = "wide", // 'square' | 'portrait' | 'video' | 'wide'
  previewAspect,
}) {
  const modalAspectStyle = getPreviewAspectStyle(previewAspect, aspectRatio);
  const inlineAspectStyle = getInlineAspectStyle(previewAspect, aspectRatio);

  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const modalBoxRef = useRef(null);
  const modalDragRef = useRef({ startX: 0, startY: 0, initX: 50, initY: 15 });

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempPreview, setTempPreview] = useState(null);
  const [mode, setMode] = useState("upload"); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(value || "");

  // Facebook Reposition Modal State
  const [isRepositionModalOpen, setIsRepositionModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [modalPosition, setModalPosition] = useState(positionValue || "50% 15%");
  const [isDraggingModal, setIsDraggingModal] = useState(false);

  // Sync modalPosition whenever positionValue changes
  useEffect(() => {
    if (positionValue) {
      setModalPosition(positionValue);
    }
  }, [positionValue]);

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

  // Facebook-style Drag-to-Reposition inside Modal
  const handleModalDragStart = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const cur = parsePosition(modalPosition);
    modalDragRef.current = {
      startX: clientX,
      startY: clientY,
      initX: cur.x,
      initY: cur.y,
    };
    setIsDraggingModal(true);
  };

  useEffect(() => {
    const handleModalDragMove = (e) => {
      if (!isDraggingModal || !modalBoxRef.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const rect = modalBoxRef.current.getBoundingClientRect();
      const deltaX = clientX - modalDragRef.current.startX;
      const deltaY = clientY - modalDragRef.current.startY;

      const newX = Math.max(0, Math.min(100, Math.round(modalDragRef.current.initX - (deltaX / rect.width) * 100)));
      const newY = Math.max(0, Math.min(100, Math.round(modalDragRef.current.initY - (deltaY / rect.height) * 100)));

      setModalPosition(`${newX}% ${newY}%`);
    };

    const handleModalDragEnd = () => {
      if (isDraggingModal) setIsDraggingModal(false);
    };

    if (isDraggingModal) {
      window.addEventListener("mousemove", handleModalDragMove);
      window.addEventListener("mouseup", handleModalDragEnd);
      window.addEventListener("touchmove", handleModalDragMove, { passive: false });
      window.addEventListener("touchend", handleModalDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleModalDragMove);
      window.removeEventListener("mouseup", handleModalDragEnd);
      window.removeEventListener("touchmove", handleModalDragMove);
      window.removeEventListener("touchend", handleModalDragEnd);
    };
  }, [isDraggingModal]);

  // Actual background upload execution
  const executeUpload = async (rawFile, targetPos) => {
    if (!rawFile) return;

    // Show temporary preview with upload percentage directly over the photo
    if (rawFile.type.startsWith("image/")) {
      try {
        const objUrl = URL.createObjectURL(rawFile);
        setTempPreview(objUrl);
      } catch (e) {}
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      const file = await optimizeImageIfNeeded(rawFile);
      setUploadProgress(35);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await api.uploadMedia(file);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (res && res.success && res.url) {
        showToast("Photo uploaded successfully!", "success");
        if (onChange) {
          onChange(res.url, res.file_name);
        }
        if (onPositionChange && targetPos) {
          onPositionChange(targetPos);
        }
        setUrlInput(res.url);
      } else {
        if (rawFile.type.startsWith("image/") && rawFile.size < 4 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result;
            if (dataUrl && onChange) {
              onChange(dataUrl, rawFile.name);
              setUrlInput(dataUrl);
              if (onPositionChange && targetPos) onPositionChange(targetPos);
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
            if (onPositionChange && targetPos) onPositionChange(targetPos);
            showToast("Loaded image directly", "info");
          }
        };
        reader.readAsDataURL(rawFile);
      } else {
        showToast("Server upload error. Please check your connection.", "error");
      }
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setTempPreview(null);
      }, 450);
    }
  };

  // Called whenever user selects or drops a file
  const handleFilePicked = (rawFile) => {
    if (!rawFile) return;

    // Check size limit
    const sizeInMB = rawFile.size / (1024 * 1024);
    const limit = type === "video" ? Math.max(maxSizeMB, 50) : maxSizeMB;
    if (sizeInMB > limit) {
      showToast(`File size (${sizeInMB.toFixed(1)}MB) exceeds ${limit}MB limit.`, "error");
      return;
    }

    // If it's an image and repositioning is supported: Open Facebook-style Reposition Modal BEFORE uploading
    if (rawFile.type.startsWith("image/") && onPositionChange) {
      try {
        const localUrl = URL.createObjectURL(rawFile);
        setPendingFile(rawFile);
        setPendingPreview(localUrl);
        setModalPosition(positionValue || "50% 15%");
        setIsRepositionModalOpen(true);
      } catch (e) {
        executeUpload(rawFile, positionValue || "50% 15%");
      }
    } else {
      executeUpload(rawFile, positionValue || "50% 15%");
    }
  };

  // Confirm reposition inside modal
  const handleConfirmReposition = () => {
    const finalPos = modalPosition || "50% 15%";
    if (onPositionChange) {
      onPositionChange(finalPos);
    }
    setIsRepositionModalOpen(false);

    if (pendingFile) {
      executeUpload(pendingFile, finalPos);
    } else {
      showToast("Photo position saved!", "success");
    }
  };

  // Cancel reposition inside modal
  const handleCancelReposition = () => {
    setIsRepositionModalOpen(false);
    setPendingFile(null);
    setPendingPreview(null);
  };

  // Trigger reposition modal on existing photo
  const handleOpenExistingReposition = () => {
    if (!value || isPdf || isVideo || uploading) return;
    setPendingFile(null);
    setPendingPreview(value);
    setModalPosition(positionValue || "50% 15%");
    setIsRepositionModalOpen(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFilePicked(file);
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
          if (file) handleFilePicked(file);
          if (e.target) e.target.value = "";
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
            <SpotlightCard className="bg-[#0A0D12] border border-[#1E2638] hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 space-y-3 transition">
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
                  {onPositionChange && !isPdf && !isVideo && (
                    <button
                      type="button"
                      onClick={handleOpenExistingReposition}
                      className="px-2.5 py-1.5 rounded-lg bg-[#161C2A] hover:bg-[#1E2638] text-emerald-400 font-semibold border border-emerald-500/20 text-[11px] flex items-center gap-1 transition cursor-pointer"
                      title="Reposition Photo"
                    >
                      <Move className="w-3 h-3" />
                      <span>Reposition</span>
                    </button>
                  )}
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
              <div className="relative rounded-xl overflow-hidden bg-[#070A0F] border border-[#1E2638] flex items-center justify-center p-3 sm:p-4">
                {uploading && (
                  <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2.5 p-4 animate-in fade-in duration-150">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
                        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4" strokeDasharray={163.36} strokeDashoffset={163.36 - (163.36 * uploadProgress) / 100} strokeLinecap="round" className="text-emerald-400 transition-all duration-150" fill="transparent" />
                      </svg>
                      <span className="absolute text-xs font-mono font-black text-emerald-300">{uploadProgress}%</span>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-white tracking-wide">Uploading Photo...</p>
                      <div className="w-40 h-1.5 bg-[#161C2A] rounded-full overflow-hidden mx-auto border border-[#1E2638]">
                        <div className="h-full bg-emerald-400 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-[10px] font-mono text-emerald-400 font-semibold">{uploadProgress}% Complete</p>
                    </div>
                  </div>
                )}
                {isPdf ? (
                  <div className="py-6 px-4 flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">PDF Document Loaded</p>
                      <p className="text-[10px] font-mono text-slate-400">{(tempPreview || value).split("/").pop()}</p>
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
                    src={tempPreview || value}
                    controls
                    className="w-full max-h-60 rounded-xl object-contain bg-black"
                  />
                ) : (
                  <div
                    style={inlineAspectStyle}
                    className={`relative rounded-2xl overflow-hidden shadow-2xl border border-[#1E2638] bg-[#0A0E18] group/preview mx-auto ${
                      onPositionChange && !uploading ? "cursor-pointer" : ""
                    }`}
                    onClick={handleOpenExistingReposition}
                    title="Click to reposition photo"
                  >
                    <img
                      src={tempPreview || value}
                      alt="Uploaded media preview"
                      style={{ objectPosition: positionValue || "50% 15%" }}
                      className="w-full h-full object-cover transition-all select-none"
                    />

                    {/* Hover overlay badge */}
                    {onPositionChange && !uploading && (
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-xl bg-black/90 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl">
                          <Move className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Reposition Photo</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SpotlightCard>
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
                tempPreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#070A0F] border border-emerald-500/40 flex items-center justify-center">
                    <img
                      src={tempPreview}
                      alt="Uploading preview"
                      className="w-full h-full object-cover blur-[1px] opacity-60"
                    />
                    <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-2.5 p-4 animate-in fade-in duration-150">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
                          <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4" strokeDasharray={163.36} strokeDashoffset={163.36 - (163.36 * uploadProgress) / 100} strokeLinecap="round" className="text-emerald-400 transition-all duration-150" fill="transparent" />
                        </svg>
                        <span className="absolute text-xs font-mono font-black text-emerald-300">{uploadProgress}%</span>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-white tracking-wide">Uploading Photo...</p>
                        <div className="w-40 h-1.5 bg-[#161C2A] rounded-full overflow-hidden mx-auto border border-[#1E2638]">
                          <div className="h-full bg-emerald-400 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-[10px] font-mono text-emerald-400 font-semibold">{uploadProgress}% Complete</p>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )
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

      {/* Photo Reposition Modal (Direct Click & Drag Before / After Upload) */}
      {isRepositionModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="bg-[#0D121F] border border-[#1E2638] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E2638] flex items-center justify-between bg-[#111624]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Move className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Reposition Photo
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Adjust framing and position
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelReposition}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C2A] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reposition Drag Canvas */}
            <div className="p-5 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-medium">Click &amp; drag directly on the photo:</span>
                <span className="px-2 py-0.5 rounded bg-[#161C2A] text-emerald-300 border border-emerald-500/30 font-bold">
                  {modalPosition}
                </span>
              </div>

              <div
                ref={modalBoxRef}
                onMouseDown={handleModalDragStart}
                onTouchStart={handleModalDragStart}
                style={modalAspectStyle}
                className={`relative rounded-2xl overflow-hidden bg-[#070A0F] border select-none transition-all ${
                  isDraggingModal
                    ? "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] cursor-grabbing"
                    : "border-emerald-500/40 hover:border-emerald-400 cursor-grab"
                }`}
              >
                <img
                  src={pendingPreview || value}
                  alt="Reposition Preview"
                  draggable={false}
                  style={{ objectPosition: modalPosition }}
                  className="w-full h-full object-cover pointer-events-none select-none transition-none"
                />

                {/* 3x3 Grid Lines on Drag */}
                {isDraggingModal && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-400/50 bg-emerald-500/10 animate-in fade-in duration-100">
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-b border-emerald-400/30" />
                    <div className="border-r border-emerald-400/30" />
                    <div className="border-r border-emerald-400/30" />
                    <div />
                  </div>
                )}

              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 border-t border-[#1E2638] bg-[#0A0E18] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelReposition}
                className="px-4 py-2 rounded-xl bg-[#141A29] hover:bg-[#1E2638] text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReposition}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{pendingFile ? "Save & Upload Photo" : "Apply Position"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
