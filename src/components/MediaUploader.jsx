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
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";
import { parsePhotoPosition, formatPhotoPosition } from "@/lib/photoPosition";
import ImageUploadBox from "@/components/admin/ImageUploadBox";

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
  defaultValue = "",
  defaultPosition = "",
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

  // 2D Reposition & Zoom Modal State
  const initialPos = parsePhotoPosition(positionValue);
  const [isRepositionModalOpen, setIsRepositionModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [modalX, setModalX] = useState(initialPos.x);
  const [modalY, setModalY] = useState(initialPos.y);
  const [modalZoom, setModalZoom] = useState(initialPos.zoom);
  const [isDraggingModal, setIsDraggingModal] = useState(false);

  // Sync state whenever positionValue changes
  useEffect(() => {
    if (positionValue) {
      const p = parsePhotoPosition(positionValue);
      setModalX(p.x);
      setModalY(p.y);
      setModalZoom(p.zoom);
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

  // 2D Drag-to-Reposition inside Modal (Up, Down, Left, Right)
  const handleModalDragStart = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    modalDragRef.current = {
      startX: clientX,
      startY: clientY,
      initX: modalX,
      initY: modalY,
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

      // Sensitivity factor scaled smoothly by zoom
      const sensitivity = 100 / Math.max(1, modalZoom);
      const newX = Math.max(0, Math.min(100, Math.round(modalDragRef.current.initX - (deltaX / rect.width) * sensitivity)));
      const newY = Math.max(0, Math.min(100, Math.round(modalDragRef.current.initY - (deltaY / rect.height) * sensitivity)));

      setModalX(newX);
      setModalY(newY);
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

    // If it's an image and repositioning is supported: Open 2D Reposition & Zoom Modal BEFORE uploading
    if (rawFile.type.startsWith("image/") && onPositionChange) {
      try {
        const localUrl = URL.createObjectURL(rawFile);
        setPendingFile(rawFile);
        setPendingPreview(localUrl);
        const p = parsePhotoPosition(positionValue);
        setModalX(p.x);
        setModalY(p.y);
        setModalZoom(p.zoom);
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
    const finalPos = formatPhotoPosition(modalX, modalY, modalZoom);
    if (onPositionChange) {
      onPositionChange(finalPos);
    }
    setIsRepositionModalOpen(false);

    if (pendingFile) {
      executeUpload(pendingFile, finalPos);
    } else {
      showToast("Photo position & zoom saved!", "success");
    }
    setPendingFile(null);
    setPendingPreview(null);
  };

  // Cancel reposition inside modal
  const handleCancelReposition = () => {
    setIsRepositionModalOpen(false);
    if (pendingFile) {
      executeUpload(pendingFile, formatPhotoPosition(modalX, modalY, modalZoom));
    }
    setPendingFile(null);
    setPendingPreview(null);
  };

  // Trigger reposition modal on existing photo
  const handleOpenExistingReposition = () => {
    if (!value || isPdf || isVideo || uploading) return;
    setPendingFile(null);
    setPendingPreview(value);
    const p = parsePhotoPosition(positionValue);
    setModalX(p.x);
    setModalY(p.y);
    setModalZoom(p.zoom);
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

  const handleReset = () => {
    const targetVal = defaultValue !== undefined ? defaultValue : "";
    if (onChange) onChange(targetVal, "");
    if (onPositionChange) {
      onPositionChange(defaultPosition || (targetVal ? "center 15%" : "center center"));
    }
    setUrlInput(targetVal);
    setTempPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Reset to default successfully", "info");
  };

  const handleUrlApply = (appliedVal) => {
    const val = typeof appliedVal === "string" ? appliedVal : urlInput;
    const trimmed = val.trim();
    setUrlInput(trimmed);
    if (onChange) onChange(trimmed, "");
    showToast("Media URL updated!", "info");
  };

  return (
    <div className="space-y-2 text-xs">
      <ImageUploadBox
        value={value}
        type={type}
        label={label}
        description={description}
        previewAspect={previewAspect}
        aspectRatio={aspectRatio}
        positionStyle={parsePhotoPosition(positionValue || "50% 15%").style}
        uploading={uploading}
        uploadProgress={uploadProgress}
        tempPreview={tempPreview}
        onPickFile={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        isDragging={isDragging}
        onReset={handleReset}
        onOpenReposition={onPositionChange && !isPdf && !isVideo ? handleOpenExistingReposition : null}
        urlValue={urlInput}
        onUrlChange={(newUrl) => setUrlInput(newUrl)}
        onUrlApply={handleUrlApply}
        maxSizeLabel={`Max ${type === "video" ? "50MB" : `${maxSizeMB}MB`} • ${
          type === "document" ? "PDF" : type === "video" ? "MP4, WebM" : "JPG, PNG, WebP, SVG, GIF"
        }`}
      >
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
      </ImageUploadBox>

      {/* Photo Reposition Modal (Direct Click & Drag Before / After Upload) */}
      {isRepositionModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="bg-[#0D121F] border border-[#1E2638] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E2638] flex items-center justify-between bg-[#111624] shrink-0">
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

            {/* Reposition Drag Canvas with Zoom & 2D Pan */}
            <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-medium">Click &amp; drag photo (Up, Down, Left, Right):</span>
                <span className="px-2 py-0.5 rounded bg-[#161C2A] text-emerald-300 border border-emerald-500/30 font-bold">
                  {modalX}% {modalY}% {modalZoom > 1 ? `• ${Math.round(modalZoom * 100)}% Zoom` : ""}
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
                <Image
                  src={pendingPreview || value}
                  alt="Reposition Preview"
                  draggable={false}
                  fill
                  unoptimized
                  style={{
                    objectPosition: `${modalX}% ${modalY}%`,
                    transform: modalZoom > 1 ? `scale(${modalZoom})` : undefined,
                    transformOrigin: `${modalX}% ${modalY}%`,
                  }}
                  className="object-cover pointer-events-none select-none transition-none"
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

              {/* Zoom & Pan Control Bar */}
              <div className="p-3.5 rounded-xl bg-[#090D15] border border-[#1E2638] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zoom Level:</span>
                    <span className="font-bold text-emerald-300">{Math.round(modalZoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Position:</span>
                    <span className="text-emerald-400 font-bold">{modalX}% {modalY}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalZoom((z) => Math.max(1, Math.round((z - 0.1) * 100) / 100))}
                    className="p-1.5 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-300 hover:text-white transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={modalZoom}
                    onChange={(e) => setModalZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-[#161C2A] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setModalZoom((z) => Math.min(3, Math.round((z + 0.1) * 100) / 100))}
                    className="p-1.5 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-300 hover:text-white transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalZoom(1);
                      setModalX(50);
                      setModalY(50);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white transition text-xs font-mono flex items-center gap-1 cursor-pointer"
                    title="Reset Zoom & Center"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Quick zoom presets */}
                <div className="flex items-center justify-between pt-1 border-t border-[#161C2A]">
                  <span className="text-[10px] font-mono text-slate-400">Quick Presets:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: "1.0x (Fit)", val: 1.0 },
                      { label: "1.25x", val: 1.25 },
                      { label: "1.5x", val: 1.5 },
                      { label: "2.0x", val: 2.0 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setModalZoom(p.val)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                          Math.abs(modalZoom - p.val) < 0.05
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                            : "bg-[#141A29] text-slate-400 hover:text-white border border-transparent"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 border-t border-[#1E2638] bg-[#0A0E18] flex items-center justify-end gap-2.5 shrink-0">
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
