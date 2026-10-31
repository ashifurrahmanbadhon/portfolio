import React from 'react';

export default function BackgroundGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Top-right: 58vw circle, radial-gradient ONLY, NO blur filter */}
      <div
        className="absolute -top-[8vw] -right-[8vw] w-[58vw] h-[58vw] rounded-full animate-glow-drift-1 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 65%)',
        }}
      />
      {/* Bottom-left: 52vw circle, radial-gradient ONLY, NO blur filter */}
      <div
        className="absolute -bottom-[8vw] -left-[8vw] w-[52vw] h-[52vw] rounded-full animate-glow-drift-2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 65%)',
        }}
      />
    </div>
  );
}
