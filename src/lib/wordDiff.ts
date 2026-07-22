/**
 * Minimal word-level diff for the Fokus Satzlabor correction view (s147). Given
 * the learner's original sentence and the AI-corrected one, it returns (a) the
 * corrected tokens flagged as changed/unchanged so the UI can highlight edits in
 * place, and (b) a compact list of before -> after changes for the "was wurde
 * geändert" tip. Pure and client-side (no AI, no network), so the correction UI
 * shows WHAT changed with zero backend work.
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
}

function tokenize(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

export function diffWords(
  original: string,
  corrected: string,
): { tokens: DiffToken[]; changes: DiffChange[] } {
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
  const changes: DiffChange[] = [];
  let pendingDel: string[] = [];
  let pendingIns: string[] = [];
  const flush = () => {
    const del = pendingDel;
    const ins = pendingIns;
    if (del.length > 0 && del.length === ins.length) {
      // A run of 1:1 word replacements → one pair per word (clearer tip).
      for (let k = 0; k < del.length; k++) changes.push({ from: del[k], to: ins[k] });
    } else if (del.length || ins.length) {
      // A genuine insertion/deletion run → keep it as one block.
      changes.push({ from: del.join(" "), to: ins.join(" ") });
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
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pendingDel.push(a[i]); // deleted from the original
      i++;
    } else {
      pendingIns.push(b[j]); // inserted in the corrected
      tokens.push({ text: b[j], changed: true });
      j++;
    }
  }
  while (i < n) {
    pendingDel.push(a[i]);
    i++;
  }
  while (j < m) {
    pendingIns.push(b[j]);
    tokens.push({ text: b[j], changed: true });
    j++;
  }
  flush();

  return { tokens, changes };
}
