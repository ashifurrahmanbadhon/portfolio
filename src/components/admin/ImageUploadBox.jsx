"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  RotateCcw,
  ExternalLink,
  Move,
  FileText,
  Eye,
  Film,
} from "lucide-react";

/**
 * getInlineAspectStyle
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
 * ImageUploadBox (Reference 1 Design)
 * Pure presentational upload component matching the Reference 1 UI layout with Emerald accent.
 */
export default function ImageUploadBox({
  value = "",
  type = "image",
  label = "Upload Image",
  description = "",
  previewAspect = "16/9",
  aspectRatio = "wide",
  positionStyle = null,
  uploading = false,
  uploadProgress = 0,
  tempPreview = null,
  onPickFile = () => {},
  onDrop = () => {},
  onDragOver = () => {},
  onDragLeave = () => {},
  isDragging = false,
  onReset = () => {},
  onOpenReposition = null,
  urlValue = "",
  onUrlChange = null,
  onUrlApply = () => {},
  maxSizeLabel = "",
  children = null,
}) {
  const [internalUrl, setInternalUrl] = useState(urlValue || value || "");

  useEffect(() => {
    setInternalUrl(urlValue !== undefined && urlValue !== null ? urlValue : value || "");
  }, [urlValue, value]);

  const displayUrl = tempPreview || value;
  const isPdf = type === "document" || (typeof displayUrl === "string" && displayUrl.toLowerCase().endsWith(".pdf"));
  const isVideo = type === "video" || (type === "media" && typeof displayUrl === "string" && (displayUrl.endsWith(".mp4") || displayUrl.endsWith(".webm")));
  const isImage = !isPdf && !isVideo;

  const isSquare = aspectRatio === "square" || previewAspect === "1/1";
  const tileAspect = getInlineAspectStyle(previewAspect, aspectRatio);

  const handleUrlBlurOrEnter = () => {
    if (onUrlApply) {
      onUrlApply(internalUrl);
    }
  };

  const defaultMaxLabel = isPdf
    ? "Max 15MB • PDF"
    : isVideo
    ? "Max 50MB • MP4, WebM"
    : "Max 10MB • JPG, PNG, WebP, SVG, GIF";

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border transition-colors duration-150 flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch ${
        isDragging
          ? "border-emerald-400 bg-emerald-500/10"
          : "border-[#1E2638] hover:border-[#27324A]"
      }`}
    >
      {/* LEFT COLUMN: Preview Tile */}
      <div className={`shrink-0 flex flex-col justify-center ${
        isSquare
          ? "w-40 sm:w-[170px] md:w-[185px] mx-auto sm:mx-0"
          : "w-full sm:w-[220px] md:w-[250px]"
      }`}>
        <div
          style={tileAspect}
          className={`relative rounded-xl overflow-hidden border border-[#1E2638] bg-[#070A0F] flex items-center justify-center transition select-none group/tile ${
            onOpenReposition && !uploading && isImage && displayUrl ? "cursor-pointer" : ""
          }`}
          onClick={() => {
            if (onOpenReposition && !uploading && isImage && displayUrl) {
              onOpenReposition();
            }
          }}
          title={onOpenReposition && isImage && displayUrl ? "Click to reposition photo" : undefined}
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
                    className="text-emerald-400 transition-all duration-150"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-black text-emerald-300">
                  {uploadProgress}%
                </span>
              </div>
              <p className="text-[11px] font-bold text-white tracking-wide">Uploading...</p>
              <div className="w-28 h-1 bg-[#161C2A] rounded-full overflow-hidden mt-1.5 border border-[#1E2638]">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Open Full File Link Button (top-right) */}
          {displayUrl && !uploading && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/70 hover:bg-black text-slate-300 hover:text-white border border-[#1E2638] transition cursor-pointer"
              title="Open Full File in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-0.5 font-mono"
              >
                <Eye className="w-3 h-3" /> View / Test PDF
              </a>
            </div>
          )}

          {/* Video Preview */}
          {displayUrl && isVideo && (
            <video
              src={displayUrl}
              controls
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Image Preview */}
          {displayUrl && isImage && (
            <>
              <Image
                src={displayUrl}
                alt={typeof label === "string" ? label : "Uploaded image preview"}
                fill
                unoptimized
                style={positionStyle || { objectPosition: "center 15%" }}
                className="object-cover transition-all select-none"
              />

              {/* Reposition Overlay Badge on Hover */}
              {onOpenReposition && !uploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/tile:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2 pointer-events-none">
                  <span className="px-3 py-1.5 rounded-xl bg-black/90 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reposition Photo</span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Controls (Reference 1) */}
      <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
        {/* Label & Description */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
            {isPdf ? (
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isVideo ? (
              <Film className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-semibold text-slate-200">{label}</span>
          </div>
          {description && (
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        {/* PRIMARY BUTTON: Upload From Device */}
        <button
          type="button"
          onClick={onPickFile}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-colors duration-150 cursor-pointer active:scale-[0.99] select-none"
        >
          <Upload className="w-4 h-4 text-slate-950 shrink-0" />
          <span className="whitespace-nowrap">{isPdf ? "UPLOAD PDF FROM DEVICE" : "UPLOAD FROM DEVICE"}</span>
        </button>

        {/* SECONDARY BUTTON: Reset to Default */}
        <button
          type="button"
          onClick={onReset}
          className="w-full bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 hover:text-white border border-[#1E2638] py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition cursor-pointer select-none"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="whitespace-nowrap">RESET TO DEFAULT</span>
        </button>

        {/* URL Input Section */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            {isPdf
              ? "OR ENTER FILE URL (CDN / LOCAL PATH)"
              : "OR ENTER IMAGE URL (CDN / LOCAL PATH)"}
          </label>
          <input
            type="text"
            value={internalUrl}
            onChange={(e) => {
              setInternalUrl(e.target.value);
              if (onUrlChange) onUrlChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlBlurOrEnter();
              }
            }}
            onBlur={handleUrlBlurOrEnter}
            placeholder="https://... or /images/..."
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition"
          />
        </div>

        {/* Small Print: Max Size & Formats & Current Value */}
        <div className="text-[11px] font-mono text-slate-500 space-y-0.5 pt-0.5">
          <p>{maxSizeLabel || defaultMaxLabel}</p>
          {value && (
            <p className="truncate text-slate-400">
              Current: <span className="text-emerald-400 font-mono">{value}</span>
            </p>
          )}
        </div>
      </div>

      {/* Children for host-managed elements (e.g. hidden file input, modals) */}
      {children}
    </div>
  );
}
