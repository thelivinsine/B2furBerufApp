import { describe, it, expect } from "vitest";
import type { Collocation } from "@/types";
import { collocations } from "@/data/collocations";
import {
  buildCollocationGraph,
  nodeRadiusForDegree,
  nounId,
  verbId,
} from "@/features/collocations/collocationGraph";

function colloc(
  id: string,
  noun: string,
  verb: string,
  extra: Partial<Collocation> = {},
): Collocation {
  return {
    id,
    noun,
    verb,
    full: `${noun} ${verb}`,
    en: "x",
    example: { de: "a", en: "a" },
    ...extra,
  } as Collocation;
}

describe("buildCollocationGraph — bipartite noun/verb model", () => {
  it("makes a separate noun and verb node with one edge per collocation", () => {
    const g = buildCollocationGraph([colloc("c1", "eine Entscheidung", "treffen")]);
    expect(g.nodes.map((n) => n.id).sort()).toEqual(
      [nounId("entscheidung"), verbId("treffen")].sort(),
    );
    expect(g.links).toEqual([
      { source: nounId("entscheidung"), target: verbId("treffen"), register: undefined, collocationId: "c1" },
    ]);
  });

  it("shares one verb node across two nouns (degree 2 hub)", () => {
    const g = buildCollocationGraph([
      colloc("c1", "eine Entscheidung", "treffen"),
      colloc("c2", "eine Vereinbarung", "treffen"),
    ]);
    const verb = g.nodes.find((n) => n.id === verbId("treffen"));
    expect(verb?.kind).toBe("verb");
    expect(verb?.degree).toBe(2);
    expect(g.links).toHaveLength(2);
  });

  it("collapses article variants onto one noun node (normalizeForm reuse)", () => {
    const g = buildCollocationGraph([
      colloc("c1", "eine Entscheidung", "treffen"),
      colloc("c2", "die Entscheidung", "revidieren"),
    ]);
    const nouns = g.nodes.filter((n) => n.kind === "noun");
    expect(nouns).toHaveLength(1);
    expect(nouns[0].id).toBe(nounId("entscheidung"));
    expect(nouns[0].degree).toBe(2);
  });

  it("de-duplicates an identical noun|verb pair into a single edge", () => {
    const g = buildCollocationGraph([
      colloc("c1", "die Entscheidung", "treffen", { themeId: "meetings" }),
      colloc("c2", "eine Entscheidung", "treffen", { themeId: "project" }),
    ]);
    expect(g.links).toHaveLength(1);
    // ...but both occurrences still count toward the theme vote.
    const noun = g.nodes.find((n) => n.id === nounId("entscheidung"));
    // meetings seen first, tie broken to first-seen.
    expect(noun?.themeId).toBe("meetings");
  });

  it("resolves the node domain from its majority theme", () => {
    // meetings → domain "beruf". Two votes for meetings, one for arzt.
    const g = buildCollocationGraph([
      colloc("c1", "der Termin", "vereinbaren", { themeId: "meetings" }),
      colloc("c2", "der Termin", "verschieben", { themeId: "meetings" }),
      colloc("c3", "der Termin", "absagen", { themeId: "arzt" }),
    ]);
    const noun = g.nodes.find((n) => n.id === nounId("termin"));
    expect(noun?.themeId).toBe("meetings");
    expect(noun?.domain).toBe("beruf");
  });

  it("carries register onto the edge", () => {
    const g = buildCollocationGraph([
      colloc("c1", "einen Antrag", "stellen", { register: "formal" }),
    ]);
    expect(g.links[0].register).toBe("formal");
  });
});

describe("nodeRadiusForDegree — size from partner count", () => {
  it("grows monotonically and clamps at the degree cap", () => {
    expect(nodeRadiusForDegree(1)).toBeLessThan(nodeRadiusForDegree(4));
    expect(nodeRadiusForDegree(4)).toBeLessThan(nodeRadiusForDegree(16));
    expect(nodeRadiusForDegree(16)).toBe(nodeRadiusForDegree(40));
  });
});

describe("buildCollocationGraph — over the real bank", () => {
  it("produces a well-connected bipartite map", () => {
    const g = buildCollocationGraph(collocations);
    // Every edge is exactly one collocation (after pair de-dup, ≤ bank size).
    expect(g.links.length).toBeGreaterThan(300);
    expect(g.links.length).toBeLessThanOrEqual(collocations.length);
    const nouns = g.nodes.filter((n) => n.kind === "noun").length;
    const verbs = g.nodes.filter((n) => n.kind === "verb").length;
    expect(nouns).toBeGreaterThan(50);
    expect(verbs).toBeGreaterThan(20);
    // Bipartite: every link goes noun -> verb.
    expect(g.links.every((l) => l.source.startsWith("n:") && l.target.startsWith("v:"))).toBe(true);
    // Nearly everything is connected (degree ≥ 1) by construction.
    expect(g.nodes.every((n) => n.degree >= 1)).toBe(true);
  });
});
