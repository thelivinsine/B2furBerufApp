import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Clock, Play } from "lucide-react";
import {
  HUB_LEVELS,
  MOCK_PART_ORDER,
  PART_LABEL,
  PART_MINUTES,
  PASS_PCT,
  mockExamAvailability,
  type HubLevel,
  type MockExamAvailability,
  type MockExamLevel,
  type MockPartId,
} from "@/engine/exam";
import { useDailyAllowance } from "@/lib/aiAllowance";
import { useExamStore } from "@/store/useExamStore";
import {
  useProgressStore,
  isFullMockRun,
  type MockExamRecord,
} from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import {
  CHART_RUNS,
  DeltaChip,
  NoScoreYet,
  ScoreChart,
  VERLAUF_REST_ROWS,
  VerlaufCard,
  shortDate,
} from "./verlauf";
import { LevelSelect, type LevelOption } from "./LevelSelect";
import { TabSwitcher, TABS, panelId, type Tab } from "./hubSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysBetween, todayKey } from "@/lib/utils";
import { PART_META } from "@/features/exam/partMeta";
import { MockExamRunner } from "@/features/exam/MockExamRunner";

/**
 * The Prüfung zone, one page (redesign s189, polished s190).
 *
 * Two segments, both in the SAME 896px centred frame so switching tabs never
 * changes the page's width:
 *
 *   Module üben  the four exam modules as cards, then a Verlauf that reads as a
 *                strength profile across the four (founder pick M3).
 *   Modelltest   the complete run as a "ticket" band, then a Verlauf led by the
 *                last score with the run history beside it (founder pick V2).
 *
 * The free Schreib- and Sprechtrainer are what the SAME four modules do in
 * "Ohne Zeit" (founder s189), so the clock is the only difference between
 * practising and sitting the module, and it is one switch set once. Ohne Zeit is
 * the resting state, and the minutes badge it hides has its corner RESERVED, so
 * throwing that switch cannot move a card edge.
 *
 * Neither tab scrolls at rest: the page is sized to `h-page-stage` and the
 * elastic regions give up their room rather than push past one screen. What may
 * grow is a Verlauf, and only when the learner opens it (`useStagePanel`, the
 * app-wide expand rule).
 */

type ClockMode = "free" | "timed";

/**
 * The hub's ONE column width (founder pick C at "medium", s197).
 *
 * Every block on the page is this wide: the switcher row, the scope row, the
 * module grid and the Verlauf card. It replaces the three separately centred
 * widths the page carried until s197 (a `max-w-4xl` panel column holding a
 * `max-w-[30rem]` module grid holding a `max-w-[26rem]` Stärkeprofil), which is
 * why nothing on the page shared an edge with anything else.
 *
 * 40rem is chosen from the module tiles, not the other way round: s196 capped
 * the GRID narrower than the column to stop the tiles reading as wide empty
 * strips, and at this column width they are that shape without a cap.
 */
const HUB_COL = "max-w-[40rem]";

/**
 * Where a module goes when it is started without a clock.
 *
 * All FOUR modules have an Ohne-Zeit page of their own since s196 (founder:
 * give Lesen and Hören the same Aufgabe-wählen rail Schreiben has). Before
 * that, Lesen and Hören composed a random drill here and opened it directly, so
 * the clock was their only difference from Mit Zeit and no text could be
 * chosen. The random draw still exists, as a button on each chooser.
 */
const FREE_ROUTE: Record<MockPartId, string> = {
  lesen: "/lesen",
  hoeren: "/hoeren",
  schreiben: "/writing",
  sprechen: "/simulation",
};

const TOTAL_MINUTES = MOCK_PART_ORDER.reduce((n, p) => n + PART_MINUTES[p], 0);

/* --------------------------------- records -------------------------------- */

/** One practice of ONE module, derived from the runs that sat a single part. */
export interface ModulePractice {
  id: string;
  date: string;
  part: MockPartId;
  pct: number | null;
}

/**
 * A run that sat every part is a Modelltest; anything shorter is practice.
 * The rule itself lives bank-free in the progress store so Fortschritt can
 * apply the SAME one without importing the content banks (s194 audit P2).
 */
export const isFullRun = isFullMockRun;

/**
 * The practice entries a non-full run produced: ONE per module it sat.
 *
 * It used to return only the first (s194 audit P32). No surface can start a
 * two-module run today, so nothing was being lost yet, but `useExamStore.start`
 * takes an arbitrary part list and the next thing that uses it would have had
 * its second score silently disappear from the Verlauf.
 */
export function toPractices(record: MockExamRecord): ModulePractice[] {
  return MOCK_PART_ORDER.filter((p) => p in record.parts).map((part) => ({
    // The record id is the run; a run can now contribute several rows, so the
    // key has to name the module too.
    id: `${record.id}|${part}`,
    date: record.date,
    part,
    pct: record.parts[part] ?? null,
  }));
}

export function PruefungHub() {
  const run = useExamStore((s) => s.run);
  const start = useExamStore((s) => s.start);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mockExams = useProgressStore((s) => s.mockExams);
  const settingsLevel = useSettingsStore((s) => s.level);
  const examDate = useSettingsStore((s) => s.examDate);
  const reduce = useReducedMotion();

  const tab: Tab = params.get("tab") === "modelltest" ? "modelltest" : "module";
  // Niveau and the clock live in the URL like the tab does (s194 audit P26).
  // As component state they reset on every reload and could not be shared, and
  // the Niveau had to be re-picked after every hop into a trainer and back.
  const urlLevel = params.get("level");
  const level: HubLevel = (HUB_LEVELS as readonly string[]).includes(urlLevel ?? "")
    ? (urlLevel as HubLevel)
    : (HUB_LEVELS as readonly string[]).includes(settingsLevel)
      ? (settingsLevel as HubLevel)
      : "B2";
  // Ohne Zeit is where a learner lands (founder s189): practising is the
  // everyday act, sitting a module against the clock is the deliberate one.
  const clock: ClockMode = params.get("zeit") === "mit" ? "timed" : "free";
  const [verlaufOpen, setVerlaufOpen] = useState(false);
  // Closes an open Verlauf on every tab change, including one made from the
  // AppShell header's desktop copy of the switcher, which has no access to
  // this component's own `selectTab` handler below.
  useEffect(() => setVerlaufOpen(false), [tab]);

  const patchParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null) p.delete(k);
      else p.set(k, v);
    }
    setParams(p, { replace: true });
  };

  // Every level's counts, once. `mockExamAvailability` walks the whole text bank
  // twice and runs `eligibleTasks` across the 717-task writing bank, and it used
  // to run on EVERY render: a tab switch, a clock switch, opening a Verlauf
  // (s194 audit P28). The map is also what lets the Niveau list show honest
  // counts instead of offering A2 as if it were servable (P23).
  const availByLevel = useMemo(
    () => Object.fromEntries(HUB_LEVELS.map((l) => [l, mockExamAvailability(l)])) as Record<
      HubLevel,
      ReturnType<typeof mockExamAvailability>
    >,
    [],
  );

  // A running (or just finished, un-dismissed) exam takes over the route, so a
  // reload lands back inside the simulation, never on the hub.
  if (run) return <MockExamRunner />;

  const avail = availByLevel[level];
  const servable = level !== "A2";

  const scoped = mockExams.filter((m) => m.level === level);
  // Newest first, and the two lists are disjoint: a Modelltest is a run that sat
  // all four parts, a practice is a run that sat one. Before s190 both landed in
  // the same list, so a single Lesen drill counted as a Modelltest result.
  const runs = scoped.filter(isFullRun).slice().reverse();
  const practice = scoped
    .filter((m) => !isFullRun(m))
    .flatMap(toPractices)
    .reverse();

  const partCount = (part: MockPartId) =>
    part === "lesen"
      ? avail.lesen
      : part === "hoeren"
        ? avail.hoeren
        : part === "schreiben"
          ? avail.schreiben
          : avail.sprechen;

  const openModule = (part: MockPartId) => {
    if (clock === "free") {
      // The Niveau travels with the learner (s194 audit P11). Without it the
      // trainer opened on whatever scope it was last left on, so the clock was
      // not the only difference between practising a module and sitting it.
      navigate(`${FREE_ROUTE[part]}?level=${level}`);
      return;
    }
    if (!servable) return;
    start(level as MockExamLevel, [part]);
  };

  const selectTab = (next: Tab) => {
    patchParams({ tab: next === "module" ? null : next });
    setVerlaufOpen(false);
  };

  // Same directional slide the Bibliothek uses (popLayout, 0.15s), so a tab
  // switch here reads as the same gesture as a tab switch there.
  const dir = tab === "module" ? -1 : 1;
  const shift = reduce ? 0 : 24;
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d >= 0 ? shift : -shift }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -shift : shift }),
  };

  return (
    <div
      className={cn(
        // The gap here is ONLY between the header block (switcher + scope row)
        // and the tab's content, and it is deliberately wider than the gaps
        // inside either (founder s191), so the controls and the tiles read as
        // two sections rather than one stack of evenly spaced rows.
        "flex flex-col gap-6 sm:gap-7",
        // Released while a Verlauf is open: an expanded tile needs the page to
        // be able to scroll, which a fixed stage height would forbid.
        // `h-pruefung-stage`, not the shared `h-page-stage`: that class drops
        // its ceiling from lg up on the assumption desktop has no shortage of
        // room, which this hub's Verlauf card grew tall enough to break on a
        // real laptop height (session: founder saw a page scroll on desktop).
        !verlaufOpen && "h-pruefung-stage min-h-0",
      )}
    >
      {/* The switcher IS the page header, at EVERY width (founder pick C, s197;
          no HubHero, no h1), with the scope controls centred below it. s196 had
          moved a desktop copy into the AppShell header beside a "Prüfung"
          title, which parked it on the app's left gutter while the page stayed
          centred, so the title lined up with nothing. This is the same answer
          the Bibliothek and Schreiben headers already give. */}
      <div className={cn("mx-auto flex w-full flex-col items-center gap-3", HUB_COL)}>
        <TabSwitcher tab={tab} onSelect={selectTab} />
        {/* Fixed height: the Modelltest tab hides the clock switch, and without
            it the row would change height and shift the page on every switch. */}
        <div className="flex h-9 items-center justify-center gap-2">
          {tab === "module" && (
            <ClockSwitcher
              mode={clock}
              onSelect={(m) => patchParams({ zeit: m === "timed" ? "mit" : null })}
            />
          )}
          <LevelSelect
            value={level}
            options={levelOptions(availByLevel)}
            onSelect={(l) => patchParams({ level: l })}
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={tab}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
            // The panel half of the tablist above (s194 audit P27): the
            // switcher announced two tabs and there was nothing they controlled.
            // Named by its own `aria-label` rather than `aria-labelledby` a tab
            // button: since this session there are TWO switcher copies (mobile
            // in-page, desktop header) and which one is on screen is a CSS
            // breakpoint, not something this component can point at reliably.
            role="tabpanel"
            id={panelId(tab)}
            aria-label={TABS.find((t) => t.id === tab)?.label}
            className={cn("mx-auto flex min-h-0 w-full flex-1 flex-col gap-4 sm:gap-5", HUB_COL)}
          >
            {/* The Verlauf card is on the page from the FIRST visit (founder
                s195, option 2): both tabs hold a one-viewport frame, and until
                a learner had history the lower half of it was empty every time.
                Empty, it shows the shape of what is coming, which is also the
                only place that says what practising will earn them. */}
            {tab === "module" ? (
              <>
                <ModuleGrid
                  clock={clock}
                  servable={servable}
                  countFor={partCount}
                  onOpen={openModule}
                />
                <ModuleVerlauf
                  practice={practice}
                  open={verlaufOpen}
                  onToggle={() => setVerlaufOpen((v) => !v)}
                />
              </>
            ) : (
              <>
                <RunBand
                  examDate={examDate}
                  level={level}
                  canStart={servable && avail.complete}
                  onStart={() => start(level as MockExamLevel)}
                />
                <RunVerlauf
                  runs={runs}
                  open={verlaufOpen}
                  onToggle={() => setVerlaufOpen((v) => !v)}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------- switchers ------------------------------- */

/**
 * The clock, as ONE control for all four modules (founder pick, idea 3). Ohne
 * Zeit opens the module's untimed shape: for Schreiben and Sprechen that is the
 * trainer with its own modes, for Lesen and Hören the same drill with nothing
 * running. Smaller than the tab switcher on purpose: it sets a condition, it
 * does not navigate.
 */
function ClockSwitcher({
  mode,
  onSelect,
}: {
  mode: ClockMode;
  onSelect: (m: ClockMode) => void;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(mode);

  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="group"
      aria-label="Zeit"
      className="relative flex h-9 items-stretch gap-0.5 rounded-lg border border-border bg-muted p-0.5 shadow-soft"
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute bottom-0.5 left-0 top-0.5 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {(["free", "timed"] as ClockMode[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            ref={registerItem(m) as React.Ref<HTMLButtonElement>}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(m)}
            className={cn(
              "relative z-10 whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "free" ? "Ohne Zeit" : "Mit Zeit"}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The hub's Niveau options, with each level's honest count. Zero-yield levels
 * grey out rather than looking servable: A2 used to look exactly like a level
 * with content and killed the whole page once picked (s194 audit P23).
 */
function levelOptions(avail: Record<HubLevel, MockExamAvailability>): LevelOption[] {
  return HUB_LEVELS.map((lv) => {
    const a = avail[lv];
    const modules = [a.lesen, a.hoeren, a.schreiben, a.sprechen].filter((n) => n > 0).length;
    return {
      value: lv,
      label: lv,
      note: modules === 0 ? "keine Inhalte" : `${modules}/4 Module`,
      empty: !a.complete,
    };
  });
}

/* ------------------------------- Module üben ------------------------------ */

function ModuleGrid({
  clock,
  servable,
  countFor,
  onOpen,
}: {
  clock: ClockMode;
  servable: boolean;
  countFor: (p: MockPartId) => number;
  onOpen: (p: MockPartId) => void;
}) {
  return (
    // 2x2 at EVERY width (founder s189): four across a 1152px column left the
    // cards narrow and cramped against all that empty page. No cap of its own
    // since s197: the tiles fill the hub's column, because the column came down
    // to THEM (`HUB_COL`). s196's `max-w-[30rem]` cap answered the same
    // complaint ("the tiles look empty") by narrowing the grid inside a much
    // wider column, which is what left a narrow tile island floating over a
    // full-width Verlauf card.
    <div className="grid w-full flex-none grid-cols-2 gap-3 sm:gap-4">
      {MOCK_PART_ORDER.map((part, i) => {
        const meta = PART_META[part];
        const Icon = meta.icon;
        // Ohne Zeit always opens the module's own chooser, which is honest
        // about what it can serve (its own empty state names the filter to
        // drop); Mit Zeit still needs a servable level with a draw.
        const free = clock === "free";
        const canOpen = free || (servable && countFor(part) > 0);

        return (
          <motion.button
            key={part}
            type="button"
            disabled={!canOpen}
            onClick={() => onOpen(part)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.16), duration: 0.16 }}
            className={cn(
              // The bottom padding reserves the arrow's corner: it shows
              // whenever the module can open, in EITHER clock state, so a
              // fixed reservation (not the badge-driven one this replaced)
              // already keeps the switch from moving a card edge.
              "relative flex min-h-[6.5rem] flex-col items-start overflow-hidden rounded-xl border border-border bg-surface p-3.5 pb-8 text-left shadow-soft transition-transform sm:min-h-[7.5rem] sm:p-4 sm:pb-9",
              canOpen ? "card-hover" : "cursor-not-allowed opacity-60",
            )}
          >
            <span className="relative flex w-full items-start justify-between gap-2">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11",
                  meta.tile,
                )}
              >
                <Icon className={cn("h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5", meta.ink)} />
              </span>
              {/* The minutes badge and the arrow swapped corners this session
                  (founder). The badge now sits beside the icon, where its
                  presence or absence (Ohne Zeit / Mit Zeit) never changes the
                  row's height, since the icon alone already sets it. */}
              {canOpen && !free && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/85 px-2 py-[3px] text-xs font-semibold tabular-nums text-muted-foreground">
                  <Clock className="h-3 w-3" /> {PART_MINUTES[part]} Min
                </span>
              )}
            </span>

            <span className="relative mt-2 text-base font-bold leading-tight tracking-[-0.015em] sm:mt-2.5 sm:text-lg">
              {PART_LABEL[part]}
            </span>
            {!canOpen && (
              <span className="relative mt-1 text-[12.5px] leading-snug text-muted-foreground sm:text-sm">
                Noch keine Inhalte
              </span>
            )}

            {canOpen && (
              <span className="mod-go absolute bottom-3 right-3.5 z-[1] sm:bottom-3.5 sm:right-4">
                <ArrowRight className="h-[0.9375rem] w-[0.9375rem]" />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Modelltest ------------------------------ */

/**
 * The complete run. On a desktop it is a two-column ticket (founder pick B/V2
 * round): the commitment as a display number with the countdown and the CTA on
 * the left, the four Teile as a connected ladder on the right. A phone keeps the
 * stacked band, because the ticket is a composition for width, not for height.
 */
function RunBand({
  examDate,
  level,
  canStart,
  onStart,
}: {
  examDate: string | null;
  level: HubLevel;
  canStart: boolean;
  onStart: () => void;
}) {
  const cta = canStart ? (
    <Button variant="gradient" className="w-full sm:w-auto" onClick={onStart}>
      <Play className="h-4 w-4" /> Prüfung starten
    </Button>
  ) : (
    <span className="text-sm text-muted-foreground">Noch keine Inhalte</span>
  );

  return (
    <Card className="flex flex-1 flex-col overflow-hidden sm:flex-none lg:grid lg:grid-cols-[minmax(0,1fr)_1px_18.5rem]">
      {/* Desktop: the left half of the ticket. Phone/tablet: the whole band. */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 lg:items-start lg:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 lg:block">
          <p className="text-eyebrow text-muted-foreground">Komplette Prüfung</p>
          {/* The total is stated ONCE. On a desktop it is the display figure the
              ticket leads with; below lg it is the quiet fact beside the eyebrow,
              because there the four Teile are already a full-width timeline. */}
          <p className="text-sm tabular-nums text-muted-foreground lg:hidden">
            <span className="font-bold text-foreground">{TOTAL_MINUTES} Min</span> gesamt
          </p>
          <p className="hidden text-display text-[2.875rem] leading-none tabular-nums lg:mt-3 lg:block">
            {TOTAL_MINUTES}
            <span className="ml-1.5 text-[1.1875rem] font-bold text-muted-foreground">Min</span>
          </p>
          <p className="hidden text-sm text-muted-foreground lg:mt-2 lg:block">
            Vier Teile am Stück, wie am Prüfungstag
          </p>
        </div>

        <ExamCountdown examDate={examDate} />

        {/* Below lg the timeline lives in the band; from lg up it is the ticket's
            right column, so this copy is hidden rather than duplicated. */}
        <div className="flex flex-1 flex-col justify-center lg:hidden">
          <PartTrack />
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 lg:mt-auto lg:items-start lg:pt-5">
          {cta}
          {canStart && <AiBudgetNote level={level} />}
        </div>
      </div>

      <div aria-hidden className="hidden bg-border lg:block" />

      <div className="hidden flex-col justify-center p-5 lg:flex">
        <PartLadder />
      </div>
    </Card>
  );
}

/**
 * The four modules in exam order, connected. The connector is ONE SEGMENT PER
 * GAP, drawn from the edge of one tile to the edge of the next (founder s189):
 * the single full-width line it replaced ran behind the marks and read as if it
 * crossed them. Capped and centred so four 44px marks read as one sequence
 * instead of four islands stranded across a wide card.
 */
function PartTrack() {
  return (
    <div className="mx-auto mt-3.5 flex w-full max-w-[35rem] items-start justify-between">
      {MOCK_PART_ORDER.map((part, i) => {
        const meta = PART_META[part];
        const Icon = meta.icon;
        return (
          <div key={part} className="relative flex flex-1 flex-col items-center gap-1.5">
            {i < MOCK_PART_ORDER.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[calc(50%+30px)] right-[calc(-50%+30px)] top-[21px] h-0.5 rounded-full bg-border"
              />
            )}
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl",
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

/** The same four parts as the ticket's right column: a vertical ladder. */
function PartLadder() {
  return (
    <div className="flex flex-col">
      {MOCK_PART_ORDER.map((part, i) => {
        const meta = PART_META[part];
        const Icon = meta.icon;
        return (
          <div key={part} className="relative flex items-center gap-3 py-1.5">
            {i < MOCK_PART_ORDER.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[1.0625rem] top-[calc(50%+19px)] h-[calc(100%-38px)] w-0.5 rounded-full bg-border"
              />
            )}
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                meta.tile,
              )}
            >
              <Icon className={cn("h-[1.0625rem] w-[1.0625rem]", meta.ink)} />
            </span>
            <span className="text-sm font-semibold">{PART_LABEL[part]}</span>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {PART_MINUTES[part]} Min
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * What a complete run costs from the learner's daily AI budget (s194 audit P9).
 *
 * Teil Schreiben spends one of the day's Kurz (B1) or Lang (B2/C1) evaluations
 * and Teil Sprechen one of the day's conversations, so ONE Modelltest takes half
 * of each. Nothing said so before: a learner who had already written twice that
 * day discovered it as an ungraded Schreiben partway through a 52-minute exam.
 *
 * It states the fact when the budget is intact and warns when it is not; it
 * never blocks the run, because Lesen and Hören are unaffected and a run without
 * an AI grade is still worth sitting.
 */
function AiBudgetNote({ level }: { level: HubLevel }) {
  const writing = useDailyAllowance(level === "B1" ? "kurz" : "lang");
  // A Modelltest's Teil Sprechen is an EXAM conversation, so it spends the exam
  // budget (3/day since s204), never the practice one.
  const speaking = useDailyAllowance("sprechenExam");
  if (!writing.known || !speaking.known) return null;

  const short = [
    writing.remaining <= 0 ? "Schreiben" : null,
    speaking.remaining <= 0 ? "Sprechen" : null,
  ].filter(Boolean) as string[];

  return (
    <p
      className={cn(
        "text-center text-xs leading-snug lg:text-left",
        short.length ? "text-warning" : "text-muted-foreground",
      )}
    >
      {short.length
        ? `Heute keine KI-Bewertung mehr für ${short.join(" und ")}. Der Durchlauf zählt trotzdem, ${short.length === 1 ? "dieser Teil bleibt" : "diese Teile bleiben"} ohne Punktzahl.`
        : `Ein Durchlauf nutzt je eine KI-Bewertung: heute noch ${writing.remaining} fürs Schreiben, ${speaking.remaining} fürs Sprechen.`}
    </p>
  );
}

/**
 * The countdown lives on the page it belongs to, and retires itself once the
 * date has passed, so it can never sit at "0 Tage" forever.
 */
function ExamCountdown({ examDate }: { examDate: string | null }) {
  if (!examDate || examDate < todayKey()) return null;
  const days = Math.max(0, daysBetween(todayKey(), examDate));
  const label = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" }).format(
    new Date(`${examDate}T00:00:00`),
  );
  return (
    <span className="mt-2 inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground lg:mt-2.5">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {days === 0
        ? "Heute ist Prüfungstag"
        : `Noch ${days} ${days === 1 ? "Tag" : "Tage"} bis zum ${label}`}
    </span>
  );
}

/* --------------------------------- Verlauf -------------------------------- */

/* ---------------------------- Modelltest Verlauf --------------------------- */

/**
 * Founder pick V2 "Zahl und Kurve". The last score leads as a display figure
 * with its delta against the run before it; Bester and Bestanden stay as
 * figures (the founder kept them) but as supporting stats rather than three
 * equal cells; the chart carries the shape of the whole history beside them.
 */
function RunVerlauf({
  runs,
  open,
  onToggle,
}: {
  runs: MockExamRecord[];
  open: boolean;
  onToggle: () => void;
}) {
  const scored = useMemo(() => runs.filter((r) => r.total != null), [runs]);
  const best = scored.length ? Math.max(...scored.map((r) => r.total as number)) : null;
  const passed = scored.filter((r) => (r.total as number) >= PASS_PCT).length;
  const last = scored[0]?.total ?? null;
  const prev = scored[1]?.total ?? null;
  const delta = last != null && prev != null ? last - prev : null;
  // Oldest first, so the chart reads left to right like a timeline.
  const series = scored.slice(0, CHART_RUNS).reverse().map((r) => r.total as number);

  return (
    <VerlaufCard
      count={
        runs.length === 0
          ? "noch kein Durchlauf"
          : `${runs.length} ${runs.length === 1 ? "Durchlauf" : "Durchläufe"}`
      }
      open={open}
      onToggle={onToggle}
      restRows={VERLAUF_REST_ROWS}
      moreLabel={`Alle ${runs.length} anzeigen`}
      head={
        last == null ? (
          <NoScoreYet />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-5">
            <div className="flex flex-none flex-col justify-center">
              <p className="text-xs text-muted-foreground">Letzter Durchlauf</p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span className="text-display text-[2rem] leading-none tabular-nums">
                  {last} %
                </span>
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
      rows={runs.map((r) => <RunRow key={r.id} record={r} />)}
    />
  );
}

/** One Modelltest run: date, the four parts as segments, the total. */
function RunRow({ record }: { record: MockExamRecord }) {
  const [expanded, setExpanded] = useState(false);
  // A run that produced no score at all: four empty tracks read as a loading
  // skeleton, so the row states the fact instead of drawing nothing.
  const unscored = MOCK_PART_ORDER.every((p) => record.parts[p] == null);
  const date = shortDate(record.date);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/40 sm:gap-4 sm:px-5 lg:px-6"
      >
        <span className="w-[62px] shrink-0 text-sm font-semibold tabular-nums sm:w-[76px]">
          {date}
        </span>
        {/* Four segments in exam order: which module carried the run, at a
            glance. An unscored part leaves its track empty, which is the honest
            picture of what the run actually produced. */}
        {unscored ? (
          <span className="text-sm text-muted-foreground">Nicht bewertet</span>
        ) : (
          <span
            className="flex min-w-0 max-w-[320px] flex-1 gap-1"
            role="img"
            aria-label={MOCK_PART_ORDER.map(
              (p) => `${PART_LABEL[p]} ${record.parts[p] ?? "ohne Punktzahl"}`,
            ).join(", ")}
          >
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
        )}
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {record.total != null && (
            <Badge
              variant={record.total >= PASS_PCT ? "success" : "muted"}
              className="whitespace-nowrap tabular-nums"
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

      {expanded && (
        <div className="grid grid-cols-4 gap-3 border-t border-border px-4 py-3 sm:px-5 lg:px-6">
          {MOCK_PART_ORDER.map((part) => {
            const pct = record.parts[part];
            return (
              <div key={part} className="text-center">
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

/* --------------------------- Module üben Verlauf --------------------------- */

/**
 * Founder pick M3 "Stärkeprofil". Four columns on ONE scale, so the modules are
 * directly comparable: the pale part is where the learner started, the solid cap
 * on top is what they have gained since. A dotted marker line was tried first
 * and disappeared against a saturated fill.
 *
 * It plots the score of a module SAT AS A MODULE. The untimed Schreib- and
 * Sprechtrainer produce a correction, not a percentage, and keep their own
 * Verlauf on their own pages.
 */
function ModuleVerlauf({
  practice,
  open,
  onToggle,
}: {
  practice: ModulePractice[];
  open: boolean;
  onToggle: () => void;
}) {
  // Oldest first per module, so "first" is the learner's first attempt.
  const byPart = useMemo(() => {
    const map = {} as Record<MockPartId, number[]>;
    for (const part of MOCK_PART_ORDER) map[part] = [];
    for (const p of practice.slice().reverse()) {
      if (p.pct != null) map[p.part].push(p.pct);
    }
    return map;
  }, [practice]);

  const scored = practice.filter((p) => p.pct != null);

  return (
    <VerlaufCard
      count={
        practice.length === 0
          ? "noch keine Übung"
          : `${practice.length} ${practice.length === 1 ? "Übung" : "Übungen"}`
      }
      open={open}
      onToggle={onToggle}
      restRows={VERLAUF_REST_ROWS}
      moreLabel={`Alle ${practice.length} anzeigen`}
      split
      head={
        <>
            {/* The SAME four columns whether or not there is data (founder s195,
                option 2): with none they stand empty at "–", which is what
                shows a first-time learner the shape of what practising builds.
                Only the caption below changes. */}
            <div className="grid w-full grid-cols-4 gap-2.5 sm:gap-3">
              {MOCK_PART_ORDER.map((part) => {
                const list = byPart[part];
                const first = list[0] ?? null;
                const last = list.length ? list[list.length - 1] : null;
                const base = last == null || first == null ? 0 : Math.min(first, last);
                const meta = PART_META[part];
                const Icon = meta.icon;
                return (
                  <div key={part} className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        "flex h-5 items-center text-sm font-bold tabular-nums",
                        last == null && "text-xs font-semibold text-muted-foreground",
                      )}
                    >
                      {last == null ? "–" : `${last} %`}
                    </span>
                    <span
                      className={cn(
                        // Shorter since s196 (founder: the Verlauf tile "looks
                        // unnecessarily big"): the bars carried most of the
                        // card's height for very little information. An EMPTY
                        // column is shorter again (s197): at full height, four
                        // grey slabs at "–" read as a chart that failed to
                        // render rather than as the shape of what is coming.
                        "relative w-full overflow-hidden rounded-md",
                        last == null ? "h-6 bg-muted/40 sm:h-8" : "h-10 bg-muted/80 sm:h-16",
                      )}
                    >
                      {last != null && (
                        <span className="absolute inset-0 flex flex-col-reverse">
                          <i className={cn("block w-full", meta.fillPale)} style={{ height: `${base}%` }} />
                          <i
                            className={cn("block w-full rounded-t-[4px]", meta.fillSolid)}
                            style={{ height: `${last - base}%` }}
                          />
                        </span>
                      )}
                    </span>
                    {/* Mark ABOVE the name at every width since s197: in the
                        split card each of the four columns is ~80px wide now,
                        and the side-by-side form pushed "Schreiben" straight
                        through the divider into the list beside it. */}
                    <span className="flex flex-col items-center gap-1 text-[11px] font-semibold sm:text-xs">
                      <span
                        className={cn(
                          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md",
                          meta.tile,
                        )}
                      >
                        <Icon className={cn("h-3 w-3", meta.ink)} />
                      </span>
                      {PART_LABEL[part]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs leading-snug text-muted-foreground">
              {scored.length === 0 ? (
                <>
                  <span className="block text-sm font-semibold text-foreground">
                    Dein Stärkeprofil
                  </span>
                  Übe ein Modul, dann siehst du hier deinen Fortschritt.
                </>
              ) : (
                "Blass: dein erster Versuch · Kräftig: dein Fortschritt"
              )}
            </p>
          </>
      }
      rows={practice.map((p) => <PracticeRow key={p.id} entry={p} />)}
    />
  );
}

/** One module practice: date, which module, the score it produced. */
function PracticeRow({ entry }: { entry: ModulePractice }) {
  const meta = PART_META[entry.part];
  const Icon = meta.icon;
  const date = shortDate(entry.date);

  return (
    // One padding and one gap at every width since s197: this row sits in the
    // RIGHT half of a 40rem card now (~296px), and the old `sm:gap-4 lg:px-6`
    // spent 24px of that on air. The row then had exactly 0px spare, so the
    // score badge wrapped its "%" and the module name truncated to "Schre...".
    <div className="flex w-full items-center gap-3 px-4 py-2">
      <span className="w-[72px] shrink-0 text-sm font-semibold tabular-nums">{date}</span>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          meta.tile,
        )}
      >
        <Icon className={cn("h-[15px] w-[15px]", meta.ink)} />
      </span>
      <span className="truncate text-sm font-semibold">{PART_LABEL[entry.part]}</span>
      {entry.pct != null && (
        <Badge
          variant={entry.pct >= PASS_PCT ? "success" : "muted"}
          className="ml-auto shrink-0 whitespace-nowrap tabular-nums"
        >
          {entry.pct} %
        </Badge>
      )}
    </div>
  );
}
