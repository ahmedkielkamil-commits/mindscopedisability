import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/process": {
        target: "https://aicall-eegeakahgvhrb3dy.westus2-01.azurewebsites.net",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
