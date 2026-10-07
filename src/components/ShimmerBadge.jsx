"use client";

export default function ShimmerBadge({
  children,
  className = "",
  variant = "emerald",
}) {
  const styles = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/25",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    slate: "bg-[#161C2A] text-slate-300 border-[#1E2638]",
  };

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border overflow-hidden shimmer-mask select-none ${
        styles[variant] || styles.emerald
      } ${className}`}
    >
      {children}
    </span>
  );
}
