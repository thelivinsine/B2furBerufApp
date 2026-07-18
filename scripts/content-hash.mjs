/**
 * Content fingerprinting for the human-verification gate (data governance).
 *
 * A `review_status: "verified"` row in src/data/provenance.ts means a human
 * checked THAT exact content. Nothing used to tie the stamp to the text that
 * was reviewed: a later edit kept the item "verified" without any human having
 * seen the new wording. These helpers close that loophole. At verification
 * time `pnpm stamp:verified` records a fingerprint of each verified item in
 * the sidecar `docs/reports/verified-hashes.json`; `pnpm lint:content` then
 * fails when a verified item's current content no longer matches its stamp.
 *
 * The hash is a canonical-JSON sha256 (first 16 hex chars): object keys are
 * sorted recursively so formatting, comments and key order never matter, only
 * the actual content values. Shared by lint-content.mjs and
 * stamp-verified-hashes.mjs — keep both on this one implementation.
 */
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const HASH_ALGORITHM = "sha256/canonical-json/16";
export const HASH_SIDECAR = path.join(root, "docs", "reports", "verified-hashes.json");

/** JSON.stringify with recursively sorted object keys (arrays keep order). */
export function canonicalStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
  const keys = Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(value[k])}`).join(",")}}`;
}

/** Stable fingerprint of a content item (16 hex chars). */
export function contentHash(item) {
  return createHash("sha256").update(canonicalStringify(item), "utf8").digest("hex").slice(0, 16);
}

/**
 * Build the content_id -> item map the fingerprint gate hashes against.
 * One place so the linter and the stamp script can never disagree about what
 * "the item" is. Mirrors the id universe of the provenance register: grammar
 * drills get their own entry (they have their own provenance rows) AND ride
 * inside their topic; writing prompts use the wp_<themeId> pseudo-id.
 */
export function buildContentIndex(data) {
  const index = new Map();
  const put = (id, item) => {
    if (typeof id === "string" && id) index.set(id, item);
  };
  for (const v of data.vocabulary ?? []) put(v.id, v);
  for (const c of data.collocations ?? []) put(c.id, c);
  for (const t of data.grammar ?? []) {
    put(t.id, t);
    for (const d of t.drills ?? []) put(d.id, d);
  }
  for (const s of data.scenarios ?? []) put(s.id, s);
  for (const e of data.examSets ?? []) put(e.id, e);
  for (const r of data.redemittel ?? []) put(r.id, r);
  for (const c of data.canDoStatements ?? []) put(c.id, c);
  for (const t of data.texts ?? []) put(t.id, t);
  for (const m of data.missions ?? []) put(m.id, m);
  for (const [themeId, prompt] of Object.entries(data.writingPrompts ?? {}))
    put(`wp_${themeId}`, prompt);
  return index;
}
