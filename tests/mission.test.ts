import { describe, it, expect } from "vitest";
import {
  startMission,
  currentScene,
  currentBattleNode,
  completeScene,
  chooseChoice,
  attemptSlot,
  finishLoadout,
  recordCheck,
  playMove,
  handItem,
  admitMissing,
  useDictionary,
  resolveBattle,
  recordField,
  missionUnlocked,
  ASK_WRONG_GEDULD,
  DICT_USES_DEFAULT,
  type MissionRun,
} from "@/engine/mission";
import { missions } from "@/data/missions";
import { XP } from "@/engine/scoring";

/** The Anmeldung boss mission: the G1 vertical slice, also the test vehicle. */
const anmeldung = missions.find((m) => m.id === "m_kap1_anmeldung")!;

/** Walk the loadout packing every slot first try. */
function packEverything(run: MissionRun): MissionRun {
  const scene = currentScene(run);
  if (scene.kind !== "loadout") throw new Error("not on the loadout scene");
  for (const slot of scene.slots) run = attemptSlot(run, slot.id, true);
  return finishLoadout(run);
}

/** Play through to the battle scene with a full bag. */
function reachBattle(): MissionRun {
  let run = startMission(anmeldung, []);
  run = chooseChoice(run, "c_warten"); // booking parody -> wait 8 weeks
  run = completeScene(run); // cutscene -> loadout
  run = packEverything(run); // loadout -> waiting room
  run = completeScene(run); // waiting room -> battle
  return run;
}

describe("mission runner: routing", () => {
  it("starts on the mission's start scene with the owned items in the bag", () => {
    const run = startMission(anmeldung, ["ki_personalausweis"]);
    expect(run.sceneId).toBe(anmeldung.start);
    expect(run.bag).toContain("ki_personalausweis");
    expect(run.done).toBe(false);
  });

  it("routes through website choices and cutscenes", () => {
    let run = startMission(anmeldung, []);
    expect(currentScene(run).kind).toBe("websiteParody");
    run = chooseChoice(run, "c_spontan");
    expect(run.sceneId).toBe("sechs_uhr");
    run = completeScene(run);
    expect(run.sceneId).toBe("packen");
  });

  it("ignores an unknown choice id instead of corrupting state", () => {
    const run = startMission(anmeldung, []);
    const after = chooseChoice(run, "does_not_exist");
    expect(after.sceneId).toBe(run.sceneId);
  });
});

describe("mission runner: loadout", () => {
  function reachLoadout(): MissionRun {
    let run = startMission(anmeldung, []);
    run = chooseChoice(run, "c_warten");
    return completeScene(run);
  }

  it("packs a slot on a first-try correct pick: grade Good, XP, key item granted", () => {
    let run = reachLoadout();
    run = attemptSlot(run, "s_wgb", true);
    expect(run.packed.s_wgb).toBe(true);
    expect(run.bag).toContain("ki_wohnungsgeberbestaetigung");
    expect(run.effects).toContainEqual({
      type: "vocabGrade",
      vocabId: "v_wohnungsgeberbestaetigung",
      grade: 4,
    });
    expect(run.effects).toContainEqual({ type: "xp", amount: XP.flashcard });
  });

  it("grades a recovered miss Hard, and an abandoned slot Again on exit", () => {
    let run = reachLoadout();
    run = attemptSlot(run, "s_ausweis", false);
    run = attemptSlot(run, "s_ausweis", true);
    expect(run.effects).toContainEqual({
      type: "vocabGrade",
      vocabId: "v_personalausweis",
      grade: 3,
    });
    // miss the Mietvertrag slot once, never recover, then leave thin
    run = attemptSlot(run, "s_mietvertrag", false);
    run = finishLoadout(run);
    expect(run.effects).toContainEqual({
      type: "vocabGrade",
      vocabId: "v_mietvertrag",
      grade: 0,
    });
    expect(run.sceneId).toBe("wartezimmer");
    // untouched slot got no grade at all
    expect(
      run.effects.filter((e) => e.type === "vocabGrade" && e.vocabId === "v_wohnungsgeberbestaetigung"),
    ).toHaveLength(0);
  });
});

describe("mission runner: listening", () => {
  it("awards XP only for correct checks", () => {
    let run = startMission(anmeldung, []);
    run = chooseChoice(run, "c_warten");
    run = completeScene(run);
    run = packEverything(run);
    const before = run.xp;
    run = recordCheck(run, true);
    expect(run.xp).toBe(before + XP.readingCheck);
    run = recordCheck(run, false);
    expect(run.xp).toBe(before + XP.readingCheck);
  });
});

describe("mission runner: dialogue battle", () => {
  it("initialises fresh bars on scene entry (Mut starts below its max)", () => {
    const run = reachBattle();
    expect(currentScene(run).kind).toBe("dialogueBattle");
    expect(run.battle).toMatchObject({ nodeId: "b1", geduld: 100, mut: 60, mutMax: 100 });
  });

  it("clamps Geduld gains at the maximum and lands a typed crit", () => {
    let run = reachBattle();
    run = playMove(run, "b1_krit", "correct");
    expect(run.battle!.geduld).toBe(100); // +6 clamped at the max
    expect(run.battle!.mut).toBe(74); // 60 + 14, visible headroom
    expect(run.battle!.last).toMatchObject({ crit: true, typed: "correct" });
  });

  it("misfires a typed move on a wrong answer (weakened, no crit)", () => {
    let run = reachBattle();
    run = playMove(run, "b1_krit", "wrong");
    expect(run.battle!.last).toMatchObject({ crit: false, typed: "wrong" });
    expect(run.battle!.geduld).toBe(92); // min(+6, 0) - 8
    expect(run.battle!.mut).toBe(56); // min(+14, 0) - 4
  });

  it("treats a cloze move without a verdict as wrong (no free crits)", () => {
    let run = reachBattle();
    run = playMove(run, "b1_krit");
    expect(run.battle!.last).toMatchObject({ crit: false, typed: "wrong" });
  });

  it("pays a victory bonus scaled by the remaining bars", () => {
    let run = reachBattle();
    run = playMove(run, "b1_ok");
    run = handItem(run, "ki_personalausweis");
    run = playMove(run, "b3_nachhaken");
    run = handItem(run, "ki_wohnungsgeberbestaetigung");
    run = playMove(run, "b4_ok");
    const before = run.xp;
    const b = run.battle!;
    const expected = Math.round((30 * (b.geduld + b.mut)) / (b.geduldMax + b.mutMax));
    run = resolveBattle(run);
    expect(expected).toBeGreaterThan(0);
    expect(run.effects).toContainEqual({ type: "xp", amount: expected });
    expect(run.xp).toBe(before + expected);
  });

  it("wins through the graph and routes to the form scene", () => {
    let run = reachBattle();
    run = playMove(run, "b1_ok");
    run = handItem(run, "ki_personalausweis");
    run = playMove(run, "b3_nachhaken");
    run = handItem(run, "ki_wohnungsgeberbestaetigung");
    run = playMove(run, "b4_ok");
    expect(currentBattleNode(run)!.outcome).toBe("win");
    run = resolveBattle(run);
    expect(run.sceneId).toBe("formular");
    expect(run.battle).toBeUndefined();
  });

  it("records Redemittel practice on moves", () => {
    let run = reachBattle();
    run = playMove(run, "b1_ok");
    run = handItem(run, "ki_personalausweis");
    run = playMove(run, "b3_nachhaken");
    expect(run.effects).toContainEqual({ type: "redemittelPractice", redemittelId: "r_cla2" });
  });

  it("forces the bust node when Geduld drains to zero", () => {
    let run = reachBattle();
    run = playMove(run, "b1_du"); // -16
    for (let i = 0; i < 12 && !currentBattleNode(run)!.outcome; i++) {
      run = handItem(run, "ki_mietvertrag"); // wrong document, -8 each, stays on b2
    }
    const node = currentBattleNode(run)!;
    expect(node.id).toBe("b_geduld_aus");
    expect(node.outcome).toBe("lose");
    expect(run.battle!.geduld).toBe(0);
  });
});

describe("mission runner: ask nodes (hand over from the bag)", () => {
  /** Sit at node b2 (Frau Schmidt demands the Personalausweis). */
  function reachAsk(): MissionRun {
    const run = reachBattle();
    return playMove(run, "b1_ok");
  }

  it("advances on the right item, grading its vocab Good on the first offer", () => {
    let run = reachAsk();
    expect(currentBattleNode(run)!.ask?.itemId).toBe("ki_personalausweis");
    run = handItem(run, "ki_personalausweis");
    expect(run.battle!.nodeId).toBe("b3");
    expect(run.effects).toContainEqual({ type: "vocabGrade", vocabId: "v_personalausweis", grade: 4 });
    expect(run.battle!.last).toMatchObject({ geduld: -2, mut: 8 });
  });

  it("costs patience on a wrong item, stays on the node, then grades Hard", () => {
    let run = reachAsk();
    const before = run.battle!.geduld;
    run = handItem(run, "ki_mietvertrag");
    expect(run.battle!.nodeId).toBe("b2");
    expect(run.battle!.geduld).toBe(before - ASK_WRONG_GEDULD);
    expect(run.battle!.last).toMatchObject({ wrongItem: "ki_mietvertrag" });
    run = handItem(run, "ki_personalausweis");
    expect(run.battle!.nodeId).toBe("b3");
    expect(run.effects).toContainEqual({ type: "vocabGrade", vocabId: "v_personalausweis", grade: 3 });
  });

  it("ignores an item the player does not hold", () => {
    // Empty bag: skip the loadout entirely.
    let run = startMission(anmeldung, []);
    run = chooseChoice(run, "c_warten");
    run = completeScene(run);
    run = finishLoadout(run);
    run = completeScene(run);
    run = playMove(run, "b1_ok");
    const after = handItem(run, "ki_personalausweis");
    expect(after.battle!.nodeId).toBe("b2");
    expect(after.effects).toHaveLength(0);
  });

  it("concedes a missing document into the fetch-quest branch, then retries scaffolded", () => {
    let run = startMission(anmeldung, []);
    run = chooseChoice(run, "c_warten");
    run = completeScene(run);
    run = finishLoadout(run); // walk in with an empty bag
    run = completeScene(run);
    run = playMove(run, "b1_ok");
    run = admitMissing(run);
    const node = currentBattleNode(run)!;
    expect(node.id).toBe("b_ohne_ausweis");
    expect(node.outcome).toBe("lose");
    expect(run.battle!.last).toMatchObject({ missingItem: "ki_personalausweis" });
    // Losing routes to the scaffolded-retry scene, which grants the papers.
    run = resolveBattle(run);
    expect(run.sceneId).toBe("rueckschlag");
    expect(run.bag).toContain("ki_wohnungsgeberbestaetigung");
    // Re-entering the battle resets the bars (walk back in stronger).
    run = completeScene(run);
    expect(run.sceneId).toBe("schmidt");
    expect(run.battle).toMatchObject({ nodeId: "b1", geduld: 100, mut: 60 });
  });
});

describe("mission runner: Wörterbuch charges", () => {
  it("starts with the default charges and spends them down to zero", () => {
    let run = startMission(anmeldung, []);
    expect(run.dictUses).toBe(DICT_USES_DEFAULT);
    run = useDictionary(run);
    expect(run.dictUses).toBe(DICT_USES_DEFAULT - 1);
    expect(run.effects).toHaveLength(0);
    run = useDictionary(run);
    run = useDictionary(run);
    expect(run.dictUses).toBe(0);
    const after = useDictionary(run);
    expect(after.dictUses).toBe(0);
  });
});

describe("mission runner: form + completion", () => {
  it("completes the mission with reward XP, key item and completion effect", () => {
    let run = reachBattle();
    run = playMove(run, "b1_krit", "correct");
    run = handItem(run, "ki_personalausweis");
    run = playMove(run, "b3_nachhaken");
    run = handItem(run, "ki_wohnungsgeberbestaetigung");
    run = playMove(run, "b4_krit", "correct");
    run = resolveBattle(run);
    expect(run.sceneId).toBe("formular");
    run = recordField(run, "correct");
    run = recordField(run, "almost");
    run = recordField(run, "wrong");
    const beforeWin = run.xp;
    run = completeScene(run); // form -> victory cutscene
    expect(run.sceneId).toBe("sieg");
    run = completeScene(run); // victory cutscene ends the mission
    expect(run.done).toBe(true);
    expect(run.outcome).toBe("win");
    expect(run.xp).toBe(beforeWin + anmeldung.rewardXp);
    expect(run.effects).toContainEqual({ type: "missionComplete", missionId: anmeldung.id });
    expect(run.effects).toContainEqual({ type: "keyItems", itemIds: ["ki_meldebestaetigung"] });
  });
});

describe("mission runner: replay", () => {
  it("does not re-emit the completion reward on a replay (no XP farming)", () => {
    let run = startMission(anmeldung, ["ki_meldebestaetigung"], true);
    run = chooseChoice(run, "c_warten");
    run = completeScene(run);
    run = packEverything(run);
    run = completeScene(run);
    run = playMove(run, "b1_ok");
    run = handItem(run, "ki_personalausweis");
    run = playMove(run, "b3_nachhaken");
    run = handItem(run, "ki_wohnungsgeberbestaetigung");
    run = playMove(run, "b4_ok");
    run = resolveBattle(run);
    const beforeWin = run.xp;
    run = completeScene(run); // form -> victory
    run = completeScene(run); // victory ends the mission
    expect(run.done).toBe(true);
    // per-scene practice XP still counted, but no rewardXp and no key items
    expect(run.xp).toBe(beforeWin);
    expect(run.effects).toContainEqual({ type: "missionComplete", missionId: anmeldung.id });
    expect(run.effects.filter((e) => e.type === "keyItems")).toHaveLength(0);
    expect(run.effects.filter((e) => e.type === "xp")).toHaveLength(0);
  });
});

describe("mission unlock gating", () => {
  it("gates on required missions and key items", () => {
    const gated = {
      ...anmeldung,
      requiresMissions: ["m_other"],
      requiresItems: ["ki_mietvertrag"],
    };
    expect(missionUnlocked(gated, [], [])).toBe(false);
    expect(missionUnlocked(gated, ["m_other"], [])).toBe(false);
    expect(missionUnlocked(gated, ["m_other"], ["ki_mietvertrag"])).toBe(true);
    expect(missionUnlocked(anmeldung, [], [])).toBe(true);
  });
});
