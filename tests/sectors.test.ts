import { describe, it, expect } from "vitest";
import { matchesSector, sectorFirst, SECTOR_OPTIONS } from "@/lib/facets";
import { vocabById } from "@/data/vocabulary";

/**
 * Branche overhaul (s102): the untagged-= universal scope semantics that fix
 * the "das Projekt vanishes under every Branche" root cause, plus the
 * sector-first ordering. Multi-select (s104): the selection is now a string[]
 * (OR-within); an empty/absent selection matches everything. The v_projekt /
 * v_bauzaun fixtures are the plan's locked regression pair; if they fail,
 * either the semantics regressed or the data was mistagged.
 */
describe("matchesSector", () => {
  const untagged = { sectors: undefined };
  const empty = { sectors: [] as string[] };
  const bau = { sectors: ["construction"] };
  const multi = { sectors: ["engineering", "chemicals"] };

  it("no Branche selected matches everything", () => {
    expect(matchesSector(untagged, [])).toBe(true);
    expect(matchesSector(bau, undefined)).toBe(true);
    expect(matchesSector(multi, null)).toBe(true);
  });

  it("untagged/empty items are general: visible under EVERY Branche", () => {
    for (const { value } of SECTOR_OPTIONS) {
      expect(matchesSector(untagged, [value])).toBe(true);
      expect(matchesSector(empty, [value])).toBe(true);
    }
  });

  it("single-tagged items hide only under OTHER Branchen", () => {
    expect(matchesSector(bau, ["construction"])).toBe(true);
    expect(matchesSector(bau, ["it"])).toBe(false);
    expect(matchesSector(bau, ["care"])).toBe(false);
  });

  it("multi-tagged items are visible under each of their Branchen", () => {
    expect(matchesSector(multi, ["engineering"])).toBe(true);
    expect(matchesSector(multi, ["chemicals"])).toBe(true);
    expect(matchesSector(multi, ["retail"])).toBe(false);
  });

  it("OR-within: a multi-Branche selection matches an item tagged with ANY of them", () => {
    expect(matchesSector(bau, ["it", "construction"])).toBe(true);
    expect(matchesSector(bau, ["it", "care"])).toBe(false);
    expect(matchesSector(multi, ["retail", "chemicals"])).toBe(true);
  });
});

describe("sectorFirst", () => {
  const a = { id: "a", sectors: undefined };
  const b = { id: "b", sectors: ["it"] };
  const c = { id: "c", sectors: undefined };
  const d = { id: "d", sectors: ["it", "engineering"] };

  it("keeps order untouched when no Branche is selected", () => {
    expect(sectorFirst([a, b, c, d], [])).toEqual([a, b, c, d]);
  });

  it("moves tagged items first, keeping stable order within each group", () => {
    expect(sectorFirst([a, b, c, d], ["it"]).map((x) => x.id)).toEqual(["b", "d", "a", "c"]);
  });
});

describe("regression fixtures (plan §7)", () => {
  it("das Projekt is untagged and passes for all 15 Branchen", () => {
    const projekt = vocabById("v_projekt");
    expect(projekt).toBeDefined();
    expect(projekt?.sectors ?? []).toHaveLength(0);
    expect(SECTOR_OPTIONS).toHaveLength(15);
    for (const { value } of SECTOR_OPTIONS) {
      expect(matchesSector(projekt!, [value])).toBe(true);
    }
  });

  it("der Bauzaun stays construction-only", () => {
    const bauzaun = vocabById("v_bauzaun");
    expect(bauzaun).toBeDefined();
    expect(bauzaun?.sectors).toEqual(["construction"]);
    expect(matchesSector(bauzaun!, ["construction"])).toBe(true);
    expect(matchesSector(bauzaun!, ["it"])).toBe(false);
  });
});
