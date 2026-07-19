import type {
  ContentCefr,
  Difficulty,
  QuizQuestion,
  MCQQuestion,
  WordOrderQuestion,
  MatchingQuestion,
  RedemittelPhrase,
  ThemeId,
  VocabItem,
  Collocation,
} from "@/types";
import { vocabByTheme, vocabulary } from "@/data/vocabulary";
import { collocationsByTheme, collocations } from "@/data/collocations";
import { redemittel } from "@/data/redemittel";
import { sample, shuffle } from "@/lib/utils";
import { XP } from "@/engine/scoring";

/**
 * Generates mixed, leveled quiz sets from existing content (vocab,
 * collocations, connectors) so all themes × 3 difficulties are covered
 * automatically — no per-theme hand-authoring. Mirrors the distractor /
 * sampling approach used in VocabQuiz.buildQuiz.
 *
 * Level 1 (Leicht / recognition): translation, article, matching.
 * Level 2 (Mittel / production-lite): plural, cloze, collocationFill, connectorChoice.
 * Level 3 (Schwer / application): wordOrder, relativePronoun, daWord.
 */

/** XP for a correct answer at the given difficulty. */
export function quizXp(difficulty: Difficulty): number {
  return difficulty === 1 ? XP.quizEasy : difficulty === 2 ? XP.quizMedium : XP.quizHard;
}

const DIFFICULTY_CEFR: Record<Difficulty, ContentCefr> = { 1: "B1.2", 2: "B2.1", 3: "B2.2" };
const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: "B1", 2: "B2.1", 3: "B2.2 / C1" };

export function difficultyCefr(d: Difficulty): ContentCefr { return DIFFICULTY_CEFR[d]; }
export function difficultyLabel(d: Difficulty): string { return DIFFICULTY_LABEL[d]; }

let seq = 0;
const qid = (kind: string) => `q_${kind}_${Date.now().toString(36)}_${seq++}`;

/* ---------------- Connector & grammar mini-banks (theme-agnostic) ---------------- */

const connectorBank: { prompt: string; answer: string; distractors: string[]; gloss: string }[] = [
  {
    prompt: "Es war teuer, ___ hat es sich gelohnt.",
    answer: "trotzdem",
    distractors: ["deshalb", "weil", "damit"],
    gloss: "It was expensive, nevertheless it was worth it.",
  },
  {
    prompt: "Wir haben wenig Zeit, ___ müssen wir uns entscheiden.",
    answer: "deshalb",
    distractors: ["trotzdem", "obwohl", "sobald"],
    gloss: "We have little time, that's why we have to decide.",
  },
  {
    prompt: "Das Angebot ist gut, ___ fehlt uns das Budget.",
    answer: "jedoch",
    distractors: ["damit", "weil", "sobald"],
    gloss: "The offer is good, however we lack the budget.",
  },
  {
    prompt: "Der Plan spart Geld; ___ senkt er die Emissionen.",
    answer: "außerdem",
    distractors: ["trotzdem", "jedoch", "obwohl"],
    gloss: "The plan saves money; besides, it lowers emissions.",
  },
  {
    prompt: "Ich melde mich, ___ der Termin feststeht.",
    answer: "sobald",
    distractors: ["deshalb", "trotzdem", "außerdem"],
    gloss: "I'll get in touch as soon as the date is fixed.",
  },
  {
    prompt: "Wir digitalisieren die Abläufe; ___ sparen wir Zeit.",
    answer: "dadurch",
    distractors: ["obwohl", "jedoch", "sobald"],
    gloss: "We digitise the processes; as a result we save time.",
  },
];

const relativeBank: { prompt: string; answer: string; distractors: string[]; gloss: string }[] = [
  {
    prompt: "Das ist der Bericht, ___ ich gestern geschrieben habe.",
    answer: "den",
    distractors: ["der", "dem", "dessen"],
    gloss: "That's the report that I wrote yesterday.",
  },
  {
    prompt: "Die Kundin, ___ wir geholfen haben, kommt wieder.",
    answer: "der",
    distractors: ["die", "den", "deren"],
    gloss: "The customer whom we helped is coming back.",
  },
  {
    prompt: "Das Team, mit ___ ich arbeite, ist motiviert.",
    answer: "dem",
    distractors: ["den", "das", "der"],
    gloss: "The team I work with is motivated.",
  },
  {
    prompt: "Der Kollege, ___ das Projekt leitet, ist im Urlaub.",
    answer: "der",
    distractors: ["den", "dem", "dessen"],
    gloss: "The colleague who leads the project is on holiday.",
  },
  {
    prompt: "Die Lösung, ___ wir gefunden haben, ist günstig.",
    answer: "die",
    distractors: ["der", "den", "deren"],
    gloss: "The solution that we found is cheap.",
  },
];

const daWordBank: { prompt: string; answer: string; distractors: string[]; gloss: string }[] = [
  {
    prompt: "Wir haben über die Kosten gesprochen. – Ja, wir haben ___ gesprochen.",
    answer: "darüber",
    distractors: ["davon", "damit", "dafür"],
    gloss: "We talked about the costs. – Yes, we talked about it.",
  },
  {
    prompt: "Ich freue mich ___, bald anzufangen.",
    answer: "darauf",
    distractors: ["davon", "darüber", "dafür"],
    gloss: "I'm looking forward to starting soon.",
  },
  {
    prompt: "___ wartest du? – Auf die Antwort des Kunden.",
    answer: "Worauf",
    distractors: ["Worüber", "Womit", "Wovon"],
    gloss: "What are you waiting for? – For the customer's reply.",
  },
  {
    prompt: "Das Tool ist neu. Wir müssen uns erst ___ gewöhnen.",
    answer: "daran",
    distractors: ["darauf", "davon", "darüber"],
    gloss: "The tool is new. We first have to get used to it.",
  },
];

/* ---------------- Question builders ---------------- */

function translationQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion {
  const distractors = sample(pool.filter((v) => v.id !== item.id), 3).map((v) => v.en);
  return {
    id: qid("translation"),
    kind: "translation",
    difficulty,
    themeId: item.themeId,
    prompt: item.de,
    answer: item.en,
    options: shuffle([item.en, ...distractors]),
    sourceId: item.id,
    hint: "Was bedeutet das Wort?",
  };
}

function articleQ(item: VocabItem, difficulty: Difficulty): MCQQuestion {
  const bare = item.de.replace(/^(der|die|das)\s+/i, "");
  return {
    id: qid("article"),
    kind: "article",
    difficulty,
    themeId: item.themeId,
    prompt: `___ ${bare}`,
    answer: item.article!,
    options: shuffle(["der", "die", "das"]),
    sourceId: item.id,
    hint: "Welcher Artikel passt?",
    explain: `${item.article} ${bare} – ${item.en}`,
  };
}

function pluralQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion {
  const distractors = sample(
    pool.filter((v) => v.id !== item.id && v.plural),
    3,
  ).map((v) => v.plural!);
  return {
    id: qid("plural"),
    kind: "plural",
    difficulty,
    themeId: item.themeId,
    prompt: `Plural von „${item.de}"?`,
    answer: item.plural!,
    options: shuffle([item.plural!, ...distractors]),
    sourceId: item.id,
    hint: "Wie lautet die Pluralform?",
  };
}

function clozeQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion | null {
  // Blank the headword inside one of its example sentences.
  const head = item.de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0];
  const ex = item.examples.find((e) => new RegExp(`\\b${escapeReg(head)}`, "i").test(e.de));
  if (!ex || head.length < 3) return null;
  const blanked = ex.de.replace(new RegExp(`\\b${escapeReg(head)}\\w*`, "i"), "___");
  if (!blanked.includes("___")) return null;
  const distractors = sample(
    pool.filter((v) => v.id !== item.id),
    3,
  ).map((v) => v.de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0]);
  return {
    id: qid("cloze"),
    kind: "cloze",
    difficulty,
    themeId: item.themeId,
    prompt: blanked,
    answer: head,
    options: shuffle([head, ...distractors]),
    sourceId: item.id,
    hint: ex.en,
  };
}

function collocationFillQ(
  c: Collocation,
  pool: Collocation[],
  difficulty: Difficulty,
): MCQQuestion {
  const distractors = sample(
    pool.filter((x) => x.id !== c.id && x.verb !== c.verb),
    3,
  ).map((x) => x.verb);
  return {
    id: qid("collocationFill"),
    kind: "collocationFill",
    difficulty,
    themeId: (c.themeId ?? "general") as ThemeId | "general",
    prompt: `${c.noun} ___`,
    answer: c.verb,
    options: shuffle([c.verb, ...distractors]),
    sourceId: c.id,
    hint: c.en,
    explain: `${c.full} – ${c.en}`,
  };
}

function connectorChoiceQ(difficulty: Difficulty): MCQQuestion {
  const b = sample(connectorBank, 1)[0];
  return {
    id: qid("connectorChoice"),
    kind: "connectorChoice",
    difficulty,
    themeId: "general",
    prompt: b.prompt,
    answer: b.answer,
    options: shuffle([b.answer, ...b.distractors]),
    hint: b.gloss,
  };
}

function relativePronounQ(difficulty: Difficulty): MCQQuestion {
  const b = sample(relativeBank, 1)[0];
  return {
    id: qid("relativePronoun"),
    kind: "relativePronoun",
    difficulty,
    themeId: "general",
    prompt: b.prompt,
    answer: b.answer,
    options: shuffle([b.answer, ...b.distractors]),
    hint: b.gloss,
  };
}

function daWordQ(difficulty: Difficulty): MCQQuestion {
  const b = sample(daWordBank, 1)[0];
  return {
    id: qid("daWord"),
    kind: "daWord",
    difficulty,
    themeId: "general",
    prompt: b.prompt,
    answer: b.answer,
    options: shuffle([b.answer, ...b.distractors]),
    hint: b.gloss,
  };
}

function matchingQ(items: VocabItem[], difficulty: Difficulty, themeId: ThemeId | "general"): MatchingQuestion | null {
  const picked = sample(items, 4);
  if (picked.length < 3) return null;
  return {
    id: qid("matching"),
    kind: "matching",
    difficulty,
    themeId,
    prompt: "Ordne die deutschen Wörter den Übersetzungen zu.",
    pairs: picked.map((v) => ({ left: v.de, right: v.en })),
  };
}

function wordOrderQ(c: Collocation, difficulty: Difficulty): WordOrderQuestion {
  const sentence = c.example.de;
  const tokens = sentence.replace(/[.?!]$/, "").split(" ");
  return {
    id: qid("wordOrder"),
    kind: "wordOrder",
    difficulty,
    themeId: (c.themeId ?? "general") as ThemeId | "general",
    prompt: "Bring die Wörter in die richtige Reihenfolge.",
    answer: sentence.replace(/[.?!]$/, ""),
    tokens: shuffle(tokens),
    sourceId: c.id,
    hint: c.example.en,
  };
}

/** Collocations deduped so no noun (grid left) or verb (grid right) repeats:
 *  MatchingView keys the left column by `pair.left` and renders the right column
 *  buttons with `key={right}`, so a duplicate on either side makes the match
 *  ambiguous (and duplicates the React key). Order is preserved. */
function distinctCols(cs: Collocation[]): Collocation[] {
  const seenN = new Set<string>();
  const seenV = new Set<string>();
  const out: Collocation[] = [];
  for (const c of cs) {
    const n = c.noun.toLowerCase();
    const v = c.verb.toLowerCase();
    if (seenN.has(n) || seenV.has(v)) continue;
    seenN.add(n);
    seenV.add(v);
    out.push(c);
  }
  return out;
}

/** Noun -> verb match grid (2a): reuses the generic MatchingView, so `pairs`
 *  carry the noun on the left and its verb on the right. `cols` MUST already be
 *  noun/verb-distinct (see distinctCols) and hold >= 4 items. `hint` overrides
 *  the renderer's default "pick the translation" sub-line for the noun-verb case. */
function collocationMatchQ(cols: Collocation[], difficulty: Difficulty): MatchingQuestion {
  const picked = sample(cols, 4);
  return {
    id: qid("collocationMatch"),
    kind: "matching",
    difficulty,
    themeId: (picked[0].themeId ?? "general") as ThemeId | "general",
    prompt: "Ordne die Nomen den passenden Verben zu.",
    hint: "Wähle links ein Nomen, dann rechts das passende Verb.",
    pairs: picked.map((c) => ({ left: c.noun, right: c.verb })),
  };
}

/** German function words never worth blanking in a Redemittel cloze (2e). Kept
 *  small on purpose: modal / Konjunktiv-II verbs (würde, wäre, könnten) ARE good
 *  targets for polite Redemittel, so they are deliberately NOT excluded. */
const FUNCTION_WORDS = new Set<string>([
  "dass", "wenn", "weil", "damit", "aber", "oder", "denn", "dann", "doch", "auch",
  "noch", "nur", "schon", "eine", "einen", "einem", "einer", "eines", "der", "die",
  "das", "den", "dem", "des", "mit", "für", "von", "aus", "bei", "nach", "über",
  "unter", "dieser", "diese", "dieses", "nicht", "sich", "man", "wir", "ich", "sie",
]);

/** The best word to blank in a Redemittel phrase: the longest alphabetic token
 *  (>= 4 chars) that is not a function word or the "…" placeholder. Null when the
 *  phrase has no such content word. */
function redemittelKeyword(de: string): string | null {
  const tokens = de
    .split(/\s+/)
    .map((t) => t.replace(/[.,;:!?»«"'()…]/g, ""))
    .filter((t) => /^[A-Za-zÄÖÜäöüß-]{4,}$/.test(t) && !FUNCTION_WORDS.has(t.toLowerCase()));
  if (!tokens.length) return null;
  return tokens.sort((a, b) => b.length - a.length)[0];
}

/** Blank a content word in a Redemittel phrase (2e); distractors are content
 *  words drawn from `distractorPool` (the full bank is fine, they are not
 *  practiced content). Null when no clean blank or too few distractors. */
function redemittelClozeQ(
  r: RedemittelPhrase,
  distractorPool: RedemittelPhrase[],
  difficulty: Difficulty,
): MCQQuestion | null {
  const word = redemittelKeyword(r.de);
  if (!word) return null;
  // Replace a WHOLE-word occurrence only (umlaut-safe, JS \b is ASCII-only).
  const re = new RegExp(`(^|[^A-Za-zÄÖÜäöüß])(${escapeReg(word)})([^A-Za-zÄÖÜäöüß]|$)`);
  const blanked = r.de.replace(re, (_m, a, _w, c) => `${a}___${c}`);
  if (!blanked.includes("___")) return null;
  const pool = Array.from(
    new Set(
      distractorPool
        .filter((x) => x.id !== r.id)
        .map((x) => redemittelKeyword(x.de))
        .filter((w): w is string => !!w && w.toLowerCase() !== word.toLowerCase()),
    ),
  );
  const distractors = sample(pool, 3);
  if (distractors.length < 3) return null;
  return {
    id: qid("redemittelCloze"),
    kind: "redemittelCloze",
    difficulty,
    themeId: (r.themeId ?? "general") as ThemeId | "general",
    prompt: blanked,
    answer: word,
    options: shuffle([word, ...distractors]),
    sourceId: r.id,
    hint: r.en,
    explain: `${r.de} – ${r.en}`,
  };
}

/** Listening cloze (2c): TTS speaks the FULL example sentence (`audioPrompt`),
 *  the learner picks the word that fills the blank. Reuses the MCQ cloze blank +
 *  distractors; no `hint` (the English gloss would reveal the answer by ear).
 *  Null when no example contains the headword. */
function listeningClozeQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion | null {
  const head = item.de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0];
  if (head.length < 3) return null;
  const ex = item.examples.find((e) => new RegExp(`\\b${escapeReg(head)}`, "i").test(e.de));
  if (!ex) return null;
  const blanked = ex.de.replace(new RegExp(`\\b${escapeReg(head)}\\w*`, "i"), "___");
  if (!blanked.includes("___")) return null;
  const distractors = sample(
    pool.filter((v) => v.id !== item.id),
    3,
  ).map((v) => v.de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0]);
  if (distractors.length < 3) return null;
  return {
    id: qid("listeningCloze"),
    kind: "listeningCloze",
    difficulty,
    themeId: item.themeId,
    prompt: blanked,
    audioPrompt: ex.de,
    answer: head,
    options: shuffle([head, ...distractors]),
    sourceId: item.id,
    explain: `${ex.de} – ${ex.en}`,
  };
}

/* --- Odd-one-out (2d): resolve authored `related` clusters, add an outsider --- */

// Same normalization the word graph uses to resolve a `related` term to a bank
// entry (replicated here so engine/ does not import features/). Strip article /
// reflexive / bracketed hints, lowercase, collapse whitespace.
const ODD_ARTICLE_RE = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\s+/i;
function normForm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(ODD_ARTICLE_RE, "")
    .replace(/^sich\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

let RESOLVER: Map<string, VocabItem> | null = null;
/** Bank-wide display-form -> entry map (first form wins; plural aliased), built
 *  once, mirroring the word graph's `byForm`. */
function vocabResolver(): Map<string, VocabItem> {
  if (RESOLVER) return RESOLVER;
  const m = new Map<string, VocabItem>();
  for (const v of vocabulary) {
    const k = normForm(v.de);
    if (k && !m.has(k)) m.set(k, v);
  }
  for (const v of vocabulary) {
    if (!v.plural) continue;
    const k = normForm(v.plural);
    if (k && !m.has(k)) m.set(k, v);
  }
  RESOLVER = m;
  return m;
}

/** Odd-one-out (2d): the anchor + 2 of its resolvable `related` terms form a
 *  semantic group; the answer is an outsider from a DIFFERENT theme. No sourceId
 *  (category discrimination, not recall of one card), so it awards XP only. Null
 *  when fewer than 2 related terms resolve or the 4 labels are not distinct. */
function oddOneOutQ(anchor: VocabItem, difficulty: Difficulty): MCQQuestion | null {
  const resolve = vocabResolver();
  const related: VocabItem[] = [];
  const seen = new Set<string>([anchor.id]);
  for (const rel of anchor.related) {
    const hit = resolve.get(normForm(rel));
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id);
      related.push(hit);
    }
  }
  if (related.length < 2) return null;
  const cluster = [anchor, ...sample(related, 2)];
  const clusterIds = new Set(cluster.map((v) => v.id));
  const relatedIds = new Set(related.map((v) => v.id));
  const outsider = sample(
    vocabulary.filter(
      (v) => v.themeId !== anchor.themeId && !clusterIds.has(v.id) && !relatedIds.has(v.id),
    ),
    1,
  )[0];
  if (!outsider) return null;
  const options = shuffle([...cluster.map((v) => v.de), outsider.de]);
  if (new Set(options).size !== options.length) return null; // distinct labels (React keys)
  return {
    id: qid("oddOneOut"),
    kind: "oddOneOut",
    difficulty,
    themeId: anchor.themeId,
    prompt: "Welches Wort passt nicht dazu?",
    options,
    answer: outsider.de,
    explain: `„${outsider.de}" passt nicht zu ${cluster.map((v) => v.de).join(", ")}.`,
  };
}

/* ---------------- Public API ---------------- */

/**
 * Odd-one-out set (2d) for a Bibliothek Wörter Üben: anchors on set words whose
 * authored `related` cluster resolves (2+ terms), so the group is real, not
 * inferred. Skips words with too few resolvable related terms.
 */
export function buildOddOneOutQuiz(
  pool: VocabItem[],
  difficulty: Difficulty,
  count: number,
): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const v of shuffle(pool.filter((v) => v.related.length >= 2))) {
    if (out.length >= count) break;
    const q = oddOneOutQ(v, difficulty);
    if (q) out.push(q);
  }
  return out;
}

/**
 * Listening set (2c) for a Bibliothek Wörter Üben when TTS is available: each
 * item's example sentence is spoken and the learner picks the blanked word.
 * Distractors fall back to the full bank so a small set still builds 4 options.
 * Items whose example has no blankable headword are skipped.
 */
export function buildListeningQuiz(
  pool: VocabItem[],
  difficulty: Difficulty,
  count: number,
): QuizQuestion[] {
  const distr = pool.length >= 4 ? pool : vocabulary;
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 6 && pool.length > 0) {
    const v = sample(pool, 1)[0];
    if (seen.has(v.id)) {
      if (seen.size >= pool.length) break;
      continue;
    }
    seen.add(v.id);
    const q = listeningClozeQ(v, distr, difficulty);
    if (q) out.push(q);
    if (seen.size >= pool.length) break;
  }
  return out;
}

/**
 * Redemittel cloze set (2e) for a Bibliothek Redemittel Üben: blanks a content
 * word in each phrase drawn from `pool` (the tab's set); distractors come from
 * the full Redemittel bank so even a small set builds 4-option questions. Phrases
 * with no clean blank are skipped.
 */
export function buildRedemittelQuiz(
  pool: RedemittelPhrase[],
  difficulty: Difficulty,
  count: number,
): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 6 && pool.length > 0) {
    const r = sample(pool, 1)[0];
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    const q = redemittelClozeQ(r, redemittel, difficulty);
    if (q) out.push(q);
    if (seen.size >= pool.length) break; // every phrase tried
  }
  return out;
}

/** The practiced pool a quiz set draws its ANSWERS from. */
export interface PoolQuizInput {
  vocab: VocabItem[];
  collocations: Collocation[];
}

export interface PoolQuizOpts {
  /**
   * Include the theme-agnostic connector / relative-pronoun / da-word mini-banks
   * (grammar filler). True for a theme quiz (`/quiz`, composed-session Pool 2);
   * false for a Bibliothek scoped session, which must practise ONLY what the page
   * shows (the content-pure rule, 2026-07-13). Distractor *strings* may still come
   * from the full bank either way — they are not practiced content.
   */
  includeGeneric?: boolean;
  /**
   * Distractor pool for the vocab MCQs (translation / plural / cloze). Defaults to
   * the pool's own vocab when it holds >= 4, else the full bank, so a small custom
   * set can still build 4-option questions.
   */
  vocabDistractors?: VocabItem[];
  /** Distractor pool for collocation fill. Same >= 4 fallback rule. */
  collocationDistractors?: Collocation[];
  /**
   * themeId stamped on the pool-agnostic question (matching). Defaults to the
   * first vocab item's theme, else "general".
   */
  themeId?: ThemeId | "general";
}

/**
 * Generate a mixed, leveled quiz set from an ARBITRARY item pool (the s131 Üben
 * exercise-variety refactor). This is the generalization of `buildThemeQuiz`:
 * every answer + sourceId comes from `pool`, so a custom Bibliothek set gets the
 * same auto-generated variety a theme does with zero authoring. `buildThemeQuiz`
 * is now a thin wrapper that passes a theme's pools with `includeGeneric: true`
 * and full-bank distractors, preserving its exact prior behavior.
 */
export function buildPoolQuiz(
  pool: PoolQuizInput,
  difficulty: Difficulty,
  count: number,
  opts: PoolQuizOpts = {},
): QuizQuestion[] {
  const vocab = pool.vocab;
  const cols = pool.collocations;
  const includeGeneric = opts.includeGeneric ?? false;
  const vocabDistr = opts.vocabDistractors ?? (vocab.length >= 4 ? vocab : vocabulary);
  const colDistr = opts.collocationDistractors ?? (cols.length >= 4 ? cols : collocations);
  const themeId: ThemeId | "general" = opts.themeId ?? vocab[0]?.themeId ?? "general";
  const nouns = vocab.filter((v) => v.pos === "noun" && v.article);
  const withPlural = vocab.filter((v) => v.plural && !/nur Plural/i.test(v.plural));
  const uniqueCols = distinctCols(cols); // noun/verb-distinct pool for the match grid

  const out: QuizQuestion[] = [];
  const guardN = count * 6;
  let guard = 0;

  const pushUnique = (q: QuizQuestion | null) => {
    if (q) out.push(q);
  };

  // Content-only question from whatever the pool actually supports, preferring
  // production-lite kinds. Used both as the generic-disabled substitute (scoped
  // sessions) and as the final top-up for sparse/collocation-only pools.
  const anyContent = (): QuizQuestion | null => {
    const roll = Math.random();
    if (cols.length >= 1 && (roll < 0.5 || vocab.length < 4)) {
      return collocationFillQ(sample(cols, 1)[0], colDistr, difficulty);
    }
    if (vocab.length >= 4) {
      return (
        clozeQ(sample(vocab, 1)[0], vocabDistr, difficulty) ??
        translationQ(sample(vocab, 1)[0], vocabDistr, difficulty)
      );
    }
    if (vocab.length >= 1) return translationQ(sample(vocab, 1)[0], vocabDistr, difficulty);
    if (cols.length >= 1) return collocationFillQ(sample(cols, 1)[0], colDistr, difficulty);
    return null;
  };

  while (out.length < count && guard++ < guardN) {
    if (difficulty === 1) {
      // recognition: translation, article, matching
      const roll = Math.random();
      if (roll < 0.45 && vocab.length >= 4) {
        pushUnique(translationQ(sample(vocab, 1)[0], vocabDistr, difficulty));
      } else if (roll < 0.68 && nouns.length > 0) {
        pushUnique(articleQ(sample(nouns, 1)[0], difficulty));
      } else if (roll < 0.85 && vocab.length >= 4) {
        pushUnique(matchingQ(vocab, difficulty, themeId));
      } else if (uniqueCols.length >= 4) {
        pushUnique(collocationMatchQ(uniqueCols, difficulty));
      } else if (vocab.length >= 4) {
        pushUnique(matchingQ(vocab, difficulty, themeId));
      } else if (vocab.length > 0) {
        // Fallback for tiny pools (was dead code behind a duplicated >= 4
        // condition): distractors come from the bank, so one word suffices.
        pushUnique(translationQ(sample(vocab, 1)[0], vocabDistr, difficulty));
      } else {
        // Vocab-empty pool (e.g. a collocation-only scoped set): fall back to
        // whatever the pool supports so difficulty 1 still yields exercises.
        pushUnique(anyContent());
      }
    } else if (difficulty === 2) {
      // production-lite: plural, cloze, collocationFill, connectorChoice
      const roll = Math.random();
      if (roll < 0.3 && withPlural.length >= 4) {
        pushUnique(pluralQ(sample(withPlural, 1)[0], vocabDistr, difficulty));
      } else if (roll < 0.52 && vocab.length >= 4) {
        pushUnique(clozeQ(sample(vocab, 1)[0], vocabDistr, difficulty));
      } else if (roll < 0.72 && cols.length >= 4) {
        pushUnique(collocationFillQ(sample(cols, 1)[0], colDistr, difficulty));
      } else if (roll < 0.86 && uniqueCols.length >= 4) {
        pushUnique(collocationMatchQ(uniqueCols, difficulty));
      } else {
        pushUnique(includeGeneric ? connectorChoiceQ(difficulty) : anyContent());
      }
    } else {
      // application: wordOrder, relativePronoun, daWord
      const roll = Math.random();
      if (roll < 0.4 && cols.length > 0) {
        pushUnique(wordOrderQ(sample(cols, 1)[0], difficulty));
      } else if (roll < 0.7) {
        pushUnique(includeGeneric ? relativePronounQ(difficulty) : anyContent());
      } else {
        pushUnique(includeGeneric ? daWordQ(difficulty) : anyContent());
      }
    }
  }

  // Fallback: if a sparse pool couldn't fill the set, top up. A theme quiz keeps
  // its original translation-only top-up (vocab is always >= 4 there); a small or
  // collocation-only custom set uses whatever the pool supports.
  let guard2 = 0;
  while (out.length < Math.min(count, 4) && guard2++ < count * 4) {
    const q =
      vocab.length >= 4
        ? translationQ(sample(vocab, 1)[0], vocabDistr, difficulty)
        : anyContent();
    if (!q) break;
    out.push(q);
  }

  return out.slice(0, count);
}

export function buildThemeQuiz(
  themeId: ThemeId,
  difficulty: Difficulty,
  count = 10,
): QuizQuestion[] {
  return buildPoolQuiz(
    { vocab: vocabByTheme(themeId), collocations: collocationsByTheme(themeId) },
    difficulty,
    count,
    {
      includeGeneric: true,
      vocabDistractors: vocabulary,
      collocationDistractors: collocations,
      themeId,
    },
  );
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
