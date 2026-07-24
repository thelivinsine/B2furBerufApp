import type { ProvenanceContentType } from "@/types";
import raw from "./reviewQueue.json";

/**
 * Typed parser for the generated review-queue sidecar
 * (`pnpm build:review-queue` → reviewQueue.json). The file stores compact tuple
 * rows to stay small; this module turns them into named objects. The score
 * components come straight from the pure `scripts/review-score.mjs` at build
 * time; the UI hydrates label / reference / tier / flags from the bundled
 * provenance + verification maps by id (so the JSON carries no duplicated
 * content). Column order is fixed by the build script and pinned here.
 */

export interface ScoredItem {
  id: string;
  type: ProvenanceContentType;
  score: number;
  /** 0 = clean, up to 1 = hard machine defect. */
  defect: number;
  /** 0..1 how many learners the item is in front of. */
  traffic: number;
  /** 0..1 machine confidence (higher = less need to review). */
  confidence: number;
  /** 0..1 bank criticality. */
  bank: number;
}

interface RawQueue {
  generatedAt: string;
  registerRows: number;
  draftRows: number;
  columns: string[];
  rows: [string, ProvenanceContentType, number, number, number, number, number][];
}

const data = raw as RawQueue;

export const reviewQueueGeneratedAt: string = data.generatedAt;
export const reviewQueueRegisterRows: number = data.registerRows;
export const reviewQueueDraftRows: number = data.draftRows;

/** Every scored draft item, already sorted highest-priority-first at build time. */
export const scoredItems: ScoredItem[] = data.rows.map((r) => ({
  id: r[0],
  type: r[1],
  score: r[2],
  defect: r[3],
  traffic: r[4],
  confidence: r[5],
  bank: r[6],
}));
