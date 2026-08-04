import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight, Clock, Play } from "lucide-react";
import {
  HUB_LEVELS,
  MOCK_PART_ORDER,
  PART_LABEL,
  PART_MINUTES,
  PASS_PCT,
  mockExamAvailability,
  type HubLevel,
  type MockExamLevel,
  type MockPartId,
} from "@/engine/exam";
import { useExamStore } from "@/store/useExamStore";
import { useProgressStore, type MockExamRecord } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysBetween, todayKey } from "@/lib/utils";
import { PART_META } from "./partMeta";
import { MockExamRunner } from "./MockExamRunner";

/** Newest runs shown in Verlauf; older ones stay in the record, unlisted. */
const VERLAUF_ROWS = 5;

/**
 * Modelltest hub (redesign s188, founder pick "Prüfungstag" from
 * `preview/exam-hub-redesign.html`).
 *
 * The page leads with the RUN: one band that visibly contains the four parts as
 * a timeline, which is what removes the duplicated minutes the s186 layout
 * printed twice (a "4 Teile · 52 Min" line on top of four cards each stating
 * their own). Practising one part sits below it as rows, and past results live
 * in ONE place, the Verlauf block (founder: not on the band, not on the rows).
 * The Niveau row became the shipped sliding-pill switcher beside the title, and
 * the HubHero (icon tile + "Prüfung" eyebrow) is gone with it.
 */
export function ExamHub() {
  const run = useExamStore((s) => s.run);
  const start = useExamStore((s) => s.start);
  const mockExams = useProgressStore((s) => s.mockExams);
  const settingsLevel = useSettingsStore((s) => s.level);
  const examDate = useSettingsStore((s) => s.examDate);
  const [level, setLevel] = useState<HubLevel>(() =>
    (HUB_LEVELS as readonly string[]).includes(settingsLevel) ? (settingsLevel as HubLevel) : "B2",
  );

  // A running (or just finished, un-dismissed) exam takes over the route, so
  // a reload lands back inside the simulation, never on the hub.
  if (run) return <MockExamRunner />;

  const avail = mockExamAvailability(level);
  const servable = level !== "A2";

  const runs = mockExams
    .filter((m) => m.level === level)
    .slice(-VERLAUF_ROWS)
    .reverse();

  const partCount = (part: MockPartId) =>
    part === "lesen"
      ? avail.lesen
      : part === "hoeren"
        ? avail.hoeren
        : part === "schreiben"
          ? avail.schreiben
          : avail.sprechen;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header: the title and the Niveau it serves, on one line. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-display text-2xl sm:text-3xl">Modelltest</h1>
        <LevelSwitcher level={level} onSelect={setLevel} />
      </div>

      {/* The run itself: the four parts as the shape of the exam day. */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-eyebrow text-muted-foreground">Komplette Prüfung</p>
            <ExamCountdown examDate={examDate} />
          </div>

          <PartTrack />

          <div className="mt-4 flex items-center justify-end border-t border-border pt-4">
            {servable && avail.complete ? (
              <Button
                variant="gradient"
                className="w-full sm:w-auto"
                onClick={() => start(level as MockExamLevel)}
              >
                <Play className="h-4 w-4" /> Prüfung starten
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">Noch keine Inhalte</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* One part at a time, same draw, same timer. */}
      <div>
        <p className="mb-2 ml-0.5 text-eyebrow text-muted-foreground">Einzeln üben</p>
        <Card className="divide-y divide-border overflow-hidden">
          {MOCK_PART_ORDER.map((part, i) => {
            const meta = PART_META[part];
            const Icon = meta.icon;
            const canStart = servable && partCount(part) > 0;
            const body = (
              <>
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    meta.tile,
                    !canStart && "opacity-50",
                  )}
                >
                  <Icon className={cn("h-5 w-5", meta.ink)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-semibold",
                      !canStart && "text-muted-foreground",
                    )}
                  >
                    {PART_LABEL[part]}
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                    {canStart ? `${meta.desc} · ${PART_MINUTES[part]} Min` : "Noch keine Inhalte"}
                  </span>
                </span>
                {canStart && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary">
                    Starten <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </>
            );
            return (
              <motion.div
                key={part}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.16), duration: 0.16 }}
              >
                {canStart ? (
                  <button
                    type="button"
                    onClick={() => start(level as MockExamLevel, [part])}
                    className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/40 sm:p-4"
                  >
                    {body}
                  </button>
                ) : (
                  <div className="flex w-full items-center gap-3 p-3 sm:p-4">{body}</div>
                )}
              </motion.div>
            );
          })}
        </Card>
      </div>

      {/* The one place a past result is shown (founder s188). */}
      {runs.length > 0 && <Verlauf runs={runs} />}
    </div>
  );
}

/* ------------------------------- Niveau row ------------------------------- */

/**
 * Niveau as the shipped sliding-pill switcher (`useSlidingPill`, one always
 * mounted pill), so the hub reuses the Bibliothek/Schreiben toggle language
 * instead of the loose label + four buttons the s186 layout stacked on top.
 */
function LevelSwitcher({
  level,
  onSelect,
}: {
  level: HubLevel;
  onSelect: (l: HubLevel) => void;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(level);

  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="group"
      aria-label="Niveau"
      className="relative flex w-full items-stretch gap-0.5 rounded-lg border border-border bg-muted p-1 shadow-soft sm:w-auto sm:gap-1"
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute bottom-1 left-0 top-1 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {HUB_LEVELS.map((lv) => {
        const active = level === lv;
        return (
          <button
            key={lv}
            ref={registerItem(lv) as React.Ref<HTMLButtonElement>}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(lv)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors sm:flex-none",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lv}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Run band -------------------------------- */

/** The four parts in exam order, connected: the shape of the whole run. */
function PartTrack() {
  return (
    <div className="relative mt-3.5 flex items-start justify-between">
      {/* One full line behind the row, inset to the first and last tile centre
          (a per-node border would stop mid-row at the outer nodes). */}
      <span
        aria-hidden
        className="absolute left-[12.5%] right-[12.5%] top-[21px] h-0.5 bg-border"
      />
      {MOCK_PART_ORDER.map((part) => {
        const meta = PART_META[part];
        const Icon = meta.icon;
        return (
          <div key={part} className="relative flex flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-surface",
                meta.tile,
              )}
            >
              <Icon className={cn("h-5 w-5", meta.ink)} />
            </span>
            <span className="text-xs font-semibold sm:text-sm">{PART_LABEL[part]}</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {PART_MINUTES[part]} Min
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The countdown lives on the page it belongs to (it was only in Fortschritt),
 * and retires itself once the date has passed, so it can never sit at "0 Tage"
 * forever.
 */
function ExamCountdown({ examDate }: { examDate: string | null }) {
  if (!examDate || examDate < todayKey()) return null;
  const days = Math.max(0, daysBetween(todayKey(), examDate));
  const label = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" }).format(
    new Date(`${examDate}T00:00:00`),
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {days === 0 ? "Heute ist Prüfungstag" : `Noch ${days} Tage bis zum ${label}`}
    </span>
  );
}

/* --------------------------------- Verlauf -------------------------------- */

function Verlauf({ runs }: { runs: MockExamRecord[] }) {
  return (
    <div>
      <p className="mb-2 ml-0.5 text-eyebrow text-muted-foreground">Verlauf</p>
      <Card className="divide-y divide-border overflow-hidden">
        {runs.map((r) => (
          <VerlaufRow key={r.id} record={r} />
        ))}
      </Card>
    </div>
  );
}

function VerlaufRow({ record }: { record: MockExamRecord }) {
  const [expanded, setExpanded] = useState(false);
  const date = useMemo(
    () =>
      new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(
        new Date(`${record.date}T00:00:00`),
      ),
    [record.date],
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/40 sm:gap-4 sm:p-4"
      >
        <span className="w-[62px] shrink-0 text-sm font-semibold tabular-nums sm:w-[76px]">
          {date}
        </span>
        {/* Four segments in exam order: which part carried the run, at a glance.
            A single-part run leaves the other three tracks empty, which is the
            honest picture of what was actually sat. */}
        <span className="flex min-w-0 max-w-[320px] flex-1 gap-1">
          {MOCK_PART_ORDER.map((part) => {
            const pct = record.parts[part];
            return (
              <span key={part} className="h-1.5 flex-1 rounded-full bg-muted">
                {pct != null && (
                  <span
                    className={cn("block h-full rounded-full", PART_META[part].bar)}
                    style={{ width: `${pct}%` }}
                  />
                )}
              </span>
            );
          })}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {record.total != null && (
            <Badge
              variant={record.total >= PASS_PCT ? "success" : "muted"}
              className="tabular-nums"
            >
              {record.total} %
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </span>
      </button>

      {/* Stacked label over value: a label-left / value-right row stretches the
          pair to opposite ends of a wide column and stops reading as one fact. */}
      {expanded && (
        <div className="grid grid-cols-4 gap-3 border-t border-border p-3 sm:p-4">
          {MOCK_PART_ORDER.map((part) => {
            const pct = record.parts[part];
            return (
              <div key={part}>
                <p className="text-xs text-muted-foreground">{PART_LABEL[part]}</p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold tabular-nums",
                    pct == null && "font-normal text-muted-foreground",
                  )}
                >
                  {pct != null ? `${pct} %` : "–"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
