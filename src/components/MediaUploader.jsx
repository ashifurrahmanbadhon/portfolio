"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ImageUploadBox, { downscalePhotoToWebP } from "@/components/admin/ImageUploadBox";

export default function MediaUploader({
  value = "",
  onChange,
  positionValue = "50% 50%",
  onPositionChange,
  label = "Upload Media",
  description = "Drag & drop file or browse from device",
  type = "image", // 'image' | 'video' | 'media' | 'document'
  accept,
  maxSizeMB = 15,
  aspectRatio = "wide", // 'square' | 'portrait' | 'video' | 'wide'
  previewAspect,
  defaultValue = "",
  defaultPosition = "50% 50%",
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempPreview, setTempPreview] = useState(null);
  const [urlInput, setUrlInput] = useState(value || "");

  useEffect(() => {
    setUrlInput(value || "");
  }, [value]);

  const isPdf = type === "document" || (typeof value === "string" && value.toLowerCase().endsWith(".pdf"));

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

  // Device upload execution
  const executeUpload = async (rawFile) => {
    if (!rawFile) return;

    // Show temporary preview with upload percentage directly over the tile
    if (rawFile.type && rawFile.type.startsWith("image/")) {
      try {
        const objUrl = URL.createObjectURL(rawFile);
        setTempPreview(objUrl);
      } catch (e) {}
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      let fileToUpload = rawFile;

      // Downscale photo to max 1024x1024 WebP 0.85 (PDFs are untouched)
      if (!isPdf && rawFile.type && rawFile.type.startsWith("image/")) {
        const { file: optimized } = await downscalePhotoToWebP(rawFile);
        if (optimized) {
          fileToUpload = optimized;
        }
      }

      setUploadProgress(40);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await api.uploadMedia(fileToUpload);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (res && res.success && res.url) {
        showToast("File uploaded successfully!", "success");
        if (onChange) {
          onChange(res.url, res.file_name);
        }
        setUrlInput(res.url);
      } else {
        // Fallback to local data URL if upload failed
        if (!isPdf && rawFile.type && rawFile.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result;
            if (dataUrl && onChange) {
              onChange(dataUrl, rawFile.name);
              setUrlInput(dataUrl);
              showToast("Loaded image directly", "info");
            }
          };
          reader.readAsDataURL(fileToUpload);
        } else {
          showToast(res?.error || "Failed to upload media.", "error");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (!isPdf && rawFile.type && rawFile.type.startsWith("image/")) {
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
        showToast("Upload error. Please check your connection.", "error");
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

    // Size limit check ONLY for document / PDF (CV spot) - photos have NO size limit
    if (isPdf) {
      const sizeInMB = rawFile.size / (1024 * 1024);
      if (sizeInMB > maxSizeMB) {
        showToast(`Document size (${sizeInMB.toFixed(1)}MB) exceeds ${maxSizeMB}MB limit.`, "error");
        return;
      }
    }

    executeUpload(rawFile);
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

  const handleReset = () => {
    const targetVal = defaultValue !== undefined ? defaultValue : "";
    if (onChange) onChange(targetVal, "");
    if (onPositionChange) {
      onPositionChange(defaultPosition || "50% 50%");
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
        positionValue={positionValue || "50% 50%"}
        onPositionChange={onPositionChange}
        defaultValue={defaultValue}
        defaultPosition={defaultPosition || "50% 50%"}
        uploading={uploading}
        uploadProgress={uploadProgress}
        tempPreview={tempPreview}
        onPickFile={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        isDragging={isDragging}
        onReset={handleReset}
        urlValue={urlInput}
        onUrlChange={(newUrl) => {
          setUrlInput(newUrl);
          if (onChange) onChange(newUrl, "");
        }}
        onUrlApply={handleUrlApply}
        maxSizeLabel={
          isPdf
            ? "Max 15MB • PDF"
            : "JPG, PNG, WebP, SVG, GIF • auto-optimized to max 1024px on upload"
        }
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
    </div>
  );
}
