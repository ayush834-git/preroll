"use client";

import { useEffect } from "react";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

export function PerformanceModeRoot() {
  const mode = usePerformanceMode();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.performance = mode;
    if (document.body) {
      document.body.dataset.performance = mode;
    }
  }, [mode]);

  return null;
}
