import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  // Relative base so the built app works under any path
  // (e.g. GitHub Pages project subpaths) without further config.
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Generate the service worker and manifest into the dist root.
      // workbox handles precaching all built assets automatically.
      workbox: {
        // Cache everything vite emits. The glob must cover hashed asset
        // filenames (js/css/html) as well as the root index.html.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // Navigate fallback so direct hash-route URLs don't 404 on reload.
        navigateFallback: "index.html",
        // Exclude the GitHub Pages redirect page from the fallback.
        navigateFallbackDenylist: [/^\/404\.html$/],
      },
      manifest: {
        name: "Genauly — German that clicks",
        short_name: "Genauly",
        description:
          "Interactive prep platform for the Goethe / telc Deutsch B2 Beruf speaking exam.",
        theme_color: "#6366f1",
        background_color: "#0f1729",
        display: "standalone",
        scope: "./",
        start_url: "./",
        orientation: "portrait-primary",
        lang: "de",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
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
          // React core + router — tiny and stable; browsers cache indefinitely.
          // IMPORTANT: react-router depends on @remix-run/router, so both MUST
          // live in the SAME chunk as React. If @remix-run/router falls through
          // to vendor-misc, react-router (here) imports it from vendor-misc
          // while vendor-misc imports React from here — a circular chunk. That
          // cycle makes the browser read a binding in its temporal dead zone
          // during module evaluation, throwing a ReferenceError *before*
          // createRoot() runs. The error is silent (module script, pre-React,
          // so the RootErrorBoundary can't catch it) → blank page in prod only.
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run/router") ||
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
