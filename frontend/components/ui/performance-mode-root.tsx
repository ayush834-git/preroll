"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

export function PerformanceModeRoot() {
  const mode = usePerformanceMode();

  const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.performance = mode;
    if (document.body) {
      document.body.dataset.performance = mode;
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    let rafId = 0;
    let latestScrollY = window.scrollY;
    let latestX = window.innerWidth * 0.5;
    let latestY = window.innerHeight * 0.5;

    const writeFrame = () => {
      // One rAF write batches scroll + pointer derived vars to avoid event-driven layout churn.
      const viewport = window.innerHeight;
      const scrollMax = Math.max(
        1,
        document.documentElement.scrollHeight - viewport
      );
      const progress = Math.min(1, Math.max(0, latestScrollY / scrollMax));
      const xp = latestX / Math.max(1, window.innerWidth);
      const yp = latestY / Math.max(1, window.innerHeight);

      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      root.style.setProperty("--pointer-x", latestX.toFixed(2));
      root.style.setProperty("--pointer-y", latestY.toFixed(2));
      root.style.setProperty("--pointer-xp", xp.toFixed(4));
      root.style.setProperty("--pointer-yp", yp.toFixed(4));
      rafId = 0;
    };

    const scheduleFrame = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(writeFrame);
    };

    const onScroll = () => {
      latestScrollY = window.scrollY;
      scheduleFrame();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (mode !== "cinematic") return;
      latestX = event.clientX;
      latestY = event.clientY;
      scheduleFrame();
    };

    scheduleFrame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleFrame, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleFrame);
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return null;
}
