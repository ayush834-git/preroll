"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
  const imageStyle = {
    zIndex: -2,
  } as CSSProperties;
  const overlayStyle = {
    zIndex: -1,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "relative isolate min-h-screen",
        isLandingOrAuth ? "route-landing-auth" : "route-app",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="cinematic-route-image" style={imageStyle}>
          <Image
            src={activeImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </div>
        <div
          className={cn(
            "cinematic-route-overlay fixed inset-0",
            isLandingOrAuth
              ? "cinematic-route-overlay-landing"
              : "cinematic-route-overlay-app"
          )}
          style={overlayStyle}
        />
        <div
          className={cn(
            "cinematic-route-spotlight fixed inset-0",
            isLandingOrAuth
              ? "cinematic-route-spotlight-landing"
              : "cinematic-route-spotlight-app"
          )}
          style={overlayStyle}
        />
      </div>
      <div className="content-layer relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
}
