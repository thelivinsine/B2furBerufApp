import { describe, it, expect } from "vitest";
import { countTasks, eligibleTasks, randomTask, sameTask, taskText } from "@/lib/writingScope";
import { writingPrompts } from "@/data/writingPrompts";
import { themes } from "@/data/themes";
import { SECTOR_OPTIONS } from "@/lib/facets";
import type { ThemeId } from "@/types";

const LENGTHS = ["short", "long"] as const;
const THEME_IDS: ThemeId[] = themes.map((t) => t.id);

describe("eligibleTasks", () => {
  it('theme "" spans every theme pool', () => {
    for (const length of LENGTHS) {
      const total = THEME_IDS.reduce((n, id) => n + writingPrompts[id][length].length, 0);
      expect(countTasks({ theme: "", sub: "", sector: "", length })).toBe(total);
    }
  });

  it("a concrete theme yields exactly that theme's pool", () => {
    for (const length of LENGTHS) {
      for (const id of THEME_IDS) {
        const tasks = eligibleTasks({ theme: id, sub: "", sector: "", length });
        expect(tasks.length).toBe(writingPrompts[id][length].length);
        expect(tasks.every((t) => t.theme === id)).toBe(true);
      }
    }
  });

  it("a Branche prefers its tagged tasks when the theme has any", () => {
    // meetings/long carries it, hospitality and engineering tags (one each).
    const tasks = eligibleTasks({ theme: "meetings", sub: "", sector: "it", length: "long" });
    const pool = writingPrompts.meetings.long;
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => pool[t.ix].sectors?.includes("it"))).toBe(true);
  });

  it("REGRESSION: a Branche with no tagged task falls back instead of emptying", () => {
    // The bug: the rail counted only tagged tasks and disabled at zero, so every
    // Branche on an untagged theme read as unavailable while the engine would
    // have served the whole universal pool. No scope may ever yield nothing.
    for (const length of LENGTHS) {
      for (const id of THEME_IDS) {
        for (const sector of SECTOR_OPTIONS) {
          const n = countTasks({ theme: id, sub: "", sector: sector.value, length });
          expect(n, `${id}/${length}/${sector.value}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every Branche under Alle Themen yields tasks too", () => {
    for (const length of LENGTHS) {
      for (const sector of SECTOR_OPTIONS) {
        expect(countTasks({ theme: "", sub: "", sector: sector.value, length })).toBeGreaterThan(0);
      }
    }
  });

  it("the sector fallback is applied per theme, not globally", () => {
    // Under "Alle Themen" a Branche must still reach the untagged Themen (which
    // have no sector tags at all), not collapse to the handful of tagged tasks.
    const scoped = countTasks({ theme: "", sub: "", sector: "it", length: "long" });
    const tagged = THEME_IDS.reduce(
      (n, id) => n + writingPrompts[id].long.filter((t) => t.sectors?.includes("it")).length,
      0,
    );
    expect(scoped).toBeGreaterThan(tagged);
  });

  it("an Unterthema narrows to its tagged tasks", () => {
    const sub = "meetings.ablauf";
    const tasks = eligibleTasks({ theme: "meetings", sub, sector: "", length: "short" });
    const pool = writingPrompts.meetings.short;
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => pool[t.ix].sub === sub)).toBe(true);
  });

  it("an Unterthema is ignored under Alle Themen (slugs are theme-scoped)", () => {
    const all = countTasks({ theme: "", sub: "", sector: "", length: "short" });
    expect(countTasks({ theme: "", sub: "meetings.ablauf", sector: "", length: "short" })).toBe(all);
  });

  it("resolves task text for every ref it hands out", () => {
    for (const length of LENGTHS) {
      for (const ref of eligibleTasks({ theme: "", sub: "", sector: "", length })) {
        expect(taskText(ref, length).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("randomTask", () => {
  it("avoids the excluded task when an alternative exists", () => {
    const list = eligibleTasks({ theme: "meetings", sub: "", sector: "", length: "short" });
    const first = list[0];
    for (let i = 0; i < 50; i++) {
      expect(sameTask(randomTask(list, first), first)).toBe(false);
    }
  });

  it("returns the only task when the scope holds exactly one", () => {
    const list = eligibleTasks({ theme: "meetings", sub: "", sector: "", length: "short" }).slice(
      0,
      1,
    );
    expect(sameTask(randomTask(list, list[0]), list[0])).toBe(true);
  });
});
