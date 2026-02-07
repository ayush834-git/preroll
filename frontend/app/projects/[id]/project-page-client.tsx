"use client";

import Link from "next/link";
import { useState } from "react";
import { generateScript } from "@/lib/api";
import { BeamsBackground } from "@/components/ui/beams-background";

export default function ProjectPageClient({ id }: { id: string }) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const sectionHeadings = [
    "SCREENPLAY",
    "CHARACTER PROFILES",
    "SOUND DESIGN PLAN",
    "CASTING RECOMMENDATIONS",
    "ESTIMATED BUDGET",
    "BUDGET",
    "LOW BUDGET",
    "MEDIUM BUDGET",
    "HIGH BUDGET",
  ];
  const navSections = [
    { key: "screenplay", label: "Screenplay", match: "SCREENPLAY" },
    { key: "characters", label: "Characters", match: "CHARACTER PROFILES" },
    { key: "sound", label: "Sound Design", match: "SOUND DESIGN PLAN" },
    { key: "casting", label: "Casting", match: "CASTING RECOMMENDATIONS" },
    { key: "budget", label: "Budget", match: "ESTIMATED BUDGET" },
  ];
  const navColors = [
    "glass-amber",
    "glass-emerald",
    "glass-sky",
    "glass-rose",
    "glass-violet",
  ];

  const isHeadingLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const normalized = trimmed.replace(/\*+/g, "").toUpperCase();

    if (sectionHeadings.some((heading) => normalized.startsWith(heading))) {
      return true;
    }

    if (/^\d+[\).]\s+\S/.test(trimmed)) return true;
    if (trimmed.endsWith(":") && trimmed.length <= 60) return true;
    if (/^\*{2}.+\*{2}$/.test(trimmed)) return true;

    const withoutSymbols = normalized.replace(/[^A-Z0-9\s]/g, "");
    const words = withoutSymbols.trim().split(/\s+/);
    if (words.length > 0 && words.length <= 6 && withoutSymbols === normalized) {
      return true;
    }

    return false;
  };

  const normalizeHeading = (line: string) =>
    line.trim().replace(/\*+/g, "").toUpperCase();

  const headingIdForLine = (line: string) => {
    const normalized = normalizeHeading(line);
    const match = navSections.find((section) =>
      normalized.startsWith(section.match)
    );
    return match ? `section-${match.key}` : undefined;
  };

  const splitBudgetSections = (text: string) => {
    const lines = text.split(/\r?\n/);
    let budgetStart = -1;
    for (let i = 0; i < lines.length; i += 1) {
      const normalized = lines[i].trim().replace(/\*+/g, "").toUpperCase();
      if (
        normalized.startsWith("ESTIMATED BUDGET") ||
        normalized.startsWith("BUDGET")
      ) {
        budgetStart = i;
        break;
      }
    }

    if (budgetStart === -1) {
      return { budget: "", rest: text, low: "", medium: "", high: "" };
    }

    const beforeBudget = lines.slice(0, budgetStart).join("\n");
    const budgetLines = lines.slice(budgetStart);

    const findIndex = (label: string) =>
      budgetLines.findIndex(
        (line) =>
          line.trim().replace(/\*+/g, "").toUpperCase().startsWith(label)
      );

    const lowIdx = findIndex("LOW BUDGET");
    const medIdx = findIndex("MEDIUM BUDGET");
    const highIdx = findIndex("HIGH BUDGET");

    const indices = [
      { key: "low", idx: lowIdx },
      { key: "medium", idx: medIdx },
      { key: "high", idx: highIdx },
    ]
      .filter((entry) => entry.idx >= 0)
      .sort((a, b) => a.idx - b.idx);

    const slices: Record<string, string> = {
      low: "",
      medium: "",
      high: "",
    };

    indices.forEach((entry, index) => {
      const start = entry.idx;
      const end = index + 1 < indices.length ? indices[index + 1].idx : undefined;
      slices[entry.key] = budgetLines.slice(start, end).join("\n");
    });

    const budget = budgetLines.join("\n");

    return {
      budget,
      rest: beforeBudget,
      low: slices.low,
      medium: slices.medium,
      high: slices.high,
    };
  };

  const downloadText = (filename: string, text: string) => {
    setDownloadError("");
    if (!text.trim()) {
      setDownloadError("Nothing to download yet.");
      return;
    }
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Please try again.");
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setOutput("");
    setDownloadError("");

    try {
      const data = await generateScript(prompt);
      setOutput(data.output);
      setExpanded(false);
      setCopied(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to reach the server. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BeamsBackground className="text-white">
      <main className="relative min-h-screen text-white px-6 md:px-10 py-10 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="glass-panel rounded-2xl p-5 h-fit lg:sticky lg:top-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs tracking-[0.2em] text-white/60">
                  WORKSPACE
                </span>
                <span className="glass-pill px-2.5 py-1 text-[10px] text-white/70 rounded-full">
                  LIVE
                </span>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6"
              >
                {"<- Back to dashboard"}
              </Link>

              <div className="mb-6">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                  Project
                </p>
                <p className="text-lg font-light text-white">{id}</p>
              </div>

              {output && (
                <div className="mt-6">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                    Jump to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {navSections.map((section, index) => (
                      <button
                        key={section.key}
                        onClick={() => {
                          const target = document.getElementById(
                            `section-${section.key}`
                          );
                          if (target) {
                            target.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }}
                        className={`glass-pill ${navColors[index % navColors.length]} text-[11px] text-white/90 px-3 py-1.5 rounded-full transition-colors hover:text-white`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div>
              <header className="mb-8">
                <h1 className="text-3xl font-light text-white">
                  Project <span className="text-[#E6A23C]">{id}</span>
                </h1>
                <p className="text-white/60 mt-2">
                  Describe your scene, script, or idea and generate with AI.
                </p>
              </header>

              <div className="rounded-2xl p-6 mb-6 glass-panel">
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Creative prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A noir detective walks into a rainy diner at 2am. The jukebox plays something slow. He orders coffee."
                  className="w-full min-h-[160px] rounded-xl glass-input px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#E6A23C] focus:ring-1 focus:ring-[#E6A23C]/30 transition-colors resize-y disabled:opacity-60"
                  disabled={loading}
                />
                <button
                  onClick={generate}
                  disabled={loading || !prompt.trim()}
                  className="mt-4 bg-[#E6A23C] text-black px-6 py-3.5 rounded-xl font-medium hover:bg-[#f0b44d] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-[#E6A23C]/20"
                >
                  {loading ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm text-red-400/90 text-sm">
                  {error}
                </div>
              )}
              {downloadError && (
                <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 backdrop-blur-sm text-amber-300/90 text-sm">
                  {downloadError}
                </div>
              )}

              {output &&
                (() => {
                  const { budget, rest, low, medium, high } =
                    splitBudgetSections(output);
                  return (
                    <div className="rounded-2xl p-6 glass-panel">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#E6A23C]" />
                          AI Output
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(output);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                              } catch {
                                setCopied(false);
                              }
                            }}
                            className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors"
                          >
                            {copied ? "Copied" : "Copy"}
                          </button>
                          <button
                            onClick={() =>
                              downloadText(
                                "preroll-low-budget.txt",
                                low || budget || ""
                              )
                            }
                            className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors"
                          >
                            Download Low Budget
                          </button>
                          <button
                            onClick={() =>
                              downloadText(
                                "preroll-medium-budget.txt",
                                medium || budget || ""
                              )
                            }
                            className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors"
                          >
                            Download Medium Budget
                          </button>
                          <button
                            onClick={() =>
                              downloadText(
                                "preroll-high-budget.txt",
                                high || budget || ""
                              )
                            }
                            className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors"
                          >
                            Download High Budget
                          </button>
                          <button
                            onClick={() =>
                              downloadText(
                                "preroll-response.txt",
                                rest || output
                              )
                            }
                            className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors"
                          >
                            Download Response
                          </button>
                          <button
                            onClick={() => setExpanded((prev) => !prev)}
                            className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-lg glass-outline transition-colors"
                          >
                            {expanded ? "Collapse" : "Show more"}
                          </button>
                        </div>
                      </div>
                      <div
                        className={`relative transition-all ${
                          expanded ? "max-h-none" : "max-h-[360px]"
                        } overflow-hidden`}
                      >
                        <div className="whitespace-pre-wrap text-sm text-white/85 font-sans leading-relaxed">
                          {output.split(/\r?\n/).map((line, index) => (
                            <p
                              key={`${index}-${line.slice(0, 12)}`}
                              id={headingIdForLine(line)}
                              className={
                                headingIdForLine(line)
                                  ? "scroll-mt-24"
                                  : undefined
                              }
                            >
                              {isHeadingLine(line) ? (
                                <span className="text-[#E6A23C] font-semibold tracking-wide">
                                  {line}
                                </span>
                              ) : (
                                line || "\u00A0"
                              )}
                            </p>
                          ))}
                        </div>
                        {!expanded && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                        )}
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      </main>
    </BeamsBackground>
  );
}
