/* ------------------------------------------------------------------ */
/* Domain types for the B2 Beruf speaking-prep platform                */
/* ------------------------------------------------------------------ */

export type ThemeId =
  | "meetings"
  | "scheduling"
  | "logistics"
  | "customer"
  | "conflict"
  | "project"
  | "technology"
  | "sustainability"
  | "safety"
  | "travel"
  | "behoerde";

export interface ExamTheme {
  id: ThemeId;
  title: string;
  titleDe: string;
  blurb: string;
  icon: string; // lucide icon name
  accent: string; // tailwind gradient classes
  /** Representative real-world situations a candidate might face. */
  situations: string[];
}

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "connector";

export interface VocabItem {
  id: string;
  de: string;
  en: string;
  /** Lightweight pronunciation hint (syllabified / stress marked). */
  pron: string;
  pos: PartOfSpeech;
  /** Article for nouns: der / die / das. */
  article?: "der" | "die" | "das";
  /** Plural form for nouns. */
  plural?: string;
  examples: { de: string; en: string }[];
  context: string;
  related: string[];
  themeId: ThemeId;
}

export type RedemittelCategory =
  | "suggestions"
  | "agree"
  | "disagree"
  | "negotiation"
  | "compromise"
  | "clarification"
  | "opinion"
  | "prosCons"
  | "reactions";

export interface RedemittelPhrase {
  id: string;
  de: string;
  en: string;
  category: RedemittelCategory;
  register: "neutral" | "formal" | "diplomatic";
  note?: string;
  example: { de: string; en: string };
}

/* ---------------- Dialogue / simulation engine ---------------- */

export type Speaker = "partner" | "examiner" | "narrator";

export interface DialogueOption {
  id: string;
  /** The candidate's intent / suggested utterance. */
  text: string;
  /** Redemittel category this option exercises. */
  uses?: RedemittelCategory;
  /** Branch to follow when chosen. */
  next: string; // node id
  /** Short coaching note shown after the choice. */
  feedback?: string;
  /** Quality signal used for scoring (0–1). */
  quality?: number;
}

export interface DialogueNode {
  id: string;
  speaker: Speaker;
  /** The partner/examiner line (German). */
  line: string;
  /** English gloss for support. */
  gloss?: string;
  /** Progressive hints revealed on demand. */
  hints?: string[];
  /** Candidate response options; empty => free-speak prompt. */
  options?: DialogueOption[];
  /** Free-speaking prompt when there are no options. */
  prompt?: string;
  /** Model answer for a free-speak node. */
  model?: string;
  /** Auto-advance target for narration / partner monologue. */
  next?: string;
  /** Marks a terminal node. */
  end?: boolean;
}

export interface Scenario {
  id: string;
  themeId: ThemeId;
  title: string;
  /** The shared task ("Lösung finden") the pair must solve. */
  task: string;
  /** Context card shown before starting. */
  context: string;
  /** Difficulty 1–3. */
  level: 1 | 2 | 3;
  /** Suggested duration in minutes. */
  minutes: number;
  start: string; // start node id
  nodes: Record<string, DialogueNode>;
  /** Key Redemittel a strong candidate would deploy. */
  targetRedemittel: RedemittelCategory[];
}

/* ---------------- Exam mode ---------------- */

export interface ExamRubricCriterion {
  id: string;
  label: string;
  description: string;
}

export interface ExamSet {
  id: string;
  title: string;
  themeId: ThemeId;
  /** Candidate task sheet text. */
  taskSheet: string;
  /** Bullet aspects on the prompt card. */
  aspects: string[];
  scenarioId: string;
  totalMinutes: number;
  rubric: ExamRubricCriterion[];
}

/* ---------------- Grammar support ---------------- */

/** Thematic buckets used to group grammar topics in the Grammar hub. */
export type GrammarGroup =
  | "connectors"
  | "relativeClauses"
  | "prepositionalPronouns"
  | "collocations"
  | "verbPosition"
  | "konjunktiv2"
  | "modals"
  | "passive"
  | "subordinate"
  | "cases";

export interface GrammarExample {
  de: string;
  en: string;
}

/** An inline practice item attached to a grammar topic. */
export interface GrammarDrill {
  id: string;
  /** Prompt sentence; a gap is marked with `___`. */
  prompt: string;
  /** The accepted answer (gap filler). */
  answer: string;
  /** Optional multiple-choice options (includes the answer). Free text if absent. */
  options?: string[];
  /** Short explanation revealed after answering. */
  explain?: string;
  /** English gloss of the full sentence for support. */
  gloss?: string;
}

/** A rich grammar topic: explanation, examples, pitfalls and inline drills. */
export interface GrammarTopic {
  id: string;
  group: GrammarGroup;
  title: string;
  titleDe: string;
  purpose: string;
  explanation: string;
  pattern: string;
  examples: GrammarExample[];
  pitfalls?: string[];
  drills: GrammarDrill[];
}

/* ---------------- Collocations (Nomen-Verb-Verbindungen) ---------------- */

export interface Collocation {
  id: string;
  /** The noun part, with article where natural (e.g. "eine Entscheidung"). */
  noun: string;
  /** The verb part (e.g. "treffen"). */
  verb: string;
  /** The full collocation (e.g. "eine Entscheidung treffen"). */
  full: string;
  en: string;
  register?: "neutral" | "formal";
  themeId?: ThemeId;
  example: { de: string; en: string };
}

/* ---------------- Leveled quizzes ---------------- */

export type Difficulty = 1 | 2 | 3;

export type QuizKind =
  | "translation"
  | "article"
  | "plural"
  | "cloze"
  | "wordOrder"
  | "matching"
  | "collocationFill"
  | "connectorChoice"
  | "relativePronoun"
  | "daWord";

interface QuizQuestionBase {
  id: string;
  difficulty: Difficulty;
  /** Theme the question belongs to, or "general" for grammar-only items. */
  themeId: ThemeId | "general";
  /** The question prompt shown to the learner. */
  prompt: string;
  /** Source vocab/collocation id so a correct answer can feed SRS. */
  sourceId?: string;
  /** English gloss / supportive hint. */
  hint?: string;
  /** Explanation revealed after answering. */
  explain?: string;
}

/** Single-answer multiple-choice question (the most common kind). */
export interface MCQQuestion extends QuizQuestionBase {
  kind:
    | "translation"
    | "article"
    | "plural"
    | "cloze"
    | "collocationFill"
    | "connectorChoice"
    | "relativePronoun"
    | "daWord";
  answer: string;
  options: string[];
}

/** Arrange shuffled tokens into the correct sentence. */
export interface WordOrderQuestion extends QuizQuestionBase {
  kind: "wordOrder";
  /** The correct full sentence. */
  answer: string;
  /** Shuffled word tokens to arrange. */
  tokens: string[];
}

/** Match German terms to their English equivalents. */
export interface MatchingQuestion extends QuizQuestionBase {
  kind: "matching";
  pairs: { left: string; right: string }[];
}

export type QuizQuestion = MCQQuestion | WordOrderQuestion | MatchingQuestion;

/* ---------------- Practice-area registry (weakness → deep-link) ---------------- */

/** Weakness buckets the writing coach (Phase 2) maps onto practice deep-links. */
export type WeaknessCategory =
  | "verbPosition"
  | "cases"
  | "vocabularyRange"
  | "cohesion"
  | "relativeClauses"
  | "daWords"
  | "collocations"
  | "register"
  | "spelling";

export interface PracticeArea {
  id: WeaknessCategory;
  label: string;
  labelDe: string;
  /** In-app route + query the "Üben" deep-link should open. */
  route: string;
  description: string;
}

/* ---------------- Spaced repetition ---------------- */

export interface SrsCard {
  /** Ease factor (SM-2). */
  ease: number;
  /** Interval in days. */
  interval: number;
  /** Consecutive correct reviews. */
  reps: number;
  /** Due date as YYYY-MM-DD. */
  due: string;
  /** Last grade 0–5. */
  lastGrade?: number;
}

export type Grade = 0 | 3 | 4 | 5;

/* ---------------- Data governance — provenance register ---------------- */

export type ProvenanceContentType =
  | "vocabulary"
  | "collocation"
  | "grammar_topic"
  | "grammar_drill"
  | "dialogue"
  | "exam_set"
  | "redemittel"
  | "writing_prompt";

export type ProvenanceOrigin = "sourced" | "adapted" | "authored";

export type ProvenanceLicense =
  | "OWNED"
  | "CC0-1.0"
  | "CC-BY-4.0"
  | "CC-BY-3.0"
  | "CC-BY-2.0"
  | "CC-BY-2.0-FR"
  | "CC-BY-SA-4.0"
  | "Public-Domain";

export type ProvenanceReviewStatus = "draft" | "verified" | "published" | "retired";

export interface ProvenanceEntry {
  content_id: string;
  content_type: ProvenanceContentType;
  /** Human-readable headword or summary for reviewers. */
  label: string;
  origin: ProvenanceOrigin;
  /** External source name, e.g. "Tatoeba". Blank for authored. */
  source_name?: string;
  /** Direct link to the source item. */
  source_url?: string;
  /**
   * Authoritative reference the item was verified against (Wiktionary / DWDS /
   * Tatoeba URL). Required for authored and adapted items. Empty string means
   * back-fill is pending — the linter warns on empty for authored/adapted items.
   */
  reference: string;
  license: ProvenanceLicense;
  license_url?: string;
  attribution_required: boolean;
  attribution_text?: string;
  added_by: string;
  verified_by?: string;
  verified_date?: string;
  review_status: ProvenanceReviewStatus;
  notes?: string;
}
