// Parsing Anthropic's Cost Report into the shape `provider_costs` stores.
// ---------------------------------------------------------------------------
// This is the half of the s205 reconciliation that has to be exactly right, so
// it lives apart from the Edge Function and is unit-tested (`tests/costReport.test.ts`).
// Two details in the wire format are easy to get wrong and both change the
// number the founder reads:
//
//   1. `amount` is a decimal STRING in the currency's LOWEST UNIT (cents), so
//      "123.45" means $1.2345, not $123.45. Dividing by 100 is not optional.
//   2. A day's cost arrives as MANY rows (per model, per token type, per
//      workspace), so the day's total is their sum, not the first row.
//
// Anthropic reports only what Anthropic charged. Gemini and OpenAI are absent
// from it by definition, which is why a reconciliation compares our ANTHROPIC
// rows against this and says nothing about the rest.
// ---------------------------------------------------------------------------

/** One UTC day of provider-reported spend. */
export interface ProviderDay {
  /** YYYY-MM-DD, the UTC day the bucket starts on. */
  day: string;
  /** US dollars, converted from the reported cents. */
  costUsd: number;
}

function at(obj: unknown, key: string): unknown {
  return obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined;
}

/** Cents-as-string → dollars. Anything unparseable counts as 0, never NaN. */
export function centsToUsd(amount: unknown): number {
  const n = typeof amount === "string" ? Number(amount) : typeof amount === "number" ? amount : NaN;
  return Number.isFinite(n) ? n / 100 : 0;
}

/** The UTC calendar day an RFC-3339 bucket start belongs to. */
export function dayOf(startingAt: unknown): string | null {
  if (typeof startingAt !== "string") return null;
  const d = new Date(startingAt);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/**
 * Fold a Cost Report page into one row per day. Buckets whose timestamp cannot
 * be read are skipped rather than collapsed onto today, which would silently
 * misattribute spend.
 */
export function foldCostReport(body: unknown): ProviderDay[] {
  const data = at(body, "data");
  if (!Array.isArray(data)) return [];
  const byDay = new Map<string, number>();
  for (const bucket of data) {
    const day = dayOf(at(bucket, "starting_at"));
    if (!day) continue;
    const results = at(bucket, "results");
    const rows = Array.isArray(results) ? results : [];
    let total = byDay.get(day) ?? 0;
    for (const row of rows) total += centsToUsd(at(row, "amount"));
    byDay.set(day, total);
  }
  return [...byDay.entries()]
    .map(([day, costUsd]) => ({ day, costUsd }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

/** The pagination cursor, or null when the page is the last one. */
export function nextPage(body: unknown): string | null {
  const more = at(body, "has_more") === true;
  const token = at(body, "next_page");
  return more && typeof token === "string" && token ? token : null;
}

/**
 * The window to ask for: whole UTC days, ending at the start of TODAY so a
 * partial day is never stored as if it were final. Returns RFC-3339 strings.
 */
export function reportWindow(days: number, now = new Date()): { startingAt: string; endingAt: string } {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(1, Math.min(31, Math.floor(days))));
  return { startingAt: start.toISOString(), endingAt: end.toISOString() };
}
