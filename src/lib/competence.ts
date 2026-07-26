import { vocabulary, vocabByTheme } from "@/data/vocabulary";
import { themes } from "@/data/themes";
import { canDoByTheme } from "@/data/canDo";
import { mastery } from "@/engine/srs";
import { useProgressStore } from "@/store/useProgressStore";

/** A word counts as mastered from this retrievability up (the Fortschritt bar). */
export const MASTERED_AT = 0.8;

/**
 * Sample the learner's current competence into the daily history that feeds the
 * Fortschritt Kompetenzkurve.
 *
 * This module imports content banks, so it must only ever be reached from lazy
 * chunks (the Analytics page, the session player). Never import it from eager
 * code: the Dashboard must not pull a bank into the main chunk.
 */
export function recordCompetenceSnapshot(): void {
  const { srs, recordCompetence } = useProgressStore.getState();

  const mastered = vocabulary.filter((v) => mastery(srs[v.id]) >= MASTERED_AT).length;

  const achievedIds: string[] = [];
  for (const theme of themes) {
    const words = vocabByTheme(theme.id);
    if (words.length === 0) continue;
    const ratio = words.filter((w) => mastery(srs[w.id]) >= MASTERED_AT).length / words.length;
    for (const item of canDoByTheme(theme.id)) {
      if (ratio >= item.threshold) achievedIds.push(item.id);
    }
  }

  recordCompetence({ mastered, achievedIds });
}
