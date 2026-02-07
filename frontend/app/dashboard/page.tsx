"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const steps = [
  { id: "details", title: "Project Details" },
  { id: "script", title: "Script Input" },
  { id: "team", title: "Team Setup" },
  { id: "review", title: "Review & Create" },
];

const genres = [
  "Drama",
  "Thriller",
  "Sci‑Fi",
  "Comedy",
  "Horror",
  "Romance",
  "Documentary",
];

export default function DashboardPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [description, setDescription] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [team, setTeam] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [scriptMode, setScriptMode] = useState<"paste" | "upload">("paste");

  const slug = useMemo(() => {
    const cleaned = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    return cleaned || "new";
  }, [name]);

  const canProceed = useMemo(() => {
    if (stepIndex === 0) return name.trim().length > 1;
    if (stepIndex === 1) return scriptText.trim().length > 10;
    return true;
  }, [stepIndex, name, scriptText]);

  const moveStep = (direction: "next" | "prev") => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 1200);
    setStepIndex((prev) => {
      if (direction === "prev") return Math.max(0, prev - 1);
      return Math.min(steps.length - 1, prev + 1);
    });
  };

  const createProject = () => {
    router.push(`/projects/${slug}`);
  };

  return (
    <main className="relative min-h-screen bg-black text-white px-6 md:px-10 py-10 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0600] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(230,162,60,0.1),transparent)] z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          {"<- Back"}
        </Link>

        <header className="mb-10">
          <p className="text-xs tracking-[0.3em] text-[#E6A23C] mb-3">
            CREATE PROJECT
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white">
            Build the next production plan
          </h1>
          <p className="text-white/60 mt-3 max-w-2xl">
            Follow a guided flow to capture project details, add script input,
            and generate your first AI workspace.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="glass-panel rounded-2xl p-5 h-fit lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs tracking-[0.2em] text-white/60">
                STEPS
              </span>
              {draftSaved && (
                <span className="glass-pill px-3 py-1 text-[10px] text-white/70 rounded-full">
                  Draft saved
                </span>
              )}
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const isActive = index === stepIndex;
                const isDone = index < stepIndex;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl px-3 py-2.5 border transition-colors ${
                      isActive
                        ? "border-[#E6A23C]/60 bg-[#E6A23C]/10 text-white"
                        : "border-white/10 text-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        {isDone ? "✓" : `${index + 1}.`}
                      </span>
                      <span className="text-sm">{step.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.3em]">
                  Step {stepIndex + 1} of {steps.length}
                </p>
                <h2 className="text-xl md:text-2xl font-medium mt-2">
                  {steps[stepIndex].title}
                </h2>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-white/50">
                <span className="glass-pill px-3 py-1 rounded-full">
                  Guided flow
                </span>
                <span className="glass-pill px-3 py-1 rounded-full">
                  No account required
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {stepIndex === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-white/80 mb-2">
                      Project name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Midnight Signal"
                      className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/80 mb-3">
                      Genre
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((item) => (
                        <button
                          key={item}
                          onClick={() => setGenre(item)}
                          className={`glass-pill px-3 py-1.5 text-xs rounded-full transition-colors ${
                            genre === item
                              ? "glass-amber text-white"
                              : "text-white/70"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/80 mb-2">
                      Short description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="One or two sentences about the story vision."
                      className="w-full min-h-[110px] rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40 resize-y"
                    />
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setScriptMode("paste")}
                      className={`glass-pill px-3 py-1.5 text-xs rounded-full ${
                        scriptMode === "paste"
                          ? "glass-emerald text-white"
                          : "text-white/70"
                      }`}
                    >
                      Paste script
                    </button>
                    <button
                      onClick={() => setScriptMode("upload")}
                      className={`glass-pill px-3 py-1.5 text-xs rounded-full ${
                        scriptMode === "upload"
                          ? "glass-emerald text-white"
                          : "text-white/70"
                      }`}
                    >
                      Upload script
                    </button>
                  </div>

                  {scriptMode === "paste" ? (
                    <div>
                      <label className="block text-sm text-white/80 mb-2">
                        Script text
                      </label>
                      <textarea
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        placeholder="Paste your script or outline here..."
                        className="w-full min-h-[200px] rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40 resize-y"
                      />
                      <p className="text-xs text-white/50 mt-2">
                        Tip: 10+ lines helps the AI generate stronger structure.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl glass-outline p-6 text-center">
                      <p className="text-sm text-white/70 mb-3">
                        Upload will be available soon. For now, paste the script.
                      </p>
                      <button
                        disabled
                        className="px-5 py-2 rounded-lg glass-outline text-white/40 cursor-not-allowed"
                      >
                        Upload Script (PDF)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-white/80 mb-2">
                      Invite team (optional)
                    </label>
                    <input
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      placeholder="alex@studio.com, dp@filmcrew.com"
                      className="w-full rounded-xl glass-input px-4 py-3 text-sm text-white placeholder:text-white/40"
                    />
                    <p className="text-xs text-white/50 mt-2">
                      We will send an invite after the project is created.
                    </p>
                  </div>
                  <div className="glass-outline rounded-2xl p-4">
                    <p className="text-sm text-white/70">
                      Roles can be assigned later — director, producer, editor,
                      and more.
                    </p>
                  </div>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="space-y-4">
                  <div className="glass-outline rounded-2xl p-4">
                    <p className="text-xs text-white/50 uppercase tracking-[0.2em]">
                      Summary
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-white/80">
                      <p>
                        <span className="text-white/50">Project:</span>{" "}
                        {name || "Untitled Project"}
                      </p>
                      <p>
                        <span className="text-white/50">Genre:</span> {genre}
                      </p>
                      <p>
                        <span className="text-white/50">Description:</span>{" "}
                        {description || "No description yet."}
                      </p>
                      <p>
                        <span className="text-white/50">Script:</span>{" "}
                        {scriptText.trim()
                          ? "Script added"
                          : "No script yet"}
                      </p>
                      <p>
                        <span className="text-white/50">Team:</span>{" "}
                        {team.trim() || "No invites yet"}
                      </p>
                    </div>
                  </div>
                  <div className="glass-outline rounded-2xl p-4 text-sm text-white/70">
                    After creation, we will open the AI workspace and generate
                    your screenplay, character profiles, sound design, and
                    budget.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => moveStep("prev")}
                disabled={stepIndex === 0}
                className="glass-outline px-5 py-2.5 rounded-xl text-sm text-white/70 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {stepIndex < steps.length - 1 ? (
                <button
                  onClick={() => moveStep("next")}
                  disabled={!canProceed}
                  className="bg-[#E6A23C] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#f0b44d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={createProject}
                  className="bg-[#E6A23C] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#f0b44d] transition-all"
                >
                  Create Project
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
