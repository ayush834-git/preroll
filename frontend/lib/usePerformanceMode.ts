"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export type PerformanceMode = "cinematic" | "reduced" | "performance";

const DEFAULT_MODE: PerformanceMode = "reduced";

function detectPerformanceMode(prefersReduced: boolean): PerformanceMode {
  if (prefersReduced) return "performance";

  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return DEFAULT_MODE;
  }

  const nav = navigator as Navigator & {
    hardwareConcurrency?: number;
    maxTouchPoints?: number;
  };

  const isTouch =
    (nav.maxTouchPoints ?? 0) > 0 || "ontouchstart" in window;

  if (isTouch) return "performance";

  const hardwareConcurrency = nav.hardwareConcurrency ?? 0;

  if (hardwareConcurrency > 0 && hardwareConcurrency <= 4) {
    return "reduced";
  }

  if (hardwareConcurrency >= 8) {
    return "cinematic";
  }

  return "reduced";
}

export function usePerformanceMode(): PerformanceMode {
  const [mode, setMode] = useState<PerformanceMode>(DEFAULT_MODE);

  const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMode = () => {
      const nextMode = detectPerformanceMode(mediaQuery.matches);
      setMode((current) => (current === nextMode ? current : nextMode));
    };

    updateMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMode);
    } else {
      mediaQuery.addListener(updateMode);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateMode);
      } else {
        mediaQuery.removeListener(updateMode);
      }
    };
  }, []);

  return mode;
}
