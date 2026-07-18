import type { VocabItem } from "@/types";

/**
 * Grammatical gender of a German noun, used to pick its Artikel-Wesen mark and
 * reveal effect (Artikel-Visuals, s128 plan). This is a property of the WORD,
 * not the referent (das Mädchen, die Person, der Gast), so it is read straight
 * from the authored `article` field and nothing is inferred.
 */
export type Gender = "der" | "die" | "das";

/**
 * The gender of a vocab item, or `null` when it has no article (non-nouns, and
 * the rare article-less plural-only/uncountable entry). A `null` result means
 * "draw no mark", which is exactly what non-noun cards want, so the mark also
 * doubles as an at-a-glance "this is a noun" signal.
 *
 * Pure and side-effect free; unit-tested in `tests/gender.test.ts`.
 */
export function genderOf(v: Pick<VocabItem, "article">): Gender | null {
  return v.article ?? null;
}

/**
 * Human-facing German label for a gender, e.g. for the legend and aria text.
 * Kept here so the copy has one home (no em dashes per the house rule).
 */
export const GENDER_LABEL: Record<Gender, string> = {
  der: "der",
  die: "die",
  das: "das",
};
