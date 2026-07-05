import { describe, it, expect } from "vitest";
import type { SrsCard } from "@/types";
import { vocabulary } from "@/data/vocabulary";
import { cityProgress, LIT_THRESHOLD } from "@/components/city/mastery";

/** SRS card that scores as fully mastered (high stability, many reps). */
function masteredCard(): SrsCard {
  return { ease: 2.8, interval: 120, reps: 8, due: "2099-01-01", stability: 120 };
}

function progressFor(srs: Record<string, SrsCard>, id: string) {
  const p = cityProgress(srs).find((b) => b.building.id === id);
  expect(p).toBeDefined();
  return p!;
}

describe("cityProgress — building mastery resolution", () => {
  it("starts fully unlit on a fresh profile", () => {
    for (const p of cityProgress({})) {
      expect(p.lit).toBe(false);
      expect(p.mastered).toBe(0);
    }
  });

  it("counts every vocabulary word into at most one building", () => {
    const total = cityProgress({}).reduce((sum, p) => sum + p.total, 0);
    expect(total).toBeLessThanOrEqual(vocabulary.length);
    // The current banks are fully covered by the six buildings.
    expect(total).toBe(vocabulary.length);
  });

  it("keeps the future packs (bank, wohnhaus) empty and inert", () => {
    for (const id of ["bank", "wohnhaus"]) {
      const p = progressFor({}, id);
      expect(p.total).toBe(0);
      expect(p.weakestTheme).toBeNull();
      expect(p.lit).toBe(false);
    }
  });

  it("lights the Bürgeramt once the behoerde pack crosses the threshold", () => {
    const behoerdeWords = vocabulary.filter((w) => w.themeId === "behoerde");
    expect(behoerdeWords.length).toBeGreaterThan(0);

    const enough = Math.ceil(behoerdeWords.length * LIT_THRESHOLD);
    const srs: Record<string, SrsCard> = {};
    for (const w of behoerdeWords.slice(0, enough)) srs[w.id] = masteredCard();

    const amt = progressFor(srs, "buergeramt");
    expect(amt.themes).toEqual(["behoerde"]);
    expect(amt.lit).toBe(true);

    // behoerde mastery must not leak into any other building
    const others = cityProgress(srs).filter((p) => p.building.id !== "buergeramt");
    for (const p of others) expect(p.mastered).toBe(0);
  });

  it("picks the least-mastered contributing theme as the session target", () => {
    const meetings = vocabulary.filter((w) => w.themeId === "meetings");
    const srs: Record<string, SrsCard> = {};
    for (const w of meetings) srs[w.id] = masteredCard();

    const buero = progressFor(srs, "buero");
    expect(buero.themes).toContain("meetings");
    expect(buero.weakestTheme).not.toBe("meetings");
    expect(buero.weakestTheme).not.toBeNull();
  });
});
