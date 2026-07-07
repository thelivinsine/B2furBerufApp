/**
 * Layer 3 grammar/spelling check (data-strategy verification ladder, see
 * docs/strategy/DATA_STRATEGY.md §3): run EVERY German sentence in the content
 * banks through a local, offline LanguageTool and bucket the findings into a
 * report a non-native founder can act on (LanguageTool cites the rule, so the
 * authority makes the call, not the reader).
 *
 *   pnpm build:languagetool   # once, to fetch + compile the LT toolchain
 *   pnpm verify:grammar       # run the check, write the report
 *   pnpm verify:grammar --dry # count sentences only, no LT run / no report
 *
 * Sentence sources (the ask): vocabulary examples, collocation example.de,
 * dialogue lines (+ option texts, model answers, prompts), reading-text bodies
 * (+ comprehension questions), and redemittel phrases + examples.
 *
 * WARN-ONLY BY DESIGN. LanguageTool false-positives on idiomatic B2 phrasing
 * and on domain proper nouns, so this is a scheduled REPORT, never a merge
 * gate (unlike Layer 2 facts). It always exits 0. Findings are grouped by
 * LanguageTool's own LocQualityIssueType (grammar / misspelling / typographical
 * / style / whitespace / other) so the actionable buckets (grammar, spelling)
 * sit at the top and the noisy ones below. IGNORE_RULES drops rules reviewed as
 * pure noise for curated learning copy.
 *
 * If the LT toolchain is not built, it prints how to build it and exits 0.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(root, "scripts", "vendor", "lt-lib");
const REPORT = path.join(root, "docs", "reports", "verify-grammar-report.md");
const SIDECAR = path.join(root, "docs", "reports", "verify-grammar.json");
const TMP = path.join(root, "scripts", "vendor", ".lt-tmp");
const DRY = process.argv.includes("--dry");

const RS = "\x1e";
const US = "\x1f";

// Rules reviewed as pure noise on curated learning copy. Keep this SMALL and
// justified — every entry suppresses a real LanguageTool signal.
const IGNORE_RULES = new Set([
  // Whitespace/paragraph artifacts from multi-paragraph reading-text bodies:
  // our texts use blank-line paragraph breaks, which LT flags as double spaces.
  "WHITESPACE_RULE",
  // Reading texts use illustrative dates with NO year ("Mittwoch, den 16."):
  // LanguageTool assumes the current year and flags a weekday/date mismatch that
  // does not exist in the undated content. A pure artifact, not a content error.
  "DE_DATE_WEEKDAY_CURRENTYEAR",
]);

// LocQualityIssueType -> bucket. Order here is the report order (actionable first).
const BUCKETS = [
  ["grammar", "Grammar & agreement"],
  ["misspelling", "Spelling"],
  ["typographical", "Punctuation & typography"],
  ["style", "Style & register"],
  ["duplication", "Duplication"],
  ["whitespace", "Whitespace"],
  ["uncategorized", "Other"],
];
const bucketOf = (issueType) => (BUCKETS.some(([k]) => k === issueType) ? issueType : "uncategorized");

async function ssr() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  const load = async (rel) => {
    try {
      return await server.ssrLoadModule(rel);
    } catch {
      return null;
    }
  };
  const banks = {
    vocabulary: (await load("/src/data/vocabulary.ts"))?.vocabulary ?? [],
    collocations: (await load("/src/data/collocations.ts"))?.collocations ?? [],
    dialogues: (await load("/src/data/dialogues.ts"))?.scenarios ?? [],
    texts: (await load("/src/data/texts.ts"))?.texts ?? [],
    redemittel: (await load("/src/data/redemittel.ts"))?.redemittel ?? [],
  };
  await server.close();
  return banks;
}

/**
 * Collect { id, owner, kind, text } sentences from all banks. `owner` is the
 * provenance content_id the sentence belongs to (vocab/collocation/redemittel id,
 * dialogue scenario id, or reading-text id — text checks ride on the text row),
 * so findings can be attributed to a registered item for the Layer C trust map.
 */
export function collectSentences(banks) {
  const out = [];
  const push = (id, owner, kind, text) => {
    if (typeof text !== "string") return;
    // Strip our wire delimiters (RS/US) from content before framing.
    // eslint-disable-next-line no-control-regex
    const t = text.replace(/[\x1e\x1f]/g, " ").trim();
    if (t.length >= 2) out.push({ id, owner, kind, text: t });
  };

  for (const v of banks.vocabulary) {
    (v.examples ?? []).forEach((ex, i) => push(`${v.id}#ex${i + 1}`, v.id, "vocab", ex?.de));
  }
  for (const c of banks.collocations) push(`${c.id}#ex`, c.id, "collocation", c.example?.de);
  for (const r of banks.redemittel) {
    push(`${r.id}#phrase`, r.id, "redemittel", r.de);
    push(`${r.id}#ex`, r.id, "redemittel", r.example?.de);
  }
  for (const d of banks.dialogues) {
    for (const n of Object.values(d.nodes ?? {})) {
      push(`${d.id}:${n.id}#line`, d.id, "dialogue", n.line);
      if (n.model) push(`${d.id}:${n.id}#model`, d.id, "dialogue", n.model);
      if (n.prompt) push(`${d.id}:${n.id}#prompt`, d.id, "dialogue", n.prompt);
      for (const o of n.options ?? []) push(`${d.id}:${n.id}:${o.id}#opt`, d.id, "dialogue", o.text);
    }
  }
  for (const tx of banks.texts) {
    push(`${tx.id}#body`, tx.id, "text", tx.de);
    for (const ch of tx.checks ?? []) push(`${ch.id}#q`, tx.id, "text", ch.question);
  }
  return out;
}

function runLanguageTool(sentences) {
  const inFile = path.join(TMP, "in.txt");
  const outFile = path.join(TMP, "out.txt");
  const payload = sentences.map((s) => `${s.id}${US}${s.text}`).join(RS);
  return (async () => {
    await mkdir(TMP, { recursive: true });
    await writeFile(inFile, payload, "utf8");
    const cp = `${path.join(LIB, "*")}${path.delimiter}${LIB}`;
    const r = spawnSync("java", ["-cp", cp, "LtCheck", inFile, outFile], {
      stdio: ["ignore", "inherit", "inherit"],
      maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error(`java LtCheck exited ${r.status}`);
    const raw = await readFile(outFile, "utf8");
    await rm(TMP, { recursive: true, force: true });
    return raw;
  })();
}

function parseFindings(raw) {
  const findings = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    const [id, ruleId, catId, issueType, fromPos, message, fragment, replacements] = line.split(US);
    if (IGNORE_RULES.has(ruleId)) continue;
    findings.push({ id, ruleId, catId, issueType, fromPos, message, fragment, replacements });
  }
  return findings;
}

function esc(s = "") {
  return s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

async function main() {
  console.log("Loading content banks …");
  const banks = await ssr();
  const sentences = collectSentences(banks);
  const byKind = sentences.reduce((m, s) => ((m[s.kind] = (m[s.kind] ?? 0) + 1), m), {});
  console.log(
    `Collected ${sentences.length} German sentences ` +
      `(${Object.entries(byKind).map(([k, n]) => `${k}:${n}`).join(", ")}).`
  );

  if (DRY) {
    console.log("--dry: no LanguageTool run, no report written.");
    return;
  }

  if (!existsSync(path.join(LIB, "LtCheck.class"))) {
    console.log(
      "\nLanguageTool toolchain not built. Run `pnpm build:languagetool` first " +
        "(needs `mvn` + JDK + network to Maven Central).\nLayer 3 is warn-only, so skipping is safe."
    );
    return;
  }

  console.log("Running LanguageTool (offline) over every sentence …");
  const raw = await runLanguageTool(sentences);
  const findings = parseFindings(raw);

  // Index by bucket.
  const idToKind = new Map(sentences.map((s) => [s.id, s.kind]));
  const buckets = new Map(BUCKETS.map(([k]) => [k, []]));
  const ruleTally = new Map();
  for (const f of findings) {
    const b = bucketOf(f.issueType);
    buckets.get(b).push(f);
    ruleTally.set(f.ruleId, (ruleTally.get(f.ruleId) ?? 0) + 1);
  }

  const flaggedSentences = new Set(findings.map((f) => f.id));
  const cleanPct = (((sentences.length - flaggedSentences.size) / sentences.length) * 100).toFixed(1);

  // ---- report ----
  const L = [];
  const p = (s = "") => L.push(s);
  p("# Grammar & spelling report — every German sentence (data-strategy Layer 3)");
  p("");
  p("_Generated by `pnpm verify:grammar`. Every German sentence in the content banks is run through");
  p(`a local, offline **LanguageTool 6.8** (\`GermanyGerman\`), the open-source German proofreader. Findings`);
  p("are grouped by LanguageTool's own issue type. A LanguageTool hit is a **signal, not a verdict**:");
  p("it false-positives on idiomatic B2 phrasing and on domain proper nouns, so this is a **warn-only");
  p("scheduled report, never a merge gate** (Layer 2 facts gate; Layer 3 does not). Each finding cites");
  p("its rule so it can be judged without native fluency._");
  p("");
  p("## Summary");
  p("");
  p(`- German sentences checked: **${sentences.length}**  (${Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(", ")})`);
  p(`- Sentences with at least one finding: **${flaggedSentences.size}**  ·  clean: **${cleanPct}%**`);
  p(`- Total findings (after ignore-list): **${findings.length}**`);
  p("");
  p("Findings by bucket:");
  p("");
  p("| bucket | count |");
  p("|---|---|");
  for (const [k, label] of BUCKETS) p(`| ${label} | ${buckets.get(k).length} |`);
  p("");
  p("Most-fired rules (top 15):");
  p("");
  p("| rule | count |");
  p("|---|---|");
  for (const [rule, n] of [...ruleTally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15))
    p(`| \`${rule}\` | ${n} |`);
  p("");

  for (const [k, label] of BUCKETS) {
    const rows = buckets.get(k);
    p(`## ${label} (${rows.length})`);
    p("");
    if (k === "misspelling") {
      p("_Many spelling hits are domain proper nouns, brand names, or valid compounds absent from");
      p("LanguageTool's dictionary. Scan for genuine typos; ignore the rest._");
      p("");
    }
    if (rows.length === 0) {
      p("_None._");
      p("");
      continue;
    }
    p("| id | kind | flagged | message | suggestions |");
    p("|---|---|---|---|---|");
    for (const f of rows.sort((a, b) => a.id.localeCompare(b.id)).slice(0, 400)) {
      const kind = idToKind.get(f.id) ?? "";
      p(`| \`${esc(f.id)}\` | ${kind} | ${esc(f.fragment) || "—"} | ${esc(f.message)} | ${esc(f.replacements) || "—"} |`);
    }
    if (rows.length > 400) p(`\n_…and ${rows.length - 400} more in this bucket (truncated)._`);
    p("");
  }

  p("## Method & caveats");
  p("");
  p("- **Tool:** LanguageTool 6.8 `language-de`, resolved from Maven Central and run fully offline");
  p("  (`scripts/build-languagetool.mjs`). The engine is ~69 MB, too large to vendor, so it is cached");
  p("  from an allowed host rather than committed (the Phase A pattern, at a size that forbids vendoring).");
  p("- **Warn-only:** LanguageTool over-flags idiomatic and domain German, so no build gate depends on");
  p("  this. It is a triage list for a human/jury pass (ladder Layers 4–5), not a pass/fail.");
  p(`- **Ignore-list:** ${[...IGNORE_RULES].map((r) => "`" + r + "`").join(", ") || "none"} (rules reviewed as pure noise for curated copy).`);
  p("- A clean sentence here is checked for grammar/spelling only, not for naturalness, register, or");
  p("  CEFR level (higher rungs of the ladder: the CEFR heuristic in `verify:cefr`, then the AI jury).");
  p("");

  await mkdir(path.dirname(REPORT), { recursive: true });
  await writeFile(REPORT, L.join("\n"), "utf8");

  // Structured sidecar for the Layer C trust map (scripts/build-verification.mjs):
  // per owning content_id, a tally of findings by issue type. `checkedOwners` is
  // every content_id that had at least one sentence checked, so the aggregator can
  // tell "grammar-clean" (checked, no grammar finding) from "not checked".
  const idToOwner = new Map(sentences.map((s) => [s.id, s.owner]));
  const checkedOwners = [...new Set(sentences.map((s) => s.owner))].sort();
  const byOwner = {};
  for (const f of findings) {
    const owner = idToOwner.get(f.id);
    if (!owner) continue;
    const bkt = bucketOf(f.issueType);
    byOwner[owner] ??= {};
    byOwner[owner][bkt] = (byOwner[owner][bkt] ?? 0) + 1;
  }
  await writeFile(
    SIDECAR,
    JSON.stringify({ tool: "languagetool-6.8", checkedOwners, byOwner }, null, 0) + "\n",
    "utf8"
  );

  console.log("");
  console.log(`Findings: ${findings.length} across ${flaggedSentences.size} sentences (${cleanPct}% clean).`);
  for (const [k, label] of BUCKETS) console.log(`  ${label.padEnd(26)} ${buckets.get(k).length}`);
  console.log(`\nReport written to ${path.relative(root, REPORT)}`);
  console.log("Reminder: LanguageTool hits are signals, not verdicts — warn-only by design.");
}

main().catch((err) => {
  console.error("verify-grammar failed:", err?.message ?? err);
  process.exitCode = 1;
});
