import type { PracticeArea, WeaknessCategory } from "@/types";

/**
 * Registry mapping a writing-weakness category to an in-app practice
 * deep-link. Defined in Phase 1 so the Phase-2 writing coach only has to
 * map a detected weakness onto one of these routes ("Üben" button).
 */
export const practiceAreas: PracticeArea[] = [
  {
    id: "verbPosition",
    label: "Verb position",
    labelDe: "Verbstellung",
    route: "/grammar?topic=g_verbstellung",
    description: "Word order and the sentence bracket (Verbklammer).",
  },
  {
    id: "cases",
    label: "Cases & articles",
    labelDe: "Kasus & Artikel",
    route: "/grammar?topic=g_kasus",
    description: "Choosing the right case and article endings.",
  },
  {
    id: "vocabularyRange",
    label: "Vocabulary range",
    labelDe: "Wortschatz",
    route: "/quiz",
    description: "Broaden and activate workplace vocabulary.",
  },
  {
    id: "cohesion",
    label: "Cohesion & connectors",
    labelDe: "Konnektoren",
    route: "/grammar?topic=g_konnektoren",
    description: "Linking ideas so the text flows.",
  },
  {
    id: "relativeClauses",
    label: "Relative clauses",
    labelDe: "Relativsätze",
    route: "/grammar?topic=g_relativsaetze",
    description: "Relative pronouns and their cases.",
  },
  {
    id: "daWords",
    label: "da-/wo-words",
    labelDe: "Präpositionalpronomen",
    route: "/grammar?topic=g_praepositionalpronomen",
    description: "darauf, damit, worüber and friends.",
  },
  {
    id: "collocations",
    label: "Collocations",
    labelDe: "Nomen-Verb-Verbindungen",
    route: "/grammar?topic=g_nomen_verb",
    description: "Fixed noun-verb combinations.",
  },
  {
    id: "register",
    label: "Register & phrasing",
    labelDe: "Register & Redemittel",
    route: "/redemittel",
    description: "Formal vs. neutral phrasing for the workplace.",
  },
  {
    id: "spelling",
    label: "Spelling",
    labelDe: "Rechtschreibung",
    route: "/vocabulary",
    description: "Spelling and word forms.",
  },
];

export const practiceAreaById = (id: WeaknessCategory) =>
  practiceAreas.find((p) => p.id === id);
