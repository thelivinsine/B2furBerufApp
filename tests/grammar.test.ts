import { describe, it, expect } from "vitest";
import { grammar } from "@/data/grammar";
import { groupMeta, groupOrder, orderedGrammar } from "@/features/grammar/grammarMeta";

/**
 * The grammar bank after the audit-P5 pass (s182).
 *
 * Two faults it fixes:
 * 1. **Canon holes.** Adjektivdeklination, Perfekt vs. Präteritum, Verben mit
 *    Präpositionen and Komparativ/Superlativ were missing entirely, and those
 *    are exactly where B1 accuracy is won. A learner could work through the
 *    whole bank without ever meeting an adjective ending.
 * 2. **A multiple-choice monoculture.** 131 of 137 drills were MCQ, so the bank
 *    tested recognition and called it practice. Every B1 topic now carries at
 *    least three productive (typed-answer) drills.
 */
const CANON = [
  "g_adjektivdeklination",
  "g_perfekt_praeteritum",
  "g_verben_praepositionen",
  "g_komparativ",
] as const;

const productive = (topicId: string) =>
  grammar.find((t) => t.id === topicId)!.drills.filter((d) => !d.options?.length);

describe("grammar: the B1 accuracy canon exists", () => {
  it.each(CANON)("%s is in the bank with 10 drills", (id) => {
    const topic = grammar.find((t) => t.id === id);
    expect(topic, `${id} missing`).toBeDefined();
    expect(topic!.drills.length).toBeGreaterThanOrEqual(10);
  });

  it.each(CANON)("%s carries the full lesson, German first", (id) => {
    const topic = grammar.find((t) => t.id === id)!;
    expect(topic.explanationDe!.length).toBeGreaterThan(200);
    expect(topic.purposeDe).toBeTruthy();
    expect(topic.pattern).toBeTruthy();
    expect(topic.examples.length).toBeGreaterThanOrEqual(3);
    // pitfalls and pitfallsDe are parallel arrays: same order, same length.
    expect(topic.pitfallsDe!.length).toBe(topic.pitfalls!.length);
  });
});

describe("grammar: practice means producing, not recognising", () => {
  it("there are topics to check", () => {
    expect(grammar.length).toBeGreaterThanOrEqual(30);
  });

  /**
   * The rule reached the B2/C1 half in s185. Before that pass the 21 B2/C1
   * topics sat at 4-5 drills with ZERO productive between them, so the hardest
   * grammar in the app was also the only grammar a learner could never be asked
   * to produce, and a topic was exhausted in one sitting. Every topic, every
   * band: 10 drills, at least 3 of them typed.
   */
  it.each(grammar.map((t) => [t.id] as const))("%s has 10 drills, at least 3 productive", (id) => {
    const topic = grammar.find((t) => t.id === id)!;
    expect(topic.drills.length, `${id} drill count`).toBeGreaterThanOrEqual(10);
    expect(productive(id).length, `${id} productive count`).toBeGreaterThanOrEqual(3);
  });

  it("a productive drill has no options and a single unambiguous answer", () => {
    for (const topic of grammar) {
      for (const drill of topic.drills) {
        if (drill.options?.length) continue;
        expect(drill.answer.trim().length, `${drill.id}`).toBeGreaterThan(0);
        expect(drill.answer, `${drill.id} offers a choice inside the answer`).not.toMatch(/ \/ /);
        expect(drill.explain, `${drill.id} has no explanation`).toBeTruthy();
      }
    }
  });
});

describe("grammar: the group registry stays complete", () => {
  it("every group used by a topic has display metadata and a place on the spine", () => {
    for (const topic of grammar) {
      expect(groupMeta[topic.group], `${topic.group} has no label`).toBeDefined();
      expect(groupOrder, `${topic.group} is not on the priority spine`).toContain(topic.group);
    }
  });

  it("the ordered spine holds every topic exactly once", () => {
    expect(orderedGrammar.length).toBe(grammar.length);
    expect(new Set(orderedGrammar.map((t) => t.id)).size).toBe(grammar.length);
  });

  it("drill ids are unique across the whole bank", () => {
    const ids = grammar.flatMap((t) => t.drills.map((d) => d.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
