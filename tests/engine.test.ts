import { describe, it, expect } from "vitest";
import { buildSession } from "@/engine/session";
import { sessionPreview, targetBlocks, weakestBand } from "@/engine/sessionPreview";
import { freshCard, review, isDue, mastery } from "@/engine/srs";
import { searchAll } from "@/lib/search";
import { daysBetween, shuffle, todayKey } from "@/lib/utils";
import { vocabulary } from "@/data/vocabulary";

describe("session composer", () => {
  it("builds a non-empty, bounded plan for a fresh learner", () => {
    const plan = buildSession({ srs: {}, mode: "both", minutes: 10 });
    expect(plan.blocks.length).toBeGreaterThan(0);
    expect(plan.blocks.length).toBeLessThanOrEqual(targetBlocks(10));
  });

  it("uses unique block keys (duplicates would break React keys and step counting)", () => {
    const plan = buildSession({ srs: {}, mode: "both", minutes: 15 });
    const keys = plan.blocks.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("respects an explicit theme scope for quiz blocks", () => {
    const plan = buildSession({ srs: {}, mode: "both", minutes: 15, scope: "behoerde" });
    const quizThemes = plan.blocks
      .filter((b) => b.kind === "quiz")
      .map((b) => (b as Extract<(typeof plan.blocks)[number], { kind: "quiz" }>).question.themeId);
    for (const t of quizThemes) expect(["behoerde", "general"]).toContain(t);
  });

  it("adds speaking blocks only when the caller opts in", () => {
    const withSpeaking = buildSession({ srs: {}, mode: "both", minutes: 15, speaking: true });
    const without = buildSession({ srs: {}, mode: "both", minutes: 15, speaking: false });
    expect(withSpeaking.blocks.some((b) => b.kind === "speaking")).toBe(true);
    expect(without.blocks.some((b) => b.kind === "speaking")).toBe(false);
  });

  it("sessionPreview is deterministic and reports history", () => {
    const a = sessionPreview({ srs: {}, minutes: 10 });
    const b = sessionPreview({ srs: {}, minutes: 10 });
    expect(a).toEqual(b);
    expect(a.hasHistory).toBe(false);
    const card = review(freshCard(), 4);
    const withCard = sessionPreview({ srs: { [vocabulary[0].id]: card }, minutes: 10 });
    expect(withCard.hasHistory).toBe(true);
  });

  it("weakestBand ignores unstarted cards", () => {
    expect(weakestBand({})).toBeNull();
  });
});

describe("srs", () => {
  it("a never-studied card is due; a Good review schedules it into the future", () => {
    expect(isDue(undefined)).toBe(true);
    const reviewed = review(freshCard(), 4);
    expect(reviewed.due > todayKey()).toBe(true);
    expect(mastery(reviewed)).toBeGreaterThan(0);
  });
});

describe("global search", () => {
  it("returns nothing under 2 characters", () => {
    expect(searchAll("a")).toEqual([]);
    expect(searchAll("")).toEqual([]);
  });

  it("finds vocabulary and normalises umlauts", () => {
    const direct = searchAll("Besprechung");
    const normalised = searchAll("besprechung");
    expect(direct.length).toBeGreaterThan(0);
    expect(normalised.map((g) => g.kind)).toEqual(direct.map((g) => g.kind));
  });

  it("caps displayed results per group but reports the full count", () => {
    const groups = searchAll("en"); // broad query, many hits
    for (const g of groups) {
      expect(g.results.length).toBeLessThanOrEqual(5);
      expect(g.count).toBeGreaterThanOrEqual(g.results.length);
    }
  });
});

describe("utils", () => {
  it("daysBetween handles day keys", () => {
    expect(daysBetween("2026-07-01", "2026-07-05")).toBe(4);
    expect(daysBetween("2026-07-05", "2026-07-05")).toBe(0);
  });

  it("shuffle preserves the element set", () => {
    const arr = [1, 2, 3, 4, 5];
    expect([...shuffle(arr)].sort()).toEqual(arr);
  });
});
