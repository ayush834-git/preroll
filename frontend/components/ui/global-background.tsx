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
        <div className="cinematic-bg-atmosphere absolute inset-0" />
        <div className="cinematic-bg-rim-light absolute inset-0" />
        <div className="cinematic-bg-depth absolute inset-0" />
        <div className="cinematic-bg-vignette absolute inset-0" />
        <div className="cinematic-bg-grain absolute inset-0" />
      </div>
      <div className="relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
}
