/**
 * Minimal word-level diff for the Fokus Satzlabor correction view (s147). Given
 * the learner's original sentence and the AI-corrected one, it returns the
 * corrected tokens AND the original tokens flagged changed/unchanged (so the UI
 * can underline the wrong words in the original and the fixes in the corrected
 * view), plus a compact list of before -> after changes, each tagged with a
 * simple error category (Rechtschreibung / Umlaut / Groß-/Kleinschreibung /
 * Grammatik / Ergänzung / Streichung). Pure and client-side (no AI, no network).
 *
 * Algorithm: a standard LCS over whitespace tokens; runs of deletes/inserts
 * between two matching tokens are paired into one change.
 */

export interface DiffToken {
  text: string;
  changed: boolean;
}
export interface DiffChange {
  from: string;
  to: string;
  /** A coarse, heuristic error category shown as the fix tile's eyebrow. */
  category: string;
  /** True when this change is a word that was only MOVED, not altered (a word-
   *  order fix). The UI shows the word once instead of a from → to pair. */
  moved?: boolean;
}

function tokenize(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

const UMLAUT_MAP: Record<string, string> = {
  "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue",
};
function deUmlaut(s: string): string {
  return s.replace(/[äöüßÄÖÜ]/g, (m) => UMLAUT_MAP[m] ?? m);
}
/** Strip surrounding punctuation, keeping case. */
function stripPunct(s: string): string {
  return s
    .replace(/^[.,!?;:„“”»«"'()]+/u, "")
    .replace(/[.,!?;:„“”»«"'()]+$/u, "")
    .trim();
}
// Lowercase + strip surrounding punctuation, so the category ignores trailing
// commas/question marks and case when deciding what KIND of edit this was.
function normWord(s: string): string {
  return stripPunct(s.toLowerCase());
}

/** Classify a single before -> after edit into a coarse, learner-facing bucket. */
export function classifyChange(from: string, to: string): string {
  const f = from.trim();
  const t = to.trim();
  if (!f) return "Ergänzung";
  if (!t) return "Streichung";
  // A multi-word block change is a structure edit, not a single misspelling.
  if (/\s/.test(f) || /\s/.test(t)) return "Grammatik";
  const nf = normWord(f);
  const nt = normWord(t);
  if (nf === nt) {
    // Same letters: separate a pure comma/period fix from a case fix. Longer
    // texts (Verlauf, s171) are full of added commas, and labelling those
    // "Groß-/Kleinschreibung" taught the wrong rule.
    return stripPunct(f) === stripPunct(t) ? "Zeichensetzung" : "Groß-/Kleinschreibung";
  }
  if (deUmlaut(nf) === deUmlaut(nt)) return "Umlaut";
  return "Rechtschreibung";
}

/**
 * A word that is only REORDERED shows up in the LCS diff as a pure deletion in
 * its old slot AND a pure insertion in its new slot, so the fix list reads as a
 * contradictory "remove heute" + "add heute". Collapse each same-word
 * deletion/insertion pair into ONE "Wortstellung" (word-order) change, placed at
 * the earlier of the two positions, keeping the corrected spelling.
 */
function collapseMoves(changes: DiffChange[]): DiffChange[] {
  const single = (s: string) => {
    const t = s.trim();
    return t !== "" && !/\s/.test(t);
  };
  const isDel = (c: DiffChange) => c.to.trim() === "" && single(c.from);
  const isIns = (c: DiffChange) => c.from.trim() === "" && single(c.to);

  // index -> the merged Wortstellung change (at the earlier slot) or null (drop).
  const resolved = new Map<number, DiffChange | null>();
  const usedIns = new Set<number>();
  for (let i = 0; i < changes.length; i++) {
    if (!isDel(changes[i]) || resolved.has(i)) continue;
    const word = normWord(changes[i].from);
    let k = -1;
    for (let j = 0; j < changes.length; j++) {
      if (usedIns.has(j) || j === i || !isIns(changes[j])) continue;
      if (normWord(changes[j].to) === word) {
        k = j;
        break;
      }
    }
    if (k < 0) continue;
    usedIns.add(k);
    const label = changes[k].to; // the corrected spelling of the moved word
    const lo = Math.min(i, k);
    const hi = Math.max(i, k);
    resolved.set(lo, { from: label, to: label, category: "Wortstellung", moved: true });
    resolved.set(hi, null);
  }
  if (resolved.size === 0) return changes;
  const out: DiffChange[] = [];
  for (let i = 0; i < changes.length; i++) {
    if (resolved.has(i)) {
      const merged = resolved.get(i);
      if (merged) out.push(merged);
    } else {
      out.push(changes[i]);
    }
  }
  return out;
}

export function diffWords(
  original: string,
  corrected: string,
): { tokens: DiffToken[]; originalTokens: DiffToken[]; changes: DiffChange[] } {
  const a = tokenize(original);
  const b = tokenize(corrected);
  const n = a.length;
  const m = b.length;

  // LCS length table (suffix form).
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  const originalTokens: DiffToken[] = [];
  const changes: DiffChange[] = [];
  let pendingDel: string[] = [];
  let pendingIns: string[] = [];
  const flush = () => {
    const del = pendingDel;
    const ins = pendingIns;
    if (del.length > 0 && del.length === ins.length) {
      // A run of 1:1 word replacements → one pair per word (clearer tip).
      for (let k = 0; k < del.length; k++)
        changes.push({ from: del[k], to: ins[k], category: classifyChange(del[k], ins[k]) });
    } else if (del.length || ins.length) {
      // A genuine insertion/deletion run → keep it as one block.
      const from = del.join(" ");
      const to = ins.join(" ");
      changes.push({ from, to, category: classifyChange(from, to) });
    }
    pendingDel = [];
    pendingIns = [];
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flush();
      tokens.push({ text: b[j], changed: false });
      originalTokens.push({ text: a[i], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pendingDel.push(a[i]); // deleted from the original
      originalTokens.push({ text: a[i], changed: true });
      i++;
    } else {
      pendingIns.push(b[j]); // inserted in the corrected
      tokens.push({ text: b[j], changed: true });
      j++;
    }
  }
  while (i < n) {
    pendingDel.push(a[i]);
    originalTokens.push({ text: a[i], changed: true });
    i++;
  }
  while (j < m) {
    pendingIns.push(b[j]);
    tokens.push({ text: b[j], changed: true });
    j++;
  }
  flush();

  return { tokens, originalTokens, changes: collapseMoves(changes) };
}
