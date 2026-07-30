import { describe, it, expect } from "vitest";
import { buildPoolQuiz, buildThemeQuiz } from "@/engine/quiz";
import { browsableVocabulary, vocabByTheme } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { themes } from "@/data/themes";
import type { Difficulty, MCQQuestion, MatchingQuestion, QuizQuestion } from "@/types";

/**
 * Option-assembly contract (s178 content audit).
 *
 * Filtering distractors by `id !== item.id` was not enough: distinct bank entries
 * legitimately share a rendered label, so a question could show the same string
 * twice, one of them the correct answer. Two real cases drove this:
 *   - `die Frist` and `die Deadline` both glossed "deadline" in `scheduling`
 *   - `der Reisepass` shipped under two ids (now one is retired)
 * The content linter now errors on both patterns at the source; these tests pin
 * the ENGINE side, so a future collision degrades to a shorter option list rather
 * than an unanswerable question.
 */

const hasOptions = (q: QuizQuestion): q is MCQQuestion =>
  "options" in q && Array.isArray((q as MCQQuestion).options);
const isMatching = (q: QuizQuestion): q is MatchingQuestion => q.kind === "matching";
const key = (s: string) => s.trim().toLowerCase();

function everyQuestion(cb: (q: QuizQuestion, where: string) => void) {
  for (const d of [1, 2, 3] as Difficulty[]) {
    // Whole-bank pool: the widest distractor draw, where collisions are likeliest.
    for (const q of buildPoolQuiz(
      { vocab: browsableVocabulary, collocations },
      d,
      40,
      { includeGeneric: true },
    ))
      cb(q, `pool d${d}`);
    // Per-theme pools: a theme IS the quiz pool, so a same-theme collision lands here.
    for (const t of themes)
      for (const q of buildThemeQuiz(t.id, d, 12)) cb(q, `${t.id} d${d}`);
  }
}

describe("quiz option assembly", () => {
  it("never repeats an option label within a question", () => {
    const offenders: string[] = [];
    everyQuestion((q, where) => {
      if (!hasOptions(q)) return;
      const keys = q.options.map(key);
      if (new Set(keys).size !== keys.length)
        offenders.push(`${where} ${q.kind} ${q.id}: ${JSON.stringify(q.options)}`);
    });
    expect(offenders).toEqual([]);
  });

  it("never renders the answer twice under a different id", () => {
    const offenders: string[] = [];
    everyQuestion((q, where) => {
      if (!hasOptions(q) || !("answer" in q) || typeof q.answer !== "string") return;
      const matches = q.options.filter((o) => key(o) === key(q.answer)).length;
      if (matches !== 1) offenders.push(`${where} ${q.kind} ${q.id}: answer appears ${matches}x`);
    });
    expect(offenders).toEqual([]);
  });

  it("keeps every question answerable (at least 3 options, answer present)", () => {
    const offenders: string[] = [];
    everyQuestion((q, where) => {
      if (!hasOptions(q)) return;
      if (q.options.length < 3) offenders.push(`${where} ${q.kind} ${q.id}: ${q.options.length} options`);
      if ("answer" in q && typeof q.answer === "string" && !q.options.some((o) => key(o) === key(q.answer)))
        offenders.push(`${where} ${q.kind} ${q.id}: answer missing from options`);
    });
    expect(offenders).toEqual([]);
  });

  it("keeps both sides of a matching grid unambiguous", () => {
    const offenders: string[] = [];
    everyQuestion((q, where) => {
      if (!isMatching(q)) return;
      const lefts = q.pairs.map((p) => key(p.left));
      const rights = q.pairs.map((p) => key(p.right));
      if (new Set(lefts).size !== lefts.length) offenders.push(`${where} ${q.id}: duplicate left label`);
      if (new Set(rights).size !== rights.length) offenders.push(`${where} ${q.id}: duplicate right label`);
    });
    expect(offenders).toEqual([]);
  });

  it("the shipped bank no longer collides on a same-theme gloss", () => {
    // die Frist / die Deadline is the audit's canonical pair. The linter errors on
    // this now; asserted here too so the pair cannot silently re-merge.
    const scheduling = vocabByTheme("scheduling");
    const frist = scheduling.find((v) => v.id === "v_frist");
    const deadline = scheduling.find((v) => v.id === "v_deadline");
    expect(frist, "v_frist is a shipped id").toBeTruthy();
    expect(deadline, "v_deadline is a shipped id").toBeTruthy();
    expect(key(frist!.en)).not.toBe(key(deadline!.en));
  });

  /**
   * The bank-wide tests above only prove the CURRENT data is clean, so they pass
   * even against the pre-fix engine. These use a SYNTHETIC colliding pair, which
   * is what actually pins the engine: they fail if the option assembly goes back
   * to filtering by id alone.
   */
  it("de-dupes options when two distinct entries share a label", () => {
    const base = {
      pron: "x",
      pos: "noun" as const,
      article: "die" as const,
      themeId: "scheduling" as const,
      context: "synthetic",
      related: [],
      examples: [
        { de: "Wir müssen die Zwiebel einhalten.", en: "synthetic 1" },
        { de: "Die Zwiebel läuft ab.", en: "synthetic 2" },
      ],
    };
    // Same English gloss under two ids (the die Frist / die Deadline shape), and
    // the same German headword under two ids (the der Reisepass shape).
    const collidingPool = [
      { ...base, id: "zz_a", de: "die Zwiebel", en: "same gloss", plural: "die Zwiebeln" },
      { ...base, id: "zz_b", de: "die Kartoffel", en: "same gloss", plural: "die Kartoffeln" },
      { ...base, id: "zz_c", de: "die Zwiebel", en: "other gloss", plural: "die Zwiebeln" },
      { ...base, id: "zz_d", de: "die Möhre", en: "third gloss", plural: "die Möhren" },
      { ...base, id: "zz_e", de: "die Gurke", en: "fourth gloss", plural: "die Gurken" },
    ];

    let checked = 0;
    for (let i = 0; i < 60; i++) {
      for (const q of buildPoolQuiz({ vocab: collidingPool, collocations: [] }, 1, 8)) {
        if (!hasOptions(q)) continue;
        checked++;
        const keys = q.options.map(key);
        expect(new Set(keys).size, `${q.kind} ${JSON.stringify(q.options)}`).toBe(keys.length);
        if ("answer" in q && typeof q.answer === "string")
          expect(q.options.filter((o) => key(o) === key(q.answer)).length).toBe(1);
      }
    }
    expect(checked, "the synthetic pool produced questions to check").toBeGreaterThan(0);
  });

  it("de-dupes a matching grid when two entries share a gloss", () => {
    const base = {
      pron: "x",
      pos: "noun" as const,
      article: "die" as const,
      themeId: "scheduling" as const,
      context: "synthetic",
      related: [],
      examples: [{ de: "Satz eins.", en: "one" }, { de: "Satz zwei.", en: "two" }],
    };
    const pool = [
      { ...base, id: "zz_m1", de: "die Alpha", en: "twin gloss" },
      { ...base, id: "zz_m2", de: "die Beta", en: "twin gloss" },
      { ...base, id: "zz_m3", de: "die Gamma", en: "g" },
      { ...base, id: "zz_m4", de: "die Delta", en: "d" },
      { ...base, id: "zz_m5", de: "die Epsilon", en: "e" },
      { ...base, id: "zz_m6", de: "die Zeta", en: "z" },
    ];
    for (let i = 0; i < 60; i++) {
      for (const q of buildPoolQuiz({ vocab: pool, collocations: [] }, 1, 8)) {
        if (!isMatching(q)) continue;
        const rights = q.pairs.map((p) => key(p.right));
        expect(new Set(rights).size, JSON.stringify(q.pairs)).toBe(rights.length);
      }
    }
  });
});
