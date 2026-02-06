"use client";

import { useState } from "react";

export default function ProjectPage({ params }: { params: { id: string } }) {
   
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Project: {params.id}
      </h1>
      <p className="text-white/60 mb-6">
        Develop your idea with AI-assisted pre-production.
      </p>

      <textarea
        className="w-full h-40 bg-black border border-white/10 rounded-lg p-4 mb-4 focus:outline-none focus:border-[#E6A23C]"
        placeholder="Describe your scene, script, or idea..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        className="bg-[#E6A23C] text-black px-6 py-3 rounded-lg font-medium hover:opacity-90"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate with AI"}
      </button>

      {response && (
        <div className="mt-8 p-6 border border-white/10 rounded-lg bg-black/40">
          <h2 className="text-xl font-semibold mb-2">AI Output</h2>
          <pre className="whitespace-pre-wrap text-white/80">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
