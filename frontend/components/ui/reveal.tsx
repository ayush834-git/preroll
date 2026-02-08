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
  const initial =
    isCinematic ? { opacity: 0, y: 14 } : isReduced ? { opacity: 0, y: 6 } : false;
  const whileInView = { opacity: 1, y: 0 };
  const transition = isCinematic
    ? { duration: 0.6, ease: "easeOut", delay }
    : isReduced
    ? { duration: 0.25, ease: "easeOut", delay: delay * 0.5 }
    : { duration: 0 };

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
