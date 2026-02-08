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
  const getInitialMode = () => {
    if (typeof window === "undefined") return DEFAULT_MODE;
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    return detectPerformanceMode(mediaQuery.matches);
  };

  const [mode, setMode] = useState<PerformanceMode>(getInitialMode);

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

export function useAnimationBudget(): {
  mode: PerformanceMode;
  canAnimateContinuously: boolean;
} {
  const mode = usePerformanceMode();
  const [canAnimateContinuously, setCanAnimateContinuously] = useState(
    mode === "cinematic"
  );

  useEffect(() => {
    if (mode !== "cinematic") {
      setCanAnimateContinuously((current) =>
        current ? false : current
      );
      return;
    }

    setCanAnimateContinuously(true);

    let rafId = 0;
    let last = performance.now();
    const samples: number[] = [];
    const windowSize = 45;
    let goodStreak = 0;
    let badStreak = 0;

    const updateState = (next: boolean) => {
      setCanAnimateContinuously((current) =>
        current === next ? current : next
      );
    };

    const evaluate = (avg: number) => {
      if (avg > 20) {
        badStreak += 1;
        goodStreak = 0;
        if (badStreak >= 3) updateState(false);
        return;
      }

      if (avg < 16) {
        goodStreak += 1;
        badStreak = 0;
        if (goodStreak >= 3) updateState(true);
      }
    };

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      samples.push(delta);
      if (samples.length > windowSize) {
        samples.shift();
      }
      if (samples.length === windowSize) {
        const avg =
          samples.reduce((sum, value) => sum + value, 0) /
          windowSize;
        evaluate(avg);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return { mode, canAnimateContinuously };
}
