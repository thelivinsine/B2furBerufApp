import { describe, it, expect } from "vitest";
import {
  scoreItem,
  scoreFeatures,
  defectSignalFrom,
  trafficProxyFrom,
  bankCriticalityFrom,
  BANK_CRITICALITY,
} from "../scripts/review-score.mjs";

/**
 * Pins the admin Review Cockpit priority scoring (§A2). The ordering
 * defect_signal > traffic_proxy > (1-confidence) > bank_criticality is the
 * contract the Prüfmodus queue is built on, so it must not silently drift.
 */

describe("defectSignalFrom", () => {
  it("is 0 for all-passing checks and no grammar matches", () => {
    expect(defectSignalFrom({ checks: [{ result: "pass" }, { result: "pass" }] })).toBe(0);
    expect(defectSignalFrom({})).toBe(0);
  });

  it("maxes to 1 on any hard fail", () => {
    expect(defectSignalFrom({ checks: [{ result: "pass" }, { result: "fail" }] })).toBe(1);
  });

  it("rises above the clean floor on a flag or a grammar match", () => {
    expect(defectSignalFrom({ checks: [{ result: "flag" }] })).toBeCloseTo(0.6);
    expect(defectSignalFrom({ grammarMatches: 2 })).toBeCloseTo(0.7);
  });
});

describe("trafficProxyFrom", () => {
  it("gives learning surfaces a base weight", () => {
    expect(trafficProxyFrom({ contentType: "grammar_topic" })).toBeCloseTo(0.5);
    expect(trafficProxyFrom({ contentType: "vocabulary" })).toBe(0);
  });

  it("adds for mission content, core frequency and low CEFR, capped at 1", () => {
    const t = trafficProxyFrom({
      contentType: "text",
      isMissionContent: true,
      freqBin: "core",
      cefr: "A2",
    });
    expect(t).toBe(1); // 0.5 + 0.25 + 0.3 + 0.2 -> clamped
    expect(trafficProxyFrom({ contentType: "vocabulary", freqBin: "common" })).toBeCloseTo(0.15);
  });
});

describe("bankCriticalityFrom", () => {
  it("ranks grammar/text above redemittel above collocation above vocab", () => {
    expect(bankCriticalityFrom("grammar_topic")).toBeGreaterThan(bankCriticalityFrom("redemittel"));
    expect(bankCriticalityFrom("redemittel")).toBeGreaterThan(bankCriticalityFrom("collocation"));
    expect(bankCriticalityFrom("collocation")).toBeGreaterThan(bankCriticalityFrom("vocabulary"));
  });
  it("falls back to 0.5 for an unknown type", () => {
    expect(bankCriticalityFrom("mystery")).toBe(0.5);
    expect(BANK_CRITICALITY.vocabulary).toBe(0.4);
  });
});

describe("scoreFeatures ordering", () => {
  it("lets each weight tier dominate the one below it", () => {
    // Even a fully-maxed lower tier cannot overtake a single unit of the tier
    // above: max(traffic+conf+bank) = 100 + 10 + 1 = 111 < 1000 (one defect).
    expect(scoreFeatures({ defectSignal: 1 })).toBeGreaterThan(
      scoreFeatures({ trafficProxy: 1, confidence: 0, bankCriticality: 1 }),
    );
    expect(scoreFeatures({ trafficProxy: 1, confidence: 1 })).toBeGreaterThan(
      scoreFeatures({ confidence: 0, bankCriticality: 1 }),
    );
    // Isolate the bank tier by removing the confidence term (confidence: 1).
    expect(scoreFeatures({ confidence: 0, bankCriticality: 0 })).toBeGreaterThan(
      scoreFeatures({ confidence: 1, bankCriticality: 1 }),
    );
  });
});

describe("scoreItem end to end", () => {
  it("ranks a flagged low-confidence grammar drill above a clean high-confidence vocab word", () => {
    const flagged = scoreItem({
      contentType: "grammar_drill",
      checks: [{ result: "flag" }],
      confidence: 0.5,
      cefr: "B1.1",
      isMissionContent: false,
    });
    const clean = scoreItem({
      contentType: "vocabulary",
      checks: [{ result: "pass" }, { result: "pass" }, { result: "pass" }],
      confidence: 0.8,
      freqBin: "specialized",
    });
    expect(flagged.score).toBeGreaterThan(clean.score);
    expect(flagged.defectSignal).toBeGreaterThan(0);
    expect(clean.defectSignal).toBe(0);
  });

  it("returns rounded, stable feature values", () => {
    const s = scoreItem({ contentType: "collocation", confidence: 0.8 });
    expect(s.bankCriticality).toBe(0.5);
    expect(s.confidence).toBe(0.8);
    expect(Number.isFinite(s.score)).toBe(true);
  });
});
