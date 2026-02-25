import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type GenerateParams = {
  genre?: string;
  budgetTier?: string;
  runtimeEstimate?: string;
  locationCount?: string;
  sceneComplexity?: string;
  generationType?: string;
  demoMode?: boolean;
};

type GenerateRequest = {
  prompt?: string;
  params?: GenerateParams;
};

const MODEL_NAME = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
// Token cap intentionally limited for demo stability.
const MAX_TOKENS = Number(process.env.GROQ_MAX_TOKENS || "1800");
const TEMPERATURE = Number(process.env.GROQ_TEMPERATURE || "0.4");
const MAX_PROMPT_CHARS = Number(process.env.MAX_PROMPT_CHARS || "3000");

const SYSTEM_PROMPT = `You are a professional film production planning assistant.

You generate practical, constraint-aware, budget-realistic film breakdowns.

Strict rules:

1. Budget Tier Scaling:
- Low budget:
  - Combine crew roles.
  - Avoid inflated salaries.
  - Use indie short film economics.
  - Minimize departments.
- Medium budget:
  - Standard small production structure.
- High budget:
  - Expanded departments.
  - Contingency planning.
  - Multi-unit coordination if needed.

2. Runtime Scaling:
- Under 5 minutes:
  - Minimal multi-day builds.
  - Short schedule.
- 5–15 minutes:
  - Structured but compact production schedule.
- 30+ minutes:
  - Multi-phase planning and scheduling.

3. Location Count:
- 1 location:
  - No transport logistics.
- 3+ locations:
  - Include permit coordination.
- 5+ locations:
  - Include scheduling efficiency and transition planning.

4. Scene Complexity:
- Low:
  - Simple blocking and lighting.
- Medium:
  - Dynamic coverage.
- High:
  - Advanced lighting, stunts, VFX coordination if justified.

5. Avoid redundancy across sections.
6. Keep budgets internally consistent across departments.
7. Do not inflate costs unrealistically.
8. Maximum 5 bullet points per section unless complexity is High.
9. Keep responses professional, concise, and production-ready.
10. Return ONLY valid structured JSON.

Return ONLY valid JSON with this schema (no extra text, no markdown, no code fences):
{
  "generation_type": string,
  "sections": [
    { "title": string, "bullets": [string] }
  ]
}

Output contracts (titles must match exactly):

If Generation type = "Full Production Plan":
1. Scene Objective
2. Characters Present
3. Locations Required
4. Props & Set Dressing
5. Key Actions & Beats
6. Production Challenges
7. Estimated Time & Coverage
8. Sound Design
9. Budget Breakdown
10. Visual Direction
11. Production Notes

If Generation type = "Scene Breakdown":
1. Scene Objective
2. Characters Present
3. Locations Required
4. Props & Set Dressing
5. Key Actions & Beats
6. Production Challenges
7. Estimated Time & Coverage

If Generation type = "Sound Design":
1. Ambient Bed
2. Diegetic Sounds
3. Non-Diegetic Elements
4. Transitions & Accents
5. Technical & Mixing Notes

If Generation type = "Budget Plan":
1. Cast Costs
2. Crew Costs
3. Locations & Permits
4. Equipment & Gear
5. Art, Wardrobe & Props
6. Sound & Post-Production
7. Contingency & Risk Buffer

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
6. On-Set Priorities`;

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

  if (params.demoMode) {
    paramLines.push(
      "",
      "DEMO MODE ACTIVE: Limit ALL sections to a maximum of 4 bullet points. Use slightly shorter phrasing. Remove cost-saving alternatives. Reduce verbosity to ensure stability during demo."
    );
  }

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
      max_tokens: Number.isFinite(MAX_TOKENS) ? MAX_TOKENS : 1800,
    });

    const output = completion.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ output });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate output.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
