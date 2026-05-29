/** XP, level and streak math shared across every practice surface. */

export const XP_PER_LEVEL = 500;

export interface LevelInfo {
  level: number;
  intoLevel: number; // xp earned within the current level
  forLevel: number; // xp needed to clear the current level
  progress: number; // 0–1
}

export function levelFromXp(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    intoLevel,
    forLevel: XP_PER_LEVEL,
    progress: intoLevel / XP_PER_LEVEL,
  };
}

/** XP awards per activity, kept deliberately modest for a calm feel. */
export const XP = {
  flashcard: 6,
  flashcardEasy: 4,
  quizCorrect: 10,
  redemittel: 12,
  simulationTurn: 8,
  scenarioComplete: 60,
  examComplete: 120,
  dailyGoal: 40,
} as const;

export interface RankTier {
  name: string;
  min: number;
}

const TIERS: RankTier[] = [
  { name: "Einsteiger", min: 1 },
  { name: "Lernende:r", min: 4 },
  { name: "Sprecher:in", min: 8 },
  { name: "Verhandler:in", min: 14 },
  { name: "Profi", min: 22 },
  { name: "Examensreif", min: 32 },
];

export function tierForLevel(level: number): RankTier {
  let current = TIERS[0];
  for (const t of TIERS) if (level >= t.min) current = t;
  return current;
}
