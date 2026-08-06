import { describe, it, expect } from "vitest";
import {
  EMPTY_SCENARIO_SCOPE,
  EMPTY_TEXT_SCOPE,
  MODULE_LEVELS,
  SCENARIO_BAND,
  countScenarios,
  countTexts,
  kindsInPart,
  levelOfText,
  partOfText,
  scopedScenarios,
  scopedTexts,
  textsForPart,
} from "@/lib/moduleScope";
import { composeMockExam } from "@/engine/exam";
import { texts } from "@/data/texts";
import { scenarios } from "@/data/dialogues";
import { themes } from "@/data/themes";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { lifeAreaOf } from "@/lib/lifeAreas";

/**
 * The Ohne-Zeit choosers (s196). Two things are gated here, and both are
 * founder law rather than taste:
 *
 *  - a filter FILTERS, it never substitutes, and the count beside an option is
 *    exactly what picking it serves (so a greyed-out option really is empty);
 *  - a picked text is the text that runs, because the whole point of the
 *    chooser is practising the Aufgabe on the card you tapped.
 */

describe("moduleScope: the receptive pools", () => {
  it("splits the text bank into Lesen and Hören with nothing lost or shared", () => {
    const lesen = textsForPart("lesen");
    const hoeren = textsForPart("hoeren");
    expect(lesen.length + hoeren.length).toBe(texts.length);
    expect(lesen.some((t) => hoeren.includes(t))).toBe(false);
    // Hören owns the audio kinds and only those.
    expect(hoeren.every((t) => t.kind === "voicemail" || t.kind === "announcement")).toBe(true);
  });

  it("serves something at every module and level the rail offers", () => {
    for (const part of ["lesen", "hoeren"] as const) {
      expect(countTexts(part, EMPTY_TEXT_SCOPE)).toBeGreaterThan(0);
      const servable = MODULE_LEVELS.filter(
        (l) => countTexts(part, { ...EMPTY_TEXT_SCOPE, level: l.value }) > 0,
      );
      expect(servable.length).toBeGreaterThan(0);
    }
  });

  it("counts what the list actually shows, on every axis", () => {
    for (const part of ["lesen", "hoeren"] as const) {
      const axes = [
        ...MODULE_LEVELS.map((l) => ({ level: l.value })),
        ...kindsInPart(part).map((k) => ({ kind: k })),
        ...themes.slice(0, 12).map((t) => ({ theme: t.id })),
        ...SECTOR_OPTIONS.slice(0, 6).map((s) => ({ sector: s.value })),
        { area: "professional" as const },
        { area: "personal" as const },
      ];
      for (const over of axes) {
        const scope = { ...EMPTY_TEXT_SCOPE, ...over };
        expect(countTexts(part, scope)).toBe(scopedTexts(part, scope).length);
      }
    }
  });

  it("filters hard on Niveau, Textsorte and Thema", () => {
    const scoped = scopedTexts("lesen", { ...EMPTY_TEXT_SCOPE, level: "B1" });
    expect(scoped.length).toBeGreaterThan(0);
    expect(scoped.every((t) => levelOfText(t) === "B1")).toBe(true);

    const kind = kindsInPart("lesen")[0];
    expect(
      scopedTexts("lesen", { ...EMPTY_TEXT_SCOPE, kind }).every((t) => t.kind === kind),
    ).toBe(true);

    const theme = textsForPart("lesen")[0].themeId;
    expect(
      scopedTexts("lesen", { ...EMPTY_TEXT_SCOPE, theme }).every((t) => t.themeId === theme),
    ).toBe(true);
  });

  it("keeps Branche SOFT: it narrows a pool but never empties it", () => {
    for (const part of ["lesen", "hoeren"] as const) {
      const all = countTexts(part, EMPTY_TEXT_SCOPE);
      for (const sector of SECTOR_OPTIONS) {
        const n = countTexts(part, { ...EMPTY_TEXT_SCOPE, sector: sector.value });
        expect(n).toBeGreaterThan(0);
        expect(n).toBeLessThanOrEqual(all);
      }
    }
  });

  it("puts a Lebensbereich pill and its Themen on the same side", () => {
    for (const part of ["lesen", "hoeren"] as const) {
      for (const area of ["professional", "personal"] as const) {
        for (const t of scopedTexts(part, { ...EMPTY_TEXT_SCOPE, area })) {
          expect(lifeAreaOf(themes.find((th) => th.id === t.themeId)?.domain)).toBe(area);
        }
      }
    }
  });

  it("files a text under the Modelltest level its band belongs to", () => {
    for (const t of texts) {
      const level = levelOfText(t);
      expect(["B1", "B2", "C1"]).toContain(level);
      if (t.cefr.startsWith("B1")) expect(level).toBe("B1");
      if (t.cefr.startsWith("B2")) expect(level).toBe("B2");
      if (t.cefr === "C1") expect(level).toBe("C1");
    }
  });
});

describe("moduleScope: the Sprechen pool", () => {
  it("keeps every scenario reachable from exactly one Niveau option", () => {
    expect(countScenarios(EMPTY_SCENARIO_SCOPE)).toBe(scenarios.length);
    const perLevel = MODULE_LEVELS.map((l) =>
      countScenarios({ ...EMPTY_SCENARIO_SCOPE, level: l.value }),
    );
    expect(perLevel.reduce((a, b) => a + b, 0)).toBe(scenarios.length);
  });

  it("files a scenario under the band the Prüfung hub hands over", () => {
    // The hub's own ladder, so a B2 handoff still serves the Mittelstufe set.
    expect(SCENARIO_BAND).toEqual({ 1: "B1", 2: "B2", 3: "C1" });
    for (const s of scenarios) {
      const band = SCENARIO_BAND[s.level];
      expect(scopedScenarios({ ...EMPTY_SCENARIO_SCOPE, level: band })).toContain(s);
    }
  });

  it("counts what the list shows on every axis", () => {
    const axes = [
      ...MODULE_LEVELS.map((l) => ({ level: l.value })),
      ...themes.slice(0, 12).map((t) => ({ theme: t.id })),
      { area: "professional" as const },
      { area: "personal" as const },
    ];
    for (const over of axes) {
      const scope = { ...EMPTY_SCENARIO_SCOPE, ...over };
      expect(countScenarios(scope)).toBe(scopedScenarios(scope).length);
    }
  });
});

describe("composeMockExam: picked content", () => {
  it("runs the text the learner picked, not a fresh draw", () => {
    const wanted = textsForPart("lesen")[3];
    const plan = composeMockExam(levelOfText(wanted), ["lesen"], { lesen: [wanted.id] });
    expect(plan.lesen).toEqual([wanted.id]);
    expect(plan.hoeren).toEqual([]);
  });

  it("honours a multi-text pick in order", () => {
    const picked = textsForPart("hoeren").slice(0, 2).map((t) => t.id);
    const plan = composeMockExam("B2", ["hoeren"], { hoeren: picked });
    expect(plan.hoeren).toEqual(picked);
  });

  it("ignores an id the bank no longer holds and falls back to the draw", () => {
    const plan = composeMockExam("B2", ["lesen"], { lesen: ["tx_does_not_exist"] });
    expect(plan.lesen).not.toContain("tx_does_not_exist");
    expect(plan.lesen.length).toBeGreaterThan(0);
    expect(plan.lesen.every((id) => partOfText(texts.find((t) => t.id === id)!) === "lesen")).toBe(
      true,
    );
  });

  it("still composes a full random exam when nothing is picked", () => {
    const plan = composeMockExam("B2");
    expect(plan.lesen.length).toBeGreaterThan(0);
    expect(plan.hoeren.length).toBeGreaterThan(0);
    expect(plan.schreiben).not.toBeNull();
    expect(plan.sprechen).not.toBeNull();
  });
});
