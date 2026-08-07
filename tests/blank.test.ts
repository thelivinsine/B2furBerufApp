import { describe, it, expect } from "vitest";
import { findVocabBlank, formOf, headOf } from "@/engine/blank";
import { vocabulary, RETIRED_VOCAB_IDS } from "@/data/vocabulary";
import { verbForms } from "@/data/verbForms";
import type { VocabItem } from "@/types";

/**
 * The one blanking rule (s198). Its two historical defects were invisible
 * because three call sites each carried their own copy: an ASCII `\b` that
 * could never match in front of "Ü", and an infinitive-only search that missed
 * every sentence using a real verb form. Both are pinned here, plus the
 * property that made the fix safe to ship: the gap reports its form, so
 * distractors can match it.
 */

const byId = (id: string) => vocabulary.find((v) => v.id === id)!;

describe("findVocabBlank", () => {
  it("blanks an umlaut-initial headword (the ASCII word-boundary defect)", () => {
    const blank = findVocabBlank(byId("v_ueberweisung"));
    expect(blank).not.toBeNull();
    expect(blank!.surface.toLowerCase()).toContain("überweisung");
    expect(blank!.prompt).toContain("___");
    expect(blank!.prompt).not.toContain(blank!.surface);
  });

  it("finds a verb through its Partizip II when the sentence uses the Perfekt", () => {
    const item: VocabItem = { ...byId("v_buchen"), examples: [
      { de: "Ich habe den Flug schon gebucht.", en: "I have already booked the flight." },
      { de: "Der Termin steht.", en: "The appointment is set." },
    ] };
    const blank = findVocabBlank(item);
    expect(blank?.form).toBe("partizip2");
    expect(blank?.surface).toBe("gebucht");
  });

  it("prefers the plain headword when the sentence contains both forms", () => {
    const item: VocabItem = { ...byId("v_buchen"), examples: [
      { de: "Wir müssen den Flug noch buchen.", en: "We still have to book the flight." },
      { de: "Ich habe gebucht.", en: "I have booked." },
    ] };
    expect(findVocabBlank(item)?.form).toBe("head");
  });

  it("finds a noun through its plural when the plural changes the stem", () => {
    const blank = findVocabBlank(byId("v_fahrgast"));
    expect(blank?.form).toBe("plural");
    expect(blank?.surface).toBe("Fahrgäste");
  });

  it("finds the content word of a multi-word headword", () => {
    const blank = findVocabBlank(byId("v_in_bezug_auf"));
    expect(blank).not.toBeNull();
    expect(headOf("in Bezug auf")).toBe("in");
    expect(blank!.surface.toLowerCase()).toContain("bezug");
  });

  it("returns null when no form of the word appears in either example", () => {
    const item: VocabItem = { ...byId("v_buchen"), examples: [
      { de: "Der Termin steht.", en: "The appointment is set." },
      { de: "Alles ist geklärt.", en: "Everything is settled." },
    ] };
    expect(findVocabBlank(item)).toBeNull();
  });

  it("never leaves the answer standing in its own prompt as a word", () => {
    const leaks: string[] = [];
    for (const v of vocabulary) {
      const blank = findVocabBlank(v);
      if (!blank) continue;
      expect(blank.prompt).toContain("___");
      const standalone = new RegExp(
        `(^|[^A-Za-zÄÖÜäöüß])${blank.surface.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-zÄÖÜäöüß]|$)`,
        "i",
      );
      expect(standalone.test(blank.prompt)).toBe(false);
      // A compound may still contain the answer ("Kürbissuppe" for "Suppe").
      // The builder prefers the other example when there is one, so this stays
      // rare; the count is pinned so it cannot creep back up.
      if (blank.prompt.toLowerCase().includes(blank.surface.toLowerCase())) leaks.push(v.id);
    }
    expect(leaks.length).toBeLessThanOrEqual(3);
  });
});

describe("formOf (distractors match the gap's shape)", () => {
  it("answers a Partizip II gap with other Partizip II forms", () => {
    const verb = vocabulary.find((v) => v.pos === "verb" && verbForms[v.id])!;
    expect(formOf(verb, "partizip2")).toBe(verbForms[verb.id].partizip2);
  });

  it("reports null rather than falling back to an infinitive", () => {
    const noun = vocabulary.find((v) => v.pos === "noun" && !v.plural)!;
    expect(formOf(noun, "partizip2")).toBeNull();
    expect(formOf(noun, "plural")).toBeNull();
    expect(formOf(noun, "head")).toBe(headOf(noun.de));
  });
});

describe("the shipped bank", () => {
  it("can build a gap for every browsable word (audit §4: 116 could not)", () => {
    const without = vocabulary
      .filter((v) => !RETIRED_VOCAB_IDS.has(v.id))
      .filter((v) => !findVocabBlank(v));
    expect(without.map((v) => v.id)).toEqual([]);
  });
});
