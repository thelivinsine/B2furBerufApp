import type { SrsCard, ThemeId } from "@/types";
import { vocabulary } from "@/data/vocabulary";
import { themes } from "@/data/themes";
import { mastery } from "@/engine/srs";
import { DOMAIN_BUILDINGS, type DomainBuilding, type DomainBuildingId } from "./domain-buildings";

// ─────────────────────────────────────────────────────────────────────────
// City mastery (redesign Phase 3.2): resolves each domain building's lit
// state from the learner's SRS data. Pure and eager-path-safe: it imports
// only the vocabulary bank (already eager via engine/sessionPreview.ts) and
// the small themes registry; nothing else.
// ─────────────────────────────────────────────────────────────────────────

/** A word counts as mastered at this FSRS mastery score, the same bar the
 *  Analytics theme grid and the session composer use. */
const WORD_MASTERED = 0.8;

/** A building lights up when this share of its words is mastered. Below the
 *  Can-Do top milestones (0.8) so the city rewards solid progress, not
 *  perfection; above the first-steps milestones (0.25) so lit stays earned. */
export const LIT_THRESHOLD = 0.4;

export interface BuildingProgress {
  building: DomainBuilding;
  /** Themes whose content feeds this building (empty = future pack). */
  themes: ThemeId[];
  total: number;
  mastered: number;
  /** mastered / total, 0 when the building has no content yet. */
  ratio: number;
  lit: boolean;
  /** Least-mastered contributing theme, the natural session target for a
   *  tap on the building; null when the building has no content yet. */
  weakestTheme: ThemeId | null;
}

/** themeId → building, resolved once: explicit themeIds claim first, then
 *  domain rollup (a theme already claimed by name never double-counts). */
function themeToBuilding(): Map<ThemeId, DomainBuildingId> {
  const map = new Map<ThemeId, DomainBuildingId>();
  for (const b of DOMAIN_BUILDINGS) {
    for (const t of b.themeIds) map.set(t, b.id);
  }
  for (const b of DOMAIN_BUILDINGS) {
    for (const t of themes) {
      if (!map.has(t.id) && t.domain && b.domains.includes(t.domain)) map.set(t.id, b.id);
    }
  }
  return map;
}

export function cityProgress(srs: Record<string, SrsCard>): BuildingProgress[] {
  const claim = themeToBuilding();

  const perTheme = new Map<ThemeId, { total: number; mastered: number }>();
  for (const w of vocabulary) {
    const entry = perTheme.get(w.themeId) ?? { total: 0, mastered: 0 };
    entry.total += 1;
    if (mastery(srs[w.id]) >= WORD_MASTERED) entry.mastered += 1;
    perTheme.set(w.themeId, entry);
  }

  return DOMAIN_BUILDINGS.map((building) => {
    const owned = [...claim.entries()]
      .filter(([, id]) => id === building.id)
      .map(([themeId]) => themeId);

    let total = 0;
    let mastered = 0;
    let weakestTheme: ThemeId | null = null;
    let weakestRatio = Infinity;
    for (const themeId of owned) {
      const t = perTheme.get(themeId);
      if (!t || t.total === 0) continue;
      total += t.total;
      mastered += t.mastered;
      const ratio = t.mastered / t.total;
      if (ratio < weakestRatio) {
        weakestRatio = ratio;
        weakestTheme = themeId;
      }
    }

    const ratio = total > 0 ? mastered / total : 0;
    return {
      building,
      themes: owned,
      total,
      mastered,
      ratio,
      lit: total > 0 && ratio >= LIT_THRESHOLD,
      weakestTheme,
    };
  });
}
