import { describe, it, expect } from "vitest";
import {
  blockingAxis,
  countTasks,
  eligibleTasks,
  isServable,
  levelBand,
  normalizeLevelScope,
  randomTask,
  sameTask,
  taskText,
  writingTaskById,
} from "@/lib/writingScope";
import { writingPrompts } from "@/data/writingPrompts";
import { themes } from "@/data/themes";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { WRITING_FORMATS } from "@/features/writing/WritingRail";
import type { ThemeId } from "@/types";

const LENGTHS = ["short", "long"] as const;
const THEME_IDS: ThemeId[] = themes.map((t) => t.id);

/** The servable slice of a pool: what the trainer may draw (2026-07-31). */
const servable = (id: ThemeId, length: (typeof LENGTHS)[number]) =>
  writingPrompts[id][length].filter(isServable);

describe("eligibleTasks", () => {
  it("REGRESSION: only tasks with Inhaltspunkte are ever served", () => {
    // Founder decision (2026-07-31): a bare one-line Aufgabe leaves the AI
    // nothing to check Aufgabenerfüllung against and carries no Niveau or
    // Textsorte tag, so it downgrades the feedback AND is invisible to the
    // filters. 373 of 643 tasks are retired from the DRAW (never from the
    // bank: ids and pool positions stay, so drafts and Verlauf still resolve).
    for (const length of LENGTHS) {
      for (const ref of eligibleTasks({ theme: "", sub: "", sector: "", length })) {
        const task = writingPrompts[ref.theme][length][ref.ix];
        expect(isServable(task), `${task.id} has no Inhaltspunkte`).toBe(true);
      }
    }
  });

  it("a retired task is still resolvable by id and by ref (drafts, Verlauf)", () => {
    const bare = THEME_IDS.flatMap((id) =>
      LENGTHS.flatMap((len) =>
        writingPrompts[id][len].map((t, ix) => ({ id, len, ix, t })).filter((r) => !isServable(r.t)),
      ),
    );
    expect(bare.length).toBeGreaterThan(0);
    for (const r of bare.slice(0, 25)) {
      expect(writingTaskById(r.t.id)).toBe(r.t);
      expect(taskText({ theme: r.id, ix: r.ix }, r.len)).toBe(r.t.text);
    }
  });

  it('theme "" spans every theme pool', () => {
    for (const length of LENGTHS) {
      const total = THEME_IDS.reduce((n, id) => n + servable(id, length).length, 0);
      expect(countTasks({ theme: "", sub: "", sector: "", length })).toBe(total);
    }
  });

  it("a concrete theme yields exactly that theme's servable pool", () => {
    for (const length of LENGTHS) {
      for (const id of THEME_IDS) {
        const tasks = eligibleTasks({ theme: id, sub: "", sector: "", length });
        expect(tasks.length).toBe(servable(id, length).length);
        expect(tasks.length, `${id}/${length} has no servable task`).toBeGreaterThan(0);
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

  it("an Unterthema with no task reads as empty, it does not serve the theme", () => {
    // It used to fall back to the whole theme. That was the last silent
    // substitution in the selector, and retiring the bare tasks empties 30 of
    // the 96 Unterthema cells, so it would have started firing in earnest. The
    // rail greys those options; a deep link gets the trainer's empty state.
    const scope = {
      theme: "meetings" as const,
      sub: "meetings.doesnotexist",
      sector: "",
      length: "short" as const,
    };
    expect(eligibleTasks(scope)).toEqual([]);
    expect(blockingAxis(scope)).toBe("sub");
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
    // Self-maintaining: every task in every pool must have made it into the id
    // set, so a collision (which would silently drop one) fails here without
    // anyone having to bump a hardcoded count as the bank grows.
    const poolTotal = THEME_IDS.reduce(
      (n, id) => n + writingPrompts[id].short.length + writingPrompts[id].long.length,
      0,
    );
    expect(seen.size).toBe(poolTotal);
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

describe("Niveau and Textsorte axes (s167, hard since 2026-07-31)", () => {
  const LEVELS = ["B1", "B2", "C1"];
  const FORMATS = [
    ...new Set(
      THEME_IDS.flatMap((id) =>
        LENGTHS.flatMap((len) => writingPrompts[id][len].map((t) => t.format)),
      ).filter((f): f is NonNullable<typeof f> => !!f),
    ),
  ];

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

  it("REGRESSION: a Niveau filter serves ONLY that level", () => {
    // Untagged-=-universal is right for Branche but wrong here: legacy tasks
    // outnumber tagged ones ~10:1, so admitting them made a C1 scope serve a
    // B1 task.
    for (const length of LENGTHS) {
      for (const level of LEVELS) {
        for (const ref of eligibleTasks({ theme: "", sub: "", sector: "", level, length })) {
          const task = writingPrompts[ref.theme][length][ref.ix];
          expect(levelBand(task.level), `${ref.theme}/${length}[${ref.ix}]`).toBe(level);
        }
      }
    }
  });

  it("REGRESSION: a Textsorte filter serves ONLY that Textsorte, at every length", () => {
    // The founder bug (2026-07-31): "Forumsbeitrag" drew a Beschwerde an eine
    // Fluggesellschaft. The old prefer-tagged-else-untagged fallback let every
    // theme without a tagged task contribute its untagged legacy ones, so 66%
    // to 100% of the draws under a Textsorte contradicted it while the rail
    // printed the honest count next to the option. The predecessor of this test
    // asserted `some`, which is exactly why it survived: assert EVERY.
    for (const format of FORMATS) {
      for (const length of LENGTHS) {
        for (const ref of eligibleTasks({ theme: "", sub: "", sector: "", format, length })) {
          const task = writingPrompts[ref.theme][length][ref.ix];
          expect(task.format, `${format}/${length}: ${task.id}`).toBe(format);
        }
      }
    }
  });

  it("REGRESSION: every scope draws only from what the rail counted", () => {
    // The rail count and the draw are one number (`countTasks`), across every
    // combination of the two hard axes.
    for (const length of LENGTHS) {
      for (const format of FORMATS) {
        for (const level of ["", ...LEVELS]) {
          const scope = { theme: "" as const, sub: "", sector: "", level, format, length };
          const tasks = eligibleTasks(scope);
          expect(countTasks(scope)).toBe(tasks.length);
          for (const ref of tasks) {
            const task = writingPrompts[ref.theme][length][ref.ix];
            expect(task.format).toBe(format);
            if (level) expect(levelBand(task.level)).toBe(level);
          }
        }
      }
    }
  });

  it("a Textsorte that does not exist at this length yields NOTHING", () => {
    // Forumsbeitrag is a Lang shape only; Kurz must read as unavailable instead
    // of quietly serving a Notiz under a Forumsbeitrag label.
    const scope = { theme: "" as const, sub: "", sector: "", format: "forumsbeitrag" };
    expect(countTasks({ ...scope, length: "long" })).toBeGreaterThan(0);
    expect(countTasks({ ...scope, length: "short" })).toBe(0);
  });

  it("blockingAxis names the one filter to drop, and dropping it works", () => {
    const kurzForum = {
      theme: "" as const,
      sub: "",
      sector: "",
      format: "forumsbeitrag",
      length: "short" as const,
    };
    expect(blockingAxis(kurzForum)).toBe("format");
    expect(countTasks({ ...kurzForum, format: "" })).toBeGreaterThan(0);
    // A scope that yields tasks has nothing to relax.
    expect(blockingAxis({ ...kurzForum, format: "" })).toBeNull();
    // Niveau can be the culprit too: no Forumsbeitrag is tagged B1.
    expect(
      blockingAxis({ theme: "", sub: "", sector: "", level: "B1", format: "forumsbeitrag", length: "long" }),
    ).toBe("format");
    expect(
      countTasks({ theme: "", sub: "", sector: "", level: "B1", format: "forumsbeitrag", length: "long" }),
    ).toBe(0);
  });

  it("Branche never empties a pool the hard axes left standing", () => {
    // The soft axis applies LAST and only PREFERS, so choosing a Branche can
    // narrow a Textsorte scope but never wipe it out.
    for (const length of LENGTHS) {
      for (const format of FORMATS) {
        const base = countTasks({ theme: "", sub: "", sector: "", format, length });
        for (const sector of SECTOR_OPTIONS) {
          const n = countTasks({ theme: "", sub: "", sector: sector.value, format, length });
          if (base > 0) expect(n, `${format}/${length}/${sector.value}`).toBeGreaterThan(0);
          else expect(n).toBe(0);
        }
      }
    }
  });

  it("REGRESSION: Niveau + Textsorte together honour BOTH tags", () => {
    // The exact case caught on screen in s167: C1 + Widerspruch under Behörden
    // must draw the C1 Widerspruch, not an untagged legacy mail.
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

  it("levels match by BAND, so a B2.2 task answers to B2", () => {
    expect(levelBand("B2.1")).toBe("B2");
    expect(levelBand("B2.2")).toBe("B2");
    expect(levelBand("B1.1")).toBe("B1");
    expect(levelBand(undefined)).toBeUndefined();
    // Older deep links carry the fine-grained value.
    expect(normalizeLevelScope("B2.1")).toBe("B2");
    expect(normalizeLevelScope("B2")).toBe("B2");
    expect(normalizeLevelScope("")).toBe("");
    expect(normalizeLevelScope("nonsense")).toBe("");
  });

  it("wave 2: the 5 universal Beruf Themen serve EVERY Branche a dedicated task", () => {
    // The founder report behind wave 2: picking a Branche redrew a task that had
    // nothing to do with that Branche, because only 11.8% of theme x Länge x
    // Branche slots carried a tagged task. These five Themen apply to every
    // industry, so they are now filled for all 15 Branchen in both lengths.
    for (const id of ["meetings", "scheduling", "conflict", "safety", "customer"] as const) {
      for (const length of LENGTHS) {
        for (const sector of SECTOR_OPTIONS) {
          const tagged = writingPrompts[id][length].filter((t) =>
            t.sectors?.includes(sector.value as never),
          );
          expect(tagged.length, `${id}/${length}/${sector.value}`).toBeGreaterThan(0);
          // And the draw must actually serve them, not fall back past them.
          for (const ref of eligibleTasks({ theme: id, sub: "", sector: sector.value, length })) {
            expect(writingPrompts[ref.theme][length][ref.ix].sectors).toContain(sector.value);
          }
        }
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
          const structured = writingPrompts[id][length].filter(
            (t) => levelBand(t.level) === level,
          );
          expect(structured.length, `${id}/${length}/${level}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every Textsorte the rail offers exists somewhere in the bank", () => {
    // A zero that depends on the scope greys out with an honest count; a
    // Textsorte with no task at ANY length is dead chrome, which is what
    // `bewerbung` had been since s167. The rail derives its list from the bank
    // now, so this pins the derivation, not a hand-kept list.
    for (const format of WRITING_FORMATS) {
      const n =
        countTasks({ theme: "", sub: "", sector: "", format, length: "short" }) +
        countTasks({ theme: "", sub: "", sector: "", format, length: "long" });
      expect(n, format).toBeGreaterThan(0);
    }
  });
});

describe("randomTask", () => {
  it("returns null for an empty scope instead of an unrelated task", () => {
    // It used to hand back the first task of the first theme, which is exactly
    // the "this Aufgabe has nothing to do with my selection" answer.
    expect(randomTask([])).toBeNull();
    expect(
      randomTask(
        eligibleTasks({ theme: "", sub: "", sector: "", format: "forumsbeitrag", length: "short" }),
      ),
    ).toBeNull();
  });

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
