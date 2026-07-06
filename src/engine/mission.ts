import type { Grade } from "@/types";
import type {
  BattleNode,
  BiText,
  DialogueBattleScene,
  Mission,
  MissionScene,
} from "@/types/game";
import { XP } from "@/engine/scoring";
import { clamp } from "@/lib/utils";

/**
 * The mission runner (game phase G1): a pure state machine that interprets a
 * `Mission` from the data bank, exactly like `engine/dialogue.ts` interprets
 * scenarios. No React, no stores, no side effects: every transition returns a
 * new `MissionRun` whose `effects` array holds ONLY that transition's
 * consequences (XP, FSRS grades, key items). The player component applies
 * them to the real stores (`addXp`, `reviewVocab`, `practiceRedemittel`) so
 * the game and the app share one progression state (plan decision 4).
 */

/* ---------------- effects ---------------- */

export type MissionEffect =
  | { type: "xp"; amount: number }
  | { type: "vocabGrade"; vocabId: string; grade: Grade }
  | { type: "redemittelPractice"; redemittelId: string }
  | { type: "keyItems"; itemIds: string[] }
  | { type: "missionComplete"; missionId: string };

/* ---------------- state ---------------- */

/** Outcome of a typed (cloze) battle move. */
export type TypedMoveVerdict = "correct" | "almost" | "wrong";

/** Presentation payload of the most recent battle move. */
export interface BattleLast {
  moveId: string;
  crit: boolean;
  /** Applied deltas (0 when the move misfired on a missing item). */
  geduld: number;
  mut: number;
  feedback?: BiText;
  /** Set when the move needed a key item the player does not hold. */
  missingItem?: string;
  /** Set when the move was a typed challenge. */
  typed?: TypedMoveVerdict;
}

export interface BattleRuntime {
  nodeId: string;
  geduld: number;
  geduldMax: number;
  mut: number;
  mutMax: number;
  turns: number;
  last?: BattleLast;
}

export interface MissionRun {
  mission: Mission;
  sceneId: string;
  /**
   * Replay of an already-completed mission: per-scene practice still grades
   * and earns, but the one-time completion reward (rewardXp, key items) is
   * not re-emitted, so a known win path cannot be farmed.
   */
  replay: boolean;
  /** Key items held during this run: globally owned + gained along the way. */
  bag: string[];
  /** Loadout slot ids already packed. */
  packed: Record<string, boolean>;
  /** Retrieval misses per loadout slot (drives the FSRS grade on pack). */
  slotMisses: Record<string, number>;
  /** Live battle bars; present only while the current scene is a battle. */
  battle?: BattleRuntime;
  /** XP accrued this run (always the sum of emitted xp effects). */
  xp: number;
  /** Effects emitted by the LAST transition. Apply them, then move on. */
  effects: MissionEffect[];
  done: boolean;
  outcome?: "win";
}

export function currentScene(run: MissionRun): MissionScene {
  return run.mission.scenes[run.sceneId];
}

/**
 * The single exit point of every transition: applies a patch, replaces the
 * effects, and folds the effects' XP into `run.xp` so the HUD counter can
 * never diverge from the XP actually granted to the store.
 */
function withEffects(
  run: MissionRun,
  patch: Partial<MissionRun>,
  effects: MissionEffect[],
): MissionRun {
  const gained = effects.reduce((n, e) => n + (e.type === "xp" ? e.amount : 0), 0);
  return { ...run, ...patch, xp: run.xp + gained, effects };
}

/* ---------------- scene entry / routing ---------------- */

function initBattle(scene: DialogueBattleScene): BattleRuntime {
  return {
    nodeId: scene.start,
    geduld: scene.geduld,
    geduldMax: scene.geduld,
    mut: scene.mutStart ?? scene.mut,
    mutMax: scene.mut,
    turns: 0,
  };
}

/** Enter a scene: (re)initialise battle bars, collect scene-entry grants. */
function enterScene(run: MissionRun, sceneId: string, effects: MissionEffect[]): MissionRun {
  const scene = run.mission.scenes[sceneId];
  const grants = (scene.grantsItems ?? []).filter((id) => !run.bag.includes(id));
  return withEffects(
    run,
    {
      sceneId,
      bag: grants.length ? [...run.bag, ...grants] : run.bag,
      battle: scene.kind === "dialogueBattle" ? initBattle(scene) : undefined,
    },
    effects,
  );
}

export function startMission(
  mission: Mission,
  ownedItems: string[],
  replay = false,
): MissionRun {
  const base: MissionRun = {
    mission,
    sceneId: mission.start,
    replay,
    bag: [...ownedItems],
    packed: {},
    slotMisses: {},
    xp: 0,
    effects: [],
    done: false,
  };
  return enterScene(base, mission.start, []);
}

/**
 * Finish the current scene and route onward: to `scene.next`, or, on a scene
 * marked `end: "win"`, complete the mission (reward XP + key items on the
 * first clear; replays only report completion). The linter guarantees every
 * scene has an exit, so the fallback never fires in shipped content.
 */
export function completeScene(run: MissionRun): MissionRun {
  const scene = currentScene(run);
  if (scene.end === "win") {
    const effects: MissionEffect[] = [];
    if (!run.replay) {
      effects.push({ type: "xp", amount: run.mission.rewardXp });
      if (run.mission.rewardItems?.length)
        effects.push({ type: "keyItems", itemIds: run.mission.rewardItems });
    }
    effects.push({ type: "missionComplete", missionId: run.mission.id });
    return withEffects(run, { battle: undefined, done: true, outcome: "win" }, effects);
  }
  if (scene.next) return enterScene(run, scene.next, []);
  return { ...run, effects: [] };
}

/** Follow a choice (website button, cutscene decision). */
export function chooseChoice(run: MissionRun, choiceId: string): MissionRun {
  const scene = currentScene(run);
  const choices = scene.kind === "cutscene" || scene.kind === "websiteParody" ? scene.choices : undefined;
  const choice = choices?.find((c) => c.id === choiceId);
  if (!choice) return { ...run, effects: [] };
  return enterScene(run, choice.next, []);
}

/* ---------------- loadout ---------------- */

/**
 * Record one retrieval attempt on a loadout slot. A correct pick packs the
 * slot (first try grades Good, a recovered miss grades Hard: the FSRS
 * evidence must reflect the fumble) and grants its key item into the bag.
 */
export function attemptSlot(run: MissionRun, slotId: string, correct: boolean): MissionRun {
  const scene = currentScene(run);
  if (scene.kind !== "loadout" || run.packed[slotId]) return { ...run, effects: [] };
  const slot = scene.slots.find((s) => s.id === slotId);
  if (!slot) return { ...run, effects: [] };

  if (!correct) {
    return withEffects(
      run,
      { slotMisses: { ...run.slotMisses, [slotId]: (run.slotMisses[slotId] ?? 0) + 1 } },
      [],
    );
  }
  const firstTry = (run.slotMisses[slotId] ?? 0) === 0;
  return withEffects(
    run,
    {
      packed: { ...run.packed, [slotId]: true },
      bag:
        slot.grantsItem && !run.bag.includes(slot.grantsItem)
          ? [...run.bag, slot.grantsItem]
          : run.bag,
    },
    [
      { type: "vocabGrade", vocabId: slot.vocabId, grade: firstTry ? 4 : 3 },
      { type: "xp", amount: firstTry ? XP.flashcard : XP.flashcardEasy },
    ],
  );
}

/**
 * Leave the loadout (packed or not: scarcity shapes style, not possibility).
 * Slots the learner attempted but never packed grade Again, so the FSRS
 * scheduler hears about the gap; untouched slots stay ungraded.
 */
export function finishLoadout(run: MissionRun): MissionRun {
  const scene = currentScene(run);
  if (scene.kind !== "loadout") return { ...run, effects: [] };
  const abandoned = scene.slots.filter(
    (s) => !run.packed[s.id] && (run.slotMisses[s.id] ?? 0) > 0,
  );
  const routed = completeScene(run);
  return {
    ...routed,
    effects: [
      ...abandoned.map(
        (s): MissionEffect => ({ type: "vocabGrade", vocabId: s.vocabId, grade: 0 }),
      ),
      ...routed.effects,
    ],
  };
}

/* ---------------- listening ---------------- */

/** Record one comprehension-check answer (XP only, never vocab FSRS). */
export function recordCheck(run: MissionRun, correct: boolean): MissionRun {
  if (!correct) return { ...run, effects: [] };
  return withEffects(run, {}, [{ type: "xp", amount: XP.readingCheck }]);
}

/* ---------------- battle ---------------- */

export function currentBattleNode(run: MissionRun): BattleNode | undefined {
  const scene = currentScene(run);
  if (scene.kind !== "dialogueBattle" || !run.battle) return undefined;
  return scene.nodes[run.battle.nodeId];
}

/** Map a move's quality (0..1) onto the SRS grade scale. */
function gradeForQuality(q: number): Grade {
  if (q >= 0.9) return 5;
  if (q >= 0.6) return 4;
  if (q >= 0.3) return 3;
  return 0;
}

/**
 * Play one battle move. Applies the move's bar deltas (or misfires when its
 * required key item is missing and routes to `nextIfMissing`), advances the
 * node graph, and forces the bust node when a bar empties. Terminal nodes are
 * NOT auto-resolved: the player component shows the closing line, then calls
 * `resolveBattle`.
 *
 * Typed (cloze) moves pass the grading verdict: "correct" lands the move at
 * full strength plus a typing bonus (the ladder rung pays), "almost" lands
 * it without the crit, "wrong" makes it misfire (weakened deltas).
 */
export function playMove(
  run: MissionRun,
  moveId: string,
  typed?: TypedMoveVerdict,
): MissionRun {
  const scene = currentScene(run);
  const node = currentBattleNode(run);
  if (scene.kind !== "dialogueBattle" || !run.battle || !node?.moves) return { ...run, effects: [] };
  const move = node.moves.find((m) => m.id === moveId);
  if (!move) return { ...run, effects: [] };

  const missing = move.requiresItem && !run.bag.includes(move.requiresItem);
  const effects: MissionEffect[] = [];
  let geduld = run.battle.geduld;
  let mut = run.battle.mut;
  let nextNodeId: string;
  let last: BattleLast;

  if (missing) {
    nextNodeId = move.nextIfMissing ?? move.next;
    last = { moveId, crit: false, geduld: 0, mut: 0, missingItem: move.requiresItem };
  } else {
    let crit = !!move.crit;
    let quality = move.quality;
    let dGeduld = move.geduld;
    let dMut = move.mut;
    const verdict = move.cloze ? (typed ?? "wrong") : undefined;
    if (verdict === "almost") {
      crit = false;
      quality = Math.max(quality - 0.2, 0.3);
    } else if (verdict === "wrong") {
      // The move misfires: the fumble costs patience and composure.
      crit = false;
      quality = Math.min(quality, 0.2);
      dGeduld = Math.min(dGeduld, 0) - 8;
      dMut = Math.min(dMut, 0) - 4;
    }
    geduld = clamp(geduld + dGeduld, 0, run.battle.geduldMax);
    mut = clamp(mut + dMut, 0, run.battle.mutMax);
    nextNodeId = move.next;
    last = {
      moveId,
      crit,
      geduld: dGeduld,
      mut: dMut,
      feedback: verdict === "wrong" ? undefined : move.feedback,
      typed: verdict,
    };
    if (move.redemittelId) effects.push({ type: "redemittelPractice", redemittelId: move.redemittelId });
    if (move.vocabId)
      effects.push({ type: "vocabGrade", vocabId: move.vocabId, grade: gradeForQuality(quality) });
    if (quality >= 0.6) effects.push({ type: "xp", amount: XP.simulationTurn });
    if (verdict === "correct") effects.push({ type: "xp", amount: XP.flashcardEasy });
  }

  // A drained bar ends the conversation regardless of the graph position.
  if (geduld <= 0 || mut <= 0) nextNodeId = scene.onBarEmpty;

  return withEffects(
    run,
    {
      battle: {
        ...run.battle,
        nodeId: nextNodeId,
        geduld,
        mut,
        turns: run.battle.turns + 1,
        last,
      },
    },
    effects,
  );
}

/**
 * Leave a terminal battle node: a win exits through the scene's `next`
 * routing, a loss routes to `onLose` (the scaffolded-retry hook: failure is
 * content, never lockout).
 */
/** Victory bonus ceiling: a flawless finish (both bars full) earns this. */
export const BATTLE_FINISH_BONUS = 30;

export function resolveBattle(run: MissionRun): MissionRun {
  const scene = currentScene(run);
  const node = currentBattleNode(run);
  if (scene.kind !== "dialogueBattle" || !node?.outcome) return { ...run, effects: [] };
  if (node.outcome === "win") {
    // Finish quality matters: the higher both bars ended, the bigger the
    // bonus (keeping Geduld AND Mut high is the whole game of the battle).
    const b = run.battle;
    const bonus = b
      ? Math.round((BATTLE_FINISH_BONUS * (b.geduld + b.mut)) / (b.geduldMax + b.mutMax))
      : 0;
    const routed = completeScene(run);
    if (bonus <= 0) return routed;
    return {
      ...routed,
      xp: routed.xp + bonus,
      effects: [{ type: "xp", amount: bonus }, ...routed.effects],
    };
  }
  return enterScene(run, scene.onLose, []);
}

/* ---------------- form cloze ---------------- */

/** Record one graded form field (typed verdict or select correctness). */
export function recordField(
  run: MissionRun,
  verdict: "correct" | "almost" | "wrong",
): MissionRun {
  const xp = verdict === "correct" ? XP.quizCorrect : verdict === "almost" ? XP.flashcardEasy : 0;
  if (xp === 0) return { ...run, effects: [] };
  return withEffects(run, {}, [{ type: "xp", amount: xp }]);
}

/* ---------------- helpers for the mission map ---------------- */

/** Is a mission playable given completed missions and owned key items? */
export function missionUnlocked(
  mission: Mission,
  missionsDone: string[],
  keyItems: string[],
): boolean {
  const missionsOk = (mission.requiresMissions ?? []).every((id) => missionsDone.includes(id));
  const itemsOk = (mission.requiresItems ?? []).every((id) => keyItems.includes(id));
  return missionsOk && itemsOk;
}
