/**
 * Provenance reference URL checker (one-off / on-demand).
 *
 * Reads every `reference` URL in src/data/provenance.ts and checks that it
 * actually resolves, so the machine can attest to the "the link is live and
 * points at a real page" half of verification. It does NOT judge whether the
 * page is the *correct* sense / meaning — that stays a human job (the four-eyes
 * review). What it catches mechanically: dead links, wrong Wiktionary headwords
 * (404), missing Wikipedia articles (404), and unknown DWDS word entries.
 *
 *   pnpm check:refs            # check all references over the network
 *   pnpm check:refs --dry      # parse + group only, no network (CI-sandbox safe)
 *
 * NOTE: this must run where outbound HTTPS is allowed (a normal machine or a
 * GitHub Actions runner). A locked-down sandbox returns 403 host_not_allowed.
 *
 * Honesty note on DWDS corpus-search links (the redemittel references,
 * www.dwds.de/r?q=...): a corpus search always returns HTTP 200 whether or not
 * the phrase has hits, so a status check cannot validate them. They are reported
 * separately as "not auto-checkable (manual review)" and excluded from pass/fail.
 */
import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

/* Wikimedia requires a descriptive User-Agent with contact info, else 403. */
const UA = "genauly-ref-check/1.0 (https://genauly.de; provenance link audit)";
const CONCURRENCY = 5;
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

/* Decide how a URL is checked from its host + path. */
function classify(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { kind: "invalid" };
  }
  const host = u.hostname.replace(/^www\./, "");
  // DWDS corpus search: status is meaningless (always 200). Manual only.
  if (host === "dwds.de" && u.pathname.startsWith("/r")) return { kind: "manual", host };
  // DWDS word entry: 200 = entry exists; the page also shows a not-found notice.
  if (host === "dwds.de") return { kind: "status+body", host, notFound: ["Es wurde kein Eintrag gefunden", "Diese Seite gibt es nicht"] };
  // Wiktionary / Wikipedia / CoE: a missing page is a clean 404.
  if (host === "wiktionary.org" || host === "wikipedia.org" || host === "coe.int")
    return { kind: "status", host };
  return { kind: "status", host };
}

async function fetchWithRetry(url, wantBody) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": UA, "Accept-Language": "de" },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      // Back off on rate-limit / transient server errors.
      if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
      const body = wantBody && res.ok ? await res.text() : "";
      return { status: res.status, body };
    } catch (err) {
      clearTimeout(timer);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
      return { status: 0, body: "", error: err?.message ?? String(err) };
    }
  }
  return { status: 0, body: "", error: "exhausted retries" };
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
      await new Promise((r) => setTimeout(r, 120)); // be polite
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, lane));
  return results;
}

async function loadProvenance() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const mod = await server.ssrLoadModule("/src/data/provenance.ts");
    return mod.provenance;
  } finally {
    await server.close();
  }
}

async function main() {
  const provenance = await loadProvenance();

  // Unique URL -> { ids: [], info }
  const byUrl = new Map();
  for (const row of provenance) {
    const url = (row.reference ?? "").trim();
    if (!url) continue;
    if (!byUrl.has(url)) byUrl.set(url, { ids: [], info: classify(url) });
    byUrl.get(url).ids.push(row.content_id);
  }

  const entries = [...byUrl.entries()];
  const manual = entries.filter(([, v]) => v.info.kind === "manual");
  const invalid = entries.filter(([, v]) => v.info.kind === "invalid");
  const checkable = entries.filter(([, v]) => v.info.kind === "status" || v.info.kind === "status+body");

  // Group summary by host.
  const hostCount = {};
  for (const [, v] of entries) hostCount[v.info.host ?? "?"] = (hostCount[v.info.host ?? "?"] ?? 0) + 1;

  console.log(`Provenance references: ${provenance.length} rows -> ${byUrl.size} unique URLs`);
  for (const [h, c] of Object.entries(hostCount).sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(c).padStart(4)}  ${h}`);
  console.log(`\nCheckable (status): ${checkable.length}   Manual (DWDS corpus search): ${manual.length}   Invalid URL: ${invalid.length}`);

  if (DRY) {
    console.log("\n--dry: parsed and grouped only, no network requests made.");
    if (invalid.length) {
      console.log("\nInvalid URLs:");
      for (const [url, v] of invalid) console.log(`  ${url}  (${v.ids.length} rows)`);
    }
    return;
  }

  console.log(`\nChecking ${checkable.length} URLs over the network …\n`);
  const failed = [];
  await runPool(checkable, async ([url, v]) => {
    const wantBody = v.info.kind === "status+body";
    const { status, body, error } = await fetchWithRetry(url, wantBody);
    let ok = status >= 200 && status < 400;
    let reason = error ? `network error: ${error}` : `HTTP ${status}`;
    if (ok && wantBody && v.info.notFound?.some((m) => body.includes(m))) {
      ok = false;
      reason = "page loads but shows 'no entry found'";
    }
    if (!ok) failed.push({ url, reason, ids: v.ids });
    return ok;
  });

  if (invalid.length) {
    console.log(`⚠ ${invalid.length} malformed URL(s):`);
    for (const [url, v] of invalid) console.log(`  ${url}  →  ${v.ids.slice(0, 3).join(", ")}${v.ids.length > 3 ? ` +${v.ids.length - 3}` : ""}`);
  }

  if (failed.length === 0) {
    console.log(`✔ All ${checkable.length} checkable references resolve.`);
  } else {
    console.log(`✗ ${failed.length} reference(s) FAILED (fix the URL or the content id it points at):\n`);
    for (const f of failed.sort((a, b) => b.ids.length - a.ids.length)) {
      const sample = f.ids.slice(0, 4).join(", ") + (f.ids.length > 4 ? ` +${f.ids.length - 4} more` : "");
      console.log(`  [${f.reason}] ${f.url}`);
      console.log(`      affects ${f.ids.length} row(s): ${sample}`);
    }
  }

  console.log(`\nReminder: a live link confirms the page exists, not that it is the correct sense.`);
  console.log(`The ${manual.length} DWDS corpus-search links (redemittel) and content accuracy still need human review.`);

  if (failed.length > 0 || invalid.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Reference check crashed:", err);
  process.exitCode = 1;
});
