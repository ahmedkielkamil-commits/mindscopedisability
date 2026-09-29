import { functionKey, processUrl } from "virtual:azure-env";

function processEndpoint(): string {
  const raw = (processUrl || "").trim();
  if (!raw) {
    throw new Error("Missing default_domain for the Azure Function. Add it to website/.env and restart Vite.");
  }
  const withProtocol = raw.startsWith("http") || raw.startsWith("/") ? raw : `https://${raw}`;
  const url = new URL(withProtocol, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  if (functionKey) {
    url.searchParams.set("code", functionKey);
  }
  return url.toString();
}

function functionError(text: string): string {
  try {
    const parsed = JSON.parse(text) as { error?: string };
    return parsed.error ?? "";
  } catch {
    return "";
  }
}

export type ProcessFeature = "iep-analyzer" | "research-to-pptx";

/** Call the Azure Function POST /api/process for IEP analysis or slides. */
export async function processFeature(feature: ProcessFeature, content: string): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (functionKey) {
    headers["x-functions-key"] = functionKey;
  }

  const response = await fetch(processEndpoint(), {
    method: "POST",
    headers,
    body: JSON.stringify({ feature, content }),
  });

  const text = await response.text();
  const errorMessage = functionError(text);

  if (!response.ok) {
    throw new Error(errorMessage || `Function request failed (${response.status}).`);
  }
  if (errorMessage) {
    throw new Error(errorMessage);
  }
  if (!text.trim()) {
    throw new Error("The Azure Function returned an empty response.");
  }
  return text;
}

/** Facility search still needs its own Function. */
export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  void systemPrompt;
  void userPrompt;
  throw new Error("Facility search is not on the Azure Function yet.");
}
