import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";

/**
 * Persistence for an in-progress Schreibtraining draft across a sign-in.
 *
 * Writing requires a real (non-guest) account. When a signed-out / guest learner
 * clicks the primary action (Auswerten in Kurz/Lang, Korrigieren in Fokus), we
 * stash their draft here, nudge them to sign in, and resume exactly where they
 * left off afterwards. localStorage (not memory) because the Google OAuth flow is
 * a full-page redirect that wipes React state.
 */

const KEY = "genauly.writing.resume";

export type WritingMode = "fokus" | "kurz" | "lang";

export interface WritingDraft {
  /** Which surface produced the draft. Absent = a legacy guided draft. */
  mode?: WritingMode;
  /** Guided modes only (Fokus has no theme). */
  theme?: ThemeId;
  length?: WritingLength;
  /** Which prompt of the theme's random pool the draft was written against, so
   *  the resumed task matches the text (guided modes only). */
  promptIndex?: number;
  text: string;
  /** True when the learner hit the login wall mid-action and it should resume. */
  resume: boolean;
}

export function saveWritingDraft(draft: WritingDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable (private mode): resume is best-effort. */
  }
}

export function loadWritingDraft(): WritingDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as WritingDraft;
    if (!d || typeof d.text !== "string") return null;
    // Guided drafts need a theme; a Fokus draft is just a sentence.
    if (d.mode !== "fokus" && !d.theme) return null;
    return d;
  } catch {
    return null;
  }
}

export function clearWritingDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
