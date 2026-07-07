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
  | "behoerde"
  | "arzt";

/* ---------------- Taxonomy: domains, modes, facets ---------------- */

export type DomainId =
  | "beruf"
  | "arbeitswelt"
  | "alltag"
  | "gesundheit"
  | "bildung"
  | "pruefung";

export interface Domain {
  id: DomainId;
  title: string;
  titleDe: string;
  context: ContextTag;
}

export type LearningMode = "work" | "personal" | "both";
export type ContextTag = "work" | "personal" | "both";

/** Stable slug identifying a sub-theme within a theme (e.g. "behoerde.antrag"). */
export type SubThemeId = string;

export type ContentCefr =
  | "A2"
  | "B1.1"
  | "B1.2"
  | "B2.1"
  | "B2.2"
  | "C1";

export type Frequency = "core" | "common" | "specialized";

export type WorkSector =
  | "care"
  | "office"
  | "trades"
  | "it"
  | "retail"
  | "hospitality";

export type Counterpart =
  | "manager"
  | "colleague"
  | "customer"
  | "team";

export type WorkSituation =
  | "meeting"
  | "shift-handover"
  | "customer-call"
  | "instructions"
  | "onboarding"
  | "sick-leave"
  | "review";

export type TaskType =
  | "email"
  | "phone-call"
  | "report"
  | "instruction"
  | "presentation";

/** A sub-topic within a theme. Phase 2 promotes `situations[]` into these. */
export interface SubTheme {
  id: SubThemeId;
  title: string;
  titleDe: string;
  /** Index into the parent theme's `situations[]` this sub-theme derives from. */
  situationsIndex?: number;
}

export interface ExamTheme {
  id: ThemeId;
  title: string;
  titleDe: string;
  blurb: string;
  blurbDe: string;
  icon: string; // lucide icon name
  accent: string; // tailwind gradient classes
  /** Representative real-world situations a candidate might face. */
  situations: string[];
  domain?: DomainId;
  context?: ContextTag;
  subThemes?: SubTheme[];
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
  cefr?: ContentCefr;
  subThemeId?: SubThemeId;
  frequency?: Frequency;
  sector?: WorkSector;
  workSituation?: WorkSituation;
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
  cefr?: ContentCefr;
  themeId?: ThemeId;
  counterpart?: Counterpart;
  taskType?: TaskType;
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
  purposeDe: string;
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
  register?: "neutral" | "formal" | "diplomatic";
  themeId?: ThemeId;
  example: { de: string; en: string };
  cefr?: ContentCefr;
  subThemeId?: SubThemeId;
  frequency?: Frequency;
  sector?: WorkSector;
  workSituation?: WorkSituation;
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

/* ---------------- Composed session (UX overhaul Phase 1) ---------------- */

/**
 * One step in a composed learning session. Each block reuses an existing
 * content type and its renderer: a flashcard (vocab retrieval or a Redemittel
 * recall), a leveled quiz question, or a grammar micro-drill. The composer
 * (`engine/session.ts`) interleaves the kinds so retrieval practice is mixed,
 * not blocked. `key` is unique within a plan (React key + de-dup).
 */
export type SessionBlock =
  | {
      kind: "flashcard";
      key: string;
      /** Which bank the card came from (drives how the result is recorded). */
      source: "vocab" | "redemittel";
      /** SRS / practice id used to record the result. */
      sourceId: string;
      de: string;
      en: string;
      /** Optional example sentence shown on the reveal side. */
      example?: string;
    }
  | { kind: "quiz"; key: string; question: QuizQuestion }
  | {
      kind: "grammar";
      key: string;
      drill: GrammarDrill;
      /** Human-readable group label for the end-screen forward hook. */
      groupLabel: string;
    }
  | {
      kind: "speaking";
      key: string;
      /** Vocab SRS id used to record the result. */
      sourceId: string;
      /** The German target the learner must produce out loud. */
      de: string;
      en: string;
      /** English example for context (the German sentence would reveal the answer). */
      example?: string;
    }
  | {
      kind: "typing";
      key: string;
      /** Vocab SRS id used to record the result. */
      sourceId: string;
      /** The German target the learner types from memory (bank display form). */
      de: string;
      en: string;
      /** English example for context (the German sentence would reveal the answer). */
      example?: string;
    }
  | {
      kind: "reading";
      key: string;
      /** Text-bank id (`ReadingText`) whose passage + checks this block renders. */
      textId: string;
      /**
       * Play the passage aloud via TTS (listening variant) with the text hidden
       * until revealed, rather than showing it up front. Set by the composer only
       * when the caller reports TTS support.
       */
      listening: boolean;
    };

/** An ordered, composed session plus a preview line for the Heute hero. */
export interface SessionPlan {
  blocks: SessionBlock[];
  /** Approximate length in minutes the plan was sized for. */
  minutes: number;
  /** One-line composition preview, e.g. "12 fällige Wörter · Schwachstelle: B2.1". */
  preview: string;
  /** Forward-hook seed shown on the end screen ("Morgen: … festigen"). */
  focus: string;
}

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
  /**
   * Ease factor (SM-2 legacy). The FSRS scheduler (26b) no longer reads it,
   * but keeps updating it with the SM-2 rule so reverting the engine to SM-2
   * needs no data repair.
   */
  ease: number;
  /** Interval in days (still the source of the day-granular `due`). */
  interval: number;
  /**
   * Total reviews. Under FSRS (26b) this no longer resets on a lapse: it must
   * only grow, because cloudSync's mergeSrs picks the higher-reps card.
   */
  reps: number;
  /** Due date as YYYY-MM-DD. */
  due: string;
  /**
   * FSRS memory stability: days until recall probability decays to 90%.
   * Absent on cards last written by the SM-2 era; seeded lazily from
   * `interval` on the next review (see engine/srs.ts).
   */
  stability?: number;
  /**
   * FSRS difficulty, clamped to 1..10 (higher = harder). Absent on legacy
   * cards; seeded lazily from `ease` on the next review.
   */
  difficulty?: number;
  /** Last grade 0–5. */
  lastGrade?: number;
  /**
   * Response latency of the most recent review, in ms. Measured from prompt
   * render to the first committing tap and clamped to a 60s ceiling (clamped,
   * not discarded, so an idle tab reads "slow" rather than "14 minutes").
   * Write-only training data for the FSRS upgrade; no scheduling effect yet.
   */
  lastMs?: number;
  /**
   * Exponential moving average of response latency (alpha 0.3), in ms. Smooths
   * the per-review `lastMs` into a stable "how fast does this learner recall
   * this card" signal. Companion to `lastMs`, same clamping.
   */
  emaMs?: number;
  /**
   * Count of latency samples folded into `emaMs`. Gates the Phase 1.5 latency
   * plug-in ("correct but slow" demotes Good -> Hard) so it only fires once the
   * card's own EMA is trustworthy (>= 3 samples). Grows only when a real
   * latency sample is recorded; a latency-less review carries it forward.
   */
  msCount?: number;
}

export type Grade = 0 | 3 | 4 | 5;

/* ---------------- Can-Do milestones (UX overhaul Phase 4) ---------------- */

/**
 * A CEFR-aligned competence milestone ("Ich kann …") attached to a theme.
 * Statements are written in our own German, aligned to (never copied from)
 * the Council of Europe CEFR descriptors; each has a provenance row. A
 * milestone counts as achieved when the learner's mastery ratio in its theme
 * (share of theme vocab at mastery >= 0.8) crosses `threshold`, so progress
 * reads as competence instead of a counter.
 */
export interface CanDoStatement {
  id: string;
  themeId: ThemeId;
  /** CEFR band the statement is pitched at. */
  cefr: ContentCefr;
  /** The German "Ich kann …" statement (user-facing). */
  statement: string;
  /** English gloss, kept as data for a future EN-UI mode. */
  en: string;
  /** Theme mastery ratio (0..1) at which this milestone is achieved. */
  threshold: number;
}

/* ---------------- Lesen/Hören text bank (redesign Phase 4.3) ---------------- */

/** Genre of an authentic-style text (closed enum, mirrored in lint-content.mjs). */
export type TextKind = "letter" | "email" | "memo" | "announcement" | "voicemail";

/** One multiple-choice comprehension check attached to a text. */
export interface TextCheck {
  /** Globally unique id, `<textId>_q<n>` convention. */
  id: string;
  /** German question about the text. */
  question: string;
  /** Answer options (German); exactly one is correct. */
  options: string[];
  /** The correct option; must be one of `options`. */
  answer: string;
  /** Short English explanation pointing at the evidence in the text. */
  explain?: string;
}

/**
 * A short authentic-style German text for the Lesen/Hören session block
 * (Behörden letter, workplace email, memo, announcement, voicemail script).
 * Voicemail scripts double as listening input via TTS in task 4.4. Results
 * feed XP/theme progress, not vocab FSRS, so texts carry no SRS fields.
 */
export interface ReadingText {
  /** Unique id with the `tx_` prefix. */
  id: string;
  kind: TextKind;
  themeId: ThemeId;
  /** CEFR band the text is pitched at. */
  cefr: ContentCefr;
  /** German title as it would appear in the wild (subject line, headline). */
  title: string;
  /** English gloss of the title. */
  titleEn: string;
  /** Full German text; paragraphs separated by blank lines. */
  de: string;
  /** English gloss of the full text (reveal layer, not shown by default). */
  en: string;
  /** Two to three comprehension checks. */
  checks: TextCheck[];
  /** Optional sub-theme link; must be declared on the parent theme. */
  subThemeId?: SubThemeId;
}

/* ---------------- Data governance — provenance register ---------------- */

export type ProvenanceContentType =
  | "vocabulary"
  | "collocation"
  | "grammar_topic"
  | "grammar_drill"
  | "dialogue"
  | "exam_set"
  | "redemittel"
  | "writing_prompt"
  | "can_do"
  | "text"
  | "mission";

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
