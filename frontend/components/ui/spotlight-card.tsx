"use client";

import React, { type ReactNode } from "react";
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
  const mode = usePerformanceMode();
  const isCinematic = mode === "cinematic";
  const isReduced = mode === "reduced";

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
      "--hue": "calc(var(--base) + (var(--pointer-xp, 0) * var(--spread, 0)))",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--pointer-x, 0) * 1px)
        calc(var(--pointer-y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize:
        "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: "scroll",
      border: "var(--border-size) solid var(--backup-border)",
      position: "relative",
      touchAction: isCinematic ? "none" : "pan-y",
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === "number" ? `${height}px` : height;
    }

    return baseStyles;
  };

  return (
    <div
      data-glow
      style={getInlineStyles()}
      className={`
          glow-card
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
      <div data-glow className="glow-card-inner" />
      {children}
    </div>
  );
};

export { GlowCard };
