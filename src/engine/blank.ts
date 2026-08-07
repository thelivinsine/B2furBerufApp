/**
 * The ONE rule for "which word in an example sentence can be blanked out".
 *
 * Three surfaces build a gap from a vocabulary item's own example sentence: the
 * MCQ cloze and the listening cloze (`engine/quiz.ts`) and the typed cloze
 * (`engine/session.ts`), and `scripts/report-exercise-coverage.mjs` reports how
 * many words can never produce one. All four used to carry their own copy of the
 * rule, and all four carried the same two defects (content audit follow-up,
 * s198):
 *
 *  1. `\b` is ASCII-only in JavaScript, so `\bÜberweisung` never matched: the
 *     boundary before "Ü" does not exist, because `\w` does not contain "Ü".
 *     Every headword starting with an umlaut was unblankable, however many of
 *     its examples used it. That was 25 words.
 *  2. The infinitive was the only verb form looked for, so "Ich habe den Termin
 *     gebucht" did not count as an example of `buchen`. That was 85 words, and
 *     the natural fix is not to bend 85 German sentences into infinitives: it is
 *     to look for the forms the sentences actually use. `src/data/verbForms.ts`
 *     (Partizip II + Präteritum, oracle-derived) did not exist when the audit
 *     was written; now it does.
 *
 * A blank therefore reports WHICH form it took, so the caller can draw its
 * distractors in the same form: a gap holding "gebucht" is answered against
 * "verschoben" and "abgesagt", never against a list of infinitives that gives
 * the answer away by shape.
 */
import type { VocabItem } from "@/types";
import { verbForms } from "@/data/verbForms";

/** Which form of the headword the blank holds. */
export type BlankForm = "head" | "partizip2" | "praeteritum" | "zuInfinitiv" | "plural" | "part";

export interface VocabBlank {
  /** The example the gap was cut from. */
  example: { de: string; en: string };
  /** The exact text removed from the sentence (the correct answer). */
  surface: string;
  /** The sentence with `___` in place of `surface`. */
  prompt: string;
  form: BlankForm;
  /** The bare headword, for accept-lists that stay lenient about inflection. */
  head: string;
}

/** German letters, so a boundary also works in front of Ä/Ö/Ü (JS `\b` cannot). */
const LETTER = "A-Za-zÄÖÜäöüß";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Strip a leading article or `sich` and take the first token: "die Besprechung"
 *  -> "Besprechung", "sich abstimmen" -> "abstimmen". */
export function headOf(de: string): string {
  return de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0];
}

/** First alternative of a display form, without its article: "die Fahrgäste" ->
 *  "Fahrgäste", "die Ansprechpartner / die Ansprechpartnerinnen" ->
 *  "Ansprechpartner". */
function bareForm(s: string): string {
  const first = s.split("/")[0].trim();
  return first.replace(/^(der|die|das)\s+/i, "").trim();
}

/**
 * Every form of an item worth looking for in its own examples, most specific
 * first. Order matters: the plain headword wins when a sentence contains both,
 * so an infinitive gap stays an infinitive gap.
 */
function candidates(v: VocabItem): { text: string; form: BlankForm }[] {
  const out: { text: string; form: BlankForm }[] = [];
  const head = headOf(v.de);
  if (head.length >= 3) out.push({ text: head, form: "head" });

  if (v.pos === "verb") {
    const forms = verbForms[v.id];
    if (forms?.partizip2) out.push({ text: forms.partizip2, form: "partizip2" });
    if (forms?.praeteritum) out.push({ text: forms.praeteritum, form: "praeteritum" });
    // "die Lieferung einzuräumen": the one form of a separable verb that stays
    // in one piece, so it is often the only contiguous form in the sentence.
    if (forms?.zuInfinitiv) out.push({ text: forms.zuInfinitiv, form: "zuInfinitiv" });
  }
  // A plural is a different stem often enough to matter ("der Gang" ->
  // "die Gänge"), and a plural-only noun has no other form at all.
  if (v.plural) {
    const plural = bareForm(v.plural);
    if (plural.length >= 3 && plural.toLowerCase() !== head.toLowerCase())
      out.push({ text: plural, form: "plural" });
  }
  // Multi-word headwords ("jemanden ausreden lassen", "in Bezug auf") carry
  // their content word in a later token, so the first token alone finds nothing.
  const rest = v.de
    .replace(/^(der|die|das|sich)\s+/i, "")
    .split(" ")
    .slice(1)
    .filter((t) => t.length >= 4)
    .sort((a, b) => b.length - a.length);
  for (const t of rest) out.push({ text: t, form: "part" });

  return out;
}

/** The gap this item can produce from its own examples, or null when none of its
 *  forms appears in either sentence.
 *
 *  Where an item has a choice, the gap that does NOT leak its own answer wins:
 *  "Die ___ des Tages ist eine Kürbissuppe" hands the learner the answer inside
 *  the compound, so the other example is used when there is one. */
export function findVocabBlank(v: VocabItem): VocabBlank | null {
  const head = headOf(v.de);
  let leaky: VocabBlank | null = null;
  for (const cand of candidates(v)) {
    // Boundary + optional inflection tail ("erneuerbare" also matches
    // "erneuerbaren"), both spelled out in German letters rather than `\w`.
    const re = new RegExp(`(^|[^${LETTER}])(${escapeRe(cand.text)}[${LETTER}]*)`, "i");
    for (const example of v.examples ?? []) {
      const m = example.de.match(re);
      if (!m) continue;
      const surface = m[2];
      const prompt = example.de.replace(surface, "___");
      if (!prompt.includes("___")) continue;
      const blank = { example, surface, prompt, form: cand.form, head };
      if (!prompt.toLowerCase().includes(surface.toLowerCase())) return blank;
      leaky ??= blank;
    }
  }
  return leaky;
}

/** The same form of another item, for distractors that match the gap's shape.
 *  Null when that item has no such form, so the caller can skip it rather than
 *  offer an infinitive against a Partizip II. */
export function formOf(v: VocabItem, form: BlankForm): string | null {
  if (form === "partizip2") return verbForms[v.id]?.partizip2 ?? null;
  if (form === "praeteritum") return verbForms[v.id]?.praeteritum ?? null;
  if (form === "zuInfinitiv") return verbForms[v.id]?.zuInfinitiv ?? null;
  if (form === "plural") return v.plural ? bareForm(v.plural) : null;
  return headOf(v.de);
}
