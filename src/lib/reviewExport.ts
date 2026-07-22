import type { ProvenanceReview, ReviewDecision } from "@/lib/provenanceReviews";

/**
 * The keyless review handoff (admin center chunk 2 addendum). Instead of
 * giving a headless dev environment the Supabase service-role key (a secret
 * that must never live in the Claude environment's plaintext config), the
 * founder EXPORTS their decisions from the /sources workbench, where they are
 * already securely signed in and RLS grants them read access. The download is
 * a plain data file (decisions + the decision-time fingerprints), carries NO
 * credential, and is safe to hand to a Claude session: `pnpm apply:reviews
 * --from <file>` reads it and never touches the database.
 *
 * The file shape is pinned by tests/reviewExport.test.ts against the script's
 * `parseDecisionFile`; keep the two in lockstep.
 */

export const DECISION_EXPORT_SOURCE = "genauly-review-decisions";
export const DECISION_EXPORT_VERSION = 1;

export interface ExportedDecision {
  content_id: string;
  decision: ReviewDecision;
  content_hash: string | null;
  reviewer_email: string | null;
  comment: string | null;
}

export interface DecisionExport {
  source: typeof DECISION_EXPORT_SOURCE;
  version: typeof DECISION_EXPORT_VERSION;
  exportedAt: string;
  count: number;
  decisions: ExportedDecision[];
}

/** Pure builder: every review that carries a decision, sorted by id for a
 *  stable diff. `exportedAt` is injected so the output is deterministic in
 *  tests. */
export function buildDecisionExport(
  reviews: Iterable<ProvenanceReview>,
  exportedAt: string,
): DecisionExport {
  const decisions: ExportedDecision[] = [];
  for (const r of reviews) {
    if (!r.decision) continue;
    decisions.push({
      content_id: r.content_id,
      decision: r.decision,
      content_hash: r.content_hash,
      reviewer_email: r.reviewer_email,
      comment: r.comment,
    });
  }
  decisions.sort((a, b) => a.content_id.localeCompare(b.content_id));
  return {
    source: DECISION_EXPORT_SOURCE,
    version: DECISION_EXPORT_VERSION,
    exportedAt,
    count: decisions.length,
    decisions,
  };
}

/** How many of the loaded reviews carry a decision (the export size). */
export function pendingDecisionCount(reviews: Iterable<ProvenanceReview>): number {
  let n = 0;
  for (const r of reviews) if (r.decision) n += 1;
  return n;
}

/** Trigger a browser download of the decisions as a JSON file. */
export function downloadDecisions(reviews: Iterable<ProvenanceReview>): void {
  const now = new Date();
  const payload = buildDecisionExport(reviews, now.toISOString());
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genauly-review-decisions-${now.toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
