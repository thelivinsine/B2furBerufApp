import { describe, it, expect } from "vitest";
import {
  composeMockExam,
  mockExamAvailability,
  planWritingTask,
  readingTextById,
  scoreChecks,
  totalScore,
  HUB_LEVELS,
  LISTENING_COUNT,
  MOCK_PART_ORDER,
  READING_COUNT,
  type MockExamLevel,
} from "@/engine/exam";
import { examSets } from "@/data/examSets";
import { scenarioById } from "@/data/dialogues";
import { levelBand } from "@/lib/writingScope";

const LEVELS: MockExamLevel[] = ["B1", "B2", "C1"];

describe("mock exam availability", () => {
  it("serves a complete four-part exam for B1, B2 and C1", () => {
    for (const level of LEVELS) {
      const a = mockExamAvailability(level);
      expect(a.complete, `level ${level}`).toBe(true);
    }
  });

  it("is honestly empty for A2 (no content anywhere yet)", () => {
    const a = mockExamAvailability("A2");
    expect(a.complete).toBe(false);
    expect(a.lesen + a.hoeren + a.schreiben + a.sprechen).toBe(0);
  });

  it("hub levels are exactly the four CEFR bands the settings know", () => {
    expect([...HUB_LEVELS]).toEqual(["A2", "B1", "B2", "C1"]);
  });
});

describe("composeMockExam", () => {
  it("draws full plans with the exam shape at every level", () => {
    for (const level of LEVELS) {
      const plan = composeMockExam(level);
      expect(plan.parts).toEqual(MOCK_PART_ORDER);
      expect(plan.lesen).toHaveLength(READING_COUNT);
      expect(plan.hoeren).toHaveLength(LISTENING_COUNT);
      expect(plan.schreiben).not.toBeNull();
      expect(plan.sprechen).not.toBeNull();

      // Reading and listening never serve the same text in one run, and
      // every id resolves.
      const all = [...plan.lesen, ...plan.hoeren];
      expect(new Set(all).size).toBe(all.length);
      for (const id of all) expect(readingTextById(id), id).toBeDefined();

      // A voicemail transcript never appears as a reading text.
      for (const id of plan.lesen) {
        expect(readingTextById(id)?.kind).not.toBe("voicemail");
      }
      // Listening only serves audio-natural kinds.
      for (const id of plan.hoeren) {
        expect(["voicemail", "announcement"]).toContain(readingTextById(id)?.kind);
      }

      // The writing task resolves, carries the full brief, and matches the
      // level (the exam draws only from the level's own band).
      const task = planWritingTask(plan);
      expect(task, level).toBeDefined();
      expect(task?.points?.length).toBeGreaterThan(0);
      expect(levelBand(task?.level)).toBe(level);

      // The speaking set resolves to a scenario.
      const set = examSets.find((e) => e.id === plan.sprechen);
      expect(set && scenarioById(set.scenarioId)).toBeTruthy();
    }
  });

  it("levels the reading texts to the level's own bands (B1/B2)", () => {
    // C1 is excluded here on purpose: its listening pool tops up from B2.2
    // (one C1 audio text exists), which is documented, not accidental.
    for (const level of ["B1", "B2"] as const) {
      const plan = composeMockExam(level);
      for (const id of [...plan.lesen, ...plan.hoeren]) {
        expect(levelBand(readingTextById(id)?.cefr)).toBe(level);
      }
    }
  });

  it("speaking difficulty follows the level ladder", () => {
    const levelOf = (planLevel: MockExamLevel) => {
      const plan = composeMockExam(planLevel, ["sprechen"]);
      const set = examSets.find((e) => e.id === plan.sprechen);
      return set ? scenarioById(set.scenarioId)?.level : undefined;
    };
    expect(levelOf("B1")).toBe(1);
    expect(levelOf("B2")).toBe(2);
    expect(levelOf("C1")).toBe(3);
  });

  it("single-part runs only draw that part", () => {
    const plan = composeMockExam("B2", ["lesen"]);
    expect(plan.parts).toEqual(["lesen"]);
    expect(plan.lesen).toHaveLength(READING_COUNT);
    expect(plan.hoeren).toHaveLength(0);
    expect(plan.schreiben).toBeNull();
    expect(plan.sprechen).toBeNull();
  });
});

describe("scoring", () => {
  it("scores checks against the bank's answers", () => {
    const plan = composeMockExam("B2", ["lesen"]);
    const texts = plan.lesen.map((id) => readingTextById(id)!);
    const answers: Record<string, string> = {};
    // Answer the first text fully right, everything else wrong/blank.
    for (const c of texts[0].checks) answers[c.id] = c.answer;
    const total = texts.reduce((n, t) => n + t.checks.length, 0);
    const r = scoreChecks(plan.lesen, answers);
    expect(r.total).toBe(total);
    expect(r.correct).toBe(texts[0].checks.length);
    expect(r.pct).toBe(Math.round((texts[0].checks.length / total) * 100));
  });

  it("renormalises the total over scored parts and never invents a number", () => {
    expect(totalScore(MOCK_PART_ORDER, {})).toEqual({ pct: null, scored: 0 });
    expect(
      totalScore(MOCK_PART_ORDER, {
        lesen: { pct: 80 },
        hoeren: { pct: 60 },
        // schreiben unscored (evaluator returned no number)
        schreiben: { pct: null },
        sprechen: { pct: 70 },
      }),
    ).toEqual({ pct: 70, scored: 3 });
  });
});
