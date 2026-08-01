import { describe, it, expect } from "vitest";
import { scenarios } from "@/data/dialogues";

/**
 * The speaking scenarios after the audit-P4 pass (s182).
 *
 * The fault this pins: 20 of the 30 scenarios (every Alltag one) ended on a
 * multiple-choice turn, so the "speaking" trainer never once asked the learner
 * to PRODUCE connected speech. Choosing between three written options is
 * recognition; the free-speak node with a model answer is the only part of the
 * scenario that trains production, which is the skill the product exists for.
 */
describe("speaking scenarios: every one asks for real speech", () => {
  it.each(scenarios.map((s) => [s.id, s] as const))(
    "%s has a free-speak node with a model answer",
    (_id, scenario) => {
      const free = Object.values(scenario.nodes).filter((n) => n.prompt);
      expect(free.length).toBeGreaterThanOrEqual(1);
      for (const node of free) {
        expect(node.model, "a free-speak node without a model answer gives no feedback").toBeTruthy();
        // A model answer is the target output, so it has to be worth imitating:
        // several connected sentences, not a phrase.
        expect(node.model!.split(/[.!?]/).filter((s) => s.trim().length > 8).length).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it("the free-speak node is reached on every path, not hidden on one branch", () => {
    for (const scenario of scenarios) {
      const freeIds = new Set(
        Object.values(scenario.nodes)
          .filter((n) => n.prompt)
          .map((n) => n.id),
      );
      // Walk every branch from the start; each terminal path must pass a
      // free-speak node.
      const paths: string[][] = [[scenario.start]];
      const seen = new Set<string>();
      let guard = 0;
      while (paths.length && guard++ < 5000) {
        const path = paths.pop()!;
        const id = path[path.length - 1];
        const node = scenario.nodes[id];
        if (!node) continue;
        const nexts = [
          ...(node.options ?? []).map((o) => o.next),
          ...(node.next ? [node.next] : []),
        ];
        if (!nexts.length) {
          // Terminal path: it must have crossed a free-speak node.
          expect(
            path.some((step) => freeIds.has(step)),
            `${scenario.id}: path ${path.join("→")} never asks the learner to speak`,
          ).toBe(true);
          continue;
        }
        for (const next of nexts) {
          const key = `${id}>${next}`;
          if (seen.has(key)) continue;
          seen.add(key);
          paths.push([...path, next]);
        }
      }
    }
  });

  it("every node reference resolves, and every node is reachable", () => {
    for (const scenario of scenarios) {
      const ids = new Set(Object.keys(scenario.nodes));
      for (const node of Object.values(scenario.nodes)) {
        if (node.next) expect(ids.has(node.next), `${scenario.id}:${node.id}`).toBe(true);
        for (const option of node.options ?? [])
          expect(ids.has(option.next), `${scenario.id}:${option.id}`).toBe(true);
      }
      const reached = new Set<string>();
      const stack = [scenario.start];
      while (stack.length) {
        const id = stack.pop()!;
        if (reached.has(id)) continue;
        reached.add(id);
        const node = scenario.nodes[id];
        if (!node) continue;
        if (node.next) stack.push(node.next);
        for (const option of node.options ?? []) stack.push(option.next);
      }
      expect([...ids].filter((id) => !reached.has(id)), `${scenario.id} unreachable`).toEqual([]);
    }
  });
});
