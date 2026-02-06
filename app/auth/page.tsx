"use client";

import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-xl">
        <h1 className="text-2xl font-light mb-2">Welcome to Preroll</h1>
        <p className="text-sm text-white/60 mb-8">
          Sign in to continue (demo only)
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#E6A23C]"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md bg-black/40 border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#E6A23C]"
          />

          <button
            onClick={() => router.push("/app")}
            className="w-full mt-4 bg-[#E6A23C] text-black py-3 rounded-md font-medium hover:bg-[#f0b44d] transition"
          >
            Continue
          </button>
        </div>

        <p className="mt-6 text-xs text-white/40">
          This is a demo. No real authentication is performed.
        </p>
      </div>
    </main>
  );
}
