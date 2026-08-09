import { describe, expect, it } from "vitest";
import { anredeOf, matchesAnrede } from "../src/lib/anrede";
import { helpPhrases } from "../src/features/sprechen/RedemittelHelp";
import { redemittel } from "../src/data/redemittel";
import { scenarios } from "../src/data/dialogues";

/**
 * The du/Sie rule behind the Sprechen Redemittel rail (s202).
 *
 * Two things are gated here. First the rule itself, because it reads TEXT and a
 * text rule is exactly where a wrong word boundary hides (the `blank.ts`
 * lesson). Second the promise the rail makes: every scenario's four speech
 * intents must still serve phrases once the partner's Anrede is applied, in
 * BOTH registers, or the filter would have emptied the feature for some tasks.
 */

describe("anredeOf", () => {
  it("reads du from the pronoun and its possessives", () => {
    expect(anredeOf("Was hältst du davon, wenn …?")).toBe("du");
    expect(anredeOf("Da bin ich ganz deiner Meinung.")).toBe("du");
    expect(anredeOf("Da hast du völlig recht.")).toBe("du");
  });

  it("reads Sie only from the capitalised forms", () => {
    expect(anredeOf("Lassen Sie uns einen Mittelweg finden.")).toBe("sie");
    expect(anredeOf("Ich komme Ihnen entgegen, wenn …")).toBe("sie");
    // Lowercase "sie" is she/they and lowercase "ihr" is her: neither is address.
    expect(anredeOf("Sie hat gesagt, dass sie später kommt.")).toBe("sie");
    expect(anredeOf("Er sagt, dass sie später kommt.")).toBe(null);
    expect(anredeOf("Ich habe ihr das Formular gegeben.")).toBe(null);
  });

  it("leaves a phrase that commits to neither alone", () => {
    expect(anredeOf("Als Kompromiss schlage ich vor, …")).toBe(null);
    expect(anredeOf("Wir könnten uns in der Mitte treffen.")).toBe(null);
    // "du" inside another word is not the pronoun.
    expect(anredeOf("Wir gehen das noch einmal durch.")).toBe(null);
    expect(anredeOf("Das wird so gemacht.")).toBe(null);
  });

  it("does not commit a phrase carrying both", () => {
    expect(anredeOf("Sagen Sie mir, was du meinst.")).toBe(null);
  });

  it("matches a register when the phrase is neutral or the same", () => {
    expect(matchesAnrede("Wir könnten doch …", "sie")).toBe(true);
    expect(matchesAnrede("Wir könnten doch …", "du")).toBe(true);
    expect(matchesAnrede("Was hältst du davon, wenn …?", "sie")).toBe(false);
    expect(matchesAnrede("Lassen Sie uns aufeinander zugehen.", "du")).toBe(false);
  });
});

describe("the rail is servable for every scenario", () => {
  it("offers phrases for every target intent, in both registers", () => {
    for (const scenario of scenarios) {
      for (const category of scenario.targetRedemittel) {
        for (const register of ["du", "sie"] as const) {
          const phrases = helpPhrases(category, register);
          expect(
            phrases.length,
            `${scenario.id} · ${category} · ${register}`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("never offers a phrase in the wrong Anrede while a fitting one exists", () => {
    for (const register of ["du", "sie"] as const) {
      for (const category of new Set(scenarios.flatMap((s) => s.targetRedemittel))) {
        const phrases = helpPhrases(category, register);
        const fitting = phrases.filter((p) => matchesAnrede(p.de, register));
        // Either every phrase fits, or the category had none that did and the
        // full set is served rather than an empty rail.
        expect(fitting.length === phrases.length || fitting.length === 0).toBe(true);
      }
    }
  });
});

describe("the bank itself", () => {
  it("keeps most phrases usable in either register", () => {
    const committed = redemittel.filter((p) => anredeOf(p.de) !== null);
    // A sanity floor, not a ratchet: if a change ever makes most of the bank
    // register-specific, the rail stops being able to filter without emptying.
    expect(committed.length).toBeLessThan(redemittel.length / 2);
  });
});
