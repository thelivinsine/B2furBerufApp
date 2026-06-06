import type { LucideIcon } from "lucide-react";
import { Zap, BookOpen, Compass } from "lucide-react";

export interface Recommendation {
  /** Route for the primary CTA. */
  to: string;
  /** Primary CTA label. */
  label: string;
  /** Primary CTA icon. */
  icon: LucideIcon;
  /** Optional emphasis badge, e.g. "12 fällig". */
  badge?: string;
  /** Focal headline + supporting line for the hero. */
  headline: string;
  subline: string;
  /** True when the daily goal is met and nothing is due (celebratory state). */
  goalMet: boolean;
}

/**
 * Picks the single most useful next action for the dashboard hero, in priority
 * order: clear the review backlog → make progress toward today's goal →
 * (goal met, nothing due) keep the momentum with an optional extra round.
 *
 * Pure function — all inputs are derived from existing store selectors/engine
 * helpers by the caller, so it's trivially testable.
 */
export function recommendedNext(opts: {
  due: number;
  todayXp: number;
  goal: number;
  daysToExam: number | null;
}): Recommendation {
  const { due, todayXp, goal, daysToExam } = opts;
  const examLine =
    daysToExam !== null
      ? `Noch ${daysToExam} ${daysToExam === 1 ? "Tag" : "Tage"} bis zur Prüfung. Jeder Tag zählt.`
      : null;

  if (due > 0) {
    return {
      to: "/revision",
      label: "Schnellwiederholung starten",
      icon: Zap,
      badge: `${due} fällig`,
      headline: "Zeit zum Wiederholen",
      subline:
        examLine ??
        `${due} ${due === 1 ? "Karte ist" : "Karten sind"} heute fällig. Frisch dein Gedächtnis in 5 Minuten auf.`,
      goalMet: false,
    };
  }

  if (todayXp < goal) {
    return {
      to: "/vocabulary",
      label: "Weiter lernen",
      icon: BookOpen,
      headline: "Bereit für dein tägliches Training?",
      subline:
        examLine ??
        "Schon ein paar Minuten Wortschatz bringen dich heute näher an dein Ziel.",
      goalMet: false,
    };
  }

  return {
    to: "/simulation",
    label: "Sprechsimulation starten",
    icon: Compass,
    headline: "Tagesziel erreicht 🎉",
    subline:
      examLine ?? "Stark! Lust auf eine Extra-Runde? Übe das Sprechen oder erkunde ein neues Thema.",
    goalMet: true,
  };
}
