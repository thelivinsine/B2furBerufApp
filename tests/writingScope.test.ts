import { describe, it, expect } from "vitest";
import {
  countExact,
  countTasks,
  eligibleTasks,
  randomTask,
  sameTask,
  taskText,
  writingTaskById,
} from "@/lib/writingScope";
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

  it("a deep-linked Unterthema with no tasks still stays inside its theme", () => {
    // `narrow` cannot empty the list, but the sub filter can, and a caller that
    // gets [] would draw from a different theme entirely.
    const tasks = eligibleTasks({
      theme: "meetings",
      sub: "meetings.doesnotexist",
      sector: "",
      length: "short",
    });
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.theme === "meetings")).toBe(true);
  });

  it("every task carries a unique permanent id, resolvable by id", () => {
    const seen = new Set<string>();
    for (const length of LENGTHS) {
      for (const id of THEME_IDS) {
        for (const t of writingPrompts[id][length]) {
          expect(t.id, `${id}/${length}`).toMatch(
            new RegExp(`^wt_${id}_${length === "long" ? "l" : "s"}\\d{2,}$`),
          );
          expect(seen.has(t.id), `duplicate ${t.id}`).toBe(false);
          seen.add(t.id);
          expect(writingTaskById(t.id)).toBe(t);
        }
      }
    }
    expect(seen.size).toBe(493);
  });

  it("writingTaskById is safe for unknown and empty ids", () => {
    expect(writingTaskById(null)).toBeUndefined();
    expect(writingTaskById("")).toBeUndefined();
    expect(writingTaskById("wt_nope_s99")).toBeUndefined();
  });

  it("resolves task text for every ref it hands out", () => {
    for (const length of LENGTHS) {
      for (const ref of eligibleTasks({ theme: "", sub: "", sector: "", length })) {
        expect(taskText(ref, length).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("Niveau and Textsorte axes (s167)", () => {
  const LEVELS = ["B1.2", "B2.1", "C1"];

  it("every Niveau yields tasks under every Thema and length", () => {
    for (const length of LENGTHS) {
      for (const level of LEVELS) {
        expect(countTasks({ theme: "", sub: "", sector: "", level, length })).toBeGreaterThan(0);
        for (const id of THEME_IDS) {
          const n = countTasks({ theme: id, sub: "", sector: "", level, length });
          expect(n, `${id}/${length}/${level}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("REGRESSION: a Niveau filter serves ONLY that level where tagged tasks exist", () => {
    // Untagged-=-universal is right for Branche but wrong here: legacy tasks
    // outnumber tagged ones ~10:1, so admitting them made a C1.1 scope serve a
    // B1 task. Every theme now has a tagged task at every level, so the filter
    // must be exact.
    for (const length of LENGTHS) {
      for (const level of LEVELS) {
        for (const ref of eligibleTasks({ theme: "", sub: "", sector: "", level, length })) {
          const task = writingPrompts[ref.theme][length][ref.ix];
          expect(task.level, `${ref.theme}/${length}[${ref.ix}]`).toBe(level);
        }
      }
    }
  });

  it("REGRESSION: a Textsorte filter serves that format wherever it exists", () => {
    for (const format of ["email_formell", "forumsbeitrag", "widerspruch", "bericht"]) {
      for (const length of LENGTHS) {
        const exists = THEME_IDS.some((id) =>
          writingPrompts[id][length].some((t) => t.format === format),
        );
        const tasks = eligibleTasks({ theme: "", sub: "", sector: "", format, length });
        expect(tasks.length).toBeGreaterThan(0);
        if (!exists) continue; // e.g. Forumsbeitrag is a Lang-only Textsorte
        expect(tasks.some((r) => writingPrompts[r.theme][length][r.ix].format === format)).toBe(
          true,
        );
      }
    }
  });

  it("countExact reports 0 for a Textsorte that does not exist at this length", () => {
    // Forumsbeitrag is a Lang shape only; the Kurz dropdown must grey it out
    // instead of quietly serving a Notiz under a Forumsbeitrag label.
    expect(countExact({ theme: "", sub: "", sector: "", format: "forumsbeitrag", length: "long" }))
      .toBeGreaterThan(0);
    expect(
      countExact({ theme: "", sub: "", sector: "", format: "forumsbeitrag", length: "short" }),
    ).toBe(0);
  });

  it("countExact never exceeds the fallback count", () => {
    for (const length of LENGTHS) {
      for (const level of LEVELS) {
        const scope = { theme: "" as const, sub: "", sector: "", level, length };
        expect(countExact(scope)).toBeLessThanOrEqual(countTasks(scope));
      }
    }
  });

  it("REGRESSION: Niveau + Textsorte together honour BOTH tags", () => {
    // The exact case caught on screen: C1.1 + Widerspruch under Behörden must
    // draw the C1 Widerspruch, not an untagged legacy mail.
    const tasks = eligibleTasks({
      theme: "behoerde",
      sub: "",
      sector: "",
      level: "C1",
      format: "widerspruch",
      length: "short",
    });
    expect(tasks.length).toBeGreaterThan(0);
    for (const ref of tasks) {
      const task = writingPrompts[ref.theme].short[ref.ix];
      expect(task.level).toBe("C1");
      expect(task.format).toBe("widerspruch");
      expect(task.words).toBeGreaterThan(60);
    }
  });

  it("Niveau and Textsorte combine without emptying the pool", () => {
    for (const length of LENGTHS) {
      for (const level of LEVELS) {
        expect(
          countTasks({ theme: "", sub: "", sector: "", level, format: "email_formell", length }),
        ).toBeGreaterThan(0);
      }
    }
  });

  it("every structured task is internally consistent", () => {
    // A task that declares one exam-realistic field must declare the set, or
    // the Aufgabe card renders a half-built brief.
    for (const length of LENGTHS) {
      for (const id of THEME_IDS) {
        writingPrompts[id][length].forEach((t, i) => {
          if (!t.points) return;
          const where = `${id}.${length}[${i}]`;
          expect(t.points.length, where).toBeGreaterThanOrEqual(2);
          expect(t.points.length, where).toBeLessThanOrEqual(5);
          expect(t.addressee, where).toBeTruthy();
          expect(t.register, where).toBeTruthy();
          expect(t.level, where).toBeTruthy();
          expect(t.format, where).toBeTruthy();
          expect(t.words, where).toBeGreaterThan(0);
          // No em dashes in any shipped copy (project-wide writing rule).
          expect(t.text.includes("—"), where).toBe(false);
          for (const p of t.points) expect(p.includes("—"), where).toBe(false);
        });
      }
    }
  });

  it("covers every Thema at every Niveau in both lengths", () => {
    for (const length of LENGTHS) {
      for (const id of THEME_IDS) {
        for (const level of LEVELS) {
          const structured = writingPrompts[id][length].filter((t) => t.level === level);
          expect(structured.length, `${id}/${length}/${level}`).toBeGreaterThan(0);
        }
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
