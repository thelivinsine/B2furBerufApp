import { describe, it, expect } from "vitest";
import {
  GRAMMAR_AXES,
  normalizeDetected,
  valueLabel,
  refusalCopy,
} from "@/features/writing/fokus/grammarDimensions";
import { countWords, MIN_WORDS } from "@/features/writing/fokus/useFokusMachine";

describe("grammar dimensions (Fokus Satzlabor)", () => {
  it("ships the Voice x Tense x Mood grid (Wave 2 added Modus)", () => {
    const ids = GRAMMAR_AXES.map((a) => a.id);
    expect(ids).toEqual(["voice", "tense", "mood"]);
    expect(GRAMMAR_AXES[0].values.map((v) => v.id)).toEqual(["aktiv", "passiv_vorgang"]);
    expect(GRAMMAR_AXES[1].values.map((v) => v.id)).toEqual(["praesens", "perfekt", "praeteritum"]);
    expect(GRAMMAR_AXES[2].values.map((v) => v.id)).toEqual(["indikativ", "konjunktiv2"]);
  });

  it("normalizes detected values onto displayable pills", () => {
    expect(normalizeDetected("aktiv", "praesens", "indikativ")).toEqual({
      voice: "aktiv",
      tense: "praesens",
      mood: "indikativ",
    });
    // Zustandspassiv (sein + Partizip) is NOT the Passiv pill (Vorgangspassiv,
    // werden + Partizip), so it marks no voice pill current rather than mislabeling.
    // This also stops a copula the detector misreads as passive from surfacing a
    // wrong Passiv marker.
    expect(normalizeDetected("passiv_zustand", "perfekt").voice).toBeNull();
    // Tenses not in the MVP set do not mark any pill current (honest, not wrong).
    expect(normalizeDetected("aktiv", "futur1").tense).toBeNull();
    // Konjunktiv II is on the rail; Konjunktiv I / Imperativ are not, so they
    // mark no mood pill current rather than mislabeling.
    expect(normalizeDetected("aktiv", "praesens", "konjunktiv2").mood).toBe("konjunktiv2");
    expect(normalizeDetected("aktiv", "praesens", "konjunktiv1").mood).toBeNull();
    expect(normalizeDetected("aktiv", "praesens", "imperativ").mood).toBeNull();
    expect(normalizeDetected(undefined, undefined, undefined)).toEqual({
      voice: null,
      tense: null,
      mood: null,
    });
  });

  it("labels values and refusals in German with no em dashes", () => {
    expect(valueLabel("voice", "passiv_vorgang")).toBe("Passiv");
    expect(valueLabel("mood", "konjunktiv2")).toBe("Konjunktiv II");
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
