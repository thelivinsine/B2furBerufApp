/**
 * Layer 2 fact check (data-strategy verification ladder, see
 * docs/strategy/DATA_STRATEGY.md §3): verify every noun's article (der/die/das)
 * and plural against TWO independent German morphology authorities, so word
 * facts are source-verified WITHOUT a native speaker checking each by hand.
 *
 *   pnpm verify:facts             # report + gate on two-oracle-confirmed errors
 *   pnpm verify:facts --report    # never exit non-zero (report only, no gate)
 *   pnpm verify:facts --dry       # load + count only, no lookup / no report file
 *
 * Two oracles, DIFFERENT lineages (the strategy's core thesis: a single lexicon
 * cannot gate; trust needs agreement across independent sources):
 *   A  german-words-dict  — LanguageTool morphology (Apache-2.0 / CC-BY-SA-4.0)
 *                           scripts/vendor/german-words-subset.json
 *   B  german-nouns       — German Wiktionary, ~100k nouns (CC-BY-SA-4.0)
 *                           scripts/vendor/german-nouns-subset.json
 * Build both with `pnpm build:oracles` (or the two `build:*-subset` scripts).
 *
 * Verdict per fact (article or plural), from how the two oracles vote:
 *   VERIFIED×2  — both oracles cover the fact and accept ours (strongest).
 *   VERIFIED×1  — exactly one oracle covers it and accepts ours.
 *   GATE        — BOTH oracles cover it DIRECTLY, both reject ours, AND they
 *                 agree on the same correction. Two independent authorities
 *                 concur we are wrong: a real, gate-able error. THIS fails CI.
 *   REVIEW      — a single oracle disagrees, or the two disagree with each other
 *                 (e.g. valid der/das variants). A signal for a human/third
 *                 source, never a proven bug — does not gate.
 *   PLURAL HEADWORD — plurale-tantum ("die Schmerzen"): its "die" is a plural
 *                 article, not a singular gender. Skipped.
 *   NOT COVERED — neither oracle lists the lemma (nor a compound head for it).
 *
 * Oracle B also supplies a compound HEAD-NOUN gender fallback ("der
 * Behördentermin" <- "der Termin"); a head-derived vote can VERIFY but is
 * excluded from GATE (heuristic, not a direct citation), so the gate stays
 * strict. A lexicon match verifies the FACT, not the sense/register/CEFR level
 * (those are higher rungs of the ladder).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBSET_A = path.join(root, "scripts", "vendor", "german-words-subset.json");
const SUBSET_B = path.join(root, "scripts", "vendor", "german-nouns-subset.json");
const REPORT = path.join(root, "docs", "reports", "verify-facts-report.md");
const DRY = process.argv.includes("--dry");
const REPORT_ONLY = process.argv.includes("--report");

const GENDER_TO_ARTICLE = { M: "der", F: "die", N: "das" };
const stripArticle = (s) => s.replace(/^(der|die|das)\s+/i, "").trim();

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

/** Load an oracle subset; returns null (with a warning) if missing. */
async function loadSubset(file, buildCmd) {
  try {
    return JSON.parse(await readFile(file, "utf8")).words;
  } catch {
    console.warn(`⚠ Missing ${path.relative(root, file)} — run \`${buildCmd}\`. Continuing without it.`);
    return null;
  }
}

/**
 * One oracle's view of a lemma, normalised to accepted-value ARRAYS.
 * `direct` is false for oracle-B compound-head fallbacks (heuristic, gate-excluded).
 */
function oracleView(name, entry) {
  if (!entry) return { name, articles: null, plurals: null, direct: false };
  if (name === "A") {
    const article = entry.G ? GENDER_TO_ARTICLE[entry.G] : null;
    return { name, articles: article ? [article] : null, plurals: entry.PLU ? [entry.PLU] : null, direct: true };
  }
  // Oracle B: articles/plurals are already arrays; viaHead marks a heuristic entry.
  return {
    name,
    articles: entry.G && entry.G.length ? entry.G : null,
    plurals: entry.PLU && entry.PLU.length ? entry.PLU : null,
    direct: !entry.viaHead,
  };
}

/**
 * Vote a single fact. `field` picks articles|plurals. Returns
 * { verdict, oursOk, correction } where verdict ∈ verified2|verified1|gate|review|nocover.
 */
function voteFact(views, field, ours) {
  const covering = views.filter((v) => v[field] !== null);
  if (covering.length === 0) return { verdict: "nocover" };
  const accepts = covering.filter((v) => v[field].includes(ours));
  const rejects = covering.filter((v) => !v[field].includes(ours));
  if (accepts.length >= 2) return { verdict: "verified2" };
  if (accepts.length === 1) return { verdict: "verified1" };
  // No oracle accepts ours. Gate only when ≥2 DIRECT oracles reject AND agree on a fix.
  const directRejects = rejects.filter((v) => v.direct);
  if (directRejects.length >= 2) {
    const inter = directRejects
      .map((v) => new Set(v[field]))
      .reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
    if (inter.size > 0) return { verdict: "gate", correction: [...inter].join(" / "), saw: oraclesSay(covering, field) };
  }
  return { verdict: "review", saw: oraclesSay(covering, field) };
}

const oraclesSay = (views, field) =>
  views.map((v) => `${v.name}:${v[field].join("|")}${v.direct ? "" : "~head"}`).join(", ");

async function main() {
  const vocabulary = await loadVocabulary();
  const nouns = vocabulary.filter((v) => v.pos === "noun" && v.article);
  console.log(`Vocabulary: ${vocabulary.length} entries -> ${nouns.length} nouns with an article to check.`);

  if (DRY) {
    const withPlural = nouns.filter((v) => v.plural).length;
    console.log(`--dry: ${nouns.length} nouns (${withPlural} carry a plural). No lookup, no report written.`);
    return;
  }

  const subA = await loadSubset(SUBSET_A, "pnpm build:dict-subset");
  const subB = await loadSubset(SUBSET_B, "pnpm build:nouns-subset");
  if (!subA && !subB) {
    console.error("\n✖ No oracle subsets available. Run `pnpm build:oracles`.");
    process.exitCode = 1;
    return;
  }

  const gate = [];          // { id, label, field, ours, correction, saw } — two-oracle-confirmed errors
  const review = [];        // { id, label, field, ours, saw }
  const pluralHeadwords = [];
  const notCovered = [];    // { id, label } — lemma absent from both oracles (gender uncomparable)
  const noPluralOracle = []; // { id, label } — covered for gender, but no oracle lists a plural
  let g2 = 0, g1 = 0, p2 = 0, p1 = 0;
  let coveredCount = 0;

  for (const v of nouns) {
    const lemma = stripArticle(v.de);
    const views = [oracleView("A", subA?.[lemma]), oracleView("B", subB?.[lemma])];
    const anyArticle = views.some((x) => x.articles);
    const anyPlural = views.some((x) => x.plurals);

    if (!anyArticle && !anyPlural) {
      notCovered.push({ id: v.id, label: v.de });
      continue;
    }
    coveredCount++;

    // Plurale-tantum: "die X", no asserted plural, and every covering oracle says
    // the singular gender is masc/neut (so our "die" is a plural article).
    const artUnion = new Set(views.flatMap((x) => x.articles ?? []));
    if (v.article === "die" && !v.plural && artUnion.size > 0 && !artUnion.has("die")) {
      pluralHeadwords.push({ id: v.id, label: v.de });
    } else if (anyArticle) {
      const r = voteFact(views, "articles", v.article);
      if (r.verdict === "verified2") g2++;
      else if (r.verdict === "verified1") g1++;
      else if (r.verdict === "gate") gate.push({ id: v.id, label: v.de, field: "article", ours: v.article, correction: r.correction, saw: r.saw });
      else if (r.verdict === "review") review.push({ id: v.id, label: v.de, field: "article", ours: v.article, saw: r.saw });
    }

    if (v.plural) {
      const ourPlural = stripArticle(v.plural);
      if (!anyPlural) {
        noPluralOracle.push({ id: v.id, label: v.de });
      } else {
        const r = voteFact(views, "plurals", ourPlural);
        if (r.verdict === "verified2") p2++;
        else if (r.verdict === "verified1") p1++;
        else if (r.verdict === "gate") gate.push({ id: v.id, label: v.de, field: "plural", ours: ourPlural, correction: r.correction, saw: r.saw });
        else if (r.verdict === "review") review.push({ id: v.id, label: v.de, field: "plural", ours: ourPlural, saw: r.saw });
      }
    }
  }

  const pct = (n) => ((n / nouns.length) * 100).toFixed(0);
  const lines = [];
  const p = (s = "") => lines.push(s);
  p("# Fact-check report — noun article & plural (data-strategy Layer 2)");
  p("");
  p("_Generated by `pnpm verify:facts`. TWO independent oracles vote on every fact:_");
  p("_**A** `german-words-dict` (LanguageTool morphology, Apache-2.0 / CC-BY-SA-4.0) ·_");
  p("_**B** `german-nouns` (German Wiktionary, ~100k nouns, CC-BY-SA-4.0, via PyPI)._");
  p("_A match verifies the fact against an authority; it does not verify sense, register, or CEFR");
  p("level (higher rungs of the ladder)._");
  p("");
  p("> **Two oracles, so agreement can gate.** The single-lexicon spike could only *flag* (its own");
  p("> errors produced false positives: it called `der Husten` neuter and preferred rarer plurals).");
  p("> A second, independently-compiled authority resolves those: it lists **both** genders of");
  p("> *der/das Rollout*, **both** *der/das Husten*, and all of *Risiko*'s plurals, so our forms are");
  p("> confirmed, not flagged. An error is now only reported when **both** oracles reject our form");
  p("> **and agree** on the correction — the `GATE` bucket, which fails the build. Everything else is");
  p("> a review signal, never a proven bug.");
  p("");
  p("## Summary");
  p("");
  p(`- Nouns checked: **${nouns.length}**`);
  p(`- Covered by ≥1 oracle: **${coveredCount}** (${pct(coveredCount)}%)  ·  not covered: **${nouns.length - coveredCount}**`);
  p(`- ✔ Article verified: **${g2 + g1}**  (${g2} by both oracles, ${g1} by one)`);
  p(`- ✔ Plural verified: **${p2 + p1}**  (${p2} by both oracles, ${p1} by one)`);
  p(`- ⛔ GATE — two-oracle-confirmed errors (build fails): **${gate.length}**`);
  p(`- ⚑ Review signals (one oracle only, or oracles disagree): **${review.length}**`);
  p(`- ◑ Plural-form headwords (gender not comparable): **${pluralHeadwords.length}**`);
  p(`- ~ We assert a plural, but no oracle lists one to compare: **${noPluralOracle.length}**`);
  p("");

  p("## ⛔ GATE — two independent authorities agree our form is wrong");
  p("");
  p("Both oracles cover the fact directly, both reject our value, and they agree on the same");
  p("correction. These are the only findings treated as **proven, fixable errors** — they fail CI.");
  p("");
  if (gate.length === 0) {
    p("_None. No fact is rejected by both oracles in agreement. The bank passes the two-oracle gate._");
  } else {
    p("| id | headword | field | ours | both oracles say | evidence |");
    p("|---|---|---|---|---|---|");
    for (const c of gate.sort((a, b) => a.field.localeCompare(b.field) || a.id.localeCompare(b.id)))
      p(`| \`${c.id}\` | ${c.label} | ${c.field} | ${c.ours} | **${c.correction}** | ${c.saw} |`);
  }
  p("");

  p("## ⚑ Review signals (NOT proven errors — one source only, or sources disagree)");
  p("");
  p("A single oracle differs, or the two oracles differ from each other (usually a valid variant, like");
  p("*der/das Rollout*). Corroborate against a third source or a human before changing content.");
  p("");
  if (review.length === 0) {
    p("_None._");
  } else {
    p("| id | headword | field | ours | oracles say |");
    p("|---|---|---|---|---|");
    for (const c of review.sort((a, b) => a.field.localeCompare(b.field) || a.id.localeCompare(b.id)))
      p(`| \`${c.id}\` | ${c.label} | ${c.field} | ${c.ours} | ${c.saw} |`);
  }
  p("");

  p("## ◑ Plural-form headwords (informational — skipped, gender not comparable)");
  p("");
  p("Used in the plural (\"die Schmerzen\"), so the \"die\" is a plural article, not a singular gender.");
  p("Auto-detected and skipped, not counted as errors.");
  p("");
  if (pluralHeadwords.length) {
    p("| id | headword |");
    p("|---|---|");
    for (const n of pluralHeadwords.sort((a, b) => a.id.localeCompare(b.id))) p(`| \`${n.id}\` | ${n.label} |`);
  } else {
    p("_None detected._");
  }
  p("");

  p("## ~ Not covered by either oracle (informational — no error)");
  p("");
  p("Neither lexicon lists the lemma and no known compound head matched. Almost all are rare domain");
  p("compounds or acronyms. Raising coverage further is a follow-up (a third source, or manual review).");
  p("");
  p("<details><summary>" + notCovered.length + " items</summary>");
  p("");
  p("| id | headword |");
  p("|---|---|");
  for (const n of notCovered.sort((a, b) => a.id.localeCompare(b.id)))
    p(`| \`${n.id}\` | ${n.label} |`);
  p("");
  p("</details>");
  p("");

  p("## ~ Plural asserted but no oracle plural to compare (informational — no error)");
  p("");
  p("Gender is covered; only the plural could not be checked (no oracle lists a plural form for the");
  p("lemma, or coverage came via the gender-only compound head fallback).");
  p("");
  p("<details><summary>" + noPluralOracle.length + " items</summary>");
  p("");
  p("| id | headword |");
  p("|---|---|");
  for (const n of noPluralOracle.sort((a, b) => a.id.localeCompare(b.id)))
    p(`| \`${n.id}\` | ${n.label} |`);
  p("");
  p("</details>");
  p("");

  await mkdir(path.dirname(REPORT), { recursive: true });
  await writeFile(REPORT, lines.join("\n"), "utf8");

  // Console summary.
  console.log("");
  console.log(`Coverage: ${coveredCount}/${nouns.length} (${pct(coveredCount)}%) by ≥1 oracle`);
  console.log(`✔ Article verified: ${g2 + g1} (${g2}×2, ${g1}×1)   ✔ Plural verified: ${p2 + p1} (${p2}×2, ${p1}×1)`);
  console.log(`◑ Plural-form headwords: ${pluralHeadwords.length}   ~ Not covered: ${notCovered.length}   ~ No oracle plural: ${noPluralOracle.length}`);
  console.log(`⚑ Review signals (not errors): ${review.length}`);
  if (gate.length) {
    console.log(`\n⛔ ${gate.length} GATE finding(s) — both oracles agree our form is wrong:`);
    for (const c of gate)
      console.log(`   ${c.id.padEnd(24)} ${c.field.padEnd(8)} ours="${c.ours}"  ->  "${c.correction}"   (${c.label})`);
  } else {
    console.log("\n✔ GATE: 0 two-oracle-confirmed errors. The bank passes the fact gate.");
  }
  console.log(`\nReport written to ${path.relative(root, REPORT)}`);
  console.log("Reminder: a lexicon match verifies the fact, not the sense/register/CEFR level.");

  if (gate.length && !REPORT_ONLY) {
    console.error(`\n✖ Failing: ${gate.length} two-oracle-confirmed fact error(s). Fix the content (or pass --report to bypass).`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("verify-facts crashed:", err?.message ?? err);
  process.exitCode = 1;
});
