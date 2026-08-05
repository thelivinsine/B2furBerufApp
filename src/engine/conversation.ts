import type { ConversationBrief } from "@/types";

/**
 * The spoken-conversation state machine (s193).
 *
 * Pure and side-effect free, like `engine/srs.ts` and `engine/pronounce.ts`, so
 * the turn-taking rules and the cost ceiling are unit-checkable without a
 * browser, a microphone or a network. Everything that talks to a device or a
 * server lives in `features/sprechen/useSpeechInput.ts` and `lib/speaking.ts`.
 *
 * What this replaces: `engine/dialogue.ts` walked a hand-authored node graph and
 * `scoreDialogue` averaged an author-assigned `quality` number per chosen
 * option, which measured which button the learner pressed and never their
 * German. There is no scoring here at all: the grade comes from the debrief,
 * which is the one place that has seen what the learner actually said.
 */

export type TurnRole = "partner" | "learner";

export interface ConversationTurn {
  role: TurnRole;
  /** What was said. For a learner turn this is the transcript, so it can be wrong. */
  text: string;
  /**
   * True when the learner corrected a mis-heard transcript by hand. Kept so the
   * debrief can be honest: a hand-typed turn says nothing about pronunciation.
   */
  edited?: boolean;
}

export type ConversationStatus =
  /** Waiting for the learner to start speaking. */
  | "ready"
  /** The microphone is open. */
  | "listening"
  /** Waiting for the partner's reply. */
  | "thinking"
  /** The conversation is over; the debrief is next. */
  | "closed";

export interface ConversationState {
  brief: ConversationBrief;
  turns: ConversationTurn[];
  status: ConversationStatus;
  /** Redemittel hints the learner asked for. Never available in exam mode. */
  hintsUsed: number;
  /** Set when the partner could not be reached, so the UI can say so. */
  error: string | null;
}

/**
 * Hard ceiling on learner turns. This is a COST control, not a pedagogical one:
 * every turn resends the conversation so far, so an unbounded chat grows
 * quadratically in tokens. Fourteen turns is a ~6 minute conversation, which is
 * longer than any authored scenario asks for.
 */
export const MAX_LEARNER_TURNS = 14;

/** Below this, there is nothing worth grading and the debrief is skipped. */
export const MIN_LEARNER_TURNS = 2;

export function startConversation(brief: ConversationBrief): ConversationState {
  return { brief, turns: [], status: "ready", hintsUsed: 0, error: null };
}

export function learnerTurnCount(state: ConversationState): number {
  return state.turns.filter((t) => t.role === "learner").length;
}

/** Whether the learner may still speak. */
export function canSpeak(state: ConversationState): boolean {
  return (
    state.status === "ready" &&
    learnerTurnCount(state) < MAX_LEARNER_TURNS
  );
}

/** Learner turns still available. Shown once it gets low. */
export function turnsLeft(state: ConversationState): number {
  return Math.max(0, MAX_LEARNER_TURNS - learnerTurnCount(state));
}

/**
 * Undo the most recent learner turn. Used when the round trip that turn was
 * sent in FAILED: the turn is on screen but was never written to the stored
 * transcript, and the debrief grades the stored one, so leaving it would show
 * the learner words nobody will read (s194 audit P4).
 */
export function dropLastLearnerTurn(state: ConversationState): ConversationState {
  const idx = state.turns.map((t) => t.role).lastIndexOf("learner");
  if (idx === -1) return state;
  return { ...state, turns: state.turns.filter((_, i) => i !== idx) };
}

/** Whether there is enough material for a debrief to say anything true. */
export function canDebrief(state: ConversationState): boolean {
  return learnerTurnCount(state) >= MIN_LEARNER_TURNS;
}

export function setStatus(
  state: ConversationState,
  status: ConversationStatus,
): ConversationState {
  return { ...state, status, error: status === "thinking" ? null : state.error };
}

/**
 * Record what the learner said. An empty or whitespace-only transcript is
 * dropped rather than sent: speech recognition returns those routinely when the
 * learner taps the microphone and says nothing, and an empty turn would spend a
 * model call to have the partner answer silence.
 */
export function addLearnerTurn(
  state: ConversationState,
  text: string,
  opts: { edited?: boolean } = {},
): ConversationState {
  const clean = text.trim();
  if (!clean) return state;
  return {
    ...state,
    turns: [...state.turns, { role: "learner", text: clean, edited: opts.edited }],
    status: "thinking",
    error: null,
  };
}

/** Replace the most recent learner turn, for "Falsch gehört?". */
export function editLastLearnerTurn(
  state: ConversationState,
  text: string,
): ConversationState {
  const clean = text.trim();
  if (!clean) return state;
  const idx = state.turns.map((t) => t.role).lastIndexOf("learner");
  if (idx === -1) return state;
  const turns = state.turns.slice();
  turns[idx] = { ...turns[idx], text: clean, edited: true };
  return { ...state, turns };
}

export function addPartnerTurn(
  state: ConversationState,
  text: string,
): ConversationState {
  const clean = text.trim();
  if (!clean) return state;
  const turns = [...state.turns, { role: "partner" as const, text: clean }];
  return {
    ...state,
    turns,
    // Running out of turns ends the conversation ON the partner's line, so the
    // learner is never left holding an open question they cannot answer.
    status:
      turns.filter((t) => t.role === "learner").length >= MAX_LEARNER_TURNS
        ? "closed"
        : "ready",
    error: null,
  };
}

export function failTurn(state: ConversationState, message: string): ConversationState {
  return { ...state, status: "ready", error: message };
}

export function applyHint(state: ConversationState): ConversationState {
  if (state.brief.exam) return state; // no hints in the Modelltest
  return { ...state, hintsUsed: state.hintsUsed + 1 };
}

export function closeConversation(state: ConversationState): ConversationState {
  return { ...state, status: "closed" };
}

/** Everything the learner said, joined, for the debrief's correction card. */
export function learnerText(state: ConversationState): string {
  return state.turns
    .filter((t) => t.role === "learner")
    .map((t) => t.text)
    .join("\n\n");
}

/** Word count of the learner's own production, for the debrief header. */
export function learnerWordCount(state: ConversationState): number {
  return learnerText(state).split(/\s+/).filter(Boolean).length;
}

/**
 * The wire form of the conversation so far. The partner is the ASSISTANT and
 * the learner is the USER, which is the mapping the Edge Function's system
 * prompt is written against.
 */
export interface WireTurn {
  role: "assistant" | "user";
  text: string;
}

export function toWire(state: ConversationState): WireTurn[] {
  return state.turns.map((t) => ({
    role: t.role === "partner" ? ("assistant" as const) : ("user" as const),
    text: t.text,
  }));
}
