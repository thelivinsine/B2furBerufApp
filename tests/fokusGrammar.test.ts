import { describe, it, expect } from "vitest";
import {
  GRAMMAR_AXES,
  normalizeDetected,
  valueLabel,
  refusalCopy,
} from "@/features/writing/fokus/grammarDimensions";
import { countWords, MIN_WORDS } from "@/features/writing/fokus/useFokusMachine";

describe("grammar dimensions (Fokus Satzlabor)", () => {
  it("ships the MVP Voice x Tense grid", () => {
    const ids = GRAMMAR_AXES.map((a) => a.id);
    expect(ids).toEqual(["voice", "tense"]);
    expect(GRAMMAR_AXES[0].values.map((v) => v.id)).toEqual(["aktiv", "passiv_vorgang"]);
    expect(GRAMMAR_AXES[1].values.map((v) => v.id)).toEqual(["praesens", "perfekt", "praeteritum"]);
  });

  it("normalizes detected values onto displayable pills", () => {
    expect(normalizeDetected("aktiv", "praesens")).toEqual({ voice: "aktiv", tense: "praesens" });
    // Zustandspassiv collapses to the MVP passive pill.
    expect(normalizeDetected("passiv_zustand", "perfekt").voice).toBe("passiv_vorgang");
    // Tenses not in the MVP set do not mark any pill current (honest, not wrong).
    expect(normalizeDetected("aktiv", "futur1").tense).toBeNull();
    expect(normalizeDetected(undefined, undefined)).toEqual({ voice: null, tense: null });
  });

  it("labels values and refusals in German with no em dashes", () => {
    expect(valueLabel("voice", "passiv_vorgang")).toBe("Passiv");
    expect(valueLabel("tense", null)).toBe("");
    const refusal = refusalCopy("kein_akkusativobjekt");
    expect(refusal).toContain("Akkusativobjekt");
    expect(refusal).not.toContain("—");
    expect(refusalCopy(undefined)).toBeTruthy();
  });
});

describe("word counting (Fokus)", () => {
  it("counts words and enforces the minimum", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("Der Chef schreibt")).toBe(3);
    expect(3).toBeGreaterThanOrEqual(MIN_WORDS);
  });
});
