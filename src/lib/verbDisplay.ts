import type { VerbForms } from "@/types";

/**
 * Display helpers for the generated verb morphology (`src/data/verbForms.ts`).
 *
 * The data stores the auxiliary as an INFINITIVE ("haben" / "sein") because that
 * is how a lexicon states it, but a learner needs the conjugated citation form
 * ("hat verschoben"), which is the shape the Perfekt actually appears in. That
 * conversion lives here rather than in the generated file, which must stay a
 * plain fact table.
 */
const AUX_3SG: Record<VerbForms["aux"], string> = {
  haben: "hat",
  sein: "ist",
  "haben/sein": "hat/ist",
};

/** The Perfekt as a learner says it: "hat verschoben", "ist entstanden". */
export function perfekt(forms: VerbForms): string {
  return `${AUX_3SG[forms.aux]} ${forms.partizip2}`;
}
