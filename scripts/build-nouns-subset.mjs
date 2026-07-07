/**
 * Build the SECOND vendored German-noun oracle used by `pnpm verify:facts`.
 *
 * The data strategy (docs/strategy/DATA_STRATEGY.md §3) says a single lexicon
 * cannot gate — trust needs AGREEMENT across independent sources. Oracle #1
 * (`german-words-dict`, scripts/vendor/german-words-subset.json) is derived from
 * LanguageTool's morphology. This is oracle #2, derived from a completely
 * different lineage:
 *
 *   Source: the `german-nouns` package on PyPI (files.pythonhosted.org is an
 *   allowed outbound host in CI / the sandbox), a ~100k-noun table compiled
 *   directly from German Wiktionary (CC-BY-SA-4.0, already on our allowlist).
 *   Repo: https://github.com/gambolputty/german-nouns
 *
 * Being Wiktionary-derived, it is the "Wiktionary route" the strategy wanted,
 * delivered through an allowed host instead of the blocked kaikki/de.wiktionary
 * endpoints. It is INDEPENDENT of oracle #1 (different upstream, different
 * compilation), so agreement between the two is real corroboration, and it is
 * multi-variant aware (it lists BOTH genders of "der/das Rollout" and all three
 * plurals of "Risiko"), which is exactly what a single lexicon lacked.
 *
 *   pnpm build:nouns-subset       # regenerate scripts/vendor/german-nouns-subset.json
 *
 * We use it only as a build-time VERIFICATION oracle (does our der/die/das +
 * plural match an authority), never as shipped product content. Gender/plural
 * are facts, not copyrightable; attribution is still recorded below (CC-BY-SA).
 *
 * Coverage trick (the strategy's "compound head-noun gender rule"): German
 * closed compounds inherit the gender of their final component ("der
 * Behördentermin" <- "der Termin"). For any of our lemmas the table does not
 * list directly, we fall back to the longest known noun that is a suffix of it
 * and record its GENDER only (compound plurals are unreliable), marked
 * `viaHead` so the checker can weight it as a heuristic, not a direct citation.
 */
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "scripts", "vendor", "german-nouns-subset.json");
const PYPI = "https://pypi.org/pypi/german-nouns/json";

const UPSTREAM = {
  package: "german-nouns (PyPI, CC-BY-SA-4.0)",
  derived_from: "German Wiktionary (de.wiktionary.org), CC-BY-SA-4.0",
  derived_from_url: "https://github.com/gambolputty/german-nouns",
  note: "Gender/plural facts used as a build-time verification oracle (#2 of 2), not shipped in the app.",
};

const GENUS_TO_ARTICLE = { m: "der", f: "die", n: "das" };
// Only these are real grammatical genders. The genus column also holds noise
// like "Buchstabe"/"Eigenname"/"Partikel" and chemical-formula fragments; drop them.
const isGender = (g) => g === "m" || g === "f" || g === "n";

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

/** Strip a leading definite article ("die Besprechung" -> "Besprechung"). */
const bareNoun = (de) => de.replace(/^(der|die|das)\s+/i, "").trim();

/* ---- minimal tar reader: pull one named file out of a gunzipped tarball ---- */
function extractFromTar(buf, wantSuffix) {
  let off = 0;
  while (off + 512 <= buf.length) {
    const name = buf.toString("utf8", off, off + 100).replace(/\0.*$/, "");
    if (!name) break; // zero block => end of archive
    const sizeStr = buf.toString("utf8", off + 124, off + 136).replace(/[\0 ]/g, "");
    const size = parseInt(sizeStr, 8) || 0;
    const dataStart = off + 512;
    if (name.endsWith(wantSuffix)) return buf.subarray(dataStart, dataStart + size);
    off = dataStart + Math.ceil(size / 512) * 512;
  }
  return null;
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Split one CSV line, honouring double-quoted fields (chemical names have commas). */
function splitCsv(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

async function main() {
  console.log("Resolving german-nouns from PyPI …");
  const meta = JSON.parse((await fetchBuffer(PYPI)).toString("utf8"));
  const version = meta.info.version;
  const sdist = meta.urls.find((u) => u.packagetype === "sdist");
  if (!sdist) throw new Error("no sdist found for german-nouns on PyPI");
  console.log(`  german-nouns==${version}  (${sdist.url})`);

  console.log("Downloading and extracting german_nouns/nouns.csv …");
  const tgz = await fetchBuffer(sdist.url);
  const tar = zlib.gunzipSync(tgz);
  const csvBuf = extractFromTar(tar, "german_nouns/nouns.csv");
  if (!csvBuf) throw new Error("could not find german_nouns/nouns.csv inside the sdist");
  const csv = csvBuf.toString("utf8");

  const lines = csv.split("\n");
  const header = splitCsv(lines[0]);
  const idx = (name) => header.indexOf(name);
  const iLemma = idx("lemma");
  const iPos = idx("pos");
  const genusCols = ["genus", "genus 1", "genus 2", "genus 3", "genus 4"].map(idx).filter((i) => i >= 0);
  // Every column that carries a nominative plural form (canonical + variants + declension classes).
  const pluralCols = header
    .map((h, i) => (/^nominativ plural/.test(h) ? i : -1))
    .filter((i) => i >= 0);

  // Merge all rows per lemma: a lemma can appear on multiple rows (e.g. "Husten"
  // once as m, once as n). Union genders and plurals across every row.
  /** @type {Map<string, {G: Set<string>, PLU: Set<string>}>} */
  const table = new Map();
  let rowCount = 0;
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line) continue;
    const f = splitCsv(line);
    if (f[iPos] !== "Substantiv") continue; // nouns only
    const lemma = f[iLemma];
    if (!lemma) continue;
    rowCount++;
    let rec = table.get(lemma);
    if (!rec) { rec = { G: new Set(), PLU: new Set() }; table.set(lemma, rec); }
    for (const gi of genusCols) if (isGender(f[gi])) rec.G.add(f[gi]);
    for (const pi of pluralCols) { const v = f[pi]; if (v) rec.PLU.add(v); }
  }
  console.log(`  parsed ${rowCount} noun rows -> ${table.size} distinct lemmas`);

  console.log("Loading Genauly vocabulary headwords …");
  const vocabulary = await loadVocabulary();
  const nouns = vocabulary.filter((v) => v.pos === "noun" && v.article);
  const wanted = [...new Set(nouns.map((v) => bareNoun(v.de)))];
  console.log(`  ${nouns.length} nouns with an article -> ${wanted.length} distinct lemmas`);

  const articlesOf = (gSet) => [...gSet].map((g) => GENUS_TO_ARTICLE[g]);

  const subset = {};
  let direct = 0;
  const uncovered = [];
  for (const lemma of wanted) {
    const rec = table.get(lemma);
    if (rec && rec.G.size) {
      subset[lemma] = { G: articlesOf(rec.G), PLU: [...rec.PLU] };
      direct++;
    } else {
      uncovered.push(lemma);
    }
  }
  console.log(`  direct hits: ${direct}/${wanted.length}`);

  // Compound head-noun fallback: longest known noun that is a suffix of the
  // lemma (capitalising the internal boundary, since compound heads are joined
  // lowercase). Gender only — a compound's plural often differs from its head's.
  let viaHead = 0;
  for (const lemma of uncovered) {
    let best = null;
    for (let i = 1; i <= lemma.length - 3; i++) {
      const tail = lemma.slice(i);
      const cand = tail[0].toUpperCase() + tail.slice(1);
      const rec = table.get(cand);
      if (rec && rec.G.size) { best = { head: cand, G: rec.G }; break; } // ascending i => longest tail first
    }
    if (best) {
      subset[lemma] = { G: articlesOf(best.G), PLU: [], viaHead: best.head };
      viaHead++;
    }
  }
  console.log(`  compound head-noun fallback: +${viaHead}`);

  const covered = direct + viaHead;
  const payload = {
    _meta: {
      generated_by: "scripts/build-nouns-subset.mjs",
      upstream: UPSTREAM,
      upstream_version: version,
      lemma_count: covered,
      direct,
      via_head: viaHead,
    },
    words: subset,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 0) + "\n", "utf8");
  console.log(
    `\n✔ Wrote ${path.relative(root, OUT)}  (${covered}/${wanted.length} lemmas: ${direct} direct + ${viaHead} via head)`
  );
}

main().catch((err) => {
  console.error("build-nouns-subset failed:", err?.message ?? err);
  process.exitCode = 1;
});
