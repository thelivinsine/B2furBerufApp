import { describe, it, expect } from "vitest";
import { provenance } from "@/data/provenance";
import { buildAuditCsv, auditStats, buildAuditSummary } from "@/lib/auditExport";

/**
 * Auditor export (admin control center chunk 12 §G3). Pins the pure builders so
 * the CSV stays one-row-per-register-entry and the summary stays honest.
 */
describe("auditor export (§G3)", () => {
  it("CSV has the header plus exactly one row per provenance entry", () => {
    const lines = buildAuditCsv().split("\r\n");
    expect(lines[0]).toBe(
      "content_id,content_type,label,origin,tier,confidence,review_status,license,reference",
    );
    expect(lines.length).toBe(provenance.length + 1);
  });

  it("stats total equals the register size and status buckets sum to it", () => {
    const s = auditStats();
    expect(s.total).toBe(provenance.length);
    const statusSum = Object.values(s.byStatus).reduce((a, b) => a + b, 0);
    const typeSum = Object.values(s.byType).reduce((a, b) => a + b, 0);
    const tierSum = Object.values(s.byTier).reduce((a, b) => a + b, 0);
    expect(statusSum).toBe(s.total);
    expect(typeSum).toBe(s.total);
    expect(tierSum).toBe(s.total);
  });

  it("summary reports the total and contains no em dash", () => {
    const s = auditStats();
    const md = buildAuditSummary(s, "2026-07-24T00:00:00.000Z");
    expect(md).toContain(s.total.toLocaleString("de-DE"));
    expect(md).toContain("Stichproben");
    expect(md).not.toContain("—"); // em dash is banned in user-facing copy
  });
});
