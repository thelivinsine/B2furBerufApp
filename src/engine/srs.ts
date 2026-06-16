import type { Grade, SrsCard } from "@/types";
import { todayKey } from "@/lib/utils";

/**
 * A compact SM-2 spaced-repetition scheduler.
 * Grades: 0 = "Again", 3 = "Hard", 4 = "Good", 5 = "Easy".
 */

export function freshCard(due: string = todayKey()): SrsCard {
  return { ease: 2.5, interval: 0, reps: 0, due };
}

export function review(card: SrsCard, grade: Grade, on: Date = new Date()): SrsCard {
  let { ease, interval, reps } = card;

  if (grade < 3) {
    // Lapse: reset reps, short relearning step.
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 4;
    else interval = Math.round(interval * ease);
  }

  // Adjust ease factor per SM-2. This applies on every review, including a
  // lapse, so a repeatedly failed card loses ease and resurfaces sooner.
  ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  ease = Math.max(1.3, ease);

  const next = new Date(on);
  next.setDate(next.getDate() + interval);

  return { ease, interval, reps, due: todayKey(next), lastGrade: grade };
}

export function isDue(card: SrsCard | undefined, today: string = todayKey()): boolean {
  if (!card) return true; // never studied → due
  return card.due <= today;
}

/** Mastery as a 0–1 score derived from reps + interval. */
export function mastery(card: SrsCard | undefined): number {
  if (!card || card.reps === 0) return 0;
  const byReps = Math.min(card.reps / 5, 1);
  const byInterval = Math.min(card.interval / 30, 1);
  return Math.round((byReps * 0.5 + byInterval * 0.5) * 100) / 100;
}

export function masteryLabel(score: number): "new" | "learning" | "review" | "mastered" {
  if (score <= 0) return "new";
  if (score < 0.4) return "learning";
  if (score < 0.8) return "review";
  return "mastered";
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
