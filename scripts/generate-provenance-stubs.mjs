/**
 * Provenance stub generator.
 *
 * Reads every content bank via Vite ssrLoadModule and writes a stub
 * ProvenanceEntry for every content_id into src/data/provenance.ts.
 *
 * Run once to bootstrap the register:
 *   pnpm generate:provenance
 *
 * Then back-fill the `reference` field per item (Wiktionary/DWDS for
 * vocabulary, Tatoeba for example sentences) and flip `review_status`
 * from "draft" to "verified" after human sign-off.
 *
 * DO NOT re-run on an already-populated file — it overwrites everything.
 * The generator is for initial bootstrap only.
 */
import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/data/provenance.ts");

/* Strip the article prefix from a German noun headword so we get the
   bare lemma for a Wiktionary URL: "die Besprechung" → "Besprechung". */
function wiktionaryHeadword(de, pos) {
  if (pos === "noun") {
    return de.replace(/^(der|die|das)\s+/i, "").trim();
  }
  return de.trim();
}

function wiktionaryUrl(de, pos) {
  const hw = wiktionaryHeadword(de, pos);
  return `https://de.wiktionary.org/wiki/${encodeURIComponent(hw)}`;
}

function stub(content_id, content_type, label, opts = {}) {
  return {
    content_id,
    content_type,
    label,
    origin: opts.origin ?? "authored",
    ...(opts.source_name ? { source_name: opts.source_name } : {}),
    ...(opts.source_url ? { source_url: opts.source_url } : {}),
    reference: opts.reference ?? "",
    license: opts.license ?? "OWNED",
    attribution_required: opts.attribution_required ?? false,
    added_by: "assistant",
    review_status: "draft",
    ...(opts.notes ? { notes: opts.notes } : {}),
  };
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

  let data;
  try {
    const load = (p) => server.ssrLoadModule(p);
    const [vocab, colloc, gram, dia, exams, rede, writing] = await Promise.all([
      load("/src/data/vocabulary.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/dialogues.ts"),
      load("/src/data/examSets.ts"),
      load("/src/data/redemittel.ts"),
      load("/src/data/writingPrompts.ts"),
    ]);
    data = {
      vocabulary: vocab.vocabulary,
      collocations: colloc.collocations,
      grammar: gram.grammar,
      scenarios: dia.scenarios,
      examSets: exams.examSets,
      redemittel: rede.redemittel,
      writingPrompts: writing.writingPrompts,
    };
  } finally {
    await server.close();
  }

  const entries = [];

  // Vocabulary: auto-generate Wiktionary reference from the headword.
  for (const v of data.vocabulary) {
    entries.push(stub(v.id, "vocabulary", v.de, {
      reference: wiktionaryUrl(v.de, v.pos),
      notes: `pos=${v.pos}; themeId=${v.themeId}. Reference auto-generated — verify URL and add Tatoeba example-sentence source when back-filling.`,
    }));
  }

  // Collocations: reference TBD (no obvious single URL; DWDS is the best bet per noun).
  for (const c of data.collocations) {
    const noun = c.noun.replace(/^(ein|eine|einen|einem|einer|der|die|das|den|dem|des)\s+/i, "").trim();
    entries.push(stub(c.id, "collocation", c.full, {
      reference: `https://www.dwds.de/wb/${encodeURIComponent(noun)}`,
      notes: `themeId=${c.themeId ?? "—"}. Reference is DWDS noun entry — verify and add example-sentence source when back-filling.`,
    }));
  }

  // Grammar topics and their drills.
  for (const t of data.grammar) {
    entries.push(stub(t.id, "grammar_topic", t.title, {
      notes: `group=${t.group}. Authored explanation; verify against a standard German grammar reference when back-filling.`,
    }));
    for (const d of t.drills) {
      entries.push(stub(d.id, "grammar_drill", d.prompt.slice(0, 80), {
        notes: `parent topic=${t.id}. Authored drill; verify answer and prompt against the parent topic reference.`,
      }));
    }
  }

  // Dialogues / scenarios.
  for (const s of data.scenarios) {
    entries.push(stub(s.id, "dialogue", s.title, {
      notes: `themeId=${s.themeId}; level=${s.level}. Authored branching dialogue; verify German accuracy when back-filling.`,
    }));
  }

  // Exam sets.
  for (const e of data.examSets) {
    entries.push(stub(e.id, "exam_set", e.title, {
      notes: `themeId=${e.themeId}; scenarioId=${e.scenarioId}. Authored exam simulation; verify task sheet + rubric accuracy when back-filling.`,
    }));
  }

  // Redemittel.
  for (const r of data.redemittel) {
    entries.push(stub(r.id, "redemittel", r.de, {
      notes: `category=${r.category}; register=${r.register}. Authored phrase; verify register and example against native usage when back-filling.`,
    }));
  }

  // Writing prompts: keyed by themeId (not individual ids), so synthesise ids.
  const THEME_IDS = [
    "meetings", "scheduling", "logistics", "customer", "conflict",
    "project", "technology", "sustainability", "safety", "travel",
  ];
  for (const themeId of THEME_IDS) {
    if (data.writingPrompts[themeId]) {
      entries.push(stub(`wp_${themeId}`, "writing_prompt", `Writing prompt: ${themeId}`, {
        notes: `themeId=${themeId}. Authored prompts; verify B2-level appropriateness when back-filling.`,
      }));
    }
  }

  // Render as TypeScript.
  const entriesJson = JSON.stringify(entries, null, 2)
    // JSON serialises to double-quoted keys; convert to unquoted TS object keys
    // where the key is a safe identifier (all our keys are).
    .replace(/"([a-z_][a-z0-9_]*)"\s*:/g, "$1:");

  const fileContent = `/**
 * Content provenance register — auto-generated stubs (${new Date().toISOString().slice(0, 10)}).
 *
 * Every entry corresponds to a content_id in the src/data/* banks.
 * Back-fill the \`reference\` field (Wiktionary/DWDS for vocabulary,
 * Tatoeba for example sentences) and flip \`review_status\` from "draft"
 * to "verified" after human sign-off. The linter warns on empty references
 * and errors on missing rows or non-allowlisted licenses.
 *
 * DO NOT regenerate this file — it would overwrite back-filled references.
 * Add new rows manually as new content is added.
 *
 * Total stubs: ${entries.length}
 */
import type { ProvenanceEntry } from "@/types";

export const provenance: ProvenanceEntry[] = ${entriesJson};
`;

  writeFileSync(out, fileContent, "utf8");
  console.log(`Wrote ${entries.length} stubs to src/data/provenance.ts`);

  const byType = {};
  for (const e of entries) byType[e.content_type] = (byType[e.content_type] ?? 0) + 1;
  for (const [k, v] of Object.entries(byType)) console.log(`  ${String(v).padStart(4)}  ${k}`);
}

main().catch((err) => {
  console.error("Generator crashed:", err);
  process.exitCode = 1;
});
