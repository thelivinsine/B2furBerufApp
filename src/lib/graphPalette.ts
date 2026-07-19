/**
 * Shared color palette for the Bibliothek graph views (Wörter + Kollokationen).
 *
 * One color per domain (the 5-domain taxonomy spine): brand indigo for
 * Berufsleben, distinct calm hues for the rest, brightened for dark mode so
 * jewel tones stay luminous on a near-black canvas. Lifted out of WordGraph so
 * both graphs agree on domain colors (the Kollokationen graph reuses these).
 */
export const DOMAIN_COLORS: Record<string, { light: string; dark: string }> = {
  beruf: { light: "#5b5be6", dark: "#8a8af2" },
  alltag: { light: "#0d9488", dark: "#2dd4bf" },
  gesundheit: { light: "#e11d48", dark: "#fb7185" },
  bildung: { light: "#d97706", dark: "#fbbf24" },
  pruefung: { light: "#0284c7", dark: "#38bdf8" },
};

export const FALLBACK_COLOR = { light: "#64748b", dark: "#94a3b8" };

/** Resolve a domain id to its light/dark hex, falling back to slate. */
export function domainColor(domain: string | undefined, dark: boolean): string {
  const c = (domain && DOMAIN_COLORS[domain]) || FALLBACK_COLOR;
  return dark ? c.dark : c.light;
}

/**
 * Two-area life split for the graph views (founder, 2026-07-19). The graphs
 * color-code only TWO areas instead of the five content domains: Berufsleben
 * (professional) and Privatleben (personal). `beruf` is professional; every
 * other domain (alltag / gesundheit / bildung / pruefung) is personal. Only
 * the COLOR and the legend filter collapse to these two; clustering still uses
 * the finer theme grain. Professional keeps the brand indigo; personal takes a
 * calm teal, distinct in both light and dark.
 */
export type LifeAreaId = "professional" | "personal";

export const LIFE_AREAS: { id: LifeAreaId; titleDe: string }[] = [
  { id: "professional", titleDe: "Berufsleben" },
  { id: "personal", titleDe: "Privatleben" },
];

export const LIFE_AREA_COLORS: Record<LifeAreaId, { light: string; dark: string }> = {
  professional: { light: "#5b5be6", dark: "#8a8af2" },
  personal: { light: "#0d9488", dark: "#2dd4bf" },
};

/** Bucket a content domain into one of the two life areas. */
export function lifeAreaOf(domain: string | undefined): LifeAreaId {
  return domain === "beruf" ? "professional" : "personal";
}

/** Resolve a domain to its life-area light/dark hex (professional vs personal). */
export function lifeAreaColor(domain: string | undefined, dark: boolean): string {
  const c = LIFE_AREA_COLORS[lifeAreaOf(domain)];
  return dark ? c.dark : c.light;
}
