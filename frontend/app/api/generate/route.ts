import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type GenerateParams = {
  genre?: string;
  budgetTier?: string;
  runtimeEstimate?: string;
  locationCount?: string;
  sceneComplexity?: string;
  generationType?: string;
};

type GenerateRequest = {
  prompt?: string;
  params?: GenerateParams;
};

const MODEL_NAME = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const MAX_TOKENS = Number(process.env.GROQ_MAX_TOKENS || "1400");
const TEMPERATURE = Number(process.env.GROQ_TEMPERATURE || "0.4");
const MAX_PROMPT_CHARS = Number(process.env.MAX_PROMPT_CHARS || "3000");

const SYSTEM_PROMPT = `You are a professional film production assistant used by directors, producers, and department heads.
You generate production-ready documents, not summaries or creative blurbs.

Return ONLY valid JSON with this schema (no extra text, no markdown, no code fences):
{
  "generation_type": string,
  "sections": [
    { "title": string, "bullets": [string] }
  ]
}

Global rules:
- No generic filler. No prose paragraphs.
- Use clear section headers and bullet points only.
- Never skip a required section for the selected generation type.
- If information is missing, infer realistic industry-standard details.
- Do not mention AI or explain reasoning.
- Set generation_type to the provided Generation type value.

Output contracts (titles must match exactly):

If Generation type = "Scene Breakdown":
1. Scene Objective
2. Characters Present
3. Locations Required
4. Props & Set Dressing
5. Key Actions & Beats
6. Production Challenges
7. Estimated Time & Coverage
Minimum detail: 5-8 bullets per section.

If Generation type = "Sound Design":
1. Ambient Bed
2. Diegetic Sounds
3. Non-Diegetic Elements
4. Transitions & Accents
5. Technical & Mixing Notes
Minimum detail: 6-8 bullets per section.

If Generation type = "Budget Plan":
1. Cast Costs
2. Crew Costs
3. Locations & Permits
4. Equipment & Gear
5. Art, Wardrobe & Props
6. Sound & Post-Production
7. Contingency & Risk Buffer
Rules:
- Include realistic cost ranges (e.g., "$15k-$30k") in each section.
- Include at least one cost-saving alternative per section.
- Assume indie to mid-budget unless specified.
- Include explicit bullets for sound, CGI/VFX, casting, marketing/distribution.

If Generation type = "Visual Direction":
1. Visual Tone & Mood
2. Color Palette & Contrast
3. Camera Movement & Framing
4. Lighting Approach
5. Production Design & Texture
6. Visual References (described, not named)

If Generation type = "Production Notes":
1. Directorial Intent
2. Performance Notes
3. Blocking & Movement
4. Continuity Considerations
5. Safety & Logistics
6. On-Set Priorities

Complexity enforcement:
- Low: fewer locations, simple setups, minimal layers.
- Medium: multiple layers, transitions, technical considerations.
- High: overlapping elements, logistical challenges, precise coordination.`;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { detail: "Server is missing GROQ_API_KEY." },
      { status: 500 }
    );
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ detail: "Prompt cannot be empty." }, { status: 400 });
  }

  const params = body.params || {};
  const paramLines = [
    `Generation type: ${params.generationType || "Scene Breakdown"}`,
    `Genre: ${params.genre || "Unspecified"}`,
    `Budget tier: ${params.budgetTier || "Unspecified"}`,
    `Runtime estimate: ${params.runtimeEstimate || "Unspecified"}`,
    `Location count: ${params.locationCount || "Unspecified"}`,
    `Scene complexity: ${params.sceneComplexity || "Unspecified"}`,
  ];

  const combinedPrompt = [
    "Project brief:",
    prompt,
    "",
    "Production parameters:",
    ...paramLines,
  ].join("\n");

  if (combinedPrompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { detail: `Prompt too long. Max ${MAX_PROMPT_CHARS} characters.` },
      { status: 400 }
    );
  }

  try {
    const client = new Groq({ apiKey });
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: combinedPrompt },
      ],
      temperature: Number.isFinite(TEMPERATURE) ? TEMPERATURE : 0.4,
      max_tokens: Number.isFinite(MAX_TOKENS) ? MAX_TOKENS : 1400,
    });

    const output = completion.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ output });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate output.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
