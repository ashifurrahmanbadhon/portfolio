"use client";

import { useState, useEffect, memo } from "react";

const CountUp = memo(function CountUp({ to = 0, duration = 400, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCount(to);
      return;
    }

    const end = parseInt(to, 10);
    if (isNaN(end) || end === 0) {
      setCount(to);
      return;
    }

    let frameId;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fast spring ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);

      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    frameId = requestAnimationFrame(updateCount);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [to, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
});

export default CountUp;
