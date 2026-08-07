import { describe, it, expect } from "vitest";
import { isFullRun, toPractices } from "@/features/pruefung/PruefungHub";
import { moduleRuns } from "@/features/pruefung/verlauf";
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

describe("toPractices", () => {
  it("names the module a single-part run belongs to", () => {
    expect(toPractices(rec({ hoeren: 61 }, 61))).toEqual([
      { id: "r|hoeren", date: "2026-08-04", part: "hoeren", pct: 61 },
    ]);
  });

  it("keeps an unscored practice, with a null percentage", () => {
    expect(toPractices(rec({ sprechen: null }))[0]?.pct).toBeNull();
  });

  it("is empty when the record names no known part", () => {
    expect(toPractices(rec({}))).toEqual([]);
  });

  it("keeps EVERY module a partial run sat, in exam order (s194 audit P32)", () => {
    // The single-part version dropped the Hoeren score on the floor.
    expect(toPractices(rec({ hoeren: 61, lesen: 84 }))).toEqual([
      { id: "r|lesen", date: "2026-08-04", part: "lesen", pct: 84 },
      { id: "r|hoeren", date: "2026-08-04", part: "hoeren", pct: 61 },
    ]);
  });
});

/**
 * The per-module Verlauf (s200, founder: "go with verlauf on all four"). Each
 * module page lists ITS OWN sittings, and a Modelltest is never one of them:
 * the full run belongs to the Modelltest Verlauf alone, which is the same rule
 * `isFullRun` pins above, applied one level down.
 */
describe("moduleRuns", () => {
  const at = (date: string, parts: Record<string, number | null>, level = "B2") => ({
    ...rec(parts),
    id: date,
    date,
    level,
  });

  it("keeps only this module's practice, newest first", () => {
    const runs = moduleRuns(
      [at("2026-08-01", { lesen: 55 }), at("2026-08-02", { hoeren: 61 }), at("2026-08-03", { lesen: 72 })],
      "lesen",
    );
    expect(runs.map((r) => r.pct)).toEqual([72, 55]);
    expect(runs[0]).toMatchObject({ id: "2026-08-03|lesen", date: "2026-08-03", level: "B2" });
  });

  it("never lists a Modelltest, which belongs to the run history", () => {
    expect(
      moduleRuns([at("2026-08-04", { lesen: 80, hoeren: 70, schreiben: 75, sprechen: 72 })], "lesen"),
    ).toEqual([]);
  });

  it("keeps a sitting the grader could not score, with a null percentage", () => {
    expect(moduleRuns([at("2026-08-05", { lesen: null })], "lesen")[0]?.pct).toBeNull();
  });
});
