import type { SrsCard } from "@/types";

/**
 * The collection-level mapping (redesign Phase 2.4). A pure helper that turns an
 * FSRS card's memory strength into a 1..5 "collection level", the stable game
 * contract that renders a reviewed word as a loot/collectible card. Kept
 * deliberately simple and stable: the loot-drop end screen, the future „Meine
 * Sammlung" bag view (Phase 3) and the eventual game world all read levels from
 * here, so the band boundaries must not drift once shipped.
 *
 * Strength is the card's FSRS `stability` (days until recall decays to 90%),
 * falling back to the legacy SM-2 `interval` for cards not yet touched by FSRS,
 * mirroring `mastery()` in engine/srs.ts. A never-reviewed word (no card, or
 * reps 0) is level 0 = "uncollected"; every reviewed word is at least level 1.
 */

export const MAX_LEVEL = 5;

/** Lower stability bound (in days) for each level 1..5. */
const LEVEL_MIN_DAYS = [0, 1, 7, 21, 60] as const;

/** Collection level 0..5 for a card. 0 = uncollected (never reviewed). */
export function cardLevel(card: SrsCard | undefined): number {
  if (!card || card.reps === 0) return 0;
  const days = card.stability ?? card.interval ?? 0;
  let level = 1;
  for (let i = LEVEL_MIN_DAYS.length - 1; i >= 0; i--) {
    if (days >= LEVEL_MIN_DAYS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

/** Did the review that took `before` -> `after` raise the collection level? */
export function leveledUp(before: SrsCard | undefined, after: SrsCard | undefined): boolean {
  return cardLevel(after) > cardLevel(before);
}
