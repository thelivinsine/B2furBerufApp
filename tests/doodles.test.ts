import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DOODLE_IDS, hasDoodle, loadDoodle } from "@/features/vocabulary/doodles";
import { DOODLES } from "@/features/vocabulary/doodles/art";
import { vocabulary } from "@/data/vocabulary";
import type { Gender } from "@/components/artikel/gender";

/**
 * Fused-doodle bank guards (Artikel-Visuals Phase 2). The one catastrophic
 * failure mode is a WRONG-GENDER doodle, which would actively teach an error,
 * so beyond registry integrity these tests render every scene and assert the
 * markup carries only its own gender's CSS tokens.
 */
const byId = new Map(vocabulary.map((v) => [v.id, v]));
const GENDERS: Gender[] = ["der", "die", "das"];

describe("doodle registry", () => {
  it("index id list and art bank stay in sync", () => {
    expect([...DOODLE_IDS].sort()).toEqual(Object.keys(DOODLES).sort());
  });

  it("batch 1 is exactly the 20 planned words", () => {
    expect(DOODLE_IDS).toHaveLength(20);
  });

  it("every id exists in the vocab bank and is a noun with an article", () => {
    for (const id of DOODLE_IDS) {
      const v = byId.get(id);
      expect(v, `${id} missing from vocabulary bank`).toBeDefined();
      expect(v!.article, `${id} has no article (not a noun?)`).toBeTruthy();
    }
  });

  it("every doodle's declared gender matches the bank's article", () => {
    for (const [id, { gender }] of Object.entries(DOODLES)) {
      expect(gender, `${id}: doodle gender vs bank article`).toBe(byId.get(id)!.article);
    }
  });

  it("hasDoodle/loadDoodle agree with the registry", async () => {
    expect(hasDoodle("v_beratung")).toBe(true);
    expect(hasDoodle("v_besprechung")).toBe(false);
    expect(await loadDoodle("v_besprechung")).toBeNull();
    expect(await loadDoodle("v_beratung")).toBe(DOODLES.v_beratung.Component);
  });
});

describe("doodle scenes", () => {
  it.each(Object.entries(DOODLES))(
    "%s renders with only its own gender tokens",
    (id, { gender, Component }) => {
      const markup = renderToStaticMarkup(createElement(Component));
      // Draws its own gender (creature body or accent)...
      expect(markup, `${id} must use its ${gender} token`).toContain(`--${gender}`);
      // ...and never the other two genders' tokens.
      for (const other of GENDERS.filter((g) => g !== gender)) {
        expect(markup, `${id} leaks the ${other} token`).not.toContain(`--${other}`);
      }
      // Scenes are decorative to a screen reader (the word text carries meaning).
      expect(markup).toContain("aria-hidden");
    },
  );
});
