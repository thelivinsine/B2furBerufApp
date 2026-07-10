import type { Grade } from "@/types";
import type {
  AutomatScene,
  AutomatStep,
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
  /** Set when a wrong bag item was offered on an `ask` node. */
  wrongItem?: string;
}

/** Presentation payload of the most recent machine key press. */
export interface AutomatLast {
  keyId: string;
  wrong: boolean;
  feedback?: BiText;
}

export interface AutomatRuntime {
  stepId: string;
  /** Wrong presses per step (drives the FSRS grade on the advancing key). */
  misses: Record<string, number>;
  last?: AutomatLast;
}

export interface BattleRuntime {
  nodeId: string;
  geduld: number;
  geduldMax: number;
  mut: number;
  mutMax: number;
  turns: number;
  /** Wrong bag items offered at the CURRENT ask node (drives the FSRS grade). */
  askMisses: number;
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
  /** Correct hotspot ids already found (a scene clears when all its are). */
  hotspotsFound: Record<string, boolean>;
  /** Wrong taps per hotspot id (summed per scene to grade the correct find). */
  hotspotMisses: Record<string, number>;
  /** Live battle bars; present only while the current scene is a battle. */
  battle?: BattleRuntime;
  /** Live machine state; present only while the current scene is an automat. */
  automat?: AutomatRuntime;
  /**
   * Wörterbuch charges left this run (founder direction s74: English help is
   * a limited bag resource, not an always-on button). Spending one reveals
   * the English layer for the current scene only.
   */
  dictUses: number;
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
    askMisses: 0,
  };
}

function initAutomat(scene: AutomatScene): AutomatRuntime {
  return { stepId: scene.start, misses: {} };
}

/** Enter a scene: (re)initialise battle/machine state, collect entry grants. */
function enterScene(run: MissionRun, sceneId: string, effects: MissionEffect[]): MissionRun {
  const scene = run.mission.scenes[sceneId];
  const grants = (scene.grantsItems ?? []).filter((id) => !run.bag.includes(id));
  return withEffects(
    run,
    {
      sceneId,
      bag: grants.length ? [...run.bag, ...grants] : run.bag,
      battle: scene.kind === "dialogueBattle" ? initBattle(scene) : undefined,
      automat: scene.kind === "automat" ? initAutomat(scene) : undefined,
    },
    effects,
  );
}

/** Wörterbuch charges a mission starts with (data can override per mission). */
export const DICT_USES_DEFAULT = 3;

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
    hotspotsFound: {},
    hotspotMisses: {},
    dictUses: mission.dictUses ?? DICT_USES_DEFAULT,
    xp: 0,
    effects: [],
    done: false,
  };
  return enterScene(base, mission.start, []);
}

/**
 * Spend one Wörterbuch charge (the player component keys the reveal to the
 * scene it was spent on). No XP, no grades: translation is a resource, not
 * an exercise.
 */
export function useDictionary(run: MissionRun): MissionRun {
  if (run.dictUses <= 0) return { ...run, effects: [] };
  return withEffects(run, { dictUses: run.dictUses - 1 }, []);
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
    return withEffects(run, { battle: undefined, automat: undefined, done: true, outcome: "win" }, effects);
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

/* ---------------- hotspot ---------------- */

/**
 * Tap a target on a hotspot stage. A wrong tap is recorded as a miss (no
 * effects; the player component shows the deadpan reaction). A correct,
 * not-yet-found spot is recorded and earns XP, grading its vocab into FSRS
 * (Good on a clean scene, Hard if the player fumbled a wrong tap first, so
 * the scheduler hears the gap). The scene advances when every correct spot is
 * found (the component calls `completeScene`).
 */
export function tapHotspot(run: MissionRun, spotId: string): MissionRun {
  const scene = currentScene(run);
  if (scene.kind !== "hotspot" || run.hotspotsFound[spotId]) return { ...run, effects: [] };
  const spot = scene.spots.find((s) => s.id === spotId);
  if (!spot) return { ...run, effects: [] };

  if (!spot.correct) {
    return withEffects(
      run,
      { hotspotMisses: { ...run.hotspotMisses, [spotId]: (run.hotspotMisses[spotId] ?? 0) + 1 } },
      [],
    );
  }
  // First try = no wrong tap anywhere on THIS scene's spots yet (scene-scoped
  // because spot ids are unique per mission, so the sum never leaks between
  // two hotspot scenes in one mission).
  const cleanSoFar = scene.spots.every((s) => (run.hotspotMisses[s.id] ?? 0) === 0);
  const effects: MissionEffect[] = [
    { type: "xp", amount: cleanSoFar ? XP.flashcard : XP.flashcardEasy },
  ];
  if (spot.vocabId)
    effects.push({ type: "vocabGrade", vocabId: spot.vocabId, grade: cleanSoFar ? 4 : 3 });
  return withEffects(run, { hotspotsFound: { ...run.hotspotsFound, [spotId]: true } }, effects);
}

/** Are all `correct` spots on the current hotspot scene found? */
export function hotspotSolved(run: MissionRun): boolean {
  const scene = currentScene(run);
  if (scene.kind !== "hotspot") return false;
  return scene.spots.filter((s) => s.correct).every((s) => run.hotspotsFound[s.id]);
}

/* ---------------- automat (keypad machine) ---------------- */

export function currentAutomatStep(run: MissionRun): AutomatStep | undefined {
  const scene = currentScene(run);
  if (scene.kind !== "automat" || !run.automat) return undefined;
  return scene.steps[run.automat.stepId];
}

/** Has the machine reached its terminal (`done`) step? */
export function automatDone(run: MissionRun): boolean {
  return currentAutomatStep(run)?.done === true;
}

/**
 * Press a key on the current machine step. A wrong key only buzzes (records a
 * miss, no effects, no advance: the machine has infinite patience, failure is
 * content). A correct key advances to `step.next`, earns XP and grades its
 * vocab into FSRS (Good if the step was pressed cleanly, Hard after a fumble).
 * The terminal step routes onward via `completeScene`.
 */
export function pressKey(run: MissionRun, keyId: string): MissionRun {
  const scene = currentScene(run);
  const step = currentAutomatStep(run);
  if (scene.kind !== "automat" || !run.automat || !step || step.done) return { ...run, effects: [] };
  const key = step.keys.find((k) => k.id === keyId);
  if (!key) return { ...run, effects: [] };
  const stepId = run.automat.stepId;

  if (!key.correct) {
    return withEffects(
      run,
      {
        automat: {
          ...run.automat,
          misses: { ...run.automat.misses, [stepId]: (run.automat.misses[stepId] ?? 0) + 1 },
          last: { keyId, wrong: true, feedback: key.feedback },
        },
      },
      [],
    );
  }

  const firstTry = (run.automat.misses[stepId] ?? 0) === 0;
  const effects: MissionEffect[] = [{ type: "xp", amount: firstTry ? XP.flashcard : XP.flashcardEasy }];
  if (key.vocabId)
    effects.push({ type: "vocabGrade", vocabId: key.vocabId, grade: firstTry ? 4 : 3 });
  return withEffects(
    run,
    {
      automat: {
        ...run.automat,
        stepId: step.next ?? stepId,
        last: { keyId, wrong: false, feedback: key.feedback },
      },
    },
    effects,
  );
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
        askMisses: nextNodeId === run.battle.nodeId ? run.battle.askMisses : 0,
        last,
      },
    },
    effects,
  );
}

/** Patience cost of offering the wrong bag item (data can override per ask). */
export const ASK_WRONG_GEDULD = 8;

/**
 * Answer an `ask` node from the bag: the player taps an item to hand it
 * over. The right item advances (grading the document's vocab into FSRS:
 * Good on the first offer, Hard after a fumble); a wrong item costs patience
 * and earns the NPC's deadpan reaction, staying on the node. Failure is
 * content: a drained bar still routes through `onBarEmpty`.
 */
export function handItem(run: MissionRun, itemId: string): MissionRun {
  const scene = currentScene(run);
  const node = currentBattleNode(run);
  const ask = node?.ask;
  if (scene.kind !== "dialogueBattle" || !run.battle || !ask || node.outcome) {
    return { ...run, effects: [] };
  }
  if (!run.bag.includes(itemId)) return { ...run, effects: [] };

  if (itemId !== ask.itemId) {
    const dGeduld = -(ask.wrongGeduld ?? ASK_WRONG_GEDULD);
    const geduld = clamp(run.battle.geduld + dGeduld, 0, run.battle.geduldMax);
    const nodeId = geduld <= 0 ? scene.onBarEmpty : run.battle.nodeId;
    return withEffects(
      run,
      {
        battle: {
          ...run.battle,
          nodeId,
          geduld,
          turns: run.battle.turns + 1,
          askMisses: run.battle.askMisses + 1,
          last: {
            moveId: itemId,
            crit: false,
            geduld: dGeduld,
            mut: 0,
            wrongItem: itemId,
            feedback: ask.wrongFeedback,
          },
        },
      },
      [],
    );
  }

  const firstTry = run.battle.askMisses === 0;
  const effects: MissionEffect[] = [{ type: "xp", amount: XP.simulationTurn }];
  if (ask.vocabId)
    effects.push({ type: "vocabGrade", vocabId: ask.vocabId, grade: firstTry ? 4 : 3 });
  const geduld = clamp(run.battle.geduld + ask.geduld, 0, run.battle.geduldMax);
  const mut = clamp(run.battle.mut + ask.mut, 0, run.battle.mutMax);
  const nodeId = geduld <= 0 || mut <= 0 ? scene.onBarEmpty : ask.next;
  return withEffects(
    run,
    {
      battle: {
        ...run.battle,
        nodeId,
        geduld,
        mut,
        turns: run.battle.turns + 1,
        askMisses: 0,
        last: {
          moveId: itemId,
          crit: false,
          geduld: ask.geduld,
          mut: ask.mut,
          feedback: ask.feedback,
        },
      },
    },
    effects,
  );
}

/**
 * Concede an `ask` node ("Das habe ich nicht dabei"): routes to the ask's
 * `nextIfMissing` branch, the fetch-quest/failure-as-content hook.
 */
export function admitMissing(run: MissionRun): MissionRun {
  const scene = currentScene(run);
  const node = currentBattleNode(run);
  const ask = node?.ask;
  if (scene.kind !== "dialogueBattle" || !run.battle || !ask || node.outcome) {
    return { ...run, effects: [] };
  }
  return withEffects(
    run,
    {
      battle: {
        ...run.battle,
        nodeId: ask.nextIfMissing,
        turns: run.battle.turns + 1,
        askMisses: 0,
        last: { moveId: "admit", crit: false, geduld: 0, mut: 0, missingItem: ask.itemId },
      },
    },
    [],
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

/**
 * The content-bank items a mission actually exercises in its scenes: the vocab
 * and Redemittel ids referenced by loadout slots, battle moves, item demands,
 * hotspots and machine keys. This is the "words used in the game" for a mission,
 * so the Heute → Üben session for mission N can practise exactly those items
 * (plus theme-related fill), keeping Üben and Spielen aligned. Order-preserving
 * and de-duplicated; distractors are deliberately excluded (they are not the
 * target items).
 */
export function missionContentIds(mission: Mission): {
  vocabIds: string[];
  redemittelIds: string[];
} {
  const vocab: string[] = [];
  const rede: string[] = [];
  const addV = (id?: string) => {
    if (id && !vocab.includes(id)) vocab.push(id);
  };
  const addR = (id?: string) => {
    if (id && !rede.includes(id)) rede.push(id);
  };
  for (const scene of Object.values(mission.scenes)) {
    switch (scene.kind) {
      case "loadout":
        for (const slot of scene.slots) addV(slot.vocabId);
        break;
      case "dialogueBattle":
        for (const node of Object.values(scene.nodes)) {
          for (const move of node.moves ?? []) {
            addV(move.vocabId);
            addR(move.redemittelId);
          }
          addV(node.ask?.vocabId);
        }
        break;
      case "hotspot":
        for (const spot of scene.spots) addV(spot.vocabId);
        break;
      case "automat":
        for (const step of Object.values(scene.steps))
          for (const key of step.keys) addV(key.vocabId);
        break;
    }
  }
  return { vocabIds: vocab, redemittelIds: rede };
}
