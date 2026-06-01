import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURED, SUPABASE_URL } from "./supabaseConfig";

/**
 * Singleton Supabase client. The app is offline-first: if Supabase is ever
 * unreachable the UI keeps working from the localStorage cache, so callers
 * should treat every network call as best-effort and tolerate failure.
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE returns the OAuth result as a `?code=` query param. The default
    // implicit flow returns tokens in the URL *hash*, which collides with our
    // HashRouter (it rewrites the hash to a route on load and wipes the tokens
    // before they can be read) — so Google sign-in never establishes a session.
    flowType: "pkce",
  },
});

export { SUPABASE_CONFIGURED };
