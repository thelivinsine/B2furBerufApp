/**
 * Review queue: a read-only dump of provenance rows grouped by bank, then by
 * the bank's most useful axis (sector for vocabulary/collocation/text, category
 * for redemittel, group for grammar, theme for everything else), for offline
 * founder/reviewer passes. Flips nothing: `review_status` is edited by hand in
 * `src/data/provenance.ts` after a row is checked against its `reference`.
 *
 *   pnpm review:queue                       # full draft queue -> report + console summary
 *   pnpm review:queue --type=vocabulary      # scope to one or more content types (comma list)
 *   pnpm review:queue --sector=it,engineering
 *   pnpm review:queue --group=meetings       # theme id / redemittel category / grammar group / chapter
 *   pnpm review:queue --status=verified      # inspect what's already verified instead of draft
 *   pnpm review:queue --dry                  # console summary only, no report file written
 *
 * The headline summary (total rows, verified %) always covers the WHOLE
 * register, regardless of --type/--sector/--group; those flags only scope the
 * detailed listing, so a review session can target one wave's content without
 * losing sight of the overall trust metric (BIBLIOTHEK_SCALEUP_PLAN.md §7.6).
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { writeReportSidecar } from "./report-sidecar.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = path.join(root, "docs", "reports", "review-queue.md");

function arg(name, fallback) {
  const pref = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : fallback;
}
function listArg(name) {
  const v = arg(name, "");
  return v ? new Set(v.split(",").map((s) => s.trim()).filter(Boolean)) : null;
}
const DRY = process.argv.includes("--dry");
const STATUS = arg("status", "draft");
const TYPE_FILTER = listArg("type");
const SECTOR_FILTER = listArg("sector");
const GROUP_FILTER = listArg("group");

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
    const [vocab, colloc, gram, dia, exams, rede, writing, prov, canDo, txts, miss] = await Promise.all([
      load("/src/data/vocabulary.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/dialogues.ts"),
      load("/src/data/examSets.ts"),
      load("/src/data/redemittel.ts"),
      load("/src/data/writingPrompts.ts"),
      load("/src/data/provenance.ts"),
      load("/src/data/canDo.ts"),
      load("/src/data/texts.ts"),
      load("/src/data/missions.ts"),
    ]);
    return {
      vocabulary: vocab.vocabulary,
      collocations: colloc.collocations,
      grammar: gram.grammar,
      scenarios: dia.scenarios,
      examSets: exams.examSets,
      redemittel: rede.redemittel,
      writingPrompts: writing.writingPrompts,
      provenance: prov.provenance,
      canDoStatements: canDo.canDoStatements,
      texts: txts.texts,
      missions: miss.missions,
    };
  } finally {
    await server.close();
  }
}

/** content_id -> { group, sector? } — the axis each bank groups by for review. */
function buildIndex(data) {
  const idx = new Map();
  const put = (id, group, sector) => idx.set(id, { group, sector });

  for (const v of data.vocabulary) put(v.id, v.sector ?? v.themeId ?? "?", v.sector);
  for (const c of data.collocations) put(c.id, c.sector ?? c.themeId ?? "?", c.sector);
  for (const t of data.texts) put(t.id, t.sector ?? t.themeId ?? "?", t.sector);
  for (const r of data.redemittel) put(r.id, r.category ?? "?");
  for (const g of data.grammar) {
    put(g.id, g.group ?? "?");
    for (const d of g.drills ?? []) put(d.id, g.group ?? "?");
  }
  for (const cd of data.canDoStatements) put(cd.id, cd.themeId ?? "?");
  for (const s of data.scenarios) put(s.id, s.themeId ?? "?");
  for (const e of data.examSets) put(e.id, e.themeId ?? "?");
  for (const w of Object.values(data.writingPrompts)) put(w.id, w.themeId ?? "?");
  for (const m of data.missions) put(m.id, m.chapter ?? "?");

  return idx;
}

function matchesFilters(row, info) {
  if (TYPE_FILTER && !TYPE_FILTER.has(row.content_type)) return false;
  if (SECTOR_FILTER && !(info?.sector && SECTOR_FILTER.has(info.sector))) return false;
  if (GROUP_FILTER && !(info?.group && GROUP_FILTER.has(info.group))) return false;
  return true;
}

async function main() {
  const data = await loadBanks();
  const idx = buildIndex(data);

  const total = data.provenance.length;
  const verified = data.provenance.filter((r) => r.review_status === "verified").length;
  const draft = total - verified;

  // Whole-register breakdown by content_type (headline metric, ignores filters).
  const byType = new Map();
  for (const r of data.provenance) {
    const t = byType.get(r.content_type) ?? { total: 0, verified: 0 };
    t.total++;
    if (r.review_status === "verified") t.verified++;
    byType.set(r.content_type, t);
  }

  // Scoped queue: rows matching --status/--type/--sector/--group.
  const wantStatus = (r) => STATUS === "all" || r.review_status === STATUS;
  const queue = data.provenance.filter((r) => wantStatus(r) && matchesFilters(r, idx.get(r.content_id)));

  // Group the queue: content_type -> group -> rows.
  const grouped = new Map();
  for (const r of queue) {
    const info = idx.get(r.content_id);
    const group = info?.group ?? "?";
    if (!grouped.has(r.content_type)) grouped.set(r.content_type, new Map());
    const byGroup = grouped.get(r.content_type);
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push({ ...r, group });
  }

  // Sector rollup across the three sector-bearing banks (vocabulary/collocation/text).
  const sectorTotals = new Map();
  for (const r of data.provenance) {
    if (!wantStatus(r)) continue;
    const info = idx.get(r.content_id);
    if (!info?.sector) continue;
    sectorTotals.set(info.sector, (sectorTotals.get(info.sector) ?? 0) + 1);
  }

  console.log(`Provenance register: ${total} rows  ·  verified ${verified} (${((verified / total) * 100).toFixed(1)}%)  ·  draft ${draft}`);
  console.log("\nBy content type (whole register):");
  for (const [t, c] of [...byType.entries()].sort((a, b) => b[1].total - a[1].total))
    console.log(`  ${t.padEnd(14)} ${String(c.total).padStart(5)} total   ${String(c.verified).padStart(5)} verified (${((c.verified / c.total) * 100).toFixed(0)}%)`);

  console.log(`\nQueue (status=${STATUS}${TYPE_FILTER ? `, type=${[...TYPE_FILTER].join(",")}` : ""}${SECTOR_FILTER ? `, sector=${[...SECTOR_FILTER].join(",")}` : ""}${GROUP_FILTER ? `, group=${[...GROUP_FILTER].join(",")}` : ""}): ${queue.length} rows`);

  if (DRY) {
    console.log("\n--dry: no report file written.");
    return;
  }

  const L = [];
  const p = (s = "") => L.push(s);
  p("# Content review queue");
  p("");
  p(`_Generated by \`pnpm review:queue\`. Read-only dump for offline review; flip \`review_status\``);
  p(`\`"draft"\` -> \`"verified"\` by hand in \`src/data/provenance.ts\` once a row is checked against`);
  p(`its \`reference\` (and, for facts, cross-checked with \`pnpm verify:facts\`). See`);
  p("`docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md` §7.6 — rising verified % is the quality headline._");
  p("");
  p("## Summary (whole register, ignores any filters below)");
  p("");
  p(`- Total provenance rows: **${total}**`);
  p(`- Verified: **${verified}** (${((verified / total) * 100).toFixed(1)}%)  ·  Draft: **${draft}**`);
  p("");
  p("| content type | total | verified | verified % |");
  p("|---|---|---|---|");
  for (const [t, c] of [...byType.entries()].sort((a, b) => b[1].total - a[1].total))
    p(`| ${t} | ${c.total} | ${c.verified} | ${((c.verified / c.total) * 100).toFixed(0)}% |`);
  p("");
  if (sectorTotals.size) {
    p(`## Branche (sector) rollup — whole register, status=${STATUS}`);
    p("");
    p("| sector | rows |");
    p("|---|---|");
    for (const [s, c] of [...sectorTotals.entries()].sort((a, b) => b[1] - a[1])) p(`| ${s} | ${c} |`);
    p("");
  }

  p(`## Queue — status=${STATUS}${TYPE_FILTER ? `, type=${[...TYPE_FILTER].join(",")}` : ""}${SECTOR_FILTER ? `, sector=${[...SECTOR_FILTER].join(",")}` : ""}${GROUP_FILTER ? `, group=${[...GROUP_FILTER].join(",")}` : ""} (${queue.length} rows)`);
  p("");

  for (const [type, byGroup] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const typeTotal = [...byGroup.values()].reduce((n, rows) => n + rows.length, 0);
    p(`### ${type} (${typeTotal})`);
    p("");
    for (const [group, rows] of [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      p(`<details><summary>${group} — ${rows.length}</summary>`);
      p("");
      p("| id | label | origin | reference |");
      p("|---|---|---|---|");
      for (const r of rows.sort((a, b) => a.content_id.localeCompare(b.content_id)))
        p(`| \`${r.content_id}\` | ${r.label.replace(/\|/g, "\\|")} | ${r.origin} | ${r.reference ? `[link](${r.reference})` : "_missing_"} |`);
      p("");
      p("</details>");
      p("");
    }
  }

  await mkdir(path.dirname(REPORT), { recursive: true });
  await writeFile(REPORT, L.join("\n"), "utf8");
  await writeReportSidecar(REPORT, { registerRows: total, verified, draft });
  console.log(`\nReport written to ${path.relative(root, REPORT)}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("review-queue failed:", err?.message ?? err);
    process.exitCode = 1;
  });
}
