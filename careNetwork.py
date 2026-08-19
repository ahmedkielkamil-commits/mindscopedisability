import json
import os
import re
from pathlib import Path

from tavily import TavilyClient
from ai_client import callAI

# Max characters of page text per result so the LLM stays within context limits.
_RAW_CONTENT_CAP = 6000

# Stricter result filtering (care network)
_MIN_LOCATION_LEN = 3
_MIN_RELEVANCE_SCORE = 0.18  # Tavily scores are typically 0–1; drop weak matches
_MIN_PAGE_TEXT_LEN = 120  # Skip thin/empty pages
# Only this many leading chars of scraped body are scanned for location (reduces footer noise)
_LOCATION_MATCH_TEXT_CAP = 4000

carenetworkPrompt = """You are a learning support navigator.
Your role is to help users understand and compare tutors and learning facilities based on search results. You do NOT diagnose learning differences, and you do NOT determine the best provider with certainty.
You will receive JSON with: condition, location, and results (array). Each result has index, title, url, content, and page_text (scraped body). Use page_text to name specific organizations or programs ONLY when they appear there. If a result is a generic marketplace, say so in considerations; still use result_index to tie that row to its URL.

You MUST respond with ONLY one JSON object (no markdown fences, no text before or after). Use this exact schema:
{
  "short_overview": "2-3 plain sentences, no line breaks inside the string",
  "options": [
    {
      "result_index": 0,
      "display_name": "Short label: org name, program, or site title",
      "best_for": "one plain sentence",
      "considerations": "one plain sentence"
    }
  ],
  "key_differences": "one paragraph, plain text",
  "general_recommendation": "1-2 sentences, plain text"
}

CRITICAL rules for "options":
- Include exactly ONE object per item in input "results", in order: result_index must be 0, 1, 2, ... matching each result's "index" field.
- Do NOT include URLs in your JSON. The app attaches the correct link from each result_index.
- display_name must describe that specific result (named center, marketplace name, etc.).

Other rules:
- Do not diagnose. No guarantees. Base everything on the provided results only.
- Escape quotes inside strings so the JSON is valid.
Now produce the JSON for the provided data.
"""


def _parse_model_json(raw) -> dict:
    """Parse first JSON object from model output."""
    if isinstance(raw, dict):
        if raw.get("error"):
            raise ValueError(raw.get("error", str(raw)))
        return raw
    if raw is None:
        raise ValueError("Empty model response.")
    s = raw.strip()
    s = re.sub(r"^```(?:json)?\s*\n?", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\n?```\s*$", "", s)
    start = s.find("{")
    if start == -1:
        raise ValueError("No JSON object in model response.")
    return json.JSONDecoder().raw_decode(s, start)[0]


def _validate_structured(obj: dict, n_results: int) -> None:
    """Ensure parsed JSON matches expected care-network shape."""
    required = ("short_overview", "options", "key_differences", "general_recommendation")
    for k in required:
        if k not in obj:
            raise ValueError(f"Missing key: {k}")
    opts = obj["options"]
    if not isinstance(opts, list) or len(opts) != n_results or n_results < 1:
        raise ValueError("options must have one entry per search result.")
    for i, o in enumerate(opts):
        if not isinstance(o, dict):
            raise ValueError("Invalid option entry.")
        for f in ("result_index", "display_name", "best_for", "considerations"):
            if f not in o:
                raise ValueError(f"Missing option.{f}")
        ri = o["result_index"]
        if ri != i or ri not in range(n_results):
            raise ValueError("result_index must be 0..n-1 in order matching results.")


client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def clean_title(title: str) -> str:
    """Strip SEO suffixes — keep only the part before the first | or -."""
    for sep in [" | ", " - ", " – "]:
        if sep in title:
            return title.split(sep)[0].strip()
    return title


def load_chronic_data(filename="tavilyPrompts.json"):
    path = Path(__file__).resolve().parent / filename
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def _page_text_for_prompt(item: dict) -> str:
    """Prefer full scraped text; fall back to snippet. Cap length for the LLM."""
    raw = item.get("raw_content") or item.get("content") or ""
    if not isinstance(raw, str):
        raw = str(raw)
    raw = raw.strip()
    if len(raw) > _RAW_CONTENT_CAP:
        raw = raw[:_RAW_CONTENT_CAP] + "\n[...truncated]"
    return raw


def _normalize_url(url: str) -> str:
    if not url or not isinstance(url, str):
        return ""
    return url.split("?")[0].rstrip("/").lower()


def _location_in_text(blob: str, location: str) -> bool:
    """Require location terms to appear in blob (title, snippet, URL, and capped page body)."""
    loc = location.strip().lower()
    if len(loc) < _MIN_LOCATION_LEN:
        return False
    b = blob.lower()
    if loc in b:
        return True
    for part in re.split(r"[,;]", location):
        p = part.strip().lower()
        if len(p) >= _MIN_LOCATION_LEN and p in b:
            return True
    return False


def _passes_result_filters(item: dict, location: str, seen_urls) -> bool:
    """Drop duplicates, low relevance, thin pages, and results with no local signal."""
    url = item.get("url") or ""
    key = _normalize_url(url)
    if not key or key in seen_urls:
        return False

    score = item.get("score")
    if score is not None:
        try:
            if float(score) < _MIN_RELEVANCE_SCORE:
                return False
        except (TypeError, ValueError):
            pass

    full_text = _page_text_for_prompt(item)
    if len(full_text.strip()) < _MIN_PAGE_TEXT_LEN:
        return False

    page_for_loc = (
        full_text[:_LOCATION_MATCH_TEXT_CAP]
        if len(full_text) > _LOCATION_MATCH_TEXT_CAP
        else full_text
    )
    combined = (
        f"{item.get('title', '')} {item.get('content', '')} {url} {page_for_loc}"
    )
    if not _location_in_text(combined, location):
        return False

    return True


def search_conditions(condition_names, location, filename="tavilyPrompts.json"):
    loc = (location or "").strip()
    if len(loc) < _MIN_LOCATION_LEN:
        raise ValueError(
            f"Location must be at least {_MIN_LOCATION_LEN} characters (e.g. city and state)."
        )

    chronic_data = load_chronic_data(filename)
    final_results = {}

    for condition in condition_names:
        if condition not in chronic_data:
            final_results[condition] = []
            continue

        condition_data = chronic_data[condition]
        results_list = []
        seen_urls = set()

        for keyword in condition_data["search_keywords"]:
            if len(results_list) >= 3:
                break

            query = f"{keyword} in {loc}"

            response = client.search(
                query=query,
                topic="general",
                max_results=5,
                include_answer=False,
                include_raw_content=True,
            )

            for item in response.get("results", []):
                if len(results_list) >= 3:
                    break
                if not _passes_result_filters(item, loc, seen_urls):
                    continue
                seen_urls.add(_normalize_url(item.get("url") or ""))
                full_text = _page_text_for_prompt(item)
                results_list.append({
                    "index": len(results_list),
                    "query": query,
                    "title": clean_title(item.get("title", "")),
                    "url": item.get("url"),
                    "content": item.get("content"),
                    "page_text": full_text,
                    "score": item.get("score"),
                })

        if not results_list:
            final_results[condition] = {
                "results": [],
                "structured": None,
                "comparison": (
                    "No search results passed filters for this location. "
                    "Try a broader location or different wording."
                ),
            }
            continue

        prompt_data = {
            "condition": condition,
            "location": location,
            "results": results_list,
        }
        raw = callAI(carenetworkPrompt, str(prompt_data))
        structured = None
        comparison_fallback = None
        try:
            parsed = _parse_model_json(raw)
            _validate_structured(parsed, len(results_list))
            structured = parsed
        except (ValueError, json.JSONDecodeError, KeyError, TypeError):
            comparison_fallback = raw if isinstance(raw, str) else str(raw)

        results_public = [
            {k: v for k, v in r.items() if k != "page_text"} for r in results_list
        ]
        final_results[condition] = {
            "results": results_public,
            "structured": structured,
            "comparison": comparison_fallback,
        }

    return final_results
