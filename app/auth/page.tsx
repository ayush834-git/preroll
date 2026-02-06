"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    if (!name.trim()) return;
    // fake auth success
    router.push("/app");
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white/10 backdrop-blur p-8 rounded-xl w-[320px]">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Welcome to Preroll
        </h2>
        <p className="text-sm opacity-70 mb-6 text-center">
          Enter your name to continue
        </p>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-black/60 border border-white/20 focus:outline-none mb-4"
        />

        <button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full py-2 rounded bg-purple-600 hover:bg-purple-700 transition disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
