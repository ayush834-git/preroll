import json
import os
from http.server import BaseHTTPRequestHandler

from groq import Groq


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


class handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send_json({"status": "ok"})

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length) if content_length else b""
            data = json.loads(raw_body.decode("utf-8") or "{}")
            prompt = data.get("prompt", "").strip()
            params = data.get("params") or {}

            if not prompt:
                self._send_json({"detail": "Prompt is required."}, status=400)
                return

            api_key = os.getenv("GROQ_API_KEY", "")
            if not api_key:
                self._send_json(
                    {"detail": "GROQ_API_KEY not configured."}, status=500
                )
                return

            generation_type = params.get("generationType") or "Scene Breakdown"
            genre = params.get("genre") or "Unspecified"
            budget_tier = params.get("budgetTier") or "Unspecified"
            runtime_estimate = params.get("runtimeEstimate") or "Unspecified"
            location_count = params.get("locationCount") or "Unspecified"
            scene_complexity = params.get("sceneComplexity") or "Unspecified"

            combined_prompt = "\n".join(
                [
                    "Project brief:",
                    prompt,
                    "",
                    "Production parameters:",
                    f"Generation type: {generation_type}",
                    f"Genre: {genre}",
                    f"Budget tier: {budget_tier}",
                    f"Runtime estimate: {runtime_estimate}",
                    f"Location count: {location_count}",
                    f"Scene complexity: {scene_complexity}",
                ]
            ).strip()

            if len(combined_prompt) > MAX_PROMPT_CHARS:
                self._send_json(
                    {
                        "detail": f"Prompt too long. Max {MAX_PROMPT_CHARS} characters."
                    },
                    status=400,
                )
                return

            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": combined_prompt},
                ],
                temperature=TEMPERATURE,
                max_tokens=MAX_TOKENS,
            )

            output = completion.choices[0].message.content
            self._send_json({"output": output})
        except json.JSONDecodeError:
            self._send_json({"detail": "Invalid JSON body."}, status=400)
        except Exception as exc:
            self._send_json({"detail": str(exc)}, status=500)
