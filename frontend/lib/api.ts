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

  const data = (await response.json()) as GenerateResult & GenerateError;

  if (!response.ok) {
    const message = data.detail || "Something went wrong";
    throw new Error(message);
  }

  return { output: data.output || "" };
}
