"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { usePerformanceMode } from "@/lib/usePerformanceMode";

type CinematicUniforms = {
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uScroll: { value: number };
  uMotion: { value: number };
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uScroll;
  uniform float uMotion;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv * 2.0 - 1.0;
    centered.x *= uResolution.x / max(1.0, uResolution.y);

    float t = uTime * (0.045 * uMotion);
    float scrollShift = uScroll * 0.22;

    float fogA = fbm(centered * 1.15 + vec2(t * 0.34, -t * 0.18 + scrollShift));
    float fogB = fbm(centered * 2.25 + vec2(-t * 0.16, t * 0.22));
    float fogC = fbm(centered * 0.8 + vec2(t * 0.08, t * 0.05));

    float distortion = (fogA - 0.5) * 0.055 + (fogB - 0.5) * 0.03;
    vec2 warped = centered + vec2(distortion * 0.75, distortion * 0.28);

    float radial = length(warped);
    float sideLift = smoothstep(0.95, 0.12, abs(warped.x) * 0.9 + warped.y * 0.18 + 0.24);

    vec3 espresso = vec3(0.05, 0.032, 0.022);
    vec3 walnut = vec3(0.11, 0.072, 0.046);
    vec3 cocoa = vec3(0.19, 0.128, 0.082);
    vec3 caramel = vec3(0.38, 0.255, 0.16);
    vec3 olive = vec3(0.145, 0.16, 0.102);

    vec3 color = mix(espresso, walnut, smoothstep(-0.88, 0.78, warped.y));
    color = mix(color, cocoa, fogA * 0.42);
    color += caramel * sideLift * 0.14;
    color += olive * fogC * 0.06;

    float centerLift = smoothstep(1.16, 0.36, radial);
    color += vec3(0.08, 0.052, 0.034) * centerLift * 0.24;

    float opticalDiffusion = (fogB - 0.5) * 0.045;
    color += vec3(opticalDiffusion * 0.62, opticalDiffusion * 0.44, opticalDiffusion * 0.28);

    float vignette = smoothstep(1.22, 0.44, radial);
    color *= mix(0.63, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const diffusionFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uStrength;

  void main() {
    vec2 texel = 1.0 / max(uResolution, vec2(1.0));
    vec3 base = texture2D(tDiffuse, vUv).rgb;
    vec3 blur = vec3(0.0);

    blur += texture2D(tDiffuse, vUv + vec2(texel.x * 1.2, 0.0)).rgb;
    blur += texture2D(tDiffuse, vUv - vec2(texel.x * 1.2, 0.0)).rgb;
    blur += texture2D(tDiffuse, vUv + vec2(0.0, texel.y * 1.2)).rgb;
    blur += texture2D(tDiffuse, vUv - vec2(0.0, texel.y * 1.2)).rgb;
    blur *= 0.25;

    vec3 mixed = mix(base, blur, uStrength);
    gl_FragColor = vec4(mixed, 1.0);
  }
`;

const refractionFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform float uAmount;
  uniform float uTime;

  void main() {
    vec2 center = vUv - 0.5;
    float radius = length(center);
    vec2 warp = center * radius * uAmount;
    vec2 uv = vUv + warp;

    float ripple = sin((vUv.y + uTime * 0.04) * 14.0) * 0.00045;
    float r = texture2D(tDiffuse, uv + vec2(ripple, 0.0)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - vec2(ripple, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export function CinematicWebglBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mode = usePerformanceMode();
  const isPerformance = mode === "performance";

  useEffect(() => {
    if (isPerformance || !containerRef.current) return;

    const container = containerRef.current;
    const root = document.documentElement;
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });

    renderer.setClearColor(0x110b08, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.classList.add("cinematic-webgl-canvas");
    container.appendChild(renderer.domElement);

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms: CinematicUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uScroll: { value: 0 },
      uMotion: { value: mode === "cinematic" ? 1 : 0.38 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const diffusionPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uStrength: { value: mode === "cinematic" ? 0.2 : 0.12 },
        },
        vertexShader,
        fragmentShader: diffusionFragmentShader,
      })
    );
    const refractionPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          uAmount: { value: mode === "cinematic" ? 0.018 : 0.01 },
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader: refractionFragmentShader,
      })
    );
    composer.addPass(renderPass);
    composer.addPass(diffusionPass);
    composer.addPass(refractionPass);

    const setSize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const deviceRatio = window.devicePixelRatio || 1;
      // Cap pixel ratio so the background stays premium but does not steal GPU budget.
      const cappedRatio = mode === "cinematic" ? Math.min(deviceRatio, 1.35) : 1;

      renderer.setPixelRatio(cappedRatio);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(cappedRatio);
      composer.setSize(width, height);
      uniforms.uResolution.value.set(
        width * cappedRatio,
        height * cappedRatio
      );
      const diffusionUniforms = diffusionPass.material.uniforms as {
        uResolution: { value: THREE.Vector2 };
      };
      diffusionUniforms.uResolution.value.set(
        width * cappedRatio,
        height * cappedRatio
      );
    };

    setSize();

    let frameId = 0;
    let lastTime = 0;
    // Keep ambient motion intentionally restrained to preserve interaction smoothness.
    const fps = mode === "cinematic" ? 30 : 18;
    const frameStep = 1000 / fps;

    const render = (time: number) => {
      frameId = requestAnimationFrame(render);

      if (time - lastTime < frameStep) return;
      const deltaMs = lastTime === 0 ? frameStep : time - lastTime;
      lastTime = time;

      // Consume the app-wide normalized scroll value so all motion follows one timeline.
      const scrollValue = parseFloat(
        root.style.getPropertyValue("--scroll-progress-smooth")
      );
      const targetScroll = Number.isFinite(scrollValue) ? scrollValue : 0;
      uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.09;
      uniforms.uTime.value += deltaMs * 0.001;
      const refractionUniforms = refractionPass.material.uniforms as {
        uTime: { value: number };
      };
      refractionUniforms.uTime.value = uniforms.uTime.value;

      composer.render();
    };

    frameId = requestAnimationFrame(render);
    window.addEventListener("resize", setSize, { passive: true });

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(frameId);
      scene.remove(quad);
      geometry.dispose();
      material.dispose();
      diffusionPass.material.dispose();
      refractionPass.material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPerformance, mode]);

  if (isPerformance) return null;

  return <div className="cinematic-bg-webgl" ref={containerRef} />;
}
