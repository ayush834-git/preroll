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
  const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const initial =
    isCinematic ? { opacity: 0, y: 12 } : isReduced ? { opacity: 0, y: 6 } : false;
  const animate = { opacity: 1, y: 0 };
  const exit = isCinematic
    ? { opacity: 0, y: -12 }
    : isReduced
    ? { opacity: 0, y: -6 }
    : { opacity: 1, y: 0 };
  const transition = isCinematic
    ? { duration: 0.35, ease: easeOut }
    : isReduced
    ? { duration: 0.2, ease: easeOut }
    : { duration: 0 };

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
