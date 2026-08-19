import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

AZURE_CHAT_API_KEY = os.getenv("AZURE_CHAT_API_KEY")
AZURE_CHAT_ENDPOINT = os.getenv("AZURE_CHAT_ENDPOINT")
AZURE_CHAT_DEPLOYMENT = os.getenv("AZURE_CHAT_DEPLOYMENT", "gpt-5.2-chat")


def _extract_output_text(api_response):
    if api_response.get("output_text") is not None:
        return api_response["output_text"]
    for item in api_response.get("output") or []:
        if item.get("type") == "message":
            for part in item.get("content") or []:
                if part.get("type") == "output_text" and part.get("text"):
                    return part["text"]
    return None


def callAI(system_prompt, user_prompt, **kwargs):
    """Azure chat. Extra kwargs (e.g. ``response_json`` from IEP pipeline) are ignored."""
    headers = {"Content-Type": "application/json", "api-key": AZURE_CHAT_API_KEY}
    payload = {
        "model": AZURE_CHAT_DEPLOYMENT,
        "input": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        "max_output_tokens": 16384,
    }
    response = requests.post(AZURE_CHAT_ENDPOINT, headers=headers, json=payload, timeout=120)
    if response.status_code != 200:
        return {"error": f"API error {response.status_code}", "body": response.text[:500]}
    return _extract_output_text(response.json())
