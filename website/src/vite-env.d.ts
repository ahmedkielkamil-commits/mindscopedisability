/// <reference types="vite/client" />

declare module "virtual:azure-env" {
  export const azureToken: string;
  export const azureTokenExpiresOn: number;
  export const agentEndpoint: string;
  export const agentName: string;
  export const tavilyApiKey: string;
}
