"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const mode = usePerformanceMode();
  const isCinematic = mode === "cinematic";
  const isReduced = mode === "reduced";
  const isPerformance = mode === "performance";
  const initial =
    isPerformance
      ? false
      : isCinematic
      ? { opacity: 0, y: 18, scale: 0.992 }
      : { opacity: 0, y: 8, scale: 0.996 };
  const whileInView = { opacity: 1, y: 0, scale: 1 };
  const transition = isCinematic
    ? {
        type: "spring",
        stiffness: 140,
        damping: 22,
        mass: 0.8,
        delay,
      }
    : isReduced
    ? {
        type: "spring",
        stiffness: 200,
        damping: 26,
        mass: 0.65,
        delay: delay * 0.5,
      }
    : { duration: 0 };

  return (
    <motion.div
      className={cn(className)}
      style={{ willChange: isPerformance ? "auto" : "transform, opacity" }}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, amount: 0.18 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
