/**
 * The three pedagogical-shape gates (content audit §5, s198).
 *
 * The audit's closing observation: "Structural quality is systematised;
 * pedagogical shape is not. There is a linter for every enum, a gate for every
 * fact, a report for every sentence. There is no gate for 'is this word worth
 * learning', 'is this band plausible', or 'does this theme have a balanced
 * part-of-speech mix'." These three are those gates, and the frequency data
 * they read already shipped in `src/data/frequency.ts`.
 *
 * All three are RATCHETS or floors anchored on the measured state of the bank
 * on the day they landed, never a target pulled out of the air: they cannot
 * make today's content illegal, they only stop it drifting the wrong way. A
 * share (rather than a count) is used wherever adding good content should be
 * allowed to buy room for a rare-but-necessary item. Raising a ceiling is a
 * deliberate edit HERE, with a reason.
 *
 * Pure functions, so `tests/contentShape.test.ts` can prove each one bites.
 * Contract: each takes the BROWSABLE bank (retired ids removed, since a retired
 * id is no longer content a learner can meet) and returns
 * `{ dataset, where, msg }[]`, empty when the bank is in shape.
 * `pnpm lint:content` maps every finding to an error.
 */

/** A percentage, to two decimals, so a ratchet compares stably. */
const pct = (n, total) => (total ? Number(((100 * n) / total).toFixed(2)) : 0);

// --- gate 1: is this word worth learning? ---------------------------
// 54.3% of the bank was rarer than "häufig" and 100 items had no corpus
// evidence at all, each occupying the same SRS slot as `trotzdem`. The share
// may not grow: a new specialized item has to be paid for with common ones.
export const RARE_SHARE_CEILING = 53.87; // % specialized-or-unattested, s198
export const NO_EVIDENCE_CEILING = 100; // items wordfreq has never seen, s198

export function worthLearningFindings(vocab, frequency) {
  const out = [];
  const rare = vocab.filter((v) => {
    const bin = frequency[v.id]?.bin;
    return bin === "specialized" || bin === undefined;
  });
  const noEvidence = vocab.filter((v) => !frequency[v.id]);
  const share = pct(rare.length, vocab.length);
  if (share > RARE_SHARE_CEILING)
    out.push({ dataset: "frequency", where: "worth-learning-ratchet", msg: `${share}% of the browsable bank is specialized-or-rarer (${rare.length}/${vocab.length}), over the ceiling of ${RARE_SHARE_CEILING}%. Every rare compound displaces a high-utility item from the SRS queue, so a new specialized word has to arrive alongside common ones. Raising the ceiling is a deliberate edit in scripts/content-shape.mjs.` });
  if (noEvidence.length > NO_EVIDENCE_CEILING)
    out.push({ dataset: "frequency", where: "no-corpus-evidence", msg: `${noEvidence.length} items have no corpus evidence at all, over the ceiling of ${NO_EVIDENCE_CEILING}. A word no corpus has ever seen is a word the learner will not meet either; if it is genuinely needed (a form, a document name), say so and raise the ceiling deliberately. New: ${noEvidence.slice(-5).map((v) => v.de).join(", ")}` });
  return out;
}

// --- gate 2: is this band plausible? --------------------------------
// The audit found high-frequency connectors gated behind the top bands
// (`somit`, Zipf 5.04, at B2.2) and B2.2 filled with Fachsprache. s185
// re-levelled 108 items, so the hard contradiction is at zero and stays there;
// the softer direction (rare words sold as beginner vocabulary) is a ratchet.
export const BEGINNER_RARE_CEILING = 32; // specialized-or-unattested at A2/B1.1, s198

export function cefrPlausibilityFindings(vocab, frequency) {
  const out = [];
  for (const v of vocab) {
    if (v.cefr !== "B2.2" && v.cefr !== "C1") continue;
    const entry = frequency[v.id];
    if (entry?.bin === "core")
      out.push({ dataset: "frequency", where: v.id, msg: `"${v.de}" is labelled ${v.cefr} but the corpus calls it Kernwortschatz (Zipf ${entry.zipf}). An everyday word is not an advanced word: advanced means structurally or pragmatically demanding, so re-level it to the band a learner first meets it in.` });
  }
  const beginnerRare = vocab.filter((v) => {
    if (v.cefr !== "A2" && v.cefr !== "B1.1") return false;
    const bin = frequency[v.id]?.bin;
    return bin === "specialized" || bin === undefined;
  });
  if (beginnerRare.length > BEGINNER_RARE_CEILING)
    out.push({ dataset: "frequency", where: "beginner-rare-ratchet", msg: `${beginnerRare.length} A2/B1.1 items are specialized-or-rarer, over the ceiling of ${BEGINNER_RARE_CEILING}. The beginner bands are where the backbone of the language belongs; a rare word there is mislabelled, not easy.` });
  return out;
}

// --- gate 3: does this theme have a balanced part-of-speech mix? ----
// "The bank is a noun museum": 79% nouns, and four themes (digitales, freizeit,
// behoerde, mobilitaet) had no adjective at all, so their Üben could only ever
// drill nouns. The plateau is not a noun problem: it is verb-frame, case and
// word-order errors. Floors are per theme, the share is bank-wide.
export const THEME_VERB_FLOOR = 3;
export const THEME_ADJECTIVE_FLOOR = 3;
export const NOUN_SHARE_CEILING = 77.59; // % of the browsable bank, s198

export function posMixFindings(vocab) {
  const out = [];
  const byTheme = new Map();
  for (const v of vocab) {
    if (!byTheme.has(v.themeId)) byTheme.set(v.themeId, []);
    byTheme.get(v.themeId).push(v);
  }
  for (const [themeId, items] of byTheme) {
    const verbs = items.filter((v) => v.pos === "verb").length;
    const adjectives = items.filter((v) => v.pos === "adjective").length;
    if (verbs < THEME_VERB_FLOOR)
      out.push({ dataset: "vocabulary", where: themeId, msg: `theme has ${verbs} verb(s), under the floor of ${THEME_VERB_FLOOR}. A theme that is all nouns can only drill nouns, and the plateau is won on verbs.` });
    if (adjectives < THEME_ADJECTIVE_FLOOR)
      out.push({ dataset: "vocabulary", where: themeId, msg: `theme has ${adjectives} adjective(s), under the floor of ${THEME_ADJECTIVE_FLOOR}. Add everyday adjectives a learner needs to describe things in this theme.` });
  }
  const nouns = vocab.filter((v) => v.pos === "noun").length;
  const share = pct(nouns, vocab.length);
  if (share > NOUN_SHARE_CEILING)
    out.push({ dataset: "vocabulary", where: "noun-share-ratchet", msg: `${share}% of the browsable bank is nouns (${nouns}/${vocab.length}), over the ceiling of ${NOUN_SHARE_CEILING}%. Nouns carry article + plural and are the easy thing to author; spend the next slots on verbs, adjectives and connectors instead.` });
  return out;
}

