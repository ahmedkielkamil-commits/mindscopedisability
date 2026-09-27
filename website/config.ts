import { ClientSecretCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

// ── Key Vault secret name constants ──────────────────────────────────────────
// These are labels, not values — safe to hardcode in source.
export const KV_AGENT_ENDPOINT = "agentendpoint";
export const KV_AGENT_NAME = "agentname";
export const KV_TAVILY_KEY = "tavilykey";
export const KV_GOOGLE_PLACES = "googleplaces";

export interface Secrets {
  agentEndpoint: string;
  agentName: string;
  tavilyApiKey: string;
  googlePlacesApiKey: string;
}

function requireEnv(env: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    if (env[name]) return env[name];
  }
  throw new Error(`Missing ${names.join(" or ")} in website/.env.`);
}

export function buildCredential(env: Record<string, string>): ClientSecretCredential {
  return new ClientSecretCredential(
    requireEnv(env, "AZURE_TENANT_ID"),
    requireEnv(env, "AZURE_CLIENT_ID"),
    requireEnv(env, "AZURE_CLIENT_SECRET"),
  );
}

async function getSecret(client: SecretClient, name: string): Promise<string> {
  try {
    const secret = await client.getSecret(name);
    if (!secret.value) throw new Error("empty value");
    return secret.value;
  } catch (err) {
    const reason = err instanceof Error ? err.message.split("\n")[0] : String(err);
    throw new Error(
      `Could not read Key Vault secret '${name}': ${reason}. ` +
        "Secret names are case-sensitive and may only contain letters, numbers, and hyphens.",
      { cause: err },
    );
  }
}

/** Fetch all four secrets from Key Vault. Runs in Node when Vite starts or builds. */
export async function loadSecrets(
  env: Record<string, string>,
  credential: ClientSecretCredential,
): Promise<Secrets> {
  const vaultUrl = requireEnv(env, "AZURE_KEYVAULT_URI", "vault_uri").replace(/\/+$/, "");
  const client = new SecretClient(vaultUrl, credential);

  console.log("Fetching secrets from Key Vault...");
  const [agentEndpoint, agentName, tavilyApiKey, googlePlacesApiKey] = await Promise.all([
    getSecret(client, KV_AGENT_ENDPOINT),
    getSecret(client, KV_AGENT_NAME),
    getSecret(client, KV_TAVILY_KEY),
    getSecret(client, KV_GOOGLE_PLACES),
  ]);
  console.log("All secrets loaded successfully.");

  return { agentEndpoint, agentName, tavilyApiKey, googlePlacesApiKey };
}
