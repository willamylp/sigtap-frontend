import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Em dev, encaminha /api para o backend Django local quando VITE_API_BASE_URL
    // for relativo (ex.: "/api/v1/sigtap"). Em produção aponte VITE_API_BASE_URL
    // para a URL absoluta da API.
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_PROXY ?? "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
