import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  composeMockExam,
  MOCK_PART_ORDER,
  PART_MINUTES,
  type MockExamLevel,
  type MockExamPicks,
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
  /**
   * Remaining seconds of the CURRENT part while phase is "part". DERIVED from
   * `endsAt` by `tick`; never decremented on its own since the s194 audit (P3),
   * because a tick counter is not a clock: browsers throttle a background tab's
   * interval to about one tick a minute, and a reload resumed from whatever was
   * last persisted, so switching tabs or refreshing paused a timed exam.
   */
  remainingSec: number;
  /**
   * Epoch ms when the current part's time is up. Undefined on a run persisted
   * before s194, which then falls back to the old decrement so an exam in
   * flight across the deploy still finishes.
   */
  endsAt?: number;
  /** MC answers: check id -> chosen option. */
  answers: Record<string, string>;
  /** Notizen inputs: note key -> learner text. */
  notes: Record<string, string>;
  /** Plays used per listening text id (exam rule: max 2). */
  plays: Record<string, number>;
  essay: string;
  results: MockExamResults;
  /**
   * A module started in "Ohne Zeit" (s189). Same draw, same scoring, no clock:
   * nothing ticks, the timer pill is hidden and the part is never auto-handed
   * in. Optional so a run persisted before s189 resumes as timed.
   */
  untimed?: boolean;
}

export function currentPart(run: MockExamRun): MockPartId {
  return run.plan.parts[Math.min(run.partIx, run.plan.parts.length - 1)];
}

interface ExamStore {
  run: MockExamRun | null;
  start: (
    level: MockExamLevel,
    parts?: MockPartId[],
    opts?: { untimed?: boolean; picks?: MockExamPicks },
  ) => void;
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

      start: (level, parts = MOCK_PART_ORDER, opts) =>
        set({
          run: {
            untimed: opts?.untimed ?? false,
            startedAt: new Date().toISOString(),
            plan: composeMockExam(level, parts, opts?.picks),
            partIx: 0,
            // The Anleitung page IS the exam frame ("Prüfungsteil", the minutes,
            // "der Timer läuft, sobald du startest"), so Ohne Zeit skips it and
            // opens the drill directly (founder s192: "this screen mode
            // represents exam mode, this should only be shown in mit zeit").
            // That also makes the four modules consistent: Schreiben and
            // Sprechen ohne Zeit land straight in their trainer.
            phase: opts?.untimed ? "part" : "intro",
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
          s.run
            ? {
                run: {
                  ...s.run,
                  phase: "part",
                  remainingSec: durationSec,
                  // Wall clock, armed once. Untimed runs never read it.
                  endsAt: s.run.untimed ? undefined : Date.now() + durationSec * 1000,
                },
              }
            : s,
        ),

      tick: () =>
        set((s) => {
          const run = s.run;
          if (!run || run.untimed || run.phase !== "part") return s;
          if (run.endsAt == null) {
            // Legacy run (persisted before s194): no deadline to measure
            // against, so it keeps counting down the way it was started.
            return run.remainingSec > 0
              ? { run: { ...run, remainingSec: run.remainingSec - 1 } }
              : s;
          }
          const next = Math.max(0, Math.ceil((run.endsAt - Date.now()) / 1000));
          return next === run.remainingSec ? s : { run: { ...run, remainingSec: next } };
        }),

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
              // Same fold as `start`: without a clock there is no Anleitung to
              // hand the next part over, because there is no clock to arm.
              phase: done ? "done" : s.run.untimed ? "part" : "intro",
              remainingSec: 0,
              endsAt: undefined,
            },
          };
        }),

      finish: () => set({ run: null }),
    }),
    { name: "b2beruf.exam.v1" },
  ),
);

export { PART_MINUTES };
