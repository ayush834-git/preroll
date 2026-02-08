"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  blue: { base: 238, spread: 40 },
  purple: { base: 238, spread: 40 },
  green: { base: 238, spread: 40 },
  red: { base: 238, spread: 40 },
  orange: { base: 238, spread: 40 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mode = usePerformanceMode();
  const isCinematic = mode === "cinematic";
  const isReduced = mode === "reduced";

  useEffect(() => {
    if (!isCinematic) return;
    let rafId = 0;
    let latestX = 0;
    let latestY = 0;

    const syncPointer = (e: PointerEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.setProperty("--x", latestX.toFixed(2));
          cardRef.current.style.setProperty(
            "--xp",
            (latestX / window.innerWidth).toFixed(2)
          );
          cardRef.current.style.setProperty("--y", latestY.toFixed(2));
          cardRef.current.style.setProperty(
            "--yp",
            (latestY / window.innerHeight).toFixed(2)
          );
        }
        rafId = 0;
      });
    };

    document.addEventListener("pointermove", syncPointer);
    return () => {
      document.removeEventListener("pointermove", syncPointer);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isCinematic]);

  const { base, spread } = glowColorMap[glowColor];

  const getSizeClasses = () => {
    if (customSize) {
      return "";
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: React.CSSProperties & Record<string, string | number> = {
      "--base": base,
      "--spread": spread,
      "--radius": "14",
      "--border": isCinematic ? "3" : "2",
      "--backdrop": "hsl(240 12% 16% / 0.6)",
      "--backup-border": "var(--backdrop)",
      "--size": "200",
      "--outer": isCinematic ? "1" : isReduced ? "0.75" : "0",
      "--bg-spot-opacity": isCinematic ? "0.1" : isReduced ? "0.06" : "0",
      "--border-spot-opacity": isCinematic ? "1" : isReduced ? "0.6" : "0",
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize:
        "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: isCinematic ? "fixed" : "scroll",
      border: "var(--border-size) solid var(--backup-border)",
      position: "relative",
      touchAction: "none",
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === "number" ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? "aspect-[3/4]" : ""}
          rounded-2xl 
          relative 
          grid 
          grid-rows-[1fr_auto] 
          ${isCinematic ? "shadow-[0_1rem_2rem_-1rem_black]" : isReduced ? "shadow-[0_0.6rem_1.2rem_-0.8rem_black]" : "shadow-[0_0.3rem_0.6rem_-0.6rem_black]"} 
          p-4 
          gap-4 
          ${isCinematic ? "backdrop-blur-[5px]" : isReduced ? "backdrop-blur-[2px]" : "backdrop-blur-0"}
          ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard };
