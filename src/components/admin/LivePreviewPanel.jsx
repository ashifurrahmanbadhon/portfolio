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
 * LivePreviewPanel (Reference 2 Design)
 * Live Simulation preview panel with Desktop / Mobile viewport toggle,
 * traffic light browser chrome, and bidirectional live draft synchronization.
 */
export default function LivePreviewPanel({
  url = "/",
  draftSection = "",
  getDraftData = null,
  savedOnly = false,
  defaultDevice = "desktop",
  defaultCollapsed = false,
}) {
  const [device, setDevice] = useState(defaultDevice); // 'desktop' | 'mobile'
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Strip query param for the open-in-new-tab clean link
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

  const handleRefresh = () => {
    setLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0B0F17] border border-[#1E2638] overflow-hidden shadow-2xl transition-all duration-200 mb-6">
      {/* Browser Chrome Bar */}
      <div className="px-4 py-3 bg-[#0E131F] border-b border-[#1E2638] flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Left: Traffic light dots & LIVE SIMULATION label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] shadow-xs inline-block" />
          </div>

          <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
            LIVE SIMULATION
          </span>
        </div>

        {/* Center: URL Pill */}
        <div className="flex items-center justify-center flex-1 min-w-[140px] max-w-[340px] mx-auto order-3 sm:order-2">
          <div className="w-full bg-[#070A0F] border border-[#1E2638] px-3.5 py-1 rounded-full text-[11px] font-mono text-emerald-400 text-center truncate shadow-inner">
            {cleanUrl}
          </div>
        </div>

        {/* Right: Controls (Desktop/Mobile Toggle, Refresh, Open New Tab, Collapse) */}
        <div className="flex items-center gap-2 order-2 sm:order-3">
          {/* Segmented Desktop / Mobile Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#070A0F] border border-[#1E2638] text-xs font-mono">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer select-none ${
                device === "desktop"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer select-none ${
                device === "mobile"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white border border-[#1E2638] transition cursor-pointer"
            title="Reload Preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Open in New Tab */}
          <a
            href={cleanUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white border border-[#1E2638] transition cursor-pointer"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Collapse / Expand Button */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg bg-[#141A29] hover:bg-[#1E2638] text-slate-400 hover:text-white border border-[#1E2638] transition cursor-pointer flex items-center gap-1"
            title={collapsed ? "Expand Simulation" : "Collapse Simulation"}
            aria-label={collapsed ? "Expand Simulation" : "Collapse Simulation"}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                collapsed ? "-rotate-90" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stage: Iframe Viewport (collapsible) */}
      {!collapsed && (
        <div className="relative bg-[#070A0F] p-4 sm:p-6 flex items-center justify-center overflow-auto min-h-[300px]">
          {/* Loading Shimmer */}
          {loading && (
            <div className="absolute inset-0 z-10 bg-[#070A0F]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
              <span className="text-xs font-mono">Loading live simulation...</span>
            </div>
          )}

          {device === "desktop" ? (
            /* DESKTOP VIEWPORT */
            <div className="w-full h-[720px] max-h-[75vh] rounded-xl overflow-hidden border border-[#1E2638] shadow-2xl bg-[#080C14]">
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
            /* MOBILE VIEWPORT (Device Frame 390x844) */
            <div className="w-[390px] h-[844px] rounded-[32px] border-[4px] border-[#1E2638] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-black mx-auto relative flex flex-col">
              {/* Speaker / Dynamic Island notch bar */}
              <div className="w-full h-6 bg-[#0E131F] flex items-center justify-center shrink-0 border-b border-[#1E2638]/50">
                <div className="w-20 h-3 bg-black rounded-full" />
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
              <div className="w-full h-4 bg-[#0E131F] flex items-center justify-center shrink-0 border-t border-[#1E2638]/50">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
