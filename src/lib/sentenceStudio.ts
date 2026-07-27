import { supabase } from "@/lib/supabase";
import { TURNSTILE_ENABLED, useAuthStore } from "@/store/useAuthStore";
import type { GrammarTuple } from "@/features/writing/fokus/grammarDimensions";

/**
 * Client for the Fokus "Satzlabor" (Schreibtraining redesign, plan:
 * docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md). Two operations, each backed by a
 * cost-guarded Edge Function that holds every secret:
 *   - checkSentence     -> `check-sentence`     (correct + detect grammar)
 *   - transformSentence -> `transform-sentence` (transform along a grammar tuple)
 *
 * Like the writing coach, both require an authenticated user; a fully signed-out
 * learner is transparently given a guest session first (unless Turnstile gates
 * guest sign-in, in which case we surface a sign-in nudge instead of failing
 * opaquely). The UI degrades gracefully when the functions are not yet deployed:
 * every failure returns `{ ok: false, message }`, never a throw.
 */

/** One detected sentence from a correction. */
export interface DetectedSentence {
  text: string;
  voice: string;
  tense: string;
  mood: string;
}

export interface CheckResult {
  ok: boolean;
  /** Row id of the persisted check, threaded into transform requests. */
  checkId?: string;
  /** The AI-corrected text (canonical form transforms derive from). */
  corrected?: string;
  /** False when the input was already correct. */
  hasErrors?: boolean;
  /** Per-sentence detected grammar (segmented from the corrected text). */
  sentences?: DetectedSentence[];
  cached?: boolean;
  limitReached?: boolean;
  message?: string;
}

export interface TransformResult {
  ok: boolean;
  /** False when the requested transform does not apply to this sentence. */
  applicable?: boolean;
  /** Machine reason when applicable is false (maps to REFUSAL_COPY). */
  reason?: string;
  /** The transformed sentence (empty when applicable is false). */
  transformed?: string;
  /** One-line German explanation of what changed. */
  note?: string;
  /** English gloss of the note, for the hold-to-peek chip. */
  noteEn?: string;
  cached?: boolean;
  limitReached?: boolean;
  message?: string;
}

/** Ensure we have a session (guest is fine), or return a nudge to sign in. */
async function ensureSession(): Promise<{ ok: true } | { ok: false; message: string }> {
  const auth = useAuthStore.getState();
  if (auth.status === "signedOut" || !auth.session) {
    if (TURNSTILE_ENABLED) {
      return { ok: false, message: "Bitte melde dich an, um das Satzlabor zu nutzen." };
    }
    await auth.signInAsGuest();
  }
  return { ok: true };
}

const UNAVAILABLE =
  "Das Satzlabor ist momentan nicht verfügbar. Bitte versuche es später erneut.";

/** Correct a single sentence and detect its grammar. */
export async function checkSentence(text: string): Promise<CheckResult> {
  const session = await ensureSession();
  if (!session.ok) return { ok: false, message: session.message };

  try {
    const { data, error } = await supabase.functions.invoke<CheckResult>("check-sentence", {
      body: { text: text.trim() },
    });
    if (error) return { ok: false, message: UNAVAILABLE };
    return data ?? { ok: false, message: "Keine Antwort erhalten." };
  } catch {
    return { ok: false, message: UNAVAILABLE };
  }
}

/** Transform an already-checked sentence along a target grammar tuple. */
export async function transformSentence(input: {
  checkId?: string;
  source: string;
  target: GrammarTuple;
  /** 0 = canonical (default); 1..2 = an alternative phrasing ("Nochmal"). */
  variant?: number;
}): Promise<TransformResult> {
  const session = await ensureSession();
  if (!session.ok) return { ok: false, message: session.message };

  try {
    const { data, error } = await supabase.functions.invoke<TransformResult>(
      "transform-sentence",
      {
        body: {
          checkId: input.checkId,
          source: input.source,
          target: input.target,
          variant: input.variant ?? 0,
        },
      },
    );
    if (error) return { ok: false, message: UNAVAILABLE };
    return data ?? { ok: false, message: "Keine Antwort erhalten." };
  } catch {
    return { ok: false, message: UNAVAILABLE };
  }
}

/* ------------------------------ Fokus history ----------------------------- */

/**
 * One checked sentence, as Verlauf shows it (s171). Every Fokus check has been
 * persisted to `sentence_checks` since s147 (migration 0009), correction and
 * detected grammar included, so this history needed no new schema and reaches
 * back over everything the learner has already practised.
 */
export interface FokusHistoryEntry {
  id: string;
  created_at: string;
  source_text: string;
  /** The corrected sentence; null when the model returned none. */
  corrected: string | null;
  has_errors: boolean;
  /** Detected form of the focal sentence: `{voice, tense, mood}`. */
  grammar: { voice?: string; tense?: string; mood?: string } | null;
}

/**
 * The learner's own checked sentences, newest first. Returns `null` on a failed
 * query (never `[]`), so Verlauf can tell "nothing practised yet" apart from
 * "could not load" — the same contract as `getWritingHistory`.
 */
export async function getFokusHistory(
  limit = 30,
): Promise<FokusHistoryEntry[] | null> {
  try {
    const { data, error } = await supabase
      .from("sentence_checks")
      .select("id, created_at, source_text, corrected, has_errors, grammar")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return null;
    return data as FokusHistoryEntry[];
  } catch {
    return null;
  }
}

/**
 * Delete one checked sentence (GDPR per-item erasure, policy
 * `sentence_checks_delete_own` from migration 0009). Returns true only when a row
 * was actually removed, so the UI fails loudly instead of pretending.
 */
export async function deleteSentenceCheck(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("sentence_checks")
      .delete()
      .eq("id", id)
      .select("id");
    return !error && !!data && data.length > 0;
  } catch {
    return false;
  }
}
