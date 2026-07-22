/**
 * Grammar-dimension taxonomy for the Fokus "Satzlabor" (Schreibtraining redesign,
 * plan: docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md).
 *
 * The learner writes a sentence, the AI corrects + detects its grammar, and the
 * rail lets them transform the CORRECTED sentence along one axis. This file is
 * the single source of truth for the axes and their pills; the value ids are the
 * SAME strings the AI contract uses (check-sentence returns them as the detected
 * tuple, transform-sentence receives them as the target tuple), so the payload
 * maps 1:1 onto rail groups with no translation layer.
 *
 * MVP (Wave 1) ships the Voice x Tense grid only. Wave 2 (Zustandspassiv,
 * Konjunktiv II, Register, clause order) extends the arrays; the UI is data-driven
 * so growing the taxonomy needs no component changes.
 */

export type AxisId = "voice" | "tense";

/** Genus Verbi values (AI enum-compatible). */
export type VoiceValue = "aktiv" | "passiv_vorgang" | "passiv_zustand";
/** Tempus values (AI enum-compatible). */
export type TenseValue =
  | "praesens"
  | "perfekt"
  | "praeteritum"
  | "plusquamperfekt"
  | "futur1"
  | "futur2";

export interface GrammarValue {
  id: string;
  /** Learner-facing German label (no em dashes). */
  label: string;
  /** Compact label for the mobile chip row. */
  short?: string;
  /** English gloss for the hold-to-peek chip. */
  en: string;
}

export interface GrammarAxis {
  id: AxisId;
  /** Section eyebrow, German. */
  label: string;
  /** Compact group label for the mobile chip row. */
  short: string;
  values: GrammarValue[];
}

/**
 * The MVP grid: Aktiv / Vorgangspassiv x Praesens / Perfekt / Praeteritum.
 * "Passiv" means Vorgangspassiv (werden + Partizip), the process reading learners
 * mean ~95% of the time and the #1 B2-Beruf marker.
 */
export const GRAMMAR_AXES: GrammarAxis[] = [
  {
    id: "voice",
    label: "Genus Verbi",
    short: "Genus",
    values: [
      { id: "aktiv", label: "Aktiv", en: "active voice" },
      { id: "passiv_vorgang", label: "Passiv", en: "process passive (werden)" },
    ],
  },
  {
    id: "tense",
    label: "Zeitform",
    short: "Zeit",
    values: [
      { id: "praesens", label: "Präsens", short: "Präs", en: "present" },
      { id: "perfekt", label: "Perfekt", short: "Perf", en: "present perfect" },
      { id: "praeteritum", label: "Präteritum", short: "Prät", en: "simple past" },
    ],
  },
];

/** The mood every MVP tuple carries (Konjunktiv/Imperativ are Wave 2). */
export const DEFAULT_MOOD = "indikativ" as const;

/** A full grammar selection across every axis. */
export interface GrammarTuple {
  voice: string;
  tense: string;
  mood: string;
}

/** The set of value ids the MVP rail can actually display, per axis. */
const KNOWN: Record<AxisId, Set<string>> = {
  voice: new Set(GRAMMAR_AXES[0].values.map((v) => v.id)),
  tense: new Set(GRAMMAR_AXES[1].values.map((v) => v.id)),
};

/**
 * Map the AI's detected tuple onto the MVP pill set. Detection can return values
 * the MVP rail does not show yet (passiv_zustand, futur1, ...); those collapse to
 * the nearest displayable pill so the "aktuell" marker still lands somewhere
 * sensible, or to `null` when there is genuinely no match (then no pill is marked
 * current in that group, which is honest rather than wrong).
 */
export function normalizeDetected(voice?: string, tense?: string): {
  voice: string | null;
  tense: string | null;
} {
  const v = voice === "passiv_zustand" ? "passiv_vorgang" : voice ?? null;
  return {
    voice: v && KNOWN.voice.has(v) ? v : null,
    tense: tense && KNOWN.tense.has(tense) ? tense : null,
  };
}

/** Human-readable German label for a value id (falls back to the id). */
export function valueLabel(axis: AxisId, id: string | null): string {
  if (!id) return "";
  const found = GRAMMAR_AXES.find((a) => a.id === axis)?.values.find((v) => v.id === id);
  return found?.label ?? id;
}

/**
 * Friendly German reason strings for a transform the engine declined to produce.
 * Keys match the `reason` enum returned by transform-sentence. No em dashes.
 */
export const REFUSAL_COPY: Record<string, string> = {
  kein_akkusativobjekt:
    "Für diesen Satz gibt es keine sinnvolle Passiv-Form, weil ein Akkusativobjekt fehlt. Versuch einen Satz mit Objekt, zum Beispiel „Ich schreibe den Bericht“.",
  intransitiv_unpersoenlich:
    "Dieses Verb bildet kein persönliches Passiv. Nur ein unpersönliches Passiv wäre möglich, und das klingt hier nicht natürlich.",
  bereits_zielform: "Der Satz steht schon in dieser Form.",
  nicht_idiomatisch: "Diese Umformung ergäbe keinen natürlichen deutschen Satz.",
  mehrdeutig: "Der Satz lässt mehrere Lesarten zu, deshalb ist die Umformung hier nicht eindeutig.",
  modalverb_grenze: "Ein Modalverb oder eine besondere Konstruktion verhindert diese Form.",
};

export function refusalCopy(reason?: string): string {
  return (reason && REFUSAL_COPY[reason]) || "Diese Umformung passt hier nicht.";
}
