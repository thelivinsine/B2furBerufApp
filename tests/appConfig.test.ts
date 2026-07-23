import { describe, it, expect } from "vitest";
import { mergeAppConfig, DEFAULT_APP_CONFIG } from "@/lib/appConfig";

/**
 * Pins the Steuerung config merge (§H). THE critical invariant: an empty or
 * malformed remote config must resolve to the compiled defaults byte-for-byte,
 * so the app is unchanged when nothing is configured or a bad row arrives.
 */

describe("mergeAppConfig — empty == defaults invariant", () => {
  it("returns the defaults for an empty Map", () => {
    expect(mergeAppConfig(new Map())).toEqual(DEFAULT_APP_CONFIG);
  });

  it("returns the defaults for an empty object", () => {
    expect(mergeAppConfig({})).toEqual(DEFAULT_APP_CONFIG);
  });

  it("ignores unknown keys", () => {
    expect(mergeAppConfig({ somethingElse: 42, nope: "x" })).toEqual(DEFAULT_APP_CONFIG);
  });
});

describe("mergeAppConfig — defensive coercion", () => {
  it("ignores mistyped values and keeps the default", () => {
    const merged = mergeAppConfig({
      navLabels: "not-an-object",
      hiddenTabs: { not: "an-array" },
      betaChip: "yes", // not a boolean
      dashboardStartTab: "bogus",
      features: 12,
      feedback: null,
    });
    expect(merged).toEqual(DEFAULT_APP_CONFIG);
  });

  it("drops non-string nav labels but keeps valid ones", () => {
    const merged = mergeAppConfig({ navLabels: { "/library": "Theorie", "/analytics": 5, "/": "  " } });
    expect(merged.navLabels).toEqual({ "/library": "Theorie" });
  });

  it("filters hiddenTabs to strings only", () => {
    const merged = mergeAppConfig({ hiddenTabs: ["/library", 3, null, "/analytics"] });
    expect(merged.hiddenTabs).toEqual(["/library", "/analytics"]);
  });
});

describe("mergeAppConfig — real overrides apply", () => {
  it("applies a partial features object over the defaults", () => {
    const merged = mergeAppConfig({ features: { practiceTabs: true } });
    expect(merged.features.practiceTabs).toBe(true);
    expect(merged.features.relatedPanel).toBe(false); // untouched default
    expect(merged.features.flipHint).toBe(true);
  });

  it("applies feedback overrides and normalises an empty label to null", () => {
    const merged = mergeAppConfig({
      feedback: { enabled: false, label: "  ", hiddenRoutes: ["/welt"] },
    });
    expect(merged.feedback.enabled).toBe(false);
    expect(merged.feedback.label).toBeNull();
    expect(merged.feedback.hiddenRoutes).toEqual(["/welt"]);
  });

  it("applies a valid dashboard start tab", () => {
    expect(mergeAppConfig({ dashboardStartTab: "spielen" }).dashboardStartTab).toBe("spielen");
  });

  it("applies wave-2 fields: impressum, header, landing", () => {
    const merged = mergeAppConfig({
      impressumEnabled: true,
      header: { streakPill: false },
      landing: {
        heroEyebrow: { de: "Hallo", en: "Hi" },
        ctaLabel: { de: "  ", en: "Go" }, // one side empty -> ignored
      },
    });
    expect(merged.impressumEnabled).toBe(true);
    expect(merged.header.streakPill).toBe(false);
    expect(merged.landing.heroEyebrow).toEqual({ de: "Hallo", en: "Hi" });
    expect(merged.landing.ctaLabel).toBeNull(); // needs BOTH sides
  });

  it("ignores a malformed landing override", () => {
    const merged = mergeAppConfig({ landing: { heroEyebrow: "nope", ctaLabel: 3 } });
    expect(merged.landing).toEqual({ heroEyebrow: null, ctaLabel: null });
  });

  it("does not mutate DEFAULT_APP_CONFIG", () => {
    mergeAppConfig({ navLabels: { "/": "X" }, hiddenTabs: ["/library"] });
    expect(DEFAULT_APP_CONFIG.navLabels).toEqual({});
    expect(DEFAULT_APP_CONFIG.hiddenTabs).toEqual([]);
  });
});
