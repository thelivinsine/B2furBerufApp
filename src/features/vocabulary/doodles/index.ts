import type { ComponentType } from "react";

/**
 * Fused-doodle registry (Artikel-Visuals Phase 2). This entry module is the
 * ONLY thing app code imports eagerly: a plain id list plus a loader that
 * pulls the actual SVG art (`./art`) in via dynamic import, so the drawings
 * ride in their own lazy chunk that loads the first time a card WITH a doodle
 * is flipped. Cards without an id here are untouched (no empty slot).
 *
 * Batch 1 (plan §4, founder rule: high frequency AND useful for Kapitel 1):
 * the 10 nouns the Kapitel-1 missions reference directly, then the 10
 * highest-Zipf nouns from the Kapitel-1 mission themes with the das-balance
 * override. Final tally 5 der / 11 die / 4 das; the per-word list with
 * articles is recorded in `docs/plans/ARTIKEL_VISUALS_PLAN.md` §4.
 *
 * Growing the bank = add the scene in `./art.tsx` + the id here (keep both in
 * sync; `tests/doodles.test.ts` fails on drift or on a wrong-gender doodle).
 */
export const DOODLE_IDS = [
  // Kapitel-1 mission nouns
  "v_beratung",
  "v_bescheid",
  "v_fahrkarte",
  "v_gebuehr",
  "v_kunde",
  "v_mietvertrag",
  "v_personalausweis",
  "v_rechnung",
  "v_vollmacht",
  "v_wohnungsgeberbestaetigung",
  // High-frequency Kapitel-1-theme nouns
  "v_programm",
  "v_hotel",
  "v_verfahren",
  "v_geraet",
  "v_it_sicherheit",
  "v_daten",
  "v_verbindung",
  "v_version",
  "v_funktion",
  "v_anschluss",
] as const;

const IDS = new Set<string>(DOODLE_IDS);

/** Whether a vocab item has fused-doodle art (synchronous, no art loaded). */
export function hasDoodle(contentId: string): boolean {
  return IDS.has(contentId);
}

/**
 * Load the doodle component for a content id, or null when none is
 * registered. The first call fetches the lazy art chunk; later calls reuse it.
 */
export async function loadDoodle(contentId: string): Promise<ComponentType | null> {
  if (!IDS.has(contentId)) return null;
  const { DOODLES } = await import("./art");
  return DOODLES[contentId]?.Component ?? null;
}
