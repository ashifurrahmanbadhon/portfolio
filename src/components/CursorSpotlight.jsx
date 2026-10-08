'use client';

import { useEffect, useRef } from 'react';

/**
 * CursorSpotlight
 * Creates a GPU-accelerated interactive spotlight aura following the mouse
 * across the entire portfolio and admin dashboard.
 * - Zero React re-renders (direct CSS custom property mutation)
 * - Hardware accelerated (runs at 60-120fps)
 * - pointer-events: none (never interferes with clicks or selections)
 * - Automatically hidden on touch devices
 */
export default function CursorSpotlight() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if device has a fine pointer (mouse / trackpad)
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const el = containerRef.current;
    if (!el) return;

    let rafId = null;
    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let isVisible = false;

    const onPointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        el.style.opacity = '1';
        currentX = targetX;
        currentY = targetY;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      el.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      el.style.opacity = '1';
    };

    // Smooth lerp loop for fluid motion
    const loop = () => {
      if (isVisible) {
        // Linear interpolation for smooth trailing feel
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;

        el.style.setProperty('--cursor-x', `${currentX.toFixed(1)}px`);
        el.style.setProperty('--cursor-y', `${currentY.toFixed(1)}px`);
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden transition-opacity duration-300 opacity-0"
      style={{
        '--cursor-x': '-9999px',
        '--cursor-y': '-9999px',
      }}
    >
      {/* Outer ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px circle at var(--cursor-x) var(--cursor-y), rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02) 45%, transparent 70%)',
        }}
      />
      {/* Focused core highlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(220px circle at var(--cursor-x) var(--cursor-y), rgba(52, 211, 153, 0.06), transparent 60%)',
        }}
      />
    </div>
  );
}
