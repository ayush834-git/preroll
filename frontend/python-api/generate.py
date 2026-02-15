import json
import os
from http.server import BaseHTTPRequestHandler

from groq import Groq


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
