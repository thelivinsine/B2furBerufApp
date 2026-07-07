/**
 * Build the vendored German word-frequency subset for the data-strategy Layer 3
 * CEFR plausibility heuristic (docs/strategy/DATA_STRATEGY.md §3).
 *
 *   pnpm build:frequency-subset   # regenerate scripts/vendor/german-frequency-subset.json
 *
 * Source: the `wordfreq` package on PyPI (files.pythonhosted.org is an allowed
 * outbound host — the same "route through an allowed host" move Phase A used).
 * `wordfreq` bundles Zipf frequencies (log10 uses-per-billion, ~1 = very rare,
 * ~7 = extremely common) for German, aggregated from multiple large corpora.
 * The frequencies are FACTS (not copyrightable); wordfreq is Apache-2.0 / MIT.
 *
 * We look up only the HEADWORD content token of every vocabulary and
 * collocation item (the word the `cefr` facet is really about), so the vendored
 * subset stays small and the CEFR check runs fully offline against it, exactly
 * like the Phase A oracle subsets.
 *
 * Requires Python 3 with `wordfreq` importable (`pip install wordfreq`, or set
 * PYTHONPATH). Errors with instructions if it is missing — the resulting JSON is
 * what gets committed, so this only runs when the content banks change.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "scripts", "vendor", "german-frequency-subset.json");
const TMP = path.join(root, "scripts", "vendor", ".freq-tmp");

/** Content token of a headword: strip an article, take the longest word token. */
export function headToken(de) {
  if (typeof de !== "string") return null;
  const bare = de.replace(/^(der|die|das|ein|eine)\s+/i, "").trim();
  const toks = bare.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
  if (!toks.length) return null;
  return toks.reduce((a, b) => (b.length > a.length ? b : a));
}

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
    const vocabulary = (await server.ssrLoadModule("/src/data/vocabulary.ts")).vocabulary;
    const collocations = (await server.ssrLoadModule("/src/data/collocations.ts")).collocations;
    return { vocabulary, collocations };
  } finally {
    await server.close();
  }
}

async function main() {
  const { vocabulary, collocations } = await loadBanks();
  const tokens = new Set();
  for (const v of vocabulary) {
    const t = headToken(v.de);
    if (t) tokens.add(t);
  }
  for (const c of collocations) {
    const t = headToken(c.noun ?? c.full);
    if (t) tokens.add(t);
  }
  const list = [...tokens].sort();
  console.log(`Headword tokens to look up: ${list.length} (vocab + collocation nouns).`);

  await mkdir(TMP, { recursive: true });
  const tokFile = path.join(TMP, "tokens.txt");
  await writeFile(tokFile, list.join("\n"), "utf8");

  const py = `
import sys
try:
    from wordfreq import zipf_frequency
except Exception as e:
    sys.stderr.write("MISSING_WORDFREQ: " + str(e) + "\\n")
    sys.exit(3)
with open(sys.argv[1], encoding="utf-8") as f:
    for line in f:
        w = line.rstrip("\\n")
        if not w:
            continue
        z = zipf_frequency(w, "de")
        print(f"{w}\\t{z:.2f}")
`;
  console.log("Querying wordfreq (German Zipf frequencies) …");
  const r = spawnSync("python3", ["-c", py, tokFile], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) {
    if ((r.stderr || "").includes("MISSING_WORDFREQ")) {
      console.error(
        "\n✖ Python package `wordfreq` is not importable.\n" +
          "  Install it (`pip install wordfreq`) or set PYTHONPATH, then re-run.\n" +
          "  The resulting JSON is committed, so this only runs when content changes."
      );
    } else {
      console.error("\n✖ python3 failed:", r.stderr || r.error?.message);
    }
    await rm(TMP, { recursive: true, force: true });
    process.exitCode = 1;
    return;
  }

  const freq = {};
  let found = 0;
  for (const line of r.stdout.split("\n")) {
    if (!line) continue;
    const [w, z] = line.split("\t");
    const zipf = Number(z);
    freq[w] = zipf;
    if (zipf > 0) found++;
  }
  await rm(TMP, { recursive: true, force: true });

  const payload = {
    _meta: {
      generated_by: "scripts/build-frequency-subset.mjs",
      upstream: {
        package: "wordfreq (PyPI, Apache-2.0 / MIT)",
        metric: "Zipf frequency (log10 uses per billion words), German ('de')",
        note: "Frequency facts used as a build-time CEFR-plausibility oracle, not shipped in the app.",
      },
      token_count: list.length,
      found_in_corpus: found,
    },
    freq,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 0) + "\n", "utf8");
  console.log(
    `\n✔ Wrote ${path.relative(root, OUT)}  (${list.length} tokens, ${found} present in the German corpus).`
  );
}

// Only run the build when invoked directly (`headToken` is imported by
// verify-cefr.mjs, which must not trigger a wordfreq fetch on import).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("build-frequency-subset failed:", err?.message ?? err);
    process.exitCode = 1;
  });
}
