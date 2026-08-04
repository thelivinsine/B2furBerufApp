import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  composeMockExam,
  MOCK_PART_ORDER,
  PART_MINUTES,
  type MockExamLevel,
  type MockExamPlan,
  type MockExamResults,
  type MockPartId,
  type MockPartResult,
} from "@/engine/exam";

/**
 * The one RUNNING mock exam (Prüfungssimulation rework, s186). Persisted so a
 * reload, a discarded iOS tab or a deploy-adoption never loses a run mid-part:
 * the plan freezes the drawn content ids, answers/notes/essay/remaining time
 * are written through on every change, and the runner re-renders the same exam
 * on resume. Exception: a Sprechen dialogue is not resumable mid-conversation;
 * the runner restarts that part with its full time (see SprechenPart).
 */

export type RunPhase = "intro" | "part" | "done";

export interface MockExamRun {
  startedAt: string;
  plan: MockExamPlan;
  /** Index into plan.parts. */
  partIx: number;
  phase: RunPhase;
  /** Remaining seconds of the CURRENT part while phase is "part". */
  remainingSec: number;
  /** MC answers: check id -> chosen option. */
  answers: Record<string, string>;
  /** Notizen inputs: note key -> learner text. */
  notes: Record<string, string>;
  /** Plays used per listening text id (exam rule: max 2). */
  plays: Record<string, number>;
  essay: string;
  results: MockExamResults;
}

export function currentPart(run: MockExamRun): MockPartId {
  return run.plan.parts[Math.min(run.partIx, run.plan.parts.length - 1)];
}

interface ExamStore {
  run: MockExamRun | null;
  start: (level: MockExamLevel, parts?: MockPartId[]) => void;
  /** Leave the exam without a result; the run is discarded. */
  abandon: () => void;
  /** Instruction page -> the part itself; arms this part's clock. */
  beginPart: (durationSec: number) => void;
  tick: () => void;
  answer: (checkId: string, option: string) => void;
  setNote: (key: string, value: string) => void;
  registerPlay: (textId: string) => void;
  setEssay: (text: string) => void;
  /** Store this part's result and advance to the next intro (or done). */
  completePart: (result: MockPartResult) => void;
  /** Close the result screen; the run is over. */
  finish: () => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set) => ({
      run: null,

      start: (level, parts = MOCK_PART_ORDER) =>
        set({
          run: {
            startedAt: new Date().toISOString(),
            plan: composeMockExam(level, parts),
            partIx: 0,
            phase: "intro",
            remainingSec: 0,
            answers: {},
            notes: {},
            plays: {},
            essay: "",
            results: {},
          },
        }),

      abandon: () => set({ run: null }),

      beginPart: (durationSec) =>
        set((s) =>
          s.run ? { run: { ...s.run, phase: "part", remainingSec: durationSec } } : s,
        ),

      tick: () =>
        set((s) =>
          s.run && s.run.phase === "part" && s.run.remainingSec > 0
            ? { run: { ...s.run, remainingSec: s.run.remainingSec - 1 } }
            : s,
        ),

      answer: (checkId, option) =>
        set((s) =>
          s.run
            ? { run: { ...s.run, answers: { ...s.run.answers, [checkId]: option } } }
            : s,
        ),

      setNote: (key, value) =>
        set((s) =>
          s.run ? { run: { ...s.run, notes: { ...s.run.notes, [key]: value } } } : s,
        ),

      registerPlay: (textId) =>
        set((s) =>
          s.run
            ? {
                run: {
                  ...s.run,
                  plays: { ...s.run.plays, [textId]: (s.run.plays[textId] ?? 0) + 1 },
                },
              }
            : s,
        ),

      setEssay: (text) => set((s) => (s.run ? { run: { ...s.run, essay: text } } : s)),

      completePart: (result) =>
        set((s) => {
          if (!s.run) return s;
          const part = currentPart(s.run);
          const results = { ...s.run.results, [part]: result };
          const nextIx = s.run.partIx + 1;
          const done = nextIx >= s.run.plan.parts.length;
          return {
            run: {
              ...s.run,
              results,
              partIx: done ? s.run.partIx : nextIx,
              phase: done ? "done" : "intro",
              remainingSec: 0,
            },
          };
        }),

      finish: () => set({ run: null }),
    }),
    { name: "b2beruf.exam.v1" },
  ),
);

export { PART_MINUTES };
