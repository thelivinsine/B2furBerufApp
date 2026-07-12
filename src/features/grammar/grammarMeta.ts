import type { GrammarGroup, GrammarTopic } from "@/types";
import { grammar } from "@/data/grammar";

/**
 * Shared display metadata for the Grammatik tab (hub, views and the topic
 * lesson). Lives in its own module so GrammarHub, GrammarViews and
 * GrammarTopicView can all import it without circular imports.
 */
export const groupMeta: Record<GrammarGroup, { labelDe: string; icon: string }> = {
  connectors: { labelDe: "Konnektoren", icon: "Link2" },
  relativeClauses: { labelDe: "Relativsätze", icon: "GitBranch" },
  prepositionalPronouns: { labelDe: "da-/wo-Wörter", icon: "CornerDownRight" },
  collocations: { labelDe: "Nomen-Verb-Verbindungen", icon: "Combine" },
  verbPosition: { labelDe: "Verbstellung", icon: "MoveHorizontal" },
  subordinate: { labelDe: "Nebensätze", icon: "CornerDownRight" },
  cases: { labelDe: "Kasus", icon: "ArrowRightLeft" },
  konjunktiv2: { labelDe: "Konjunktiv II", icon: "Layers" },
  modals: { labelDe: "Modalverben", icon: "KeyRound" },
  passive: { labelDe: "Passiv", icon: "Boxes" },
};

// Ordered by B2-marker priority (categorization audit 2026-07-09): the
// structures that most distinguish B2 output come first, so the hub answers
// "which rule is throttling my German" before "where is topic X".
export const groupOrder: GrammarGroup[] = [
  "connectors",
  "konjunktiv2",
  "passive",
  "subordinate",
  "relativeClauses",
  "cases",
  "verbPosition",
  "prepositionalPronouns",
  "modals",
  "collocations",
];

/** The whole bank flattened into hub display order (B2-marker priority).
 *  Also the spine for the lesson's prev/next topic navigation. */
export const orderedGrammar: GrammarTopic[] = groupOrder.flatMap((g) =>
  grammar.filter((t) => t.group === g),
);

/** 1-based rank of a topic on the priority spine. Shown as the number chip on
 *  cards/rows and as "Thema n von N" in the lesson, so a time-poor learner
 *  never has to decide where to start: top of the list = biggest B2 lever. */
export const topicRank = new Map(orderedGrammar.map((t, i) => [t.id, i + 1]));
