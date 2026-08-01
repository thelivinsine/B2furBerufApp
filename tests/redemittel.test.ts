import { describe, it, expect } from "vitest";
import { redemittel, redemittelCategories } from "@/data/redemittel";
import { themeById, themes } from "@/data/themes";
import { matchesThemeScope } from "@/lib/facets";
import type { ThemeId } from "@/types";

/**
 * The Redemittel bank after the audit-P6 pass (s182). Two things are pinned
 * here, because both were real faults, not hypotheticals:
 *
 * 1. **The daily-life half had no phrase bank at all.** All 158 phrases were
 *    workplace discussion functions or workplace channels (email, phone,
 *    presentation, interview, small talk), so a learner at the Bürgeramt, the
 *    Arztpraxis or the Servicetheke got nothing. The five Alltag packs close
 *    that, and these tests fail if one is ever emptied out again.
 * 2. **`themeId` sat on 0 of 158**, so the session composer's mode filter was
 *    a no-op and every scope showed the same phrases. Tagging is deliberately
 *    NOT blanket: a phrase belongs to a theme only when it belongs to that
 *    theme's situation, and an untagged phrase is UNIVERSAL (it shows under
 *    every Thema, exactly like an untagged Branche).
 */

/** The Alltag counter situations the P6 packs cover. */
const ALLTAG_PACKS: ThemeId[] = ["behoerde", "arzt", "wohnen", "bank", "einkaufen"];

const byTheme = (id: ThemeId) => redemittel.filter((r) => r.themeId === id);

describe("Redemittel: the Alltag packs exist", () => {
  it.each(ALLTAG_PACKS)("%s has at least 10 phrases of its own", (theme) => {
    expect(byTheme(theme).length).toBeGreaterThanOrEqual(10);
  });

  it("every Alltag pack covers both registers, so the learner can escalate", () => {
    for (const theme of ALLTAG_PACKS) {
      const registers = new Set(byTheme(theme).map((r) => r.register));
      expect(registers).toContain("neutral");
      expect(registers).toContain("formal");
    }
  });

  it("the three Alltag speech acts are all populated", () => {
    for (const cat of ["appointments", "formalities", "complaints"] as const) {
      expect(redemittel.filter((r) => r.category === cat).length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("Redemittel: no permanently empty dropdown option", () => {
  // The s180 lesson from `bewerbung`: an option that can never yield anything
  // is a broken control, not a gap. Every Kategorie in the metadata list must
  // have phrases behind it.
  it("every Kategorie has at least one phrase", () => {
    const empty = redemittelCategories
      .filter((c) => !redemittel.some((r) => r.category === c.id))
      .map((c) => c.id);
    expect(empty).toEqual([]);
  });

  it("every phrase's category is a declared Kategorie", () => {
    const known = new Set(redemittelCategories.map((c) => c.id));
    for (const r of redemittel) expect(known.has(r.category)).toBe(true);
  });
});

describe("Redemittel: themeId semantics", () => {
  it("every themeId that is set resolves to a real theme", () => {
    const known = new Set(themes.map((t) => t.id));
    for (const r of redemittel) if (r.themeId) expect(known.has(r.themeId)).toBe(true);
  });

  it("an untagged phrase is universal: it shows under every Thema", () => {
    const universal = redemittel.filter((r) => !r.themeId);
    expect(universal.length).toBeGreaterThan(0);
    for (const theme of themes) {
      for (const r of universal) expect(matchesThemeScope(r, [theme.id])).toBe(true);
    }
  });

  it("a tagged phrase shows only under its own Thema", () => {
    const tagged = redemittel.find((r) => r.themeId === "arzt")!;
    expect(matchesThemeScope(tagged, ["arzt"])).toBe(true);
    expect(matchesThemeScope(tagged, ["meetings"])).toBe(false);
    // An empty scope ("Alle Themen") matches everything.
    expect(matchesThemeScope(tagged, [])).toBe(true);
  });

  it("tagging is selective: the discussion functions stay universal", () => {
    // "Da bin ich anderer Meinung." belongs to no situation and works in all of
    // them. If a later pass blanket-tags the bank, this fails on purpose.
    const functions = redemittel.filter((r) =>
      ["suggestions", "agree", "disagree", "negotiation", "compromise", "opinion", "prosCons"].includes(
        r.category,
      ),
    );
    expect(functions.length).toBeGreaterThan(0);
    expect(functions.every((r) => !r.themeId)).toBe(true);
  });
});

describe("Redemittel: the session mode filter actually filters", () => {
  // The composer's Pool 4 rule (src/engine/session.ts): untagged is always in,
  // a tagged phrase only when its theme's context matches the learning mode.
  const poolFor = (mode: "work" | "personal") =>
    redemittel.filter((r) => {
      if (!r.themeId) return true;
      const ctx = themeById(r.themeId)?.context ?? "both";
      return ctx === mode || ctx === "both";
    });

  it("a personal-mode session no longer serves workplace-bound phrases", () => {
    const personal = poolFor("personal");
    expect(personal.length).toBeLessThan(redemittel.length);
    // Presentation openers are the clearest case: they are meetings-bound.
    expect(personal.some((r) => r.category === "presentations")).toBe(false);
  });

  it("a work-mode session still reaches the counter language it needs", () => {
    const work = poolFor("work");
    // Amt, Arzt and Wohnen are personal-context, so they drop out of work mode,
    // and what remains must still be a usable pool, not a handful.
    expect(work.length).toBeGreaterThan(100);
    expect(work.some((r) => r.category === "presentations")).toBe(true);
  });

  it("both packs and functions survive a mode-less session", () => {
    expect(redemittel.length).toBeGreaterThanOrEqual(220);
  });
});
