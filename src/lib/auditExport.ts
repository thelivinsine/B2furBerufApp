/**
 * Auditor export (admin control center §G3, chunk 12 compliance pack).
 *
 * One button produces the auditor package that BAMF / healthcare / enterprise
 * procurement asks for: the full provenance register as a CSV, plus a Markdown
 * summary (tier distribution, review status, licences, verification links, and
 * a sampling guide). It turns the project's provenance discipline into a
 * verifiable trust artifact.
 *
 * Pure builders (pinned by `tests/auditExport.test.ts`) + thin download
 * triggers. Reads the bundled provenance register + machine-verification map,
 * which the admin chunk already loads (via AdminOverview), so this adds no new
 * weight to the eager main bundle.
 */
import { provenance } from "@/data/provenance";
import { verification, verificationGeneratedAt } from "@/data/verification";
import { buildCsv, downloadCsv, downloadText } from "@/lib/csv";

export interface AuditStats {
  total: number;
  /** Count per machine-verification tier (human / jury / linguistic / provenance). */
  byTier: Record<string, number>;
  /** Count per human review status (verified / draft). */
  byStatus: Record<string, number>;
  /** Count per content type (vocab / collocation / …). */
  byType: Record<string, number>;
  /** Count per SPDX licence. */
  byLicense: Record<string, number>;
}

/** The effective tier for a row: an inline override, else the generated map,
 *  else the base "provenance" rung (an item with a register row but no machine
 *  check still has traceable provenance). */
function tierOf(contentId: string, inline?: string): string {
  return inline ?? verification[contentId]?.tier ?? "provenance";
}

function bump(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

/** Aggregate the register into the counts the summary reports. */
export function auditStats(): AuditStats {
  const byTier: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byLicense: Record<string, number> = {};
  for (const p of provenance) {
    bump(byTier, tierOf(p.content_id, p.verification?.tier));
    bump(byStatus, p.review_status);
    bump(byType, p.content_type);
    bump(byLicense, p.license);
  }
  return { total: provenance.length, byTier, byStatus, byType, byLicense };
}

/** The full register as a CSV: one row per content item, every field an auditor
 *  needs to sample and re-verify against its source. */
export function buildAuditCsv(): string {
  const headers = [
    "content_id",
    "content_type",
    "label",
    "origin",
    "tier",
    "confidence",
    "review_status",
    "license",
    "reference",
  ];
  const rows = provenance.map((p) => {
    const v = verification[p.content_id];
    return [
      p.content_id,
      p.content_type,
      p.label,
      p.origin,
      tierOf(p.content_id, p.verification?.tier),
      p.verification?.confidence ?? v?.confidence ?? "",
      p.review_status,
      p.license,
      p.reference ?? "",
    ];
  });
  return buildCsv(headers, rows);
}

const REPORT_LINKS: { label: string; path: string }[] = [
  { label: "Öffentliche Quellen-/Datenqualitätsseite", path: "/sources" },
  { label: "Datenstrategie (Verifikationsschichten)", path: "docs/strategy/DATA_STRATEGY.md" },
  { label: "Daten-Governance (Traceability-Politik)", path: "docs/strategy/DATA_GOVERNANCE.md" },
  { label: "Layer-2-Faktencheck-Bericht", path: "docs/reports/verify-facts-report.md" },
  { label: "Layer-3-Grammatik-/Rechtschreibbericht", path: "docs/reports/verify-grammar-report.md" },
  { label: "Layer-3-CEFR-Plausibilitätsbericht", path: "docs/reports/verify-cefr-report.md" },
];

function sortedEntries(map: Record<string, number>): [string, number][] {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

/** The Markdown companion: what the numbers mean, so a reader does not have to
 *  reverse-engineer the CSV. German-primary (the audience is the German market),
 *  no em dashes. */
export function buildAuditSummary(stats: AuditStats, generatedAt: string): string {
  const line = (label: string, n: number) => `- ${label}: ${n.toLocaleString("de-DE")}`;
  const verified = stats.byStatus["verified"] ?? 0;
  const pct = stats.total ? Math.round((verified / stats.total) * 1000) / 10 : 0;

  return [
    "# Genauly Auditor-Paket / Auditor package",
    "",
    `Erstellt am / Generated: ${generatedAt}`,
    `Maschinelle Verifikation, Stand / Machine verification as of: ${verificationGeneratedAt}`,
    "",
    "Dieses Paket dokumentiert die Herkunft und Prüfung jedes Inhalts der App.",
    "Die beiliegende CSV listet jeden Eintrag mit Quelle (reference), Lizenz,",
    "Vertrauensstufe (tier) und Prüfstatus (review_status). This package documents",
    "the provenance and verification of every content item; the CSV lists each",
    "entry with its source, licence, trust tier and review status.",
    "",
    "## Überblick / Overview",
    line("Einträge gesamt / total items", stats.total),
    line("Menschlich geprüft / human-verified", verified) + ` (${pct.toLocaleString("de-DE")} %)`,
    "",
    "## Vertrauensstufen / Trust tiers",
    "Bedeutung: `human` = von einer Person geprüft, `jury` = KI-Jury-Prüfung,",
    "`linguistic` = maschinelle Sprachprüfung bestanden, `provenance` = Herkunft",
    "belegt, noch keine Sprachprüfung. Meaning: human-reviewed, AI-jury reviewed,",
    "machine-language-checked, and provenance-only respectively.",
    ...sortedEntries(stats.byTier).map(([k, n]) => line(k, n)),
    "",
    "## Prüfstatus / Review status",
    ...sortedEntries(stats.byStatus).map(([k, n]) => line(k, n)),
    "",
    "## Inhaltstypen / Content types",
    ...sortedEntries(stats.byType).map(([k, n]) => line(k, n)),
    "",
    "## Lizenzen / Licences",
    "Alle Lizenzen stammen aus der kommerziell nutzbaren Allowlist der",
    "Governance-Politik. All licences are on the commercial-safe allowlist.",
    ...sortedEntries(stats.byLicense).map(([k, n]) => line(k, n)),
    "",
    "## Belege / References",
    ...REPORT_LINKS.map((r) => `- ${r.label}: ${r.path}`),
    "",
    "## Stichproben-Anleitung / Sampling guide",
    "1. Ziehen Sie aus der CSV eine Zufallsstichprobe (z. B. 30 bis 50 Zeilen),",
    "   gewichtet nach Inhaltstyp. Draw a random sample weighted by content type.",
    "2. Prüfen Sie jede Zeile gegen ihre `reference`-URL (Wiktionary / DWDS /",
    "   Tatoeba). Verify each row against its reference URL.",
    "3. Für als `verified` markierte Zeilen: bestätigen Sie die deutsche",
    "   Korrektheit unabhängig. For verified rows, confirm German correctness",
    "   independently.",
    "4. Notieren Sie Abweichungen mit `content_id`; diese fließen in die",
    "   Review-Warteschlange zurück. Record any deviations by content_id for the",
    "   review queue.",
    "",
  ].join("\n");
}

/** One-button auditor package: the register CSV plus its Markdown summary. */
export function downloadAuditPackage(): void {
  const generatedAt = new Date().toISOString();
  const date = generatedAt.slice(0, 10);
  const stats = auditStats();
  downloadCsv(`genauly-provenance-register-${date}.csv`, buildAuditCsv());
  downloadText(`genauly-audit-summary-${date}.md`, buildAuditSummary(stats, generatedAt));
}
