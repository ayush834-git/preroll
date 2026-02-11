"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAnimationBudget } from "@/lib/usePerformanceMode";

interface BeamsBackgroundProps {
  className?: string;
  children?: ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

const MINIMUM_BEAMS = 18;

function createBeam(
  width: number,
  height: number,
  settings: {
    speedScale: number;
    opacityScale: number;
    pulseScale: number;
    widthScale: number;
  }
): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: (90 + Math.random() * 140) * settings.widthScale,
    length: height * 2.5,
    angle,
    speed: (0.6 + Math.random() * 1.2) * settings.speedScale,
    opacity: (0.28 + Math.random() * 0.22) * settings.opacityScale,
    hue: 235 + Math.random() * 12,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: (0.02 + Math.random() * 0.03) * settings.pulseScale,
  };
}

export function BeamsBackground({
  className,
  intensity = "strong",
  children,
}: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const { mode, canAnimateContinuously } = useAnimationBudget();
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaHover = window.matchMedia("(hover: hover)");
    const mediaPointer = window.matchMedia("(pointer: fine)");

    const update = () => {
      const hasTouch =
        (navigator.maxTouchPoints ?? 0) > 0 || "ontouchstart" in window;
      const width = window.innerWidth;
      const laptopWidth = width <= 1800;
      setIsLaptop(!hasTouch && mediaHover.matches && mediaPointer.matches && laptopWidth);
    };

    update();
    window.addEventListener("resize", update);
    if (mediaHover.addEventListener) {
      mediaHover.addEventListener("change", update);
      mediaPointer.addEventListener("change", update);
    } else {
      mediaHover.addListener(update);
      mediaPointer.addListener(update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (mediaHover.removeEventListener) {
        mediaHover.removeEventListener("change", update);
        mediaPointer.removeEventListener("change", update);
      } else {
        mediaHover.removeListener(update);
        mediaPointer.removeListener(update);
      }
    };
  }, []);

  const shouldRenderBeams = mode === "cinematic" && isLaptop;
  const shouldAnimate = shouldRenderBeams && canAnimateContinuously;

  const opacityMap = useMemo(
    () => ({
      subtle: 1.1,
      medium: 1.35,
      strong: 1.8,
    }),
    []
  );

  useEffect(() => {
    if (!shouldRenderBeams) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context = ctx;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    const settings = {
      beamMultiplier: 1.5,
      speedScale: 1,
      opacityScale: 1,
      pulseScale: 1,
      widthScale: 1,
      blur: 14,
    };

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const totalBeams = Math.max(
        8,
        Math.round(MINIMUM_BEAMS * settings.beamMultiplier)
      );
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(viewportWidth, viewportHeight, settings)
      );

      if (!shouldAnimate) {
        drawStatic();
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      const column = index % 3;
      const spacing = viewportWidth / 3;

      beam.y = viewportHeight + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = (160 + Math.random() * 160) * settings.widthScale;
      beam.speed = (0.5 + Math.random() * 0.4) * settings.speedScale;
      beam.hue = 235 + (index * 12) / totalBeams;
      beam.opacity = (0.34 + Math.random() * 0.16) * settings.opacityScale;
      return beam;
    }

    function drawBeam(context: CanvasRenderingContext2D, beam: Beam) {
      context.save();
      context.translate(beam.x, beam.y);
      context.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity];

      const gradient = context.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 70%, 65%, 0)`);
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, 70%, 65%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(
        0.4,
        `hsla(${beam.hue}, 70%, 65%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.6,
        `hsla(${beam.hue}, 70%, 65%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, 70%, 65%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 70%, 65%, 0)`);

      context.fillStyle = gradient;
      context.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      context.restore();
    }

    function drawStatic() {
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      context.filter = settings.blur ? `blur(${settings.blur}px)` : "none";
      beamsRef.current.forEach((beam) => drawBeam(context, beam));
    }

    function animate() {
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      context.filter = settings.blur ? `blur(${settings.blur}px)` : "none";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(context, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    if (shouldAnimate) {
      animate();
    } else {
      drawStatic();
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity, opacityMap, shouldAnimate, shouldRenderBeams]);

  return (
    <div className={cn("relative min-h-screen w-full", className)}>
      {shouldRenderBeams && (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ opacity: 0.9 }}
          />
        </div>
      )}

      {children ? (
        <div className="relative z-10 min-h-screen w-full">{children}</div>
      ) : (
        <div className="relative z-10 flex min-h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tighter">
              Beams
              <br />
              Background
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl text-white/70 tracking-tighter">
              For your pleasure
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
