import { describe, it, expect } from "vitest";
import { genderOf, GENDER_LABEL } from "@/components/artikel/gender";
import { vocabulary } from "@/data/vocabulary";

describe("genderOf", () => {
  it("returns the article for nouns", () => {
    expect(genderOf({ article: "der" })).toBe("der");
    expect(genderOf({ article: "die" })).toBe("die");
    expect(genderOf({ article: "das" })).toBe("das");
  });

  it("returns null when there is no article (non-nouns / article-less nouns)", () => {
    expect(genderOf({ article: undefined })).toBeNull();
    expect(genderOf({})).toBeNull();
  });

  it("never invents a gender: reads only the authored article field", () => {
    // Every article present in the bank must map to itself, nothing inferred.
    for (const v of vocabulary) {
      const g = genderOf(v);
      if (v.article) {
        expect(g).toBe(v.article);
        expect(GENDER_LABEL[g!]).toBe(v.article);
      } else {
        expect(g).toBeNull();
      }
    }
  });
});
