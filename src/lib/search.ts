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

/** One pre-normalised haystack string per item, so a query is a single
 *  `includes` per item instead of re-running the normalise regexes over every
 *  field on every keystroke (~5,000 regex passes per keypress before). */
interface IndexEntry {
  text: string;
  result: SearchResult;
}

function buildEntry(fields: (string | undefined)[], result: SearchResult): IndexEntry {
  return { text: normalise(fields.filter(Boolean).join(" ")), result };
}

let INDEX: Record<SearchKind, IndexEntry[]> | null = null;

function buildIndex(): NonNullable<typeof INDEX> {
  return {
    vocab: vocabulary.map((v) =>
      buildEntry([v.de, v.en, ...v.related], {
        id: v.id,
        title: v.de,
        subtitle: v.en,
        to: `/vocabulary?theme=${v.themeId}${v.subThemeId ? `&sub=${v.subThemeId}` : ""}`,
      }),
    ),
    collocation: collocations.map((c) =>
      buildEntry([c.full, c.noun, c.verb, c.en], {
        id: c.id,
        title: c.full,
        subtitle: c.en,
        to: `/collocations?theme=${c.themeId ?? "all"}&q=${encodeURIComponent(c.full)}`,
      }),
    ),
    redemittel: redemittel.map((p) =>
      buildEntry([p.de, p.en], {
        id: p.id,
        title: p.de,
        subtitle: p.en,
        to: `/redemittel?cat=${p.category}`,
      }),
    ),
    grammar: grammar.map((t) =>
      buildEntry([t.titleDe, t.purposeDe, t.explanation], {
        id: t.id,
        title: t.titleDe,
        subtitle: t.purposeDe,
        to: `/grammar?topic=${t.id}`,
      }),
    ),
    scenario: scenarios.map((sc) =>
      buildEntry([sc.title, sc.task, sc.context], {
        id: sc.id,
        title: sc.title,
        subtitle: sc.task,
        to: "/simulation",
      }),
    ),
  };
}

/**
 * The universal shortcut search (UX overhaul Phase 2, Tier 1): one query over
 * every content bank instead of three siloed per-page search boxes. The banks
 * are normalised into a flat index once (lazily, on the first query); each
 * result deep-links to its home surface. The per-page search boxes remain as
 * scoped refiners once there.
 */
export function searchAll(query: string): SearchGroup[] {
  const q = normalise(query.trim());
  if (q.length < 2) return [];
  INDEX ??= buildIndex();

  const find = (kind: SearchKind) =>
    INDEX![kind].filter((e) => e.text.includes(q)).map((e) => e.result);

  return [
    makeGroup("vocab", "Wörter", find("vocab")),
    makeGroup("collocation", "Kollokationen", find("collocation")),
    makeGroup("redemittel", "Redemittel", find("redemittel")),
    makeGroup("grammar", "Grammatik", find("grammar")),
    makeGroup("scenario", "Szenarien", find("scenario")),
  ].filter((g) => g.count > 0);
}
