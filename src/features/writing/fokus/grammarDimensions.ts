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
 * Wave 1 shipped the Voice x Tense grid. Wave 2 adds Modus (Konjunktiv II) as a
 * third combinable axis (the backend enums already carry it). Zustandspassiv,
 * Register and clause order remain later waves; the UI is data-driven so growing
 * the taxonomy needs no component changes.
 */

export type AxisId = "voice" | "tense" | "mood";

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
/** Modus values (AI enum-compatible). */
export type MoodValue = "indikativ" | "konjunktiv1" | "konjunktiv2" | "imperativ";

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
  {
    // Wave 2: Konjunktiv II is the #1 productive B2 politeness/hypothetical
    // marker (koennten Sie, ich haette gern, an Ihrer Stelle wuerde ich). The
    // backend already detects + generates mood, so this is a data-only add.
    // Imperativ / Konjunktiv I stay off the rail (detection is unreliable there
    // and they collapse to K-II in most persons).
    id: "mood",
    label: "Modus",
    short: "Modus",
    values: [
      { id: "indikativ", label: "Indikativ", short: "Ind", en: "indicative (real)" },
      {
        id: "konjunktiv2",
        label: "Konjunktiv II",
        short: "K II",
        en: "subjunctive II (polite / hypothetical)",
      },
    ],
  },
];

/** The mood a tuple falls back to when none is detected or selected. */
export const DEFAULT_MOOD = "indikativ" as const;

/** A full grammar selection across every axis. */
export interface GrammarTuple {
  voice: string;
  tense: string;
  mood: string;
}

/** The set of value ids the rail can actually display, per axis. */
const KNOWN: Record<AxisId, Set<string>> = {
  voice: new Set(GRAMMAR_AXES[0].values.map((v) => v.id)),
  tense: new Set(GRAMMAR_AXES[1].values.map((v) => v.id)),
  mood: new Set(GRAMMAR_AXES[2].values.map((v) => v.id)),
};

/**
 * Map the AI's detected tuple onto the MVP pill set. Detection can return values
 * the MVP rail does not show yet (passiv_zustand, futur1, ...); those map to `null`
 * (no pill marked current in that group), which is honest rather than wrong.
 *
 * `passiv_zustand` is deliberately NOT collapsed onto the Passiv pill: that pill is
 * Vorgangspassiv (werden + Partizip), a different construction from a Zustandspassiv
 * (sein + Partizip). Collapsing them mislabeled real Zustandspassiv AND, worse, turned
 * any copula the detector misread as "sein + Partizip" (e.g. "Ich bin krank") into a
 * confident green Passiv marker. Returning `null` keeps that slip from ever surfacing
 * a wrong voice on the rail even if detection is off. `mood` is treated the same way:
 * konjunktiv1 / imperativ are not on the rail, so they map to `null` (no pill marked).
 */
export function normalizeDetected(voice?: string, tense?: string, mood?: string): {
  voice: string | null;
  tense: string | null;
  mood: string | null;
} {
  return {
    voice: voice && KNOWN.voice.has(voice) ? voice : null,
    tense: tense && KNOWN.tense.has(tense) ? tense : null,
    mood: mood && KNOWN.mood.has(mood) ? mood : null,
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
