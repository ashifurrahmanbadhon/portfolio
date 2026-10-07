"use client";

import { memo } from "react";
import { motion } from "motion/react";

/**
 * Minimal Premium Static Logo with subtle Motion-based micro-animations.
 * - Stays completely static during normal use (zero CPU/GPU loops).
 * - Animates on initial page load (spring reveal).
 * - Animates subtly on hover (scale & glow).
 * - Animates on sidebar state changes (layout/state transition).
 */
const AnimatedLogo = memo(function AnimatedLogo({
  size = 32,
  showText = false,
  collapsed = false,
  className = "",
}) {
  return (
    <motion.div
      key={typeof collapsed === "boolean" ? (collapsed ? "col" : "exp") : "logo"}
      className={`group inline-flex items-center gap-2.5 select-none cursor-pointer ${className}`}
      initial={{ opacity: 0, scale: 0.9, y: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 24,
      }}
    >
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 36 36"
          className="w-full h-full filter drop-shadow-[0_2px_10px_rgba(16,185,129,0.12)] transition-all duration-200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <linearGradient id="premiumLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="innerGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Outer Rounded Container Badge */}
          <rect
            x="1.5"
            y="1.5"
            width="33"
            height="33"
            rx="8.5"
            fill="#0D131F"
            stroke="#1E2638"
            strokeWidth="1.2"
            className="transition-colors duration-200 group-hover:stroke-emerald-500/50 group-hover:fill-[#0F172A]"
          />

          {/* Inner Ambient Glow Mask */}
          <rect
            x="2.5"
            y="2.5"
            width="31"
            height="31"
            rx="7.5"
            fill="url(#innerGlowGrad)"
            className="opacity-40 group-hover:opacity-80 transition-opacity duration-200"
          />

          {/* Isometric Monogram Emblem (Static, Minimal, High-Precision) */}
          <g className="transition-transform duration-200 ease-out group-hover:scale-105 origin-center">
            {/* Top Diamond Facet */}
            <path
              d="M18 9.5L24.5 13.8L18 18.2L11.5 13.8L18 9.5Z"
              fill="url(#premiumLogoGrad)"
              fillOpacity="0.95"
            />
            {/* Left Prism Facet */}
            <path
              d="M11.5 14.8L17.5 18.8V26.2L11.5 22.2V14.8Z"
              fill="#06B6D4"
              fillOpacity="0.8"
            />
            {/* Right Prism Facet */}
            <path
              d="M24.5 14.8L18.5 18.8V26.2L24.5 22.2V14.8Z"
              fill="#10B981"
              fillOpacity="0.88"
            />
            {/* Micro Center Tech Core */}
            <circle cx="18" cy="18" r="1.3" fill="#FFFFFF" fillOpacity="0.9" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white tracking-wider text-xs sm:text-sm group-hover:text-emerald-300 transition-colors duration-150">
              ASHIFUR RAHMAN
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider">
              PRO
            </span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] tracking-wide font-medium">
            CENTRAL CMS
          </span>
        </div>
      )}
    </motion.div>
  );
});

export default AnimatedLogo;
