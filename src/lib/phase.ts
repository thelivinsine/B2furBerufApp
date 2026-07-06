/**
 * Per-theme progression phase (redesign Phase 4.5, audit rec #5a): a small
 * three-step label derived purely from a theme's mastery ratio (mastered /
 * total words). Reuses the app's two existing mastery bars so the ladder
 * lines up with what learners already see elsewhere: below the city
 * LIT_THRESHOLD (0.4) is still foundational, from there to the Can-Do/SRS
 * "mastered" bar (0.8, engine/srs.ts masteryLabel) is consolidation, and
 * above it the theme is in mixed review. No new state: callers already
 * compute this ratio (Analytics.tsx themeStats, components/city/mastery.ts).
 */
export type ThemePhase = "aufbau" | "festigen" | "gemischt";

const PHASE_LABELS: Record<ThemePhase, string> = {
  aufbau: "Aufbau",
  festigen: "Festigen",
  gemischt: "Gemischt",
};

export function themePhase(ratio: number): ThemePhase {
  if (ratio >= 0.8) return "gemischt";
  if (ratio >= 0.4) return "festigen";
  return "aufbau";
}

export function themePhaseLabel(ratio: number): string {
  return PHASE_LABELS[themePhase(ratio)];
}

export const THEME_PHASE_BADGE_VARIANT: Record<ThemePhase, "muted" | "accent" | "success"> = {
  aufbau: "muted",
  festigen: "accent",
  gemischt: "success",
};
