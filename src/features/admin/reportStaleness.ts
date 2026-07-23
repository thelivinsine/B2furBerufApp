import { provenance } from "@/data/provenance";

/**
 * Reads the report JSON sidecars (chunk 8) so the Übersicht can show how fresh
 * each offline report is instead of presenting stale numbers as current. The
 * sidecars are bundled via import.meta.glob (eager), so a missing file just
 * drops out of the list rather than breaking the build.
 */

export interface ReportSidecar {
  generatedAt: string;
  registerRows: number | null;
  scope?: string;
  [k: string]: unknown;
}

interface ReportMeta {
  file: string;
  de: string;
  en: string;
  /** True when registerRows is the whole provenance register (staleness vs live). */
  registerWide?: boolean;
}

const REPORTS: ReportMeta[] = [
  { file: "review-queue.json", de: "Review-Warteschlange", en: "Review queue", registerWide: true },
  { file: "verify-facts-report.json", de: "Fakten-Check", en: "Fact check" },
  { file: "verify-cefr-report.json", de: "CEFR-Check", en: "CEFR check" },
  { file: "exercise-coverage-report.json", de: "Übungs-Abdeckung", en: "Exercise coverage" },
];

// Eager glob of exactly the four sidecars. A file that does not exist is simply
// absent from the map (no build break).
const modules = import.meta.glob<ReportSidecar>(
  [
    "../../../docs/reports/review-queue.json",
    "../../../docs/reports/verify-facts-report.json",
    "../../../docs/reports/verify-cefr-report.json",
    "../../../docs/reports/exercise-coverage-report.json",
  ],
  { eager: true, import: "default" },
);

function byFile(file: string): ReportSidecar | undefined {
  const hit = Object.entries(modules).find(([path]) => path.endsWith(`/${file}`));
  return hit?.[1];
}

export interface ReportStatus {
  de: string;
  en: string;
  generatedAt: string;
  registerRows: number | null;
  scope?: string;
  ageDays: number;
  /** For register-wide reports: rows the report saw vs live register size. */
  liveRegisterRows?: number;
  stale: boolean;
}

/** The live register size (the yardstick for register-wide reports). */
export function liveRegisterRows(): number {
  return provenance.length;
}

/**
 * Build the staleness list. `now` is injectable for tests. A report is "stale"
 * when it is older than 30 days OR (register-wide) generated against a
 * meaningfully smaller register than today's.
 */
export function reportStatuses(now: Date = new Date()): ReportStatus[] {
  const live = liveRegisterRows();
  const out: ReportStatus[] = [];
  for (const meta of REPORTS) {
    const sc = byFile(meta.file);
    if (!sc) continue;
    const gen = Date.parse(sc.generatedAt);
    const ageDays = Number.isNaN(gen) ? Infinity : Math.floor((now.getTime() - gen) / 86_400_000);
    const registerGap =
      meta.registerWide && typeof sc.registerRows === "number" ? live - sc.registerRows : 0;
    out.push({
      de: meta.de,
      en: meta.en,
      generatedAt: sc.generatedAt,
      registerRows: sc.registerRows,
      scope: sc.scope,
      ageDays,
      liveRegisterRows: meta.registerWide ? live : undefined,
      stale: ageDays > 30 || registerGap > 25,
    });
  }
  return out;
}
