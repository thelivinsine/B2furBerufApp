import { describe, it, expect } from "vitest";
import { buildSession, graduatedToTyping } from "@/engine/session";
import { sessionPreview, targetBlocks, weakestBand } from "@/engine/sessionPreview";
import { freshCard, review, isDue, mastery } from "@/engine/srs";
import { searchAll } from "@/lib/search";
import { daysBetween, shuffle, todayKey } from "@/lib/utils";
import { vocabulary } from "@/data/vocabulary";
import type { SrsCard } from "@/types";

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

  it("keeps new/young cards on recognition flashcards, not typing (4.2)", () => {
    // A fresh learner: every card is undefined, so nothing has graduated.
    const plan = buildSession({ srs: {}, mode: "both", minutes: 15 });
    expect(plan.blocks.some((b) => b.kind === "typing")).toBe(false);
  });

  it("graduates established cards to typed forward recall (4.2)", () => {
    // Every vocab card is due, deep, and past the stability floor → all the
    // vocab-sourced blocks must be typing, none recognition flashcards.
    const graduated: SrsCard = {
      ease: 2.5,
      interval: 20,
      reps: 4,
      due: "2000-01-01",
      stability: 20,
    };
    const srs: Record<string, SrsCard> = {};
    for (const v of vocabulary) srs[v.id] = graduated;
    const plan = buildSession({ srs, mode: "both", minutes: 15 });
    expect(plan.blocks.some((b) => b.kind === "typing")).toBe(true);
    const vocabFlashcards = plan.blocks.filter(
      (b) => b.kind === "flashcard" && b.source === "vocab",
    );
    expect(vocabFlashcards.length).toBe(0);
  });

  it("graduatedToTyping gates on both reps and the stability floor (4.2)", () => {
    expect(graduatedToTyping(undefined)).toBe(false);
    // Deep enough but below the floor.
    expect(
      graduatedToTyping({ ease: 2.5, interval: 3, reps: 4, due: "2000-01-01", stability: 3 }),
    ).toBe(false);
    // Past the floor but too young (one lucky answer must not jump to typing).
    expect(
      graduatedToTyping({ ease: 2.5, interval: 20, reps: 1, due: "2000-01-01", stability: 20 }),
    ).toBe(false);
    // Deep and past the floor.
    expect(
      graduatedToTyping({ ease: 2.5, interval: 20, reps: 4, due: "2000-01-01", stability: 20 }),
    ).toBe(true);
    // Legacy card without stability falls back to interval.
    expect(graduatedToTyping({ ease: 2.5, interval: 20, reps: 4, due: "2000-01-01" })).toBe(true);
  });

  it("includes exactly one Lesen/Hören reading block (4.4)", () => {
    const plan = buildSession({ srs: {}, mode: "both", minutes: 15 });
    const reading = plan.blocks.filter((b) => b.kind === "reading");
    expect(reading.length).toBe(1);
  });

  it("plays a voicemail as listening only when the caller reports TTS (4.4)", () => {
    // Scope to logistics, whose only text is a voicemail, so the reading block
    // is deterministic. With listening support it plays as audio; without, it
    // still appears as a readable text block.
    const withTts = buildSession({
      srs: {}, mode: "both", minutes: 15, scope: "logistics", listening: true,
    });
    const withoutTts = buildSession({
      srs: {}, mode: "both", minutes: 15, scope: "logistics", listening: false,
    });
    const readOf = (p: ReturnType<typeof buildSession>) =>
      p.blocks.find((b) => b.kind === "reading") as
        | Extract<(typeof p.blocks)[number], { kind: "reading" }>
        | undefined;
    expect(readOf(withTts)?.listening).toBe(true);
    expect(readOf(withoutTts)?.listening).toBe(false);
  });

  it("scopes the reading block to the requested theme when a text exists (4.4)", () => {
    const plan = buildSession({ srs: {}, mode: "both", minutes: 15, scope: "behoerde" });
    const reading = plan.blocks.find((b) => b.kind === "reading") as
      | Extract<(typeof plan.blocks)[number], { kind: "reading" }>
      | undefined;
    expect(reading?.textId.startsWith("tx_behoerde")).toBe(true);
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
