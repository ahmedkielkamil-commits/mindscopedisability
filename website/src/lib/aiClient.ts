import {
  agentEndpoint,
  agentName,
  azureToken,
} from "virtual:azure-env";

// TODO: migrate to Azure Key Vault
// The browser cannot sign in itself. Vite mints a token from the service
// principal in website/.env and places it in the page. Restart Vite after it expires.

interface AgentResponse {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
}

function llmEndpoint(): string {
  const endpoint = agentEndpoint.replace(/\/+$/, "");
  const last = endpoint.split("/").pop() ?? "";
  if (!endpoint || last === "projects" || last === "api") {
    throw new Error(
      "Agent_Endpoint must include the Foundry project name, for example " +
        "https://<resource>.services.ai.azure.com/api/projects/<project-name>.",
    );
  }
  return endpoint;
}

function readOutputText(data: AgentResponse): string {
  if (data.output_text?.trim()) {
    return data.output_text;
  }
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type === "output_text" && part.text?.trim()) {
        return part.text;
      }
    }
  }
  return "";
}

/**
 * Call the configured Azure Foundry agent from the browser.
 *
 * Named agents reject a separate `instructions` field, so the system and user
 * prompts are sent as one input blob.
 */
export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!agentName) {
    throw new Error("Missing Agent_Name for the Azure agent.");
  }
  if (!azureToken) {
    throw new Error(
      "Missing Azure token. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET, then restart the dev server.",
    );
  }

  const prompt =
    systemPrompt && systemPrompt.trim()
      ? `${systemPrompt.trim()}\n\n---\n\n${userPrompt}`
      : userPrompt;

  const url =
    `${llmEndpoint()}/agents/${encodeURIComponent(agentName)}` +
    "/endpoint/protocols/openai/responses?api-version=v1";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${azureToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: prompt,
      max_output_tokens: 16384,
    }),
  });

  const data = (await response.json()) as AgentResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || `Azure agent request failed (${response.status}).`);
  }

  const text = readOutputText(data);
  if (!text.trim()) {
    throw new Error("Azure agent returned empty text output");
  }
  return text;
}
