"use client";

import React, { type ReactNode } from "react";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "amber" | "copper" | "olive" | "red" | "caramel";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  amber: { base: 34, spread: 10 },
  copper: { base: 22, spread: 8 },
  olive: { base: 84, spread: 8 },
  red: { base: 14, spread: 9 },
  caramel: { base: 30, spread: 11 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "copper",
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
      "--backdrop": "hsl(26 28% 14% / 0.58)",
      "--backup-border": "var(--backdrop)",
      "--size": "200",
      "--outer": isCinematic ? "1" : isReduced ? "0.75" : "0",
      "--bg-spot-opacity": isCinematic ? "0.08" : isReduced ? "0.05" : "0",
      "--border-spot-opacity": isCinematic ? "1" : isReduced ? "0.6" : "0",
      "--saturation": isCinematic ? "58" : "46",
      "--lightness": isCinematic ? "62" : "56",
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue":
        "calc(var(--base) + (var(--pointer-xp-smooth, 0) * var(--spread, 0)))",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--pointer-x-smooth, 0) * 1px)
        calc(var(--pointer-y-smooth, 0) * 1px),
        hsl(var(--hue, 26) calc(var(--saturation, 58) * 1%) calc(var(--lightness, 62) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
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
