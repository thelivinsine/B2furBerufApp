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
  },
});

export { SUPABASE_CONFIGURED };
