import { vocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { redemittel } from "@/data/redemittel";
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

// ── Facet hygiene rules ──────────────────────────────────────────────────
// (1) Size ceiling: a facet renders as a row of pills, so it must stay small.
// Any dimension with more than MAX_FACET_OPTIONS distinct values does NOT
// belong as a facet: global/scoped search covers long-tail lookup instead.
// The Verb dimension (100+ values) was a facet before Phase 5 and is
// deliberately dropped here; typing a verb into search finds every
// collocation that uses it.
export const MAX_FACET_OPTIONS = 12;

// (2) Coverage floor (categorization audit 2026-07-09): a facet only renders
// when the bank actually uses it. Below the floor, the WHOLE facet hides (not
// just its empty options): a near-empty dimension looks broken, not filtered.
// Visibility follows coverage, never the Mode lens: this is what retired the
// Branche (4% tagged) and Situation (2.2%) facets. Coverage is computed over
// the full bank, not the current scope, so facets don't flicker while
// browsing. When a dimension (e.g. a future sector pack) crosses the floor,
// its facet reappears on its own.
export const MIN_FACET_COVERAGE = 0.15;
export const MIN_FACET_VALUES = 2;

/** True when the bank tags enough items (and enough distinct values) for the
 *  facet to be an honest filter. */
function passesFloor<T>(f: FacetDef<T>, items: T[]): boolean {
  const present = items.map((i) => f.get(i)).filter((v) => v !== undefined);
  const distinct = new Set(present).size;
  return distinct >= MIN_FACET_VALUES && present.length / items.length >= MIN_FACET_COVERAGE;
}

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

// Branche is a CONTEXT axis (the industry a learner works in), orthogonal to
// Thema (what the words are about). It is PARKED (founder decision 2026-07-09):
// the `sector` field and the Pflege tags stay in the data, but the facet stays
// below the coverage floor until an industry has real depth, so it never
// renders today. "Büro" was removed as a value: every industry has an office,
// so it is a category error, not a sector.
const SECTOR_OPTIONS: FacetOption[] = [
  { value: "care", label: "Pflege" },
  { value: "trades", label: "Handwerk" },
  { value: "it", label: "IT" },
  { value: "retail", label: "Handel" },
  { value: "hospitality", label: "Gastgewerbe" },
];

const REGISTER_OPTIONS: FacetOption[] = [
  { value: "neutral", label: "neutral" },
  { value: "formal", label: "formell" },
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

const ALL_VOCAB_FACETS = [VOCAB_CEFR, VOCAB_POS, VOCAB_SECTOR];

/** Vocab facets that clear the coverage floor. Visibility follows coverage
 *  (never the Mode lens): today that is CEFR + Wortart; Branche stays parked
 *  below the floor until a sector pack gives it real depth. */
export function vocabFacets(): FacetDef<Vocab>[] {
  return ALL_VOCAB_FACETS.filter((f) => passesFloor(f, vocabulary));
}

/** Every vocab facet id (including parked ones), for parsing/clearing URL params. */
export const VOCAB_FACET_IDS = ALL_VOCAB_FACETS.map((f) => f.id);

// ── Collocations (Verb dropped: it broke the ≤12-option rule) ─────────────
const COLLOCATION_FACETS: FacetDef<Collocation>[] = [
  facet(
    { id: "cefr", label: "Stufe (CEFR)", hint: "Mehrfachauswahl", options: CEFR_OPTIONS, get: (c) => c.cefr },
    collocations,
  ),
  facet({ id: "register", label: "Register", options: REGISTER_OPTIONS, get: (c) => c.register }, collocations),
];

export function collocationFacets(): FacetDef<Collocation>[] {
  return COLLOCATION_FACETS.filter((f) => passesFloor(f, collocations));
}
export const COLLOCATION_FACET_IDS = COLLOCATION_FACETS.map((f) => f.id);

// ── Redemittel ───────────────────────────────────────────────────────────
const REDEMITTEL_FACETS: FacetDef<Redemittel>[] = [
  facet({ id: "register", label: "Register", options: REGISTER_OPTIONS, get: (p) => p.register }, redemittel),
];

export function redemittelFacets(): FacetDef<Redemittel>[] {
  return REDEMITTEL_FACETS.filter((f) => passesFloor(f, redemittel));
}
export const REDEMITTEL_FACET_IDS = REDEMITTEL_FACETS.map((f) => f.id);
