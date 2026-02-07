const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.trim() || "http://127.0.0.1:8000";

const SYSTEM_PROMPT = `You are a professional screenwriter, character designer, and sound designer.

Based on the user's idea, generate:

1. SCREENPLAY
- Proper scene headings (INT./EXT.)
- Dialogue and actions
- For each scene, include BG (background sound/atmosphere) and LOCATION

2. CHARACTER PROFILES
For each main character include:
- Name
- Age
- Role
- Personality traits
- Character arc

3. SOUND DESIGN PLAN
- Overall mood
- Scene-wise sound effects
- Music style
- Silence / pauses

4. CASTING RECOMMENDATIONS
- 2-3 actors per character
- Short justification
- Prefer well-known actors

5. ESTIMATED BUDGET
- Low budget estimate (range + key assumptions)
- Medium budget estimate (range + key assumptions)
- High budget estimate (range + key assumptions)

Return clean, structured text.`;

export type GenerateResult = {
  output: string;
};

export type GenerateError = {
  detail?: string;
};

export async function generateScript(
  userPrompt: string,
  signal?: AbortSignal
): Promise<GenerateResult> {
  const trimmed = userPrompt.trim();
  if (!trimmed) {
    return { output: "" };
  }

  const wrappedPrompt = `${SYSTEM_PROMPT}\n\nUser idea:\n${trimmed}`;

  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: wrappedPrompt }),
    signal,
  });

  const data = (await response.json()) as GenerateResult & GenerateError;

  if (!response.ok) {
    const message = data.detail || "Something went wrong";
    throw new Error(message);
  }

  return { output: data.output || "" };
}
