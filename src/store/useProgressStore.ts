import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade, SrsCard } from "@/types";
import { freshCard, review } from "@/engine/srs";
import { remapProgressIds } from "@/lib/idRenames";
import { daysBetween, todayKey } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";

interface ProgressState {
  xp: number;
  /** Per-day XP earned, keyed by YYYY-MM-DD. */
  dailyXp: Record<string, number>;
  streak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  /** Set of active day keys (for the calendar). */
  activeDays: string[];

  srs: Record<string, SrsCard>; // vocabId -> card
  redemittelSeen: Record<string, number>; // phraseId -> times practised
  scenariosDone: string[];
  examsDone: { id: string; score: number; date: string }[];
  totalSessions: number;
  /** Vocab ids the learner bookmarked for their custom deck (#29). */
  savedWords: string[];
  /**
   * Neuland game state (G1). Local-only for now: cloudSync's progress row has
   * a fixed column set, so these ride into Supabase only once the G2 schema
   * migration adds a column (an unknown column would fail the whole upsert).
   */
  missionsDone: string[];
  keyItems: string[];

  /**
   * Daily competence snapshots for the Fortschritt Kompetenzkurve, keyed by
   * YYYY-MM-DD: `w` = mastered vocabulary count, `c` = achieved Can-Do count.
   * FSRS keeps only CURRENT card state, so the "am I actually getting better"
   * curve cannot be reconstructed after the fact; it has to be sampled as the
   * learner goes. Written only from surfaces that already hold the content
   * banks (Analytics, session end via lib/competence.ts) — never from eager
   * code, which must not import a bank.
   */
  masteryHistory: Record<string, { w: number; c: number }>;
  /**
   * Milestone id → the day it was first observed as achieved, so the curve can
   * mark real wins. Milestones already achieved when sampling starts are
   * stamped `SEEDED_MILESTONE` instead of a date: they are genuinely achieved
   * but we do not know when, so they must never be drawn as "reached today".
   *
   * Both fields carry the same local-only caveat as missionsDone/keyItems: the
   * cloud `progress` row has a fixed column set, so they ride into Supabase
   * only once a schema migration adds a column for them.
   */
  canDoAchievedAt: Record<string, string>;

  addXp: (amount: number) => void;
  reviewVocab: (vocabId: string, grade: Grade, latencyMs?: number) => void;
  toggleSavedWord: (vocabId: string) => void;
  practiceRedemittel: (phraseId: string) => void;
  completeScenario: (scenarioId: string) => void;
  completeExam: (examId: string, score: number) => void;
  registerSession: () => void;
  completeMission: (missionId: string) => void;
  grantKeyItems: (itemIds: string[]) => void;
  recordCompetence: (input: { mastered: number; achievedIds: string[] }) => void;
  resetProgress: () => void;
}

/**
 * Stamp for a milestone that was already achieved before competence sampling
 * began (see `canDoAchievedAt`). Not a date, so it never plots as a dot.
 */
export const SEEDED_MILESTONE = "seed";

const defaults = {
  xp: 0,
  dailyXp: {} as Record<string, number>,
  streak: 0,
  longestStreak: 0,
  lastActiveDay: null as string | null,
  activeDays: [] as string[],
  srs: {} as Record<string, SrsCard>,
  redemittelSeen: {} as Record<string, number>,
  scenariosDone: [] as string[],
  examsDone: [] as { id: string; score: number; date: string }[],
  totalSessions: 0,
  savedWords: [] as string[],
  missionsDone: [] as string[],
  keyItems: [] as string[],
  masteryHistory: {} as Record<string, { w: number; c: number }>,
  canDoAchievedAt: {} as Record<string, string>,
};

/** Updates the streak bookkeeping for "today". */
function touchStreak(state: ProgressState): Partial<ProgressState> {
  const today = todayKey();
  if (state.lastActiveDay === today) return {};
  const gap = state.lastActiveDay ? daysBetween(state.lastActiveDay, today) : Infinity;
  const streak = gap === 1 ? state.streak + 1 : 1;
  const activeDays = state.activeDays.includes(today)
    ? state.activeDays
    : [...state.activeDays, today];
  return {
    streak,
    longestStreak: Math.max(state.longestStreak, streak),
    lastActiveDay: today,
    activeDays,
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...defaults,

      addXp: (amount) =>
        set((s) => {
          const today = todayKey();
          return {
            xp: s.xp + amount,
            dailyXp: { ...s.dailyXp, [today]: (s.dailyXp[today] ?? 0) + amount },
            ...touchStreak(s),
          };
        }),

      reviewVocab: (vocabId, grade, latencyMs) =>
        set((s) => {
          const card = s.srs[vocabId] ?? freshCard();
          const latencyGrading = useSettingsStore.getState().latencyGrading;
          return {
            srs: {
              ...s.srs,
              [vocabId]: review(card, grade, new Date(), latencyMs, { latencyGrading }),
            },
          };
        }),

      toggleSavedWord: (vocabId) =>
        set((s) => ({
          savedWords: s.savedWords.includes(vocabId)
            ? s.savedWords.filter((id) => id !== vocabId)
            : [...s.savedWords, vocabId],
        })),

      practiceRedemittel: (phraseId) =>
        set((s) => ({
          redemittelSeen: {
            ...s.redemittelSeen,
            [phraseId]: (s.redemittelSeen[phraseId] ?? 0) + 1,
          },
        })),

      completeScenario: (scenarioId) =>
        set((s) => ({
          scenariosDone: s.scenariosDone.includes(scenarioId)
            ? s.scenariosDone
            : [...s.scenariosDone, scenarioId],
        })),

      completeExam: (examId, score) =>
        set((s) => ({
          examsDone: [...s.examsDone, { id: examId, score, date: todayKey() }],
        })),

      registerSession: () => set((s) => ({ totalSessions: s.totalSessions + 1 })),

      completeMission: (missionId) =>
        set((s) => ({
          missionsDone: s.missionsDone.includes(missionId)
            ? s.missionsDone
            : [...s.missionsDone, missionId],
        })),

      grantKeyItems: (itemIds) =>
        set((s) => ({
          keyItems: Array.from(new Set([...s.keyItems, ...itemIds])),
        })),

      /**
       * Sample today's competence. Idempotent per day: repeated calls with the
       * same numbers are a no-op, and a day's entry always holds that day's
       * latest reading. `achievedIds` are the Can-Do milestones currently
       * reached; first-seen ids get today's date (or the seed stamp when this
       * is the very first sample, since their real date is unknown).
       */
      recordCompetence: ({ mastered, achievedIds }) =>
        set((s) => {
          const today = todayKey();
          const seeding = Object.keys(s.masteryHistory).length === 0;
          let achievedAt = s.canDoAchievedAt;
          let stamped = false;
          for (const id of achievedIds) {
            if (achievedAt[id]) continue;
            if (!stamped) {
              achievedAt = { ...achievedAt };
              stamped = true;
            }
            achievedAt[id] = seeding ? SEEDED_MILESTONE : today;
          }
          const sample = s.masteryHistory[today];
          const c = achievedIds.length;
          if (!stamped && sample && sample.w === mastered && sample.c === c) return {};
          return {
            masteryHistory: { ...s.masteryHistory, [today]: { w: mastered, c } },
            ...(stamped ? { canDoAchievedAt: achievedAt } : {}),
          };
        }),

      resetProgress: () =>
        set({ ...defaults, srs: {}, dailyXp: {}, masteryHistory: {}, canDoAchievedAt: {} }),
    }),
    {
      name: "b2beruf.progress.v1",
      // v1 (s130): apply the content-id rename table on rehydrate, so a
      // renamed id carries its FSRS history instead of orphaning it. With an
      // empty ID_RENAMES table this is a no-op passthrough.
      version: 1,
      migrate: (persisted) => remapProgressIds(persisted as ProgressState),
    },
  ),
);

/** Convenience selector: XP earned today. */
export function useTodayXp(): number {
  return useProgressStore((s) => s.dailyXp[todayKey()] ?? 0);
}

/**
 * Effective streak: returns the stored streak only when it's still alive
 * (lastActiveDay is today or yesterday). Returns 0 once the streak is broken
 * so the dashboard never shows a stale high value that then drops on next activity.
 */
export function useEffectiveStreak(): number {
  return useProgressStore((s) => {
    if (!s.lastActiveDay) return 0;
    const gap = daysBetween(s.lastActiveDay, todayKey());
    return gap <= 1 ? s.streak : 0;
  });
}

/** Non-hook accessor for one-off reads. */
export function getProgress() {
  return useProgressStore.getState();
}
