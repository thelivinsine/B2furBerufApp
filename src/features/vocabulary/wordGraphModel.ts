import type { Collocation, VocabItem } from "@/types";
import { frequency as frequencyMap } from "@/data/frequency";

/**
 * Pure graph builder for the Wörter graph view (Bibliothek views, session 91,
 * from the founder's Obsidian-style mockup). Turns the CURRENTLY FILTERED
 * vocab list into nodes + links:
 *
 * - Nodes are the visible vocab items. Radius encodes real-life commonness
 *   (raw wordfreq Zipf from the generated frequency map); words without
 *   corpus evidence get the minimum radius, never a fake "rare" claim.
 * - Links come from two authored sources, no inference:
 *   (1) each item's `related` terms that resolve to another visible item, and
 *   (2) collocations whose noun AND verb both resolve to visible items
 *       ("goes well with", e.g. "die Entscheidung" – "treffen").
 *
 * Related terms that are not themselves bank entries are dropped (founder
 * confirmed 2026-07-11): the graph shows the bank, not free-floating strings.
 * Kept free of React/DOM so tests/wordgraph.test.ts can pin the matching.
 */
export interface GraphNode {
  id: string;
  /** Display form, e.g. "die Besprechung". */
  label: string;
  themeId: string;
  /** wordfreq Zipf (undefined = no corpus evidence). */
  zipf?: number;
  /** Node radius in world units, derived from zipf. */
  r: number;
  /** Link count, filled by buildWordGraph. */
  degree: number;
}

export interface GraphLink {
  source: string;
  target: string;
  kind: "related" | "collocation";
}

export interface WordGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Leading articles (definite + indefinite) that word forms and collocation
// nouns carry: "die Besprechung", "eine Entscheidung", "einen Vorschlag".
const ARTICLE_RE = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\s+/i;

/** Normalise a display form to a match key: strip article, reflexive "sich",
 *  bracketed hints and case/diacritic noise. */
export function normalizeForm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(ARTICLE_RE, "")
    .replace(/^sich\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const MIN_R = 3.5;
const MAX_R = 12;
const ZIPF_FLOOR = 1.5; // below this the frequency pipeline assigns no bin

/** Map a Zipf score (~1.5..6 in this bank) onto a node radius. */
export function radiusForZipf(zipf: number | undefined): number {
  if (zipf === undefined || zipf < ZIPF_FLOOR) return MIN_R;
  const t = Math.min((zipf - ZIPF_FLOOR) / (6 - ZIPF_FLOOR), 1);
  return MIN_R + t * (MAX_R - MIN_R);
}

export function buildWordGraph(items: VocabItem[], collocationBank: Collocation[]): WordGraphData {
  // First form wins on collisions (e.g. two senses of one surface form):
  // stable and cheap, and the duplicate still gets its own node.
  // The authored `plural` form is registered as an alias to the same node, so a
  // collocation or related term written in the plural ("Beschwerden") still
  // resolves to its singular entry instead of silently dropping the edge.
  const byForm = new Map<string, string>();
  for (const v of items) {
    const key = normalizeForm(v.de);
    if (key && !byForm.has(key)) byForm.set(key, v.id);
  }
  for (const v of items) {
    if (!v.plural) continue;
    const pk = normalizeForm(v.plural);
    if (pk && !byForm.has(pk)) byForm.set(pk, v.id);
  }

  const degree = new Map<string, number>();
  const links: GraphLink[] = [];
  const seen = new Set<string>();

  const addLink = (a: string, b: string, kind: GraphLink["kind"]) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source: a, target: b, kind });
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  };

  // (1) Authored `related` terms that resolve to another visible item.
  for (const v of items) {
    for (const rel of v.related) {
      const target = byForm.get(normalizeForm(rel));
      if (target) addLink(v.id, target, "related");
    }
  }

  // (2) Collocations whose noun AND verb are both visible items.
  for (const c of collocationBank) {
    const noun = byForm.get(normalizeForm(c.noun));
    const verb = byForm.get(normalizeForm(c.verb));
    if (noun && verb) addLink(noun, verb, "collocation");
  }

  const nodes: GraphNode[] = items.map((v) => {
    const zipf = frequencyMap[v.id]?.zipf;
    return {
      id: v.id,
      label: v.de,
      themeId: v.themeId,
      zipf,
      r: radiusForZipf(zipf),
      degree: degree.get(v.id) ?? 0,
    };
  });

  return { nodes, links };
}
