import { describe, it, expect } from "vitest";
import { diffWords } from "@/lib/wordDiff";

describe("diffWords", () => {
  it("flags changed tokens and pairs before/after edits", () => {
    const { tokens, changes } = diffWords(
      "Es riecht ueberall unangenehm seit Kolleginnen ihre Hund mit ins Buero bringen.",
      "Es riecht überall unangenehm, seit Kolleginnen ihren Hund mit ins Büro bringen.",
    );
    const changedText = tokens.filter((t) => t.changed).map((t) => t.text);
    expect(changedText).toContain("überall");
    expect(changedText).toContain("ihren");
    expect(changedText).toContain("Büro");
    // unchanged words are not flagged
    expect(tokens.find((t) => t.text === "riecht")?.changed).toBe(false);
    // the edits surface as before -> after pairs
    expect(changes.some((c) => c.from === "ueberall" && c.to === "überall")).toBe(true);
    expect(changes.some((c) => c.from === "ihre" && c.to === "ihren")).toBe(true);
    expect(changes.some((c) => c.from === "Buero" && c.to === "Büro")).toBe(true);
  });

  it("returns no changes for an identical sentence", () => {
    const { tokens, changes } = diffWords("Der Chef schreibt.", "Der Chef schreibt.");
    expect(changes).toEqual([]);
    expect(tokens.every((t) => !t.changed)).toBe(true);
  });

  it("handles pure insertions and deletions", () => {
    expect(diffWords("Ich gehe Hause.", "Ich gehe nach Hause.").changes).toEqual([
      { from: "", to: "nach" },
    ]);
    expect(diffWords("Ich gehe sehr nach Hause.", "Ich gehe nach Hause.").changes).toEqual([
      { from: "sehr", to: "" },
    ]);
  });
});
