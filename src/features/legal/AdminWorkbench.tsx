import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileJson, RotateCcw } from "lucide-react";
import { provenance } from "@/data/provenance";
import { verification as verificationMap } from "@/data/verification";
import type { ProvenanceContentType, ProvenanceEntry, VerificationTier } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataColumn } from "@/features/shared/DataTable";
import { SearchField } from "@/features/shared/SearchField";
import { buildCsv, downloadCsv, type CsvValue } from "@/lib/csv";
import { foldText } from "@/lib/fuzzy";
import type { ProvenanceReview } from "@/lib/provenanceReviews";
import { downloadDecisions, pendingDecisionCount } from "@/lib/reviewExport";
import { cn } from "@/lib/utils";
import type { Lang } from "./LegalChrome";

/**
 * Founder-only data workbench on /sources (s130): the full provenance register
 * joined with the Layer C verification tier and the live Supabase review marks,
 * as one filterable, sortable, exportable table. Client-gated by isFounder
 * (src/lib/admin.ts); the review writes are additionally enforced server-side
 * by the provenance_reviews RLS policy (migrations 0004 + 0007).
 */

export interface WorkbenchApi {
  reviews: Map<string, ProvenanceReview>;
  onChange: (
    contentId: string,
    patch: Partial<Pick<ProvenanceReview, "verified" | "comment">>,
  ) => Promise<boolean>;
}

interface Row {
  entry: ProvenanceEntry;
  tier?: VerificationTier;
  confidence?: number;
}

const TYPE_SHORT: Record<ProvenanceContentType, { de: string; en: string }> = {
  vocabulary: { de: "Wort", en: "Word" },
  collocation: { de: "Kollokation", en: "Collocation" },
  grammar_topic: { de: "Grammatik-Thema", en: "Grammar topic" },
  grammar_drill: { de: "Grammatik-Übung", en: "Grammar drill" },
  dialogue: { de: "Dialog", en: "Dialogue" },
  exam_set: { de: "Prüfungssatz", en: "Exam set" },
  redemittel: { de: "Redemittel", en: "Phrase" },
  writing_prompt: { de: "Schreibaufgabe", en: "Writing prompt" },
  can_do: { de: "Kann-Beschreibung", en: "Can-do" },
  mission: { de: "Mission", en: "Mission" },
  text: { de: "Text", en: "Text" },
};

const TIER_RANK: Record<VerificationTier, number> = {
  unverified: 0,
  structural: 1,
  provenance: 2,
  facts: 3,
  linguistic: 4,
  jury: 5,
  human: 6,
};

const TIER_BADGE: Record<VerificationTier, { label: { de: string; en: string }; className: string }> = {
  human: { label: { de: "Mensch", en: "human" }, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  jury: { label: { de: "KI-Jury", en: "AI jury" }, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  linguistic: { label: { de: "Sprache", en: "language" }, className: "bg-primary/10 text-primary" },
  facts: { label: { de: "Fakten", en: "facts" }, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  provenance: { label: { de: "Quelle", en: "sourced" }, className: "bg-muted text-muted-foreground" },
  structural: { label: { de: "Struktur", en: "structure" }, className: "bg-muted text-muted-foreground" },
  unverified: { label: { de: "offen", en: "open" }, className: "bg-muted text-muted-foreground" },
};

type StatusFilter = "all" | "checked" | "open" | "note" | "no_source" | "attribution";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Copy-to-clipboard chip for a content id. */
function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={id}
      onClick={() => {
        navigator.clipboard?.writeText(id).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="inline-flex max-w-full items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="truncate">{id}</span>
      {copied ? <Check className="h-3 w-3 shrink-0 text-emerald-500" /> : <Copy className="h-3 w-3 shrink-0" />}
    </button>
  );
}

/** Inline editor for one row's live review mark (checkbox saves immediately,
 *  the note saves on Enter or blur). Mirrors the save contract of the old
 *  per-item overlay: nothing looks saved unless the write actually landed. */
function RowReview({ row, api, lang }: { row: Row; api: WorkbenchApi; lang: Lang }) {
  const saved = api.reviews.get(row.entry.content_id);
  const savedComment = saved?.comment ?? "";
  const [note, setNote] = useState(savedComment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  // Re-sync once the saved marks finish fetching after first render.
  useEffect(() => {
    setNote(savedComment);
  }, [savedComment]);

  const commitNote = async () => {
    if (note.trim() === savedComment.trim()) return;
    setBusy(true);
    const ok = await api.onChange(row.entry.content_id, { comment: note });
    setError(!ok);
    setBusy(false);
  };

  const toggleVerified = async (next: boolean) => {
    setBusy(true);
    const ok = await api.onChange(row.entry.content_id, { verified: next });
    setError(!ok);
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        aria-label={lang === "de" ? "geprüft" : "verified"}
        checked={saved?.verified ?? false}
        disabled={busy}
        onChange={(e) => toggleVerified(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-primary"
      />
      <input
        type="text"
        value={note}
        disabled={busy}
        onChange={(e) => setNote(e.target.value)}
        onBlur={commitNote}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitNote();
          }
        }}
        placeholder={lang === "de" ? "Notiz" : "Note"}
        className="w-36 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      {error && <span className="text-[10px] text-destructive">{lang === "de" ? "Fehler" : "failed"}</span>}
    </div>
  );
}

export function AdminWorkbench({ api, lang }: { api: WorkbenchApi; lang: Lang }) {
  const t = (de: string, en: string) => (lang === "de" ? de : en);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ProvenanceContentType>("all");
  const [tierFilter, setTierFilter] = useState<"all" | VerificationTier>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allRows: Row[] = useMemo(
    () =>
      provenance.map((entry) => {
        const v = entry.verification ?? verificationMap[entry.content_id];
        return { entry, tier: v?.tier, confidence: v?.confidence };
      }),
    [],
  );

  const typeCounts = useMemo(() => {
    const m = new Map<ProvenanceContentType, number>();
    for (const r of allRows) m.set(r.entry.content_type, (m.get(r.entry.content_type) ?? 0) + 1);
    return m;
  }, [allRows]);

  /** "checked" = register-verified in code OR live founder mark. */
  const isChecked = (r: Row) =>
    r.entry.review_status === "verified" || (api.reviews.get(r.entry.content_id)?.verified ?? false);

  const rows = useMemo(() => {
    const q = foldText(query.trim());
    return allRows.filter((r) => {
      if (typeFilter !== "all" && r.entry.content_type !== typeFilter) return false;
      if (tierFilter !== "all" && r.tier !== tierFilter) return false;
      const review = api.reviews.get(r.entry.content_id);
      if (statusFilter === "checked" && !isChecked(r)) return false;
      if (statusFilter === "open" && isChecked(r)) return false;
      if (statusFilter === "note" && !review?.comment) return false;
      if (statusFilter === "no_source" && r.entry.reference) return false;
      if (statusFilter === "attribution" && !r.entry.attribution_required) return false;
      if (q) {
        const hay = foldText(`${r.entry.label} ${r.entry.content_id} ${r.entry.reference ?? ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // isChecked reads api.reviews, so the review map is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, query, typeFilter, tierFilter, statusFilter, api.reviews]);

  const checkedCount = useMemo(() => allRows.filter(isChecked).length, [allRows, api.reviews]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilter = query !== "" || typeFilter !== "all" || tierFilter !== "all" || statusFilter !== "all";

  // The keyless review handoff: number of decisions ready to hand to a session
  // (all saved decisions; apply:reviews re-classifies them against the repo).
  const decisionCount = useMemo(
    () => pendingDecisionCount(api.reviews.values()),
    [api.reviews],
  );

  const exportCsv = () => {
    const headers = [
      "content_id", "type", "label", "origin", "source", "reference", "license",
      "review_status", "tier", "confidence", "checked_live", "decision", "note",
    ];
    const data: CsvValue[][] = rows.map((r) => {
      const review = api.reviews.get(r.entry.content_id);
      return [
        r.entry.content_id,
        r.entry.content_type,
        r.entry.label,
        r.entry.origin,
        r.entry.source_name ?? "",
        r.entry.reference ?? "",
        r.entry.license,
        r.entry.review_status,
        r.tier ?? "",
        r.confidence ?? "",
        review?.verified ? "yes" : "no",
        review?.decision ?? "",
        review?.comment ?? "",
      ];
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`genauly-inhalte-${date}.csv`, buildCsv(headers, data));
  };

  const columns: DataColumn<Row>[] = [
    {
      id: "label",
      label: t("Inhalt", "Item"),
      sortValue: (r) => r.entry.label,
      className: "min-w-[14rem]",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{r.entry.label}</div>
          <CopyId id={r.entry.content_id} />
        </div>
      ),
    },
    {
      id: "type",
      label: t("Typ", "Type"),
      sortValue: (r) => TYPE_SHORT[r.entry.content_type][lang],
      cell: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {TYPE_SHORT[r.entry.content_type][lang]}
        </span>
      ),
    },
    {
      id: "tier",
      label: t("Stufe", "Tier"),
      sortValue: (r) => (r.tier ? TIER_RANK[r.tier] : undefined),
      cell: (r) =>
        r.tier ? (
          <span className={cn("whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium", TIER_BADGE[r.tier].className)}>
            {TIER_BADGE[r.tier].label[lang]}
          </span>
        ) : null,
    },
    {
      id: "register",
      label: t("Register", "Register"),
      sortValue: (r) => (r.entry.review_status === "verified" ? 1 : 0),
      cell: (r) => (
        <span
          className={cn(
            "whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            r.entry.review_status === "verified"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {r.entry.review_status === "verified" ? t("geprüft", "verified") : t("Entwurf", "draft")}
        </span>
      ),
    },
    {
      id: "review",
      label: t("Meine Prüfung", "My review"),
      sortValue: (r) => (api.reviews.get(r.entry.content_id)?.verified ? 1 : 0),
      cell: (r) => <RowReview row={r} api={api} lang={lang} />,
    },
    {
      id: "source",
      label: t("Quelle", "Source"),
      sortValue: (r) => hostOf(r.entry.reference ?? "") || undefined,
      cell: (r) =>
        r.entry.reference ? (
          <a
            href={r.entry.reference}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            {hostOf(r.entry.reference)}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">{t("keine", "none")}</span>
        ),
    },
  ];

  const selectCls = "h-9 w-auto min-w-[8.5rem] bg-surface text-xs";

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {t("Geprüft (Register oder live):", "Checked (register or live):")}{" "}
          <strong className="text-foreground">{checkedCount}</strong> / {allRows.length}
        </span>
        <div className="h-1.5 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${allRows.length ? (checkedCount / allRows.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t("Suchen (Wort, ID, Quelle)", "Search (word, id, source)")}
          className="min-w-[12rem] flex-1"
        />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className={selectCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Alle Typen", "All types")}</SelectItem>
            {[...typeCounts.entries()].map(([type, n]) => (
              <SelectItem key={type} value={type}>
                {TYPE_SHORT[type][lang]} ({n})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
          <SelectTrigger className={selectCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Alle Stufen", "All tiers")}</SelectItem>
            {(Object.keys(TIER_RANK) as VerificationTier[])
              .sort((a, b) => TIER_RANK[b] - TIER_RANK[a])
              .map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {TIER_BADGE[tier].label[lang]}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className={selectCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Alle Status", "All statuses")}</SelectItem>
            <SelectItem value="open">{t("Zu prüfen", "To review")}</SelectItem>
            <SelectItem value="checked">{t("Geprüft", "Checked")}</SelectItem>
            <SelectItem value="note">{t("Mit Notiz", "With note")}</SelectItem>
            <SelectItem value="no_source">{t("Ohne Quelle", "No source")}</SelectItem>
            <SelectItem value="attribution">{t("Namensnennung", "Attribution")}</SelectItem>
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setTierFilter("all");
              setStatusFilter("all");
            }}
            className="gap-1 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("Zurücksetzen", "Reset")}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          {t(`CSV exportieren (${rows.length})`, `Export CSV (${rows.length})`)}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadDecisions(api.reviews.values())}
          disabled={decisionCount === 0}
          className="gap-1.5 text-xs"
          title={t(
            "Entscheidungen als Datei für `pnpm apply:reviews --from` exportieren (kein Schlüssel nötig)",
            "Export decisions as a file for `pnpm apply:reviews --from` (no key needed)",
          )}
        >
          <FileJson className="h-3.5 w-3.5" />
          {t(`Entscheidungen (${decisionCount})`, `Decisions (${decisionCount})`)}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {t(
          `${rows.length} von ${allRows.length} Einträgen. Haken und Notizen speichern sofort (nur für Admins sichtbar); der Export enthält die gefilterte Ansicht.`,
          `${rows.length} of ${allRows.length} entries. Checks and notes save immediately (visible to admins only); the export contains the filtered view.`,
        )}
      </p>

      <DataTable items={rows} columns={columns} rowKey={(r) => r.entry.content_id} />
    </div>
  );
}
