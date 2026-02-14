"use client";

import Link from "next/link";
import {
  Camera,
  ChevronDown,
  DollarSign,
  ListChecks,
  Mic,
  Shield,
  Star,
  Timer,
} from "lucide-react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    title: "Scene Breakdown Reports",
    body: "Assistant Director-style breakdowns with objectives, locations, props, beats, and coverage needs.",
    icon: <ListChecks className="h-5 w-5 text-primary" />,
  },
  {
    title: "Sound Design Sheets",
    body: "Ambient beds, diegetic cues, transitions, and mixing notes crafted per scene.",
    icon: <Mic className="h-5 w-5 text-primary" />,
  },
  {
    title: "Budget Plan Line Items",
    body: "Cast, crew, locations, gear, VFX, marketing, and post with cost ranges and savings.",
    icon: <DollarSign className="h-5 w-5 text-primary" />,
  },
  {
    title: "Visual Direction",
    body: "Cinematography and production design guidance for lighting, palette, and framing.",
    icon: <Camera className="h-5 w-5 text-primary" />,
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

const spotlightStats = [
  {
    label: "Generation Modes",
    value: "Scene / Sound / Budget / Notes",
    glow: "caramel",
  },
  {
    label: "Production Reports",
    value: "Polished, shareable outputs",
    glow: "copper",
  },
  {
    label: "Constraint-driven generation",
    value: "Craft-first cinematic planning",
    glow: "olive",
  },
] as const;

export default function LandingPage() {
  const getStartedHref = "/dashboard";

  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      <nav className="relative z-10 mx-4 mt-4 md:mx-8 md:mt-6 rounded-2xl border border-white/10 px-4 py-4 md:px-6 glass-nav animate-glass-in">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/95 flex items-center justify-center text-bg font-bold shadow-glow">
              P
            </div>
            <span className="font-semibold tracking-[0.18em] text-white/90">
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
              href="/auth/login"
              className="glass-button text-white/90 px-4 py-2 rounded-lg transition-colors btn-animated btn-sky btn-ghost"
            >
              Log In
            </Link>
            <Link
              href={getStartedHref}
              className="glass-button glass-button-primary text-white px-5 py-2.5 rounded-lg transition-colors shadow-glow glow-amber btn-animated btn-amber btn-cta"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <Reveal>
        <section className="relative z-10 px-6 md:px-10 pt-16 md:pt-20 pb-14">
          <div className="mx-auto max-w-6xl">
            {/* Keep one dominant hero shell so the interface reads as handcrafted glass, not scattered cards. */}
            <div className="glass-hero rounded-[32px] p-7 md:p-12">
              <div>
                <div>
                  <p className="text-xs tracking-[0.35em] text-primary mb-5">
                PRE-PRODUCTION PLATFORM
              </p>

                  <h1 className="font-hero-italic text-4xl md:text-6xl leading-tight text-[color:var(--text-primary)]">
                    Where Films Begin <br />
                    <span className="text-primary">Before the Camera Rolls</span>
                  </h1>

                  <p className="mt-6 text-[color:var(--text-secondary)] max-w-xl text-lg">
                    A cinematic workspace for directors, writers, and production
                    teams to shape scripts, plan shots, and align vision before
                    the first frame is captured.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link
                      href={getStartedHref}
                      className="glass-button glass-button-primary text-white px-6 py-3.5 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/auth/login"
                      className="glass-button glass-button-secondary text-white/90 px-6 py-3.5 rounded-xl transition-all btn-animated btn-sky btn-ghost inline-flex items-center gap-2"
                    >
                      Log In
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

                  <div className="mt-12 flex flex-wrap items-center gap-5 text-sm text-white/50">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span>Trusted by indie studios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <span>Cut prep time by 40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-6xl grid gap-6 md:grid-cols-3">
            {spotlightStats.map((item) => (
              <GlowCard
                key={item.label}
                customSize
                glowColor={item.glow}
                className="w-full min-h-[160px] p-6 glass-card-rich"
              >
                <div className="flex h-full flex-col justify-between">
                  <p className="text-white/65 text-sm">{item.label}</p>
                  <p className="font-display text-3xl text-primary leading-tight">
                    {item.value}
                  </p>
                </div>
              </GlowCard>
            ))}
          </div>

          <div className="mt-14 flex items-center gap-2 text-white/50">
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.25em]">Scroll</span>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section
          id="features"
          className="relative z-10 px-6 md:px-10 py-16 max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-primary mb-3">
              FEATURES
            </p>
            <h2 className="font-hero-italic text-4xl md:text-5xl">
              Everything Before Action
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">
              Professional tools designed for the crucial planning phase that
              defines every great film.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((item) => (
              <GlowCard
                key={item.title}
                customSize
                glowColor="copper"
                className="w-full p-6 glass-card-rich"
              >
                <div className="h-12 w-12 rounded-xl glass-outline flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="text-white/60 mt-3">{item.body}</p>
              </GlowCard>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section
          id="workflow"
          className="relative z-10 px-6 md:px-10 py-16 max-w-6xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] text-primary mb-3">
                WORKFLOW
              </p>
              <h2 className="font-hero-italic text-4xl md:text-5xl">
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
              <GlowCard
                key={item.step}
                customSize
                glowColor="olive"
                className="w-full p-6 glass-card-rich"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full glass-outline flex items-center justify-center text-primary font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{item.title}</h3>
                      <p className="text-white/60 mt-2">{item.body}</p>
                    </div>
                  </div>
                  <div className="md:ml-auto hidden md:flex items-center gap-3 text-white/50">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">
                      Secure
                    </span>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section
          id="pricing"
          className="relative z-10 px-6 md:px-10 py-16 max-w-6xl mx-auto"
        >
          <div className="glass-panel rounded-3xl p-10 md:p-12 text-center">
            <p className="text-xs tracking-[0.3em] text-primary mb-3">
              START CREATING
            </p>
            <h2 className="font-hero-italic text-4xl md:text-5xl">
              Ready to Begin Your Pre-Production Journey?
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Join filmmakers who plan their vision with precision before the
              cameras roll.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={getStartedHref}
                className="glass-button glass-button-primary text-white px-7 py-3.5 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="glass-button glass-button-secondary text-white/90 px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all btn-animated btn-sky btn-ghost"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
