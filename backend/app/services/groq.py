import httpx
import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.model = "llama-3.3-70b-versatile"
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    def detect_language(self, filename: str) -> str:
        """Helper to identify code language by extension."""
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        mapping = {
            "py": "Python",
            "js": "JavaScript",
            "ts": "TypeScript",
            "jsx": "React JS",
            "tsx": "React TS",
            "java": "Java",
            "cpp": "C++",
            "c": "C"
        }
        return mapping.get(ext, "Unknown")

    def clean_and_parse_json(self, raw_response: str) -> Dict[str, Any]:
        """
        Extremely robust JSON parsing. Strips markdown backticks, conversational prefaces,
        and isolates the core JSON block. Generates safe fallback schemas on failure.
        """
        cleaned = raw_response.strip()
        
        # Try to locate the JSON block if LLM returned text outside the brackets
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            cleaned = cleaned[first_brace:last_brace + 1]
            
        try:
            parsed = json.loads(cleaned)
            # Ensure required schema structure exists
            required_keys = ["filename", "overall_score", "summary", "bugs", "performance", "security", "best_practices", "refactor_suggestions", "positive_highlights"]
            for key in required_keys:
                if key not in parsed:
                    if key == "overall_score":
                        parsed[key] = 100
                    elif key == "positive_highlights":
                        parsed[key] = []
                    elif key in ["bugs", "performance", "security", "best_practices", "refactor_suggestions"]:
                        parsed[key] = []
                    else:
                        parsed[key] = ""
            return parsed
        except json.JSONDecodeError as e:
            logger.error(f"JSON decoding error: {e}. Raw response snippet: {raw_response[:200]}")
            # Fallback structure so the review does not fail completely
            return {
                "filename": "",
                "overall_score": 100,
                "summary": "Failed to parse code review results from the AI. The file may contain highly complex structure or formatting issues.",
                "bugs": [],
                "performance": [],
                "security": [],
                "best_practices": [],
                "refactor_suggestions": [],
                "positive_highlights": ["File analyzed but parsing failed."]
            }

    async def review_file(self, filename: str, code: str) -> Dict[str, Any]:
        """
        Submits file content to the Groq LLM and returns the parsed review results.
        """
        if not self.api_key:
            return {
                "filename": filename,
                "overall_score": 100,
                "summary": "Groq API Key is missing. Please configure GROQ_API_KEY to enable full code reviews.",
                "bugs": [],
                "performance": [],
                "security": [],
                "best_practices": [],
                "refactor_suggestions": [],
                "positive_highlights": ["Backend runs correctly, pending API configuration."]
            }

        language = self.detect_language(filename)
        
        # Construct exact prompts requested
        system_prompt = (
            "You are CodeLens, a senior software engineer conducting thorough code reviews. "
            "Respond in valid JSON only. No markdown. No text outside the JSON."
        )
        
        user_prompt = (
            "Review this code file and return ONLY this JSON:\n"
            "{\n"
            '  "filename": "...",\n'
            '  "overall_score": <0-100>,\n'
            '  "summary": "...",\n'
            '  "bugs":             [{ "severity": "high|medium|low", "line": <int|null>, "issue": "...", "fix": "..." }],\n'
            '  "performance":      [{ "severity": "high|medium|low", "line": <int|null>, "issue": "...", "fix": "..." }],\n'
            '  "security":         [{ "severity": "high|medium|low", "line": <int|null>, "issue": "...", "fix": "..." }],\n'
            '  "best_practices":   [{ "severity": "high|medium|low", "issue": "...", "fix": "..." }],\n'
            '  "refactor_suggestions": [{ "issue": "...", "fix": "..." }],\n'
            '  "positive_highlights":  ["..."]\n'
            "}\n"
            f"Filename: {filename}   Language: {language}\n"
            f"Code:\n{code}"
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,  # Low temperature for highly structured compliance
            "response_format": {"type": "json_object"}  # Request JSON mode from Groq
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(self.url, headers=headers, json=payload)
                if response.status_code != 200:
                    logger.error(f"Groq API error (HTTP {response.status_code}): {response.text}")
                    raise ValueError(f"Groq API Error: {response.text}")
                    
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                parsed_review = self.clean_and_parse_json(content)
                parsed_review["filename"] = filename # Override filename to be safe
                return parsed_review
                
            except Exception as e:
                logger.error(f"Error communicating with Groq API for {filename}: {e}")
                return {
                    "filename": filename,
                    "overall_score": 100,
                    "summary": f"Could not perform review on {filename} due to API/connection error: {str(e)}",
                    "bugs": [],
                    "performance": [],
                    "security": [],
                    "best_practices": [],
                    "refactor_suggestions": [],
                    "positive_highlights": []
                }
