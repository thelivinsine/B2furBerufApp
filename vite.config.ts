import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // Relative base so the built app works under any path
  // (e.g. GitHub Pages project subpaths) without further config.
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Supabase — large (~800 KB), stable; cache independently from app code.
          if (id.includes("node_modules/@supabase")) return "vendor-supabase";
          // Recharts + D3 — only used by Analytics; keep out of the main bundle.
          if (
            id.includes("node_modules/recharts") ||
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/d3/") ||
            id.includes("node_modules/victory-vendor")
          )
            return "vendor-charts";
          // Framer Motion — used app-wide but worth caching separately.
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          // React core — tiny and stable; browsers cache indefinitely.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler/")
          )
            return "vendor-react";
          // Radix UI primitives + related UI libs.
          if (id.includes("node_modules/@radix-ui")) return "vendor-ui";
          // Everything else in node_modules (zustand, lucide, etc.).
          if (id.includes("node_modules/")) return "vendor-misc";
        },
      },
    },
  },
});
