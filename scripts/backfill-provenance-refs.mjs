/**
 * Provenance reference back-fill (one-off, re-runnable).
 *
 * The bootstrap generator (generate-provenance-stubs.mjs) only auto-filled
 * `reference` for vocabulary (Wiktionary headword) and collocations (DWDS noun).
 * Grammar, redemittel, dialogues, exam sets and writing prompts were left with an
 * empty reference, which the linter surfaces as the back-fill queue.
 *
 * This script fills ONLY rows whose `reference` is still empty, with a genuine,
 * type-appropriate authoritative reference, and leaves every already-referenced
 * row untouched. It does NOT change review_status: the references are added,
 * human verification (draft -> verified) is still a separate four-eyes step.
 *
 * Reference policy by type:
 *  - grammar_topic / grammar_drill -> the German Wikipedia article for the topic.
 *    German grammar rules are facts (not copyrightable); Wikipedia is the cited
 *    free reference, the same way Wiktionary is cited for word facts.
 *  - collocation -> DWDS noun entry (same convention as the bootstrapped ones).
 *  - redemittel -> DWDS corpus search (/r?q=) for the phrase, so a reviewer can
 *    check the functional phrase against real native usage.
 *  - dialogue / exam_set / writing_prompt -> the Council of Europe CEFR B2 level
 *    descriptors, the standard these authored tasks are designed against.
 *
 *   pnpm exec node scripts/backfill-provenance-refs.mjs
 */
import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/data/provenance.ts");

/* German Wikipedia article per grammar topic id (grammar facts, cited not copied). */
const GRAMMAR_WIKI = {
  g_konnektoren: "https://de.wikipedia.org/wiki/Konnektor_(Linguistik)",
  g_relativsaetze: "https://de.wikipedia.org/wiki/Relativsatz",
  g_praepositionalpronomen: "https://de.wikipedia.org/wiki/Pronominaladverb",
  g_verbstellung: "https://de.wikipedia.org/wiki/Wortstellung",
  g_nebensatz: "https://de.wikipedia.org/wiki/Nebensatz",
  g_kasus: "https://de.wikipedia.org/wiki/Kasus",
  g_nomen_verb: "https://de.wikipedia.org/wiki/Funktionsverbgef%C3%BCge",
  g_konjunktiv2: "https://de.wikipedia.org/wiki/Konjunktiv",
  g_modal: "https://de.wikipedia.org/wiki/Modalverb",
  g_passiv: "https://de.wikipedia.org/wiki/Passiv",
};

/* CEFR B2 level descriptors (Council of Europe), the level standard the authored
   scenario / exam / writing tasks are designed against. */
const CEFR_B2 =
  "https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions";

function dwdsNoun(noun) {
  const bare = noun.replace(/^(ein|eine|einen|einem|einer|der|die|das|den|dem|des)\s+/i, "").trim();
  return `https://www.dwds.de/wb/${encodeURIComponent(bare)}`;
}

function dwdsCorpus(phrase) {
  return `https://www.dwds.de/r?q=${encodeURIComponent(phrase.trim())}`;
}

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  let banks;
  let provenance;
  try {
    const load = (p) => server.ssrLoadModule(p);
    const [prov, colloc, gram, rede] = await Promise.all([
      load("/src/data/provenance.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/redemittel.ts"),
    ]);
    provenance = prov.provenance;
    banks = { collocations: colloc.collocations, grammar: gram.grammar, redemittel: rede.redemittel };
  } finally {
    await server.close();
  }

  // Lookups keyed by content id.
  const collocNoun = new Map(banks.collocations.map((c) => [c.id, c.noun]));
  const redeDe = new Map(banks.redemittel.map((r) => [r.id, r.de]));
  const drillTopic = new Map();
  for (const t of banks.grammar) {
    for (const d of t.drills) drillTopic.set(d.id, t.id);
  }

  let filled = 0;
  const byType = {};
  const next = provenance.map((entry) => {
    if (typeof entry.reference === "string" && entry.reference.trim() !== "") return entry;

    let reference = "";
    switch (entry.content_type) {
      case "grammar_topic":
        reference = GRAMMAR_WIKI[entry.content_id] ?? "";
        break;
      case "grammar_drill":
        reference = GRAMMAR_WIKI[drillTopic.get(entry.content_id)] ?? "";
        break;
      case "collocation":
        if (collocNoun.has(entry.content_id)) reference = dwdsNoun(collocNoun.get(entry.content_id));
        break;
      case "redemittel":
        if (redeDe.has(entry.content_id)) reference = dwdsCorpus(redeDe.get(entry.content_id));
        break;
      case "dialogue":
      case "exam_set":
      case "writing_prompt":
        reference = CEFR_B2;
        break;
      default:
        reference = "";
    }

    if (!reference) return entry;
    filled += 1;
    byType[entry.content_type] = (byType[entry.content_type] ?? 0) + 1;
    return { ...entry, reference };
  });

  const entriesJson = JSON.stringify(next, null, 2).replace(/"([a-z_][a-z0-9_]*)"\s*:/g, "$1:");

  const fileContent = `/**
 * Content provenance register.
 *
 * Every entry corresponds to a content_id in the src/data/* banks. The linter
 * (pnpm lint:content) errors on missing rows or non-allowlisted licenses and
 * warns on authored/adapted rows with no reference.
 *
 * References were bootstrapped by scripts/generate-provenance-stubs.mjs
 * (vocabulary -> Wiktionary, collocations -> DWDS) and the remaining types were
 * back-filled by scripts/backfill-provenance-refs.mjs (grammar -> German
 * Wikipedia, redemittel -> DWDS corpus search, dialogues/exam sets/writing
 * prompts -> CEFR B2 descriptors). review_status stays "draft" until a human
 * verifies each row (the four-eyes step).
 *
 * DO NOT regenerate from scratch — it would overwrite back-filled references.
 * Add new rows manually as new content is added.
 *
 * Total rows: ${next.length}
 */
import type { ProvenanceEntry } from "@/types";

export const provenance: ProvenanceEntry[] = ${entriesJson};
`;

  writeFileSync(out, fileContent, "utf8");
  console.log(`Back-filled ${filled} reference(s).`);
  for (const [k, v] of Object.entries(byType)) console.log(`  ${String(v).padStart(4)}  ${k}`);
}

main().catch((err) => {
  console.error("Back-fill crashed:", err);
  process.exitCode = 1;
});
