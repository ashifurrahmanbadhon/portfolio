import React from 'react';

export default function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Top-right 58vw amber radial glow α.08, 30s ease-in-out infinite alternate */}
      <div
        className="absolute -top-[8vw] -right-[8vw] w-[58vw] h-[58vw] rounded-full blur-[130px] animate-glow-drift-1 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 55%, transparent 75%)',
        }}
      />
      {/* Bottom-left 52vw amber radial glow α.06, 38s ease-in-out infinite alternate */}
      <div
        className="absolute -bottom-[8vw] -left-[8vw] w-[52vw] h-[52vw] rounded-full blur-[140px] animate-glow-drift-2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, rgba(245, 158, 11, 0.015) 55%, transparent 75%)',
        }}
      />
    </div>
  );
}
