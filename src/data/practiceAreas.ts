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

/** Destinations whose browser understands a `?theme=` filter. */
const THEME_AWARE = ["/vocabulary", "/collocations", "/quiz"];

/**
 * Resolve a practice deep-link with the writing context folded in (Taxonomy
 * Phase 4 step 3). When the coach knows which theme the text was about, the
 * "Üben" button lands on a *filtered* drill set instead of the whole bank:
 * theme-aware destinations get `?theme=`, and the register weakness opens the
 * formal Redemittel directly. Falls back to the static route when no context.
 */
export function practiceRoute(
  area: PracticeArea,
  ctx: { theme?: string } = {},
): string {
  const [path, query] = area.route.split("?");
  const params = new URLSearchParams(query);
  if (ctx.theme && THEME_AWARE.includes(path) && !params.has("theme")) {
    params.set("theme", ctx.theme);
  }
  if (area.id === "register" && path === "/redemittel" && !params.has("register")) {
    params.set("register", "formal");
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
