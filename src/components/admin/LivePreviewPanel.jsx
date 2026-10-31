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
 * traffic light browser chrome, auto-scaling fitted frames, and bidirectional draft synchronization.
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
  const [mobileScale, setMobileScale] = useState(null);
  const [desktopScale, setDesktopScale] = useState(null);
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

  // Trigger loading spinner when preview URL changes
  useEffect(() => {
    setLoading(true);
  }, [url]);

  // Compute exact scale factors so preview frames fit inside stage without overflowing
  const calculateScale = useCallback(() => {
    const el = stageRef.current;
    if (!el || collapsed) return;

    const rect = el.getBoundingClientRect();
    const stageW = el.clientWidth || rect.width;
    const stageH = el.clientHeight || rect.height;

    if (stageW <= 0 || stageH <= 0) return;

    // Desktop: logical 1440x900. Target 1464x924 (padding included), capped at 1
    const sDesktopFit = Math.min(
      1,
      Math.min((stageW - 24) / 1440, (stageH - 24) / 900, stageW / 1464, stageH / 924)
    );
    setDesktopScale(Math.max(0.05, sDesktopFit));

    // Mobile: logical 390x844. Target 414x868 (padding included), capped at 1
    const sMobileFit = Math.min(
      1,
      Math.min((stageW - 24) / 390, (stageH - 24) / 844, stageW / 414, stageH / 868)
    );
    setMobileScale(Math.max(0.05, sMobileFit));
  }, [collapsed]);

  // Recompute scale on mount, stage resize, tab visibility, device switch, url change, or uncollapse
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    calculateScale();

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        calculateScale();
      });
      ro.observe(el);
    }

    let io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            calculateScale();
          }
        }
      });
      io.observe(el);
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        calculateScale();
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", calculateScale);
    window.addEventListener("focus", calculateScale);

    return () => {
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", calculateScale);
      window.removeEventListener("focus", calculateScale);
    };
  }, [calculateScale, device, url, collapsed]);

  const handleRefresh = () => {
    setLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const isScaleReady =
    device === "desktop"
      ? desktopScale !== null && desktopScale > 0
      : mobileScale !== null && mobileScale > 0;

  return (
    <div
      className={`w-full bg-[#0A0B10] border border-[#23242B] overflow-hidden flex flex-col transition-colors duration-150 ${className}`}
    >
      {/* Browser Chrome Bar */}
      <div className="px-3 py-2.5 bg-[#06070B] border-b border-[#23242B] flex items-center justify-between gap-2 select-none shrink-0">
        {/* Left: Traffic light dots & LIVE SIMULATION label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] inline-block" />
          </div>

          <span className="text-[10px] font-mono font-bold text-[#F5F2EA] tracking-wider">
            LIVE SIMULATION
          </span>
        </div>

        {/* Center: URL Pill */}
        <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[220px] mx-1">
          <div className="w-full bg-[#0A0B10] border border-[#23242B] px-2.5 py-0.5 text-[10px] font-mono text-[#F59E0B] text-center truncate">
            {cleanUrl}
          </div>
        </div>

        {/* Right: Controls (Desktop/Mobile Toggle, Refresh, Open New Tab, Collapse) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Segmented Desktop / Mobile Toggle */}
          <div className="flex items-center p-0.5 bg-[#0A0B10] border border-[#23242B] text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                setDevice("desktop");
                calculateScale();
              }}
              className={`flex items-center gap-1 px-2 py-0.5 transition-colors duration-150 cursor-pointer ${
                device === "desktop"
                  ? "bg-[#F59E0B] text-[#06070B] font-bold"
                  : "text-[#8E8B82] hover:text-[#F5F2EA]"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden xl:inline text-[10px]">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDevice("mobile");
                calculateScale();
              }}
              className={`flex items-center gap-1 px-2 py-0.5 transition-colors duration-150 cursor-pointer ${
                device === "mobile"
                  ? "bg-[#F59E0B] text-[#06070B] font-bold"
                  : "text-[#8E8B82] hover:text-[#F5F2EA]"
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
            className="p-1 bg-[#12131A] hover:bg-[#1A1B22] text-[#8E8B82] hover:text-[#F5F2EA] border border-[#23242B] transition-colors duration-150 cursor-pointer"
            title="Reload Preview"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Open in New Tab */}
          <a
            href={cleanUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 bg-[#12131A] hover:bg-[#1A1B22] text-[#8E8B82] hover:text-[#F5F2EA] border border-[#23242B] transition-colors duration-150 cursor-pointer"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Collapse / Expand Button (if collapsible) */}
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="p-1 bg-[#12131A] hover:bg-[#1A1B22] text-[#8E8B82] hover:text-[#F5F2EA] border border-[#23242B] transition-colors duration-150 cursor-pointer"
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
          className="flex-1 min-h-0 relative bg-[#06070B] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden w-full"
        >
          {/* Fitting placeholder: Never render unscaled iframe before scale is ready */}
          {!isScaleReady ? (
            <div className="absolute inset-0 z-10 bg-[#06070B] flex flex-col items-center justify-center gap-1.5 text-[#8E8B82]">
              <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
              <span className="text-[11px] font-mono">Fitting simulation...</span>
            </div>
          ) : (
            <>
              {/* Loading Indicator while iframe navigates */}
              {loading && (
                <div className="absolute inset-0 z-10 bg-[#06070B]/85 flex flex-col items-center justify-center gap-1.5 text-[#8E8B82] pointer-events-none">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
                  <span className="text-[11px] font-mono">Loading simulation...</span>
                </div>
              )}

              {device === "desktop" ? (
                /* DESKTOP VIEWPORT (1440x900 logical viewport scaled to fit stage) */
                <div
                  style={{
                    width: Math.round(1440 * desktopScale),
                    height: Math.round(900 * desktopScale),
                  }}
                  className="border border-[#23242B] bg-[#06070B] shrink-0 relative overflow-hidden"
                >
                  <div
                    style={{
                      width: 1440,
                      height: 900,
                      transform: `scale(${desktopScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      key={`desktop-${iframeKey}-${cleanUrl}`}
                      ref={iframeRef}
                      src={previewUrl}
                      title="Live preview"
                      sandbox="allow-same-origin allow-scripts"
                      onLoad={() => {
                        setLoading(false);
                        sendDraft();
                      }}
                      className="w-full h-full border-0 block"
                    />
                  </div>
                </div>
              ) : (
                /* MOBILE VIEWPORT (Device Frame 390x844 scaled to stage) */
                <div
                  style={{
                    width: Math.round(390 * mobileScale),
                    height: Math.round(844 * mobileScale),
                  }}
                  className="shrink-0 relative overflow-hidden"
                >
                  <div
                    style={{
                      width: 390,
                      height: 844,
                      transform: `scale(${mobileScale})`,
                      transformOrigin: "top left",
                    }}
                    className="rounded-[28px] border-[3px] border-[#23242B] bg-black relative flex flex-col overflow-hidden shadow-md"
                  >
                    {/* Notch */}
                    <div className="w-full h-5 bg-[#06070B] flex items-center justify-center shrink-0 border-b border-[#23242B]/50">
                      <div className="w-16 h-2.5 bg-black rounded-full" />
                    </div>

                    {/* Iframe */}
                    <iframe
                      key={`mobile-${iframeKey}-${cleanUrl}`}
                      ref={iframeRef}
                      src={previewUrl}
                      title="Live preview (Mobile)"
                      sandbox="allow-same-origin allow-scripts"
                      onLoad={() => {
                        setLoading(false);
                        sendDraft();
                      }}
                      className="w-full flex-1 border-0 bg-[#06070B]"
                    />

                    {/* Bottom Home Indicator */}
                    <div className="w-full h-3.5 bg-[#06070B] flex items-center justify-center shrink-0 border-t border-[#23242B]/50">
                      <div className="w-24 h-1 bg-[#23242B] rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}