"use client";

import { useRef, memo } from "react";

const SpotlightCard = memo(function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(16, 185, 129, 0.08)",
  borderColor = "rgba(16, 185, 129, 0.15)",
  ...props
}) {
  const cardRef = useRef(null);

  // Pure DOM mutation on pointer moves - ZERO React state re-renders for 120fps performance
  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--spotlight-x", `${x}px`);
    cardRef.current.style.setProperty("--spotlight-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`group relative rounded-2xl bg-[#0B0F17] border border-[#1E2638] overflow-hidden transition-colors duration-150 ${className}`}
      style={{
        "--spotlight-x": "-999px",
        "--spotlight-y": "-999px",
      }}
      {...props}
    >
      {/* Hardware-accelerated GPU radial spotlight using CSS custom properties */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `radial-gradient(350px circle at var(--spotlight-x) var(--spotlight-y), ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Dynamic Border Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 border"
        style={{
          borderColor,
          maskImage: "radial-gradient(280px circle at var(--spotlight-x) var(--spotlight-y), black, transparent)",
          WebkitMaskImage: "radial-gradient(280px circle at var(--spotlight-x) var(--spotlight-y), black, transparent)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
});

export default SpotlightCard;
