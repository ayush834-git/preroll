"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAnimationBudget } from "@/lib/usePerformanceMode";

interface AnimatedGradientBackgroundProps {
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
    angle: angle,
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
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const MINIMUM_BEAMS = 20;
  const { mode, canAnimateContinuously } = useAnimationBudget();

  const opacityMap = {
    subtle: 1.1,
    medium: 1.35,
    strong: 1.8,
  };

  useEffect(() => {
    if (mode === "performance") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    const settings =
      mode === "cinematic"
        ? {
            beamMultiplier: 1.5,
            speedScale: 1,
            opacityScale: 1,
            pulseScale: 1,
            widthScale: 1,
            blur: 14,
          }
        : mode === "reduced"
        ? {
            beamMultiplier: 1,
            speedScale: 0.5,
            opacityScale: 0.65,
            pulseScale: 0.6,
            widthScale: 0.85,
            blur: 8,
          }
        : {
            beamMultiplier: 0.6,
            speedScale: 0,
            opacityScale: 0.45,
            pulseScale: 0,
            widthScale: 0.8,
            blur: 0,
          };

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const totalBeams = Math.max(
        8,
        Math.round(MINIMUM_BEAMS * settings.beamMultiplier)
      );
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(viewportWidth, viewportHeight, settings)
      );

      if (mode !== "cinematic") {
        drawStatic();
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;

      const column = index % 3;
      const spacing = viewportWidth / 3;

      beam.y = viewportHeight + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width =
        (160 + Math.random() * 160) * settings.widthScale;
      beam.speed =
        (0.5 + Math.random() * 0.4) * settings.speedScale;
      beam.hue = 235 + (index * 12) / totalBeams;
      beam.opacity =
        (0.34 + Math.random() * 0.16) * settings.opacityScale;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

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

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function drawStatic() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.filter = settings.blur ? `blur(${settings.blur}px)` : "none";

      beamsRef.current.forEach((beam) => {
        drawBeam(ctx, beam);
      });
    }

    let lastFrame = 0;
    const frameInterval = mode === "cinematic" ? 0 : 1000 / 45;

    function animate(timestamp = 0) {
      if (!canvas || !ctx) return;

      if (frameInterval > 0 && timestamp - lastFrame < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrame = timestamp;

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.filter = settings.blur ? `blur(${settings.blur}px)` : "none";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    if (mode === "cinematic" && canAnimateContinuously) {
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
  }, [intensity, mode, canAnimateContinuously]);

  return (
    <div className={cn("relative min-h-screen w-full", className)}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
        <AnimatedShaderBackground
          className={cn(
            "absolute inset-0 z-0",
            mode === "cinematic"
              ? "opacity-70"
              : mode === "reduced"
              ? "opacity-55"
              : "opacity-45"
          )}
        />

        {mode !== "performance" && (
          <>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full z-10"
              style={{
                filter:
                  mode === "cinematic"
                    ? "blur(4px)"
                    : mode === "reduced"
                    ? "blur(2px)"
                    : "none",
                opacity:
                  mode === "cinematic"
                    ? 0.95
                    : mode === "reduced"
                    ? 0.7
                    : 0.45,
              }}
            />
            <div className="absolute inset-0 z-20 beams-overlay" />
          </>
        )}
      </div>

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
