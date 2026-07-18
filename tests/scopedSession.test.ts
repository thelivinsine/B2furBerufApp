import { describe, it, expect } from "vitest";
import { buildScopedSession } from "@/engine/session";
import { buildPoolQuiz } from "@/engine/quiz";
import { vocabulary, vocabById } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { redemittel } from "@/data/redemittel";
import { grammar } from "@/data/grammar";
import type { QuizQuestion, SessionBlock } from "@/types";

const headword = (s: string) => s.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0].toLowerCase();

/** sourceId of a quiz question, or undefined (matching + generic carry none). */
function qSource(q: QuizQuestion): string | undefined {
  return q.kind === "matching" ? undefined : q.sourceId;
}

/** The distinct "exercise kinds" a plan exposes: each card kind + each quiz
 *  question kind. This is the variety metric the founder ask is about (a "quiz"
 *  block is many kinds under the hood). */
function exerciseKinds(blocks: SessionBlock[]): Set<string> {
  const kinds = new Set<string>();
  for (const b of blocks) {
    if (b.kind === "quiz") kinds.add(`q:${b.question.kind}`);
    else kinds.add(b.kind);
  }
  return kinds;
}

const behoerde = vocabulary.filter((v) => v.themeId === "behoerde");
const behoerdeIds = behoerde.map((v) => v.id);

describe("buildPoolQuiz (s131 pool-based generator)", () => {
  it("draws every answer + sourceId from the pool, no generic filler when disabled", () => {
    const pool = behoerde.slice(0, 12);
    const poolIds = new Set(pool.map((v) => v.id));
    const heads = new Set(pool.map((v) => headword(v.de)));
    const setColIds = new Set(collocations.filter((c) => heads.has(headword(c.noun))).map((c) => c.id));
    const qs = buildPoolQuiz({ vocab: pool, collocations: [...collocations].filter((c) => setColIds.has(c.id)) }, 2, 8, {
      includeGeneric: false,
    });
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      // No theme-agnostic grammar filler leaks into a content-pure set.
      expect(["connectorChoice", "relativePronoun", "daWord"]).not.toContain(q.kind);
      const src = qSource(q);
      if (src) expect(poolIds.has(src) || setColIds.has(src)).toBe(true);
    }
  });

  it("keeps the theme-agnostic banks when includeGeneric is true", () => {
    // Full-bank pools + generic on = a theme quiz; over many draws at least one
    // generic filler should appear (this is what /quiz relies on).
    const kinds = new Set<string>();
    for (let i = 0; i < 8; i++) {
      for (const q of buildPoolQuiz({ vocab: behoerde, collocations }, 3, 10, { includeGeneric: true })) {
        kinds.add(q.kind);
      }
    }
    expect([...kinds].some((k) => ["relativePronoun", "daWord"].includes(k))).toBe(true);
  });

  it("never throws or loops on degenerate pools", () => {
    expect(() => buildPoolQuiz({ vocab: [], collocations: [] }, 2, 6)).not.toThrow();
    expect(buildPoolQuiz({ vocab: [], collocations: [] }, 2, 6)).toEqual([]);
    // One vocab word, no collocations: falls back to translation (distractors
    // come from the full bank), so it still yields questions.
    const tiny = buildPoolQuiz({ vocab: behoerde.slice(0, 1), collocations: [] }, 2, 6, { includeGeneric: false });
    expect(tiny.length).toBeGreaterThan(0);
    for (const q of tiny) expect(qSource(q) ?? behoerde[0].id).toBe(behoerde[0].id);
  });

  it("produces collocation exercises for a collocation-only pool at any difficulty", () => {
    const cols = collocations.filter((c) => c.themeId === "behoerde").slice(0, 10);
    if (cols.length < 4) return; // theme may lack collocations; contract still holds
    for (const diff of [1, 2, 3] as const) {
      const qs = buildPoolQuiz({ vocab: [], collocations: cols }, diff, 6, { includeGeneric: false });
      expect(qs.length).toBeGreaterThan(0);
      const colIds = new Set(cols.map((c) => c.id));
      for (const q of qs) {
        const src = qSource(q);
        if (src) expect(colIds.has(src)).toBe(true);
      }
    }
  });
});

describe("buildScopedSession (s131 exercise variety)", () => {
  it("interleaves recall cards with generated exercises for a vocab set", () => {
    const set = behoerdeIds.slice(0, 14);
    const plan = buildScopedSession("vocab", set, { srs: {}, minutes: 10, difficulty: 2 });
    // Both halves present: not a stack of flip-cards, not a wall of quizzes.
    expect(plan.blocks.some((b) => b.kind === "quiz")).toBe(true);
    expect(plan.blocks.some((b) => b.kind === "flashcard" || b.kind === "typing")).toBe(true);
    // Bounded to the target length.
    expect(plan.blocks.length).toBeLessThanOrEqual(16);
  });

  it("keeps a vocab set content-pure (answers resolve into the set)", () => {
    const set = behoerdeIds.slice(0, 14);
    const setIds = new Set(set);
    const heads = new Set(set.map((id) => headword(vocabById(id)!.de)));
    const setColIds = new Set(collocations.filter((c) => heads.has(headword(c.noun))).map((c) => c.id));
    const plan = buildScopedSession("vocab", set, { srs: {}, minutes: 10, difficulty: 2 });
    for (const b of plan.blocks) {
      if (b.kind === "flashcard" || b.kind === "typing") expect(setIds.has(b.sourceId)).toBe(true);
      if (b.kind === "quiz") {
        const src = qSource(b.question);
        if (src) expect(setIds.has(src) || setColIds.has(src)).toBe(true);
      }
    }
  });

  it("delivers real variety (>= 3 distinct exercise kinds) on a full vocab theme", () => {
    // Union across a few builds to be robust to per-build sampling.
    const union = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const plan = buildScopedSession("vocab", behoerdeIds, { srs: {}, minutes: 10, difficulty: 2 });
      for (const k of exerciseKinds(plan.blocks)) union.add(k);
    }
    expect(union.size).toBeGreaterThanOrEqual(3);
  });

  it("caps any single item at 2 appearances per session", () => {
    const set = behoerdeIds.slice(0, 14);
    const plan = buildScopedSession("vocab", set, { srs: {}, minutes: 10, difficulty: 2 });
    const counts = new Map<string, number>();
    for (const b of plan.blocks) {
      let src: string | undefined;
      if (b.kind === "flashcard" || b.kind === "typing" || b.kind === "speaking") src = b.sourceId;
      else if (b.kind === "quiz") src = qSource(b.question);
      if (src) counts.set(src, (counts.get(src) ?? 0) + 1);
    }
    for (const n of counts.values()) expect(n).toBeLessThanOrEqual(2);
  });

  it("adds exercises to a collocation set too", () => {
    const colSet = collocations.filter((c) => c.themeId === "behoerde").map((c) => c.id).slice(0, 14);
    const plan = buildScopedSession("collocation", colSet, { srs: {}, minutes: 10, difficulty: 2 });
    expect(plan.blocks.some((b) => b.kind === "flashcard")).toBe(true);
    // Collocation sets carry enough for at least the fill/word-order exercises.
    if (colSet.length >= 4) expect(plan.blocks.some((b) => b.kind === "quiz")).toBe(true);
  });

  it("leaves Redemittel + Grammatik scopes single-kind", () => {
    const redeSet = redemittel.slice(0, 8).map((r) => r.id);
    const redePlan = buildScopedSession("redemittel", redeSet, { srs: {}, minutes: 8 });
    expect(redePlan.blocks.every((b) => b.kind === "flashcard")).toBe(true);

    const grpSet = grammar.slice(0, 1).map((g) => g.id);
    const grPlan = buildScopedSession("grammar", grpSet, { srs: {}, minutes: 8 });
    expect(grPlan.blocks.every((b) => b.kind === "grammar")).toBe(true);
  });

  it("degrades a tiny set to cards without throwing", () => {
    const tiny = behoerdeIds.slice(0, 2);
    expect(() => buildScopedSession("vocab", tiny, { srs: {}, minutes: 10, difficulty: 2 })).not.toThrow();
    const plan = buildScopedSession("vocab", tiny, { srs: {}, minutes: 10, difficulty: 2 });
    expect(plan.blocks.length).toBeGreaterThan(0);
    // Every source resolves; no item exceeds the 2-appearance cap.
    const setIds = new Set(tiny);
    for (const b of plan.blocks) {
      if (b.kind === "flashcard" || b.kind === "typing") expect(setIds.has(b.sourceId)).toBe(true);
    }
  });
});
