import { describe, it, expect, afterEach } from "vitest";
import { translate, uiLangFor, type UiLang } from "@/lib/uiLang";
import { UI_EN } from "@/lib/uiStrings";
import { useSettingsStore } from "@/store/useSettingsStore";

afterEach(() => useSettingsStore.getState().resetSettings());

/**
 * The interface-language rule (founder s205): "if the user logs A2 or B1 level,
 * the app should show everything in English except the learning material which
 * should obviously be in german."
 */
describe("interface language follows the level", () => {
  it("A2 and B1 read the interface in English", () => {
    expect(uiLangFor("auto", "A2")).toBe("en");
    expect(uiLangFor("auto", "B1")).toBe("en");
  });

  it("B2 and C1 keep the German interface", () => {
    expect(uiLangFor("auto", "B2")).toBe("de");
    expect(uiLangFor("auto", "C1")).toBe("de");
  });

  it("an explicit choice overrides the level, in both directions", () => {
    expect(uiLangFor("de", "A2")).toBe("de");
    expect(uiLangFor("en", "C1")).toBe("en");
  });

  it("defaults to auto, so a fresh install derives from the level", () => {
    expect(useSettingsStore.getState().uiLang).toBe("auto");
  });
});

describe("translate", () => {
  it("returns the German string untouched in German", () => {
    expect(translate("Bibliothek", "de")).toBe("Bibliothek");
    // Even one that has no English at all: German is the source, never a lookup.
    expect(translate("Noch nicht übersetzt", "de")).toBe("Noch nicht übersetzt");
  });

  it("falls back to the German string when a key is missing", () => {
    // The property that lets coverage grow surface by surface: an unconverted
    // string renders exactly what it rendered before, never blank, never a key.
    expect(translate("Diesen Satz kennt das Wörterbuch nicht", "en")).toBe(
      "Diesen Satz kennt das Wörterbuch nicht",
    );
  });

  it("translates a known key", () => {
    expect(translate("Bibliothek", "en")).toBe("Library");
    expect(translate("Einstellungen", "en")).toBe("Settings");
  });

  it("prefers a context-scoped entry over the bare key", () => {
    const de: UiLang = "de";
    expect(translate("Bibliothek", de, "nav")).toBe("Bibliothek");
    // No scoped entry exists for this one, so it falls through to the bare key.
    expect(translate("Bibliothek", "en", "nav")).toBe("Library");
  });
});

describe("the English dictionary", () => {
  it("never maps a key to an empty string", () => {
    for (const [de, en] of Object.entries(UI_EN)) expect(en.trim(), de).not.toBe("");
  });

  it("uses no em dashes (writing-style rule)", () => {
    for (const [de, en] of Object.entries(UI_EN)) expect(en, de).not.toContain("—");
  });
});
