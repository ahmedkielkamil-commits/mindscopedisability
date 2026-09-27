import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { buildCredential, loadSecrets } from "./config.ts";

const virtualId = "virtual:azure-env";
const resolvedVirtualId = `\0${virtualId}`;

/** Fetch Key Vault secrets, mint an Azure token, and inline both for the browser. */
function azureEnvPlugin(mode: string): Plugin {
  return {
    name: "azure-env",
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return;

      const env = loadEnv(mode, process.cwd(), "");
      const credential = buildCredential(env);
      const [secrets, token] = await Promise.all([
        loadSecrets(env, credential),
        credential.getToken("https://ai.azure.com/.default"),
      ]);
      if (!token?.token) {
        throw new Error("Could not get an Azure token for the Service Principal. Restart Vite to retry.");
      }

      return [
        `export const azureToken = ${JSON.stringify(token.token)};`,
        `export const azureTokenExpiresOn = ${token.expiresOnTimestamp};`,
        `export const agentEndpoint = ${JSON.stringify(secrets.agentEndpoint)};`,
        `export const agentName = ${JSON.stringify(secrets.agentName)};`,
        `export const tavilyApiKey = ${JSON.stringify(secrets.tavilyApiKey)};`,
      ].join("\n");
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), azureEnvPlugin(mode)],
}));
