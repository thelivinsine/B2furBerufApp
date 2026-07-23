/**
 * Layer 3 CEFR plausibility heuristic (data-strategy verification ladder, see
 * docs/strategy/DATA_STRATEGY.md §3): flag content whose measured difficulty is
 * far from its claimed `cefr` facet, so gross mislabels surface for the jury /
 * human to resolve (the strategy's "a word tagged B2.2 that is actually
 * top-2000-frequency A2").
 *
 *   pnpm build:frequency-subset   # once / when content changes (needs wordfreq)
 *   pnpm verify:cefr              # run the heuristic, write the report (offline)
 *   pnpm verify:cefr --dry        # counts only, no report file
 *
 * TWO offline signals: word FREQUENCY (headword German Zipf, vendored subset)
 * and SENTENCE COMPLEXITY (structural read of the example).
 *
 * HONEST CALIBRATION (why this is narrow on purpose). German unigram frequency
 * is a WEAK CEFR grader: closed compounds are elementary yet individually rare
 * ("der Geldautomat" is A2 but low-frequency), so LOW frequency proves nothing.
 * The signal is only reliable in ONE direction: HIGH frequency is strong
 * evidence a word is NOT advanced. So the frequency tripwire flags only that
 * reliable case — a **common word carrying an advanced label** — and it applies
 * to **vocabulary only** (a collocation's level is phrase-level, not its noun's
 * frequency). The unreliable direction (rare word, easy label) is reported as
 * information, captioned as mostly-fine compounds, never flagged. This is a
 * tripwire for the jury/human, never a gate; recall is deliberately traded for
 * precision so the flags are worth reading.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { writeReportSidecar } from "./report-sidecar.mjs";
import { createServer } from "vite";
import { headToken } from "./build-frequency-subset.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBSET = path.join(root, "scripts", "vendor", "german-frequency-subset.json");
const REPORT = path.join(root, "docs", "reports", "verify-cefr-report.md");
const DRY = process.argv.includes("--dry");

// The content CEFR ladder, as a 0..5 index (src/lib/cefr.ts CEFR scale).
const CEFR = ["A2", "B1.1", "B1.2", "B2.1", "B2.2", "C1"];
const CEFR_INDEX = Object.fromEntries(CEFR.map((c, i) => [c, i]));

// Zipf frequency (log10 uses/billion) -> CEFR band index. Wide middle: the band
// edges only need to separate "genuinely top-common" (reliable) from the rest.
function zipfToBand(z) {
  if (z >= 5.0) return 0; // A2   — top-common (~top 2k lemmas)
  if (z >= 4.4) return 1; // B1.1 — very common
  if (z >= 3.8) return 2; // B1.2
  if (z >= 3.2) return 3; // B2.1
  if (z >= 2.6) return 4; // B2.2
  return 5; //               C1   — rare (but note: compounds land here too)
}
const MEASURABLE_FLOOR = 1.0; // below this the headword is effectively absent -> unscored
const ELEMENTARY = 1; // freqBand <= this (A2/B1.1, zipf >= 4.4) = reliably common
const ADVANCED = 4; //   claimed >= this (B2.2/C1) = advanced label

/** Structural complexity of one German sentence. Comma count ~ clause boundaries. */
function sentenceStats(s) {
  const words = (s.match(/[A-Za-zÄÖÜäöüß]+/g) || []).length;
  const commas = (s.match(/,/g) || []).length;
  const letters = s.replace(/[^A-Za-zÄÖÜäöüß]/g, "").length;
  return { words, commas, meanWordLen: words ? letters / words : 0 };
}
function complexityBand({ words, commas }) {
  if (words <= 8 && commas === 0) return 1;
  if (words <= 13 && commas <= 1) return 2;
  if (words <= 19 && commas <= 2) return 3;
  if (words <= 26 && commas <= 3) return 4;
  return 5;
}

/**
 * Classify one vocabulary item's CEFR plausibility (shared with build-verification).
 * Returns "flag" | "watch" | "rareEasy" | "ok" | "unmeasured".
 */
export function classifyVocabCefr(v, freq) {
  const claimedIdx = CEFR_INDEX[v.cefr];
  const tok = headToken(v.de);
  const zipf = tok ? freq[tok] ?? 0 : 0;
  if (zipf < MEASURABLE_FLOOR) return "unmeasured";
  const fb = zipfToBand(zipf);
  if (fb <= ELEMENTARY && claimedIdx >= ADVANCED) return "flag";
  if (fb <= ELEMENTARY && claimedIdx === 3) return "watch";
  if (fb >= ADVANCED && claimedIdx <= ELEMENTARY) return "rareEasy";
  return "ok";
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
  const vocab = vocabulary.filter((v) => v.cefr);
  const collos = collocations.filter((c) => c.cefr);
  console.log(`CEFR-tagged items: vocab ${vocab.length}, collocation ${collos.length}.`);

  if (DRY) {
    console.log("--dry: no report written.");
    return;
  }

  let freq;
  try {
    freq = JSON.parse(await readFile(SUBSET, "utf8")).freq;
  } catch {
    console.error(`\n✖ Missing ${path.relative(root, SUBSET)} — run \`pnpm build:frequency-subset\` first.`);
    process.exitCode = 1;
    return;
  }

  const flag = []; // reliable: common word (freqBand<=1) tagged advanced (>=B2.2)
  const watch = []; // common word (freqBand<=1) tagged B2.1
  const rareEasy = []; // informational: low-frequency word (freqBand>=B2.2) tagged easy (<=B1.1)
  const unmeasured = [];
  const complexOutliers = [];
  let scored = 0;
  const bandHist = Object.fromEntries(CEFR.map((c) => [c, 0]));

  for (const v of vocab) {
    const claimedIdx = CEFR_INDEX[v.cefr];
    const tok = headToken(v.de);
    const zipf = tok ? freq[tok] ?? 0 : 0;

    if (zipf >= MEASURABLE_FLOOR) {
      scored++;
      const fb = zipfToBand(zipf);
      bandHist[CEFR[fb]]++;
      const row = { id: v.id, cefr: v.cefr, head: v.de, tok, zipf: zipf.toFixed(2), freqBand: CEFR[fb], gap: fb - claimedIdx };
      if (fb <= ELEMENTARY && claimedIdx >= ADVANCED) flag.push(row);
      else if (fb <= ELEMENTARY && claimedIdx === 3) watch.push(row);
      else if (fb >= ADVANCED && claimedIdx <= ELEMENTARY) rareEasy.push(row);
    } else {
      unmeasured.push({ id: v.id, cefr: v.cefr, head: v.de, tok });
    }

    // Sentence-complexity outlier: easy label, structurally hard example.
    const exs = (v.examples ?? []).map((e) => e?.de).filter(Boolean).map((s) => ({ s, ...sentenceStats(s) }));
    if (exs.length) {
      const hardest = exs.reduce((a, b) => (complexityBand(b) > complexityBand(a) ? b : a));
      const cb = complexityBand(hardest);
      if (cb - claimedIdx >= 3) complexOutliers.push({ id: v.id, kind: "vocab", cefr: v.cefr, cb: CEFR[cb], words: hardest.words, commas: hardest.commas, ex: hardest.s });
    }
  }

  // Collocations: frequency tripwire does NOT apply (phrase-level CEFR). Only the
  // structural complexity outlier check, which is meaningful for the example.
  for (const c of collos) {
    const claimedIdx = CEFR_INDEX[c.cefr];
    const s = c.example?.de;
    if (!s) continue;
    const st = sentenceStats(s);
    const cb = complexityBand(st);
    if (cb - claimedIdx >= 3) complexOutliers.push({ id: c.id, kind: "collocation", cefr: c.cefr, cb: CEFR[cb], words: st.words, commas: st.commas, ex: s });
  }

  const total = vocab.length + collos.length;
  const L = [];
  const p = (s = "") => L.push(s);
  p("# CEFR plausibility report — claimed level vs measured difficulty (data-strategy Layer 3)");
  p("");
  p("_Generated by `pnpm verify:cefr`. A **heuristic tripwire**, not a grader and never a gate._");
  p("");
  p("> **Why this is deliberately narrow.** German unigram frequency is a weak CEFR grader: closed");
  p("> compounds are elementary yet individually rare (\"der Geldautomat\" is A2 but low-frequency), so");
  p("> **low frequency proves nothing**. The signal is reliable in one direction only: **high frequency");
  p("> is strong evidence a word is not advanced**. So the frequency tripwire flags just that case (a");
  p("> **common word carrying an advanced label**) and only for **vocabulary** (a collocation's level is");
  p("> phrase-level, not its noun's frequency). The unreliable direction is listed as information,");
  p("> never flagged. Recall is traded for precision so the flags are worth a human's time. A real CEFR");
  p("> verdict is the AI jury (Layer 4) + human audit (Layer 5). Ladder: A2 · B1.1 · B1.2 · B2.1 · B2.2 · C1.");
  p("");
  p("## Summary");
  p("");
  p(`- CEFR-tagged items: **${total}**  (vocab ${vocab.length}, collocation ${collos.length})`);
  p(`- Vocabulary scored by frequency: **${scored}**  ·  unmeasurable (absent/too rare): **${unmeasured.length}**`);
  p(`- ⛑ FLAG — common word (Zipf ≥ 4.4) tagged advanced (B2.2/C1): **${flag.length}**`);
  p(`- ⚑ WATCH — common word tagged B2.1: **${watch.length}**`);
  p(`- ○ Low-frequency word under an easy label (info, mostly compounds): **${rareEasy.length}**`);
  p(`- ◆ Example much more complex than an easy label (info): **${complexOutliers.length}**`);
  p("");
  p("Frequency-implied band distribution (scored vocabulary):");
  p("");
  p("| freq band | vocab items |");
  p("|---|---|");
  for (const c of CEFR) p(`| ${c} | ${bandHist[c]} |`);
  p("_(The C1 row is inflated by transparent compounds — see the caveat above; it is not a C1 count.)_");
  p("");

  p("## ⛑ FLAG — a common word carries an advanced label");
  p("");
  p("The reliable tripwire: the headword is genuinely high-frequency (Zipf ≥ 4.4, ~B1.1 or commoner)");
  p("but tagged B2.2/C1. High frequency is strong evidence the word itself is not advanced, so the");
  p("**level (or the sense) is worth re-checking**. Still a signal: a frequent word can be advanced in a");
  p("specific register (formal connectors like *zudem*), so confirm before editing.");
  p("");
  if (flag.length === 0) {
    p("_None._");
  } else {
    p("| id | claimed | headword | zipf | freq-implied |");
    p("|---|---|---|---|---|");
    for (const r of flag.sort((a, b) => a.gap - b.gap || a.id.localeCompare(b.id)))
      p(`| \`${r.id}\` | ${r.cefr} | ${r.head} | ${r.zipf} | ${r.freqBand} |`);
  }
  p("");

  p("## ⚑ WATCH — a common word tagged B2.1");
  p("");
  if (watch.length === 0) {
    p("_None._");
  } else {
    p("<details><summary>" + watch.length + " items</summary>");
    p("");
    p("| id | claimed | headword | zipf | freq-implied |");
    p("|---|---|---|---|---|");
    for (const r of watch.sort((a, b) => a.id.localeCompare(b.id)))
      p(`| \`${r.id}\` | ${r.cefr} | ${r.head} | ${r.zipf} | ${r.freqBand} |`);
    p("");
    p("</details>");
  }
  p("");

  p("## ○ Low-frequency vocabulary under an easy label (informational — NOT a flag)");
  p("");
  p("Tagged A2/B1.1 but the headword is low-frequency (freq-implied B2.2/C1). **Usually fine**: these");
  p("are dominated by transparent compounds that are easy to understand yet rare as single tokens.");
  p("Frequency cannot separate an easy compound from a genuinely hard word here, so nothing is flagged;");
  p("skim for any word that is actually hard.");
  p("");
  if (rareEasy.length === 0) {
    p("_None._");
  } else {
    p("<details><summary>" + rareEasy.length + " items</summary>");
    p("");
    p("| id | claimed | headword | zipf | freq-implied |");
    p("|---|---|---|---|---|");
    for (const r of rareEasy.sort((a, b) => a.cefr.localeCompare(b.cefr) || a.id.localeCompare(b.id)))
      p(`| \`${r.id}\` | ${r.cefr} | ${r.head} | ${r.zipf} | ${r.freqBand} |`);
    p("");
    p("</details>");
  }
  p("");

  p("## ◆ Example much more complex than an easy label (informational)");
  p("");
  p("Claimed A2/B1 but an example is long and multi-clause (≥3 steps harder structurally). Often fine");
  p("(an easy word can live in a rich sentence); a tripwire only if the item is meant to be introductory.");
  p("");
  if (complexOutliers.length === 0) {
    p("_None._");
  } else {
    p("<details><summary>" + complexOutliers.length + " items</summary>");
    p("");
    p("| id | kind | claimed | words | commas | complexity | example |");
    p("|---|---|---|---|---|---|---|");
    for (const r of complexOutliers.sort((a, b) => a.cefr.localeCompare(b.cefr) || a.id.localeCompare(b.id)))
      p(`| \`${r.id}\` | ${r.kind} | ${r.cefr} | ${r.words} | ${r.commas} | ${r.cb} | ${r.ex.replace(/\|/g, "\\|")} |`);
    p("");
    p("</details>");
  }
  p("");

  p("## ~ Unmeasurable by frequency (informational — no flag)");
  p("");
  p("The vocabulary headword is absent from (or too rare in) the German corpus, so no frequency band");
  p("can be assigned. Almost all are transparent domain compounds; their level is left to the jury/human.");
  p("");
  p("<details><summary>" + unmeasured.length + " items</summary>");
  p("");
  p("| id | claimed | headword |");
  p("|---|---|---|");
  for (const r of unmeasured.sort((a, b) => a.id.localeCompare(b.id))) p(`| \`${r.id}\` | ${r.cefr} | ${r.head} |`);
  p("");
  p("</details>");
  p("");

  p("## Method & caveats");
  p("");
  p("- **Frequency source:** `wordfreq` German Zipf (vendored `scripts/vendor/german-frequency-subset.json`,");
  p("  built by `pnpm build:frequency-subset`). Runs fully offline, like the Phase A oracles.");
  p("- **Bands:** Zipf ≥5 → A2, ≥4.4 → B1.1, ≥3.8 → B1.2, ≥3.2 → B2.1, ≥2.6 → B2.2, else C1. The edges");
  p("  only need to isolate *genuinely common* words; the rest is intentionally coarse.");
  p("- **Precision over recall, one reliable direction, vocabulary only.** This is a *tripwire* pointing");
  p("  the jury/human at the grossest, most defensible mislabels, not a CEFR grader and never a gate.");
  p("");

  await mkdir(path.dirname(REPORT), { recursive: true });
  await writeFile(REPORT, L.join("\n"), "utf8");
  await writeReportSidecar(REPORT, {
    registerRows: vocab.length,
    scope: "vocab",
    scored,
    flag: flag.length,
    watch: watch.length,
  });

  console.log("");
  console.log(`Vocabulary scored by frequency: ${scored}/${vocab.length}   unmeasurable: ${unmeasured.length}`);
  console.log(`⛑ FLAG: ${flag.length}   ⚑ WATCH: ${watch.length}   ○ low-freq/easy (info): ${rareEasy.length}   ◆ complex-example (info): ${complexOutliers.length}`);
  if (flag.length) {
    console.log("\nFLAG — common word, advanced label:");
    for (const r of flag) console.log(`   ${r.id.padEnd(28)} claimed ${r.cefr.padEnd(5)} zipf ${r.zipf} (${r.freqBand})  ${r.head}`);
  }
  console.log(`\nReport written to ${path.relative(root, REPORT)}`);
  console.log("Reminder: heuristic tripwire, not a grader — warn-only by design.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("verify-cefr failed:", err?.message ?? err);
    process.exitCode = 1;
  });
}
