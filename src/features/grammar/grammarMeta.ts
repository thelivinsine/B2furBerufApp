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
  // Also relabelled in s182: the da-/wo-forms only exist BECAUSE a verb has a
  // fixed preposition, and that topic now sits in the same group.
  prepositionalPronouns: { labelDe: "Verben mit Präpositionen", icon: "CornerDownRight" },
  collocations: { labelDe: "Nomen-Verb-Verbindungen", icon: "Combine" },
  verbPosition: { labelDe: "Verbstellung", icon: "MoveHorizontal" },
  subordinate: { labelDe: "Nebensätze", icon: "CornerDownRight" },
  cases: { labelDe: "Kasus", icon: "ArrowRightLeft" },
  konjunktiv2: { labelDe: "Konjunktiv II", icon: "Layers" },
  modals: { labelDe: "Modalverben", icon: "KeyRound" },
  passive: { labelDe: "Passiv", icon: "Boxes" },
  // Scale-up Wave 4 (2026-07-12): the missing B1-B2 canon groups.
  nouns: { labelDe: "Nomen & Deklination", icon: "Tag" },
  // Relabelled in s182 (audit P5): the group now holds Adjektivdeklination and
  // Komparativ/Superlativ next to the Partizipialattribute, so the old label
  // named one member instead of the group.
  attributes: { labelDe: "Adjektive & Attribute", icon: "AlignLeft" },
  reportedSpeech: { labelDe: "Indirekte Rede", icon: "Quote" },
  wordFormation: { labelDe: "Nominalstil", icon: "Shuffle" },
  infinitives: { labelDe: "Infinitivsätze", icon: "ArrowRight" },
  future: { labelDe: "Futur & Vermutung", icon: "Clock" },
  // C1 slice (s178 audit P1).
  particles: { labelDe: "Modalpartikeln", icon: "Sparkles" },
  // B1 accuracy canon (audit P5, s182).
  tenses: { labelDe: "Zeitformen", icon: "Clock" },
};

// Ordered by B2-marker priority (categorization audit 2026-07-09): the
// structures that most distinguish B2 output come first, so the hub answers
// "which rule is throttling my German" before "where is topic X".
export const groupOrder: GrammarGroup[] = [
  "connectors",
  "konjunktiv2",
  "passive",
  "reportedSpeech",
  "subordinate",
  "infinitives",
  "relativeClauses",
  "attributes",
  "cases",
  // B1 accuracy canon (audit P5, s182): the Perfekt/Präteritum choice sits with
  // the other accuracy levers, not at the polish end of the spine.
  "tenses",
  "nouns",
  "wordFormation",
  "verbPosition",
  "prepositionalPronouns",
  "modals",
  "future",
  "collocations",
  // Last on the priority spine on purpose: Modalpartikeln make German sound
  // native, but they fix no error, so they are the polish after the levers.
  "particles",
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
