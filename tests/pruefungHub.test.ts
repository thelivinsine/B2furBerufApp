import { describe, it, expect } from "vitest";
import { isFullRun, toPractice } from "@/features/pruefung/PruefungHub";
import type { MockExamRecord } from "@/store/useProgressStore";

/**
 * Pins the s190 split of the one `mockExams` collection into the two lists the
 * Prüfung hub shows: a Modelltest is a run that sat all four parts, a module
 * practice is a run that sat one. Before the split a single Lesen drill counted
 * as a Modelltest result, which put a practice score in the run history and its
 * own percentage into "Bester".
 */

const rec = (parts: Record<string, number | null>, total: number | null = null): MockExamRecord => ({
  id: "r",
  level: "B2",
  date: "2026-08-04",
  total,
  parts,
});

describe("isFullRun", () => {
  it("is true only when all four parts were sat", () => {
    expect(
      isFullRun(rec({ lesen: 80, hoeren: 70, schreiben: 75, sprechen: 72 }, 74)),
    ).toBe(true);
  });

  it("counts a part that was sat but not scored", () => {
    // A Schreiben the AI could not grade still means the part was sat.
    expect(
      isFullRun(rec({ lesen: 80, hoeren: 70, schreiben: null, sprechen: 72 })),
    ).toBe(true);
  });

  it("is false for a single-module run", () => {
    expect(isFullRun(rec({ lesen: 84 }, 84))).toBe(false);
  });

  it("is false for a partial run", () => {
    expect(isFullRun(rec({ lesen: 84, hoeren: 61 }))).toBe(false);
  });
});

describe("toPractice", () => {
  it("names the module a single-part run belongs to", () => {
    expect(toPractice(rec({ hoeren: 61 }, 61))).toEqual({
      id: "r",
      date: "2026-08-04",
      part: "hoeren",
      pct: 61,
    });
  });

  it("keeps an unscored practice, with a null percentage", () => {
    expect(toPractice(rec({ sprechen: null }))?.pct).toBeNull();
  });

  it("returns null when the record names no known part", () => {
    expect(toPractice(rec({}))).toBeNull();
  });
});
