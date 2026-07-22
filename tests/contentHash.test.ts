import { describe, it, expect, beforeAll } from "vitest";
import { webcrypto } from "node:crypto";
import {
  canonicalStringify as canonicalTs,
  contentHash as hashTs,
  buildContentIndex as indexTs,
  HASH_ALGORITHM as ALGO_TS,
} from "@/lib/contentHash";
// The node-side twin used by stamp:verified / lint:content / apply:reviews.
import {
  canonicalStringify as canonicalMjs,
  contentHash as hashMjs,
  buildContentIndex as indexMjs,
  HASH_ALGORITHM as ALGO_MJS,
} from "../scripts/content-hash.mjs";

/**
 * Parity pin: the browser hash (decision time, AdminWorkbench) and the script
 * hash (apply time, pnpm apply:reviews / stamp:verified) MUST agree on every
 * content shape, or every founder approval would be flagged as
 * "content changed since review". Change both implementations together.
 */

// jsdom does not implement SubtleCrypto; give the browser module node's
// standards-compliant webcrypto so the async path runs for real.
beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  }
});

const FIXTURES: Record<string, unknown> = {
  vocabLike: {
    id: "v_besprechung",
    de: "die Besprechung",
    en: "meeting",
    article: "die",
    plural: "die Besprechungen",
    examples: [
      { de: "Die Besprechung beginnt um neun.", en: "The meeting starts at nine." },
      { de: "Wir verschieben die Besprechung.", en: "We postpone the meeting." },
    ],
    related: ["v_tagesordnung"],
    cefr: "B1.2",
    sectors: undefined, // undefined fields must be DROPPED, not serialized
  },
  canDoLike: {
    id: "cd_meetings_1",
    themeId: "meetings",
    cefr: "B1.2",
    statement: "Ich kann in einer Besprechung meine Meinung äußern.",
    en: "I can voice my opinion in a meeting.",
    threshold: 0.4,
  },
  keyOrder: { b: 1, a: { z: [3, 1, 2], y: null }, c: "ä ö ü ß €" },
  scalars: ["plain string", 42, true, null],
};

describe("contentHash browser/script parity", () => {
  it("declares the same algorithm id", () => {
    expect(ALGO_TS).toBe(ALGO_MJS);
  });

  it("canonicalizes identically (key order, undefined-dropping, umlauts)", () => {
    for (const [name, value] of Object.entries(FIXTURES)) {
      expect(canonicalTs(value), name).toBe(canonicalMjs(value));
    }
    // Key order must not matter within one implementation either.
    expect(canonicalTs({ a: 1, b: 2 })).toBe(canonicalTs({ b: 2, a: 1 }));
  });

  it("hashes identically to the node implementation", async () => {
    for (const [name, value] of Object.entries(FIXTURES)) {
      const ts = await hashTs(value);
      expect(ts, name).toBe(hashMjs(value));
      expect(ts, name).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it("a content edit changes the hash", async () => {
    const a = await hashTs(FIXTURES.canDoLike);
    const edited = { ...(FIXTURES.canDoLike as Record<string, unknown>), threshold: 0.5 };
    expect(await hashTs(edited)).not.toBe(a);
  });

  it("builds the same content-id universe as the script index", () => {
    const data = {
      vocabulary: [{ id: "v_a" }],
      collocations: [{ id: "c_a" }],
      grammar: [{ id: "g_a", drills: [{ id: "g_a_d1" }, { id: "g_a_d2" }] }],
      scenarios: [{ id: "sc_a" }],
      examSets: [{ id: "ex_a" }],
      redemittel: [{ id: "r_a" }],
      canDoStatements: [{ id: "cd_a" }],
      texts: [{ id: "tx_a" }],
      missions: [{ id: "m_a" }],
      writingPrompts: { meetings: { title: "x" } },
    };
    const ts = indexTs(data);
    const mjs = indexMjs(data);
    expect([...ts.keys()].sort()).toEqual([...mjs.keys()].sort());
    // Drills are their own entries AND ride inside their topic; prompts get wp_.
    expect(ts.has("g_a_d1")).toBe(true);
    expect(ts.has("wp_meetings")).toBe(true);
    expect(ts.size).toBe(12);
  });
});
