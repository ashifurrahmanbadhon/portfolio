"use client";

import { memo } from "react";
import { Zap, Wrench, Globe, Terminal, Layers } from "lucide-react";

/**
 * Official Portfolio Website Brand Logo (Ashifur Rahman • EEE Showcase)
 */
export const PortfolioLogo = memo(function PortfolioLogo({ size = 36, className = "" }) {
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10 group-hover:border-emerald-400/50 transition-all duration-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        className="w-full h-full p-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="arPortGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Engineering Energy Node Hex / Zap Shield */}
        <path
          d="M16 3L27 9.5V22.5L16 29L5 22.5V9.5L16 3Z"
          stroke="url(#arPortGrad)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        />
        {/* Electric Bolt Monogram */}
        <path
          d="M17 8L10 17H16L15 24L22 15H16L17 8Z"
          fill="url(#arPortGrad)"
          className="filter drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
        />
      </svg>
    </div>
  );
});

/**
 * Official ToolGhor Platform Brand Logo (27+ Web Tools Platform)
 */
export const ToolGhorLogo = memo(function ToolGhorLogo({ size = 36, className = "" }) {
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-blue-500/5 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/10 group-hover:border-teal-400/50 transition-all duration-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        className="w-full h-full p-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        {/* Modular Toolkit Hub Rounded Box */}
        <rect
          x="4.5"
          y="4.5"
          width="23"
          height="23"
          rx="6.5"
          stroke="url(#tgGrad)"
          strokeWidth="1.6"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        />
        {/* Dynamic Tool Icon / Dual Intersecting Nodes */}
        <path
          d="M12 11V15M12 15L15 18M12 15H8M20 21V17M20 17L17 14M20 17H24"
          stroke="url(#tgGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="2.2" fill="url(#tgGrad)" />
      </svg>
    </div>
  );
});

/**
 * General Generic Website Node Logo
 */
export const GenericSiteLogo = memo(function GenericSiteLogo({
  name = "Site",
  size = 36,
  className = "",
}) {
  const initials = (name || "WS").slice(0, 2).toUpperCase();
  return (
    <div
      className={`rounded-xl bg-[#161C2A] border border-[#1E2638] flex items-center justify-center font-mono text-xs font-bold text-slate-300 shrink-0 group-hover:border-slate-500/40 transition-colors ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
});

/**
 * Universal Website Logo Dispatcher
 */
export default memo(function WebsiteLogo({
  slug = "",
  name = "",
  size = 36,
  className = "",
}) {
  const normSlug = (slug || "").toLowerCase();
  const normName = (name || "").toLowerCase();

  if (normSlug.includes("portfolio") || normName.includes("portfolio") || normName.includes("ashifur")) {
    return <PortfolioLogo size={size} className={className} />;
  }

  if (normSlug.includes("toolghor") || normName.includes("toolghor") || normName.includes("tool")) {
    return <ToolGhorLogo size={size} className={className} />;
  }

  return <GenericSiteLogo name={name} size={size} className={className} />;
});
