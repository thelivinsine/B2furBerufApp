/**
 * Layer C — the per-item trust model (data-strategy verification ladder, see
 * docs/strategy/DATA_STRATEGY.md §4). Compose the results of the deterministic
 * checks (structural, provenance, facts, linguistic) into a `Verification`
 * record per content_id, and write the generated map read by `/sources` and
 * `lint:content`.
 *
 *   pnpm verify:facts && pnpm verify:grammar && pnpm verify:cefr  # produce inputs
 *   pnpm build:verification                                       # compose -> src/data/verification.ts
 *
 * WHY A GENERATED MAP (not inline on provenance.ts). The register is
 * hand-maintained; rewriting 1,400 rows every sweep would bury real edits in
 * churn. So the machine tiers live in a generated `src/data/verification.ts`
 * keyed by content_id; `/sources` merges it onto the register (an inline
 * `verification` on a row still wins). Every record shares one sweep-date const
 * `D`, so a regeneration with no content change touches only the items whose
 * tier actually moved (plus that one date line).
 *
 * INPUTS: the two fact oracles + the frequency subset (offline, vendored) are
 * recomputed here from the shared helpers; grammar comes from the sidecar
 * `docs/reports/verify-grammar.json` (so LanguageTool is not re-run). Run the
 * three `verify:*` scripts first; grammar needs `pnpm build:languagetool`.
 * The `jury` rung is fed by `docs/reports/jury-review.json` (an AI-jury review
 * pass, scale-up plan §7): any content_id listed there with no failing check is
 * elevated to the `jury` tier. The sidecar is optional; absent, no item is jury.
 *
 * TIER LADDER: unverified < structural < provenance < facts < linguistic < jury
 * < human. `tier` is the highest rung all RELEVANT checks passed; a review_status
 * of "verified" is the human gate and maps straight to `human`.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { loadSubset, oracleView, voteFact, stripArticle, SUBSET_A, SUBSET_B } from "./verify-facts.mjs";
import { classifyVocabCefr } from "./verify-cefr.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FREQ = path.join(root, "scripts", "vendor", "german-frequency-subset.json");
const GRAMMAR_SIDECAR = path.join(root, "docs", "reports", "verify-grammar.json");
const JURY_SIDECAR = path.join(root, "docs", "reports", "jury-review.json");
const OUT = path.join(root, "src", "data", "verification.ts");

const CONFIDENCE = {
  unverified: 0.2,
  structural: 0.35,
  provenance: 0.5,
  facts: 0.65,
  linguistic: 0.8,
  jury: 0.9,
  human: 1.0,
};

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
    return {
      provenance: (await server.ssrLoadModule("/src/data/provenance.ts")).provenance,
      vocabulary: (await server.ssrLoadModule("/src/data/vocabulary.ts")).vocabulary,
    };
  } finally {
    await server.close();
  }
}

/** Facts verdict for a noun: "pass" | "flag" | "fail" | "na" (worst of article+plural). */
function factVerdict(v, subA, subB) {
  const lemma = stripArticle(v.de);
  const views = [oracleView("A", subA?.[lemma]), oracleView("B", subB?.[lemma])];
  const order = { pass: 0, flag: 1, fail: 2 };
  let worst = null;
  const fold = (verdict) => {
    let r;
    if (verdict === "verified2" || verdict === "verified1") r = "pass";
    else if (verdict === "review") r = "flag";
    else if (verdict === "gate") r = "fail";
    else return; // nocover -> ignore
    if (worst === null || order[r] > order[worst]) worst = r;
  };
  if (views.some((x) => x.articles)) fold(voteFact(views, "articles", v.article).verdict);
  if (v.plural && views.some((x) => x.plurals)) fold(voteFact(views, "plurals", stripArticle(v.plural)).verdict);
  return worst ?? "na";
}

async function main() {
  const { provenance, vocabulary } = await loadBanks();
  const subA = await loadSubset(SUBSET_A, "pnpm build:dict-subset");
  const subB = await loadSubset(SUBSET_B, "pnpm build:nouns-subset");
  const freq = JSON.parse(await readFile(FREQ, "utf8")).freq;

  let grammar;
  try {
    grammar = JSON.parse(await readFile(GRAMMAR_SIDECAR, "utf8"));
  } catch {
    console.error(
      `\n✖ Missing ${path.relative(root, GRAMMAR_SIDECAR)}. Run \`pnpm verify:grammar\` first ` +
        "(needs `pnpm build:languagetool`). Layer C's linguistic rung depends on it."
    );
    process.exitCode = 1;
    return;
  }
  const grammarChecked = new Set(grammar.checkedOwners ?? []);
  const grammarIssues = grammar.byOwner ?? {};

  // Optional AI-jury review pass (scale-up plan §7). Absent sidecar -> no jury items.
  let juryPass = new Set();
  let juryPromptVersion = "jury-1";
  try {
    const jury = JSON.parse(await readFile(JURY_SIDECAR, "utf8"));
    juryPass = new Set(jury.pass ?? []);
    if (jury.promptVersion) juryPromptVersion = jury.promptVersion;
  } catch {
    /* no jury sidecar yet */
  }

  const vocabById = new Map(vocabulary.map((v) => [v.id, v]));
  const D = new Date().toISOString().slice(0, 10); // sweep date (node script, not a Workflow)

  const records = [];
  const tierHist = {};
  for (const row of provenance) {
    const id = row.content_id;
    const checks = [
      { layer: "structural", tool: "lint-content", result: "pass" },
      { layer: "provenance", tool: "provenance-register", result: "pass" },
    ];

    // --- facts (vocabulary nouns only) ---
    let factsResult = "na";
    const v = vocabById.get(id);
    if (v && v.pos === "noun" && v.article) {
      factsResult = factVerdict(v, subA, subB);
      if (factsResult !== "na") {
        checks.push({
          layer: "facts",
          tool: "german-words-dict+german-nouns",
          result: factsResult,
          ...(factsResult !== "pass" ? { detail: `article/plural vs two oracles: ${factsResult}` } : {}),
        });
      }
    }

    // --- linguistic: grammar (sentences) + cefr (vocab) ---
    const wasGrammarChecked = grammarChecked.has(id);
    let grammarResult = "na";
    if (wasGrammarChecked) {
      const g = grammarIssues[id];
      grammarResult = g && g.grammar ? "flag" : "pass";
      checks.push({
        layer: "linguistic",
        tool: "languagetool-6.8",
        result: grammarResult,
        ...(grammarResult === "flag" ? { detail: `${g.grammar} grammar/agreement finding(s)` } : {}),
      });
    }
    let cefrResult = "na";
    if (v && v.cefr) {
      const c = classifyVocabCefr(v, freq);
      cefrResult = c === "flag" ? "flag" : "pass";
      if (c === "flag")
        checks.push({ layer: "linguistic", tool: "wordfreq-de+complexity", result: "flag", detail: "common word, advanced label" });
    }

    // --- tier ---
    let tier;
    if (row.review_status === "verified") {
      tier = "human";
    } else if (juryPass.has(id) && !checks.some((c) => c.result === "fail")) {
      // AI-jury review pass (docs/reports/jury-review.json): a holistic LLM read
      // of German correctness, above the automated linguistic rung, below human.
      checks.push({ layer: "jury", tool: "ai-jury", result: "pass", prompt_version: juryPromptVersion });
      tier = "jury";
    } else {
      const factsOk = factsResult === "na" || factsResult === "pass";
      const cefrOk = cefrResult !== "flag";
      const linguisticOk = wasGrammarChecked && grammarResult === "pass" && cefrOk && factsOk;
      if (linguisticOk) tier = "linguistic";
      else if (factsResult === "pass") tier = "facts";
      else tier = "provenance";
    }
    tierHist[tier] = (tierHist[tier] ?? 0) + 1;
    records.push({ id, tier, confidence: CONFIDENCE[tier], checks });
  }

  records.sort((a, b) => a.id.localeCompare(b.id));
  const lines = [];
  lines.push("// AUTO-GENERATED by scripts/build-verification.mjs — do not edit by hand.");
  lines.push("// The per-item machine-verification trust map (data-strategy Layer C, §4).");
  lines.push("// Regenerate with `pnpm build:verification` after re-running the verify:* checks.");
  lines.push('import type { Verification } from "@/types";');
  lines.push("");
  lines.push(`export const verificationGeneratedAt = ${JSON.stringify(D)};`);
  lines.push("const D = verificationGeneratedAt;");
  lines.push("");
  lines.push("export const verification: Record<string, Verification> = {");
  for (const r of records) {
    const checksJson = JSON.stringify(r.checks).replace(/"([a-z_]+)":/g, "$1:");
    lines.push(`  ${JSON.stringify(r.id)}: { tier: ${JSON.stringify(r.tier)}, confidence: ${r.confidence}, last_verified: D, checks: ${checksJson} },`);
  }
  lines.push("};");
  lines.push("");

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, lines.join("\n"), "utf8");

  const TIERS = ["human", "jury", "linguistic", "facts", "provenance", "structural", "unverified"];
  console.log(`Composed ${records.length} verification records -> ${path.relative(root, OUT)} (sweep ${D}).`);
  for (const t of TIERS) if (tierHist[t]) console.log(`  ${t.padEnd(12)} ${tierHist[t]}`);
}

main().catch((err) => {
  console.error("build-verification failed:", err?.message ?? err);
  process.exitCode = 1;
});
