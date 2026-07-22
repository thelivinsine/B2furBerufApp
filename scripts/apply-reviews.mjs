/**
 * The review loop-closer — `pnpm apply:reviews` (admin center chunk 2).
 *
 * Turns the founder's Supabase review DECISIONS into committed, stamped,
 * CI-gated `review_status: "verified"` flips in src/data/provenance.ts:
 *
 *   1. Fetch `provenance_reviews` rows with a decision and null `applied_at`
 *      (service-role key required; this is DEV TOOLING, never SPA code).
 *   2. Per approve row: map the id through ID_RENAMES, resolve the live
 *      content item, recompute its fingerprint (scripts/content-hash.mjs) and
 *      compare with the hash stored AT DECISION TIME. Mismatch or missing
 *      hash means the human did not see this exact content: the row goes to
 *      the re-review list, NEVER into a flip.
 *   3. Codemod provenance.ts (draft -> verified + verified_by/verified_date),
 *      then run `pnpm stamp:verified` and `pnpm lint:content` so the flip and
 *      the stamp land in the SAME commit.
 *   4. Reject / needs_fix rows export to docs/reports/review-defects.md/.json
 *      as the fix queue for an AI repair session.
 *   5. `applied_at`/`applied_sha` write-back is a RECONCILE pass: a row is
 *      marked applied only when the verified flip is visible in the COMMITTED
 *      repo (clean file at HEAD). The codemod run cannot know its own future
 *      commit sha, so it prints the follow-up: commit, then run
 *      `pnpm apply:reviews --mark-applied` (or let the next run reconcile).
 *
 * Modes:
 *   pnpm apply:reviews                 full run (reconcile + codemod + reports)
 *   pnpm apply:reviews --dry-run       classify + print only, write NOTHING
 *   pnpm apply:reviews --mark-applied  reconcile-only (after committing flips)
 *
 * Env: SUPABASE_SERVICE_ROLE_KEY (required), SUPABASE_URL (optional override;
 * defaults to the committed project URL). Never commit the key.
 *
 * Integrity rules (do not weaken): a stamp mismatch means re-review, never
 * re-stamp-to-silence; a null decision hash is never a free pass; rows whose
 * repo row is ALREADY verified are only ever marked applied (nothing is
 * flipped or laundered).
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { contentHash, buildContentIndex } from "./content-hash.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROVENANCE_PATH = path.join(root, "src", "data", "provenance.ts");
const DEFECTS_MD = path.join(root, "docs", "reports", "review-defects.md");
const DEFECTS_JSON = path.join(root, "docs", "reports", "review-defects.json");

// ---------------------------------------------------------------------------
// Pure helpers (exported for tests/applyReviews.test.ts)
// ---------------------------------------------------------------------------

/**
 * Classify one approve-decision row against the live repo.
 * Returns one of:
 *   "unknown_id"            id resolves to no provenance row / content item
 *   "already_verified"      repo row is verified already -> mark-applied only
 *   "legacy_no_hash"        no decision-time hash stored -> re-review
 *   "changed_since_review"  content hash differs from decision time -> re-review
 *   "apply"                 hash matches -> safe to flip
 */
export function classifyApproveRow({ repoRow, item, currentHash, decisionHash }) {
  if (!repoRow || !item) return "unknown_id";
  if (repoRow.review_status === "verified") return "already_verified";
  if (!decisionHash) return "legacy_no_hash";
  if (decisionHash !== currentHash) return "changed_since_review";
  return "apply";
}

/**
 * Flip one provenance row's review_status from "draft" to "verified" in the
 * provenance.ts SOURCE TEXT, inserting verified_by/verified_date after it
 * (the register's field order). Pure string transform; returns
 * { source, error } and never writes. The caller re-runs lint:content, which
 * re-parses the file, so a botched edit can never slip through silently.
 */
export function flipProvenanceSource(source, contentId, { verifiedBy, verifiedDate }) {
  const idNeedle = `content_id: ${JSON.stringify(contentId)}`;
  const idIdx = source.indexOf(idNeedle);
  if (idIdx === -1) return { source, error: `row not found for ${contentId}` };
  if (source.indexOf(idNeedle, idIdx + 1) !== -1)
    return { source, error: `content_id appears more than once: ${contentId}` };

  const nextRowIdx = source.indexOf("content_id:", idIdx + idNeedle.length);
  const blockEnd = nextRowIdx === -1 ? source.length : nextRowIdx;
  const block = source.slice(idIdx, blockEnd);

  const m = /review_status:\s*"(draft|verified)"(,?)/.exec(block);
  if (!m) return { source, error: `no review_status found in row ${contentId}` };
  if (m[1] === "verified") return { source, error: `row already verified: ${contentId}` };

  const replacement =
    `review_status: "verified",\n` +
    `    verified_by: ${JSON.stringify(verifiedBy)},\n` +
    `    verified_date: ${JSON.stringify(verifiedDate)}${m[2]}`;
  const at = idIdx + m.index;
  return {
    source: source.slice(0, at) + replacement + source.slice(at + m[0].length),
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Bank + register loading (vite ssr, same pattern as stamp-verified-hashes)
// ---------------------------------------------------------------------------

async function loadRepo() {
  const { createServer } = await import("vite");
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
    const [vocab, colloc, gram, dia, exams, rede, canDo, txts, miss, writing, prov, renames, cfg] =
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
        load("/src/lib/idRenames.ts"),
        load("/src/lib/supabaseConfig.ts"),
      ]);
    const index = buildContentIndex({
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
    });
    return {
      index,
      provenance: prov.provenance,
      resolveContentId: renames.resolveContentId,
      supabaseUrl: cfg.SUPABASE_URL,
    };
  } finally {
    await server.close();
  }
}

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function headSha() {
  return git(["rev-parse", "HEAD"]);
}

/** True when provenance.ts + the hash sidecar have no uncommitted changes. */
function registerIsClean() {
  const out = git([
    "status",
    "--porcelain",
    "--",
    "src/data/provenance.ts",
    "docs/reports/verified-hashes.json",
  ]);
  return out === "";
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function defectLine(row) {
  return {
    content_id: row.content_id,
    decision: row.decision,
    note: row.comment ?? null,
    reviewer: row.reviewer_email ?? null,
    decided_at: row.updated_at ?? null,
  };
}

function buildDefectsMarkdown({ generatedAt, registerRows, defects, rereview, labels }) {
  const lines = [];
  lines.push("# Review-Fehlerliste (aus den Founder-Entscheidungen)");
  lines.push("");
  lines.push(
    `_Generiert ${generatedAt} von \`pnpm apply:reviews\` gegen ${registerRows} Registerzeilen._`,
  );
  lines.push("");
  lines.push(
    "Abgelehnte (reject) und zu korrigierende (needs_fix) Inhalte aus der Founder-Review,",
  );
  lines.push(
    "plus Freigaben, die NICHT übernommen wurden, weil der Inhalt seit der Prüfung geändert",
  );
  lines.push(
    "wurde oder kein Prüf-Fingerprint vorliegt (erneut prüfen, niemals ungesehen übernehmen).",
  );
  lines.push("");
  lines.push("## Zu beheben (reject / needs_fix)");
  lines.push("");
  if (defects.length === 0) {
    lines.push("Keine offenen Fehler. 🎉");
  } else {
    lines.push("| content_id | Inhalt | Entscheidung | Notiz | Prüfer:in |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const d of defects) {
      lines.push(
        `| \`${d.content_id}\` | ${labels.get(d.content_id) ?? ""} | ${d.decision} | ${
          (d.note ?? "").replace(/\|/g, "\\|") || ""
        } | ${d.reviewer ?? ""} |`,
      );
    }
  }
  lines.push("");
  lines.push("## Erneut prüfen (Freigabe nicht übernommen)");
  lines.push("");
  if (rereview.length === 0) {
    lines.push("Keine.");
  } else {
    lines.push("| content_id | Inhalt | Grund |");
    lines.push("| --- | --- | --- |");
    for (const r of rereview) {
      lines.push(`| \`${r.content_id}\` | ${labels.get(r.content_id) ?? ""} | ${r.reason} |`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const REREVIEW_REASONS = {
  legacy_no_hash: "Kein Prüf-Fingerprint gespeichert (Alt-Entscheidung); bitte erneut freigeben.",
  changed_since_review: "Inhalt wurde nach der Prüfung geändert; bitte erneut freigeben.",
  unknown_id: "Kein lebender Inhalt zu dieser ID (Registerzeile oder Bank fehlt).",
};

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const markAppliedOnly = args.includes("--mark-applied");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error(
      "✖ SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
        "  This script is dev tooling: it needs the service-role key to read the\n" +
        "  founder's review decisions (the table is founder-RLS-locked).\n" +
        "  Get it from the Supabase dashboard (Project Settings -> API keys) and\n" +
        "  export it in the environment. NEVER commit it or ship it to the SPA.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("Loading content banks + provenance register (vite ssr)...");
  const repo = await loadRepo();
  const provenanceById = new Map(repo.provenance.map((r) => [r.content_id, r]));
  const labels = new Map(repo.provenance.map((r) => [r.content_id, r.label]));
  const supabaseUrl = process.env.SUPABASE_URL || repo.supabaseUrl;

  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: pending, error } = await db
    .from("provenance_reviews")
    .select("*")
    .not("decision", "is", null)
    .is("applied_at", null);
  if (error) {
    console.error(`✖ Could not fetch provenance_reviews: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`${pending.length} pending decision(s) fetched.`);

  const clean = registerIsClean();
  const sha = headSha();

  // Classify every pending decision.
  const buckets = {
    apply: [],
    already_verified: [],
    legacy_no_hash: [],
    changed_since_review: [],
    unknown_id: [],
    defects: [],
  };
  for (const row of pending) {
    if (row.decision !== "approve") {
      buckets.defects.push(row);
      continue;
    }
    const targetId = repo.resolveContentId(row.content_id);
    const repoRow = provenanceById.get(targetId);
    const item = repo.index.get(targetId);
    const currentHash = item ? contentHash(item) : null;
    const bucket = classifyApproveRow({
      repoRow,
      item,
      currentHash,
      decisionHash: row.content_hash,
    });
    buckets[bucket].push({ ...row, targetId });
  }

  const rereview = [
    ...buckets.legacy_no_hash.map((r) => ({ ...r, reason: REREVIEW_REASONS.legacy_no_hash })),
    ...buckets.changed_since_review.map((r) => ({
      ...r,
      reason: REREVIEW_REASONS.changed_since_review,
    })),
    ...buckets.unknown_id.map((r) => ({ ...r, reason: REREVIEW_REASONS.unknown_id })),
  ];

  console.log("");
  console.log("Classification:");
  console.log(`  ready to flip (hash matches):    ${buckets.apply.length}`);
  console.log(`  already verified in repo:        ${buckets.already_verified.length}`);
  console.log(`  re-review (no decision hash):    ${buckets.legacy_no_hash.length}`);
  console.log(`  re-review (content changed):     ${buckets.changed_since_review.length}`);
  console.log(`  unknown content id:              ${buckets.unknown_id.length}`);
  console.log(`  defects (reject / needs_fix):    ${buckets.defects.length}`);

  if (dryRun) {
    console.log("\n--dry-run: nothing written (no codemod, no DB write-back, no reports).");
    return;
  }

  // -------------------------------------------------------------------------
  // Reconcile: mark rows applied whose verified state is already committed.
  // Only against a clean register at HEAD, so applied_sha is honest.
  // -------------------------------------------------------------------------
  if (buckets.already_verified.length > 0) {
    if (!clean) {
      console.log(
        "\n⚠ Register has uncommitted changes; skipping applied_at write-back " +
          "(commit first, then run `pnpm apply:reviews --mark-applied`).",
      );
    } else {
      const now = new Date().toISOString();
      let marked = 0;
      for (const row of buckets.already_verified) {
        const { error: upErr } = await db
          .from("provenance_reviews")
          .update({ applied_at: now, applied_sha: sha })
          .eq("content_id", row.content_id)
          .is("applied_at", null);
        if (upErr) {
          console.error(`✖ write-back failed for ${row.content_id}: ${upErr.message}`);
          process.exitCode = 1;
        } else {
          marked += 1;
        }
      }
      console.log(`\nReconciled ${marked} decision(s) as applied (sha ${sha.slice(0, 10)}).`);
    }
  }

  // -------------------------------------------------------------------------
  // Codemod: flip the hash-matched approvals, then stamp + lint.
  // -------------------------------------------------------------------------
  if (!markAppliedOnly && buckets.apply.length > 0) {
    const verifiedDate = new Date().toISOString().slice(0, 10);
    let source = await readFile(PROVENANCE_PATH, "utf8");
    const flipped = [];
    for (const row of buckets.apply) {
      const res = flipProvenanceSource(source, row.targetId, {
        verifiedBy: row.reviewer_email || "founder",
        verifiedDate,
      });
      if (res.error) {
        console.error(`✖ codemod failed for ${row.targetId}: ${res.error}`);
        process.exitCode = 1;
      } else {
        source = res.source;
        flipped.push(row);
      }
    }
    if (flipped.length > 0) {
      await writeFile(PROVENANCE_PATH, source, "utf8");
      console.log(`\nFlipped ${flipped.length} row(s) to review_status: "verified".`);
      console.log("Running pnpm stamp:verified + pnpm lint:content (same-commit gate)...");
      try {
        execFileSync("pnpm", ["stamp:verified"], { cwd: root, stdio: "inherit" });
        execFileSync("pnpm", ["lint:content"], { cwd: root, stdio: "inherit" });
      } catch {
        console.error(
          "\n✖ stamp:verified / lint:content FAILED after the flip. Inspect the diff;\n" +
            "  do not commit until green. Revert with: git checkout -- src/data/provenance.ts docs/reports/verified-hashes.json",
        );
        process.exitCode = 1;
        return;
      }
      console.log("\nPR-body summary:");
      console.log("```");
      console.log(
        `apply:reviews: ${flipped.length} founder approval(s) applied to the register`,
      );
      for (const row of flipped)
        console.log(`- ${row.targetId} (${labels.get(row.targetId) ?? ""})`);
      console.log("```");
      console.log(
        "\nNEXT: commit the flip + stamp together, merge, then run\n" +
          "`pnpm apply:reviews --mark-applied` to write applied_at/applied_sha back\n" +
          "(the next full run also reconciles automatically).",
      );
    }
  } else if (!markAppliedOnly) {
    console.log("\nNo hash-matched approvals to flip.");
  }

  // -------------------------------------------------------------------------
  // Defect + re-review export (the fix queue for an AI repair session).
  // -------------------------------------------------------------------------
  if (!markAppliedOnly) {
    const generatedAt = new Date().toISOString();
    const defects = buckets.defects.map(defectLine);
    const rereviewOut = rereview.map((r) => ({
      content_id: r.content_id,
      reason: r.reason,
      decision: r.decision,
      note: r.comment ?? null,
      reviewer: r.reviewer_email ?? null,
    }));
    await mkdir(path.dirname(DEFECTS_MD), { recursive: true });
    await writeFile(
      DEFECTS_MD,
      buildDefectsMarkdown({
        generatedAt,
        registerRows: repo.provenance.length,
        defects,
        rereview: rereviewOut,
        labels,
      }),
      "utf8",
    );
    await writeFile(
      DEFECTS_JSON,
      `${JSON.stringify(
        { generatedAt, registerRows: repo.provenance.length, defects, rereview: rereviewOut },
        null,
        2,
      )}\n`,
      "utf8",
    );
    console.log(
      `\nDefect/re-review report -> ${path.relative(root, DEFECTS_MD)} (+ .json sidecar).`,
    );
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error("apply-reviews crashed:", err);
    process.exitCode = 1;
  });
}
