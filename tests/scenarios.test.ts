import { describe, it, expect } from "vitest";
import { scenarios } from "@/data/dialogues";
import { examSets } from "@/data/examSets";
import { examBrief, speakingBrief } from "@/engine/speaking";

/**
 * The speaking scenarios, as briefs (rewritten s191).
 *
 * WHAT CHANGED AND WHY. The previous version of this file pinned an invariant
 * of the branching-script era: every scenario had to contain a free-speak node,
 * reached on every path, because "choosing between three written options is
 * recognition, and the free-speak node is the only part of the scenario that
 * trains production". That was true, and it was the right test for that design.
 *
 * It is obsolete now. Sprechen no longer walks the node graph at all: the
 * learner talks to an AI partner and EVERY turn is production, so "does this
 * scenario contain a production node" is no longer a meaningful question. The
 * meaningful question is whether each scenario still yields a brief an AI
 * partner can actually play and a debrief can actually grade, which is what
 * this file pins instead.
 */

describe("every practice scenario is servable as a spoken brief", () => {
  it.each(scenarios.map((s) => [s.id, s] as const))("%s builds a usable brief", (_id, scenario) => {
    const brief = speakingBrief(scenario);

    expect(brief.id).toBe(scenario.id);
    expect(brief.title.trim()).toBeTruthy();
    // The partner is what the AI plays; without a name and a role it has no
    // character to hold and drifts back into being a helpful assistant.
    expect(brief.partner.name.trim()).toBeTruthy();
    expect(brief.partner.role.trim()).toBeTruthy();
    expect(["du", "sie"]).toContain(brief.partner.register);
    // The situation is the AI's stage direction.
    expect(brief.situation.trim().length).toBeGreaterThan(20);
    // Goals are what the debrief grades as Aufgabenerfüllung. A scenario with
    // none could still hold a conversation but could never be told apart from
    // small talk, which is the whole distinction this feature rests on.
    expect(brief.goals.length).toBeGreaterThanOrEqual(1);
    expect(brief.goals.length).toBeLessThanOrEqual(5);
    for (const g of brief.goals) expect(g.trim()).toBeTruthy();

    expect(brief.minutes).toBeGreaterThan(0);
    // Practice is always the chat thread (founder s191).
    expect(brief.stage).toBe("gespraech");
    expect(brief.exam).toBe(false);
  });

  it("no scenario carries an em dash in the copy a learner reads", () => {
    for (const s of scenarios) {
      expect(`${s.title} ${s.task} ${s.context}`).not.toContain("—");
    }
  });
});

describe("every exam set is servable as a spoken brief", () => {
  it.each(examSets.map((e) => [e.id, e] as const))("%s builds a usable brief", (_id, set) => {
    const brief = examBrief(set);

    expect(brief.id).toBe(set.id);
    expect(brief.exam).toBe(true);
    // The aspects ARE the Leitpunkte the debrief grades, so an exam set with
    // none would be scored against nothing.
    expect(brief.goals.length).toBeGreaterThanOrEqual(1);
    expect(brief.goals.length).toBeLessThanOrEqual(5);
    expect(brief.situation.trim().length).toBeGreaterThan(20);
    // The exam never runs the transcript layout: that is a practice affordance.
    expect(brief.stage).not.toBe("gespraech");
  });

  it("drops the 'Prüfungssimulation:' prefix, which the run bar already says", () => {
    for (const set of examSets) {
      expect(examBrief(set).title).not.toMatch(/^Prüfungssimulation:/);
    }
  });
});
