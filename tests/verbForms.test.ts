import { describe, it, expect } from "vitest";
import { verbForms, verbFormsFor } from "@/data/verbForms";
import { browsableVocabulary } from "@/data/vocabulary";

/**
 * The generated verb-morphology map (s178 content audit, P2). The content linter
 * gates coverage and the auxiliary/prose agreement; these tests pin the SHAPE of
 * the German, which is what a learner reads off the card.
 */
describe("verb forms", () => {
  const verbs = browsableVocabulary.filter((v) => v.pos === "verb");

  it("covers every browsable verb, and nothing else", () => {
    expect(verbs.length).toBeGreaterThan(200);
    expect(verbs.filter((v) => !verbFormsFor(v.id))).toEqual([]);
    const nonVerbIds = new Set(browsableVocabulary.filter((v) => v.pos !== "verb").map((v) => v.id));
    expect(Object.keys(verbForms).filter((id) => nonVerbIds.has(id))).toEqual([]);
  });

  it("gives every Partizip II a participle ending", () => {
    // -t (weak: abgesagt), -en (strong: verschoben), -an (the single irregular
    // "getan", which reaches us through leidtun).
    const bad = Object.entries(verbForms).filter(([, f]) => !/(t|en|an)$/.test(f.partizip2));
    expect(bad).toEqual([]);
  });

  it("never fuses a separable verb's Präteritum", () => {
    // "nahm teil", never "teilnahm": the particle goes to the end of the clause,
    // and the fused form is not German. Upstream shipped several of these.
    const fused = Object.entries(verbForms)
      .filter(([, f]) => f.separable && f.praeteritum && !f.praeteritum.includes(" "))
      .map(([id, f]) => `${id}: ${f.praeteritum}`);
    expect(fused).toEqual([]);
  });

  it("keeps the participle and the Präteritum in the same paradigm", () => {
    // A weak participle (-t) implies a weak Präteritum (-te). The mismatch is how
    // upstream's corrupt `bereiten` family surfaced ("vorbereitet" + "beritt vor").
    const mismatched = Object.entries(verbForms)
      .filter(([, f]) => {
        if (!f.praeteritum) return false;
        const weakParticiple = /t$/.test(f.partizip2) && !/en$/.test(f.partizip2);
        const weakPraeteritum = /te$/.test(f.praeteritum.split(" ")[0]);
        return weakParticiple && !weakPraeteritum;
      })
      .map(([id, f]) => `${id}: ${f.partizip2} / ${f.praeteritum}`);
    expect(mismatched).toEqual([]);
  });

  it("uses post-1996 spelling", () => {
    // ß after a short vowel became ss. A form may keep ß (schweißte, long ei), but
    // it may not disagree with its own participle about the stem.
    const inconsistent = Object.entries(verbForms)
      .filter(([, f]) => f.praeteritum?.includes("ß") && !f.partizip2.includes("ß"))
      .map(([id, f]) => `${id}: ${f.partizip2} / ${f.praeteritum}`);
    expect(inconsistent).toEqual([]);
  });

  it("marks reflexive verbs as haben (a reflexive can never take sein)", () => {
    const wrong = verbs
      .filter((v) => /^sich\s/i.test(v.de))
      .filter((v) => verbFormsFor(v.id)?.aux !== "haben")
      .map((v) => v.de);
    expect(wrong).toEqual([]);
  });

  it("spot-checks forms a learner would notice", () => {
    const expected: Record<string, { partizip2: string; praeteritum?: string; aux?: string }> = {
      v_verschieben: { partizip2: "verschoben", praeteritum: "verschob", aux: "haben" },
      v_abstimmen: { partizip2: "abgestimmt", praeteritum: "stimmte ab", aux: "haben" },
      v_teilnehmen: { partizip2: "teilgenommen", praeteritum: "nahm teil" },
      v_vorbereiten: { partizip2: "vorbereitet", praeteritum: "bereitete vor" },
      v_entstehen: { partizip2: "entstanden", praeteritum: "entstand", aux: "sein" },
      v_passieren: { partizip2: "passiert", praeteritum: "passierte", aux: "sein" },
      v_herunterladen: { partizip2: "heruntergeladen", praeteritum: "lud herunter" },
      v_zusammenfassen: { partizip2: "zusammengefasst", praeteritum: "fasste zusammen" },
    };
    for (const [id, want] of Object.entries(expected)) {
      const got = verbFormsFor(id);
      expect(got, `${id} has forms`).toBeTruthy();
      expect(got!.partizip2, `${id} Partizip II`).toBe(want.partizip2);
      if (want.praeteritum) expect(got!.praeteritum, `${id} Präteritum`).toBe(want.praeteritum);
      if (want.aux) expect(got!.aux, `${id} auxiliary`).toBe(want.aux);
    }
  });
});
