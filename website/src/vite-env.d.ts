/// <reference types="vite/client" />

declare module "virtual:azure-env" {
  export const processUrl: string;
  export const functionKey: string;
  export const tavilyApiKey: string;
  export const googlePlacesApiKey: string;
  export const contactEmail: string;
}
