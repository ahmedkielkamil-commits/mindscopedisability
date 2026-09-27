import { jsonrepair } from "jsonrepair";

/** Parse the first JSON object in model output, repairing common quote mistakes. */
export function parseModelObject(raw: string): unknown {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*\n?/i, "");
  text = text.replace(/\n?```\s*$/, "");
  const start = text.indexOf("{");
  if (start === -1) {
    throw new Error("Model did not return JSON starting with {.");
  }
  const body = text.slice(start);
  try {
    return JSON.parse(body);
  } catch (error) {
    try {
      return JSON.parse(jsonrepair(body));
    } catch {
      throw error;
    }
  }
}
