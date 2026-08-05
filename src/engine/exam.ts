import { texts } from "@/data/texts";
import { examSets } from "@/data/examSets";
import { scenarioById } from "@/data/dialogues";
import { eligibleTasks, randomTask, taskAt, type WritingTaskRef } from "@/lib/writingScope";
import type { ContentCefr, ReadingText } from "@/types";
import type { WritingTask } from "@/data/writingPrompts";
import type { WritingLength } from "@/lib/writing";

/**
 * Mock exam composer (Prüfungssimulation rework, s186).
 *
 * A mock exam is FOUR timed parts in the telc/Goethe order: Lesen, Hören,
 * Schreiben, Sprechen. Every part draws from the existing banks; this module
 * only selects and scores, it never authors. The Niveau decides the pool:
 * reading/listening by CEFR band, writing by the task's Niveau tag, speaking
 * by the scenario's 1-3 difficulty ladder.
 *
 * Content honesty: `mockExamAvailability` reports what a level can actually
 * serve, and the hub greys out what it cannot (A2 has no content anywhere
 * yet; C1 listening tops up from B2.2 because the bank holds a single C1
 * audio text, both are flagged in PROJECT_REFERENCE as authoring gaps).
 */

/** Levels the hub offers. A2 is visible but unservable until content exists. */
export const HUB_LEVELS = ["A2", "B1", "B2", "C1"] as const;
export type HubLevel = (typeof HUB_LEVELS)[number];
/** Levels a mock exam can actually be composed for today. */
export type MockExamLevel = "B1" | "B2" | "C1";

export type MockPartId = "lesen" | "hoeren" | "schreiben" | "sprechen";

export const MOCK_PART_ORDER: MockPartId[] = ["lesen", "hoeren", "schreiben", "sprechen"];

export const PART_LABEL: Record<MockPartId, string> = {
  lesen: "Lesen",
  hoeren: "Hören",
  schreiben: "Schreiben",
  sprechen: "Sprechen",
};

/** Compact timings sized to the content volume, not the real 4h exam day. */
export const PART_MINUTES: Record<MockPartId, number> = {
  lesen: 15,
  hoeren: 10,
  schreiben: 20,
  sprechen: 7,
};

export const READING_COUNT = 3;
export const LISTENING_COUNT = 2;
/** Like the real Hören: each recording plays at most twice. */
export const MAX_PLAYS = 2;
/** telc pass line. */
export const PASS_PCT = 60;

const LEVEL_BANDS: Record<MockExamLevel, ContentCefr[]> = {
  B1: ["B1.1", "B1.2"],
  B2: ["B2.1", "B2.2"],
  C1: ["C1"],
};

/**
 * Listening pools may need to reach below their band: the bank holds one C1
 * audio text, so a C1 Hören tops up from the next band down rather than
 * serving a one-Ansage part. Reading never tops up (every band has enough).
 */
const LISTENING_TOPUP: Record<MockExamLevel, ContentCefr[]> = {
  B1: [],
  B2: [],
  C1: ["B2.2", "B2.1"],
};

/** Kinds that read naturally as audio (voicemail scripts, Durchsagen). */
const AUDIO_KINDS = new Set(["voicemail", "announcement"]);

const SPEAKING_LEVEL: Record<MockExamLevel, 1 | 2 | 3> = { B1: 1, B2: 2, C1: 3 };

const textById = new Map(texts.map((t) => [t.id, t]));

export function readingTextById(id: string): ReadingText | undefined {
  return textById.get(id);
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function listeningPool(level: MockExamLevel): ReadingText[] {
  const bands = new Set(LEVEL_BANDS[level]);
  const pool = texts.filter((t) => AUDIO_KINDS.has(t.kind) && bands.has(t.cefr));
  for (const band of LISTENING_TOPUP[level]) {
    if (pool.length >= LISTENING_COUNT) break;
    pool.push(...texts.filter((t) => AUDIO_KINDS.has(t.kind) && t.cefr === band));
  }
  return pool;
}

function readingPool(level: MockExamLevel): ReadingText[] {
  const bands = new Set(LEVEL_BANDS[level]);
  // Audio material stays in Hören. Excluding only voicemails left every
  // Durchsage eligible as a reading text (38% of the B2 pool, audit P15), so a
  // Lesen part regularly served listening material read silently. The pools
  // stay servable without them: B1 9, B2 16, C1 5, all above READING_COUNT.
  return texts.filter((t) => !AUDIO_KINDS.has(t.kind) && bands.has(t.cefr));
}

/**
 * The CEFR band a Modelltest level is pitched at, for anything that needs one
 * band rather than the level's pair (the spoken brief, audit P6). The lower
 * half of a band is where a level's own exam sits: a B2 candidate is prepared
 * for B2, not held to B2.2.
 */
export const EXAM_BAND: Record<MockExamLevel, ContentCefr> = {
  B1: "B1.2",
  B2: "B2.1",
  C1: "C1",
};

/** B1 writes the short format (Goethe B1: 40-80 words); B2/C1 the long one. */
export function writingLengthFor(level: MockExamLevel): WritingLength {
  return level === "B1" ? "short" : "long";
}

function writingRefs(level: MockExamLevel): WritingTaskRef[] {
  return eligibleTasks({
    theme: "",
    sub: "",
    sector: "",
    level,
    format: "",
    length: writingLengthFor(level),
  });
}

function speakingSets(level: MockExamLevel) {
  const want = SPEAKING_LEVEL[level];
  const byLevel = (lv: number) =>
    examSets.filter((ex) => scenarioById(ex.scenarioId)?.level === lv);
  const exact = byLevel(want);
  if (exact.length) return exact;
  // Nearest ladder step, so a thin level still yields a speaking part.
  for (const lv of [want - 1, want + 1, want - 2, want + 2]) {
    const near = byLevel(lv);
    if (near.length) return near;
  }
  return [];
}

export interface MockExamPlan {
  level: MockExamLevel;
  parts: MockPartId[];
  /** ReadingText ids, in serving order. */
  lesen: string[];
  /** ReadingText ids (voicemail/announcement), in serving order. */
  hoeren: string[];
  schreiben: WritingTaskRef | null;
  /** ExamSet id for the dialogue runner. */
  sprechen: string | null;
}

/**
 * Compose one run. Parts default to the full exam; a single-part run passes
 * `["lesen"]` etc. Selection is random per run so retakes vary; the ids are
 * frozen into the plan so a resumed run re-renders the same exam.
 */
export function composeMockExam(
  level: MockExamLevel,
  parts: MockPartId[] = MOCK_PART_ORDER,
): MockExamPlan {
  const hoeren = parts.includes("hoeren")
    ? shuffle(listeningPool(level)).slice(0, LISTENING_COUNT).map((t) => t.id)
    : [];
  const used = new Set(hoeren);
  const lesen = parts.includes("lesen")
    ? shuffle(readingPool(level))
        .filter((t) => !used.has(t.id))
        .slice(0, READING_COUNT)
        .map((t) => t.id)
    : [];
  const schreiben = parts.includes("schreiben")
    ? randomTask(writingRefs(level))
    : null;
  const speaking = parts.includes("sprechen") ? speakingSets(level) : [];
  const sprechen = speaking.length
    ? speaking[Math.floor(Math.random() * speaking.length)].id
    : null;
  return { level, parts, lesen, hoeren, schreiben, sprechen };
}

/** The writing task behind a plan, resolved with the stale-ref guard. */
export function planWritingTask(plan: MockExamPlan): WritingTask | undefined {
  if (!plan.schreiben) return undefined;
  return taskAt(plan.schreiben, writingLengthFor(plan.level));
}

/* ------------------------------ availability ------------------------------ */

export interface MockExamAvailability {
  lesen: number;
  hoeren: number;
  schreiben: number;
  sprechen: number;
  /** True when every part can be served at this level. */
  complete: boolean;
}

/** What a Niveau can honestly serve; the hub greys out what it cannot. */
export function mockExamAvailability(level: HubLevel): MockExamAvailability {
  if (level === "A2") {
    return { lesen: 0, hoeren: 0, schreiben: 0, sprechen: 0, complete: false };
  }
  const lesen = readingPool(level).length;
  const hoeren = listeningPool(level).length;
  const schreiben = writingRefs(level).length;
  const sprechen = speakingSets(level).length;
  return {
    lesen,
    hoeren,
    schreiben,
    sprechen,
    complete:
      lesen >= READING_COUNT &&
      hoeren >= LISTENING_COUNT &&
      schreiben > 0 &&
      sprechen > 0,
  };
}

/* -------------------------------- scoring -------------------------------- */

export interface MockPartResult {
  /**
   * 0-100, or null when this part produced no score (the writing evaluator
   * can return feedback without a number, e.g. on a cache hit from before the
   * score field or when the daily AI allowance is spent).
   */
  pct: number | null;
  /** MC parts: how many answers were right out of how many. */
  correct?: number;
  total?: number;
  /** Writing: the evaluator's verdict, shown on the result screen. */
  weakness?: string;
  insight?: string;
  corrected?: string | null;
}

export type MockExamResults = Partial<Record<MockPartId, MockPartResult>>;

/** Percentage for a set of answered multiple-choice checks. */
export function scoreChecks(
  textIds: string[],
  answers: Record<string, string>,
): MockPartResult {
  let correct = 0;
  let total = 0;
  for (const id of textIds) {
    const text = textById.get(id);
    if (!text) continue;
    for (const check of text.checks) {
      total += 1;
      if (answers[check.id] === check.answer) correct += 1;
    }
  }
  return { pct: total ? Math.round((correct / total) * 100) : null, correct, total };
}

/**
 * The run total: equal-weighted mean over the parts that produced a score.
 * An unscored Schreiben (see MockPartResult.pct) narrows the base instead of
 * counting as zero, and the result screen says so.
 */
export function totalScore(
  parts: MockPartId[],
  results: MockExamResults,
): { pct: number | null; scored: number } {
  const scores = parts
    .map((p) => results[p]?.pct)
    .filter((v): v is number => typeof v === "number");
  if (!scores.length) return { pct: null, scored: 0 };
  return {
    pct: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    scored: scores.length,
  };
}
