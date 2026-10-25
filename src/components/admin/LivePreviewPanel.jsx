"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Loader2,
} from "lucide-react";

/**
 * LivePreviewPanel (Reference 2 Design - Compact Rail Component)
 * Flat, lightweight live simulation preview panel with Desktop / Mobile viewport toggle,
 * traffic light browser chrome, auto-scaling mobile frame, and bidirectional draft synchronization.
 */
export default function LivePreviewPanel({
  url = "/",
  draftSection = "",
  getDraftData = null,
  savedOnly = false,
  defaultDevice = "desktop",
  defaultCollapsed = false,
  collapsible = true,
  className = "",
}) {
  const [device, setDevice] = useState(defaultDevice); // 'desktop' | 'mobile'
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const stageRef = useRef(null);
  const [mobileScale, setMobileScale] = useState(1);
  const debounceTimerRef = useRef(null);

  // Clean URL for open-in-new-tab link (no cms_preview param)
  const cleanUrl = url.split("?")[0] || "/";

  // Target preview URL with cms_preview=1 param
  const previewUrl = savedOnly
    ? url
    : url + (url.includes("?") ? "&" : "?") + "cms_preview=1";

  // Dispatch draft payload to iframe
  const sendDraft = useCallback(() => {
    if (savedOnly || !getDraftData || !iframeRef.current?.contentWindow) return;

    try {
      const data = getDraftData();
      iframeRef.current.contentWindow.postMessage(
        {
          type: "CMS_PREVIEW_DRAFT",
          section: draftSection,
          data,
        },
        window.location.origin
      );
    } catch (_) {}
  }, [savedOnly, getDraftData, draftSection]);

  // Debounced send when draft data dependencies change
  useEffect(() => {
    if (savedOnly || !getDraftData) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      sendDraft();
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [sendDraft, savedOnly, getDraftData]);

  // Listen for CMS_PREVIEW_READY from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "CMS_PREVIEW_READY") {
        sendDraft();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendDraft]);

  // Auto-scale mobile frame (390x844) to fit stage without overflowing
  useEffect(() => {
    if (!stageRef.current || device !== "mobile" || collapsed) return;

    const calculateScale = () => {
      if (!stageRef.current) return;
      const { clientWidth, clientHeight } = stageRef.current;
      const targetW = 390 + 24; // 390px + margin
      const targetH = 844 + 24; // 844px + margin
      const scaleX = clientWidth / targetW;
      const scaleY = clientHeight / targetH;
      const s = Math.min(1, Math.min(scaleX, scaleY));
      setMobileScale(Math.max(0.25, s));
    };

    calculateScale();
    const ro = new ResizeObserver(calculateScale);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [device, collapsed]);

  const handleRefresh = () => {
    setLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className={`w-full rounded-2xl bg-[#0B0F17] border border-[#1E2638] overflow-hidden flex flex-col transition-colors duration-150 ${className}`}
    >
      {/* Browser Chrome Bar */}
      <div className="px-3 py-2.5 bg-[#0E131F] border-b border-[#1E2638] flex items-center justify-between gap-2 select-none shrink-0">
        {/* Left: Traffic light dots & LIVE SIMULATION label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] inline-block" />
          </div>

          <span className="text-[10px] font-mono font-bold text-slate-300 tracking-wider">
            LIVE SIMULATION
          </span>
        </div>

        {/* Center: URL Pill */}
        <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[220px] mx-1">
          <div className="w-full bg-[#070A0F] border border-[#1E2638] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 text-center truncate">
            {cleanUrl}
          </div>
        </div>

        {/* Right: Controls (Desktop/Mobile Toggle, Refresh, Open New Tab, Collapse) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Segmented Desktop / Mobile Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#070A0F] border border-[#1E2638] text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors duration-150 cursor-pointer ${
                device === "desktop"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden xl:inline text-[10px]">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors duration-150 cursor-pointer ${
                device === "mobile"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden xl:inline text-[10px]">Mobile</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white border border-[#1E2638] transition-colors duration-150 cursor-pointer"
            title="Reload Preview"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Open in New Tab */}
          <a
            href={cleanUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white border border-[#1E2638] transition-colors duration-150 cursor-pointer"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Collapse / Expand Button (if collapsible) */}
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="p-1 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white border border-[#1E2638] transition-colors duration-150 cursor-pointer"
              title={collapsed ? "Expand Simulation" : "Collapse Simulation"}
              aria-label={collapsed ? "Expand Simulation" : "Collapse Simulation"}
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  collapsed ? "-rotate-90" : "rotate-0"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Stage: Iframe Viewport */}
      {!collapsed && (
        <div
          ref={stageRef}
          className="flex-1 min-h-[300px] relative bg-[#070A0F] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden"
        >
          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 z-10 bg-[#070A0F]/85 flex flex-col items-center justify-center gap-1.5 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span className="text-[11px] font-mono">Loading simulation...</span>
            </div>
          )}

          {device === "desktop" ? (
            /* DESKTOP VIEWPORT */
            <div className="w-full h-full rounded-xl overflow-hidden border border-[#1E2638] bg-[#080C14]">
              <iframe
                key={`desktop-${iframeKey}-${url}`}
                ref={iframeRef}
                src={previewUrl}
                title="Live preview"
                sandbox="allow-same-origin allow-scripts"
                onLoad={() => {
                  setLoading(false);
                  sendDraft();
                }}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* MOBILE VIEWPORT (Device Frame 390x844 scaled to container) */
            <div
              style={{
                width: 390,
                height: 844,
                transform: `scale(${mobileScale})`,
                transformOrigin: "center center",
              }}
              className="rounded-[28px] border-[3px] border-[#1E2638] bg-black shrink-0 relative flex flex-col overflow-hidden shadow-md"
            >
              {/* Notch */}
              <div className="w-full h-5 bg-[#0E131F] flex items-center justify-center shrink-0 border-b border-[#1E2638]/50">
                <div className="w-16 h-2.5 bg-black rounded-full" />
              </div>

              {/* Iframe */}
              <iframe
                key={`mobile-${iframeKey}-${url}`}
                ref={iframeRef}
                src={previewUrl}
                title="Live preview (Mobile)"
                sandbox="allow-same-origin allow-scripts"
                onLoad={() => {
                  setLoading(false);
                  sendDraft();
                }}
                className="w-full flex-1 border-0 bg-[#080C14]"
              />

              {/* Bottom Home Indicator */}
              <div className="w-full h-3.5 bg-[#0E131F] flex items-center justify-center shrink-0 border-t border-[#1E2638]/50">
                <div className="w-24 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
