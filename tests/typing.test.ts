import { describe, it, expect } from "vitest";
import { gradeTyped, gradeTypedAny, normalizeTyped, typedTolerance } from "@/engine/typing";
import { matchesSpoken } from "@/engine/pronounce";

describe("normalizeTyped", () => {
  it("lowercases, folds umlauts/ß to digraphs, strips punctuation, splits hyphens", () => {
    expect(normalizeTyped("Die Besprechung!")).toEqual(["die", "besprechung"]);
    expect(normalizeTyped("das Büro")).toEqual(["das", "buero"]);
    expect(normalizeTyped("die Straße")).toEqual(["die", "strasse"]);
    expect(normalizeTyped("die E-Mail")).toEqual(["die", "e", "mail"]);
    expect(normalizeTyped("   ")).toEqual([]);
  });

  it("folds to digraphs, not base letters, so minimal pairs stay distinct", () => {
    expect(normalizeTyped("Bär")).toEqual(["baer"]);
    expect(normalizeTyped("Bar")).toEqual(["bar"]);
  });
});

describe("typedTolerance", () => {
  it("allows 0 edits for short words, 1 mid-length, 2 from ten letters", () => {
    expect(typedTolerance(3)).toBe(0);
    expect(typedTolerance(4)).toBe(1);
    expect(typedTolerance(9)).toBe(1);
    expect(typedTolerance(10)).toBe(2);
    expect(typedTolerance(30)).toBe(2);
  });
});

describe("gradeTyped — correct tier", () => {
  it("accepts the exact display form, case-insensitively", () => {
    expect(gradeTyped("die Besprechung", "die Besprechung").verdict).toBe("correct");
    expect(gradeTyped("die besprechung", "die Besprechung").verdict).toBe("correct");
  });

  it("accepts alternate umlaut/ß spellings as fully correct, both directions", () => {
    expect(gradeTyped("das Buero", "das Büro").verdict).toBe("correct");
    expect(gradeTyped("das Büro", "das Buero").verdict).toBe("correct");
    expect(gradeTyped("die Strasse", "die Straße").verdict).toBe("correct");
  });

  it("treats spacing and hyphenation as interchangeable", () => {
    expect(gradeTyped("die Email", "die E-Mail").verdict).toBe("correct");
    expect(gradeTyped("die E Mail", "die E-Mail").verdict).toBe("correct");
    expect(gradeTyped("der Arbeits platz", "der Arbeitsplatz").verdict).toBe("correct");
  });

  it("accepts a non-noun target verbatim", () => {
    expect(gradeTyped("verhandeln", "verhandeln").verdict).toBe("correct");
  });
});

describe("gradeTyped — article and reflexive grading (almost tier)", () => {
  it("grades a missing article as almost/article, not wrong", () => {
    expect(gradeTyped("Besprechung", "die Besprechung")).toEqual({
      verdict: "almost",
      reason: "article",
    });
  });

  it("grades a wrong article as almost/article, never correct", () => {
    expect(gradeTyped("das Besprechung", "die Besprechung")).toEqual({
      verdict: "almost",
      reason: "article",
    });
  });

  it("grades a dropped reflexive sich as almost/reflexive", () => {
    expect(gradeTyped("abstimmen", "sich abstimmen")).toEqual({
      verdict: "almost",
      reason: "reflexive",
    });
    expect(gradeTyped("sich abstimmen", "sich abstimmen").verdict).toBe("correct");
  });

  it("grades a spurious article on an article-less target as almost", () => {
    expect(gradeTyped("die verhandeln", "verhandeln").verdict).toBe("almost");
  });
});

describe("gradeTyped — spelling tier", () => {
  it("grades a small typo as almost/spelling, not correct", () => {
    expect(gradeTyped("die Besprechnug", "die Besprechung")).toEqual({
      verdict: "almost",
      reason: "spelling",
    });
    expect(gradeTyped("verhandln", "verhandeln")).toEqual({
      verdict: "almost",
      reason: "spelling",
    });
  });

  it("gives short words no typo tolerance (rot ≠ rat)", () => {
    expect(gradeTyped("rat", "rot").verdict).toBe("wrong");
  });

  it("rejects edits beyond the tolerance", () => {
    // "bewerbung" vs "besprechung" is > 2 edits apart.
    expect(gradeTyped("die Bewerbung", "die Besprechung").verdict).toBe("wrong");
  });
});

describe("gradeTyped — wrong tier and guards", () => {
  it("rejects empty or whitespace input", () => {
    expect(gradeTyped("", "die Besprechung").verdict).toBe("wrong");
    expect(gradeTyped("   ", "die Besprechung").verdict).toBe("wrong");
  });

  it("gives NO containment credit, unlike the spoken matcher", () => {
    const sentence = "ich habe eine Besprechung";
    expect(matchesSpoken(sentence, "die Besprechung")).toBe(true);
    expect(gradeTyped(sentence, "die Besprechung").verdict).toBe("wrong");
  });

  it("rejects a different word entirely", () => {
    expect(gradeTyped("der Termin", "die Besprechung").verdict).toBe("wrong");
  });

  it("sets reason only on the almost tier", () => {
    expect(gradeTyped("die Besprechung", "die Besprechung").reason).toBeUndefined();
    expect(gradeTyped("der Termin", "die Besprechung").reason).toBeUndefined();
  });
});

describe("gradeTypedAny — typed-cloze multi-target (2b)", () => {
  it("accepts either the blanked surface form or the base head", () => {
    // A sentence blanked at 'Anträge' accepts both inflections.
    expect(gradeTypedAny("Anträge", ["Anträge", "Antrag"]).verdict).toBe("correct");
    expect(gradeTypedAny("Antrag", ["Anträge", "Antrag"]).verdict).toBe("correct");
  });

  it("takes the BEST verdict across targets", () => {
    // Exact on one target wins over an 'almost' on another.
    expect(gradeTypedAny("Termin", ["Termine", "Termin"]).verdict).toBe("correct");
    // A small slip against the nearest target is 'almost', not 'wrong'.
    expect(gradeTypedAny("Anträg", ["Anträge", "Antrag"]).verdict).toBe("almost");
  });

  it("is 'wrong' only when no target matches, and mirrors gradeTyped for one target", () => {
    expect(gradeTypedAny("Bericht", ["Anträge", "Antrag"]).verdict).toBe("wrong");
    expect(gradeTypedAny("die Besprechung", ["die Besprechung"]).verdict).toBe("correct");
    expect(gradeTypedAny("", ["Antrag"]).verdict).toBe("wrong");
  });
});
