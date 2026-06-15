import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";

/**
 * Persistence for an in-progress Schreibtraining draft across a sign-in.
 *
 * Writing now requires a real (non-guest) account. When a signed-out / guest
 * learner clicks "Auswerten", we stash their draft here, nudge them to sign in,
 * and resume exactly where they left off afterwards. localStorage (not memory)
 * because the Google OAuth flow is a full-page redirect that wipes React state.
 */

const KEY = "genauly.writing.resume";

export interface WritingDraft {
  theme: ThemeId;
  length: WritingLength;
  text: string;
  /** True when the learner hit the login wall mid-evaluation and the
   *  evaluation should resume automatically once they are signed in. */
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
    if (!d || typeof d.text !== "string" || !d.theme) return null;
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
