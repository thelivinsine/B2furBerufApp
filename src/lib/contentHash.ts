/**
 * Browser-side content fingerprinting for the review loop (admin center
 * chunk 2). MUST stay byte-for-byte compatible with the node implementation
 * in `scripts/content-hash.mjs`: the AdminWorkbench computes a hash at
 * DECISION time with this module, and `pnpm apply:reviews` recomputes it from
 * the live banks with the script module before flipping a provenance row to
 * "verified". If the two canonicalizations ever diverge, every decision would
 * be flagged "content changed since review" (fail-closed, but useless).
 * `tests/contentHash.test.ts` pins the parity on fixture rows; change both
 * files together or neither.
 *
 * The hash is a canonical-JSON sha256, first 16 hex chars: object keys are
 * sorted recursively (arrays keep order) and `undefined` fields are dropped,
 * so formatting and key order never matter, only content values.
 */

export const HASH_ALGORITHM = "sha256/canonical-json/16";

/** JSON.stringify with recursively sorted object keys (arrays keep order). */
export function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) as string;
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`).join(",")}}`;
}

/**
 * Stable fingerprint of a content item (16 hex chars). Async because the
 * browser only exposes sha256 through SubtleCrypto. Throws when no
 * SubtleCrypto is available (non-secure context); callers that must not
 * fail treat that as "no hash", which the apply script reads as
 * "needs re-review", never as a pass.
 */
export async function contentHash(item: unknown): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("SubtleCrypto unavailable: cannot fingerprint content");
  const bytes = new TextEncoder().encode(canonicalStringify(item));
  const digest = await subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

interface WithId {
  id?: string;
}
interface GrammarLike extends WithId {
  drills?: WithId[];
}

/** The bank slices whose items carry provenance rows. All optional so partial
 *  fixtures work in tests. */
export interface ContentBankData {
  vocabulary?: WithId[];
  collocations?: WithId[];
  grammar?: GrammarLike[];
  scenarios?: WithId[];
  examSets?: WithId[];
  redemittel?: WithId[];
  canDoStatements?: WithId[];
  texts?: WithId[];
  missions?: WithId[];
  writingPrompts?: Record<string, unknown>;
}

/**
 * Build the content_id -> item map the fingerprint gate hashes against.
 * Mirrors `buildContentIndex` in `scripts/content-hash.mjs` (same id
 * universe: grammar drills get their own entry AND ride inside their topic;
 * writing prompts use the wp_<themeId> pseudo-id). Pinned by the parity test.
 */
export function buildContentIndex(data: ContentBankData): Map<string, unknown> {
  const index = new Map<string, unknown>();
  const put = (id: unknown, item: unknown) => {
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
