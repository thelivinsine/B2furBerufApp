import { useEffect, useMemo, useState } from "react";
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
          <p className="text-eyebrow text-muted-foreground">Deine Entwicklung</p>
          {improvement && (
            <Badge variant="success">
              {practiceAreaById(improvement.weakness)?.labelDe ?? improvement.weakness}:{" "}
              {improvement.dropPct} % weniger
            </Badge>
          )}
        </div>

        {showTrend ? (
          <div className="grid gap-4 sm:grid-cols-3">
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
                  <div className="flex h-16 items-end gap-1.5" aria-hidden>
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
        ) : (
          <div className="space-y-3">
            <div className="space-y-2.5">
              {model.ranked.slice(0, 5).map(([weakness, count], i) => {
                const area = practiceAreaById(weakness);
                return (
                  <div key={weakness} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("font-medium", i === 0 && "text-primary")}>
                        {area?.labelDe ?? weakness}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{count}×</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          i === 0 ? "bg-primary" : "bg-muted-foreground/40",
                        )}
                        style={{ width: `${Math.round((count / model.ranked[0][1]) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Der Trend erscheint ab dem zweiten Monat.</p>
          </div>
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

type ModeFilter = "alle" | "short" | "long";

const MODE_TABS: { id: ModeFilter; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "short", label: "Kurz" },
  { id: "long", label: "Lang" },
];

/** Compact segmented filter in the shipped switcher language (grey track, white pill). */
function ModeSwitcher({
  value,
  onChange,
}: {
  value: ModeFilter;
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
      {MODE_TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={registerItem(tab.id)}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={active}
            className={cn(
              "relative z-10 rounded-md px-3 py-1.5 text-xs leading-none transition-colors",
              active ? "font-bold text-primary" : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
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
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const theme = themeById(entry.theme);
  // s167: resolve the recorded task id back to the Aufgabe.
  const task = writingTaskById(entry.task_id);
  const area = practiceAreaById(entry.weakness);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {formatDate(entry.created_at)}
          </span>
          {theme && <Badge variant="muted">{theme.titleDe}</Badge>}
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

            <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <PenLine className="h-3.5 w-3.5" /> Dein Text
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {entry.text?.trim() ? entry.text : "Kein Text gespeichert."}
              </p>
            </div>

            {/* The headline result of the evaluation. */}
            <div className="space-y-2 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Wichtigster Tipp
                </p>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{entry.insight}</p>
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
                    Löschen
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  aria-label="Auswertung löschen"
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
              KI-generierte Rückmeldung
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

export function WritingHistory() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WritingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

  const load = async () => {
    setLoading(true);
    setError(false);
    const data = await getWritingHistory(30);
    if (data === null) {
      setError(true);
    } else {
      setEntries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // The filter only appears when it can actually sort something: with a single
  // kind of text on record it would be chrome with nothing to do.
  const hasShort = entries.some((e) => e.length === "short");
  const hasLong = entries.some((e) => e.length === "long");
  const shown = mode === "alle" ? entries : entries.filter((e) => e.length === mode);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="space-y-2">
            <p className="font-medium">Verlauf konnte nicht geladen werden</p>
            <Button size="sm" variant="outline" onClick={load}>
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted/50 p-4">
            <PenLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">Noch keine Auswertungen</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Reiche deinen ersten Text ein und sieh hier deine Schwachstellen im Verlauf.
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
          {hasShort && hasLong && (
            <div className="ml-auto">
              <ModeSwitcher value={mode} onChange={setMode} />
            </div>
          )}
        </div>
        {shown.map((e, i) => (
          <HistoryEntry key={e.id} entry={e} index={i} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
