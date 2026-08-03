import { themeById } from "@/data/themes";
import { domainById } from "@/data/domains";
import { matchesLifeArea, themeGroupsByArea, type LifeAreaId } from "@/lib/lifeAreas";
import type { DomainId, LearningMode } from "@/types";

/**
 * Life-area-grouped theme options for every learner-facing Thema dropdown
 * (Bibliothek and Schreiben both call this).
 *
 * It used to group by the five content domains, so the dropdown could show
 * five headings and the Schreiben rail three (it folded Gesundheit but not
 * Bildung). Founder, 2026-07-31: "there has to be only two overarching
 * categories similar to the nodal graphs in bibliothek. This has to be
 * consistent across the app." The fold now comes from `lib/lifeAreas.ts`, the
 * one place that decides it, so a new domain cannot reintroduce a third
 * heading anywhere.
 *
 * The Mode lens still PRE-SELECTS which content shows (founder decision "Mode
 * on top"); it filters the themes inside the two groups rather than changing
 * the headings.
 */
export interface ThemeGroup {
  label: string;
  options: { value: string; label: string; count?: number }[];
}

export function themeGroupsForMode(
  mode: LearningMode,
  activeThemeIds: string[],
  countFor: (themeId: string) => number,
  /**
   * Active Lebensbereich pill (s184). The pills sit ABOVE Thema in the rail, so
   * picking one narrows this dropdown to that area's Themen: the remaining
   * heading is then the pill the learner already chose, never a second group
   * whose every option reads 0. An active theme still survives (same escape
   * hatch the Mode lens uses) so a deep link cannot orphan its own selection.
   */
  area: LifeAreaId | "" = "",
): ThemeGroup[] {
  // A deep-linked theme outside the mode's domains must stay selectable, so
  // every active theme's domain is kept visible rather than orphaning the
  // selection (s104: a multi-select Thema can span several domains at once).
  const activeDomains = new Set(
    activeThemeIds.map((id) => themeById(id)?.domain).filter((d): d is DomainId => !!d),
  );
  const inMode = (domain: DomainId | undefined) => {
    const d = domain ? domainById(domain) : undefined;
    if (!d) return mode === "both";
    return mode === "both" || d.context === "both" || d.context === mode || activeDomains.has(d.id);
  };
  const active = new Set(activeThemeIds);
  return themeGroupsByArea(countFor, {
    include: (id) =>
      inMode(themeById(id)?.domain) && (matchesLifeArea(id, area) || active.has(id)),
  });
}
