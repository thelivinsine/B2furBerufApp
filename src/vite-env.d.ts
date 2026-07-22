/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Build stamps injected by Vite `define` (see vite.config.ts). Used by the
// admin center's live-deploy widget to compare the running build with `main`.
declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;
