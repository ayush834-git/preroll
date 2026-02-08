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

  return null;
}
