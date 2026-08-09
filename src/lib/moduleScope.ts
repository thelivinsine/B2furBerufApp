import { texts } from "@/data/texts";
import { scenarios } from "@/data/dialogues";
import { levelBand } from "@/lib/writingScope";
import { matchesLifeArea, type LifeAreaId } from "@/lib/lifeAreas";
import type { ContentCefr, ReadingText, Scenario, TextKind, WorkSector } from "@/types";
import type { MockExamLevel, MockPartId } from "@/engine/exam";

/**
 * The scope selectors behind the Ohne-Zeit choosers (s196).
 *
 * Founder s196: the three modules that had no Aufgabe picker (Sprechen's flat
 * list, and Lesen/Hören which dropped the learner straight into a random draw)
 * get Schreiben's "Aufgabe wählen" rail. A rail needs exactly two things from
 * the content: a selector that answers "what does this scope serve" and a
 * counter built on the SAME selector, so every dropdown option can print an
 * honest count and grey out at zero. That is this file, and it is the same
 * contract `lib/writingScope.ts` holds for Schreiben.
 *
 * The filter law is the app's (CLAUDE.md): **a filter filters, it never
 * substitutes.** Niveau, Thema, Unterthema and Textsorte are HARD; Branche is
 * the one SOFT axis (untagged = universal) and is applied LAST, so it can
 * narrow a pool but never hide a hard match or empty it on its own.
 */

/** Kinds that read naturally as audio. Mirrors `engine/exam.ts`. */
const AUDIO_KINDS = new Set<TextKind>(["voicemail", "announcement"]);

/** Which module a text belongs to: Hören owns the audio kinds, Lesen the rest. */
export function partOfText(text: ReadingText): "lesen" | "hoeren" {
  return AUDIO_KINDS.has(text.kind) ? "hoeren" : "lesen";
}

/** The whole pool one receptive module can ever serve, in bank order. */
export function textsForPart(part: "lesen" | "hoeren"): ReadingText[] {
  return texts.filter((t) => partOfText(t) === part);
}

export interface TextScope {
  /** Coarse CEFR band ("B1" | "B2" | "C1"), "" = every Niveau. */
  level: string;
  sector: string;
  area: LifeAreaId | "";
  theme: string;
  sub: string;
  /** `ReadingText.kind`, "" = every Textsorte. */
  kind: string;
}

export const EMPTY_TEXT_SCOPE: TextScope = {
  level: "",
  sector: "",
  area: "",
  theme: "",
  sub: "",
  kind: "",
};

/**
 * The texts a scope serves, in the order the list renders them. Hard axes
 * first, Branche last and soft, exactly like `eligibleTasks`.
 */
export function scopedTexts(part: "lesen" | "hoeren", scope: TextScope): ReadingText[] {
  let pool = textsForPart(part);
  if (scope.level) pool = pool.filter((t) => levelBand(t.cefr) === scope.level);
  if (scope.kind) pool = pool.filter((t) => t.kind === scope.kind);
  if (scope.area) pool = pool.filter((t) => matchesLifeArea(t.themeId, scope.area));
  if (scope.theme) pool = pool.filter((t) => t.themeId === scope.theme);
  if (scope.sub) pool = pool.filter((t) => t.subThemeId === scope.sub);
  if (scope.sector && pool.length) {
    const tagged = pool.filter((t) => t.sectors?.includes(scope.sector as WorkSector));
    if (tagged.length) pool = tagged;
    else {
      const universal = pool.filter((t) => !t.sectors?.length);
      if (universal.length) pool = universal;
    }
  }
  return pool;
}

/** How many texts a scope yields. The number every dropdown option prints. */
export function countTexts(part: "lesen" | "hoeren", scope: TextScope): number {
  return scopedTexts(part, scope).length;
}

/**
 * How many texts in this scope are actually TAGGED with `sector` (founder s199,
 * the twin of `writingScope.countDedicatedTasks`).
 *
 * `countTexts` can never return zero for a Branche, because the fallback above
 * serves the universal texts instead. That is right for the draw and wrong for
 * the rail, which printed a healthy number next to an industry that changed
 * nothing about the draw. A zero here LOCKS the option. Only 4 of the 52 texts
 * carry a Branche tag today, so on Lesen and Hören this locks nearly everything,
 * which is the honest state of that bank and the reason the rail collapses to
 * one line rather than showing fifteen padlocks.
 */
export function countDedicatedTexts(
  part: "lesen" | "hoeren",
  scope: TextScope,
  sector: string,
): number {
  return scopedTexts(part, { ...scope, sector: "" }).filter((t) =>
    t.sectors?.includes(sector as WorkSector),
  ).length;
}

/**
 * The Modelltest level a single text belongs to, for the run it starts. The
 * bands pair up the same way `LEVEL_BANDS` does in `engine/exam.ts`, so a B2.2
 * text drills as a B2 module and its score lands in the B2 Stärkeprofil.
 */
export function levelOfText(text: ReadingText): MockExamLevel {
  const band = levelBand(text.cefr as ContentCefr);
  return band === "B1" ? "B1" : band === "C1" ? "C1" : "B2";
}

/** How many MC questions a text carries; the card's honest promise. */
export function checkCount(text: ReadingText): number {
  return text.checks.length;
}

/* --------------------------------- Sprechen -------------------------------- */

export interface ScenarioScope {
  /** Coarse band ("B1" | "B2" | "C1"), "" = every Niveau. */
  level: string;
  area: LifeAreaId | "";
  theme: string;
}

export const EMPTY_SCENARIO_SCOPE: ScenarioScope = { level: "", area: "", theme: "" };

/**
 * The scenarios' own 1-3 difficulty ladder predates the CEFR bands, so it maps
 * rather than being reinterpreted.
 *
 * This is the HUB's mapping (the `?level=` the Prüfung hub hands over, which
 * the old page inverted as `LEVEL_BY_BAND`), deliberately NOT the finer one
 * `engine/speaking.ts` pitches a brief at. They answer different questions: the
 * rail's is "which Niveau is this Situation filed under", the brief's is "how
 * hard should the AI partner speak", and the second is conservative on purpose.
 * Folding them would have quietly dropped every Mittelstufe scenario out of a
 * B2 scope.
 */
export const SCENARIO_BAND: Record<1 | 2 | 3, string> = { 1: "B1", 2: "B2", 3: "C1" };

/** The band a Niveau option selects for; the reverse of `SCENARIO_BAND`. */
export function scenarioBandOf(scenario: Scenario): string {
  return SCENARIO_BAND[scenario.level];
}

export function scopedScenarios(scope: ScenarioScope): Scenario[] {
  let pool = scenarios.slice();
  if (scope.level) pool = pool.filter((s) => scenarioBandOf(s) === scope.level);
  if (scope.area) pool = pool.filter((s) => matchesLifeArea(s.themeId, scope.area));
  if (scope.theme) pool = pool.filter((s) => s.themeId === scope.theme);
  return pool;
}

export function countScenarios(scope: ScenarioScope): number {
  return scopedScenarios(scope).length;
}

/** Niveau options a module's rail offers. Coarse bands only, like Schreiben. */
export const MODULE_LEVELS: { value: string; label: string }[] = [
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
];

/** Learner-facing Textsorte label for a reading/listening text. */
export const TEXT_KIND_LABEL: Record<TextKind, string> = {
  letter: "Brief",
  email: "E-Mail",
  memo: "Mitteilung",
  announcement: "Durchsage",
  voicemail: "Mailbox",
};

/** The Textsorten a module's bank actually holds, so no option is dead chrome. */
export function kindsInPart(part: "lesen" | "hoeren"): TextKind[] {
  const seen = new Set<TextKind>();
  for (const t of textsForPart(part)) seen.add(t.kind);
  return (Object.keys(TEXT_KIND_LABEL) as TextKind[]).filter((k) => seen.has(k));
}

/** The two receptive modules, for the routes and pickers that serve both. */
export const RECEPTIVE_PARTS = ["lesen", "hoeren"] as const;
export type ReceptivePart = (typeof RECEPTIVE_PARTS)[number];

export function isReceptivePart(part: MockPartId): part is ReceptivePart {
  return part === "lesen" || part === "hoeren";
}
