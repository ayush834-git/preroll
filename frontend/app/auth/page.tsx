"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-bg text-white flex items-center justify-center px-6 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg to-surface z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(230,162,60,0.12),transparent)] z-0" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          {"<- Back"}
        </Link>

        <div className="rounded-2xl p-8 glass-panel-strong">
          <h1 className="text-2xl font-light text-white mb-2">
            Welcome to <span className="text-primary">Preroll</span>
          </h1>
          <p className="text-sm text-white/60 mb-8">
            Sign in to continue (demo only)
          </p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl glass-input px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-4 bg-primary text-bg py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-glow btn-animated btn-amber btn-cta"
            >
              Continue
            </button>
          </div>

          <p className="mt-6 text-xs text-white/40">
            This is a demo. No real authentication is performed.
          </p>
        </div>
      </div>
    </main>
  );
}
