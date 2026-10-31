"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Move,
  FileText,
  Eye,
  Film,
  X,
  Check,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { parsePhotoPosition, formatPhotoPosition } from "@/lib/photoPosition";

/**
 * Downscale photo to max 1024x1024 while preserving aspect ratio,
 * convert to WebP at 0.85 quality (fallback JPEG 0.85).
 * NEVER refuses a file for size.
 */
export async function downscalePhotoToWebP(file) {
  if (!file) return { file, dataUrl: "" };
  if (!file.type || !file.type.startsWith("image/") || file.type.includes("svg")) {
    return { file, dataUrl: "" };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ file, dataUrl: "" });
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => resolve({ file, dataUrl: e.target?.result || "" });
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        const maxDim = 1024;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
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
        if (!ctx) {
          return resolve({ file, dataUrl: e.target?.result || "" });
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = "";
        try {
          dataUrl = canvas.toDataURL("image/webp", 0.85);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          }
        } catch {
          dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        }

        const mime = dataUrl.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
        const ext = mime === "image/webp" ? ".webp" : ".jpg";
        const baseName = (file.name || "photo").replace(/\.[^/.]+$/, "");

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const convertedFile = new File([blob], `${baseName}${ext}`, { type: mime });
              resolve({ file: convertedFile, dataUrl, width, height });
            } else {
              resolve({ file, dataUrl, width, height });
            }
          },
          mime,
          0.85
        );
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Computes CSS styles for the preview tile container based on previewAspect
 */
export function getInlineAspectStyle(previewAspect, fallbackAspect = "wide") {
  const raw = previewAspect || (fallbackAspect === "portrait" ? "4/5" : fallbackAspect === "square" ? "1/1" : "16/9");
  const normalized = String(raw).replace(":", "/").trim();
  const parts = normalized.split("/").map((n) => parseFloat(n.trim()));

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
    const num = parts[0];
    const den = parts[1];
    return {
      aspectRatio: `${num} / ${den}`,
      width: "100%",
      maxHeight: "260px",
      margin: "0 auto",
    };
  }

  return {
    aspectRatio: "16 / 9",
    width: "100%",
    maxHeight: "260px",
    margin: "0 auto",
  };
}

/**
 * Modal frame aspect style
 */
function getModalAspectStyle(previewAspect, fallbackAspect = "wide") {
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
        height: "min(280px, 42vh)",
        width: "auto",
        maxWidth: "100%",
        margin: "0 auto",
      };
    } else {
      return {
        aspectRatio: `${num} / ${den}`,
        width: "100%",
        maxHeight: "240px",
        margin: "0 auto",
      };
    }
  }

  return {
    aspectRatio: "16 / 9",
    width: "100%",
    maxHeight: "240px",
    margin: "0 auto",
  };
}

/**
 * ImageUploadBox (ToolGhor Photo Upload System v44)
 * Ported to ALL admin photo spots with unified layout, device upload downscale,
 * real-time URL sync, and integrated Reposition Editor modal.
 */
export default function ImageUploadBox({
  value = "",
  type = "image",
  label = "Upload Image",
  description = "",
  previewAspect = "16/9",
  aspectRatio = "wide",
  positionValue = "50% 50%",
  onPositionChange = null,
  defaultValue = "",
  defaultPosition = "50% 50%",
  uploading = false,
  uploadProgress = 0,
  tempPreview = null,
  onPickFile = null,
  onUploadFile = null,
  onDrop = () => {},
  onDragOver = () => {},
  onDragLeave = () => {},
  isDragging = false,
  onReset = null,
  onOpenReposition = null,
  urlValue = undefined,
  onUrlChange = null,
  onUrlApply = null,
  maxSizeLabel = "",
  children = null,
}) {
  const [internalUrl, setInternalUrl] = useState(urlValue !== undefined ? urlValue : value || "");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Sync internalUrl when prop changes
  useEffect(() => {
    if (urlValue !== undefined) {
      setInternalUrl(urlValue);
    } else if (value !== undefined) {
      setInternalUrl(value || "");
    }
  }, [urlValue, value]);

  const displayUrl = tempPreview || internalUrl || value;
  const isPdf = type === "document" || (typeof displayUrl === "string" && displayUrl.toLowerCase().endsWith(".pdf"));
  const isVideo =
    type === "video" ||
    (type === "media" && typeof displayUrl === "string" && (displayUrl.endsWith(".mp4") || displayUrl.endsWith(".webm")));
  const isImage = !isPdf && !isVideo;

  const isSquare = aspectRatio === "square" || previewAspect === "1/1";
  const tileAspect = getInlineAspectStyle(previewAspect, aspectRatio);
  const posObj = parsePhotoPosition(positionValue || "50% 50%");

  const fileInputRef = useRef(null);

  // Reposition Editor State
  const [panX, setPanX] = useState(posObj.x);
  const [panY, setPanY] = useState(posObj.y);
  const [zoom, setZoom] = useState(posObj.zoom || 1);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initX: 50, initY: 50 });
  const frameRef = useRef(null);

  // Open Reposition Editor
  const handleOpenRepositionModal = () => {
    if (onOpenReposition) {
      onOpenReposition();
      return;
    }
    const current = parsePhotoPosition(positionValue || "50% 50%");
    setPanX(current.x);
    setPanY(current.y);
    setZoom(current.zoom || 1);
    setIsEditorOpen(true);
  };

  // Drag handlers in Reposition Editor
  const handleDragStart = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initX: panX,
      initY: panY,
    };
    setIsDraggingPan(true);
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDraggingPan || !frameRef.current) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const rect = frameRef.current.getBoundingClientRect();
      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      const sensitivity = 100 / Math.max(1, zoom);
      const newX = Math.max(0, Math.min(100, Math.round(dragRef.current.initX - (deltaX / rect.width) * sensitivity)));
      const newY = Math.max(0, Math.min(100, Math.round(dragRef.current.initY - (deltaY / rect.height) * sensitivity)));

      setPanX(newX);
      setPanY(newY);
    };

    const handleDragEnd = () => {
      if (isDraggingPan) setIsDraggingPan(false);
    };

    if (isDraggingPan) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDraggingPan, zoom]);

  // Apply Reposition
  const handleApplyReposition = () => {
    const formatted = formatPhotoPosition(panX, panY, zoom);
    if (onPositionChange) {
      onPositionChange(formatted);
    }
    setIsEditorOpen(false);
  };

  // Reset Reposition in Modal
  const handleResetRepositionInModal = () => {
    setPanX(50);
    setPanY(50);
    setZoom(1);
  };

  // Close Reposition Editor
  const handleCloseRepositionModal = () => {
    setIsEditorOpen(false);
  };

  // Reset to default
  const handleResetToDefault = () => {
    const targetVal = defaultValue !== undefined ? defaultValue : "";
    setInternalUrl(targetVal);
    if (onUrlChange) onUrlChange(targetVal);
    if (onUrlApply) onUrlApply(targetVal);
    if (onPositionChange) onPositionChange(defaultPosition || "50% 50%");
    if (onReset) onReset();
  };

  // Handle URL change
  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setInternalUrl(val);
    if (onUrlChange) onUrlChange(val);
    if (onUrlApply) onUrlApply(val);
  };

  // Handle internal file input selection
  const handleInternalFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isPdf) {
      if (onUploadFile) {
        onUploadFile({ file, dataUrl: "" });
      }
    } else {
      // Downscale to max 1024x1024 WebP 0.85
      const { file: optimizedFile, dataUrl } = await downscalePhotoToWebP(file);
      if (onUploadFile) {
        onUploadFile({ file: optimizedFile, dataUrl });
      }
    }
    if (e.target) e.target.value = "";
  };

  const handlePickFileClick = () => {
    if (onPickFile) {
      onPickFile();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const spotTitle = typeof label === "string" ? label.replace(/\s*\(.*?\)\s*/g, "").trim() : "Photo";

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`p-4 sm:p-5 rounded-2xl bg-[#06070B] border transition-colors duration-150 flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch ${
        isDragging ? "border-emerald-400 bg-[#F59E0B]/10" : "border-[#23242B] hover:border-[#27324A]"
      }`}
    >
      {/* LEFT COLUMN: Preview Tile */}
      <div
        className={`shrink-0 flex flex-col justify-center ${
          isSquare ? "w-36 sm:w-44 mx-auto sm:mx-0" : "w-full sm:w-[220px] md:w-[250px]"
        }`}
      >
        <div
          style={tileAspect}
          className={`relative rounded-xl overflow-hidden border border-[#23242B] bg-[#070A0F] flex items-center justify-center transition select-none group/tile ${
            !uploading && isImage && displayUrl ? "cursor-pointer" : ""
          }`}
          onClick={() => {
            if (!uploading && isImage && displayUrl) {
              handleOpenRepositionModal();
            }
          }}
          title={!uploading && isImage && displayUrl ? "Click to reposition photo" : undefined}
        >
          {/* Upload Progress Overlay */}
          {uploading && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center animate-in fade-in duration-150">
              <div className="relative w-14 h-14 flex items-center justify-center mb-1">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={138.23}
                    strokeDashoffset={138.23 - (138.23 * uploadProgress) / 100}
                    strokeLinecap="round"
                    className="text-[#F59E0B] transition-all duration-150"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-black text-[#FBBF24]">
                  {uploadProgress}%
                </span>
              </div>
              <p className="text-[11px] font-bold text-white tracking-wide">Uploading...</p>
              <div className="w-28 h-1 bg-[#12131A] rounded-full overflow-hidden mt-1.5 border border-[#23242B]">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Small Move / Reposition Icon Button Overlaid Top-Right */}
          {!uploading && !isPdf && displayUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRepositionModal();
              }}
              className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/75 hover:bg-black text-slate-300 hover:text-[#F59E0B] border border-[#23242B] transition cursor-pointer shadow-md"
              title="Reposition photo"
            >
              <Move className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Empty State */}
          {!displayUrl && !uploading && (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <ImageIcon className="w-9 h-9 text-slate-600 mb-1.5 stroke-[1.5]" />
              <span className="font-mono text-[11px] font-bold text-slate-500 tracking-widest">
                NO IMAGE
              </span>
            </div>
          )}

          {/* PDF Document Preview */}
          {displayUrl && isPdf && (
            <div className="p-4 flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <FileText className="w-7 h-7" />
              </div>
              <p className="font-bold text-white text-xs">PDF Document Loaded</p>
              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                {String(displayUrl).split("/").pop()}
              </p>
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-[#F59E0B] hover:underline pt-0.5 font-mono"
              >
                <Eye className="w-3 h-3" /> View / Test PDF
              </a>
            </div>
          )}

          {/* Video Preview */}
          {displayUrl && isVideo && (
            <video src={displayUrl} controls className="w-full h-full object-contain bg-black" />
          )}

          {/* Image Preview with object-position */}
          {displayUrl && isImage && (
            <>
              <Image
                src={displayUrl}
                alt={typeof label === "string" ? label : "Uploaded preview"}
                fill
                unoptimized
                style={posObj.style}
                className="object-cover transition-all select-none"
              />

              {/* Reposition Overlay Badge on Hover */}
              {!uploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/tile:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2 pointer-events-none">
                  <span className="px-3 py-1.5 rounded-xl bg-black/90 text-[#FBBF24] border border-[#F59E0B]/40 text-xs font-mono font-bold flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Reposition Photo</span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Controls (ToolGhor Reference Layout) */}
      <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
        {/* Label & Description */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
            {isPdf ? (
              <FileText className="w-4 h-4 text-[#F59E0B] shrink-0" />
            ) : isVideo ? (
              <Film className="w-4 h-4 text-[#F59E0B] shrink-0" />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#F59E0B] shrink-0" />
            )}
            <span className="font-semibold text-slate-200">{label}</span>
          </div>
          {description && (
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        {/* 3 Buttons: Emerald UPLOAD, Dark Reposition, Dark RESET */}
        <div className="space-y-2">
          {/* 1. Emerald UPLOAD FROM DEVICE */}
          <button
            type="button"
            onClick={handlePickFileClick}
            className="w-full bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-colors duration-150 cursor-pointer active:scale-[0.99] select-none shadow-md shadow-amber-500/10"
          >
            <Upload className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="whitespace-nowrap">
              {isPdf ? "UPLOAD PDF FROM DEVICE" : "UPLOAD FROM DEVICE"}
            </span>
          </button>

          {/* 2. Dark Reposition (Photos only) */}
          {!isPdf && (
            <button
              type="button"
              onClick={handleOpenRepositionModal}
              disabled={!displayUrl || uploading}
              className="w-full bg-[#12131A] hover:bg-[#1E2638] disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-[#23242B] py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition cursor-pointer select-none"
            >
              <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="whitespace-nowrap">Reposition</span>
            </button>
          )}

          {/* 3. Dark RESET TO DEFAULT */}
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={uploading}
            className="w-full bg-[#12131A] hover:bg-[#1E2638] disabled:opacity-40 text-slate-300 hover:text-white border border-[#23242B] py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition cursor-pointer select-none"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">RESET TO DEFAULT</span>
          </button>
        </div>

        {/* URL Input Section */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            {isPdf ? "OR ENTER FILE URL (CDN / LOCAL PATH)" : "OR ENTER IMAGE URL (CDN / LOCAL PATH)"}
          </label>
          <input
            type="text"
            value={internalUrl}
            onChange={handleUrlInputChange}
            placeholder="https://... or /images/..."
            className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition"
          />
        </div>

        {/* Limits line & Current line */}
        <div className="text-[11px] font-mono text-slate-500 space-y-0.5 pt-0.5">
          <p>
            {isPdf
              ? "Max 15MB • PDF"
              : maxSizeLabel || "JPG, PNG, WebP, SVG, GIF • auto-optimized to max 1024px on upload"}
          </p>
          {displayUrl && (
            <p className="truncate text-slate-400">
              Current: <span className="text-slate-300 font-mono">{displayUrl}</span>
              {!isPdf && (
                <>
                  {" "}
                  <span className="text-[#F59E0B] font-mono font-semibold">
                    [{posObj.x}% {posObj.y}%]
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Internal File Input if no custom onPickFile */}
      {!onPickFile && (
        <input
          ref={fileInputRef}
          type="file"
          accept={isPdf ? ".pdf,application/pdf" : "image/*"}
          onChange={handleInternalFileChange}
          className="hidden"
        />
      )}

      {/* Children for host-managed elements (e.g. custom file input) */}
      {children}

      {/* Integrated Reposition Editor Modal */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={handleCloseRepositionModal}
        >
          <div
            className="bg-[#0D121F] border border-[#23242B] rounded-2xl max-w-[420px] w-full shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#23242B] flex items-center justify-between bg-[#111624] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 shrink-0">
                  <Move className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white tracking-wide truncate">
                    Reposition {spotTitle} Photo
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Drag photo &amp; adjust zoom framing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseRepositionModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#12131A] transition cursor-pointer shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Frame: Drag to Pan with Zoom */}
            <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-medium">Pan position:</span>
                <span className="px-2 py-0.5 rounded bg-[#12131A] text-[#FBBF24] border border-[#F59E0B]/30 font-bold">
                  {panX}% {panY}% {zoom > 1 ? `• ${Number(zoom).toFixed(2)}x` : ""}
                </span>
              </div>

              <div
                ref={frameRef}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                style={getModalAspectStyle(previewAspect, aspectRatio)}
                className={`relative rounded-2xl overflow-hidden bg-[#070A0F] border select-none transition-all ${
                  isDraggingPan
                    ? "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] cursor-grabbing"
                    : "border-[#F59E0B]/40 hover:border-emerald-400 cursor-grab"
                }`}
              >
                <Image
                  src={displayUrl || "/ashifur.jpeg"}
                  alt="Reposition Preview"
                  draggable={false}
                  fill
                  unoptimized
                  style={{
                    objectPosition: `${panX}% ${panY}%`,
                    transform: zoom > 1 ? `scale(${zoom})` : undefined,
                    transformOrigin: `${panX}% ${panY}%`,
                  }}
                  className="object-cover pointer-events-none select-none transition-none"
                />

                {/* 3x3 Grid Lines on Drag */}
                {isDraggingPan && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-400/50 bg-[#F59E0B]/10 animate-in fade-in duration-100">
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div className="border-r border-b border-emerald-400/30" />
                    <div />
                  </div>
                )}
              </div>

              {/* Zoom Slider Bar */}
              <div className="p-3.5 rounded-xl bg-[#090D15] border border-[#23242B] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ZoomIn className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Zoom:</span>
                    <span className="font-bold text-[#FBBF24]">{Number(zoom).toFixed(2)}x</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetRepositionInModal}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset position</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.05) * 100) / 100))}
                    className="p-1.5 rounded-lg bg-[#12131A] hover:bg-[#1E2638] text-slate-300 hover:text-white transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="1.00"
                    max="2.00"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#F59E0B] cursor-pointer h-1.5 bg-[#12131A] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.05) * 100) / 100))}
                    className="p-1.5 rounded-lg bg-[#12131A] hover:bg-[#1E2638] text-slate-300 hover:text-white transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3.5 border-t border-[#23242B] bg-[#0A0E18] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCloseRepositionModal}
                className="px-4 py-2 rounded-xl bg-[#12131A] hover:bg-[#1E2638] text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyReposition}
                className="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
