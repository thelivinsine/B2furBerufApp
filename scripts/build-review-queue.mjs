/**
 * Build the admin Review Cockpit priority queue (Kontrollzentrum §A2).
 *
 *   pnpm build:review-queue
 *
 * Loads every content bank + the generated verification/frequency maps + the
 * LanguageTool grammar sidecar through Vite's ssrLoadModule (no extra dep, same
 * pattern as lint-content / review-queue), scores every `draft` provenance row
 * with the pure `scripts/review-score.mjs`, and writes the ranked result to the
 * lazily-imported `src/features/admin/reviewQueue.json`. The UI (Prüfmodus)
 * consumes it and looks the full item up by id for rendering; the JSON stays
 * compact (one row per draft item, small fields) so the admin chunk stays lean.
 *
 * Re-run after content edits (like build:verification / build:frequency). The
 * `{ generatedAt, registerRows }` stamp lets the Übersicht show staleness.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createServer } from "vite";
import { scoreItem } from "./review-score.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "src", "features", "admin", "reviewQueue.json");
const GRAMMAR_SIDECAR = path.join(root, "docs", "reports", "verify-grammar.json");

async function loadModules() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const load = (p) => server.ssrLoadModule(p);
    const [prov, ver, freq, vocab, colloc, gram, texts, miss, missEngine] = await Promise.all([
      load("/src/data/provenance.ts"),
      load("/src/data/verification.ts"),
      load("/src/data/frequency.ts"),
      load("/src/data/vocabulary.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/texts.ts"),
      load("/src/data/missions.ts"),
      load("/src/engine/mission.ts"),
    ]);
    return {
      provenance: prov.provenance,
      verification: ver.verification,
      frequency: freq.frequency,
      vocabulary: vocab.vocabulary,
      collocations: colloc.collocations,
      grammar: gram.grammar,
      texts: texts.texts,
      missions: miss.missions,
      missionContentIds: missEngine.missionContentIds,
    };
  } finally {
    await server.close();
  }
}

async function loadGrammarMatches() {
  // content_id -> number of LanguageTool matches (0 today; robust to a future
  // report shape where byOwner holds match arrays).
  const out = new Map();
  try {
    const raw = JSON.parse(await readFile(GRAMMAR_SIDECAR, "utf8"));
    for (const [id, matches] of Object.entries(raw.byOwner ?? {})) {
      out.set(id, Array.isArray(matches) ? matches.length : 0);
    }
  } catch {
    /* sidecar absent: no grammar defect signal, non-fatal */
  }
  return out;
}

/** content_id -> CEFR facet, where the bank carries one. */
function buildCefrIndex(data) {
  const idx = new Map();
  for (const v of data.vocabulary) if (v.cefr) idx.set(v.id, v.cefr);
  for (const c of data.collocations) if (c.cefr) idx.set(c.id, c.cefr);
  for (const t of data.texts) if (t.cefr) idx.set(t.id, t.cefr);
  for (const g of data.grammar) {
    if (g.cefr) idx.set(g.id, g.cefr);
    for (const d of g.drills ?? []) if (g.cefr) idx.set(d.id, g.cefr);
  }
  return idx;
}

function buildMissionContentSet(data) {
  const set = new Set();
  for (const m of data.missions) {
    const { vocabIds, redemittelIds } = data.missionContentIds(m);
    for (const id of vocabIds) set.add(id);
    for (const id of redemittelIds) set.add(id);
    set.add(m.id);
  }
  return set;
}

async function main() {
  const data = await loadModules();
  const grammarMatches = await loadGrammarMatches();
  const cefrIndex = buildCefrIndex(data);
  const missionSet = buildMissionContentSet(data);

  const draft = data.provenance.filter((r) => r.review_status === "draft");

  // Compact tuple rows keep the generated JSON small: the UI (Prüfmodus) already
  // imports provenance + verification + the content banks, so it hydrates
  // label / reference / tier / flags from those by id. Column order is fixed and
  // documented in `columns` + mirrored by the parser in reviewQueueData.ts.
  const COLUMNS = ["id", "type", "score", "defect", "traffic", "confidence", "bank"];
  const rows = draft.map((r) => {
    const ver = data.verification[r.content_id];
    const s = scoreItem({
      contentType: r.content_type,
      checks: ver?.checks,
      grammarMatches: grammarMatches.get(r.content_id) ?? 0,
      confidence: ver?.confidence ?? 0,
      cefr: cefrIndex.get(r.content_id),
      freqBin: data.frequency[r.content_id]?.bin,
      isMissionContent: missionSet.has(r.content_id),
    });
    return [
      r.content_id,
      r.content_type,
      s.score,
      s.defectSignal,
      s.trafficProxy,
      s.confidence,
      s.bankCriticality,
    ];
  });

  // Highest priority first; stable tiebreak on id so the queue is deterministic.
  rows.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));

  const withDefectCount = rows.filter((r) => r[3] > 0).length;
  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    registerRows: data.provenance.length,
    draftRows: draft.length,
    columns: COLUMNS,
    rows,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload) + "\n", "utf8");

  console.log(
    `review-queue: ${rows.length} draft items scored (${withDefectCount} with a machine defect signal), ${data.provenance.length} register rows.`,
  );
  console.log(`  wrote ${path.relative(root, OUT)}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("build-review-queue failed:", err?.stack ?? err?.message ?? err);
    process.exitCode = 1;
  });
}
