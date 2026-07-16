import { describe, it, expect } from "vitest";
import type { Collocation, VocabItem } from "@/types";
import { vocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { buildWordGraph, normalizeForm, radiusForZipf } from "@/features/vocabulary/wordGraph";

/** Minimal vocab item; only the fields the graph builder reads are relevant. */
function word(id: string, de: string, related: string[] = []): VocabItem {
  return {
    id,
    de,
    en: "x",
    pron: "x",
    pos: "noun",
    themeId: "meetings",
    related,
    examples: [
      { de: "a", en: "a" },
      { de: "b", en: "b" },
    ],
  } as VocabItem;
}

function colloc(id: string, noun: string, verb: string): Collocation {
  return {
    id,
    noun,
    verb,
    full: `${noun} ${verb}`,
    en: "x",
    example: { de: "a", en: "a" },
  } as Collocation;
}

describe("normalizeForm — display form to match key", () => {
  it("strips definite and indefinite articles", () => {
    expect(normalizeForm("die Besprechung")).toBe("besprechung");
    expect(normalizeForm("eine Entscheidung")).toBe("entscheidung");
    expect(normalizeForm("einen Vorschlag")).toBe("vorschlag");
  });

  it("strips reflexive sich and bracketed hints", () => {
    expect(normalizeForm("sich bewerben")).toBe("bewerben");
    expect(normalizeForm("absagen (den Termin)")).toBe("absagen");
  });

  it("keeps plain verbs untouched", () => {
    expect(normalizeForm("treffen")).toBe("treffen");
  });
});

describe("buildWordGraph — edges", () => {
  it("links related terms that resolve to visible items, and drops the rest", () => {
    const items = [
      word("a", "die Besprechung", ["die Sitzung", "das Nirgendwo-Wort"]),
      word("b", "die Sitzung"),
    ];
    const g = buildWordGraph(items, []);
    expect(g.links).toEqual([{ source: "a", target: "b", kind: "related" }]);
    expect(g.nodes.find((n) => n.id === "a")?.degree).toBe(1);
  });

  it("links collocation noun and verb when both are visible", () => {
    const items = [word("n", "die Entscheidung"), word("v", "treffen")];
    const g = buildWordGraph(items, [colloc("c1", "eine Entscheidung", "treffen")]);
    expect(g.links).toEqual([{ source: "n", target: "v", kind: "collocation" }]);
  });

  it("resolves a collocation written in the plural to its singular vocab node", () => {
    const items = [
      { ...word("n", "die Beschwerde"), plural: "die Beschwerden" } as VocabItem,
      word("v", "schildern"),
    ];
    // The collocation noun is the plural "die Beschwerden"; without the plural
    // alias this edge would silently drop.
    const g = buildWordGraph(items, [colloc("c1", "die Beschwerden", "schildern")]);
    expect(g.links).toEqual([{ source: "n", target: "v", kind: "collocation" }]);
  });

  it("creates no collocation edge when one side is filtered out", () => {
    const items = [word("n", "die Entscheidung")];
    const g = buildWordGraph(items, [colloc("c1", "eine Entscheidung", "treffen")]);
    expect(g.links).toHaveLength(0);
  });

  it("deduplicates reciprocal related links", () => {
    const items = [
      word("a", "die Besprechung", ["die Sitzung"]),
      word("b", "die Sitzung", ["die Besprechung"]),
    ];
    const g = buildWordGraph(items, []);
    expect(g.links).toHaveLength(1);
  });

  it("never links a node to itself", () => {
    const items = [word("a", "die Besprechung", ["die Besprechung"])];
    const g = buildWordGraph(items, []);
    expect(g.links).toHaveLength(0);
  });
});

describe("radiusForZipf — node size from corpus frequency", () => {
  it("gives words without corpus evidence the minimum radius", () => {
    expect(radiusForZipf(undefined)).toBe(radiusForZipf(1.0));
    expect(radiusForZipf(undefined)).toBeLessThan(radiusForZipf(4));
  });

  it("grows monotonically and caps at Zipf 6", () => {
    expect(radiusForZipf(3)).toBeLessThan(radiusForZipf(5));
    expect(radiusForZipf(6)).toBe(radiusForZipf(7));
  });
});

describe("buildWordGraph — over the real bank", () => {
  it("produces a connected map, not a dust cloud", () => {
    const g = buildWordGraph(vocabulary, collocations);
    expect(g.nodes).toHaveLength(vocabulary.length);
    // The banks are authored with related terms; if this drops to near zero
    // the normalizer regressed.
    expect(g.links.length).toBeGreaterThan(100);
    const linked = g.nodes.filter((n) => n.degree > 0).length;
    expect(linked / g.nodes.length).toBeGreaterThan(0.3);
  });
});
