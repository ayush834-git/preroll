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
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let scrollMax = Math.max(1, root.scrollHeight - viewportHeight);
    let targetScrollY = window.scrollY;
    let smoothScrollY = targetScrollY;
    let targetX = viewportWidth * 0.5;
    let targetY = viewportHeight * 0.5;
    let smoothX = targetX;
    let smoothY = targetY;
    let previousSmoothScrollY = smoothScrollY;
    const styleCache = new Map<string, string>();
    const scrollLerp =
      mode === "cinematic" ? 0.14 : mode === "reduced" ? 0.22 : 1;
    const pointerLerp =
      mode === "cinematic" ? 0.18 : mode === "reduced" ? 0.28 : 1;
    const epsilon = 0.08;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const updateScrollBounds = () => {
      scrollMax = Math.max(1, root.scrollHeight - viewportHeight);
      targetScrollY = clamp(window.scrollY, 0, scrollMax);
    };

    const setRootVar = (name: string, value: string) => {
      if (styleCache.get(name) === value) return;
      styleCache.set(name, value);
      root.style.setProperty(name, value);
    };

    const writeFrame = () => {
      // One batched write keeps scroll/pointer-driven motion consistent across the app.
      const rawProgress = clamp(targetScrollY / scrollMax, 0, 1);
      const smoothProgress = clamp(smoothScrollY / scrollMax, 0, 1);
      const xp = targetX / Math.max(1, viewportWidth);
      const yp = targetY / Math.max(1, viewportHeight);
      const xpSmooth = smoothX / Math.max(1, viewportWidth);
      const ypSmooth = smoothY / Math.max(1, viewportHeight);
      const velocity = clamp(
        (smoothScrollY - previousSmoothScrollY) / Math.max(1, viewportHeight),
        -1,
        1
      );

      setRootVar("--scroll-progress", rawProgress.toFixed(4));
      setRootVar(
        "--scroll-progress-smooth",
        smoothProgress.toFixed(4)
      );
      setRootVar("--scroll-velocity", velocity.toFixed(4));
      setRootVar("--pointer-x", targetX.toFixed(2));
      setRootVar("--pointer-y", targetY.toFixed(2));
      setRootVar("--pointer-xp", xp.toFixed(4));
      setRootVar("--pointer-yp", yp.toFixed(4));
      setRootVar("--pointer-x-smooth", smoothX.toFixed(2));
      setRootVar("--pointer-y-smooth", smoothY.toFixed(2));
      setRootVar("--pointer-xp-smooth", xpSmooth.toFixed(4));
      setRootVar("--pointer-yp-smooth", ypSmooth.toFixed(4));
      previousSmoothScrollY = smoothScrollY;
    };

    const animate = () => {
      targetScrollY = clamp(targetScrollY, 0, scrollMax);
      smoothScrollY = clamp(smoothScrollY, 0, scrollMax);
      smoothScrollY += (targetScrollY - smoothScrollY) * scrollLerp;
      smoothX += (targetX - smoothX) * pointerLerp;
      smoothY += (targetY - smoothY) * pointerLerp;
      writeFrame();

      const settled =
        Math.abs(targetScrollY - smoothScrollY) < epsilon &&
        Math.abs(targetX - smoothX) < epsilon &&
        Math.abs(targetY - smoothY) < epsilon;

      if (settled) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(animate);
    };

    const scheduleFrame = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(animate);
    };

    const centerPointer = () => {
      targetX = viewportWidth * 0.5;
      targetY = viewportHeight * 0.5;
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
      scheduleFrame();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (mode !== "cinematic") return;
      targetX = clamp(event.clientX, 0, viewportWidth);
      targetY = clamp(event.clientY, 0, viewportHeight);
      scheduleFrame();
    };

    const onPointerLeave = () => {
      centerPointer();
      scheduleFrame();
    };

    const onResize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      updateScrollBounds();
      if (mode !== "cinematic") {
        centerPointer();
      } else {
        targetX = clamp(targetX, 0, viewportWidth);
        targetY = clamp(targetY, 0, viewportHeight);
      }
      scheduleFrame();
    };

    if (mode !== "cinematic") {
      centerPointer();
    }
    updateScrollBounds();
    scheduleFrame();

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        updateScrollBounds();
        scheduleFrame();
      });
      resizeObserver.observe(root);
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    if (mode === "cinematic") {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (mode === "cinematic") {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      }
      resizeObserver?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return null;
}
