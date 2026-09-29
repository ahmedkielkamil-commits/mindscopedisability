import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

const envDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const virtualId = "virtual:azure-env";
const resolvedVirtualId = `\0${virtualId}`;

function functionConfig(env: Record<string, string>) {
  const functionKey = env.function_key || env.funtion_key || "";
  const raw = (env.default_domain || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const slash = raw.indexOf("/");
  const host = slash === -1 ? raw : raw.slice(0, slash);
  const path = slash === -1 ? "/api/process" : raw.slice(slash);
  return {
    functionKey,
    processOrigin: host ? `https://${host}` : "",
    processUrl: host ? `https://${host}${path || "/api/process"}` : "",
  };
}

function azureEnvPlugin(mode: string): Plugin {
  return {
    name: "azure-env",
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id !== resolvedVirtualId) return;

      const env = loadEnv(mode, envDir, "");
      const fn = functionConfig(env);
      const browserProcessUrl = mode === "development" ? "/api/process" : fn.processUrl;
      const browserFunctionKey = mode === "development" ? "" : fn.functionKey;

      return [
        `export const processUrl = ${JSON.stringify(browserProcessUrl)};`,
        `export const functionKey = ${JSON.stringify(browserFunctionKey)};`,
        `export const tavilyApiKey = ${JSON.stringify(env.TAVILY_API_KEY || "")};`,
        `export const googlePlacesApiKey = ${JSON.stringify(env.GOOGLE_PLACES_API_KEY || "")};`,
      ].join("\n");
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");
  const fn = functionConfig(env);

  return {
    envDir,
    plugins: [react(), tailwindcss(), azureEnvPlugin(mode)],
    server: fn.processOrigin
      ? {
          proxy: {
            "/api/process": {
              target: fn.processOrigin,
              changeOrigin: true,
              secure: true,
              configure(proxy) {
                proxy.on("proxyReq", (proxyReq) => {
                  const url = new URL(proxyReq.path, fn.processOrigin);
                  if (fn.functionKey) {
                    url.searchParams.set("code", fn.functionKey);
                    proxyReq.setHeader("x-functions-key", fn.functionKey);
                  }
                  proxyReq.path = `${url.pathname}${url.search}`;
                });
              },
            },
          },
        }
      : undefined,
  };
});
