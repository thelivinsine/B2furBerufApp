/**
 * Tolerant matching of a spoken (or typed) answer against a German target,
 * for the speaking production block (#27). Pure and side-effect free so it is
 * unit-checkable by `scripts/test-pronounce.mjs` (the `test:srs` pattern).
 *
 * STT transcripts are noisy: casing, punctuation, dropped articles, and small
 * transcription slips are all expected. The matcher therefore normalizes both
 * sides, then accepts an exact match, a word-boundary containment (STT often
 * returns a longer utterance around the target), or a small Levenshtein
 * distance scaled by target length.
 */

/** Leading function words a speaker may drop without being wrong. `sich` is
 * included because reflexive verbs are listed as "sich abstimmen" but a bare
 * "abstimmen" is a fair spoken answer. */
const DROPPABLE_LEADS = new Set(["der", "die", "das", "ein", "eine", "sich"]);

/** Lowercase, strip punctuation, drop leading articles, collapse whitespace. */
export function normalizeSpoken(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-zäöü0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  while (words.length > 1 && DROPPABLE_LEADS.has(words[0])) words.shift();
  return words.join(" ");
}

/** Classic two-row Levenshtein; inputs are short (a word or phrase).
 * Shared with `engine/typing.ts` (typed forward-recall grading). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/** Allowed edit distance for a normalized target of this length. */
function tolerance(len: number): number {
  return Math.min(3, Math.max(1, Math.floor(len / 5)));
}

/**
 * Does the transcript count as producing the target?
 * Exact after normalization, word-boundary containment (the target said inside
 * a longer utterance), or within a length-scaled Levenshtein tolerance.
 */
export function matchesSpoken(transcript: string, target: string): boolean {
  const said = normalizeSpoken(transcript);
  const goal = normalizeSpoken(target);
  if (!said || !goal) return false;
  if (said === goal) return true;
  if (` ${said} `.includes(` ${goal} `)) return true;
  return levenshtein(said, goal) <= tolerance(goal.length);
}
