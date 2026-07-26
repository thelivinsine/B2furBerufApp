import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  X,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Keyboard,
  Play,
  Filter as FilterIcon,
  ShieldCheck,
  AlertTriangle,
  Save,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { provenance } from "@/data/provenance";
import { verification as verificationMap } from "@/data/verification";
import type { ProvenanceContentType, ProvenanceEntry, Verification } from "@/types";
import { type ProvenanceReview, type ReviewDecision } from "@/lib/provenanceReviews";
import { cn } from "@/lib/utils";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { useWorkbench } from "@/features/legal/useWorkbench";
import { AdminWorkbench, type WorkbenchApi } from "@/features/legal/AdminWorkbench";
import { useAdminLang } from "./adminI18n";
import { scoredItems, reviewQueueGeneratedAt, type ScoredItem } from "./reviewQueueData";

/* Bilingual labels for the content-type facet. */
const TYPE_LABEL: Record<ProvenanceContentType, { de: string; en: string }> = {
  vocabulary: { de: "Wörter", en: "Vocabulary" },
  collocation: { de: "Kollokationen", en: "Collocations" },
  grammar_topic: { de: "Grammatik", en: "Grammar" },
  grammar_drill: { de: "Grammatik-Übung", en: "Grammar drill" },
  dialogue: { de: "Dialoge", en: "Dialogues" },
  exam_set: { de: "Prüfungssätze", en: "Exam sets" },
  redemittel: { de: "Redemittel", en: "Redemittel" },
  writing_prompt: { de: "Schreibaufgaben", en: "Writing prompts" },
  can_do: { de: "Can-Do", en: "Can-Do" },
  text: { de: "Texte", en: "Texts" },
  mission: { de: "Missionen", en: "Missions" },
};

const STREAK_NUDGE_AT = 50;
const NUDGE_KEY = "b2beruf.pruefNudgeDismissed";

const provIndex = new Map<string, ProvenanceEntry>(provenance.map((r) => [r.content_id, r]));

interface Row extends ScoredItem {
  label: string;
  reference: string | null;
  ver: Verification | undefined;
}

function hydrate(item: ScoredItem): Row {
  const row = provIndex.get(item.id);
  return {
    ...item,
    label: row?.label ?? item.id,
    reference: row?.reference || null,
    ver: verificationMap[item.id],
  };
}

export function Pruefmodus() {
  const { t, lang } = useAdminLang();
  const [params, setParams] = useSearchParams();
  const { api, reviews, reviewsLoaded } = useWorkbench();

  // --- Filters + view (URL-persisted) ---
  const bankFilter = params.get("bank") ?? "";
  const defectOnly = params.get("defect") === "1";
  const inPruefmodus = params.get("mode") === "pruefen";
  const view: "queue" | "table" = params.get("view") === "table" ? "table" : "queue";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setParams(
        (p) => {
          const next = new URLSearchParams(p);
          if (value == null || value === "") next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const rows = useMemo(() => scoredItems.map(hydrate), []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (bankFilter && r.type !== bankFilter) return false;
        if (defectOnly && r.defect <= 0) return false;
        return true;
      }),
    [rows, bankFilter, defectOnly],
  );

  const decisionOf = useCallback(
    (id: string): ReviewDecision | null => reviews.get(id)?.decision ?? null,
    [reviews],
  );

  const openCount = useMemo(
    () => filtered.filter((r) => decisionOf(r.id) == null).length,
    [filtered, decisionOf],
  );

  // Per-type counts for the facet chips (over the whole queue, not filtered).
  const typeCounts = useMemo(() => {
    const m = new Map<ProvenanceContentType, number>();
    for (const r of rows) m.set(r.type, (m.get(r.type) ?? 0) + 1);
    return m;
  }, [rows]);

  // The focused keyboard cockpit takes the whole surface (no switcher chrome).
  if (inPruefmodus && api) {
    return (
      <ReviewSession
        rows={filtered}
        api={api}
        reviews={reviews}
        reviewsLoaded={reviewsLoaded}
        onExit={() => setParam("mode", null)}
        t={t}
        lang={lang}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">
          {t("Prüfen", "Review")}
        </h1>
        <PruefenTabs view={view} onSelect={(v) => setParam("view", v === "table" ? "table" : null)} t={t} />
      </div>

      {view === "table" ? (
        api ? (
          <AdminWorkbench api={api} lang={lang} />
        ) : null
      ) : (
        <QueueLanding
          typeCounts={typeCounts}
          rowsLength={rows.length}
          bankFilter={bankFilter}
          defectOnly={defectOnly}
          openCount={openCount}
          filtered={filtered}
          decisionOf={decisionOf}
          setParam={setParam}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}

/** The two-segment sliding-pill switcher that heads the Prüfen page:
 *  Warteschlange (priority queue + keyboard cockpit) vs Alle Inhalte (the full
 *  register table). Same mechanism as the Bibliothek switcher (useSlidingPill,
 *  one always-mounted pill, no per-segment layoutId crossfade). */
function PruefenTabs({
  view,
  onSelect,
  t,
}: {
  view: "queue" | "table";
  onSelect: (v: "queue" | "table") => void;
  t: (de: string, en: string) => string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(view);
  const segs: { key: "queue" | "table"; label: string }[] = [
    { key: "queue", label: t("Warteschlange", "Queue") },
    { key: "table", label: t("Alle Inhalte", "All content") },
  ];
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label={t("Prüfansicht", "Review view")}
      className="relative flex w-full max-w-xs items-stretch gap-1 rounded-lg border border-border bg-muted p-1 shadow-soft"
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute top-1 bottom-1 left-0 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {segs.map((seg) => {
        const active = view === seg.key;
        return (
          <button
            key={seg.key}
            ref={registerItem(seg.key) as React.Ref<HTMLButtonElement>}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(seg.key)}
            className={cn(
              "relative z-10 flex-1 whitespace-nowrap rounded-md px-3 py-2 text-center text-sm leading-none transition-colors",
              active ? "font-bold text-primary" : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}

/** The Warteschlange landing: filter tile, a start-review call to action, and a
 *  preview of the top of the priority queue. */
function QueueLanding({
  typeCounts,
  rowsLength,
  bankFilter,
  defectOnly,
  openCount,
  filtered,
  decisionOf,
  setParam,
  t,
  lang,
}: {
  typeCounts: Map<ProvenanceContentType, number>;
  rowsLength: number;
  bankFilter: string;
  defectOnly: boolean;
  openCount: number;
  filtered: Row[];
  decisionOf: (id: string) => ReviewDecision | null;
  setParam: (key: string, value: string | null) => void;
  t: (de: string, en: string) => string;
  lang: "de" | "en";
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <FilterIcon className="h-3.5 w-3.5" /> {t("Filter", "Filter")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FacetChip
            active={bankFilter === ""}
            onClick={() => setParam("bank", null)}
            label={t("Alle Bänke", "All banks")}
            count={rowsLength}
          />
          {[...typeCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <FacetChip
                key={type}
                active={bankFilter === type}
                onClick={() => setParam("bank", bankFilter === type ? null : type)}
                label={TYPE_LABEL[type][lang]}
                count={count}
              />
            ))}
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={defectOnly}
            onChange={(e) => setParam("defect", e.target.checked ? "1" : null)}
            className="h-3.5 w-3.5 accent-[color:hsl(var(--primary))]"
          />
          {t("Nur Einträge mit Maschinen-Verdacht", "Only items with a machine flag")}
        </label>
      </div>

      {/* Start */}
      <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <b className="text-foreground">
            {openCount.toLocaleString(lang === "de" ? "de-DE" : "en-US")}{" "}
            {t("offene Einträge", "open items")}
          </b>{" "}
          {bankFilter && <span>· {TYPE_LABEL[bankFilter as ProvenanceContentType]?.[lang]} </span>}
          {t(
            "im aktuellen Filter. Entscheide sie einzeln mit Tastatur.",
            "in the current filter. Decide them one by one with the keyboard.",
          )}
        </p>
        <button
          type="button"
          onClick={() => setParam("mode", "pruefen")}
          disabled={openCount === 0}
          className={cn(
            "flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-all",
            openCount === 0
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-accent-gradient text-primary-foreground shadow-glow hover:brightness-105",
          )}
        >
          <Play className="h-4 w-4" /> {t("Prüfmodus starten", "Start review mode")}
        </button>
      </div>

      {/* Preview list (top of the filtered queue) */}
      <QueuePreview
        rows={filtered.slice(0, 40)}
        decisionOf={decisionOf}
        total={filtered.length}
        t={t}
        lang={lang}
      />
    </div>
  );
}

function FacetChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className={cn("tabular-nums", active ? "text-primary" : "text-muted-foreground/70")}>
        {count}
      </span>
    </button>
  );
}

function DecisionBadge({ decision, t }: { decision: ReviewDecision | null; t: (de: string, en: string) => string }) {
  if (!decision) return null;
  const meta: Record<ReviewDecision, { de: string; en: string; cls: string }> = {
    approve: { de: "Freigegeben", en: "Approved", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    reject: { de: "Abgelehnt", en: "Rejected", cls: "bg-danger/15 text-danger" },
    needs_fix: { de: "Nachbessern", en: "Needs fix", cls: "bg-warning/20 text-warning" },
  };
  const m = meta[decision];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", m.cls)}>{t(m.de, m.en)}</span>
  );
}

function QueuePreview({
  rows,
  decisionOf,
  total,
  t,
  lang,
}: {
  rows: Row[];
  decisionOf: (id: string) => ReviewDecision | null;
  total: number;
  t: (de: string, en: string) => string;
  lang: "de" | "en";
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>
          {t("Nächste im Filter", "Next in filter")}{" "}
          <span className="text-muted-foreground/60">
            ({rows.length}/{total.toLocaleString(lang === "de" ? "de-DE" : "en-US")})
          </span>
        </span>
        <span className="font-medium normal-case tracking-normal text-muted-foreground/60">
          {t(`Stand ${reviewQueueGeneratedAt}`, `as of ${reviewQueueGeneratedAt}`)}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => {
          const decision = decisionOf(r.id);
          return (
            <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
                {Math.round(r.score)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{r.label}</span>
              {r.defect > 0 && (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
              )}
              <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 sm:inline">
                {TYPE_LABEL[r.type][lang]}
              </span>
              <DecisionBadge decision={decision} t={t} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- The keyboard-driven review session (A3) ---------------- */

function ReviewSession({
  rows,
  api,
  reviews,
  reviewsLoaded,
  onExit,
  t,
  lang,
}: {
  rows: Row[];
  api: WorkbenchApi;
  reviews: Map<string, ProvenanceReview>;
  reviewsLoaded: boolean;
  onExit: () => void;
  t: (de: string, en: string) => string;
  lang: "de" | "en";
}) {
  // Freeze the working list once (undecided items in the current filter) so it
  // does not reshuffle as decisions land. Recomputed only when the filter set
  // identity changes (new rows array) or reviews first load.
  const working = useMemo(
    () => rows.filter((r) => (reviews.get(r.id)?.decision ?? null) == null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, reviewsLoaded],
  );

  const [cursor, setCursor] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const approveStreakRef = useRef(0);
  const [nudged, setNudged] = useState(false);
  const [item, setItem] = useState<unknown | undefined>(undefined);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const current: Row | undefined = working[cursor];

  // Load the full content item for rendering (heavy bank index, dynamic).
  useEffect(() => {
    if (!current) return;
    let alive = true;
    setItem(undefined);
    void import("@/lib/contentIndex").then(({ contentItemById }) => {
      if (alive) setItem(contentItemById(current.id));
    });
    // Reset the note editor for the new item.
    setNoteOpen(false);
    setNoteDraft(reviews.get(current.id)?.comment ?? "");
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const advance = useCallback(() => {
    setCursor((c) => Math.min(c + 1, working.length));
  }, [working.length]);

  const goBack = useCallback(() => setCursor((c) => Math.max(0, c - 1)), []);

  const decide = useCallback(
    async (decision: ReviewDecision, note: string) => {
      if (!current) return;
      const trimmed = note.trim();
      setSaveState("saving");
      // One shared review store: the cockpit writes through the same serialised
      // onChange the table uses, so the decision + fingerprint land once and the
      // "Alle Inhalte" table reflects it immediately.
      const ok = await api.onChange(current.id, { decision, comment: trimmed || null });
      if (ok) {
        setReviewedCount((n) => n + 1);
        // Rubber-stamp guard: count consecutive no-note approvals.
        if (decision === "approve" && !trimmed) {
          approveStreakRef.current += 1;
          if (approveStreakRef.current >= STREAK_NUDGE_AT && !nudged) setNudged(true);
        } else {
          approveStreakRef.current = 0;
        }
      }
      setSaveState(ok ? "saved" : "error");
      if (ok) advance();
    },
    [current, api, advance, nudged],
  );

  // Save the note on its OWN, without a decision: a note-only onChange (no
  // `decision`/`verified` in the patch) leaves the verdict + fingerprint
  // untouched, so the item stays in the queue for later. Does not advance.
  const saveNote = useCallback(async () => {
    if (!current) return;
    setSaveState("saving");
    const ok = await api.onChange(current.id, { comment: noteDraft.trim() || null });
    setSaveState(ok ? "saved" : "error");
  }, [current, api, noteDraft]);

  // Keyboard: V verify · X reject · N note · → skip · ← back · Esc exit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT");
      if (typing) {
        if (e.key === "Escape") (el as HTMLElement).blur();
        return;
      }
      switch (e.key.toLowerCase()) {
        case "v":
          e.preventDefault();
          void decide("approve", noteDraft);
          break;
        case "x":
          e.preventDefault();
          void decide("reject", noteDraft);
          break;
        case "n":
          e.preventDefault();
          setNoteOpen(true);
          setTimeout(() => noteRef.current?.focus(), 0);
          break;
        case "arrowright":
          e.preventDefault();
          advance();
          break;
        case "arrowleft":
          e.preventDefault();
          goBack();
          break;
        case "escape":
          e.preventDefault();
          onExit();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, advance, goBack, onExit, noteDraft]);

  useEffect(() => {
    try {
      if (localStorage.getItem(NUDGE_KEY) === "1") setNudged(false);
    } catch {
      /* ignore */
    }
  }, []);

  const done = !current;
  const ver = current?.ver;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {/* Progress header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> {t("Zur Liste", "To the list")}
        </button>
        <div className="text-xs font-semibold tabular-nums text-muted-foreground">
          {t(
            `${reviewedCount} entschieden · Warteschlange: ${Math.max(working.length - cursor, 0)}`,
            `${reviewedCount} decided · queue: ${Math.max(working.length - cursor, 0)}`,
          )}
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent-gradient transition-all"
          style={{
            width: `${working.length > 0 ? Math.min((cursor / working.length) * 100, 100) : 0}%`,
          }}
        />
      </div>

      {nudged && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3.5 text-xs text-foreground">
          <span>
            {t(
              `${STREAK_NUDGE_AT} Freigaben am Stück ohne Notiz. Vielleicht eine Stichprobe ziehen oder eine Pause machen? Qualität vor Tempo.`,
              `${STREAK_NUDGE_AT} approvals in a row with no note. Maybe sample a few or take a break? Quality over speed.`,
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              setNudged(false);
              approveStreakRef.current = 0;
              try {
                localStorage.setItem(NUDGE_KEY, "1");
              } catch {
                /* ignore */
              }
            }}
            className="shrink-0 font-semibold text-warning hover:underline"
          >
            {t("Verstanden", "Got it")}
          </button>
        </div>
      )}

      {done ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-3 text-lg font-extrabold">{t("Warteschlange leer", "Queue cleared")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              `${reviewedCount} Einträge in dieser Sitzung entschieden. Der Übergabe-Prompt auf der Übersicht übernimmt sie ins Repo.`,
              `${reviewedCount} items decided this session. The handoff prompt on the Overview applies them to the repo.`,
            )}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            {t("Fertig", "Done")}
          </button>
        </div>
      ) : (
        <>
          <ReviewCard row={current} item={item} ver={ver} t={t} lang={lang} />

          {/* Note editor. The note saves two ways: together with the
              Approve/Reject decision, OR on its own via "Notiz speichern"
              (which keeps the item in the queue, undecided). ⌘/Ctrl+Enter
              saves from inside the box. */}
          {noteOpen && (
            <div className="space-y-1.5">
              <textarea
                ref={noteRef}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void saveNote();
                  }
                }}
                placeholder={t("Notiz (bei Ablehnung: was ist falsch?)", "Note (on reject: what is wrong?)")}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {t(
                    "„Notiz speichern“ hält den Eintrag offen · Freigeben/Ablehnen speichert sie auch",
                    "“Save note” keeps the item open · Approve/Reject also saves it",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => void saveNote()}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Save className="h-3.5 w-3.5" />
                  {t("Notiz speichern", "Save note")}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={() => void decide("approve", noteDraft)}
              tone="approve"
              icon={<Check className="h-4 w-4" />}
              label={t("Freigeben", "Approve")}
              hint="V"
            />
            <ActionButton
              onClick={() => void decide("reject", noteDraft)}
              tone="reject"
              icon={<X className="h-4 w-4" />}
              label={t("Ablehnen", "Reject")}
              hint="X"
            />
            <ActionButton
              onClick={() => {
                setNoteOpen((o) => !o);
                setTimeout(() => noteRef.current?.focus(), 0);
              }}
              tone="ghost"
              icon={<StickyNote className="h-4 w-4" />}
              label={t("Notiz", "Note")}
              hint="N"
            />
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={goBack}
                disabled={cursor === 0}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground disabled:opacity-40"
                aria-label={t("Zurück", "Back")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={advance}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground"
                aria-label={t("Überspringen", "Skip")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Keyboard + save hint */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5" />
              {t("V Freigeben · X Ablehnen · N Notiz · → weiter · ← zurück", "V approve · X reject · N note · → next · ← back")}
            </span>
            <span
              className={cn(
                saveState === "error" && "text-danger",
                saveState === "saved" && "text-success",
              )}
            >
              {saveState === "saving"
                ? t("Speichern…", "Saving…")
                : saveState === "saved"
                  ? t("Gespeichert", "Saved")
                  : saveState === "error"
                    ? t("Speichern fehlgeschlagen", "Save failed")
                    : ""}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  tone,
  icon,
  label,
  hint,
}: {
  onClick: () => void;
  tone: "approve" | "reject" | "ghost";
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-bold transition-all",
        tone === "approve" && "bg-emerald-500 text-white shadow-soft hover:brightness-105",
        tone === "reject" && "bg-danger text-white shadow-soft hover:brightness-105",
        tone === "ghost" && "border border-border bg-surface text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      <kbd className="ml-0.5 rounded bg-black/10 px-1 text-[10px] font-bold dark:bg-white/15">{hint}</kbd>
    </button>
  );
}

/* ---------------- The review card: item as the learner sees it ---------------- */

function ReviewCard({
  row,
  item,
  ver,
  t,
  lang,
}: {
  row: Row;
  item: unknown;
  ver: Verification | undefined;
  t: (de: string, en: string) => string;
  lang: "de" | "en";
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{TYPE_LABEL[row.type][lang]}</span>
        <code className="font-mono normal-case text-muted-foreground/70">{row.id}</code>
      </div>

      <div className="p-5">
        <LearnerView type={row.type} item={item} fallbackLabel={row.label} t={t} />
      </div>

      {/* Machine-check panel */}
      <div className="border-t border-border bg-muted/30 px-4 py-3">
        <MachineChecks ver={ver} defect={row.defect} confidence={row.confidence} t={t} />
        {row.reference && (
          <a
            href={row.reference}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {t("Quelle öffnen", "Open source")}
          </a>
        )}
      </div>
    </div>
  );
}

/** Reads common bank fields defensively (the item is `unknown`). */
function field(item: unknown, key: string): string | undefined {
  if (item && typeof item === "object" && key in item) {
    const v = (item as Record<string, unknown>)[key];
    if (typeof v === "string") return v;
  }
  return undefined;
}

function nested(item: unknown, key: string): unknown {
  if (item && typeof item === "object" && key in item) return (item as Record<string, unknown>)[key];
  return undefined;
}

function LearnerView({
  type,
  item,
  fallbackLabel,
  t,
}: {
  type: ProvenanceContentType;
  item: unknown;
  fallbackLabel: string;
  t: (de: string, en: string) => string;
}) {
  if (item === undefined) {
    return <p className="text-sm text-muted-foreground">{t("Lädt…", "Loading…")}</p>;
  }
  if (item === null) {
    // The id resolves in provenance but not in a live bank (e.g. a retired id).
    return (
      <div className="text-sm">
        <p className="font-bold">{fallbackLabel}</p>
        <p className="mt-1 text-xs text-warning">
          {t("Kein Live-Inhalt zu dieser id gefunden.", "No live content found for this id.")}
        </p>
      </div>
    );
  }

  const de = field(item, "de") ?? field(item, "full") ?? field(item, "statement") ?? field(item, "titleDe") ?? field(item, "title") ?? field(item, "prompt") ?? fallbackLabel;
  const en = field(item, "en") ?? field(item, "titleEn") ?? field(item, "answer");
  const example = nested(item, "example") as { de?: string; en?: string } | undefined;

  return (
    <div className="space-y-2">
      <p className="text-xl font-extrabold tracking-tight">{de}</p>
      {field(item, "article") && (
        <p className="text-xs font-semibold text-muted-foreground">
          {field(item, "article")}
          {field(item, "plural") ? ` · ${field(item, "plural")}` : ""}
          {field(item, "pron") ? ` · [${field(item, "pron")}]` : ""}
        </p>
      )}
      {en && <p className="text-sm text-muted-foreground">{en}</p>}

      {/* One example sentence where the bank carries one */}
      {example?.de && (
        <p className="mt-2 border-t border-dashed border-border pt-2 text-sm">
          {example.de}
          {example.en && <span className="block text-xs text-muted-foreground">{example.en}</span>}
        </p>
      )}
      {/* Grammar drill: show the pattern/explain */}
      {type === "grammar_drill" && field(item, "explain") && (
        <p className="mt-2 border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
          {field(item, "explain")}
        </p>
      )}
      {/* Text bank: show the body (trimmed) */}
      {type === "text" && field(item, "de") && (
        <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-line border-t border-dashed border-border pt-2 text-sm text-muted-foreground">
          {field(item, "de")}
        </p>
      )}
    </div>
  );
}

function MachineChecks({
  ver,
  defect,
  confidence,
  t,
}: {
  ver: Verification | undefined;
  defect: number;
  confidence: number;
  t: (de: string, en: string) => string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">
          {t("Maschinen-Checks", "Machine checks")}
        </span>
        {ver ? (
          <span className="text-muted-foreground">
            {t("Stufe", "Tier")} <b className="text-foreground">{ver.tier}</b> ·{" "}
            {t("Konfidenz", "Confidence")} <b className="text-foreground">{Math.round(confidence * 100)}%</b>
          </span>
        ) : (
          <span className="text-muted-foreground">{t("keine (unverifiziert)", "none (unverified)")}</span>
        )}
        {defect > 0 && (
          <span className="inline-flex items-center gap-1 font-semibold text-warning">
            <AlertTriangle className="h-3 w-3" /> {t("Verdacht", "Flag")}
          </span>
        )}
      </div>
      {ver && ver.checks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ver.checks.map((c, i) => (
            <span
              key={i}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                c.result === "pass" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                c.result === "flag" && "bg-warning/20 text-warning",
                c.result === "fail" && "bg-danger/15 text-danger",
              )}
              title={c.detail}
            >
              {c.layer}: {c.result}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
