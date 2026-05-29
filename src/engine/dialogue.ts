import type { DialogueNode, DialogueOption, Scenario } from "@/types";

/** A single recorded step of a play-through, used for the transcript & scoring. */
export interface TranscriptEntry {
  nodeId: string;
  speaker: DialogueNode["speaker"] | "candidate";
  text: string;
  /** For candidate steps: the option quality, if any. */
  quality?: number;
}

export interface DialogueState {
  scenario: Scenario;
  currentId: string;
  transcript: TranscriptEntry[];
  hintsUsed: number;
  turns: number;
  done: boolean;
}

export function startDialogue(scenario: Scenario): DialogueState {
  return {
    scenario,
    currentId: scenario.start,
    transcript: [],
    hintsUsed: 0,
    turns: 0,
    done: false,
  };
}

export function currentNode(state: DialogueState): DialogueNode {
  return state.scenario.nodes[state.currentId];
}

/** Advance through narration/partner lines that auto-continue. */
export function recordPartnerLine(state: DialogueState): DialogueState {
  const node = currentNode(state);
  return {
    ...state,
    transcript: [
      ...state.transcript,
      { nodeId: node.id, speaker: node.speaker, text: node.line },
    ],
  };
}

export function chooseOption(
  state: DialogueState,
  option: DialogueOption,
): DialogueState {
  const node = currentNode(state);
  const transcript: TranscriptEntry[] = [
    ...state.transcript,
    {
      nodeId: node.id,
      speaker: "candidate",
      text: option.text,
      quality: option.quality,
    },
  ];
  const nextNode = state.scenario.nodes[option.next];
  return {
    ...state,
    currentId: option.next,
    transcript,
    turns: state.turns + 1,
    done: !!nextNode?.end,
  };
}

/** Used for free-speak nodes: log the candidate's (optional) utterance and move on. */
export function advanceFree(state: DialogueState, spoken?: string): DialogueState {
  const node = currentNode(state);
  const transcript: TranscriptEntry[] = spoken
    ? [...state.transcript, { nodeId: node.id, speaker: "candidate", text: spoken }]
    : state.transcript;
  const nextId = node.next;
  const nextNode = nextId ? state.scenario.nodes[nextId] : undefined;
  return {
    ...state,
    currentId: nextId ?? state.currentId,
    transcript,
    turns: state.turns + 1,
    done: !nextId || !!nextNode?.end,
  };
}

export function useHint(state: DialogueState): DialogueState {
  return { ...state, hintsUsed: state.hintsUsed + 1 };
}

export interface DialogueScore {
  turns: number;
  hintsUsed: number;
  /** Average option quality 0–100 (only counts decision nodes). */
  quality: number;
}

export function scoreDialogue(state: DialogueState): DialogueScore {
  const qualities = state.transcript
    .filter((t) => t.speaker === "candidate" && typeof t.quality === "number")
    .map((t) => t.quality as number);
  const avg =
    qualities.length > 0
      ? qualities.reduce((a, b) => a + b, 0) / qualities.length
      : 0.7;
  const hintPenalty = Math.min(state.hintsUsed * 0.04, 0.2);
  return {
    turns: state.turns,
    hintsUsed: state.hintsUsed,
    quality: Math.round(Math.max(0, avg - hintPenalty) * 100),
  };
}
