import { describe, it, expect } from "vitest";
import {
  resolveContentId,
  remapRecordIds,
  remapIdArray,
  remapProgressIds,
  pickStrongerCard,
  ID_RENAMES,
} from "@/lib/idRenames";
import type { SrsCard } from "@/types";

/** Minimal FSRS card stub; only the fields the pick rule reads matter. */
const card = (reps: number, due: string): SrsCard =>
  ({ reps, due } as unknown as SrsCard);

describe("id rename registry", () => {
  it("resolves a rename chain to its terminal id", () => {
    const map = { a: "b", b: "c" };
    expect(resolveContentId("a", map)).toBe("c");
    expect(resolveContentId("b", map)).toBe("c");
    expect(resolveContentId("unmapped", map)).toBe("unmapped");
  });

  it("survives an accidental cycle instead of hanging", () => {
    const map = { a: "b", b: "a" };
    expect(["a", "b"]).toContain(resolveContentId("a", map));
  });

  it("remapRecordIds returns the SAME reference when nothing changes", () => {
    const rec = { v_x: 1, v_y: 2 };
    expect(remapRecordIds(rec, {})).toBe(rec);
    expect(remapRecordIds(rec, { v_other: "v_new" })).toBe(rec);
  });

  it("remapRecordIds moves a value to the new key", () => {
    const rec = { v_old: 3, v_keep: 1 };
    expect(remapRecordIds(rec, { v_old: "v_new" })).toEqual({ v_new: 3, v_keep: 1 });
  });

  it("remapRecordIds resolves collisions via the pick rule", () => {
    const rec = { v_old: 2, v_new: 5 };
    expect(remapRecordIds(rec, { v_old: "v_new" }, Math.max)).toEqual({ v_new: 5 });
    const rec2 = { v_old: 9, v_new: 5 };
    expect(remapRecordIds(rec2, { v_old: "v_new" }, Math.max)).toEqual({ v_new: 9 });
  });

  it("remapIdArray remaps and deduplicates", () => {
    const arr = ["v_old", "v_new", "v_other"];
    expect(remapIdArray(arr, { v_old: "v_new" })).toEqual(["v_new", "v_other"]);
    expect(remapIdArray(arr, {})).toBe(arr);
  });

  it("pickStrongerCard keeps more reps, tie broken by later due", () => {
    expect(pickStrongerCard(card(3, "2026-01-01"), card(5, "2026-01-01")).reps).toBe(5);
    expect(pickStrongerCard(card(5, "2026-01-01"), card(3, "2026-01-01")).reps).toBe(5);
    expect(pickStrongerCard(card(3, "2026-01-01"), card(3, "2026-02-01")).due).toBe("2026-02-01");
  });

  it("remapProgressIds carries FSRS history across a rename", () => {
    const state = {
      srs: { v_old: card(4, "2026-01-10"), v_other: card(1, "2026-01-01") },
      redemittelSeen: { r_old: 2, r_new: 5 },
      savedWords: ["v_old"],
      scenariosDone: ["sc_a"],
      missionsDone: ["m_11"],
      keyItems: ["ki_x"],
    };
    const out = remapProgressIds(state, { v_old: "v_new", r_old: "r_new" });
    expect(out.srs.v_new.reps).toBe(4);
    expect(out.srs.v_old).toBeUndefined();
    expect(out.srs.v_other.reps).toBe(1);
    // Colliding practice counts keep the higher count.
    expect(out.redemittelSeen.r_new).toBe(5);
    expect(out.savedWords).toEqual(["v_new"]);
    // Untouched fields pass through.
    expect(out.scenariosDone).toEqual(["sc_a"]);
    expect(out.missionsDone).toEqual(["m_11"]);
  });

  it("remapProgressIds is an identity passthrough with an empty table", () => {
    const state = { srs: { v_x: card(1, "2026-01-01") }, savedWords: ["v_x"] };
    expect(remapProgressIds(state, {})).toBe(state);
  });

  it("the live ID_RENAMES table starts empty (shipped ids are permanent)", () => {
    // If this fails you added a rename: make sure the old id is gone from the
    // banks and the target exists (pnpm lint:content checks both), then update
    // this expectation deliberately.
    expect(Object.keys(ID_RENAMES).length).toBe(0);
  });
});
