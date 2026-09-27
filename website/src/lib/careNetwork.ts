import { tavilyApiKey } from "virtual:azure-env";
import chronicDataFile from "../data/tavilyPrompts.json";
import { callAI } from "./aiClient.js";
import { parseModelObject } from "./parseModelJson.js";

// Max characters of page text per result so the LLM stays within context limits.
const RAW_CONTENT_CAP = 6000;

// Stricter result filtering (care network)
const MIN_LOCATION_LEN = 3;
const MIN_RELEVANCE_SCORE = 0.18; // Tavily scores are typically 0–1; drop weak matches
const MIN_PAGE_TEXT_LEN = 120; // Skip thin/empty pages
// Only this many leading chars of scraped body are scanned for location (reduces footer noise)
const LOCATION_MATCH_TEXT_CAP = 4000;

export const carenetworkPrompt = `You are a learning support navigator.
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
`;

interface TavilyLikeResult {
  title?: string;
  url?: string;
  content?: string;
  rawContent?: string;
  raw_content?: string;
  score?: number;
}

export interface CareNetworkResult {
  index: number;
  query: string;
  title: string;
  url: string | undefined;
  content: string | undefined;
  page_text?: string;
  score: number | undefined;
}

export interface CareNetworkStructuredOption {
  result_index: number;
  display_name: string;
  best_for: string;
  considerations: string;
}

export interface CareNetworkStructured {
  short_overview: string;
  options: CareNetworkStructuredOption[];
  key_differences: string;
  general_recommendation: string;
}

export interface CareNetworkConditionResult {
  results: Omit<CareNetworkResult, "page_text">[];
  structured: CareNetworkStructured | null;
  comparison: string | null;
}

export type CareNetworkResponse = Record<
  string,
  CareNetworkConditionResult | never[]
>;

interface ChronicData {
  [condition: string]: { search_keywords: string[] };
}

// TODO: migrate to Azure Key Vault
// Direct fetch keeps the Node-only Tavily client (and its proxy agent) out of the browser.
async function tavilySearch(query: string): Promise<{ results: TavilyLikeResult[] }> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query,
      topic: "general",
      max_results: 5,
      include_answer: false,
      include_raw_content: "text",
    }),
  });
  const data = (await response.json()) as {
    results?: TavilyLikeResult[];
    error?: string;
    detail?: { error?: string };
  };
  if (!response.ok) {
    throw new Error(data.detail?.error || data.error || `Search failed (${response.status}).`);
  }
  return { results: data.results ?? [] };
}

export function loadChronicData(): ChronicData {
  return chronicDataFile as ChronicData;
}

/** Parse first JSON object from model output. */
export function parseModelJson(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined) {
    throw new Error("Empty model response.");
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (obj.error) {
      throw new Error(String(obj.error));
    }
    return obj;
  }
  return parseModelObject(String(raw)) as Record<string, unknown>;
}

/** Ensure parsed JSON matches expected care-network shape. */
export function validateStructured(obj: Record<string, unknown>, nResults: number): void {
  const required = [
    "short_overview",
    "options",
    "key_differences",
    "general_recommendation",
  ] as const;
  for (const k of required) {
    if (!(k in obj)) {
      throw new Error(`Missing key: ${k}`);
    }
  }
  const opts = obj.options;
  if (!Array.isArray(opts) || opts.length !== nResults || nResults < 1) {
    throw new Error("options must have one entry per search result.");
  }
  for (let i = 0; i < opts.length; i += 1) {
    const o = opts[i];
    if (typeof o !== "object" || o === null || Array.isArray(o)) {
      throw new Error("Invalid option entry.");
    }
    const option = o as Record<string, unknown>;
    for (const f of ["result_index", "display_name", "best_for", "considerations"]) {
      if (!(f in option)) {
        throw new Error(`Missing option.${f}`);
      }
    }
    const ri = option.result_index;
    if (ri !== i || typeof ri !== "number" || ri < 0 || ri >= nResults) {
      throw new Error("result_index must be 0..n-1 in order matching results.");
    }
  }
}

/** Strip SEO suffixes — keep only the part before the first | or -. */
export function cleanTitle(title: string): string {
  for (const sep of [" | ", " - ", " – "]) {
    if (title.includes(sep)) {
      return title.split(sep)[0].trim();
    }
  }
  return title;
}

/** Prefer full scraped text; fall back to snippet. Cap length for the LLM. */
export function pageTextForPrompt(item: TavilyLikeResult): string {
  let raw: string = item.rawContent ?? item.raw_content ?? item.content ?? "";
  if (typeof raw !== "string") {
    raw = String(raw);
  }
  raw = raw.trim();
  if (raw.length > RAW_CONTENT_CAP) {
    raw = `${raw.slice(0, RAW_CONTENT_CAP)}\n[...truncated]`;
  }
  return raw;
}

export function normalizeUrl(url: string | undefined): string {
  if (!url || typeof url !== "string") {
    return "";
  }
  return url.split("?")[0].replace(/\/+$/, "").toLowerCase();
}

/** Require location terms to appear in blob (title, snippet, URL, and capped page body). */
export function locationInText(blob: string, location: string): boolean {
  const loc = location.trim().toLowerCase();
  if (loc.length < MIN_LOCATION_LEN) {
    return false;
  }
  const b = blob.toLowerCase();
  if (b.includes(loc)) {
    return true;
  }
  for (const part of location.split(/[,;]/)) {
    const p = part.trim().toLowerCase();
    if (p.length >= MIN_LOCATION_LEN && b.includes(p)) {
      return true;
    }
  }
  return false;
}

/** Drop duplicates, low relevance, thin pages, and results with no local signal. */
export function passesResultFilters(
  item: TavilyLikeResult,
  location: string,
  seenUrls: Set<string>,
): boolean {
  const url = item.url ?? "";
  const key = normalizeUrl(url);
  if (!key || seenUrls.has(key)) {
    return false;
  }

  const score = item.score;
  if (score !== null && score !== undefined) {
    const numeric = Number(score);
    if (!Number.isNaN(numeric) && numeric < MIN_RELEVANCE_SCORE) {
      return false;
    }
  }

  const fullText = pageTextForPrompt(item);
  if (fullText.trim().length < MIN_PAGE_TEXT_LEN) {
    return false;
  }

  const pageForLoc =
    fullText.length > LOCATION_MATCH_TEXT_CAP
      ? fullText.slice(0, LOCATION_MATCH_TEXT_CAP)
      : fullText;
  const combined = `${item.title ?? ""} ${item.content ?? ""} ${url} ${pageForLoc}`;
  if (!locationInText(combined, location)) {
    return false;
  }

  return true;
}

export async function searchConditions(
  conditionNames: string[],
  location: string,
): Promise<CareNetworkResponse> {
  const loc = (location ?? "").trim();
  if (loc.length < MIN_LOCATION_LEN) {
    throw new Error(
      `Location must be at least ${MIN_LOCATION_LEN} characters (e.g. city and state).`,
    );
  }

  const chronicData = loadChronicData();
  const finalResults: CareNetworkResponse = {};

  for (const condition of conditionNames) {
    if (!(condition in chronicData)) {
      finalResults[condition] = [];
      continue;
    }

    const conditionData = chronicData[condition];
    const resultsList: CareNetworkResult[] = [];
    const seenUrls = new Set<string>();

    for (const keyword of conditionData.search_keywords) {
      if (resultsList.length >= 3) {
        break;
      }

      const query = `${keyword} in ${loc}`;

      const response = await tavilySearch(query);

      for (const item of (response.results ?? []) as TavilyLikeResult[]) {
        if (resultsList.length >= 3) {
          break;
        }
        if (!passesResultFilters(item, loc, seenUrls)) {
          continue;
        }
        seenUrls.add(normalizeUrl(item.url));
        const fullText = pageTextForPrompt(item);
        resultsList.push({
          index: resultsList.length,
          query,
          title: cleanTitle(item.title ?? ""),
          url: item.url,
          content: item.content,
          page_text: fullText,
          score: item.score,
        });
      }
    }

    if (resultsList.length === 0) {
      finalResults[condition] = {
        results: [],
        structured: null,
        comparison:
          "No search results passed filters for this location. " +
          "Try a broader location or different wording.",
      };
      continue;
    }

    const promptData = {
      condition,
      location,
      results: resultsList,
    };
    let raw: string | null = null;
    let structured: CareNetworkStructured | null = null;
    let comparisonFallback: string | null = null;
    try {
      raw = await callAI(carenetworkPrompt, JSON.stringify(promptData));
      const parsed = parseModelJson(raw);
      validateStructured(parsed, resultsList.length);
      structured = parsed as unknown as CareNetworkStructured;
    } catch {
      comparisonFallback = raw === null ? "Comparison unavailable." : raw;
    }

    finalResults[condition] = {
      // page_text is prompt-only context; it never goes back to the browser.
      results: resultsList.map((r) => ({
        index: r.index,
        query: r.query,
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      structured,
      comparison: comparisonFallback,
    };
  }

  return finalResults;
}
