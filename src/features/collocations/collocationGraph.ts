import type { Collocation } from "@/types";
import { themeById } from "@/data/themes";
import { normalizeForm } from "../vocabulary/wordGraph";

/**
 * Pure graph builder for the Kollokationen graph view (Bibliothek views).
 *
 * The model is a **bipartite noun ↔ verb graph**: every distinct noun and every
 * distinct verb in the CURRENTLY FILTERED list becomes a node, and every
 * collocation becomes an edge between its noun and its verb. So tapping the verb
 * "treffen" reveals every noun it pairs with, and tapping "die Entscheidung"
 * reveals every verb it takes. Edges are the authored collocations themselves,
 * so nothing is inferred (a core project rule).
 *
 * - Node size (`r`) encodes **degree** (how many partners it has), so common
 *   verbs like "machen"/"geben" become large, well-connected hubs. Frequency
 *   data is keyed by collocation id, not by surface form, so degree is both the
 *   available and the more meaningful signal here.
 * - Node color/cluster follow a node's **primary theme** (majority vote across
 *   the collocations it appears in), which lets the renderer pull each node
 *   toward its theme centroid to form "islands"; shared verbs settle between
 *   islands as bridges.
 *
 * Kept free of React/DOM so tests/collocationGraph.test.ts can pin the matching.
 * Reuses `normalizeForm` from the Wörter graph (strips article/reflexive/hints).
 */
export type NodeKind = "noun" | "verb";

export interface CollocationNode {
  /** Namespaced id: "n:<normNoun>" or "v:<normVerb>" (so a noun and a verb that
   *  share a surface form never collide onto one node). */
  id: string;
  /** Display form, first occurrence wins (keeps the article on nouns). */
  label: string;
  kind: NodeKind;
  /** Primary theme (majority vote) — the clustering centroid. */
  themeId?: string;
  /** Domain of the primary theme — the node color. */
  domain?: string;
  /** Distinct partner count, filled from the de-duped links. */
  degree: number;
  /** Node radius in world units, derived from degree. */
  r: number;
}

export interface CollocationLink {
  /** Noun node id. */
  source: string;
  /** Verb node id. */
  target: string;
  register?: "neutral" | "formal";
  collocationId: string;
}

export interface CollocationGraphData {
  nodes: CollocationNode[];
  links: CollocationLink[];
}

export const nounId = (norm: string) => `n:${norm}`;
export const verbId = (norm: string) => `v:${norm}`;

const MIN_R = 4;
const MAX_R = 16;
// Degree at/above which a node reaches the max radius. Caps the visual weight of
// the biggest hubs so they read big without swallowing the map.
const DEGREE_CAP = 16;

/** Map a node's degree (partner count, ≥1) onto a radius with a sqrt curve, so
 *  a degree-8 hub is clearly bigger than a degree-2 node but a degree-30 hub
 *  does not dwarf everything. */
export function nodeRadiusForDegree(degree: number): number {
  const d = Math.max(1, degree);
  const t = Math.min(Math.sqrt(d - 1) / Math.sqrt(DEGREE_CAP - 1), 1);
  return MIN_R + t * (MAX_R - MIN_R);
}

/** Most-voted theme; ties resolve to the first seen (insertion order). */
function majorityTheme(votes: Map<string, number>): string | undefined {
  let best: string | undefined;
  let bestN = 0;
  for (const [theme, n] of votes) {
    if (n > bestN) {
      bestN = n;
      best = theme;
    }
  }
  return best;
}

export function buildCollocationGraph(items: Collocation[]): CollocationGraphData {
  interface Acc {
    id: string;
    label: string;
    kind: NodeKind;
    themeVotes: Map<string, number>;
  }
  const acc = new Map<string, Acc>();
  const ensure = (id: string, label: string, kind: NodeKind): Acc => {
    let n = acc.get(id);
    if (!n) {
      n = { id, label, kind, themeVotes: new Map() };
      acc.set(id, n);
    }
    return n;
  };

  const links: CollocationLink[] = [];
  const seenPair = new Set<string>();
  const degree = new Map<string, number>();

  for (const c of items) {
    const nNorm = normalizeForm(c.noun);
    const vNorm = normalizeForm(c.verb);
    if (!nNorm || !vNorm) continue;
    const nId = nounId(nNorm);
    const vId = verbId(vNorm);
    const nNode = ensure(nId, c.noun.trim(), "noun");
    const vNode = ensure(vId, c.verb.trim(), "verb");

    // Theme votes count every collocation (even duplicate pairs), so a node's
    // primary theme reflects everywhere it is used.
    if (c.themeId) {
      nNode.themeVotes.set(c.themeId, (nNode.themeVotes.get(c.themeId) ?? 0) + 1);
      vNode.themeVotes.set(c.themeId, (vNode.themeVotes.get(c.themeId) ?? 0) + 1);
    }

    // One edge per distinct noun|verb pair (a pair repeated across themes is a
    // single edge).
    const pairKey = `${nId}|${vId}`;
    if (seenPair.has(pairKey)) continue;
    seenPair.add(pairKey);
    links.push({ source: nId, target: vId, register: c.register, collocationId: c.id });
    degree.set(nId, (degree.get(nId) ?? 0) + 1);
    degree.set(vId, (degree.get(vId) ?? 0) + 1);
  }

  const nodes: CollocationNode[] = [];
  for (const n of acc.values()) {
    const primaryTheme = majorityTheme(n.themeVotes);
    const domain = primaryTheme ? themeById(primaryTheme)?.domain : undefined;
    const deg = degree.get(n.id) ?? 0;
    nodes.push({
      id: n.id,
      label: n.label,
      kind: n.kind,
      themeId: primaryTheme,
      domain,
      degree: deg,
      r: nodeRadiusForDegree(deg),
    });
  }

  return { nodes, links };
}
