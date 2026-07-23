/**
 * Pure, dependency-free scoring for the admin Review Cockpit priority queue
 * (Kontrollzentrum §A2). Imported by BOTH `scripts/build-review-queue.mjs`
 * (build time, produces `src/features/admin/reviewQueue.json`) AND
 * `tests/reviewScore.test.ts` (Vitest). Keep it pure ESM JS with no imports so
 * both consumers agree byte-for-byte on how an item ranks.
 *
 * Priority ordering (plan §A2, strongest signal first):
 *   defect_signal  →  traffic_proxy  →  (1 − confidence)  →  bank_criticality
 * encoded as a single comparable number via strictly descending weights, so a
 * higher score is always "more worth reviewing next".
 */

/**
 * Bank criticality: an error in a grammar rule or a reading text misleads a
 * learner more than a single vocab gloss, so those banks rank first. Matches
 * the ProvenanceContentType union.
 */
export const BANK_CRITICALITY = {
  grammar_topic: 1.0,
  grammar_drill: 1.0,
  text: 1.0,
  dialogue: 0.85,
  exam_set: 0.85,
  redemittel: 0.7,
  can_do: 0.6,
  mission: 0.6,
  writing_prompt: 0.6,
  collocation: 0.5,
  vocabulary: 0.4,
};

/** Content types that ARE a high-traffic learning surface in their own right. */
const HIGH_TRAFFIC_TYPES = new Set([
  "grammar_topic",
  "grammar_drill",
  "text",
  "dialogue",
  "exam_set",
]);

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/**
 * The defect signal from the machine checks. A hard `fail` maxes it; any `flag`
 * (verify-facts/grammar/cefr) or a LanguageTool grammar match raises it above
 * the "clean" floor of 0. Reviewer rejections are layered in at RUNTIME (the DB
 * is not readable at build time), so they are not an input here.
 */
export function defectSignalFrom({ checks, grammarMatches } = {}) {
  let flags = 0;
  let fails = 0;
  for (const c of checks ?? []) {
    if (c?.result === "fail") fails += 1;
    else if (c?.result === "flag") flags += 1;
  }
  const gm = grammarMatches ?? 0;
  if (fails > 0) return 1;
  if (flags > 0 || gm > 0) return clamp01(0.5 + 0.1 * (flags + gm));
  return 0;
}

/**
 * How many learners this item is in front of. Learning surfaces that are shown
 * directly (grammar, texts, dialogues, exam sets) count most; mission content,
 * core-frequency words and low-CEFR items (seen earlier by everyone) add on top.
 */
export function trafficProxyFrom({ contentType, cefr, freqBin, isMissionContent } = {}) {
  let t = 0;
  if (HIGH_TRAFFIC_TYPES.has(contentType)) t += 0.5;
  if (isMissionContent) t += 0.25;
  if (freqBin === "core") t += 0.3;
  else if (freqBin === "common") t += 0.15;
  if (cefr === "A2" || cefr === "B1.1") t += 0.2;
  else if (cefr === "B1.2") t += 0.1;
  return clamp01(t);
}

export function bankCriticalityFrom(contentType) {
  return BANK_CRITICALITY[contentType] ?? 0.5;
}

/**
 * Combine the four normalized (0..1) signals into one priority score. The
 * descending weights make the ordering lexicographic: defect dominates traffic,
 * traffic dominates low-confidence, low-confidence dominates bank criticality.
 */
export function scoreFeatures({ defectSignal, trafficProxy, confidence, bankCriticality } = {}) {
  const defect = clamp01(defectSignal);
  const traffic = clamp01(trafficProxy);
  const conf = clamp01(confidence);
  const bank = clamp01(bankCriticality);
  return 1000 * defect + 100 * traffic + 10 * (1 - conf) + 1 * bank;
}

/**
 * Full derivation for one item: raw inputs → features → score. Returned rounded
 * to keep the generated JSON compact and the ordering stable across machines.
 */
export function scoreItem(input) {
  const defectSignal = defectSignalFrom({
    checks: input.checks,
    grammarMatches: input.grammarMatches,
  });
  const trafficProxy = trafficProxyFrom({
    contentType: input.contentType,
    cefr: input.cefr,
    freqBin: input.freqBin,
    isMissionContent: input.isMissionContent,
  });
  const confidence = clamp01(input.confidence ?? 0);
  const bankCriticality = bankCriticalityFrom(input.contentType);
  const score = scoreFeatures({ defectSignal, trafficProxy, confidence, bankCriticality });
  return {
    defectSignal: round(defectSignal),
    trafficProxy: round(trafficProxy),
    confidence: round(confidence),
    bankCriticality: round(bankCriticality),
    score: round(score),
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}
