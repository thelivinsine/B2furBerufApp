import type { Grade, SrsCard } from "@/types";
import { clamp, daysBetween, todayKey } from "@/lib/utils";

/**
 * A compact FSRS-6 spaced-repetition scheduler (Learning Engine Phase 1, 26b).
 * Grades: 0 = "Again", 3 = "Hard", 4 = "Good", 5 = "Easy".
 *
 * Hand-rolled from the published FSRS algorithm, matched against the
 * open-spaced-repetition reference implementation (py-fsrs 6.3.1) configured
 * for this app's semantics: day-granular scheduling with no sub-day
 * learning/relearning steps, no interval fuzzing, desired retention 0.9.
 * `scripts/test-srs.mjs` (CI gate `pnpm test:srs`) asserts this file against
 * golden vectors generated from that reference implementation.
 *
 * Memory state lives in `SrsCard.stability` (days until retrievability decays
 * to 90%) and `SrsCard.difficulty` (1..10). The legacy SM-2 fields (`ease`,
 * `interval`, `reps`, `due`) are retained and kept warm on every review so
 * reverting this file to the SM-2 version would restore the old scheduling
 * behavior with no data repair. Cards written by the SM-2 era lack
 * stability/difficulty and are seeded lazily on their first FSRS review;
 * untouched cards stay legacy, and `mastery()` reads identically for them.
 */

/**
 * FSRS-6 default model weights (21 parameters) from the open-spaced-repetition
 * project (py-fsrs 6.3.1 `DEFAULT_PARAMETERS`). w[20] is the trainable decay.
 */
const W = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666,
  0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912,
  0.0658, 0.1542,
] as const;

const DECAY = -W[20];
/** Chosen so retrievability(S, S) is exactly 0.9. */
const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;
const DESIRED_RETENTION = 0.9;
const STABILITY_MIN = 0.001;
const MAX_INTERVAL_DAYS = 36500;

/**
 * Phase 1.5 latency plug-in ("correct but slow"). When enabled, a Good rating
 * whose response was markedly slower than the card's OWN latency EMA is graded
 * as Hard instead, so a laboured recall schedules sooner. Deliberately
 * conservative and self-relative:
 * - `LATENCY_MIN_SAMPLES` prior samples are required before the EMA is trusted
 *   (a first-sample EMA is just the sample, which carries no "slower than usual"
 *   information).
 * - the trigger is purely the ratio to the card's own EMA, never an absolute
 *   cross-format threshold (flashcard flip time and MCQ select time are
 *   different quantities and share one card's EMA).
 * - `LATENCY_SLOW_FLOOR_MS` only *blocks* demotion of an answer that is fast in
 *   absolute terms (a low-EMA card whose sample beats the ratio but is still a
 *   sub-2s, obviously-confident recall); it can never cause a demotion.
 */
const LATENCY_MIN_SAMPLES = 3;
const LATENCY_SLOW_FACTOR = 1.5;
const LATENCY_SLOW_FLOOR_MS = 2000;

/** FSRS rating scale: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy. */
type Rating = 1 | 2 | 3 | 4;

function toRating(grade: Grade): Rating {
  if (grade === 0) return 1;
  if (grade === 3) return 2;
  if (grade === 4) return 3;
  return 4;
}

const clampD = (d: number) => clamp(d, 1, 10);
const clampS = (s: number) => Math.max(s, STABILITY_MIN);

function initStability(rating: Rating): number {
  return clampS(W[rating - 1]);
}

/**
 * The mean-reversion target inside `nextDifficulty` uses the UNclamped
 * initial-difficulty of Easy (which is negative under the default weights),
 * exactly as the reference implementation does.
 */
function initDifficulty(rating: Rating): number {
  return W[4] - Math.exp(W[5] * (rating - 1)) + 1;
}

/** Predicted recall probability after `elapsedDays` at stability S. */
function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

/** Days until retrievability decays to the desired retention. */
function nextIntervalDays(stability: number): number {
  const ivl = (stability / FACTOR) * (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1);
  return clamp(Math.round(ivl), 1, MAX_INTERVAL_DAYS);
}

function nextDifficulty(difficulty: number, rating: Rating): number {
  const delta = -W[6] * (rating - 3);
  const damped = difficulty + (delta * (10 - difficulty)) / 9;
  const reverted = W[7] * initDifficulty(4) + (1 - W[7]) * damped;
  return clampD(reverted);
}

/** Same-day repeat: the short-term stability update (no retrievability term). */
function shortTermStability(stability: number, rating: Rating): number {
  let inc =
    Math.exp(W[17] * (rating - 3 + W[18])) * Math.pow(stability, -W[19]);
  if (rating >= 3) inc = Math.max(inc, 1);
  return clampS(stability * inc);
}

function nextRecallStability(
  difficulty: number,
  stability: number,
  retr: number,
  rating: Rating,
): number {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus = rating === 4 ? W[16] : 1;
  return clampS(
    stability *
      (1 +
        Math.exp(W[8]) *
          (11 - difficulty) *
          Math.pow(stability, -W[9]) *
          (Math.exp((1 - retr) * W[10]) - 1) *
          hardPenalty *
          easyBonus),
  );
}

function nextForgetStability(
  difficulty: number,
  stability: number,
  retr: number,
): number {
  const longTerm =
    W[11] *
    Math.pow(difficulty, -W[12]) *
    (Math.pow(stability + 1, W[13]) - 1) *
    Math.exp((1 - retr) * W[14]);
  const shortTermCap = stability / Math.exp(W[17] * W[18]);
  return clampS(Math.min(longTerm, shortTermCap));
}

/**
 * Seed FSRS state for a card that was scheduled by the SM-2 era (has reps or
 * an interval but no stability). Stability comes from the current interval;
 * difficulty maps inversely and linearly from SM-2 ease (ease 1.3 -> D 10,
 * ease 2.5 -> D 3, above 2.5 continuing down toward the clamp at 1).
 */
function seedFromLegacy(card: SrsCard): { stability: number; difficulty: number } {
  return {
    stability: Math.max(0.5, card.interval),
    difficulty: clampD(10 - (card.ease - 1.3) * (7 / 1.2)),
  };
}

/**
 * Whole days since the card's last review, derived from the stored day-granular
 * state: the last review happened `interval` days before `due`. Falls back to
 * "reviewed on time" if the due key is malformed.
 */
function elapsedSinceLastReview(card: SrsCard, on: Date): number {
  const due = new Date(card.due + "T00:00:00");
  if (Number.isNaN(due.getTime())) return card.interval;
  due.setDate(due.getDate() - card.interval);
  return Math.max(0, daysBetween(todayKey(due), todayKey(on)));
}

export function freshCard(due: string = todayKey()): SrsCard {
  return { ease: 2.5, interval: 0, reps: 0, due };
}

export function review(
  card: SrsCard,
  grade: Grade,
  on: Date = new Date(),
  latencyMs?: number,
  opts: { latencyGrading?: boolean } = {},
): SrsCard {
  // Clamp this review's latency sample (26a). `undefined` = no sample this call.
  const sampleMs =
    typeof latencyMs === "number" && Number.isFinite(latencyMs) && latencyMs > 0
      ? Math.min(Math.round(latencyMs), 60000)
      : undefined;

  // Phase 1.5: "correct but slow" demotes Good -> Hard, relative to the card's
  // own latency EMA and only once that EMA is trustworthy. The decision reads
  // the PRIOR emaMs/msCount, before this sample is folded in below.
  const effectiveGrade: Grade =
    opts.latencyGrading &&
    grade === 4 &&
    sampleMs !== undefined &&
    (card.msCount ?? 0) >= LATENCY_MIN_SAMPLES &&
    card.emaMs != null &&
    sampleMs > card.emaMs * LATENCY_SLOW_FACTOR &&
    sampleMs > LATENCY_SLOW_FLOOR_MS
      ? 3
      : grade;

  const rating = toRating(effectiveGrade);

  let stability: number;
  let difficulty: number;

  const neverReviewed =
    card.stability === undefined && card.reps === 0 && card.interval === 0;

  if (neverReviewed) {
    // First review of a fresh card: the initial memory state IS the outcome.
    stability = initStability(rating);
    difficulty = clampD(initDifficulty(rating));
  } else {
    // Established card. Legacy SM-2 cards are seeded lazily here, then take
    // the normal FSRS review step.
    const seeded =
      card.stability === undefined || card.difficulty === undefined
        ? seedFromLegacy(card)
        : { stability: card.stability, difficulty: card.difficulty };

    const elapsed = elapsedSinceLastReview(card, on);
    if (elapsed < 1) {
      stability = shortTermStability(seeded.stability, rating);
    } else {
      const retr = retrievability(elapsed, seeded.stability);
      stability =
        rating === 1
          ? nextForgetStability(seeded.difficulty, seeded.stability, retr)
          : nextRecallStability(seeded.difficulty, seeded.stability, retr, rating);
    }
    difficulty = nextDifficulty(seeded.difficulty, rating);
  }

  const interval = nextIntervalDays(stability);
  const next = new Date(on);
  next.setDate(next.getDate() + interval);

  // reps is a total-review counter (it no longer resets on a lapse): it must
  // only grow so cloudSync's mergeSrs higher-reps-wins rule keeps picking the
  // more recently studied card.
  const reps = card.reps + 1;

  // Keep the SM-2 ease factor warm (same update rule as the old scheduler) so
  // reverting this file to SM-2 restores sensible scheduling with no data
  // repair. FSRS itself never reads it. Uses the effective (possibly demoted)
  // grade so a reverted SM-2 engine stays consistent with the FSRS scheduling.
  const ease = Math.max(
    1.3,
    card.ease + (0.1 - (5 - effectiveGrade) * (0.08 + (5 - effectiveGrade) * 0.02)),
  );

  // Response-latency capture (26a). A latency-less call carries the previous
  // samples (and their count) forward unchanged, so it never wipes history.
  let { lastMs, emaMs, msCount } = card;
  if (sampleMs !== undefined) {
    lastMs = sampleMs;
    emaMs = card.emaMs == null ? sampleMs : Math.round(0.3 * sampleMs + 0.7 * card.emaMs);
    msCount = (card.msCount ?? 0) + 1;
  }

  return {
    ease,
    interval,
    reps,
    due: todayKey(next),
    // The learner's actual button press, not the possibly-demoted scheduling
    // grade: this is the honest record of what they rated.
    lastGrade: grade,
    lastMs,
    emaMs,
    msCount,
    stability,
    difficulty,
  };
}

export function isDue(card: SrsCard | undefined, today: string = todayKey()): boolean {
  if (!card) return true; // never studied → due
  return card.due <= today;
}

/**
 * Mastery as a 0–1 score derived from reps + memory stability. Legacy cards
 * without FSRS state fall back to their SM-2 interval, which is also what
 * their stability would be seeded from, so the score reads identically for
 * untouched cards and the theme grid / Can-Do thresholds stay stable across
 * the migration.
 */
export function mastery(card: SrsCard | undefined): number {
  if (!card || card.reps === 0) return 0;
  const byReps = Math.min(card.reps / 5, 1);
  const byStability = Math.min((card.stability ?? card.interval) / 30, 1);
  return Math.round((byReps * 0.5 + byStability * 0.5) * 100) / 100;
}

export function masteryLabel(score: number): "new" | "learning" | "review" | "mastered" {
  if (score <= 0) return "new";
  if (score < 0.4) return "learning";
  if (score < 0.8) return "review";
  return "mastered";
}

/**
 * Priority weight for the adaptive review queue (Taxonomy Phase 4): higher =
 * surface sooner. Weaker cards rank above stronger ones, and cards relevant to
 * the active Mode lens (or a weak CEFR band) get a boost. Kept pure and
 * data-agnostic (no content imports) so the engine stays decoupled — callers
 * pass the already-computed flags.
 */
export function reviewWeight(
  card: SrsCard | undefined,
  opts: { modeMatch?: boolean; levelMatch?: boolean; saved?: boolean; jitter?: number } = {},
): number {
  let w = 1 - mastery(card); // 0 (mastered) → 1 (never studied)
  if (opts.modeMatch) w += 1; // relevant to the chosen work/personal lens
  if (opts.saved) w += 1; // the learner bookmarked it into their custom deck (#29)
  if (opts.levelMatch) w += 0.5; // sits in a CEFR band the learner is weak at
  w += opts.jitter ?? 0; // tie-break + session-to-session variety
  return w;
}

/**
 * Review backlog: how many *started* cards in the SRS store are due today.
 * Never-studied words aren't in the store, so they're intentionally excluded
 * here — this is the "to review" count, not the "new to learn" queue (which is
 * what QuickRevision's deck builder adds on top).
 */
export function dueCount(srs: Record<string, SrsCard>, today: string = todayKey()): number {
  let n = 0;
  for (const id in srs) {
    if (isDue(srs[id], today)) n += 1;
  }
  return n;
}
