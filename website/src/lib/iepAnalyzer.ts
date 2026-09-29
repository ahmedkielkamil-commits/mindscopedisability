import { processFeature } from "./aiClient.js";
import { parseModelObject } from "./parseModelJson.js";

export interface IepSection {
  name: string;
  score: number;
  reasoning: string;
}

export interface IepRedFlag {
  section: string;
  issue: string;
}

export interface IepAnalysis {
  sections: IepSection[];
  red_flags: {
    minor: IepRedFlag[];
    caution: IepRedFlag[];
    critical: IepRedFlag[];
  };
  summary: string;
}

/** Parse first JSON object from model output; strip markdown fences if present. */
export function parseModelJson(raw: unknown): IepAnalysis {
  if (raw === null || raw === undefined) {
    throw new Error("Empty response from model.");
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (obj.error) {
      throw new Error(String(obj.error));
    }
    return obj as unknown as IepAnalysis;
  }
  return parseModelObject(String(raw)) as IepAnalysis;
}

/** Run IEP analysis on plain text (from PDF/DOCX/TXT). */
export async function analyzeIep(iepText: string): Promise<IepAnalysis> {
  const text = (iepText ?? "").trim();
  if (!text) {
    throw new Error("No IEP text to analyze.");
  }

  const raw = await processFeature("iep-analyzer", text.slice(0, 120_000));
  return parseModelJson(raw);
}
