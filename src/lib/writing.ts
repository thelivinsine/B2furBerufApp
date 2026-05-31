import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type { ThemeId, WeaknessCategory } from "@/types";

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
