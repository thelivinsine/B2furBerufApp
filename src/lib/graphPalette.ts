/**
 * Shared color palette for the Bibliothek graph views (Wörter + Kollokationen).
 *
 * One color per domain (the 6-domain taxonomy spine): brand indigo for
 * Berufsleben, distinct calm hues for the rest, brightened for dark mode so
 * jewel tones stay luminous on a near-black canvas. Lifted out of WordGraph so
 * both graphs agree on domain colors (the Kollokationen graph reuses these).
 */
export const DOMAIN_COLORS: Record<string, { light: string; dark: string }> = {
  beruf: { light: "#5b5be6", dark: "#8a8af2" },
  arbeitswelt: { light: "#8b5cf6", dark: "#a78bfa" },
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
