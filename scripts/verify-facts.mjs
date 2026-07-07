/**
 * Layer 2 fact check (data-strategy verification ladder, see
 * docs/strategy/DATA_STRATEGY.md §3): verify every noun's article (der/die/das)
 * and plural against an authoritative German morphology lexicon, so the word
 * facts are source-verified WITHOUT a native speaker checking each by hand.
 *
 *   pnpm verify:facts          # full report over the vocabulary bank
 *   pnpm verify:facts --dry    # load + count only, no comparison / no report file
 *
 * The oracle is scripts/vendor/german-words-subset.json, built by
 * `pnpm build:dict-subset` from german-words-dict (Apache-2.0, derived from
 * LanguageTool's german-pos-dict, CC-BY-SA-4.0). Run that first if it is missing.
 *
 * Conservative by design (never cry wolf). A single lexicon is NOT ground
 * truth: the first spike run proved it (it mislabels "der Husten" as neuter and
 * lists rarer plural variants), so a lone disagreement is a REVIEW SIGNAL, not a
 * proven content bug. Buckets:
 *   DISAGREEMENT (review) — our data and the lexicon differ on gender/plural.
 *                           Could be our error, a lexicon error, or a valid
 *                           variant. Needs a second source or human eyes.
 *   PLURAL HEADWORD (info) — the entry is a plurale-tantum / plural-form headword
 *                           ("die Schmerzen"), so its "die" is a plural article
 *                           and is not comparable to a singular gender. Skipped.
 *   NOT COVERED  (info)    — lemma absent from the lexicon (mostly compounds) or
 *                           the lexicon has no plural to compare.
 *   VERIFIED     (pass)    — article (and plural, when present) match.
 *
 * SPIKE STATUS: this is a report, not a CI gate. It exits non-zero only if it
 * cannot load its inputs. The spike's own finding is that a single-source gate
 * would be unsafe (high false-positive rate); a second oracle (Wiktionary, once
 * network access allows) must agree before any disagreement is treated as a
 * fixable error. See docs/reports/verify-facts-report.md.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBSET = path.join(root, "scripts", "vendor", "german-words-subset.json");
const REPORT = path.join(root, "docs", "reports", "verify-facts-report.md");
const DRY = process.argv.includes("--dry");

const GENDER_TO_ARTICLE = { M: "der", F: "die", N: "das" };

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

/** "die Besprechung" -> "Besprechung"; "die Besprechungen" -> "Besprechungen". */
const stripArticle = (s) => s.replace(/^(der|die|das)\s+/i, "").trim();

async function main() {
  const vocabulary = await loadVocabulary();
  const nouns = vocabulary.filter((v) => v.pos === "noun" && v.article);
  console.log(`Vocabulary: ${vocabulary.length} entries -> ${nouns.length} nouns with an article to check.`);

  if (DRY) {
    const withPlural = nouns.filter((v) => v.plural).length;
    console.log(`--dry: ${nouns.length} nouns (${withPlural} carry a plural). No lexicon lookup, no report written.`);
    return;
  }

  let subset;
  try {
    subset = JSON.parse(await readFile(SUBSET, "utf8")).words;
  } catch {
    console.error(`\n✖ Missing ${path.relative(root, SUBSET)}. Run \`pnpm build:dict-subset\` first.`);
    process.exitCode = 1;
    return;
  }

  const disagreements = [];  // { id, label, kind, ours, lexicon }
  const pluralHeadwords = []; // { id, label } — plurale-tantum, gender not comparable
  const notCovered = [];     // { id, label, reason }
  let verifiedGender = 0;
  let verifiedPlural = 0;

  for (const v of nouns) {
    const lemma = stripArticle(v.de);
    const entry = subset[lemma];
    if (!entry) {
      notCovered.push({ id: v.id, label: v.de, reason: "lemma not in lexicon (likely a compound)" });
      continue;
    }

    const expectArticle = entry.G ? GENDER_TO_ARTICLE[entry.G] : null;
    // Plural-form headword heuristic: "die X", no singular `plural` field, and
    // the lexicon's singular gender is masculine/neuter -> the "die" is a plural
    // article (die Schmerzen / die Schulden / die Bedenken), not a gender claim.
    const looksPlural = v.article === "die" && !v.plural && expectArticle && expectArticle !== "die";
    if (looksPlural) {
      pluralHeadwords.push({ id: v.id, label: v.de });
      continue;
    }

    // Gender / article.
    if (!expectArticle) {
      notCovered.push({ id: v.id, label: v.de, reason: "lexicon entry has no gender" });
    } else if (expectArticle !== v.article) {
      disagreements.push({ id: v.id, label: v.de, kind: "article", ours: v.article, lexicon: `${expectArticle} (${entry.G})` });
    } else {
      verifiedGender++;
    }

    // Plural (only when we actually assert one).
    if (v.plural) {
      const ourPlural = stripArticle(v.plural);
      if (!entry.PLU) {
        notCovered.push({ id: v.id, label: v.de, reason: "we assert a plural; lexicon has none to compare" });
      } else if (entry.PLU !== ourPlural) {
        disagreements.push({ id: v.id, label: v.de, kind: "plural", ours: ourPlural, lexicon: entry.PLU });
      } else {
        verifiedPlural++;
      }
    }
  }

  const notInLexicon = notCovered.filter((n) => n.reason.startsWith("lemma not")).length;
  const covered = nouns.length - notInLexicon;
  const lines = [];
  const p = (s = "") => lines.push(s);
  p("# Fact-check report — noun article & plural (data-strategy Layer 2 spike)");
  p("");
  p("_Generated by `pnpm verify:facts`. Oracle: `german-words-dict` (Apache-2.0, derived from");
  p("LanguageTool's `german-pos-dict`, CC-BY-SA-4.0). A match verifies the fact against an authority;");
  p("it does not verify sense, register, or CEFR level (higher rungs of the ladder)._");
  p("");
  p("> **Spike finding — a single lexicon cannot gate.** Hand-checking the first run's disagreements");
  p("> found ~0 genuine content errors: the lexicon itself mislabels `der Husten` as neuter and lists");
  p("> rarer plural variants (`Risikos`, `Visen`) where our forms are the standard ones. So a");
  p("> disagreement below is a **review signal**, not a proven bug. This validates the strategy's core");
  p("> thesis: trust needs **agreement across independent sources**. A second oracle (Wiktionary, once");
  p("> network access allows) must agree before a disagreement becomes a fixable error and this becomes");
  p("> a CI gate.");
  p("");
  p("## Summary");
  p("");
  p(`- Nouns checked: **${nouns.length}**`);
  p(`- Covered by the lexicon: **${covered}** (${((covered / nouns.length) * 100).toFixed(0)}%)`);
  p(`- ✔ Article matches: **${verifiedGender}**  ·  ✔ Plural matches: **${verifiedPlural}**`);
  p(`- ⚑ Disagreements (review, not proven errors): **${disagreements.length}**`);
  p(`- ◑ Plural-form headwords (gender not comparable): **${pluralHeadwords.length}**`);
  p(`- ~ Not covered / not comparable (mostly compounds): **${notCovered.length}**`);
  p("");

  p("## ⚑ Disagreements (review against a second source before changing content)");
  p("");
  if (disagreements.length === 0) {
    p("_None. Every lexicon-covered noun matched._");
  } else {
    p("| id | headword | field | ours | lexicon says |");
    p("|---|---|---|---|---|");
    for (const c of disagreements.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)))
      p(`| \`${c.id}\` | ${c.label} | ${c.kind} | ${c.ours} | ${c.lexicon} |`);
  }
  p("");

  p("## Plural-form headwords (informational — skipped, gender not comparable)");
  p("");
  p("These headwords are used in the plural (\"die Schmerzen\"), so the \"die\" is a plural article and");
  p("cannot be compared to a singular gender. Detected and skipped, not counted as disagreements.");
  p("");
  if (pluralHeadwords.length) {
    p("| id | headword |");
    p("|---|---|");
    for (const n of pluralHeadwords.sort((a, b) => a.id.localeCompare(b.id))) p(`| \`${n.id}\` | ${n.label} |`);
  } else {
    p("_None detected._");
  }
  p("");

  p("## ~ Not covered / not comparable (informational — no error)");
  p("");
  p("Mostly domain compounds absent from the base morphological lexicon. Raising coverage (a compound");
  p("head-noun gender rule, or the Wiktionary route once network access allows) is a follow-up.");
  p("");
  p("<details><summary>" + notCovered.length + " items</summary>");
  p("");
  p("| id | headword | reason |");
  p("|---|---|---|");
  for (const n of notCovered.sort((a, b) => a.id.localeCompare(b.id)))
    p(`| \`${n.id}\` | ${n.label} | ${n.reason} |`);
  p("");
  p("</details>");
  p("");

  await mkdir(path.dirname(REPORT), { recursive: true });
  await writeFile(REPORT, lines.join("\n"), "utf8");

  // Console summary.
  console.log("");
  console.log(`✔ Article matches: ${verifiedGender}   ✔ Plural matches: ${verifiedPlural}`);
  console.log(`◑ Plural-form headwords (skipped): ${pluralHeadwords.length}`);
  console.log(`~ Not covered/comparable: ${notCovered.length}   (coverage ${((covered / nouns.length) * 100).toFixed(0)}%)`);
  if (disagreements.length) {
    console.log(`\n⚑ ${disagreements.length} disagreement(s) to review (NOT proven errors — a single lexicon has its own mistakes):`);
    for (const c of disagreements.slice(0, 25))
      console.log(`   ${c.id.padEnd(22)} ${c.kind.padEnd(8)} ours="${c.ours}"  lexicon="${c.lexicon}"  (${c.label})`);
    if (disagreements.length > 25) console.log(`   … and ${disagreements.length - 25} more in the report`);
  } else {
    console.log("\n✔ No disagreements among lexicon-covered nouns.");
  }
  console.log(`\nReport written to ${path.relative(root, REPORT)}`);
  console.log("Reminder: a lexicon match verifies the fact, not the sense/register/CEFR level.");
  // Report tool, not a gate: only input-load failure sets a non-zero exit.
}

main().catch((err) => {
  console.error("verify-facts crashed:", err?.message ?? err);
  process.exitCode = 1;
});
