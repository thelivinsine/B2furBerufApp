import { useId, useMemo } from "react";
import { ChevronDown, Clock, TrendingUp } from "lucide-react";
import { PASS_PCT, type MockPartId } from "@/engine/exam";
import { isFullMockRun, type MockExamRecord } from "@/store/useProgressStore";
import { useStagePanel } from "@/features/shared/useStagePanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The ONE Verlauf card, and the pieces every Verlauf in the Prüfung zone is
 * built from (extracted from `PruefungHub` in s200).
 *
 * It moved out of the hub the moment a second page needed it: the founder asked
 * for a Verlauf on ALL FOUR module pages ("either keep verlauf in every module
 * or remove it from all of the individual modules"), and Lesen and Hören had
 * none. Rebuilding the card there would have been the fourth copy of a shape
 * the founder picked twice (V2 "Zahl und Kurve", M3 "Stärkeprofil"), so the
 * shell, the chart and the empty state live here and every Verlauf composes
 * them. It also keeps the hub OUT of the chooser chunks: importing
 * `PruefungHub` for one card would have dragged the writing-prompt bank behind
 * `mockExamAvailability` into `/lesen`.
 */

/** Runs listed before the learner asks for the rest (desktop; a phone rests at 0). */
export const VERLAUF_REST_ROWS = 3;

/** How many past runs a development chart plots. */
export const CHART_RUNS = 7;

/** Short German date for a `YYYY-MM-DD` record key. */
export function shortDate(date: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(
    new Date(`${date}T00:00:00`),
  );
}

/**
 * The shell every Verlauf shares: one card, one expandable list, one rule.
 *
 * `split` puts the summary and the list SIDE BY SIDE from lg up. The Module tab
 * needs it: a 2x2 grid, a four-column profile and a list stacked come to 930px,
 * which scrolls a 900px laptop on a page that is supposed to rest. Side by side
 * they come to 750px, and the card stops wasting the 400px of width the profile
 * does not use. The Modelltest tab's summary is already a left/right
 * composition and its page fits, so it stays stacked.
 */
export function VerlaufCard({
  count,
  open,
  onToggle,
  head,
  rows,
  restRows = VERLAUF_REST_ROWS,
  moreLabel,
  split = false,
  className,
}: {
  count: string;
  open: boolean;
  onToggle: () => void;
  head: React.ReactNode;
  rows: React.ReactNode[];
  restRows?: number;
  moreLabel: string;
  split?: boolean;
  className?: string;
}) {
  const panelRef = useStagePanel<HTMLDivElement>(open);
  const listId = useId();
  const shown = open ? rows : rows.slice(0, restRows);
  const hidden = rows.length - shown.length;
  // An empty Verlauf has no list and nothing to expand: it is the promise of
  // one (founder s195, option 2), so it holds the head alone and takes the room
  // the tab has left rather than leaving the lower half of the stage bare.
  const empty = rows.length === 0;
  const more = !empty && (hidden > 0 || open);
  const asSplit = split && !empty;

  return (
    <Card
      ref={panelRef}
      className={cn(
        // The scroll margins are what keep the tile's own borders visible when
        // it is scrolled into view: `scrollIntoView` knows nothing about the
        // sticky header or the fixed bottom bar, so without them the expanded
        // tile parks its lower edge underneath the tab bar.
        "flex scroll-mb-24 scroll-mt-20 flex-col overflow-hidden lg:scroll-mb-8",
        open ? "max-h-panel-stage" : empty ? "min-h-0 flex-1" : "flex-none",
        className,
      )}
    >
      <div className="flex flex-none items-baseline justify-between gap-3 px-4 pt-3 sm:px-5 lg:px-6">
        <p className="text-eyebrow text-muted-foreground">Verlauf</p>
        <p className="text-xs tabular-nums text-muted-foreground">{count}</p>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          // Proportional since s197, not a fixed 26rem left half: the card is
          // the hub's 40rem column now, and a fixed half would have left the
          // row list about 200px to fit a date, a mark, a module and a score.
          asSplit && "lg:grid lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:items-stretch",
        )}
      >
        <div
          className={cn(
            // Tightened in s197 (founder: the tile "looks unnecessarily big"):
            // the head no longer carries the card's tallest padding.
            "px-4 pb-2.5 pt-2 sm:px-5 sm:pb-3 lg:px-6",
            empty ? "flex min-h-0 flex-1 flex-col justify-center" : "flex-none",
            asSplit && "lg:flex lg:flex-col lg:justify-center lg:pb-3.5",
          )}
        >
          {head}
        </div>

        {asSplit && <div aria-hidden className="hidden bg-border lg:block" />}

        {!empty && (
          <div className={cn("flex min-h-0 flex-1 flex-col", asSplit && "lg:justify-center")}>
            {/* At rest a phone shows the summary only, because a 2x2 grid plus a
                summary plus a list does not fit one phone screen; from sm up the
                newest rows are listed too. Opening is what lets the page grow. */}
            <div
              id={listId}
              className={cn(
                "slim-scrollbar min-h-0 divide-y divide-border border-t border-border",
                asSplit && "lg:border-t-0",
                open ? "flex-1 overflow-y-auto" : "hidden flex-none sm:block",
              )}
            >
              {shown}
            </div>

            {more && (
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={listId}
                className={cn(
                  "flex flex-none items-center justify-center gap-1.5 border-t border-border py-2 text-xs font-semibold text-primary transition-colors hover:bg-muted/60",
                  asSplit && "lg:border-t-0",
                )}
              >
                {open ? "Weniger anzeigen" : moreLabel}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * The run history as bars against the pass line. The last bar is the gradient
 * one (it is the figure printed beside the chart), the best is outlined, and the
 * pass threshold is a dashed rule named in the caption rather than labelled on
 * the chart, where the label sat on top of the early bars.
 */
export function ScoreChart({ series, best }: { series: number[]; best: number }) {
  const H = 52;
  return (
    <div className="flex flex-col items-start">
      <div
        className="relative flex h-[52px] w-fit items-end gap-2"
        role="img"
        aria-label={
          series.length
            ? `Deine letzten ${series.length} Ergebnisse: ${series.join(" %, ")} %. Bestanden ab ${PASS_PCT} %.`
            : "Noch keine Ergebnisse"
        }
      >
        <span
          aria-hidden
          className="absolute -left-1.5 -right-1.5 border-t border-dashed border-success/70"
          style={{ bottom: (PASS_PCT / 100) * H }}
        />
        {series.map((t, i) => {
          const isNow = i === series.length - 1;
          const isTop = t === best && !isNow;
          return (
            <span
              key={i}
              className={cn(
                "w-8 rounded-t-[4px] sm:w-9",
                isNow
                  ? "bg-gradient-to-b from-primary to-[hsl(var(--gradient-to))]"
                  : isTop
                    ? "bg-primary/[0.16] ring-[1.5px] ring-inset ring-primary/55 dark:bg-primary/20 dark:ring-primary/70"
                    : "bg-primary/30 dark:bg-primary/40",
              )}
              style={{ height: Math.max(3, (t / 100) * H) }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        <span
          aria-hidden
          className="mr-1.5 inline-block w-3.5 border-t border-dashed border-success align-middle"
        />
        bestanden ab {PASS_PCT} %
      </p>
    </div>
  );
}

/** A run exists but produced no score (abandoned, or nothing gradeable). */
export function NoScoreYet({
  title = "Noch keine Bewertung",
  line = "Sitze einen Durchlauf zu Ende, dann steht hier dein Ergebnis.",
}: {
  title?: string;
  line?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Clock className="h-[17px] w-[17px]" />
      </span>
      <p className="text-[13px] leading-snug text-muted-foreground">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {line}
      </p>
    </div>
  );
}

/** The delta chip beside a leading score (up = green, flat/down = quiet). */
export function DeltaChip({ delta }: { delta: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums",
        delta > 0 ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <TrendingUp className={cn("h-3 w-3", delta < 0 && "-scale-y-100")} aria-hidden />
      {delta > 0 ? `+${delta}` : delta}
    </span>
  );
}

/* ----------------------------- one module's own ---------------------------- */

/** One scored sitting of ONE module, the row this page's Verlauf lists. */
export interface ModuleRun {
  id: string;
  date: string;
  level: string;
  pct: number | null;
}

/**
 * Every sitting of ONE module the learner has on record, newest first.
 *
 * A run that sat all four parts is a Modelltest and belongs to the Modelltest
 * Verlauf alone (`isFullMockRun`, the app's one rule for that), so a module page
 * lists module practice and nothing else. Bank-free on purpose: it reads the
 * progress store, so a chooser can show its history without pulling the hub in.
 */
export function moduleRuns(records: MockExamRecord[], part: MockPartId): ModuleRun[] {
  return records
    .filter((r) => !isFullMockRun(r) && part in r.parts)
    .map((r) => ({ id: `${r.id}|${part}`, date: r.date, level: r.level, pct: r.parts[part] ?? null }))
    .reverse();
}

/**
 * The Verlauf of ONE module (founder s200: a Verlauf on every module page).
 *
 * It is the Modelltest Verlauf's composition (founder pick V2, "Zahl und
 * Kurve") at module scale: the last score leads with its delta, Bester and
 * Versuche support it, and the same bar chart carries the shape of the history.
 * The rows differ in the one way the data does: a module page knows WHICH
 * module every row is, so the row prints the Niveau it was sat at instead of
 * repeating the module's own name.
 */
export function ModuleVerlaufCard({
  runs,
  open,
  onToggle,
  noun,
}: {
  runs: ModuleRun[];
  open: boolean;
  onToggle: () => void;
  /** What one sitting is called here ("Übung"). */
  noun: { one: string; many: string };
}) {
  const scored = useMemo(() => runs.filter((r) => r.pct != null), [runs]);
  const best = scored.length ? Math.max(...scored.map((r) => r.pct as number)) : null;
  const passed = scored.filter((r) => (r.pct as number) >= PASS_PCT).length;
  const last = scored[0]?.pct ?? null;
  const prev = scored[1]?.pct ?? null;
  const delta = last != null && prev != null ? last - prev : null;
  // Oldest first, so the chart reads left to right like a timeline.
  const series = scored.slice(0, CHART_RUNS).reverse().map((r) => r.pct as number);

  return (
    <VerlaufCard
      count={
        runs.length === 0
          ? `noch keine ${noun.one}`
          : `${runs.length} ${runs.length === 1 ? noun.one : noun.many}`
      }
      open={open}
      onToggle={onToggle}
      moreLabel={`Alle ${runs.length} anzeigen`}
      head={
        last == null ? (
          <NoScoreYet
            title="Noch kein Ergebnis"
            line={`Schließe eine ${noun.one} ab, dann steht hier dein Ergebnis.`}
          />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-5">
            <div className="flex flex-none flex-col justify-center">
              <p className="text-xs text-muted-foreground">Letzte {noun.one}</p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span className="text-display text-[2rem] leading-none tabular-nums">{last} %</span>
                {delta != null && delta !== 0 && <DeltaChip delta={delta} />}
              </p>
              <div className="mt-2 flex gap-5">
                <p className="text-xs text-muted-foreground">
                  <span className="block text-base font-bold tabular-nums text-foreground">
                    {best} %
                  </span>
                  Bester
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="block text-base font-bold tabular-nums text-foreground">
                    {passed} von {scored.length}
                  </span>
                  Bestanden
                </p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-end justify-start sm:justify-end">
              <ScoreChart series={series} best={best ?? 0} />
            </div>
          </div>
        )
      }
      rows={runs.map((r) => (
        <div key={r.id} className="flex w-full items-center gap-3 px-4 py-2 sm:px-5 lg:px-6">
          <span className="w-[72px] shrink-0 text-sm font-semibold tabular-nums">
            {shortDate(r.date)}
          </span>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {r.level}
          </Badge>
          <Badge
            variant={r.pct != null && r.pct >= PASS_PCT ? "success" : "muted"}
            className="ml-auto shrink-0 whitespace-nowrap tabular-nums"
          >
            {r.pct != null ? `${r.pct} %` : "ohne Punktzahl"}
          </Badge>
        </div>
      ))}
    />
  );
}
