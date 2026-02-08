"use client";

import { useEffect, useState } from "react";

export type PerformanceMode = "cinematic" | "reduced" | "performance";

const DEFAULT_MODE: PerformanceMode = "cinematic";

function detectPerformanceMode(
  prefersReduced: boolean
): PerformanceMode {
  if (prefersReduced) return "performance";

  if (typeof navigator === "undefined") return DEFAULT_MODE;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    userAgentData?: { mobile?: boolean };
  };

  const deviceMemory = nav.deviceMemory ?? 0;
  const hardwareConcurrency = nav.hardwareConcurrency ?? 0;
  const userAgent = nav.userAgent ?? "";
  const isMobile =
    nav.userAgentData?.mobile ??
    /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);

  if (deviceMemory > 0) {
    if (deviceMemory > 16) return "cinematic";
    if (deviceMemory >= 12) return "reduced";
    return "performance";
  }

  if (isMobile || (hardwareConcurrency > 0 && hardwareConcurrency <= 4)) {
    return "reduced";
  }

  return "cinematic";
}

export function usePerformanceMode(): PerformanceMode {
  const [mode, setMode] = useState<PerformanceMode>(DEFAULT_MODE);

  useEffect(() => {
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
