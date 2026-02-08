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

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let timeoutId: number | undefined;

    const setScrolling = (value: boolean) => {
      if (value) {
        document.documentElement.dataset.scrolling = "true";
        if (document.body) {
          document.body.dataset.scrolling = "true";
        }
      } else {
        delete document.documentElement.dataset.scrolling;
        if (document.body) {
          delete document.body.dataset.scrolling;
        }
      }
    };

    const onScroll = () => {
      setScrolling(true);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => setScrolling(false), 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setScrolling(false);
    };
  }, []);

  return null;
}
