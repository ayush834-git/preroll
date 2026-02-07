from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    output: str

# ----------- Routes -----------

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/generate", response_model=GenerateResponse)
def generate_text(data: GenerateRequest):
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant helping with film pre-production, scripts, scenes, and creative ideas."
                },
                {
                    "role": "user",
                    "content": data.prompt
                }
            ],
            temperature=0.7,
            max_tokens=1200,
        )

        return {
            "output": completion.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
