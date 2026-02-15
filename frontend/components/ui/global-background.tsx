"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type GlobalBackgroundProps = {
  children: ReactNode;
  className?: string;
  landingAuthImage?: string;
  appImage?: string;
};

export function GlobalBackground({
  children,
  className,
  landingAuthImage = "",
  appImage = "",
}: GlobalBackgroundProps) {
  const pathname = usePathname();
  const isLandingOrAuth =
    pathname === "/" || pathname === "/auth" || pathname.startsWith("/auth/");

  const activeImage = isLandingOrAuth ? landingAuthImage : appImage;
  const layerStyle = {
    "--route-bg-image": activeImage ? `url("${activeImage}")` : "none",
  } as CSSProperties;

  return (
    <div
      className={cn(
        "relative isolate min-h-screen",
        isLandingOrAuth ? "route-landing-auth" : "route-app",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className={cn(
            "background-image-layer absolute inset-0",
            isLandingOrAuth
              ? "background-image-layer-landing"
              : "background-image-layer-app"
          )}
          style={layerStyle}
        />
        <div
          className={cn(
            "dark-overlay-layer absolute inset-0",
            isLandingOrAuth
              ? "dark-overlay-layer-landing"
              : "dark-overlay-layer-app"
          )}
        />
        <div
          className={cn(
            "radial-spotlight-layer absolute inset-0",
            isLandingOrAuth
              ? "radial-spotlight-layer-landing"
              : "radial-spotlight-layer-app"
          )}
        />
      </div>
      <div className="content-layer relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
}
