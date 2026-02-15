const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.trim() || "";

export type GenerateResult = {
  output: string;
};

export type GenerationParams = {
  genre: string;
  budgetTier: "Low" | "Medium" | "High";
  runtimeEstimate: string;
  locationCount: string;
  sceneComplexity: "Low" | "Medium" | "High";
  generationType: string;
};

export type GenerateError = {
  detail?: string;
};

export async function generateScript(
  userPrompt: string,
  params: GenerationParams,
  signal?: AbortSignal
): Promise<GenerateResult> {
  const trimmed = userPrompt.trim();
  if (!trimmed) {
    return { output: "" };
  }

  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: trimmed, params }),
    signal,
  });

  const raw = await response.text();
  let data: (GenerateResult & GenerateError) | null = null;
  if (raw) {
    try {
      data = JSON.parse(raw) as GenerateResult & GenerateError;
    } catch {
      // Keep null and return a clearer upstream error below.
    }
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      `Generate request failed (${response.status}). Check server logs.`;
    throw new Error(message);
  }

  if (!data) {
    throw new Error(
      "Generate endpoint returned an empty or invalid JSON response."
    );
  }

  return { output: data.output || "" };
}
