"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = usePerformanceMode();
  const isCinematic = mode === "cinematic";
  const isReduced = mode === "reduced";
  const isPerformance = mode === "performance";
  const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const initial =
    isPerformance
      ? false
      : isCinematic
      ? { opacity: 0, y: 12 }
      : { opacity: 0, y: 6 };
  const animate = { opacity: 1, y: 0 };
  const exit = isPerformance
    ? { opacity: 1, y: 0 }
    : isCinematic
    ? { opacity: 0, y: -12 }
    : { opacity: 0, y: -6 };
  const transition = isPerformance
    ? { duration: 0 }
    : isCinematic
    ? { duration: 0.35, ease: easeOut }
    : { duration: 0.2, ease: easeOut };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
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
