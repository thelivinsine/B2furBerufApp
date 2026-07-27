import type { SessionPlan } from "@/types";

/**
 * Snapshot of a running Üben session, so a reload does not throw the learner
 * back to block 1 of a freshly reshuffled deck (founder report, s172).
 *
 * `sessionStorage`, deliberately, not `localStorage`: it survives a reload of
 * this tab (the deploy-adoption reload, the stale-chunk self-heal, a manual
 * refresh) and dies with the tab. A learner who launches Üben tomorrow gets a
 * new session, never a silent resume of something they walked away from.
 *
 * The snapshot is keyed by a signature of the launch parameters, so a resumed
 * run can only ever be the same session the learner was in: a different scope,
 * length or Bibliothek hand-off simply finds no match and composes fresh.
 *
 * FSRS grades and XP are written as each block is answered, so the learner's
 * record is already safe. What this restores is the part that only lived in
 * React: the composed plan, where they were in it, and the session tallies.
 */

const KEY = "genauly.session.run";
/** A run older than this is stale even inside one tab (left open overnight). */
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

export interface SessionSnapshot {
  signature: string;
  plan: SessionPlan;
  index: number;
  xpEarned: number;
  correctCount: number;
  combo: number;
  loot: { de: string; en: string; level: number; up: boolean }[];
  sttDisabled: boolean;
  savedAt: number;
}

/** Identity of a session launch: same signature == the same session. */
export function sessionSignature(parts: {
  minutes: number;
  scope?: string;
  grammarTopicId?: string;
  contentScope?: string;
  libraryIds?: string[];
  focus?: { vocabIds: string[]; redemittelIds: string[] };
}): string {
  return JSON.stringify([
    parts.minutes,
    parts.scope ?? "",
    parts.grammarTopicId ?? "",
    parts.contentScope ?? "",
    parts.libraryIds ?? [],
    parts.focus?.vocabIds ?? [],
    parts.focus?.redemittelIds ?? [],
  ]);
}

export function saveSessionSnapshot(snapshot: Omit<SessionSnapshot, "savedAt">): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
  } catch {
    /* quota / private mode: resume is best-effort, never breaks the session. */
  }
}

/** The snapshot for this exact session launch, or null when there is none. */
export function loadSessionSnapshot(signature: string): SessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as SessionSnapshot;
    if (!snap || snap.signature !== signature) return null;
    if (!snap.plan?.blocks?.length) return null;
    if (snap.index >= snap.plan.blocks.length) return null;
    if (!snap.savedAt || Date.now() - snap.savedAt > MAX_AGE_MS) return null;
    return snap;
  } catch {
    return null;
  }
}

export function clearSessionSnapshot(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
