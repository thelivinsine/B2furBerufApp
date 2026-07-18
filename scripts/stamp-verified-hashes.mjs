/**
 * Stamp content fingerprints for every human-verified item — `pnpm stamp:verified`.
 *
 * Writes docs/reports/verified-hashes.json: one canonical-JSON sha256 per
 * provenance row with `review_status: "verified"`, keyed by content_id.
 * `pnpm lint:content` compares these stamps against the live banks and FAILS
 * when a verified item's content changed after its human review (the item must
 * be re-reviewed and re-stamped, or flipped back to "draft").
 *
 * Run this right after flipping rows to "verified" in src/data/provenance.ts.
 * Re-running is always safe: it recomputes from the current banks, so only run
 * it when every verified item's current content really has been human-checked.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { HASH_ALGORITHM, HASH_SIDECAR, buildContentIndex, contentHash } from "./content-hash.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadBanks() {
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
    const [vocab, colloc, gram, dia, exams, rede, canDo, txts, miss, writing, prov] =
      await Promise.all([
        load("/src/data/vocabulary.ts"),
        load("/src/data/collocations.ts"),
        load("/src/data/grammar.ts"),
        load("/src/data/dialogues.ts"),
        load("/src/data/examSets.ts"),
        load("/src/data/redemittel.ts"),
        load("/src/data/canDo.ts"),
        load("/src/data/texts.ts"),
        load("/src/data/missions.ts"),
        load("/src/data/writingPrompts.ts"),
        load("/src/data/provenance.ts"),
      ]);
    return {
      vocabulary: vocab.vocabulary,
      collocations: colloc.collocations,
      grammar: gram.grammar,
      scenarios: dia.scenarios,
      examSets: exams.examSets,
      redemittel: rede.redemittel,
      canDoStatements: canDo.canDoStatements,
      texts: txts.texts,
      missions: miss.missions,
      writingPrompts: writing.writingPrompts,
      provenance: prov.provenance,
    };
  } finally {
    await server.close();
  }
}

async function main() {
  const data = await loadBanks();
  const index = buildContentIndex(data);

  const verified = data.provenance.filter((row) => row.review_status === "verified");
  const hashes = {};
  const missing = [];
  for (const row of verified) {
    const item = index.get(row.content_id);
    if (!item) {
      missing.push(row.content_id);
      continue;
    }
    hashes[row.content_id] = contentHash(item);
  }

  const sorted = Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)));
  const sidecar = {
    algorithm: HASH_ALGORITHM,
    generated: new Date().toISOString().slice(0, 10),
    note:
      "Content fingerprints of every review_status:verified provenance row. " +
      "Written by pnpm stamp:verified; checked by pnpm lint:content. " +
      "Do not hand-edit: re-stamp after a re-review instead.",
    hashes: sorted,
  };

  await mkdir(path.dirname(HASH_SIDECAR), { recursive: true });
  await writeFile(HASH_SIDECAR, `${JSON.stringify(sidecar, null, 2)}\n`, "utf8");

  console.log(`Stamped ${Object.keys(sorted).length} verified item(s) -> ${path.relative(root, HASH_SIDECAR)}`);
  if (missing.length) {
    console.error(`✖ ${missing.length} verified row(s) have no live content item: ${missing.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("stamp-verified-hashes crashed:", err);
  process.exitCode = 1;
});
