import type { ContentCefr } from "@/types";
import type { CefrLevel } from "@/store/useSettingsStore";

export const CEFR_ORDER: ContentCefr[] = ["A2", "B1.1", "B1.2", "B2.1", "B2.2", "C1"];

export const CEFR_LABELS: Record<ContentCefr, string> = {
  A2: "A2",
  "B1.1": "B1.1",
  "B1.2": "B1.2",
  "B2.1": "B2.1",
  "B2.2": "B2.2",
  C1: "C1",
};

export function cefrLabel(level: ContentCefr): string {
  return CEFR_LABELS[level];
}

export function difficultyToBand(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1:
      return "B1";
    case 2:
      return "B2.1";
    case 3:
      return "B2.2·C1";
  }
}

/** The top content band covered by each coarse onboarding level. */
const LEVEL_TOP_BAND: Record<CefrLevel, ContentCefr> = {
  A2: "A2",
  B1: "B1.2",
  B2: "B2.2",
  C1: "C1",
};

/**
 * Tier-0 personalized default (UX overhaul Phase 2): the CEFR bands a
 * Bibliothek list surface shows before the learner touches a filter, one band
 * above their stored level so there's room to grow instead of an unfiltered
 * full-bank pile. Untagged items always roll up regardless of this default.
 */
export function defaultVisibleBands(level: CefrLevel): ContentCefr[] {
  const topIdx = CEFR_ORDER.indexOf(LEVEL_TOP_BAND[level]);
  const visibleIdx = Math.min(topIdx + 1, CEFR_ORDER.length - 1);
  return CEFR_ORDER.slice(0, visibleIdx + 1);
}

/** Label for the quiet "show harder items too" escape, or null when nothing is hidden. */
export function hiddenBandsLabel(level: CefrLevel): string | null {
  const visible = defaultVisibleBands(level);
  const hidden = CEFR_ORDER.filter((c) => !visible.includes(c));
  return hidden.length ? hidden.map(cefrLabel).join(" · ") : null;
}
