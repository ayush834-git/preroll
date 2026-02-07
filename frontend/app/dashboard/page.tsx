"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-black text-white px-8 md:px-10 py-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0600] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(230,162,60,0.08),transparent)] z-0" />

      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          {"<- Back"}
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl font-light text-white">
            Welcome to <span className="text-[#E6A23C]">Preroll</span>
          </h1>
          <p className="text-white/60 mt-2">
            Your pre-production workspace.
          </p>
        </header>

        <section className="max-w-xl">
          <div className="rounded-2xl p-8 glass-panel hover:border-white/20 transition-colors">
            <h2 className="text-lg font-medium text-white mb-2">Create Project</h2>
            <p className="text-sm text-white/60 mb-6">
              Start a new film, script, or idea and generate content with AI.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-[#E6A23C] text-black px-6 py-3.5 rounded-xl font-medium hover:bg-[#f0b44d] transition-all shadow-lg shadow-[#E6A23C]/20"
            >
              Open Project
              <span className="text-black/70">{"->"}</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
