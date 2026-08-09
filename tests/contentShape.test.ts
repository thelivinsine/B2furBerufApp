import { describe, it, expect } from "vitest";
import {
  worthLearningFindings,
  cefrPlausibilityFindings,
  posMixFindings,
  RARE_SHARE_CEILING,
  NO_EVIDENCE_CEILING,
  BEGINNER_RARE_CEILING,
  NOUN_SHARE_CEILING,
  THEME_VERB_FLOOR,
  THEME_ADJECTIVE_FLOOR,
  // @ts-expect-error -- plain .mjs linter module, no type declarations
} from "../scripts/content-shape.mjs";
import { vocabulary, RETIRED_VOCAB_IDS } from "@/data/vocabulary";
import { frequency } from "@/data/frequency";

/**
 * The three pedagogical-shape gates from the content audit's closing
 * observation (s198). A ratchet that cannot fire is decoration, so every gate
 * is asserted in BOTH directions: silent on the shipped bank, loud on a bank
 * that drifts the way the audit warned about.
 */

const browsable = vocabulary.filter((v) => !RETIRED_VOCAB_IDS.has(v.id));

/** A minimal item; only the fields the gates read matter. */
const item = (over: Record<string, unknown> = {}) => ({
  id: "v_x",
  de: "die Sache",
  pos: "noun",
  themeId: "meetings",
  cefr: "B2.1",
  ...over,
});

/** A theme that satisfies the part-of-speech floors, to build cases on top of. */
const balancedTheme = (themeId: string) => [
  ...Array.from({ length: THEME_VERB_FLOOR }, (_, i) =>
    item({ id: `v_v${themeId}${i}`, pos: "verb", themeId }),
  ),
  ...Array.from({ length: THEME_ADJECTIVE_FLOOR }, (_, i) =>
    item({ id: `v_a${themeId}${i}`, pos: "adjective", themeId }),
  ),
];

describe("the shipped bank passes all three shape gates", () => {
  it("is quiet on worth-learning, CEFR plausibility and part-of-speech mix", () => {
    expect(worthLearningFindings(browsable, frequency)).toEqual([]);
    expect(cefrPlausibilityFindings(browsable, frequency)).toEqual([]);
    expect(posMixFindings(browsable)).toEqual([]);
  });

  it("keeps the ceilings above the measured state, never below it", () => {
    const rare = browsable.filter((v) => {
      const bin = frequency[v.id]?.bin;
      return bin === "specialized" || bin === undefined;
    }).length;
    const nouns = browsable.filter((v) => v.pos === "noun").length;
    expect((100 * rare) / browsable.length).toBeLessThanOrEqual(RARE_SHARE_CEILING);
    expect((100 * nouns) / browsable.length).toBeLessThanOrEqual(NOUN_SHARE_CEILING);
    expect(browsable.filter((v) => !frequency[v.id]).length).toBeLessThanOrEqual(NO_EVIDENCE_CEILING);
  });
});

describe("gate 1: is this word worth learning", () => {
  it("fires when the bank drifts past the rare share", () => {
    const bank = Array.from({ length: 100 }, (_, i) => item({ id: `v_r${i}` }));
    const freq = Object.fromEntries(
      bank.map((v, i) => [v.id, { bin: i < 60 ? "specialized" : "core", zipf: 3 }]),
    );
    const findings = worthLearningFindings(bank, freq);
    expect(findings.map((f: { where: string }) => f.where)).toContain("worth-learning-ratchet");
    expect(findings[0].msg).toContain("60%");
  });

  it("fires when more items than the ceiling have no corpus evidence at all", () => {
    const bank = Array.from({ length: NO_EVIDENCE_CEILING + 1 }, (_, i) => item({ id: `v_n${i}` }));
    const findings = worthLearningFindings(bank, {});
    expect(findings.map((f: { where: string }) => f.where)).toContain("no-corpus-evidence");
  });

  it("stays quiet when the same bank is common enough", () => {
    const bank = Array.from({ length: 100 }, (_, i) => item({ id: `v_c${i}` }));
    const freq = Object.fromEntries(bank.map((v) => [v.id, { bin: "common", zipf: 4 }]));
    expect(worthLearningFindings(bank, freq)).toEqual([]);
  });
});

describe("gate 2: is this band plausible", () => {
  it("rejects an everyday word sold as advanced", () => {
    const bank = [item({ id: "v_somit", de: "somit", cefr: "B2.2" })];
    const findings = cefrPlausibilityFindings(bank, { v_somit: { bin: "core", zipf: 5.04 } });
    expect(findings).toHaveLength(1);
    expect(findings[0].msg).toContain("Kernwortschatz");
  });

  it("accepts a rare word at an advanced band", () => {
    const bank = [item({ id: "v_x", cefr: "B2.2" })];
    expect(cefrPlausibilityFindings(bank, { v_x: { bin: "specialized", zipf: 2 } })).toEqual([]);
  });

  it("fires when the beginner bands fill up with rare words", () => {
    const bank = Array.from({ length: BEGINNER_RARE_CEILING + 1 }, (_, i) =>
      item({ id: `v_b${i}`, cefr: "B1.1" }),
    );
    const freq = Object.fromEntries(bank.map((v) => [v.id, { bin: "specialized", zipf: 2 }]));
    const findings = cefrPlausibilityFindings(bank, freq);
    expect(findings.map((f: { where: string }) => f.where)).toContain("beginner-rare-ratchet");
  });
});

describe("gate 3: does this theme have a balanced part-of-speech mix", () => {
  it("fires on a theme with no verb and no adjective (the digitales case)", () => {
    const bank = [
      ...balancedTheme("meetings"),
      ...Array.from({ length: 20 }, (_, i) => item({ id: `v_d${i}`, themeId: "digitales" })),
    ];
    const msgs = posMixFindings(bank)
      .filter((f: { where: string }) => f.where === "digitales")
      .map((f: { msg: string }) => f.msg);
    expect(msgs).toHaveLength(2);
    expect(msgs.join(" ")).toContain("0 verb(s)");
    expect(msgs.join(" ")).toContain("0 adjective(s)");
  });

  it("fires when the bank drifts more noun-heavy than the ceiling", () => {
    const bank = [
      ...balancedTheme("meetings"),
      ...Array.from({ length: 200 }, (_, i) => item({ id: `v_m${i}` })),
    ];
    expect(posMixFindings(bank).map((f: { where: string }) => f.where)).toContain(
      "noun-share-ratchet",
    );
  });

  it("stays quiet on a theme that meets both floors", () => {
    expect(posMixFindings(balancedTheme("meetings"))).toEqual([]);
  });
});
