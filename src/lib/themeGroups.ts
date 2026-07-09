import { themes, themeById } from "@/data/themes";
import { domains } from "@/data/domains";
import type { LearningMode } from "@/types";

/**
 * Domain-grouped theme options for the library's primary dropdown
 * (categorization audit PR 4, founder decision "Mode on top"): the Mode lens
 * stays the app-wide filter and PRE-SELECTS which domains show here, with
 * Domain as the visible in-library spine underneath. This is what makes
 * "Alltag: Bank & Finanzen" read as an errand, not an industry.
 */
export interface ThemeGroup {
  label: string;
  options: { value: string; label: string; count?: number }[];
}

export function themeGroupsForMode(
  mode: LearningMode,
  activeThemeId: string | undefined,
  countFor: (themeId: string) => number,
): ThemeGroup[] {
  // A deep-linked theme outside the mode's domains must stay selectable, so
  // its domain is kept visible rather than orphaning the Select value.
  const activeDomain =
    activeThemeId && activeThemeId !== "all" ? themeById(activeThemeId)?.domain : undefined;
  const visible = domains.filter(
    (d) => mode === "both" || d.context === "both" || d.context === mode || d.id === activeDomain,
  );
  return visible
    .map((d) => ({
      label: d.titleDe,
      options: themes
        .filter((t) => t.domain === d.id)
        .map((t) => ({ value: t.id, label: t.titleDe, count: countFor(t.id) })),
    }))
    .filter((g) => g.options.length > 0);
}
