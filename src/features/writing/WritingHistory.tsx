import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/uiLang";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Loader2,
  PenLine,
  Target,
  AlertCircle,
  Trash2,
  ChevronDown,
  Lightbulb,
  Sparkles,
  ArrowDown,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import type { WeaknessCategory } from "@/types";
import { themeById } from "@/data/themes";
import { practiceAreaById } from "@/data/practiceAreas";
import { writingTaskById } from "@/lib/writingScope";
import { diffWords } from "@/lib/wordDiff";
import { FeedbackLangChip } from "./FeedbackLang";
import {
  CorrectionToggle,
  FixTiles,
  MarkedParagraphs,
  MAX_FIX_TILES,
  useCorrectionDiff,
  type CorrectionViewMode,
} from "./correction";
import { valueLabel } from "@/features/writing/fokus/grammarDimensions";
import {
  getFokusHistory,
  deleteSentenceCheck,
  type FokusHistoryEntry,
} from "@/lib/sentenceStudio";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import {
  getWritingHistory,
  deleteWritingEvaluation,
  type WritingHistoryEntry,
} from "@/lib/writing";
import { useSessionStore } from "@/store/useSessionStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** How many calendar months the development card compares. */
const TREND_MONTHS = 3;
/**
 * A month needs at least this many texts before it counts as a comparison
 * point. Without the floor a quiet month (one text, so almost no findings)
 * would read as a big improvement, or as a relapse the moment writing resumes.
 */
const MIN_TEXTS_PER_MONTH = 2;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Compact date for narrow rows ("16. Jun"). */
function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(
    new Date(iso),
  );
}

function monthKeyOf(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", { month: "short" }).format(new Date(y, m - 1, 1));
}

/** The last n calendar month keys, oldest first. */
function lastMonthKeys(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

/**
 * The learner's text with its correction (s171): the same Original/Korrigiert
 * language as Fokus, so a correction reads identically wherever it appears.
 * Coral marks the wrong words in the original, green marks the fixes, and the
 * Himmelblau tiles name the category of each edit. Everything is computed in the
 * browser from the two texts (`diffWords`), so there is no extra AI cost.
 *
 * Every piece comes from `../correction` (s172), Fokus's own: the copies here had
 * already drifted (no "→", an em dash for an empty side), so the same edit read
 * differently in the Verlauf than in the trainer that produced it.
 */
function CorrectionView({ original, corrected }: { original: string; corrected: string }) {
  const [view, setView] = useState<CorrectionViewMode>("corr");
  const { paragraphs, changes } = useCorrectionDiff(original, corrected);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <PenLine className="h-3.5 w-3.5" /> Dein Text
        </p>
        <CorrectionToggle view={view} onChange={setView} />
      </div>

      <MarkedParagraphs paragraphs={paragraphs} view={view} />

      {changes.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <FixTiles changes={changes} max={MAX_FIX_TILES} />
        </>
      )}
    </div>
  );
}

/** Himmelblau weakness chip (squircle, never a fully round badge). */
function WeaknessChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-accent/50 bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-ink dark:border-accent/25 dark:bg-accent/10">
      {children}
    </span>
  );
}

/**
 * "Deine Entwicklung" — the card that leads the Verlauf (founder pick C): are the
 * same mistakes still happening, or fewer of them? Falls back to plain totals
 * until there are two months to compare, so it never implies a trend it cannot
 * prove.
 */
function WeaknessTrend({ entries }: { entries: WritingHistoryEntry[] }) {
  const t = useT();
  const navigate = useNavigate();

  const model = useMemo(() => {
    const months = lastMonthKeys(TREND_MONTHS);
    const textsPerMonth = months.map(() => 0);
    const totals = new Map<WeaknessCategory, number>();
    const perMonth = new Map<WeaknessCategory, number[]>();

    for (const e of entries) {
      const idx = months.indexOf(monthKeyOf(e.created_at));
      if (idx >= 0) textsPerMonth[idx] += 1;
      if (!e.weakness) continue;
      totals.set(e.weakness, (totals.get(e.weakness) ?? 0) + 1);
      if (idx >= 0) {
        const arr = perMonth.get(e.weakness) ?? months.map(() => 0);
        arr[idx] += 1;
        perMonth.set(e.weakness, arr);
      }
    }

    const ranked = [...totals.entries()].sort(([, a], [, b]) => b - a);
    // Compare the first and last months that carry enough writing to mean
    // something, never a month the learner skipped.
    const solid = months.flatMap((_, i) => (textsPerMonth[i] >= MIN_TEXTS_PER_MONTH ? [i] : []));
    const comparable = solid.length >= 2;
    const fromIdx = solid[0];
    const toIdx = solid[solid.length - 1];

    const top = ranked.slice(0, 3).map(([weakness, total]) => {
      const counts = perMonth.get(weakness) ?? months.map(() => 0);
      const first = comparable ? counts[fromIdx] : 0;
      const last = comparable ? counts[toIdx] : 0;
      return {
        weakness,
        total,
        counts,
        direction: !comparable
          ? null
          : last < first
            ? ("down" as const)
            : last > first
              ? ("up" as const)
              : ("flat" as const),
        dropPct: comparable && first > 0 && last < first
          ? Math.round(((first - last) / first) * 100)
          : 0,
      };
    });

    const peak = Math.max(1, ...top.flatMap((t) => t.counts));
    const bestDrop = [...top].sort((a, b) => b.dropPct - a.dropPct)[0];

    return { months, textsPerMonth, ranked, top, peak, comparable, bestDrop };
  }, [entries]);

  if (model.ranked.length === 0) return null;

  const topArea = practiceAreaById(model.ranked[0][0]);
  const showTrend = model.comparable;
  const improvement =
    showTrend && model.bestDrop && model.bestDrop.dropPct > 0 ? model.bestDrop : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-eyebrow text-muted-foreground">{t("Deine Entwicklung")}</p>
          {improvement && (
            <Badge variant="success">
              {practiceAreaById(improvement.weakness)?.labelDe ?? improvement.weakness}:{" "}
              {improvement.dropPct} % weniger
            </Badge>
          )}
        </div>

        {/* The monthly layout is ALWAYS the shape of this card (founder s171
            follow-up: the earlier totals-only fallback read as a different card
            from the approved preview). What waits for evidence is the CLAIM: the
            arrows and the "% weniger" badge appear only once two months carry
            enough writing to compare. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {model.top.map(({ weakness, counts, direction }) => {
              const area = practiceAreaById(weakness);
              const Arrow =
                direction === "down"
                  ? ArrowDown
                  : direction === "up"
                    ? ArrowUp
                    : direction === "flat"
                      ? ArrowRight
                      : null;
              return (
                <div key={weakness}>
                  <div className="flex h-12 items-end gap-1.5 sm:h-16" aria-hidden>
                    {counts.map((n, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-t-sm",
                          n === 0 && "bg-muted",
                        )}
                        style={{
                          height: `${Math.max(4, (n / model.peak) * 100)}%`,
                          ...(n > 0
                            ? {
                                background: `hsl(var(--primary) / ${(
                                  0.25 +
                                  (i / Math.max(1, counts.length - 1)) * 0.75
                                ).toFixed(2)})`,
                              }
                            : {}),
                        }}
                      />
                    ))}
                  </div>
                  {/* Inline icon, so a two-line label keeps its arrow attached. */}
                  <p className="mt-1.5 text-sm font-semibold">
                    {area?.labelDe ?? weakness}{" "}
                    {Arrow && (
                      <Arrow
                        className={cn(
                          "inline-block h-3.5 w-3.5 align-[-2px]",
                          direction === "down" && "text-success",
                          direction === "up" && "text-warning",
                          direction === "flat" && "text-muted-foreground",
                        )}
                      />
                    )}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {counts
                      .map(
                        (n, i) =>
                          // A month without texts shows "–": no writing is not
                          // the same as no mistakes.
                          `${monthLabel(model.months[i])} ${model.textsPerMonth[i] > 0 ? n : "–"}`,
                      )
                      .join(" · ")}
                  </p>
                </div>
              );
          })}
        </div>

        {/* Explains the missing arrows while the evidence is thin. */}
        {!showTrend && (
          <p className="text-xs text-muted-foreground">
            Der Trend erscheint ab dem zweiten Monat.
          </p>
        )}

        {topArea && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">
              Größte Schwachstelle:{" "}
              <span className="font-medium text-foreground">{topArea.labelDe}</span>
            </p>
            <Button size="sm" onClick={() => navigate(topArea.route)}>
              <Target className="h-3.5 w-3.5" /> Jetzt üben
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type ModeFilter = "alle" | "fokus" | "short" | "long";

const MODE_LABEL: Record<ModeFilter, string> = {
  alle: "Alle",
  fokus: "Fokus",
  short: "Kurz",
  long: "Lang",
};

/** Compact segmented filter in the shipped switcher language (grey track, white pill). */
function ModeSwitcher({
  value,
  tabs,
  onChange,
}: {
  value: ModeFilter;
  /** Only the kinds actually on record, so no segment can yield nothing. */
  tabs: ModeFilter[];
  onChange: (v: ModeFilter) => void;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(value);
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label="Nach Art filtern"
      className="relative flex items-stretch gap-0.5 rounded-lg border border-border bg-muted p-1"
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute bottom-1 top-1 left-0 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <button
            key={tab}
            ref={registerItem(tab)}
            onClick={() => onChange(tab)}
            role="tab"
            aria-selected={active}
            className={cn(
              "relative z-10 rounded-md px-3 py-1.5 text-xs leading-none transition-colors",
              active ? "font-bold text-primary" : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {MODE_LABEL[tab]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * One history row. Compact by default (concept C): date, theme, kind, weakness.
 * The tip, the learner's own text, and the destructive action live behind the
 * disclosure, so a long history stays scannable.
 */
function HistoryEntry({
  entry,
  index,
  onDelete,
}: {
  entry: WritingHistoryEntry;
  index: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const t = useT();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const theme = themeById(entry.theme);
  // s167: resolve the recorded task id back to the Aufgabe.
  const task = writingTaskById(entry.task_id);
  const area = practiceAreaById(entry.weakness);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tipEnglish, setTipEnglish] = useState(false);

  const remove = async () => {
    setDeleting(true);
    await onDelete(entry.id);
    // On failure the parent keeps the row and toasts; reset so the user can retry.
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.16 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full flex-wrap items-center gap-2 p-4 text-left transition-colors hover:bg-muted/40"
        >
          {/* Narrow screens get the short date and NO Thema badge, so the row
              stays ONE line (founder s171 follow-up): date + Art + weakness chip
              are what the learner scans, and a long Thema pushed the chip onto a
              second line. Nothing is lost, since the expanded row opens with the
              Aufgabe, which names the topic in full. */}
          <span className="text-xs font-medium tabular-nums text-muted-foreground sm:hidden">
            {formatDateShort(entry.created_at)}
          </span>
          <span className="hidden text-xs font-medium tabular-nums text-muted-foreground sm:inline">
            {formatDate(entry.created_at)}
          </span>
          {theme && (
            <Badge variant="muted" className="hidden sm:inline-flex">
              {theme.titleDe}
            </Badge>
          )}
          <Badge variant="outline">{entry.length === "short" ? "Kurz" : "Lang"}</Badge>
          <span className="ml-auto flex items-center gap-2">
            {area && <WeaknessChip>{area.labelDe}</WeaknessChip>}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </span>
        </button>

        {expanded && (
          <CardContent className="space-y-3 border-t border-border p-4">
            {/* The Thema left the collapsed row on narrow screens, so it reappears
                here: an older entry carries no stored Aufgabe, and without this the
                topic would be invisible on a phone. */}
            {theme && (
              <Badge variant="muted" className="sm:hidden">
                {theme.titleDe}
              </Badge>
            )}

            {/* Read in the order it happened: the task, the answer, then the
                advice, which lands next to the practice button. The Aufgabe is
                resolvable again since evaluations record the permanent
                `task_id` (s167); older rows without one simply omit it. */}
            {task && (
              <div className="space-y-1.5 rounded-xl border border-accent/50 bg-accent/20 p-3.5 dark:border-accent/25 dark:bg-accent/10">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                  <Target className="h-3.5 w-3.5" /> Aufgabe
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">{task.text}</p>
                {task.points?.length ? (
                  <ul className="space-y-1 pt-0.5">
                    {task.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-relaxed">
                        <span
                          aria-hidden
                          className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent-ink"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            {entry.text?.trim() && entry.corrected_text?.trim() ? (
              <CorrectionView original={entry.text} corrected={entry.corrected_text} />
            ) : (
              <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <PenLine className="h-3.5 w-3.5" /> Dein Text
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {entry.text?.trim() ? entry.text : "Kein Text gespeichert."}
                </p>
              </div>
            )}

            {/* The headline result of the evaluation. */}
            <div className="space-y-2 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Wichtigster Tipp
                </p>
              </div>
              {/* Same DE/EN chip as the fresh result (founder 2026-07-31), so a
                  tip reads identically wherever the learner meets it. Rows from
                  before migration 0014 carry no English and show no chip. */}
              <p className="text-sm leading-relaxed text-foreground/90">
                {tipEnglish && entry.insight_en ? entry.insight_en : entry.insight}
                {entry.insight_en && (
                  <FeedbackLangChip
                    showEnglish={tipEnglish}
                    onChange={setTipEnglish}
                    className="ml-1.5 align-middle"
                  />
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {confirming ? (
                <span className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={remove}
                    disabled={deleting}
                    className="flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                  >
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {t("Löschen")}
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  aria-label={t("Auswertung löschen")}
                  className="text-muted-foreground transition-colors hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {area && (
                <Button size="sm" variant="outline" onClick={() => navigate(area.route)}>
                  <Target className="h-3.5 w-3.5" /> {area.labelDe} üben
                </Button>
              )}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 shrink-0" />
              {t("KI-generierte Rückmeldung")}
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * One checked Fokus sentence (s171). Every check has been persisted since s147,
 * so this history reaches back over everything already practised. Same compact
 * row and same correction language as a Kurz/Lang entry: the point of one Verlauf
 * is that a correction reads identically whichever trainer produced it.
 */
function FokusEntry({
  entry,
  index,
  onDelete,
}: {
  entry: FokusHistoryEntry;
  index: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const corrected =
    entry.has_errors && entry.corrected?.trim() ? entry.corrected.trim() : null;
  const fixCount = useMemo(
    () => (corrected ? diffWords(entry.source_text, corrected).changes.length : 0),
    [entry.source_text, corrected],
  );
  // The form the Satzlabor detected, which is what the transform pills act on.
  const detected = [
    valueLabel("voice", entry.grammar?.voice ?? null),
    valueLabel("tense", entry.grammar?.tense ?? null),
    valueLabel("mood", entry.grammar?.mood ?? null),
  ]
    .filter(Boolean)
    .join(" · ");

  const remove = async () => {
    setDeleting(true);
    await onDelete(entry.id);
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.16 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full flex-wrap items-center gap-2 p-4 text-left transition-colors hover:bg-muted/40"
        >
          <span className="text-xs font-medium tabular-nums text-muted-foreground sm:hidden">
            {formatDateShort(entry.created_at)}
          </span>
          <span className="hidden text-xs font-medium tabular-nums text-muted-foreground sm:inline">
            {formatDate(entry.created_at)}
          </span>
          <Badge variant="outline">Fokus</Badge>
          <span className="ml-auto flex items-center gap-2">
            {fixCount > 0 ? (
              <WeaknessChip>
                {fixCount} {fixCount === 1 ? "Korrektur" : "Korrekturen"}
              </WeaknessChip>
            ) : (
              <Badge variant="success">fehlerfrei</Badge>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </span>
        </button>

        {expanded && (
          <CardContent className="space-y-3 border-t border-border p-4">
            {corrected ? (
              <CorrectionView original={entry.source_text} corrected={corrected} />
            ) : (
              <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <PenLine className="h-3.5 w-3.5" /> Dein Satz
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">{entry.source_text}</p>
              </div>
            )}

            {detected && (
              <p className="text-xs text-muted-foreground">
                Erkannt: <span className="font-medium text-foreground">{detected}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {confirming ? (
                <span className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={remove}
                    disabled={deleting}
                    className="flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                  >
                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {t("Löschen")}
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  aria-label={t("Satz löschen")}
                  className="text-muted-foreground transition-colors hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 shrink-0" />
                {t("KI-generierte Rückmeldung")}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export function WritingHistory() {
  const t = useT();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WritingHistoryEntry[]>([]);
  const [fokus, setFokus] = useState<FokusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState({ writing: false, fokus: false });
  const [mode, setMode] = useState<ModeFilter>("alle");
  const showToast = useSessionStore((s) => s.showToast);

  const handleDelete = async (id: string) => {
    const ok = await deleteWritingEvaluation(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast("Auswertung gelöscht.", "success");
    } else {
      // Loud failure (e.g. the DELETE RLS policy isn't live yet), never a silent no-op.
      showToast("Löschen fehlgeschlagen. Bitte versuche es erneut.", "warning");
    }
  };

  const handleDeleteFokus = async (id: string) => {
    const ok = await deleteSentenceCheck(id);
    if (ok) {
      setFokus((prev) => prev.filter((e) => e.id !== id));
      showToast("Satz gelöscht.", "success");
    } else {
      showToast("Löschen fehlgeschlagen. Bitte versuche es erneut.", "warning");
    }
  };

  const load = async () => {
    setLoading(true);
    const [w, f] = await Promise.all([getWritingHistory(30), getFokusHistory(30)]);
    setEntries(w ?? []);
    setFokus(f ?? []);
    setFailed({ writing: w === null, fokus: f === null });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // One chronological list across both trainers, newest first, then capped: the
  // section says "letzte Auswertungen", and each source is already limited to 30.
  const rows = useMemo(() => {
    const merged = [
      ...entries.map((e) => ({ kind: "writing" as const, at: e.created_at, w: e })),
      ...fokus.map((e) => ({ kind: "fokus" as const, at: e.created_at, f: e })),
    ];
    merged.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
    return merged.slice(0, 30);
  }, [entries, fokus]);

  // The filter offers only the kinds actually on record, and appears only when
  // there is more than one: a segment that can yield nothing reads as broken.
  const kinds: ModeFilter[] = [
    ...(fokus.length > 0 ? (["fokus"] as ModeFilter[]) : []),
    ...(entries.some((e) => e.length === "short") ? (["short"] as ModeFilter[]) : []),
    ...(entries.some((e) => e.length === "long") ? (["long"] as ModeFilter[]) : []),
  ];
  const tabs: ModeFilter[] = ["alle", ...kinds];
  const shown = rows.filter((r) => {
    if (mode === "alle") return true;
    if (mode === "fokus") return r.kind === "fokus";
    return r.kind === "writing" && r.w.length === mode;
  });
  // A partial failure must not masquerade as a short history.
  const partialFailure =
    (failed.writing || failed.fokus) && !(failed.writing && failed.fokus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Only a total failure replaces the page; a partial one is reported under the
  // list, so the half that loaded is still usable.
  if (failed.writing && failed.fokus) {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="space-y-2">
            <p className="font-medium">{t("Verlauf konnte nicht geladen werden")}</p>
            <Button size="sm" variant="outline" onClick={load}>
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted/50 p-4">
            <PenLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">{t("Noch keine Auswertungen")}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("Reiche deinen ersten Text ein und sieh hier deine Schwachstellen im Verlauf.")}
          </p>
          <Button variant="gradient" onClick={() => navigate("/writing?mode=kurz")}>
            <PenLine className="h-4 w-4" /> Ersten Text schreiben
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <WeaknessTrend entries={entries} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-eyebrow text-muted-foreground">Letzte Auswertungen</p>
          <Badge variant="muted" className="tabular-nums">
            {shown.length}
          </Badge>
          {kinds.length > 1 && (
            <div className="ml-auto">
              <ModeSwitcher value={mode} tabs={tabs} onChange={setMode} />
            </div>
          )}
        </div>
        {shown.map((row, i) =>
          row.kind === "writing" ? (
            <HistoryEntry key={row.w.id} entry={row.w} index={i} onDelete={handleDelete} />
          ) : (
            <FokusEntry key={row.f.id} entry={row.f} index={i} onDelete={handleDeleteFokus} />
          ),
        )}

        {partialFailure && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <p className="text-xs text-muted-foreground">
              {failed.fokus ? "Deine Fokus-Sätze" : "Deine Textauswertungen"} konnten nicht geladen
              werden.
            </p>
            <Button size="sm" variant="outline" onClick={load}>
              Erneut versuchen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
