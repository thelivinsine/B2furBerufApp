import { describe, it, expect } from "vitest";
import { LIFE_AREAS, lifeAreaOf, domainsInArea } from "@/lib/lifeAreas";
import { themeGroupsForMode } from "@/lib/themeGroups";
import { themes } from "@/data/themes";
import { domains } from "@/data/domains";
import type { LearningMode } from "@/types";

/**
 * The app-wide categorization law (founder, 2026-07-31): a learner ever sees
 * exactly TWO categories, Berufsleben and Alltag. The five content domains are
 * the authoring grain and must never surface as a heading.
 *
 * The bug this pins: the Schreiben Thema dropdown folded `gesundheit` into
 * Alltag but not `bildung`, so "Bildung & Sprache" sat there as a third group,
 * while the Bibliothek dropdown showed up to five and the graphs showed two
 * under a different name ("Privatleben").
 */
const MODES: LearningMode[] = ["both", "work", "personal"];

describe("life areas: exactly two learner-facing categories", () => {
  it("there are two, and they are Berufsleben and Alltag", () => {
    expect(LIFE_AREAS.map((a) => a.titleDe)).toEqual(["Berufsleben", "Alltag"]);
  });

  it("only `beruf` is professional; every other domain folds into Alltag", () => {
    // Stated as "every domain that exists", so a NEW domain cannot quietly
    // introduce a third heading: it lands in Alltag or the test tells you.
    expect(lifeAreaOf("beruf")).toBe("professional");
    for (const d of domains) {
      if (d.id === "beruf") continue;
      expect(lifeAreaOf(d.id), d.id).toBe("personal");
    }
    expect(lifeAreaOf(undefined)).toBe("personal");
    expect(domainsInArea("professional")).toEqual(["beruf"]);
    expect(domainsInArea("personal").length).toBe(domains.length - 1);
  });

  it("every theme lands in exactly one area", () => {
    for (const t of themes) {
      const area = lifeAreaOf(t.domain);
      expect(LIFE_AREAS.some((a) => a.id === area), t.id).toBe(true);
    }
    const professional = themes.filter((t) => lifeAreaOf(t.domain) === "professional");
    const personal = themes.filter((t) => lifeAreaOf(t.domain) === "personal");
    expect(professional.length + personal.length).toBe(themes.length);
    expect(professional.length).toBeGreaterThan(0);
    expect(personal.length).toBeGreaterThan(0);
  });

  it("the Thema dropdown never shows a third group, in any mode", () => {
    // Covers Bibliothek (Wörter + Kollokationen) and, through the same fold,
    // the Schreiben rail.
    for (const mode of MODES) {
      for (const active of [[], themes.map((t) => t.id)]) {
        const groups = themeGroupsForMode(mode, active, () => 1);
        expect(groups.length, mode).toBeLessThanOrEqual(2);
        for (const g of groups) {
          expect(LIFE_AREAS.map((a) => a.titleDe), `${mode}: ${g.label}`).toContain(g.label);
        }
      }
    }
  });

  it("the Mode lens still narrows WITHIN the two groups", () => {
    // Collapsing the headings must not cost the Mode filter: picking "personal"
    // drops Berufsleben entirely, and "work" keeps the both-context domains
    // (Gesundheit, Bildung) inside Alltag rather than hiding them.
    const labels = (mode: LearningMode) => themeGroupsForMode(mode, [], () => 1).map((g) => g.label);
    expect(labels("personal")).toEqual(["Alltag"]);
    expect(labels("work")).toEqual(["Berufsleben", "Alltag"]);
    expect(labels("both")).toEqual(["Berufsleben", "Alltag"]);
    const workAlltag = themeGroupsForMode("work", [], () => 1).find((g) => g.label === "Alltag");
    const bothAlltag = themeGroupsForMode("both", [], () => 1).find((g) => g.label === "Alltag");
    expect(workAlltag!.options.length).toBeLessThan(bothAlltag!.options.length);
  });

  it("no theme is orphaned when a deep link selects it outside the mode", () => {
    // s104 rule kept: an actively selected theme stays visible whatever the mode.
    const groups = themeGroupsForMode("personal", ["meetings"], () => 1);
    const all = groups.flatMap((g) => g.options.map((o) => o.value));
    expect(all).toContain("meetings");
    expect(groups.length).toBeLessThanOrEqual(2);
  });
});
