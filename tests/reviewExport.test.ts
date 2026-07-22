import { describe, it, expect } from "vitest";
import {
  buildDecisionExport,
  pendingDecisionCount,
  DECISION_EXPORT_SOURCE,
} from "@/lib/reviewExport";
import type { ProvenanceReview } from "@/lib/provenanceReviews";
import { parseDecisionFile } from "../scripts/apply-reviews.mjs";

/**
 * Round-trip pin: what the browser workbench EXPORTS must be exactly what the
 * `pnpm apply:reviews --from` parser reads back. If the two drift, the keyless
 * handoff silently loses decisions or fails to parse.
 */

const review = (over: Partial<ProvenanceReview>): ProvenanceReview => ({
  content_id: "v_x",
  verified: false,
  comment: null,
  decision: null,
  content_hash: null,
  reviewer_email: null,
  ...over,
});

describe("review decision export", () => {
  const reviews: ProvenanceReview[] = [
    review({ content_id: "v_b", decision: "approve", content_hash: "h2", reviewer_email: "f@x.de" }),
    review({ content_id: "v_a", decision: "approve", content_hash: "h1", reviewer_email: "f@x.de" }),
    review({ content_id: "v_reject", decision: "reject", comment: "falsch" }),
    review({ content_id: "v_undecided", decision: null }), // no decision -> excluded
  ];

  it("exports only decided rows, sorted by id, with the fingerprints", () => {
    const out = buildDecisionExport(reviews, "2026-07-22T12:00:00.000Z");
    expect(out.source).toBe(DECISION_EXPORT_SOURCE);
    expect(out.count).toBe(3);
    expect(out.decisions.map((d) => d.content_id)).toEqual(["v_a", "v_b", "v_reject"]);
    expect(out.decisions[0]).toEqual({
      content_id: "v_a",
      decision: "approve",
      content_hash: "h1",
      reviewer_email: "f@x.de",
      comment: null,
    });
  });

  it("pendingDecisionCount matches the export size", () => {
    expect(pendingDecisionCount(reviews)).toBe(3);
    expect(pendingDecisionCount([])).toBe(0);
  });

  it("round-trips through the script parser byte-for-byte on ids/decisions", () => {
    const out = buildDecisionExport(reviews, "2026-07-22T12:00:00.000Z");
    const parsed = parseDecisionFile(JSON.stringify(out));
    expect(parsed).toEqual(out.decisions);
  });
});
