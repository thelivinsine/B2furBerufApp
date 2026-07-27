import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";
import type { WritingMode } from "./resumeDraft";

/**
 * Continuous autosave for the Schreiben trainers.
 *
 * `resumeDraft.ts` is the sign-in hand-off (one draft, stashed deliberately,
 * consumed once, `resume: true` sends AppShell back to /writing). This is the
 * different, quieter job: while the learner types, keep the current draft of
 * each mode on disk so NO reload can lose it. A deploy adopting itself, a
 * chunk-load self-heal, iOS discarding a backgrounded tab, or the learner
 * pulling to refresh all land on the same restore path.
 *
 * Separate key and separate record on purpose: an autosaved draft must never
 * trigger the sign-in resume redirect, and Fokus / Kurz / Lang each keep their
 * own draft so switching tabs is not destructive.
 */

const KEY = "genauly.writing.autosave";
/** Drafts older than a week are stale enough that restoring them would confuse. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface AutosavedDraft {
  mode: WritingMode;
  text: string;
  /** Guided modes: the exact Aufgabe the text was written against. */
  theme?: ThemeId;
  length?: WritingLength;
  promptIndex?: number;
  savedAt: number;
}

type Store = Partial<Record<WritingMode, AutosavedDraft>>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota: autosave is best-effort, never breaks writing. */
  }
}

/** Store the current draft for one mode. An empty text clears it instead. */
export function saveAutosavedDraft(draft: Omit<AutosavedDraft, "savedAt">): void {
  if (!draft.text.trim()) {
    clearAutosavedDraft(draft.mode);
    return;
  }
  write({ ...read(), [draft.mode]: { ...draft, savedAt: Date.now() } });
}

/** The last draft for one mode, or null when there is none / it is stale. */
export function loadAutosavedDraft(mode: WritingMode): AutosavedDraft | null {
  const draft = read()[mode];
  if (!draft || typeof draft.text !== "string" || !draft.text.trim()) return null;
  if (!draft.savedAt || Date.now() - draft.savedAt > MAX_AGE_MS) return null;
  return draft;
}

export function clearAutosavedDraft(mode: WritingMode): void {
  const store = read();
  if (!(mode in store)) return;
  delete store[mode];
  write(store);
}
