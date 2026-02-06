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

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#E6A23C] flex items-center justify-center text-black font-bold">
            P
          </div>
          <span className="font-semibold tracking-wide">PREROLL</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm text-gray-300">
          <span>Features</span>
          <span>Workflow</span>
          <span>Pricing</span>
        </div>

        <div className="flex gap-4">
          <Link href="/auth" className="text-sm text-gray-300 hover:text-white">
            Log In
          </Link>
          <Link
            href="/auth"
            className="bg-[#E6A23C] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[#f0b44d]"
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
          plan, visualize, and collaborate — before the first frame is ever
          shot.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/auth"
            className="bg-[#E6A23C] text-black px-6 py-3 rounded-md font-medium hover:bg-[#f0b44d]"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="border border-gray-600 px-6 py-3 rounded-md text-gray-300 hover:text-white hover:border-gray-400"
          >
            Log In
          </Link>
        </div>
      </section>
    </main>
  );
}
