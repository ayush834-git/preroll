from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os

from groq import Groq

# Load environment variables
load_dotenv()

# Read API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in environment variables")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

# ----------- Model Configuration -----------
MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "1400"))
TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.4"))
MAX_PROMPT_CHARS = int(os.getenv("MAX_PROMPT_CHARS", "3000"))

SYSTEM_PROMPT = """You are a professional film production assistant used by directors, producers, and department heads.
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
- High: overlapping elements, logistical challenges, precise coordination.
"""

# FastAPI app
app = FastAPI(title="Preroll AI API")

# CORS (local + configurable)
default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
env_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
origins = [*default_origins, *env_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- Schemas -----------

class GenerateParams(BaseModel):
    genre: Optional[str] = None
    budgetTier: Optional[str] = None
    runtimeEstimate: Optional[str] = None
    locationCount: Optional[str] = None
    sceneComplexity: Optional[str] = None
    generationType: Optional[str] = None

class GenerateRequest(BaseModel):
    prompt: str
    params: Optional[GenerateParams] = None

class GenerateResponse(BaseModel):
    output: str

# ----------- Routes -----------

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/generate", response_model=GenerateResponse)
def generate_text(data: GenerateRequest):
    try:
        user_prompt = data.prompt.strip()
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        params = data.params or GenerateParams()

        param_lines = [
            f"Generation type: {params.generationType or 'Scene Breakdown'}",
            f"Genre: {params.genre or 'Unspecified'}",
            f"Budget tier: {params.budgetTier or 'Unspecified'}",
            f"Runtime estimate: {params.runtimeEstimate or 'Unspecified'}",
            f"Location count: {params.locationCount or 'Unspecified'}",
            f"Scene complexity: {params.sceneComplexity or 'Unspecified'}",
        ]

        combined_prompt = "\n".join(
            [
                "Project brief:",
                user_prompt,
                "",
                "Production parameters:",
                *param_lines,
            ]
        ).strip()

        if len(combined_prompt) > MAX_PROMPT_CHARS:
            raise HTTPException(
                status_code=400,
                detail=f"Prompt too long. Max {MAX_PROMPT_CHARS} characters.",
            )

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": combined_prompt
                }
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )

        return {
            "output": completion.choices[0].message.content.strip()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
