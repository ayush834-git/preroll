import type { Metadata } from "next";
import { DM_Serif_Display, Manrope, Playfair_Display } from "next/font/google";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
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

const CINEMATIC_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);
const MIN_CINEMATIC_IMAGE_BYTES = 120 * 1024;
const STATIC_ASSET_NAME_PATTERN =
  /(?:favicon|icon|logo|apple-touch|mstile|browserconfig|manifest)/i;

type CinematicImage = {
  url: string;
  addedAtMs: number;
};

async function findCinematicImages(
  publicDir: string,
  currentDir: string = publicDir
): Promise<CinematicImage[]> {
  try {
    const entries = await readdir(currentDir, { withFileTypes: true });
    const candidates = await Promise.all(
      entries.map(async (entry) => {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        return findCinematicImages(publicDir, absolutePath);
      }
      if (!entry.isFile()) {
        return [];
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!CINEMATIC_IMAGE_EXTENSIONS.has(extension)) {
        return [];
      }
      if (STATIC_ASSET_NAME_PATTERN.test(entry.name)) {
        return [];
      }

      const fileStats = await stat(absolutePath);
      if (fileStats.size < MIN_CINEMATIC_IMAGE_BYTES) {
        return [];
      }

      const relativePath = path
        .relative(publicDir, absolutePath)
        .split(path.sep)
        .join("/");

      const addedAtMs = Math.max(fileStats.birthtimeMs, fileStats.mtimeMs);

      return [{ url: encodeURI(`/${relativePath}`), addedAtMs }];
      })
    );

    return candidates.flat();
  } catch {
    return [];
  }
}

async function resolveCinematicBackgrounds() {
  const cwd = process.cwd();
  const candidatePublicDirs = [
    path.join(cwd, "public"),
    path.join(cwd, "..", "public"),
    path.join(cwd, "frontend", "public"),
  ];

  const scanned = await Promise.all(
    candidatePublicDirs.map(async (publicDir) => {
      const images = await findCinematicImages(publicDir);
      return images;
    })
  );

  const candidates = scanned
    .flat()
    .filter((item, index, source) => source.findIndex((other) => other.url === item.url) === index);

  const sorted = candidates.sort((a, b) => b.addedAtMs - a.addedAtMs);
  // Use chronological order within the two most recently added files:
  // IMAGE 1 = earlier file, IMAGE 2 = later file.
  const latestTwo = sorted.slice(0, 2);
  const orderedByTime = [...latestTwo].sort((a, b) => a.addedAtMs - b.addedAtMs);
  const imageOne = orderedByTime[0]?.url ?? "";
  const imageTwo = orderedByTime[1]?.url ?? imageOne;

  return { imageOne, imageTwo };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { imageOne, imageTwo } = await resolveCinematicBackgrounds();

  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${dmSerif.variable} ${playfair.variable} antialiased`}
      >
        <PerformanceModeRoot />
        <GlobalBackground
          className="text-readable"
          landingAuthImage={imageOne}
          appImage={imageTwo}
        >
          <PageTransition>{children}</PageTransition>
        </GlobalBackground>
      </body>
    </html>
  );
}
