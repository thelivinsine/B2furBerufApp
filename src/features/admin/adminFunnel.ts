import type { ProvenanceEntry, VerificationTier } from "@/types";

/**
 * Pure A1 verification-funnel aggregation for the admin Übersicht cockpit.
 * Built entirely from the bundled provenance register + the generated Layer C
 * verification map, so it needs zero backend. Kept dependency-injected (the
 * banks are passed in) so it is unit-testable and imports no heavy module.
 *
 * Two quality numbers, never blended (design principle 5):
 *  - the MACHINE floor: % of items at tier >= jury (costs the founder nothing,
 *    target 100%), surfaced as `juryCoverage`.
 *  - the HUMAN audit: count of `review_status: "verified"` rows (target is
 *    exceptions + samples, NOT 100%), surfaced as `verified`.
 */

/** Tiers ranked weakest → strongest; a higher index is a stronger tier. */
const TIER_RANK: VerificationTier[] = [
  "unverified",
  "structural",
  "provenance",
  "facts",
  "linguistic",
  "jury",
  "human",
];

function rankOf(tier: VerificationTier | undefined): number {
  return tier ? TIER_RANK.indexOf(tier) : -1;
}

/** The item's effective tier: an inline override on the row wins, else the map. */
function tierOf(
  r: ProvenanceEntry,
  verificationMap: Record<string, { tier: VerificationTier }>,
): VerificationTier | undefined {
  return r.verification?.tier ?? verificationMap[r.content_id]?.tier;
}

export interface FunnelResult {
  total: number;
  /** review_status === "verified" (the human tier). */
  verified: number;
  /** verified rows whose verified_date falls in the last 7 days (0 if none). */
  verifiedThisWeek: number;
  /** Items at tier jury or human. */
  juryCovered: number;
  /** juryCovered / total as a 0..1 fraction. */
  juryCoverage: number;
  /** Tier counts, collapsed the way the public /sources bar collapses them
   *  (structural + unverified fold into "provenance"). Keyed by display tier. */
  byTier: Map<VerificationTier, number>;
}

export function computeFunnel(
  provenance: ProvenanceEntry[],
  verificationMap: Record<string, { tier: VerificationTier }>,
  now: Date = new Date(),
): FunnelResult {
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const byTier = new Map<VerificationTier, number>();
  let verified = 0;
  let verifiedThisWeek = 0;
  let juryCovered = 0;

  for (const r of provenance) {
    if (r.review_status === "verified") {
      verified += 1;
      const ts = r.verified_date ? Date.parse(r.verified_date) : NaN;
      if (!Number.isNaN(ts) && ts >= weekAgo) verifiedThisWeek += 1;
    }

    const tier = tierOf(r, verificationMap);
    if (rankOf(tier) >= rankOf("jury")) juryCovered += 1;

    // Collapse structural/unverified into provenance, matching /sources.
    const display: VerificationTier =
      tier === "structural" || tier === "unverified" || tier === undefined ? "provenance" : tier;
    byTier.set(display, (byTier.get(display) ?? 0) + 1);
  }

  const total = provenance.length;
  return {
    total,
    verified,
    verifiedThisWeek,
    juryCovered,
    juryCoverage: total > 0 ? juryCovered / total : 0,
    byTier,
  };
}

/**
 * The sync-gap: content ids the founder APPROVED in the workbench that are not
 * yet `verified` in the bundled register. This is the keyless-safe definition
 * (CLAUDE.md: in keyless mode there is no DB write-back, so "applied" reconciles
 * from the deployed bundle, not the row's applied_at). Feeds the A4 counter and
 * the "Übergabe-Prompt kopieren" handoff.
 */
export function pendingApprovals(
  approvedIds: Iterable<string>,
  verifiedIds: ReadonlySet<string>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of approvedIds) {
    if (verifiedIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.sort();
}

/** The ready-to-paste handoff prompt for the next Claude session (A4). */
export function buildHandoffPrompt(ids: string[]): string {
  const list = ids.length ? ids.join(", ") : "(keine)";
  return [
    "Wende die anstehenden Review-Entscheidungen auf das Repo an.",
    "",
    "Führe `pnpm apply:reviews` aus (Keyless: zuerst die Entscheidungen aus dem",
    "/sources-Workbench als Datei exportieren, dann `pnpm apply:reviews --from <datei>`).",
    "Das Skript vergleicht die Entscheidungs-Hashes, setzt passende Freigaben auf",
    "`review_status: \"verified\"`, führt `pnpm stamp:verified` + `pnpm lint:content`",
    "im selben Commit aus und exportiert Ablehnungen nach docs/reports/review-defects.md.",
    "",
    `Erwartete Freigaben (${ids.length}): ${list}`,
  ].join("\n");
}
