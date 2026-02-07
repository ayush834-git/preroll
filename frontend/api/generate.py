import json
import os
from http.server import BaseHTTPRequestHandler

from groq import Groq


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

            if not prompt:
                self._send_json({"detail": "Prompt is required."}, status=400)
                return

            api_key = os.getenv("GROQ_API_KEY", "")
            if not api_key:
                self._send_json(
                    {"detail": "GROQ_API_KEY not configured."}, status=500
                )
                return

            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI assistant helping with film pre-production, scripts, scenes, and creative ideas.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=1200,
            )

            output = completion.choices[0].message.content
            self._send_json({"output": output})
        except json.JSONDecodeError:
            self._send_json({"detail": "Invalid JSON body."}, status=400)
        except Exception as exc:
            self._send_json({"detail": str(exc)}, status=500)
