import { supabase } from "@/lib/supabase";
import { TURNSTILE_ENABLED, useAuthStore } from "@/store/useAuthStore";
import type { ThemeId, WeaknessCategory } from "@/types";

export interface WritingHistoryEntry {
  id: string;
  created_at: string;
  theme: ThemeId;
  length: WritingLength;
  /** The text the learner actually submitted, so the history shows their work. */
  text: string;
  weakness: WeaknessCategory;
  insight: string;
  cached: boolean;
}

export type WritingLength = "short" | "long";

export interface WritingEvalResult {
  ok: boolean;
  /** The single prioritised weakness category. */
  weakness?: WeaknessCategory;
  /** The one actionable insight shown to the learner (German). */
  insight?: string;
  /** Weakness → practice deep-link key (usually equals `weakness`). */
  practiceArea?: WeaknessCategory;
  /** True when served from the input-hash cache (no AI cost). */
  cached?: boolean;
  model?: string | null;
  /** Set when the daily per-user or global monthly cap is hit. */
  limitReached?: boolean;
  /** Graceful, user-facing message (e.g. limit reached). */
  message?: string;
}

/** Fetch the current user's past writing evaluations, newest first. */
export async function getWritingHistory(limit = 30): Promise<WritingHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from("writing_evaluations")
      .select("id, created_at, theme, length, text, weakness, insight, cached")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as WritingHistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * Delete one of the user's writing submissions (GDPR per-item erasure). Returns
 * true only when a row was actually removed. RLS (policy `writing_delete_own`,
 * migration 0003) restricts this to the caller's own rows; if that policy is
 * missing the delete affects 0 rows and this returns false (a loud failure,
 * never a silent no-op).
 */
export async function deleteWritingEvaluation(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("writing_evaluations")
      .delete()
      .eq("id", id)
      .select("id");
    return !error && !!data && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * Submit a piece of writing for evaluation. Calls the `evaluate-writing` Edge
 * Function (which holds all secrets). Writing requires an authenticated user,
 * so if the learner is fully signed out we transparently create a guest
 * session first.
 */
export async function evaluateWriting(input: {
  theme: ThemeId;
  length: WritingLength;
  text: string;
}): Promise<WritingEvalResult> {
  const auth = useAuthStore.getState();
  if (auth.status === "signedOut" || !auth.session) {
    // When Turnstile is active, guest sign-in needs a captcha token we can't
    // obtain silently here. Send the learner through the captcha-gated auth UI
    // instead of failing the anonymous sign-in opaquely.
    if (TURNSTILE_ENABLED) {
      return {
        ok: false,
        message: "Bitte melde dich an, um die Schreibbewertung zu nutzen.",
      };
    }
    await auth.signInAsGuest();
  }

  try {
    const { data, error } = await supabase.functions.invoke<WritingEvalResult>(
      "evaluate-writing",
      { body: input },
    );
    if (error) {
      return {
        ok: false,
        message:
          "Die Bewertung ist momentan nicht verfügbar. Bitte versuche es später erneut.",
      };
    }
    return data ?? { ok: false, message: "Keine Antwort erhalten." };
  } catch {
    return {
      ok: false,
      message:
        "Verbindung fehlgeschlagen. Prüfe deine Internetverbindung und versuche es erneut.",
    };
  }
}
