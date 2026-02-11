"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = usePerformanceMode();
  const isCinematic = mode === "cinematic";
  const isReduced = mode === "reduced";
  const isPerformance = mode === "performance";
  const initial =
    isPerformance
      ? false
      : isCinematic
      ? { opacity: 0, y: 16, scale: 0.996 }
      : { opacity: 0, y: 8, scale: 0.998 };
  const animate = { opacity: 1, y: 0, scale: 1 };
  const exit = isPerformance
    ? { opacity: 1, y: 0, scale: 1 }
    : isCinematic
    ? { opacity: 0, y: -12, scale: 1.002 }
    : { opacity: 0, y: -6, scale: 1.001 };
  const transition: Transition = isPerformance
    ? { duration: 0 }
    : isCinematic
    ? { type: "spring" as const, stiffness: 170, damping: 24, mass: 0.85 }
    : isReduced
    ? { type: "spring" as const, stiffness: 220, damping: 28, mass: 0.7 }
    : { duration: 0.2 };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        style={{ willChange: isPerformance ? "auto" : "transform, opacity" }}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
