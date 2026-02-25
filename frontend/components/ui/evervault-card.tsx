"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

type CardBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const EvervaultCard = memo(function EvervaultCard({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const mouseX = useMotionValue<number>(0);
  const mouseY = useMotionValue<number>(0);
  const mode = usePerformanceMode();
  const isCinematic = mode === "cinematic";
  const isReduced = mode === "reduced";
  const cardRef = useRef<HTMLDivElement | null>(null);
  const boundsRef = useRef<CardBounds | null>(null);

  const updateBounds = useCallback((target: HTMLDivElement | null) => {
    if (!target) return;
    const { left, top, width, height } = target.getBoundingClientRect();
    boundsRef.current = { left, top, width, height };
  }, []);

  useEffect(() => {
    if (!isCinematic) return;
    const onResize = () => {
      updateBounds(cardRef.current);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isCinematic, updateBounds]);

  // Keep texture stable per mode to prevent rerenders during hover movement.
  const randomString = useMemo(() => {
    const length = isCinematic ? 1500 : isReduced ? 500 : 0;
    return length > 0 ? generateRandomString(length) : "";
  }, [isCinematic, isReduced]);

  const onPointerEnter = useCallback(
    ({ currentTarget }: React.PointerEvent<HTMLDivElement>) => {
      if (!isCinematic) return;
      updateBounds(currentTarget);
    },
    [isCinematic, updateBounds]
  );

  const onPointerMove = useCallback(
    ({ currentTarget, clientX, clientY }: React.PointerEvent<HTMLDivElement>) => {
      if (!isCinematic) return;
      if (!boundsRef.current) {
        updateBounds(currentTarget);
      }
      const bounds = boundsRef.current;
      if (!bounds) return;
      const x = Math.min(bounds.width, Math.max(0, clientX - bounds.left));
      const y = Math.min(bounds.height, Math.max(0, clientY - bounds.top));
      mouseX.set(x);
      mouseY.set(y);
    },
    [isCinematic, mouseX, mouseY, updateBounds]
  );

  const onPointerLeave = useCallback(() => {
    if (!isCinematic) return;
    const bounds = boundsRef.current;
    if (!bounds) return;
    mouseX.set(bounds.width * 0.5);
    mouseY.set(bounds.height * 0.5);
  }, [isCinematic, mouseX, mouseY]);

  return (
    <div
      className={cn(
        "p-0.5 bg-transparent aspect-square flex items-center justify-center w-full h-full relative",
        className
      )}
    >
      <div
        ref={cardRef}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="group/card rounded-3xl w-full relative overflow-hidden bg-transparent flex items-center justify-center h-full"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
          mode={mode}
        />
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative h-44 w-44 rounded-full flex items-center justify-center text-textPrimary font-bold text-4xl">
            <div
              className={cn(
                "absolute w-full h-full bg-surface/80 dark:bg-bg/80 rounded-full",
                mode === "cinematic"
                  ? "blur-sm"
                  : mode === "reduced"
                  ? "blur-[1px]"
                  : "blur-0"
              )}
            />
            <span className="text-textPrimary z-20">{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export const CardPattern = memo(function CardPattern({
  mouseX,
  mouseY,
  randomString,
  mode,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  randomString: string;
  mode: "cinematic" | "reduced" | "performance";
}) {
  if (mode === "performance") {
    return null;
  }

  const maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style =
    mode === "cinematic"
      ? { maskImage, WebkitMaskImage: maskImage }
      : undefined;

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/70 to-accent/60 opacity-0 group-hover/card:opacity-100 transition duration-500",
          mode === "cinematic"
            ? "backdrop-blur-xl"
            : mode === "reduced"
            ? "backdrop-blur-md"
            : "backdrop-blur-0"
        )}
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
        style={style}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
});

EvervaultCard.displayName = "EvervaultCard";
CardPattern.displayName = "CardPattern";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateRandomString = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const Icon = ({ className, ...rest }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

