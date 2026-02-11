"use client";

import Link from "next/link";
import { ArrowRight, Clapperboard, Layers, Sparkles, Wand2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const scriptNodes = [
  { label: "Characters", x: "12%", y: "26%", tone: "sky" },
  { label: "Locations", x: "42%", y: "14%", tone: "violet" },
  { label: "Coverage", x: "74%", y: "24%", tone: "amber" },
  { label: "Mood", x: "22%", y: "62%", tone: "emerald" },
  { label: "Budget", x: "52%", y: "56%", tone: "rose" },
  { label: "Schedule", x: "82%", y: "66%", tone: "sky" },
] as const;

const timelineBars = [
  { label: "Script Parse", width: "35%", tone: "sky" },
  { label: "Beat Alignment", width: "62%", tone: "violet" },
  { label: "Crew Mapping", width: "48%", tone: "amber" },
  { label: "Budget Forecast", width: "72%", tone: "emerald" },
] as const;

const storyboardFrames = [
  "Opening setup",
  "Conflict turn",
  "Visual payoff",
  "Closing beat",
] as const;

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <nav className="glass-panel triptych-nav relative z-20 mx-6 mt-6 flex items-center justify-between rounded-2xl px-5 py-4 md:mx-10">
        <div className="flex items-center gap-3">
          <div className="glass-interactive grid h-9 w-9 place-items-center rounded-lg text-white font-bold">
            P
          </div>
          <span className="text-sm font-semibold tracking-[0.22em] text-white/90">
            PREROLL
          </span>
        </div>

        <div className="hidden items-center gap-7 text-xs uppercase tracking-[0.2em] text-white/70 md:flex">
          <span>Landing</span>
          <span>Dashboard</span>
          <span>Results</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="glass-outline rounded-lg px-4 py-2 text-xs text-white/80 transition-colors hover:text-white btn-animated btn-sky"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="glass-interactive rounded-lg px-4 py-2 text-xs text-white transition-colors btn-animated btn-amber"
          >
            Open Tool
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-6 pb-10 pt-8 md:px-10 md:pt-10">
        <Reveal>
          <div className="triptych-shell mx-auto w-full max-w-[1900px]">
            <div className="triptych-strip">
              <article className="triptych-screen triptych-screen-left glass-panel-strong">
                <div className="triptych-screen-head">
                  <span className="triptych-dot" />
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                    Screen 1 - Landing
                  </span>
                </div>

                <div className="glass-primary triptych-hero-card">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/65">
                    AI Pre-Production Film Tool
                  </p>
                  <h1 className="mt-5 text-4xl font-semibold leading-[0.9] tracking-tight text-white md:text-5xl">
                    FUTURE OF FILMMAKING AWAITS
                  </h1>
                  <p className="mt-5 max-w-xl text-sm text-white/70 md:text-base">
                    Cinematic planning in one glass-first workspace: script analysis,
                    production timing, and visual direction with calm, premium motion.
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/dashboard"
                      className="glass-interactive inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-[0.12em] text-white transition-colors hover:text-white btn-animated btn-amber"
                    >
                      START PROJECT
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="triptych-subtle-note">
                  <Sparkles className="h-4 w-4 text-white/60" />
                  <span>Refractive hover depth, soft volumetric atmosphere</span>
                </div>
              </article>

              <article className="triptych-screen triptych-screen-middle glass-panel-strong">
                <div className="triptych-screen-head">
                  <span className="triptych-dot" />
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                    Screen 2 - Dashboard
                  </span>
                </div>

                <div className="triptych-dashboard-grid">
                  <aside className="glass-outline triptych-sidebar">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                      Workspace
                    </p>
                    <div className="mt-4 space-y-2 text-xs">
                      {["Project", "Scenes", "Characters", "Timeline", "Assets"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`triptych-nav-pill ${
                              index === 1 ? "triptych-nav-pill-active" : ""
                            }`}
                          >
                            {item}
                          </div>
                        )
                      )}
                    </div>
                  </aside>

                  <div className="space-y-4">
                    <section className="glass-panel triptych-widget">
                      <div className="triptych-widget-head">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-white/75" />
                          <h2 className="text-sm font-medium text-white/90">
                            Script Breakdown
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          Live Graph
                        </span>
                      </div>
                      <div className="triptych-node-map">
                        {scriptNodes.map((node) => (
                          <div
                            key={node.label}
                            className={`triptych-node triptych-node-${node.tone}`}
                            style={{ left: node.x, top: node.y }}
                          >
                            <span>{node.label}</span>
                          </div>
                        ))}
                        <div className="triptych-node-lines" />
                      </div>
                    </section>

                    <section className="glass-panel triptych-widget">
                      <div className="triptych-widget-head">
                        <div className="flex items-center gap-2">
                          <Clapperboard className="h-4 w-4 text-white/75" />
                          <h2 className="text-sm font-medium text-white/90">
                            Production Timeline
                          </h2>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          Gantt Layer
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {timelineBars.map((bar) => (
                          <div key={bar.label} className="triptych-timeline-row">
                            <p className="text-[11px] text-white/65">{bar.label}</p>
                            <div className="triptych-timeline-track">
                              <div
                                className={`triptych-timeline-bar triptych-timeline-bar-${bar.tone}`}
                                style={{ width: bar.width }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </article>

              <article className="triptych-screen triptych-screen-right glass-panel-strong">
                <div className="triptych-screen-head">
                  <span className="triptych-dot" />
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                    Screen 3 - Results
                  </span>
                </div>

                <section className="glass-primary triptych-result-card">
                  <div className="triptych-widget-head">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-white/75" />
                      <h2 className="text-base font-medium text-white/92">
                        Final Output Reveal
                      </h2>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                      Holographic Storyboard
                    </span>
                  </div>

                  <div className="triptych-storyboard">
                    {storyboardFrames.map((frame, index) => (
                      <div key={frame} className="triptych-frame-card">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          Frame {index + 1}
                        </span>
                        <p className="mt-2 text-sm text-white/88">{frame}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="glass-interactive rounded-lg px-4 py-2 text-xs text-white btn-animated btn-amber">
                      EXPORT ASSETS
                    </button>
                    <button className="glass-outline rounded-lg px-4 py-2 text-xs text-white/80 btn-animated btn-sky">
                      SHARE BOARD
                    </button>
                  </div>
                </section>
              </article>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
