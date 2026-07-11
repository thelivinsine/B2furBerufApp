import { describe, it, expect } from "vitest";
import { fuzzyMatch, foldText } from "@/lib/fuzzy";

describe("foldText", () => {
  it("folds umlauts and ß, lowercases, strips punctuation", () => {
    expect(foldText("Über-Prüfung, groß!")).toBe("ueber pruefung gross");
  });
});

describe("fuzzyMatch", () => {
  const fields = ["die Besprechung", "meeting", "der Termin"];

  it("matches substrings, case- and umlaut-insensitively", () => {
    expect(fuzzyMatch("besprech", fields)).toBe(true);
    expect(fuzzyMatch("BESPRECHUNG", fields)).toBe(true);
    expect(fuzzyMatch("termin", fields)).toBe(true);
  });

  it("matches across fields in any token order", () => {
    expect(fuzzyMatch("meeting termin", fields)).toBe(true);
    expect(fuzzyMatch("termin meeting", fields)).toBe(true);
  });

  it("tolerates a single typo in tokens of 4+ chars", () => {
    expect(fuzzyMatch("besprechnug", fields)).toBe(true); // transposition-ish, edit 1 vs prefix
    expect(fuzzyMatch("termin".replace("i", "e"), fields)).toBe(true); // termen -> termin
  });

  it("does not fuzzy-match unrelated short tokens", () => {
    expect(fuzzyMatch("xyz", fields)).toBe(false);
    expect(fuzzyMatch("konferenz", fields)).toBe(false);
  });

  it("treats an empty query as matching everything", () => {
    expect(fuzzyMatch("", fields)).toBe(true);
    expect(fuzzyMatch("   ", fields)).toBe(true);
  });
});
