/**
 * Generate `src/data/verbForms.ts` — the shipped Partizip II / Präteritum /
 * separability map behind the verb block on a Wörter card.
 *
 *   pnpm build:verbs-subset   # refresh the vendored oracle (needs the network)
 *   pnpm build:verb-forms     # then regenerate src/data/verbForms.ts (offline)
 *
 * Reads `scripts/vendor/german-verbs-subset.json`, which is itself derived from
 * `german-verbs-dict` (see build-verbs-subset.mjs for the licence trail). The
 * output is GENERATED: never hand-edit it, fix the builder or the oracle instead.
 * Same contract as `frequency.ts` and `verification.ts`.
 *
 * WHY A GENERATED FILE RATHER THAN FIELDS ON `VocabItem`: a wrong Partizip II
 * teaches an error the learner will repeat for years, so these forms must be
 * traceable to an authority rather than typed in by hand across 234 entries.
 * Everything here is oracle-derived, with one deliberate exception, below.
 *
 * THE ONE EXCEPTION: the auxiliary (haben / sein). No open lexicon in this
 * pipeline carries it, so the sein-taking verbs are enumerated by hand HERE, in
 * one reviewable place, rather than scattered across the bank. The default is
 * `haben`, which is correct for every transitive and every reflexive verb, so an
 * omission from these lists is a safe failure. Six of the entries below are
 * independently corroborated by the bank's own `context` prose ("Perfect with
 * 'sein'"), and the linter cross-checks the two so they cannot drift apart.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBSET = path.join(root, "scripts", "vendor", "german-verbs-subset.json");
const OUT = path.join(root, "src", "data", "verbForms.ts");

/**
 * Verbs whose Perfekt takes `sein`: intransitives of motion (change of location)
 * and of change of state. Keyed by our headword so the list reads as German, not
 * as ids. Every one is intransitive; if a sense here ever becomes transitive the
 * auxiliary flips to haben, which is why this is a per-headword list and not a
 * pattern.
 */
const SEIN = new Set([
  "abbiegen",        // motion: er ist links abgebogen
  "abstürzen",       // change of state: das System ist abgestürzt
  "auftreten",       // occurrence: ein Fehler ist aufgetreten (bank context agrees)
  "ausfallen",       // occurrence: die Sitzung ist ausgefallen (bank context agrees)
  "durchfallen",     // change of state: sie ist durchgefallen
  "eintreffen",      // motion: die Lieferung ist eingetroffen (bank context agrees)
  "entgegenkommen",  // motion: er ist mir entgegengekommen
  "entstehen",       // change of state: Kosten sind entstanden (bank context agrees)
  "eskalieren",      // change of state: der Konflikt ist eskaliert
  "passieren",       // occurrence: was ist passiert? (bank context agrees)
  "umsteigen",       // motion: ich bin in Hannover umgestiegen
  "vorkommen",       // occurrence: das ist schon vorgekommen
  "zurückgehen auf", // origin: der Fehler ist auf X zurückgegangen (bank context agrees)
]);

/** Verbs attested with BOTH auxiliaries in standard usage. */
const HABEN_OR_SEIN = new Set([
  "pendeln", // hat gependelt (activity) / ist gependelt (the route travelled)
]);

function auxFor(de) {
  if (SEIN.has(de)) return "sein";
  if (HABEN_OR_SEIN.has(de)) return "haben/sein";
  return "haben";
}

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

async function main() {
  const payload = JSON.parse(await readFile(SUBSET, "utf8"));
  const verbs = payload.verbs ?? {};
  const ids = Object.keys(verbs).sort();
  if (!ids.length) throw new Error("the vendored subset is empty; run pnpm build:verbs-subset first");

  // Every name in the hand lists must exist in the bank, or the list has gone
  // stale (a retired or renamed verb) and would silently stop applying.
  const headwords = new Set(ids.map((id) => verbs[id].de));
  const stale = [...SEIN, ...HABEN_OR_SEIN].filter((de) => !headwords.has(de));
  if (stale.length)
    throw new Error(`auxiliary list is stale, these headwords are no longer in the bank: ${stale.join(", ")}`);

  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  let attested = 0;
  let derived = 0;
  for (const id of ids) {
    const e = verbs[id];
    const parts = [`partizip2: "${esc(e.partizip2)}"`, `aux: "${auxFor(e.de)}"`];
    if (e.praeteritum) parts.push(`praeteritum: "${esc(e.praeteritum)}"`);
    if (e.separable) parts.push("separable: true");
    if (e.zuInfinitiv) parts.push(`zuInfinitiv: "${esc(e.zuInfinitiv)}"`);
    if (e.partizip2Variants?.length)
      parts.push(`variants: [${e.partizip2Variants.map((f) => `"${esc(f)}"`).join(", ")}]`);
    // `source` lets the surface and the review queue tell an attested form from a
    // rule-derived one instead of trusting them equally.
    const source = e.via === "weak-rule" ? "rule" : e.praeteritumDerived ? "mixed" : "dict";
    if (source !== "dict") parts.push(`source: "${source}"`);
    if (source === "dict") attested++;
    else derived++;
    lines.push(`  "${id}": { ${parts.join(", ")} },`);
  }

  const out = `// AUTO-GENERATED by scripts/build-verb-forms.mjs — do not edit by hand.
// Verb morphology for the Wörter card: Partizip II, auxiliary, Präteritum,
// separability, zu-infinitive. Derived from the vendored oracle
// scripts/vendor/german-verbs-subset.json (german-verbs-dict, MIT, itself from
// german-pos-dict by LanguageTool, CC-BY-SA-4.0). Inflected forms are facts.
//
// \`source\` marks how a form was obtained, so nothing here has to be trusted
// blind: absent = attested by the dictionary; "rule" = the verb is missing
// upstream and the regular WEAK paradigm was applied (safe because German strong
// verbs are a closed class of common verbs, all of which the dictionary has);
// "mixed" = the participle is attested but the Präteritum had to be rebuilt
// because upstream contradicted itself.
//
// The auxiliary is the one hand-maintained field; the sein list lives in the
// generator with a reason per verb. Regenerate with:
//   pnpm build:verbs-subset && pnpm build:verb-forms
import type { VerbForms } from "@/types";

export const verbFormsGeneratedAt = "${today}";

/** ${ids.length} verbs: ${attested} dictionary-attested, ${derived} rule-derived. */
export const verbForms: Record<string, VerbForms> = {
${lines.join("\n")}
};

/** The forms for a vocabulary id, or undefined when the word is not a verb (or
 *  the oracle does not cover it, in which case the surface shows nothing rather
 *  than a guess). */
export const verbFormsFor = (id: string): VerbForms | undefined => verbForms[id];
`;

  await writeFile(OUT, out, "utf8");
  console.log(
    `✔ Wrote ${path.relative(root, OUT)}: ${ids.length} verbs (${attested} attested, ${derived} derived)`,
  );
  const sein = ids.filter((id) => auxFor(verbs[id].de) !== "haben");
  console.log(`  auxiliary: ${sein.length} non-haben (${sein.map((id) => verbs[id].de).join(", ")})`);
}

main().catch((err) => {
  console.error("build-verb-forms failed:", err?.message ?? err);
  process.exitCode = 1;
});
