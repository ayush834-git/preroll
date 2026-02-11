"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen text-white flex items-center justify-center px-6 overflow-hidden">
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
              className="w-full mt-4 glass-interactive text-white py-3.5 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta"
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
