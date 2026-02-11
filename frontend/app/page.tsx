"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bluetooth,
  Gauge,
  Mic,
  TimerReset,
  Volume2,
  Wind,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const highlights = [
  {
    title: "Hear Every Detail",
    body: "High-resolution audio structure for clean dialog, score depth, and tighter control while reviewing cuts.",
    tone: "sand",
  },
  {
    title: "120 Hours Of Playtime",
    body: "Long sessions without interruption, from script pass to final team handoff.",
    tone: "charcoal",
  },
  {
    title: "Adaptive Focus Mode",
    body: "Noise-resistant monitoring for precise pre-production decisions in any environment.",
    tone: "sand",
  },
] as const;

const otherFeatures = [
  {
    title: "Quad-mic clarity",
    subtitle: "Clearer calls on the move",
    icon: Mic,
  },
  {
    title: "Fast pairing",
    subtitle: "Connects before you know it",
    icon: Bluetooth,
  },
  {
    title: "Low latency",
    subtitle: "Up to 80ms response",
    icon: Gauge,
  },
  {
    title: "Spatial sound",
    subtitle: "Feels like live room audio",
    icon: Volume2,
  },
] as const;

const specs = [
  { label: "Drivers", value: "40mm + 12mm dual system" },
  { label: "Playback", value: "Up to 120 hours" },
  { label: "Fast charge", value: "10 min = 6 hours" },
  { label: "ANC", value: "Adaptive up to 45 dB" },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">

      <nav className="glass-panel-strong relative z-10 border-b border-white/10 px-6 py-5 md:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-interactive grid h-10 w-10 place-items-center rounded-md text-white font-bold">
              P
            </div>
            <span className="text-sm font-semibold tracking-[0.2em] text-white/90">
              PREROLL AUDIO
            </span>
          </div>

          <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.22em] text-white/70 md:flex">
            <a href="#highlights" className="transition-colors hover:text-white">
              Highlights
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#specs" className="transition-colors hover:text-white">
              Specs
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="glass-interactive rounded-md px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/85 transition-colors hover:text-white btn-animated btn-sky"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="glass-interactive rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:text-white btn-animated btn-amber"
            >
              Pre-Book
            </Link>
          </div>
        </div>
      </nav>

      <Reveal>
        <section className="relative z-10 px-6 pb-20 pt-16 md:px-10 md:pt-20">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-[#f6e7bd]/90">
                The All New
              </p>
              <h1 className="mt-5 text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.86] tracking-[0.04em] text-[#fff5dc]">
                Airwave
                <br />
                Max 6
              </h1>
              <p className="mt-7 max-w-xl text-base text-white/70 md:text-lg">
                Product-page inspired experience for Preroll: bold headline,
                premium rhythm, focused feature storytelling, and strong CTA
                hierarchy.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="glass-interactive inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:text-white btn-animated btn-amber"
                >
                  Pre-Book Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="glass-pill rounded-md px-4 py-3 text-sm text-white/85">
                  Launch offer: Rs. 1000 off
                </span>
              </div>
            </div>

            <div className="relative mx-auto h-[19rem] w-full max-w-[35rem] md:h-[24rem]">
              <div className="glass-panel-strong absolute inset-0 rounded-[2rem]" />
              <div className="glass-outline absolute left-1/2 top-[52%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-56 md:w-56" />
              <div className="glass-outline absolute left-[20%] top-1/2 h-28 w-28 -translate-y-1/2 rounded-full md:h-36 md:w-36" />
              <div className="glass-outline absolute right-[20%] top-1/2 h-28 w-28 -translate-y-1/2 rounded-full md:h-36 md:w-36" />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="highlights" className="relative z-10 px-6 pb-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="mb-6 text-xs uppercase tracking-[0.32em] text-white/60">
              Get The Highlights
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className={`glass-panel rounded-2xl p-6 ${
                    item.tone === "sand"
                      ? "border-white/25"
                      : "border-white/16"
                  }`}
                >
                  <h2 className="text-3xl font-extrabold uppercase leading-[0.92] tracking-[0.02em] md:text-4xl">
                    {item.title}
                  </h2>
                  <p
                    className="mt-4 text-sm text-white/72"
                  >
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="features" className="relative z-10 border-y border-white/10 px-6 py-20 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Booming Sound
              </p>
              <h2 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-[0.04em] text-[#fff4d7] md:text-6xl">
                Detail That Hits
              </h2>
              <p className="mt-6 max-w-md text-white/70">
                With LDAC and high-fidelity tuning, you hear cleaner layers,
                tighter edges, and better decision-making cues while editing and
                planning.
              </p>
              <div className="mt-8 flex items-center gap-3 text-[#f6e7bd]">
                <Wind className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.2em]">
                  Adaptive Noise Cancellation
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                {otherFeatures.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="glass-outline rounded-xl p-5"
                    >
                      <Icon className="h-5 w-5 text-[#f6e7bd]" />
                      <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/65">{item.subtitle}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="specs" className="relative z-10 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">
                  Technical Specifications
                </p>
                <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[0.03em] text-[#fff4d7] md:text-5xl">
                  Built With Thought
                </h2>
              </div>
              <div className="glass-pill inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white/75">
                <TimerReset className="h-4 w-4 text-[#f6e7bd]" />
                No pause mode
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {specs.map((spec) => (
                <article
                  key={spec.label}
                  className="glass-outline flex items-center justify-between rounded-xl px-5 py-4"
                >
                  <span className="text-sm uppercase tracking-[0.18em] text-white/60">
                    {spec.label}
                  </span>
                  <span className="text-sm font-semibold text-[#f6e7bd]">
                    {spec.value}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
