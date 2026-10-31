"use client";

import { memo } from "react";

const SpotlightCard = memo(function SpotlightCard({
  children,
  className = "",
  contentClassName = "",
  spotlightColor = "rgba(245, 158, 11, 0.12)",
  borderColor = "rgba(245, 158, 11, 0.45)",
  ...props
}) {
  return (
    <div
      className={`stat-box relative bg-[#0A0B10] border border-[#23242B] transition-all duration-200 ${className}`}
      {...props}
    >
      <div className={`relative z-10 w-full ${contentClassName}`}>{children}</div>
    </div>
  );
});

export default SpotlightCard;
