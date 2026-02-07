"use client";

import Link from "next/link";
import {
  Brain,
  ChevronDown,
  Infinity,
  Play,
  Rocket,
  Shield,
  Star,
  Timer,
} from "lucide-react";
import { BeamsBackground } from "@/components/ui/beams-background";

const features = [
  {
    title: "Script Breakdown",
    body: "Analyze scripts, tag elements, and organize production requirements automatically.",
    icon: <Brain className="h-5 w-5 text-[#E6A23C]" />,
  },
  {
    title: "Storyboarding",
    body: "Visualize every scene with intuitive storyboards and shot planning.",
    icon: <Play className="h-5 w-5 text-[#E6A23C]" />,
  },
  {
    title: "Team Collaboration",
    body: "Real-time collaboration for directors, DPs, and production designers.",
    icon: <Infinity className="h-5 w-5 text-[#E6A23C]" />,
  },
  {
    title: "Mood Boards",
    body: "Collect references, define visual tone, and share creative vision.",
    icon: <Rocket className="h-5 w-5 text-[#E6A23C]" />,
  },
];

const workflow = [
  {
    step: "01",
    title: "Ideate & Outline",
    body: "Capture concepts, themes, and structure with AI-assisted prompts.",
  },
  {
    step: "02",
    title: "Breakdown & Schedule",
    body: "Tag props, cast, and locations; generate production-ready documents.",
  },
  {
    step: "03",
    title: "Visualize",
    body: "Create boards, lighting diagrams, and camera setups for every scene.",
  },
  {
    step: "04",
    title: "Collaborate & Refine",
    body: "Share with your team, gather feedback, and iterate until ready.",
  },
];

export default function LandingPage() {
  return (
    <BeamsBackground className="text-white">
      <main className="relative min-h-screen text-white overflow-hidden">
        <div className="absolute inset-0 z-0 grain-overlay" />
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#E6A23C]/15 blur-[120px]" />

        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 glass-panel">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#E6A23C] flex items-center justify-center text-black font-bold shadow-lg shadow-[#E6A23C]/20">
              P
            </div>
            <span className="font-semibold tracking-wide text-white">
              PREROLL
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
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
              className="bg-[#E6A23C] text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f0b44d] transition-colors shadow-lg shadow-[#E6A23C]/20 glow-amber"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <section className="relative z-10 px-6 md:px-10 pt-24 pb-16">
          <div className="mx-auto max-w-5xl">
            <div>
              <p className="text-xs tracking-[0.35em] text-[#E6A23C] mb-5">
                PRE-PRODUCTION PLATFORM
              </p>

              <h1 className="font-display text-5xl md:text-6xl leading-tight">
                Where Films Begin <br />
                <span className="text-[#E6A23C]">
                  Before the Camera Rolls
                </span>
              </h1>

              <p className="mt-6 text-white/70 max-w-xl text-lg">
                A cinematic workspace for directors, writers, and production
                teams to shape scripts, plan shots, and align vision before the
                first frame is captured.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="bg-[#E6A23C] text-black px-6 py-3.5 rounded-xl font-medium hover:bg-[#f0b44d] transition-all shadow-lg shadow-[#E6A23C]/25"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth"
                  className="glass-outline text-white/90 px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  Request Demo
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="glass-pill px-3 py-1 rounded-full">
                  Live previews
                </span>
                <span className="glass-pill px-3 py-1 rounded-full">
                  AI workflows
                </span>
                <span className="glass-pill px-3 py-1 rounded-full">
                  Team ready
                </span>
                <span className="glass-pill px-3 py-1 rounded-full">
                  Secure by design
                </span>
              </div>

              <div className="mt-12 flex items-center gap-5 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#E6A23C]" />
                  <span>Trusted by indie studios</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#E6A23C]" />
                  <span>Cut prep time by 40%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-6xl grid gap-6 md:grid-cols-3">
            {[
              { label: "Projects launched", value: "120+" },
              { label: "Prep hours saved", value: "2,300+" },
              { label: "Departments aligned", value: "8 teams" },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-panel rounded-2xl p-6 flex items-center justify-between"
              >
                <p className="text-white/60 text-sm">{item.label}</p>
                <p className="font-display text-3xl text-[#E6A23C]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex items-center gap-2 text-white/50">
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.25em]">Scroll</span>
          </div>
        </section>

        <section
          id="features"
          className="relative z-10 px-6 md:px-10 py-16 max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-[#E6A23C] mb-3">
              FEATURES
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Everything Before Action
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Professional tools designed for the crucial planning phase that
              defines every great film.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((item) => (
              <div
                key={item.title}
                className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl glass-outline flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="text-white/60 mt-3">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="relative z-10 px-6 md:px-10 py-16 max-w-6xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#E6A23C] mb-3">
                WORKFLOW
              </p>
              <h2 className="font-display text-4xl md:text-5xl">
                Plan Every Shot
              </h2>
            </div>
            <p className="text-white/60 max-w-xl">
              From concept to shot list, Preroll keeps every department aligned
              with a single cinematic source of truth.
            </p>
          </div>

          <div className="grid gap-6">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full glass-outline flex items-center justify-center text-[#E6A23C] font-semibold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{item.title}</h3>
                    <p className="text-white/60 mt-2">{item.body}</p>
                  </div>
                </div>
                <div className="ml-auto hidden md:flex items-center gap-3 text-white/50">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.2em]">
                    Secure
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="relative z-10 px-6 md:px-10 py-16 max-w-6xl mx-auto"
        >
          <div className="glass-panel rounded-3xl p-10 md:p-12 text-center">
            <p className="text-xs tracking-[0.3em] text-[#E6A23C] mb-3">
              START CREATING
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Ready to Begin Your Pre-Production Journey?
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Join filmmakers who plan their vision with precision before the
              cameras roll.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-[#E6A23C] text-black px-7 py-3.5 rounded-xl font-medium hover:bg-[#f0b44d] transition-all shadow-lg shadow-[#E6A23C]/25"
              >
                Get Started
              </Link>
              <Link
                href="/auth"
                className="glass-outline text-white/90 px-7 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-all"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </BeamsBackground>
  );
}
