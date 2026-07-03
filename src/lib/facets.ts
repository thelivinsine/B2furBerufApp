import { vocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { redemittel } from "@/data/redemittel";
import type { LearningMode } from "@/types";
import type { FacetDef, FacetOption } from "@/features/shared/FacetSheet";
import { CEFR_ORDER } from "@/lib/cefr";

// ─────────────────────────────────────────────────────────────────────────
// Central facet registry (UX overhaul Phase 5, Tier 3).
//
// Facet definitions used to be hand-wired inside each browse page
// (VocabularyTrainer / CollocationsBrowser / RedemittelTrainer), which meant
// three copies of the same label maps and no shared rule for what may be a
// facet. They now live here, declared once per content type and derived from
// the taxonomy enums, so a new content pack or a new facet shows up everywhere
// at once. Pages call `vocabFacets(mode)` / `collocationFacets()` /
// `redemittelFacets()` and read the matching `*_FACET_IDS` for URL wiring.
//
// The definitions are the same `FacetDef<T>` shape the shared FacetSheet
// already consumes, so nothing about the UI changes.
// ─────────────────────────────────────────────────────────────────────────

// ── Facet hygiene rule ───────────────────────────────────────────────────
// A facet renders as a row of pills, so it must stay small. Any dimension with
// more than MAX_FACET_OPTIONS distinct values does NOT belong as a facet:
// global/scoped search covers long-tail lookup instead. The Verb dimension
// (100+ values) was a facet before Phase 5 and is deliberately dropped here;
// typing a verb into search finds every collocation that uses it.
export const MAX_FACET_OPTIONS = 12;

// Inferred item types, so the accessors stay in lock-step with the data shape.
type Vocab = (typeof vocabulary)[number];
type Collocation = (typeof collocations)[number];
type Redemittel = (typeof redemittel)[number];

/** Build a FacetDef, keeping only option values that actually occur in the
 *  dataset and enforcing the ≤12-option hygiene rule (dev-time warning). */
function facet<T>(
  def: Omit<FacetDef<T>, "options"> & { options: FacetOption[] },
  items: T[],
): FacetDef<T> {
  const present = def.options.filter((o) => items.some((i) => def.get(i) === o.value));
  if (import.meta.env.DEV && present.length > MAX_FACET_OPTIONS) {
    console.warn(
      `[facets] "${def.id}" has ${present.length} options (> ${MAX_FACET_OPTIONS}). ` +
        `Facets must stay small; use search for long-tail dimensions instead.`,
    );
  }
  return { ...def, options: present };
}

// ── Shared label maps (single source of truth) ───────────────────────────
const CEFR_OPTIONS: FacetOption[] = CEFR_ORDER.map((c) => ({ value: c, label: c }));

const POS_OPTIONS: FacetOption[] = [
  { value: "noun", label: "Nomen" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjektiv" },
  { value: "adverb", label: "Adverb" },
  { value: "phrase", label: "Phrase" },
  { value: "connector", label: "Konnektor" },
];

const SECTOR_OPTIONS: FacetOption[] = [
  { value: "care", label: "Pflege" },
  { value: "office", label: "Büro" },
  { value: "trades", label: "Handwerk" },
  { value: "it", label: "IT" },
  { value: "retail", label: "Handel" },
  { value: "hospitality", label: "Gastgewerbe" },
];

const SITUATION_OPTIONS: FacetOption[] = [
  { value: "meeting", label: "Besprechung" },
  { value: "shift-handover", label: "Übergabe" },
  { value: "customer-call", label: "Kundengespräch" },
  { value: "instructions", label: "Unterweisung" },
  { value: "onboarding", label: "Einarbeitung" },
  { value: "sick-leave", label: "Krankmeldung" },
  { value: "review", label: "Feedback" },
];

const REGISTER_OPTIONS: FacetOption[] = [
  { value: "neutral", label: "neutral" },
  { value: "formal", label: "formell" },
  { value: "diplomatic", label: "diplomatisch" },
];

// ── Vocabulary ───────────────────────────────────────────────────────────
const VOCAB_CEFR: FacetDef<Vocab> = facet(
  { id: "cefr", label: "Stufe (CEFR)", hint: "Mehrfachauswahl", options: CEFR_OPTIONS, get: (v) => v.cefr },
  vocabulary,
);
const VOCAB_POS: FacetDef<Vocab> = facet(
  { id: "pos", label: "Wortart", options: POS_OPTIONS, get: (v) => v.pos },
  vocabulary,
);
const VOCAB_SECTOR: FacetDef<Vocab> = facet(
  { id: "sector", label: "Branche", options: SECTOR_OPTIONS, get: (v) => v.sector },
  vocabulary,
);
const VOCAB_SITUATION: FacetDef<Vocab> = facet(
  { id: "workSituation", label: "Situation", options: SITUATION_OPTIONS, get: (v) => v.workSituation },
  vocabulary,
);

/** Vocab facets. The Work-only facets (Branche, Situation) show only when the
 *  Mode lens is set to `work`; they roll up otherwise. */
export function vocabFacets(mode: LearningMode): FacetDef<Vocab>[] {
  return mode === "work"
    ? [VOCAB_CEFR, VOCAB_POS, VOCAB_SECTOR, VOCAB_SITUATION]
    : [VOCAB_CEFR, VOCAB_POS];
}

/** Every vocab facet id (mode-independent), for parsing/clearing URL params. */
export const VOCAB_FACET_IDS = [VOCAB_CEFR, VOCAB_POS, VOCAB_SECTOR, VOCAB_SITUATION].map((f) => f.id);

// ── Collocations (Verb dropped: it broke the ≤12-option rule) ─────────────
const COLLOCATION_FACETS: FacetDef<Collocation>[] = [
  facet(
    { id: "cefr", label: "Stufe (CEFR)", hint: "Mehrfachauswahl", options: CEFR_OPTIONS, get: (c) => c.cefr },
    collocations,
  ),
  facet({ id: "register", label: "Register", options: REGISTER_OPTIONS, get: (c) => c.register }, collocations),
];

export function collocationFacets(): FacetDef<Collocation>[] {
  return COLLOCATION_FACETS;
}
export const COLLOCATION_FACET_IDS = COLLOCATION_FACETS.map((f) => f.id);

// ── Redemittel ───────────────────────────────────────────────────────────
const REDEMITTEL_FACETS: FacetDef<Redemittel>[] = [
  facet({ id: "register", label: "Register", options: REGISTER_OPTIONS, get: (p) => p.register }, redemittel),
];

export function redemittelFacets(): FacetDef<Redemittel>[] {
  return REDEMITTEL_FACETS;
}
export const REDEMITTEL_FACET_IDS = REDEMITTEL_FACETS.map((f) => f.id);
