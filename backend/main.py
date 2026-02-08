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

SYSTEM_PROMPT = """You are a professional assistant director and script supervisor working on an independent film production.

Return ONLY valid JSON with the exact schema below (no extra text, no markdown, no code fences):
{
  "executive_summary": [string],
  "scene_overview": string,
  "key_actions": [string],
  "characters_roles": [{"name": string, "role": string, "notes": string}],
  "visual_style": [string],
  "sound_design": [string],
  "budget_considerations": [string],
  "director_notes": [string],
  "assumptions_made": [string]
}

Rules:
- Tone: professional, practical, neutral. No emojis. No poetic language.
- Do NOT write screenplay, dialogue, or scene script.
- Always include all keys. No empty arrays.
- If info is limited, use short, practical placeholders (e.g., "Not specified") rather than omitting.
- Executive summary: 3-5 bullets.
- Scene overview: 2-4 concise sentences.
- Key actions: 4-8 bullets, no paragraphs.
- Characters roles: 2-5 entries with name, role, notes.
- Visual style, sound design, budget, director notes: 3-6 bullets each.
- Assumptions made: 2-4 bullets.
- Keep each bullet under 20 words.
- Use the Generation type parameter to emphasize the relevant section.
- If Generation type contains "Budget", budget_considerations MUST include line items for:
  Sound, CGI/VFX, Casting, Marketing/Distribution, Locations/Permits, Production Design,
  Wardrobe/Makeup, Equipment/Camera, Crew/Labor, Post-Production, Contingency.
- Budget line items format: "Category - cost impact (Low/Medium/High) + short rationale".
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
