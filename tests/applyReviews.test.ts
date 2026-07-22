import { describe, it, expect } from "vitest";
import {
  classifyApproveRow,
  flipProvenanceSource,
  parseDecisionFile,
} from "../scripts/apply-reviews.mjs";

/**
 * Pins the integrity core of `pnpm apply:reviews` (admin center chunk 2):
 * the approve-row classification (a null or stale decision hash must NEVER
 * flip a row) and the provenance.ts codemod (flip + verified_by insertion,
 * exactly one row touched).
 */

describe("classifyApproveRow", () => {
  const item = { id: "v_x", de: "das Beispiel" };
  const draftRow = { content_id: "v_x", review_status: "draft" };
  const verifiedRow = { content_id: "v_x", review_status: "verified" };

  it("flips only when the decision hash matches the current content", () => {
    expect(
      classifyApproveRow({ repoRow: draftRow, item, currentHash: "abc", decisionHash: "abc" }),
    ).toBe("apply");
  });

  it("a changed content hash forces re-review, never a flip", () => {
    expect(
      classifyApproveRow({ repoRow: draftRow, item, currentHash: "abc", decisionHash: "def" }),
    ).toBe("changed_since_review");
  });

  it("a missing decision hash is never a free pass", () => {
    expect(
      classifyApproveRow({ repoRow: draftRow, item, currentHash: "abc", decisionHash: null }),
    ).toBe("legacy_no_hash");
  });

  it("already-verified repo rows are mark-applied only (checked before hash)", () => {
    expect(
      classifyApproveRow({ repoRow: verifiedRow, item, currentHash: "abc", decisionHash: null }),
    ).toBe("already_verified");
    expect(
      classifyApproveRow({ repoRow: verifiedRow, item, currentHash: "abc", decisionHash: "def" }),
    ).toBe("already_verified");
  });

  it("ids without a live row or item are unknown", () => {
    expect(
      classifyApproveRow({ repoRow: undefined, item, currentHash: "abc", decisionHash: "abc" }),
    ).toBe("unknown_id");
    expect(
      classifyApproveRow({
        repoRow: draftRow,
        item: undefined,
        currentHash: null,
        decisionHash: "abc",
      }),
    ).toBe("unknown_id");
  });
});

describe("flipProvenanceSource", () => {
  const source = `const provenancePart1: ProvenanceEntry[] = [
  {
    content_id: "v_alpha",
    content_type: "vocabulary",
    label: "die Alpha",
    added_by: "assistant",
    review_status: "draft",
    notes: "first row"
  },
  {
    content_id: "v_beta",
    content_type: "vocabulary",
    label: "die Beta",
    added_by: "assistant",
    review_status: "draft",
    notes: "second row"
  },
  {
    content_id: "cd_done",
    content_type: "can_do",
    label: "Ich kann.",
    added_by: "assistant",
    review_status: "verified",
    verified_by: "founder",
    verified_date: "2026-07-02",
    notes: "already verified"
  }
];
`;
  const opts = { verifiedBy: "thelivinsine@gmail.com", verifiedDate: "2026-07-22" };

  it("flips exactly the target row and inserts verified_by/verified_date", () => {
    const { source: out, error } = flipProvenanceSource(source, "v_beta", opts);
    expect(error).toBeNull();
    expect(out).toContain(
      `content_id: "v_beta",\n    content_type: "vocabulary",\n    label: "die Beta",\n    added_by: "assistant",\n    review_status: "verified",\n    verified_by: "thelivinsine@gmail.com",\n    verified_date: "2026-07-22",\n    notes: "second row"`,
    );
    // The sibling rows are untouched.
    expect(out).toContain(`content_id: "v_alpha",\n    content_type: "vocabulary",\n    label: "die Alpha",\n    added_by: "assistant",\n    review_status: "draft"`);
    expect(out.match(/review_status: "draft"/g)).toHaveLength(1);
  });

  it("preserves a missing trailing comma (last field in the block)", () => {
    const tail = `[
  {
    content_id: "v_last",
    label: "x",
    review_status: "draft"
  }
];
`;
    const { source: out, error } = flipProvenanceSource(tail, "v_last", opts);
    expect(error).toBeNull();
    expect(out).toContain(`verified_date: "2026-07-22"\n  }`);
  });

  it("refuses already-verified rows", () => {
    const { source: out, error } = flipProvenanceSource(source, "cd_done", opts);
    expect(error).toMatch(/already verified/);
    expect(out).toBe(source);
  });

  it("refuses unknown and duplicate ids", () => {
    expect(flipProvenanceSource(source, "v_missing", opts).error).toMatch(/not found/);
    const dup = source + source;
    expect(flipProvenanceSource(dup, "v_alpha", opts).error).toMatch(/more than once/);
  });

  it("escapes the reviewer identity safely", () => {
    const { source: out, error } = flipProvenanceSource(source, "v_alpha", {
      verifiedBy: 'evil" } ] //',
      verifiedDate: "2026-07-22",
    });
    expect(error).toBeNull();
    expect(out).toContain(`verified_by: "evil\\" } ] //",`);
  });
});

describe("parseDecisionFile (keyless --from input)", () => {
  const good = JSON.stringify({
    source: "genauly-review-decisions",
    version: 1,
    exportedAt: "2026-07-22T00:00:00.000Z",
    count: 2,
    decisions: [
      { content_id: "v_a", decision: "approve", content_hash: "abc123", reviewer_email: "f@x.de", comment: null },
      { content_id: "v_b", decision: "reject", content_hash: null, reviewer_email: "f@x.de", comment: "wrong plural" },
    ],
  });

  it("parses a valid export into DB-shaped rows", () => {
    const rows = parseDecisionFile(good);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      content_id: "v_a",
      decision: "approve",
      content_hash: "abc123",
      reviewer_email: "f@x.de",
      comment: null,
    });
    expect(rows[1].decision).toBe("reject");
  });

  it("rejects non-JSON and the wrong file shape", () => {
    expect(() => parseDecisionFile("not json")).toThrow(/valid JSON/);
    expect(() => parseDecisionFile(JSON.stringify({ foo: 1 }))).toThrow(/Genauly review-decisions/);
    expect(() => parseDecisionFile(JSON.stringify({ source: "genauly-review-decisions" }))).toThrow(
      /Genauly review-decisions/,
    );
  });

  it("rejects rows missing an id or with an invalid decision", () => {
    const noId = JSON.stringify({
      source: "genauly-review-decisions",
      decisions: [{ decision: "approve" }],
    });
    const badDecision = JSON.stringify({
      source: "genauly-review-decisions",
      decisions: [{ content_id: "v_a", decision: "maybe" }],
    });
    expect(() => parseDecisionFile(noId)).toThrow(/content_id/);
    expect(() => parseDecisionFile(badDecision)).toThrow(/invalid decision/);
  });
});
