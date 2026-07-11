// Forgiving text matcher for the Bibliothek search boxes (Wörter, Kollokationen,
// Redemittel). "Forgiving" means: umlaut- and case-insensitive, punctuation is
// ignored, query tokens can appear in any order and across any of the fields,
// and a token of 4+ characters tolerates a single typo (edit distance 1) against
// any whole word (or its equal-length prefix, so a plural/inflected ending does
// not defeat the match). Short tokens fall back to substring matching to avoid
// noisy false positives.

/** Fold umlauts/ß, lowercase, and collapse anything non-alphanumeric to spaces. */
export function foldText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * True when `a` and `b` differ by at most one edit: an insertion, deletion,
 * substitution, or a transposition of two adjacent characters (Damerau). The
 * transposition case matters because swapping neighbouring letters is one of
 * the most common typing mistakes.
 */
function withinEdit1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la === lb) {
    const mismatches: number[] = [];
    for (let i = 0; i < la; i++) {
      if (a[i] !== b[i]) {
        mismatches.push(i);
        if (mismatches.length > 2) return false;
      }
    }
    if (mismatches.length <= 1) return true; // one substitution (or none)
    // Exactly two mismatches: allow only an adjacent transposition.
    const [i, j] = mismatches;
    return j === i + 1 && a[i] === b[j] && a[j] === b[i];
  }
  // Lengths differ by one: walk both, allowing a single skip (one insert/delete).
  const short = la < lb ? a : b;
  const long = la < lb ? b : a;
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
    } else {
      if (skipped) return false;
      skipped = true;
      j++;
    }
  }
  return true;
}

function tokenMatches(token: string, haystack: string, words: string[]): boolean {
  if (haystack.includes(token)) return true;
  if (token.length < 4) return false;
  return words.some(
    (w) =>
      withinEdit1(token, w) ||
      (w.length > token.length && withinEdit1(token, w.slice(0, token.length))),
  );
}

/**
 * True when every token of `query` is found (fuzzily) somewhere across `fields`.
 * An empty query matches everything.
 */
export function fuzzyMatch(query: string, fields: (string | undefined | null)[]): boolean {
  const q = foldText(query);
  if (!q) return true;
  const haystack = foldText(fields.filter(Boolean).join(" "));
  const words = haystack.split(" ").filter(Boolean);
  return q.split(" ").filter(Boolean).every((t) => tokenMatches(t, haystack, words));
}
