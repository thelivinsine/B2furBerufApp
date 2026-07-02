import { vocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { redemittel } from "@/data/redemittel";
import { grammar } from "@/data/grammar";
import { scenarios } from "@/data/dialogues";

export type SearchKind = "vocab" | "collocation" | "redemittel" | "grammar" | "scenario";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  /** In-app deep-link to the item's home surface. */
  to: string;
}

export interface SearchGroup {
  kind: SearchKind;
  label: string;
  /** Full match count (results below is capped for display). */
  count: number;
  results: SearchResult[];
}

const MAX_RESULTS_PER_GROUP = 5;

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c));
}

function makeGroup(kind: SearchKind, label: string, results: SearchResult[]): SearchGroup {
  return { kind, label, count: results.length, results: results.slice(0, MAX_RESULTS_PER_GROUP) };
}

/**
 * The universal shortcut search (UX overhaul Phase 2, Tier 1): one query over
 * every content bank instead of three siloed per-page search boxes. All banks
 * are small static in-memory arrays (~1,000 items total combined), so a linear
 * scan over the existing normalised text fields needs no index. Each result
 * deep-links to its home surface; the per-page search boxes remain as scoped
 * refiners once there.
 */
export function searchAll(query: string): SearchGroup[] {
  const q = normalise(query.trim());
  if (q.length < 2) return [];
  const matches = (s: string) => normalise(s).includes(q);

  const vocabResults = vocabulary
    .filter((v) => matches(v.de) || matches(v.en) || v.related.some(matches))
    .map(
      (v): SearchResult => ({
        id: v.id,
        title: v.de,
        subtitle: v.en,
        to: `/vocabulary?theme=${v.themeId}${v.subThemeId ? `&sub=${v.subThemeId}` : ""}`,
      }),
    );

  const collocationResults = collocations
    .filter((c) => matches(c.full) || matches(c.noun) || matches(c.verb) || matches(c.en))
    .map(
      (c): SearchResult => ({
        id: c.id,
        title: c.full,
        subtitle: c.en,
        to: `/collocations?theme=${c.themeId ?? "all"}&q=${encodeURIComponent(c.full)}`,
      }),
    );

  const redemittelResults = redemittel
    .filter((p) => matches(p.de) || matches(p.en))
    .map(
      (p): SearchResult => ({
        id: p.id,
        title: p.de,
        subtitle: p.en,
        to: `/redemittel?cat=${p.category}`,
      }),
    );

  const grammarResults = grammar
    .filter((t) => matches(t.titleDe) || matches(t.purposeDe) || matches(t.explanation))
    .map(
      (t): SearchResult => ({
        id: t.id,
        title: t.titleDe,
        subtitle: t.purposeDe,
        to: `/grammar?topic=${t.id}`,
      }),
    );

  const scenarioResults = scenarios
    .filter((sc) => matches(sc.title) || matches(sc.task) || matches(sc.context))
    .map(
      (sc): SearchResult => ({
        id: sc.id,
        title: sc.title,
        subtitle: sc.task,
        to: "/simulation",
      }),
    );

  return [
    makeGroup("vocab", "Wörter", vocabResults),
    makeGroup("collocation", "Kollokationen", collocationResults),
    makeGroup("redemittel", "Redemittel", redemittelResults),
    makeGroup("grammar", "Grammatik", grammarResults),
    makeGroup("scenario", "Szenarien", scenarioResults),
  ].filter((g) => g.count > 0);
}
