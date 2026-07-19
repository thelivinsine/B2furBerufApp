/**
 * Grading of a TYPED forward-recall answer (EN prompt → learner types the
 * German) against a vocabulary target. Pure and side-effect free; the band
 * behaviour is pinned by `tests/typing.test.ts` (Vitest, `pnpm test:unit`).
 *
 * This is deliberately NOT `matchesSpoken` (engine/pronounce.ts). Typing is a
 * deliberate act on a visible string, so the rules differ from noisy STT:
 *
 * - Three-tier verdict instead of a boolean. The tiers map onto the SRS
 *   `Grade` scale in the session player (4.2): "correct" → 4 (Good; the
 *   existing latency signal can still lift/lower it), "almost" → 3 (Hard),
 *   "wrong" → 0 (Again). A near-miss must NOT grade as a clean pass or the
 *   FSRS scheduler learns from corrupted evidence.
 * - Alternate umlaut spellings (ae/oe/ue for ä/ö/ü, ss for ß) are FULLY
 *   correct, not typos: they are keyboard artifacts, not knowledge gaps.
 *   Both sides fold to the digraph form, so Bär ≠ Bar stays distinct.
 * - The article is graded separately from the noun: producing the noun with
 *   a wrong or missing article (or dropping a reflexive "sich") is "almost",
 *   never a clean "correct" and never a hard fail.
 * - Typo tolerance is tighter than spoken (0 edits for short words, else 1,
 *   2 from ten letters) and a within-tolerance answer is "almost", not
 *   "correct".
 * - NO containment credit: a longer utterance around the target is an STT
 *   normality but a typed answer must be the answer.
 */

import { levenshtein } from "./pronounce";

const ARTICLES = new Set(["der", "die", "das"]);

/** Leads graded separately from the head word: articles + reflexive sich. */
const GRADED_LEADS = new Set([...ARTICLES, "sich"]);

export type TypedVerdict = "correct" | "almost" | "wrong";

/** Why an answer graded "almost" (drives the feedback line in the block UI). */
export type TypedMissReason = "article" | "reflexive" | "spelling";

export interface TypedGrade {
  verdict: TypedVerdict;
  /** Set only when verdict is "almost". */
  reason?: TypedMissReason;
}

/**
 * Lowercase, fold umlauts/ß to digraphs, strip punctuation, split hyphens,
 * return the word list. Folding to digraphs (not base letters) keeps minimal
 * pairs like Bär/Bar distinct while accepting non-German-keyboard input.
 */
export function normalizeTyped(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Allowed edit distance for a typed answer against a head of this length. */
export function typedTolerance(len: number): number {
  return len <= 3 ? 0 : len <= 9 ? 1 : 2;
}

/** Split one graded lead word (article / sich) off a normalized word list. */
function splitLead(words: string[]): { lead?: string; head: string[] } {
  if (words.length > 1 && GRADED_LEADS.has(words[0])) {
    return { lead: words[0], head: words.slice(1) };
  }
  return { head: words };
}

/**
 * Grade a typed answer against the target (the bank's display form, e.g.
 * "die Besprechung" or "sich abstimmen").
 */
export function gradeTyped(typed: string, expected: string): TypedGrade {
  const t = normalizeTyped(typed);
  const e = normalizeTyped(expected);
  if (!t.length || !e.length) return { verdict: "wrong" };

  // Full-form match; the joined ("") variant makes spacing and hyphenation
  // interchangeable (E-Mail / Email / E Mail).
  if (t.join(" ") === e.join(" ") || t.join("") === e.join("")) {
    return { verdict: "correct" };
  }

  const exp = splitLead(e);
  const got = splitLead(t);
  const expHead = exp.head.join(" ");
  const gotHead = got.head.join(" ");

  // Head produced exactly, so only the lead is off: missing, wrong, or
  // spurious. "almost" with the reason taken from what the TARGET requires.
  if (gotHead === expHead || got.head.join("") === exp.head.join("")) {
    return {
      verdict: "almost",
      reason: exp.lead === "sich" ? "reflexive" : "article",
    };
  }

  // Small spelling slip on the head (lead correctness is moot at this point:
  // the head itself was not produced cleanly).
  if (levenshtein(gotHead, expHead) <= typedTolerance(expHead.length)) {
    return { verdict: "almost", reason: "spelling" };
  }

  return { verdict: "wrong" };
}

const VERDICT_RANK: Record<TypedVerdict, number> = { wrong: 0, almost: 1, correct: 2 };

/**
 * Grade a typed answer against several acceptable targets, returning the BEST
 * verdict. Used by the typed-cloze block (2b): the blank can be filled by the
 * exact surface form in the sentence OR the base headword when they differ
 * (e.g. a sentence with "Anträge" accepts both "Anträge" and "Antrag"), so
 * neither inflection is marked wrong. A single target behaves like gradeTyped.
 */
export function gradeTypedAny(typed: string, expected: string[]): TypedGrade {
  let best: TypedGrade = { verdict: "wrong" };
  for (const target of expected) {
    const g = gradeTyped(typed, target);
    if (VERDICT_RANK[g.verdict] > VERDICT_RANK[best.verdict]) best = g;
    if (best.verdict === "correct") break;
  }
  return best;
}
