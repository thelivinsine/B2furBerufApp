import { describe, it, expect } from "vitest";
import type { ProvenanceEntry, VerificationTier } from "@/types";
import {
  computeFunnel,
  pendingApprovals,
  buildHandoffPrompt,
} from "@/features/admin/adminFunnel";

/** Minimal provenance row for the funnel; only the fields the funnel reads. */
function row(
  content_id: string,
  review_status: "draft" | "verified",
  verified_date?: string,
): ProvenanceEntry {
  return {
    content_id,
    content_type: "vocabulary",
    label: content_id,
    origin: "authored",
    reference: "https://example.com",
    license: "OWNED",
    attribution_required: false,
    added_by: "test",
    review_status,
    ...(verified_date ? { verified_date } : {}),
  } as ProvenanceEntry;
}

function map(entries: Record<string, VerificationTier>): Record<string, { tier: VerificationTier }> {
  const out: Record<string, { tier: VerificationTier }> = {};
  for (const [k, v] of Object.entries(entries)) out[k] = { tier: v };
  return out;
}

describe("computeFunnel", () => {
  const now = new Date("2026-07-22T12:00:00Z");

  it("counts verified rows and jury coverage separately", () => {
    const prov = [
      row("a", "verified", "2026-07-20"), // human tier, this week
      row("b", "draft"),
      row("c", "draft"),
      row("d", "draft"),
    ];
    const v = map({ a: "human", b: "jury", c: "linguistic", d: "provenance" });
    const f = computeFunnel(prov, v, now);

    expect(f.total).toBe(4);
    expect(f.verified).toBe(1);
    expect(f.verifiedThisWeek).toBe(1);
    // jury-covered = tiers jury or human (a + b).
    expect(f.juryCovered).toBe(2);
    expect(f.juryCoverage).toBeCloseTo(0.5);
  });

  it("does not count old verified rows in the weekly delta", () => {
    const prov = [row("a", "verified", "2026-07-02")]; // three weeks earlier
    const f = computeFunnel(prov, map({ a: "human" }), now);
    expect(f.verified).toBe(1);
    expect(f.verifiedThisWeek).toBe(0);
  });

  it("collapses structural/unverified/unknown into the provenance bucket", () => {
    const prov = [row("a", "draft"), row("b", "draft"), row("c", "draft")];
    // a=structural, b=unverified, c=(no map entry) → all provenance.
    const f = computeFunnel(prov, map({ a: "structural", b: "unverified" }), now);
    expect(f.byTier.get("provenance")).toBe(3);
    expect(f.byTier.get("structural")).toBeUndefined();
    expect(f.byTier.get("unverified")).toBeUndefined();
  });

  it("honours an inline verification override on the row", () => {
    const r = row("a", "draft");
    (r as ProvenanceEntry).verification = { tier: "jury", confidence: 0.9, last_verified: "2026-07-22", checks: [] };
    const f = computeFunnel([r], map({ a: "provenance" }), now);
    expect(f.juryCovered).toBe(1); // override (jury) wins over the map (provenance)
  });

  it("is empty-safe", () => {
    const f = computeFunnel([], map({}), now);
    expect(f.total).toBe(0);
    expect(f.juryCoverage).toBe(0);
  });
});

describe("pendingApprovals", () => {
  it("keeps approved ids that are not yet verified in the bundle", () => {
    const verified = new Set(["a", "b"]);
    expect(pendingApprovals(["a", "c", "d"], verified)).toEqual(["c", "d"]);
  });

  it("dedupes and sorts", () => {
    expect(pendingApprovals(["z", "c", "c", "a"], new Set())).toEqual(["a", "c", "z"]);
  });

  it("returns empty when everything is applied", () => {
    expect(pendingApprovals(["a", "b"], new Set(["a", "b"]))).toEqual([]);
  });
});

describe("buildHandoffPrompt", () => {
  it("names apply:reviews and lists the ids with a count", () => {
    const p = buildHandoffPrompt(["v_a", "v_b"]);
    expect(p).toContain("pnpm apply:reviews");
    expect(p).toContain("v_a, v_b");
    expect(p).toContain("(2)");
  });

  it("handles the empty case without a stray list", () => {
    const p = buildHandoffPrompt([]);
    expect(p).toContain("(keine)");
    expect(p).toContain("(0)");
  });
});
