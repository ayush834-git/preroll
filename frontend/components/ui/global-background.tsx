import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlobalBackgroundProps = {
  children: ReactNode;
  className?: string;
};

export function GlobalBackground({ children, className }: GlobalBackgroundProps) {
  return (
    <div className={cn("relative isolate min-h-screen text-white", className)}>
      {/* Single global background stack keeps visual tone consistent across routes. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="cinematic-bg-base absolute inset-0" />
        <div className="cinematic-bg-light cinematic-bg-light-top absolute inset-0" />
        <div className="cinematic-bg-light cinematic-bg-light-side absolute inset-0" />
        <div className="studio-set absolute inset-0">
          <div className="studio-floor-haze" />

          <div className="studio-rig studio-rig-left" />
          <div className="studio-rig studio-rig-right" />
          <div className="studio-c-stand studio-c-stand-left" />
          <div className="studio-c-stand studio-c-stand-right" />
          <div className="studio-reel-stack studio-reel-stack-left" />
          <div className="studio-reel-stack studio-reel-stack-right" />

          <div className="studio-camera">
            <div className="studio-camera-reel studio-camera-reel-left" />
            <div className="studio-camera-reel studio-camera-reel-right" />
            <div className="studio-camera-body" />
            <div className="studio-camera-lens" />
            <div className="studio-camera-tripod" />
          </div>

          <div className="studio-light-beam studio-light-beam-left" />
          <div className="studio-light-beam studio-light-beam-right" />
        </div>
        <div className="cinematic-bg-vignette absolute inset-0" />
        <div className="cinematic-bg-grain absolute inset-0" />
      </div>
      <div className="relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
}
