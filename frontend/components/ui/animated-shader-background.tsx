"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { useAnimationBudget } from "@/lib/usePerformanceMode";

export default function AnimatedShaderBackground({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { mode, canAnimateContinuously } = useAnimationBudget();
  const isPerformance = mode === "performance";
  const isReduced = mode === "reduced";
  const shouldAnimate = mode === "cinematic" && canAnimateContinuously;

  useEffect(() => {
    if (isPerformance) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
            u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          for (float i = 0.0; i < 35.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5
              + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
            vec4 auroraColors = vec4(
              0.35 + 0.25 * sin(i * 0.2 + iTime * 0.4),
              0.25 + 0.2 * cos(i * 0.3 + iTime * 0.5),
              0.75 + 0.2 * sin(i * 0.4 + iTime * 0.3),
              1.0
            );
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.8))
              / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
            o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
          }

          o = tanh(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
      `,
      transparent: true,
    });

    const resizeToContainer = () => {
      if (!renderer) return;
      const rect = container.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      renderer.setSize(width, height);
      material.uniforms.iResolution.value.set(width, height);
    };

    resizeToContainer();
    const deviceRatio = window.devicePixelRatio || 1;
    renderer.setPixelRatio(
      isReduced ? 1 : deviceRatio
    );
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number | undefined;
    const renderFrame = (timeValue: number) => {
      if (!renderer) return;
      material.uniforms.iTime.value = timeValue;
      renderer.render(scene, camera);
    };

    if (isReduced || !shouldAnimate) {
      renderFrame(0.8);
    } else {
      const animate = () => {
        if (!renderer) return;
        material.uniforms.iTime.value += 0.016;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();
    }

    window.addEventListener("resize", resizeToContainer);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", resizeToContainer);
      if (renderer) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
    };
  }, [isPerformance, isReduced, shouldAnimate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none",
        mode === "cinematic"
          ? "opacity-70"
          : mode === "reduced"
          ? "opacity-50"
          : "opacity-40",
        className
      )}
      style={
        isPerformance
          ? {
              background:
                "radial-gradient(120% 120% at 50% 15%, rgba(100,120,255,0.35), transparent 60%), radial-gradient(120% 120% at 50% 85%, rgba(90,160,255,0.25), transparent 60%)",
            }
          : undefined
      }
    />
  );
}
