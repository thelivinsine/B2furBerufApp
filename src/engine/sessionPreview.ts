import type { SrsCard } from "@/types";
import { vocabulary } from "@/data/vocabulary";
import { mastery, dueCount } from "@/engine/srs";
import { clamp } from "@/lib/utils";

/**
 * The light, deterministic half of the session engine. The eagerly-loaded
 * Dashboard only needs the "here's what's in today's session" line, so this
 * module deliberately imports NOTHING beyond the vocabulary bank: keeping it
 * separate from `engine/session.ts` keeps the quiz builder and the
 * collocations/redemittel/grammar banks out of the main bundle (they load
 * with the session route). `engine/session.ts` re-exports everything here, so
 * lazy consumers can keep importing from one place.
 */

/** Rough blocks-per-session for a target minute length (~1.6 blocks/min). */
export function targetBlocks(minutes: number): number {
  return clamp(Math.round(minutes * 1.6), 6, 18);
}

/**
 * The CEFR band with the lowest mean mastery among *started* cards (the
 * learner's current weak spot), or null when nothing has been studied yet.
 */
export function weakestBand(srs: Record<string, SrsCard>): string | null {
  const sum: Record<string, number> = {};
  const count: Record<string, number> = {};
  for (const v of vocabulary) {
    if (!v.cefr || !srs[v.id]) continue; // only started cards inform the weak band
    sum[v.cefr] = (sum[v.cefr] ?? 0) + mastery(srs[v.id]);
    count[v.cefr] = (count[v.cefr] ?? 0) + 1;
  }
  let weak: string | null = null;
  let lowest = Infinity;
  for (const band in count) {
    const mean = sum[band] / count[band];
    if (mean < lowest) {
      lowest = mean;
      weak = band;
    }
  }
  return weak;
}

/** Compose the one-line "what's in this session" preview from counts. */
export function buildPreview(due: number, band: string | null, redeCount: number): string {
  const parts: string[] = [];
  parts.push(due > 0 ? `${due} fällige ${due === 1 ? "Wort" : "Wörter"}` : "Neue Wörter");
  if (band) parts.push(`Schwachstelle: ${band}`);
  if (redeCount > 0) parts.push(`${redeCount} Redemittel`);
  return parts.join(" · ");
}

export interface SessionPreview {
  minutes: number;
  blockCount: number;
  preview: string;
  /** True once the learner has any started cards (drives hero copy). */
  hasHistory: boolean;
}

/**
 * Deterministic preview for the Heute hero: no sampling, so the displayed line
 * is stable across renders and matches what a freshly built session contains.
 */
export function sessionPreview(opts: {
  srs: Record<string, SrsCard>;
  minutes: number;
}): SessionPreview {
  const { srs, minutes } = opts;
  const due = dueCount(srs);
  const band = weakestBand(srs);
  return {
    minutes,
    blockCount: targetBlocks(minutes),
    preview: buildPreview(due, band, 1),
    hasHistory: Object.keys(srs).length > 0,
  };
}
