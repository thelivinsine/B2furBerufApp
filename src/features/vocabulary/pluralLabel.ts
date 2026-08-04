import type { VocabItem } from "@/types";

/**
 * What a noun's plural slot should say. Every noun declares either a `plural`
 * or a `numerus` (audit P9, s185), so the slot is never blank for a noun and
 * "we did not author this" can no longer look like "there is nothing here".
 * Returns null for anything that is not a noun.
 */
export function pluralLabel(v: VocabItem): string | null {
  if (v.plural) return v.plural;
  if (v.numerus === "uncountable") return "kein Plural";
  if (v.numerus === "pluralOnly") return "nur Plural";
  return null;
}
