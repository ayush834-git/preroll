import type { Metadata } from "next";
import { DM_Serif_Display, Manrope, Playfair_Display } from "next/font/google";
import { GlobalBackground } from "@/components/ui/global-background";
import { PageTransition } from "@/components/ui/page-transition";
import { PerformanceModeRoot } from "@/components/ui/performance-mode-root";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Preroll - Pre-production for Films",
  description: "Where films begin before the camera rolls. Plan, write, and generate with AI.",
};

const LANDING_AUTH_IMAGE = "/landing-bg.png";
const APP_IMAGE = "/cinematic-theater.png";
const DASHBOARD_RESULTS_IMAGE =
  "/Gemini_Generated_Image_61ccor61ccor61cc.png";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${dmSerif.variable} ${playfair.variable} antialiased`}
      >
        <PerformanceModeRoot />
        <GlobalBackground
          className="text-readable"
          landingAuthImage={LANDING_AUTH_IMAGE}
          appImage={APP_IMAGE}
          dashboardResultsImage={DASHBOARD_RESULTS_IMAGE}
        >
          <PageTransition>{children}</PageTransition>
        </GlobalBackground>
      </body>
    </html>
  );
}
