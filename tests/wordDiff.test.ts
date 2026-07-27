import { describe, it, expect } from "vitest";
import { diffWords, classifyChange } from "@/lib/wordDiff";

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
      { from: "", to: "nach", category: "Ergänzung" },
    ]);
    expect(diffWords("Ich gehe sehr nach Hause.", "Ich gehe nach Hause.").changes).toEqual([
      { from: "sehr", to: "", category: "Streichung" },
    ]);
  });

  it("flags the original tokens too, so the Original view can mark the errors", () => {
    const { originalTokens } = diffWords(
      "Kanst du bitte es kurz erklaeren?",
      "Kannst du bitte es kurz erklären?",
    );
    const wrong = originalTokens.filter((t) => t.changed).map((t) => t.text);
    expect(wrong).toEqual(["Kanst", "erklaeren?"]);
    expect(originalTokens.find((t) => t.text === "bitte")?.changed).toBe(false);
  });

  it("collapses a moved word into ONE Wortstellung change (not remove + add)", () => {
    const { changes } = diffWords(
      "Ich habe heute es gelernt",
      "Ich habe es gelernt heute",
    );
    // "heute" only moved: exactly one change, tagged Wortstellung + moved.
    const moves = changes.filter((c) => c.moved);
    expect(moves).toEqual([{ from: "heute", to: "heute", category: "Wortstellung", moved: true }]);
    // No leftover contradictory "remove heute" / "add heute" pair.
    expect(changes.some((c) => c.from === "heute" && c.to === "")).toBe(false);
    expect(changes.some((c) => c.from === "" && c.to === "heute")).toBe(false);
  });

  it("keeps a real deletion and a real insertion separate (not a move)", () => {
    // Different words: not a move, so no collapsing.
    const { changes } = diffWords("Ich gehe sehr Hause.", "Ich gehe nach Hause.");
    expect(changes.some((c) => c.moved)).toBe(false);
  });

  it("classifies edits into learner-facing buckets", () => {
    expect(classifyChange("Kanst", "Kannst")).toBe("Rechtschreibung");
    expect(classifyChange("erklaeren?", "erklären?")).toBe("Umlaut");
    expect(classifyChange("berlin", "Berlin")).toBe("Groß-/Kleinschreibung");
    expect(classifyChange("", "nach")).toBe("Ergänzung");
    expect(classifyChange("sehr", "")).toBe("Streichung");
    expect(classifyChange("ins Buero", "ins Büro")).toBe("Grammatik");
  });

  it("separates an added comma from a capitalisation fix (s171)", () => {
    // Longer Verlauf texts are full of comma fixes; calling those
    // "Groß-/Kleinschreibung" taught the wrong rule.
    expect(classifyChange("Antwort", "Antwort,")).toBe("Zeichensetzung");
    expect(classifyChange("Hause.", "Hause")).toBe("Zeichensetzung");
    // Case still wins when the letters themselves change case.
    expect(classifyChange("antwort,", "Antwort,")).toBe("Groß-/Kleinschreibung");
  });
});
