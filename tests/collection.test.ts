import { describe, it, expect } from "vitest";
import { cardLevel, leveledUp, MAX_LEVEL } from "@/engine/collection";
import type { SrsCard } from "@/types";

/** Minimal reviewed card at a given FSRS stability (days). */
function card(stability: number, extra: Partial<SrsCard> = {}): SrsCard {
  return { ease: 2.5, interval: Math.round(stability), reps: 1, due: "2026-01-01", stability, ...extra };
}

describe("cardLevel — collection band mapping", () => {
  it("returns 0 (uncollected) for a missing or never-reviewed card", () => {
    expect(cardLevel(undefined)).toBe(0);
    expect(cardLevel({ ease: 2.5, interval: 0, reps: 0, due: "2026-01-01" })).toBe(0);
  });

  it("maps stability bands to levels 1..5 at the boundaries", () => {
    expect(cardLevel(card(0.2))).toBe(1); // < 1 day
    expect(cardLevel(card(0.999))).toBe(1);
    expect(cardLevel(card(1))).toBe(2); // 1..<7
    expect(cardLevel(card(6.9))).toBe(2);
    expect(cardLevel(card(7))).toBe(3); // 7..<21
    expect(cardLevel(card(20.9))).toBe(3);
    expect(cardLevel(card(21))).toBe(4); // 21..<60
    expect(cardLevel(card(59.9))).toBe(4);
    expect(cardLevel(card(60))).toBe(5); // >= 60
    expect(cardLevel(card(9999))).toBe(5);
  });

  it("never exceeds MAX_LEVEL", () => {
    expect(cardLevel(card(1e9))).toBeLessThanOrEqual(MAX_LEVEL);
  });

  it("falls back to the legacy SM-2 interval when stability is absent", () => {
    const legacy: SrsCard = { ease: 2.5, interval: 30, reps: 4, due: "2026-01-01" };
    expect(legacy.stability).toBeUndefined();
    expect(cardLevel(legacy)).toBe(4); // interval 30 -> band [21,60)
  });
});

describe("leveledUp", () => {
  it("is true only when the collection level increases", () => {
    expect(leveledUp(card(6), card(8))).toBe(true); // Lv2 -> Lv3
    expect(leveledUp(card(8), card(9))).toBe(false); // Lv3 -> Lv3
    expect(leveledUp(undefined, card(0.5))).toBe(true); // uncollected -> Lv1
    expect(leveledUp(card(30), card(10))).toBe(false); // strength dropped
  });
});
