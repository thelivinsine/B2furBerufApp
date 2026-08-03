import { describe, it, expect } from "vitest";
import {
  LIFE_AREAS,
  lifeAreaOf,
  lifeAreaOfTheme,
  domainsInArea,
  matchesLifeArea,
  normalizeLifeArea,
  type LifeAreaId,
} from "@/lib/lifeAreas";
import { themeGroupsForMode } from "@/lib/themeGroups";
import { countLifeAreas } from "@/features/shared/LifeAreaPills";
import { themes } from "@/data/themes";
import { domains } from "@/data/domains";
import { browsableVocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { redemittel } from "@/data/redemittel";
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

/**
 * The Lebensbereich pills (founder, s184): "a clear Berufsleben and Alltag pill
 * in each and every filter or aufgabe rail, right below the Branchen filter."
 *
 * One control, one fold, one behavior. These pin the parts a future rail could
 * get wrong: the matcher, the URL contract, the fact that neither pill may ship
 * dead on any tab, and that an active pill collapses the Thema dropdown to ONE
 * heading (its own) instead of leaving a second group reading all-zero.
 */
describe("Lebensbereich pills", () => {
  const AREAS: LifeAreaId[] = ["professional", "personal"];

  it("an empty area matches everything; a chosen one matches only its themes", () => {
    for (const t of themes) {
      expect(matchesLifeArea(t.id, ""), t.id).toBe(true);
      const own = lifeAreaOf(t.domain);
      for (const area of AREAS) {
        expect(matchesLifeArea(t.id, area), `${t.id} in ${area}`).toBe(area === own);
      }
    }
    // Untagged is NOT universal here (unlike Branche): an item with no Thema
    // has no area, so a chosen area excludes it.
    expect(matchesLifeArea(undefined, "")).toBe(true);
    expect(matchesLifeArea(undefined, "professional")).toBe(false);
    expect(matchesLifeArea("not-a-theme", "personal")).toBe(false);
    expect(lifeAreaOfTheme("not-a-theme")).toBeUndefined();
    expect(lifeAreaOfTheme(undefined)).toBeUndefined();
  });

  it("the ?area= param accepts only the two ids, never crashes a deep link", () => {
    for (const area of AREAS) expect(normalizeLifeArea(area)).toBe(area);
    for (const junk of ["", "beruf", "Berufsleben", "work", null, undefined]) {
      expect(normalizeLifeArea(junk)).toBe("");
    }
  });

  it("neither pill is dead on any tab that carries them", () => {
    // A pill greys out at zero, so a bank with nothing in one area would ship a
    // permanently disabled control. Wörter and Kollokationen count by theme;
    // Redemittel counts DEDICATED phrases (untagged ones are universal there).
    const banks: [string, Record<LifeAreaId, number>][] = [
      ["woerter", countLifeAreas(browsableVocabulary, (v) => lifeAreaOfTheme(v.themeId))],
      ["kollokationen", countLifeAreas(collocations, (c) => lifeAreaOfTheme(c.themeId))],
      ["redemittel", countLifeAreas(redemittel, (p) => lifeAreaOfTheme(p.themeId))],
    ];
    for (const [tab, counts] of banks) {
      for (const area of AREAS) {
        expect(counts[area], `${tab}/${area}`).toBeGreaterThan(0);
      }
    }
  });

  it("an active pill leaves the Thema dropdown with exactly ONE heading: its own", () => {
    for (const area of AREAS) {
      const groups = themeGroupsForMode("both", [], () => 1, area);
      expect(groups.map((g) => g.label)).toEqual([
        LIFE_AREAS.find((a) => a.id === area)!.titleDe,
      ]);
      for (const opt of groups[0].options) {
        expect(matchesLifeArea(opt.value, area), opt.value).toBe(true);
      }
    }
    // Resting state keeps both, exactly as before the pills existed.
    expect(themeGroupsForMode("both", [], () => 1, "").length).toBe(2);
  });

  it("a deep-linked Thema from the other area is never orphaned in the dropdown", () => {
    // The rails clear a cross-area Thema when the pill changes, so this only
    // happens via a stale URL. It must stay selectable rather than vanish while
    // still being the active scope.
    const beruf = themes.find((t) => lifeAreaOf(t.domain) === "professional")!;
    const groups = themeGroupsForMode("both", [beruf.id], () => 1, "personal");
    expect(groups.flatMap((g) => g.options.map((o) => o.value))).toContain(beruf.id);
    expect(groups.length).toBeLessThanOrEqual(2);
  });
});
