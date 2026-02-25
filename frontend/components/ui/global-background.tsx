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
  dashboardResultsImage?: string;
};

export function GlobalBackground({
  children,
  className,
  landingAuthImage = "",
  appImage = "",
  dashboardResultsImage = "",
}: GlobalBackgroundProps) {
  const pathname = usePathname();
  const isLandingOrAuth =
    pathname === "/" || pathname === "/auth" || pathname.startsWith("/auth/");
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isResultsRoute =
    /^\/projects\/[^/]+/.test(pathname);
  const useDashboardResultsBackground = isDashboardRoute || isResultsRoute;

  const activeImage = isLandingOrAuth
    ? landingAuthImage
    : useDashboardResultsBackground && dashboardResultsImage
    ? dashboardResultsImage
    : appImage;
  const shouldPrioritizeImage = isLandingOrAuth;
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
            priority={shouldPrioritizeImage}
            loading={shouldPrioritizeImage ? "eager" : "lazy"}
            decoding="async"
            sizes="100vw"
            className="h-full w-full object-cover object-center"
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
