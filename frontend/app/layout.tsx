import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import { BeamsBackground } from "@/components/ui/beams-background";
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

export const metadata: Metadata = {
  title: "Preroll - Pre-production for Films",
  description: "Where films begin before the camera rolls. Plan, write, and generate with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${dmSerif.variable} antialiased`}
      >
        <BeamsBackground className="text-white">
          {children}
        </BeamsBackground>
      </body>
    </html>
  );
}
