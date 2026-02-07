"use client";

import Link from "next/link";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <AnimatedShaderBackground />
      </div>

      {/* Navbar - glass */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-10 py-5 glass-panel">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#E6A23C] flex items-center justify-center text-black font-bold shadow-lg shadow-[#E6A23C]/20">
            P
          </div>
          <span className="font-semibold tracking-wide text-white">PREROLL</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm text-white/60">
          <span>Features</span>
          <span>Workflow</span>
          <span>Pricing</span>
        </div>

        <div className="flex gap-3">
          <Link
            href="/auth"
            className="text-sm text-white/80 hover:text-white px-4 py-2 rounded-lg glass-outline transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/dashboard"
            className="bg-[#E6A23C] text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f0b44d] transition-colors shadow-lg shadow-[#E6A23C]/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-10 pt-28 max-w-4xl">
        <p className="text-xs tracking-widest text-[#E6A23C] mb-4">
          PRE-PRODUCTION PLATFORM
        </p>

        <h1 className="text-5xl md:text-6xl font-light leading-tight">
          Where Films Begin <br />
          <span className="text-[#E6A23C]">Before the Camera Rolls</span>
        </h1>

        <p className="mt-6 text-gray-300 max-w-xl">
          A digital workspace for directors, writers, and production teams to
          plan, visualize, and collaborate -- before the first frame is ever
          shot.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/dashboard"
            className="bg-[#E6A23C] text-black px-6 py-3.5 rounded-xl font-medium hover:bg-[#f0b44d] transition-all shadow-lg shadow-[#E6A23C]/25 hover:shadow-[#E6A23C]/40"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="glass-outline text-white/90 px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 hover:border-white/20 transition-all"
          >
            Log In
          </Link>
        </div>
      </section>
    </main>
  );
}
