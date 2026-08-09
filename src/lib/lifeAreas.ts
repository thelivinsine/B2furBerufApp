import { domains } from "@/data/domains";
import { uiLangNow } from "@/lib/uiLang";
import { themes } from "@/data/themes";
import type { DomainId } from "@/types";

/**
 * The ONE learner-facing categorization: two life areas, Berufsleben and
 * Alltag.
 *
 * The content spine has five domains (`beruf`, `alltag`, `gesundheit`,
 * `bildung`, `pruefung`) and that grain is real: it drives authoring, coverage
 * reports and the city buildings. It is NOT what a learner picking a Thema
 * should have to reason about. Every learner-facing grouping collapses it to
 * two, because the product is "the workplace, plus everyday life" and a third
 * or fourth heading in a dropdown reads as a category the learner has to
 * decide about.
 *
 * Before this module each surface folded on its own and they disagreed
 * (founder, 2026-07-31, on the Schreiben Thema dropdown: "there seems to be
 * some topics in the themen dropdown which are non-beruf but are not part of
 * alltag"). The graphs already showed two areas (2026-07-19) while the
 * Schreiben rail showed three (Gesundheit folded, Bildung not) and the
 * Bibliothek dropdown showed up to five. Now all three read from here.
 *
 * Naming: **Berufsleben / Alltag** (founder pick, 2026-07-31). The graphs used
 * to label the personal side "Privatleben"; that word is retired so the whole
 * app says the same two things.
 *
 * Adding a domain: it lands in Alltag unless it is work, which is the safe
 * default. Only `beruf` is Berufsleben.
 */
export type LifeAreaId = "professional" | "personal";

export const LIFE_AREAS: { id: LifeAreaId; titleDe: string; titleEn: string }[] = [
  { id: "professional", titleDe: "Berufsleben", titleEn: "Working life" },
  { id: "personal", titleDe: "Alltag", titleEn: "Daily life" },
];

/** Bucket a content domain into one of the two life areas. */
export function lifeAreaOf(domain: string | undefined): LifeAreaId {
  return domain === "beruf" ? "professional" : "personal";
}

export function lifeAreaLabel(area: LifeAreaId): string {
  return LIFE_AREAS.find((a) => a.id === area)!.titleDe;
}

/** The life area a Thema belongs to, or undefined for an unknown theme id. */
export function lifeAreaOfTheme(themeId: string | undefined): LifeAreaId | undefined {
  if (!themeId) return undefined;
  const theme = themes.find((t) => t.id === themeId);
  return theme ? lifeAreaOf(theme.domain) : undefined;
}

/**
 * Does an item sitting in `themeId` belong to the selected life area?
 * `area === ""` means "both", the resting state of the Lebensbereich pills.
 *
 * Untagged is NOT universal here (unlike Branche): every content item carries a
 * Thema, and a Thema always folds into exactly one area, so an item that cannot
 * be placed is genuinely outside a chosen area rather than general to it.
 */
export function matchesLifeArea(themeId: string | undefined, area: LifeAreaId | ""): boolean {
  if (!area) return true;
  return lifeAreaOfTheme(themeId) === area;
}

/** URL-param validation: anything that is not one of the two ids is "both". */
export function normalizeLifeArea(value: string | null | undefined): LifeAreaId | "" {
  return LIFE_AREAS.some((a) => a.id === value) ? (value as LifeAreaId) : "";
}

/** The domains that make up a life area, in the taxonomy's own order. */
export function domainsInArea(area: LifeAreaId): DomainId[] {
  return domains.filter((d) => lifeAreaOf(d.id) === area).map((d) => d.id);
}

export interface AreaThemeGroup {
  label: string;
  options: { value: string; label: string; count: number; disabled?: boolean }[];
}

/**
 * The two grouped Thema option lists every dropdown renders. Both the Schreiben
 * rail and the Bibliothek dropdown go through here, so neither can drift back
 * to a per-surface fold. `include` lets a caller narrow which themes appear
 * (the Bibliothek Mode lens), never which HEADINGS exist.
 */
export function themeGroupsByArea(
  countFor: (themeId: string) => number,
  opts: { include?: (themeId: string) => boolean; disableZero?: boolean } = {},
): AreaThemeGroup[] {
  // s205: the labels are built in the interface language. Both the life areas
  // and the Themen carry an English title in the data already, so this is a
  // pick, not a translation, and the rails render whatever they are handed.
  const de = uiLangNow() === "de";
  return LIFE_AREAS.map((area) => ({
    label: de ? area.titleDe : area.titleEn,
    options: themes
      .filter((t) => lifeAreaOf(t.domain) === area.id && (opts.include?.(t.id) ?? true))
      .map((t) => {
        const count = countFor(t.id);
        return {
          value: t.id,
          label: de ? t.titleDe : t.title,
          count,
          ...(opts.disableZero ? { disabled: count === 0 } : {}),
        };
      }),
  })).filter((g) => g.options.length > 0);
}
