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
  | "travel";

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

export interface GrammarSnippet {
  id: string;
  title: string;
  purpose: string;
  pattern: string;
  examples: string[];
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
