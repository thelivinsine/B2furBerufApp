/**
 * Public Supabase connection config.
 *
 * The URL and the *publishable* (anon) key are designed to be exposed in the
 * browser — they are safe to commit because every table is protected by
 * Row-Level Security (owner-only policies). NEVER put service-role keys,
 * the Anthropic key, or any other secret here; those live only in Supabase
 * Edge Function secrets (see docs/PHASE2_SETUP.md).
 *
 * Values can be overridden at build time via Vite env vars
 * (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) for local dev or staging.
 */
const FALLBACK_URL = "https://stkfdavpjflpqoxjunnj.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_xeEuhqPfkxt9wF0PyRKfzg_kRx9S-Hv";

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  FALLBACK_ANON_KEY;

/** True when we have a usable Supabase target (always true with the fallback). */
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
