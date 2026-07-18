import type { SrsCard } from "@/types";

/**
 * Shipped content ids are PERMANENT (data-architecture review, s130).
 *
 * Learner progress is keyed by content id — FSRS cards (`srs`), Redemittel
 * practice counts, saved words, done scenarios/missions — locally AND in the
 * cloud `progress` row. Renaming or deleting a shipped id therefore orphans
 * real learning history with no error anywhere. The contract:
 *
 * 1. Never rename or delete a shipped content id. Retire content by removing
 *    it from the app surface, not by deleting its id.
 * 2. When a rename is truly unavoidable, map it here (`"old_id": "new_id"`)
 *    and KEEP the entry forever: the progress store applies the map on
 *    rehydrate (persist migrate) and cloudSync applies it to incoming remote
 *    rows, so history follows the item across devices and old clients.
 *
 * `pnpm lint:content` validates the map: a source must be gone from the banks,
 * a target must resolve (chains allowed) to a live content id.
 */
export const ID_RENAMES: Record<string, string> = {
  // "v_old_example": "v_new_example",
};

const MAX_CHAIN = 20;

/** Follow a rename chain (a -> b -> c) to its terminal id. Cycle-safe. */
export function resolveContentId(id: string, renames: Record<string, string> = ID_RENAMES): string {
  let cur = id;
  for (let hops = 0; hops < MAX_CHAIN && cur in renames; hops++) cur = renames[cur];
  return cur;
}

/**
 * Remap a record's id keys through the rename table. Returns the input object
 * unchanged (same reference) when nothing needs remapping, so persist migrate
 * stays free for the common case. On a key collision (old and new id both
 * carry data) `pick` chooses the survivor; default keeps the existing value.
 */
export function remapRecordIds<T>(
  rec: Record<string, T>,
  renames: Record<string, string> = ID_RENAMES,
  pick: (a: T, b: T) => T = (a) => a,
): Record<string, T> {
  if (Object.keys(renames).length === 0) return rec;
  let changed = false;
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(rec)) {
    const target = resolveContentId(key, renames);
    if (target !== key) changed = true;
    out[target] = target in out ? pick(out[target], value) : value;
  }
  return changed ? out : rec;
}

/** Remap an id array, deduplicating when a rename collapses two entries. */
export function remapIdArray(
  ids: string[],
  renames: Record<string, string> = ID_RENAMES,
): string[] {
  if (Object.keys(renames).length === 0) return ids;
  const out: string[] = [];
  const seen = new Set<string>();
  let changed = false;
  for (const id of ids) {
    const target = resolveContentId(id, renames);
    if (target !== id) changed = true;
    if (!seen.has(target)) {
      seen.add(target);
      out.push(target);
    } else changed = true;
  }
  return changed ? out : ids;
}

/** When a rename collides two FSRS cards, keep the stronger one (mirrors
 *  cloudSync's mergeSrs rule: more reps wins, tie broken by later due). */
export function pickStrongerCard(a: SrsCard, b: SrsCard): SrsCard {
  if (b.reps > a.reps || (b.reps === a.reps && b.due > a.due)) return b;
  return a;
}

/** The slice of progress state that is keyed by content ids. */
export interface IdKeyedProgress {
  srs: Record<string, SrsCard>;
  redemittelSeen: Record<string, number>;
  savedWords: string[];
  scenariosDone: string[];
  missionsDone: string[];
  keyItems: string[];
}

/**
 * Apply the rename table to every id-keyed field of a progress snapshot.
 * Pure; returns the input unchanged when the table is empty or nothing
 * matches. Used by the progress store's persist migrate and by cloudSync on
 * incoming remote rows.
 */
export function remapProgressIds<S extends Partial<IdKeyedProgress>>(
  state: S,
  renames: Record<string, string> = ID_RENAMES,
): S {
  if (Object.keys(renames).length === 0) return state;
  const next = { ...state };
  if (state.srs) next.srs = remapRecordIds(state.srs, renames, pickStrongerCard);
  if (state.redemittelSeen)
    next.redemittelSeen = remapRecordIds(state.redemittelSeen, renames, Math.max);
  if (state.savedWords) next.savedWords = remapIdArray(state.savedWords, renames);
  if (state.scenariosDone) next.scenariosDone = remapIdArray(state.scenariosDone, renames);
  if (state.missionsDone) next.missionsDone = remapIdArray(state.missionsDone, renames);
  if (state.keyItems) next.keyItems = remapIdArray(state.keyItems, renames);
  return next;
}
