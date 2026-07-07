/**
 * Build the vendored German morphology subset used by `pnpm verify:facts`.
 *
 * Source of truth: the `german-words-dict` npm package (Apache-2.0), whose
 * data is derived from `german-pos-dict` by the LanguageTool project
 * (https://github.com/languagetool-org/german-pos-dict, CC-BY-SA-4.0) — an
 * extensive morphological lexicon for German. We use it only as a build-time
 * *verification oracle* (does our der/die/das + plural match an authority),
 * not as shipped product content. Gender and plural are facts, not
 * copyrightable; we still record attribution below because the upstream is
 * CC-BY-SA.
 *
 * This script downloads the package tarball from the npm registry (the one
 * outbound host allowed in CI / the sandbox), extracts its dist/words.json,
 * filters it down to just the noun headwords Genauly actually uses, and writes
 * a small, committed subset so the checker runs fully offline with zero deps.
 *
 *   pnpm build:dict-subset        # regenerate scripts/vendor/german-words-subset.json
 *
 * Re-run this when the vocabulary bank gains nouns. The tiny subset is the
 * committed artifact; the 14 MB upstream package is never committed.
 */
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "scripts", "vendor", "german-words-subset.json");
const REGISTRY = "https://registry.npmjs.org";
const PKG = "german-words-dict";

const UPSTREAM = {
  package: `${PKG} (npm, Apache-2.0)`,
  derived_from: "german-pos-dict by LanguageTool (CC-BY-SA-4.0)",
  derived_from_url: "https://github.com/languagetool-org/german-pos-dict",
  note: "Morphological facts (gender, plural) used as a build-time verification oracle, not shipped in the app.",
};

/* ---- load our own vocabulary headwords via the repo's SSR pattern ---- */
async function loadVocabulary() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const mod = await server.ssrLoadModule("/src/data/vocabulary.ts");
    return mod.vocabulary;
  } finally {
    await server.close();
  }
}

/** Strip a leading definite article from a noun headword ("die Besprechung" -> "Besprechung"). */
function bareNoun(de) {
  return de.replace(/^(der|die|das)\s+/i, "").trim();
}

/* ---- minimal tar reader: pull one named file out of a gunzipped tarball ---- */
function extractFromTar(buf, wantSuffix) {
  let off = 0;
  while (off + 512 <= buf.length) {
    const name = buf.toString("utf8", off, off + 100).replace(/\0.*$/, "");
    if (!name) break; // zero block => end of archive
    const sizeStr = buf.toString("utf8", off + 124, off + 136).replace(/[\0 ]/g, "");
    const size = parseInt(sizeStr, 8) || 0;
    const dataStart = off + 512;
    if (name.endsWith(wantSuffix)) {
      return buf.subarray(dataStart, dataStart + size);
    }
    off = dataStart + Math.ceil(size / 512) * 512;
  }
  return null;
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log(`Resolving ${PKG} from the npm registry …`);
  const meta = JSON.parse((await fetchBuffer(`${REGISTRY}/${PKG}`)).toString("utf8"));
  const version = meta["dist-tags"].latest;
  const tarballUrl = meta.versions[version].dist.tarball;
  console.log(`  ${PKG}@${version}  (${tarballUrl})`);

  console.log("Downloading and extracting dist/words.json …");
  const tgz = await fetchBuffer(tarballUrl);
  const tar = zlib.gunzipSync(tgz);
  const wordsRaw = extractFromTar(tar, "dist/words.json");
  if (!wordsRaw) throw new Error("could not find dist/words.json inside the tarball");
  const words = JSON.parse(wordsRaw.toString("utf8"));
  console.log(`  upstream dictionary: ${Object.keys(words).length} entries`);

  console.log("Loading Genauly vocabulary headwords …");
  const vocabulary = await loadVocabulary();
  const nouns = vocabulary.filter((v) => v.pos === "noun" && v.article);
  const wanted = new Set(nouns.map((v) => bareNoun(v.de)));
  console.log(`  ${nouns.length} nouns with an article -> ${wanted.size} distinct lemmas`);

  // Keep only the fields the checker needs: gender + nominative plural.
  const subset = {};
  let hit = 0;
  for (const lemma of wanted) {
    const entry = words[lemma];
    if (!entry) continue;
    hit++;
    subset[lemma] = { G: entry.G ?? null, PLU: entry?.NOM?.PLU ?? null };
  }
  console.log(`  matched ${hit}/${wanted.size} lemmas in the upstream dictionary`);

  const payload = {
    _meta: {
      generated_by: "scripts/build-dict-subset.mjs",
      upstream: UPSTREAM,
      upstream_version: version,
      lemma_count: hit,
    },
    words: subset,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 0) + "\n", "utf8");
  console.log(`\n✔ Wrote ${path.relative(root, OUT)}  (${hit} lemmas)`);
}

main().catch((err) => {
  console.error("build-dict-subset failed:", err?.message ?? err);
  process.exitCode = 1;
});
