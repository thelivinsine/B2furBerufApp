import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, AlertTriangle, ClipboardCheck } from "lucide-react";
import { themes } from "@/data/themes";
import { browsableVocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { scenarios } from "@/data/dialogues";
import { examSets } from "@/data/examSets";
import { canDoStatements } from "@/data/canDo";
import { texts } from "@/data/texts";
import { writingPrompts } from "@/data/writingPrompts";
import { verification as verificationMap } from "@/data/verification";
import { provenance } from "@/data/provenance";
import type { ProvenanceContentType } from "@/types";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";
import { reportStatuses } from "./reportStaleness";
import coverage from "../../../docs/reports/exercise-coverage-report.json";

/**
 * Content intelligence (Kontrollzentrum §F): the "what should I build next"
 * screens. F1 the 20-theme depth matrix against the reference floor, F2 the
 * machine-check flag triage (click through to Prüfmodus), F3 the per-theme
 * exercise-coverage residuals with a copy-id work order for an AI session.
 * All data is bundled (banks + verification map + the chunk-8 coverage sidecar).
 */

// The reference-template depth floor per bank (the workplace/behoerde packs).
// exam sets are the known thin axis, so its floor is deliberately low.
const FLOORS = {
  vocab: 40,
  collocations: 30,
  dialogues: 2,
  texts: 2,
  examSets: 1,
  canDo: 2,
  prompts: 1,
} as const;

type Col = keyof typeof FLOORS;

const COL_LABEL: Record<Col, { de: string; en: string }> = {
  vocab: { de: "Wörter", en: "Vocab" },
  collocations: { de: "Kollok.", en: "Colloc." },
  dialogues: { de: "Dialoge", en: "Dialog." },
  texts: { de: "Texte", en: "Texts" },
  examSets: { de: "Prüfung", en: "Exam" },
  canDo: { de: "Can-Do", en: "Can-Do" },
  prompts: { de: "Schreiben", en: "Writing" },
};

interface CoverageTheme {
  id: string;
  title: string;
  words: number;
  cols: number;
  vocabKinds: number;
  noExampleIds: string[];
  noRelatedIds: string[];
}
const coverageThemes: CoverageTheme[] = (coverage as { themes?: CoverageTheme[] }).themes ?? [];

function cellTone(value: number, floor: number): string {
  if (value >= floor) return "text-success";
  if (value >= floor / 2) return "text-warning";
  return "text-danger";
}

export function AdminInhalte() {
  const { t, lang } = useAdminLang();
  const [tab, setTab] = useState<"depth" | "flags" | "coverage">("depth");

  const rows = useMemo(() => {
    return themes.map((th) => {
      const id = th.id;
      const counts: Record<Col, number> = {
        vocab: browsableVocabulary.filter((v) => v.themeId === id).length,
        collocations: collocations.filter((c) => c.themeId === id).length,
        dialogues: scenarios.filter((s) => s.themeId === id).length,
        texts: texts.filter((x) => x.themeId === id).length,
        examSets: examSets.filter((e) => e.themeId === id).length,
        canDo: canDoStatements.filter((cd) => cd.themeId === id).length,
        prompts: writingPrompts[id] ? 1 : 0,
      };
      const gaps = (Object.keys(FLOORS) as Col[]).filter((c) => counts[c] < FLOORS[c]).length;
      return { id, title: th.titleDe ?? id, counts, gaps };
    });
  }, []);

  // F2 flag triage: verification checks that did not pass, grouped by bank.
  const flagsByType = useMemo(() => {
    const m = new Map<ProvenanceContentType, number>();
    const typeOf = new Map(provenance.map((r) => [r.content_id, r.content_type]));
    for (const [id, v] of Object.entries(verificationMap)) {
      if (v.checks.some((c) => c.result !== "pass")) {
        const type = typeOf.get(id);
        if (type) m.set(type, (m.get(type) ?? 0) + 1);
      }
    }
    return m;
  }, []);
  const totalFlags = useMemo(() => [...flagsByType.values()].reduce((a, b) => a + b, 0), [flagsByType]);

  const reports = useMemo(() => reportStatuses(), []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">
          {t("Inhalte", "Content")}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("Wo lohnt sich der nächste Inhalts-Aufwand?", "Where is the next content effort worth it?")}
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["depth", t("Tiefe pro Thema", "Depth per theme")],
            ["flags", t(`Maschinen-Verdacht (${totalFlags})`, `Machine flags (${totalFlags})`)],
            ["coverage", t("Übungs-Lücken", "Exercise gaps")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "depth" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 text-left font-bold">{t("Thema", "Theme")}</th>
                {(Object.keys(FLOORS) as Col[]).map((c) => (
                  <th key={c} className="px-2 py-2 text-right font-bold" title={`Floor ${FLOORS[c]}`}>
                    {COL_LABEL[c][lang]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-1.5 font-medium">
                    {r.title}
                    {r.gaps > 0 && (
                      <span className="ml-1.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                        {r.gaps}
                      </span>
                    )}
                  </td>
                  {(Object.keys(FLOORS) as Col[]).map((c) => (
                    <td
                      key={c}
                      className={cn("px-2 py-1.5 text-right font-bold tabular-nums", cellTone(r.counts[c], FLOORS[c]))}
                    >
                      {r.counts[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-[11px] text-muted-foreground">
            {t(
              `Grün ≥ Referenzuntergrenze, gelb ≥ Hälfte, rot darunter. Prüfungssätze sind die bekannte dünne Achse.`,
              `Green ≥ reference floor, amber ≥ half, red below. Exam sets are the known thin axis.`,
            )}
          </p>
        </div>
      )}

      {tab === "flags" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">{t("Offene Maschinen-Verdachtsfälle", "Open machine flags")}</h2>
              <Link
                to="/admin/pruefen?defect=1"
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:brightness-105"
              >
                <ClipboardCheck className="h-3.5 w-3.5" /> {t("Alle prüfen", "Review all")}
              </Link>
            </div>
            {totalFlags === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("Keine offenen Verdachtsfälle. Alle Maschinen-Checks bestehen.", "No open flags. Every machine check passes.")}
              </p>
            ) : (
              <div className="space-y-1.5">
                {[...flagsByType.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <Link
                      key={type}
                      to={`/admin/pruefen?bank=${type}&defect=1`}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      <span className="flex-1 font-medium">{type}</span>
                      <span className="font-bold tabular-nums text-warning">{count}</span>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Sidecar flag counts (verify-facts gate, verify-cefr flags) */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
            <h2 className="mb-2 text-sm font-extrabold">{t("Aus den Berichten", "From the reports")}</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {reports.map((r) => (
                <span key={r.de} className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
                  <b>{lang === "de" ? r.de : r.en}</b> · {r.generatedAt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "coverage" && <CoverageTab themes={coverageThemes} t={t} />}
    </div>
  );
}

function CoverageTab({
  themes: rows,
  t,
}: {
  themes: CoverageTheme[];
  t: (de: string, en: string) => string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const withGaps = rows
    .map((r) => ({ ...r, gap: r.noExampleIds.length + r.noRelatedIds.length }))
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  const copyIds = async (theme: CoverageTheme) => {
    const lines = [
      `Inhalts-Polish für Thema "${theme.title}" (${theme.id}):`,
      "",
      theme.noExampleIds.length
        ? `Wörter ohne Selbst-Beispiel (kein Cloze/Tippen/Hören) — je einen Beispielsatz ergänzen:\n${theme.noExampleIds.join(", ")}`
        : "",
      theme.noRelatedIds.length
        ? `Wörter ohne auflösbare related-Begriffe (kein Ausreißer) — related-Verweise ergänzen:\n${theme.noRelatedIds.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(theme.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface/60 p-6 text-center text-sm text-muted-foreground">
        {t(
          "Kein Abdeckungs-Bericht gefunden. Führe `pnpm report:exercise-coverage` aus.",
          "No coverage report found. Run `pnpm report:exercise-coverage`.",
        )}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {t(
          "Wort-Lücken pro Thema: Wörter ohne Beispielsatz (kein Cloze/Tippen/Hören) oder ohne auflösbare related-Begriffe (kein Ausreißer). „IDs kopieren“ gibt einer KI-Session einen exakten Arbeitsauftrag.",
          "Word-level gaps per theme: words with no example sentence (no cloze/typing/listening) or no resolvable related terms (no odd-one-out). 'Copy ids' hands an AI session an exact work order.",
        )}
      </p>
      {withGaps.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-soft">
          {t("Keine Wort-Lücken. Alle Themen sind poliert.", "No word gaps. Every theme is polished.")}
        </p>
      ) : (
        withGaps.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-soft">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.noExampleIds.length > 0 &&
                  t(`${r.noExampleIds.length} ohne Beispiel`, `${r.noExampleIds.length} without example`)}
                {r.noExampleIds.length > 0 && r.noRelatedIds.length > 0 && " · "}
                {r.noRelatedIds.length > 0 &&
                  t(`${r.noRelatedIds.length} ohne related`, `${r.noRelatedIds.length} without related`)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyIds(r)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold hover:border-primary/40"
            >
              {copied === r.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === r.id ? t("Kopiert", "Copied") : t("IDs kopieren", "Copy ids")}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
