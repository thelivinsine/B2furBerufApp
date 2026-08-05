import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Clock, Play, TimerOff } from "lucide-react";
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
import { useStagePanel } from "@/features/shared/useStagePanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, daysBetween, todayKey } from "@/lib/utils";
import { PART_META } from "@/features/exam/partMeta";
import { MockExamRunner } from "@/features/exam/MockExamRunner";

/**
 * The Prüfung zone, one page (redesign s189).
 *
 * It replaces two pages: the card hub that used to sit at `/anwenden`, and the
 * Modelltest page behind one of its cards. The header is now a two-segment
 * sliding-pill switcher in the Bibliothek's own language (founder: "insert a
 * toggle in place of the current header, similar to Bibliothek"), and the two
 * segments are the two ways to work:
 *
 *   Module üben  the four exam modules, each with what it holds and how long
 *                it takes. This is where the old "Einzeln üben" rows went.
 *   Modelltest   the complete run and the record of past runs, nothing else.
 *
 * The free Schreib- and Sprechtrainer are no longer a separate block: they are
 * what the SAME four modules do in "Ohne Zeit" (founder pick, idea 3), so the
 * clock is the only difference between practising and sitting the module, and
 * it is one switch the learner sets once. Ohne Zeit is the resting state.
 *
 * Neither tab scrolls at rest: the page is sized to `h-page-stage` and the
 * elastic regions give up their room rather than push past one screen. The one
 * thing that may grow is Verlauf, and only when the learner opens it
 * (`useStagePanel`, the app-wide expand rule).
 */

type Tab = "module" | "modelltest";
type ClockMode = "free" | "timed";

const TABS: { id: Tab; label: string }[] = [
  { id: "module", label: "Module üben" },
  { id: "modelltest", label: "Modelltest" },
];

/** Runs listed before the learner asks for the rest. */
const VERLAUF_REST_ROWS = 3;

/** Where a module goes when it is started without a clock. */
const FREE_ROUTE: Partial<Record<MockPartId, string>> = {
  schreiben: "/writing",
  sprechen: "/simulation",
};

/** What a module holds when the clock is off (the trainers' own shape). */
const FREE_DESC: Partial<Record<MockPartId, string>> = {
  schreiben: "Fokus, Kurz und Lang",
  sprechen: "Dialoge mit Coaching",
};

export function PruefungHub() {
  const run = useExamStore((s) => s.run);
  const start = useExamStore((s) => s.start);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mockExams = useProgressStore((s) => s.mockExams);
  const settingsLevel = useSettingsStore((s) => s.level);
  const examDate = useSettingsStore((s) => s.examDate);

  const tab: Tab = params.get("tab") === "modelltest" ? "modelltest" : "module";
  const [level, setLevel] = useState<HubLevel>(() =>
    (HUB_LEVELS as readonly string[]).includes(settingsLevel) ? (settingsLevel as HubLevel) : "B2",
  );
  // Ohne Zeit is where a learner lands (founder s189): practising is the
  // everyday act, sitting a module against the clock is the deliberate one.
  const [clock, setClock] = useState<ClockMode>("free");
  const [verlaufOpen, setVerlaufOpen] = useState(false);

  // A running (or just finished, un-dismissed) exam takes over the route, so a
  // reload lands back inside the simulation, never on the hub.
  if (run) return <MockExamRunner />;

  const avail = mockExamAvailability(level);
  const servable = level !== "A2";
  const runs = mockExams.filter((m) => m.level === level).slice().reverse();

  const partCount = (part: MockPartId) =>
    part === "lesen"
      ? avail.lesen
      : part === "hoeren"
        ? avail.hoeren
        : part === "schreiben"
          ? avail.schreiben
          : avail.sprechen;

  const openModule = (part: MockPartId) => {
    if (clock === "free" && FREE_ROUTE[part]) {
      navigate(FREE_ROUTE[part]!);
      return;
    }
    if (!servable) return;
    start(level as MockExamLevel, [part], { untimed: clock === "free" });
  };

  const selectTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === "module") p.delete("tab");
    else p.set("tab", next);
    setParams(p, { replace: true });
    setVerlaufOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:gap-5",
        // Released while Verlauf is open: an expanded tile needs the page to be
        // able to scroll, which a fixed stage height would forbid.
        !verlaufOpen && "h-page-stage min-h-0",
      )}
    >
      {/* The switcher IS the page header (no HubHero, no h1), and the scope
          controls sit BELOW it at every width (founder s189): navigation first,
          then what it is scoped to. Both are CENTRED at every width, desktop
          included, so the header reads as one stacked block on its own axis
          rather than two controls pushed to opposite edges. */}
      <div className="flex flex-col items-center gap-3">
        <TabSwitcher tab={tab} onSelect={selectTab} />
        <div className="flex items-center justify-center gap-2">
          {tab === "module" && <ClockSwitcher mode={clock} onSelect={setClock} />}
          <LevelSelect level={level} onSelect={setLevel} />
        </div>
      </div>

      {tab === "module" ? (
        <ModuleGrid
          clock={clock}
          servable={servable}
          countFor={partCount}
          onOpen={openModule}
        />
      ) : (
        <>
          <RunBand
            examDate={examDate}
            canStart={servable && avail.complete}
            onStart={() => start(level as MockExamLevel)}
          />
          {runs.length > 0 && (
            <Verlauf runs={runs} open={verlaufOpen} onToggle={() => setVerlaufOpen((v) => !v)} />
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------- switchers ------------------------------- */

/**
 * The page header. Same mechanism as `LibrarySwitcher`: a recessed grey track
 * with ONE always-mounted white pill measured to the active segment, never a
 * per-segment crossfade. Two segments, so it is content-sized from lg up rather
 * than stretched across the column.
 */
function TabSwitcher({ tab, onSelect }: { tab: Tab; onSelect: (t: Tab) => void }) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(tab);

  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label="Prüfung"
      // The column is `items-center`, so from lg up the track sizes to its two
      // labels instead of stretching across the page, which is the "switcher
      // too big" shape rejected in s149. Full width on a phone.
      className="relative flex w-full items-stretch gap-1 rounded-lg border border-border bg-muted p-1 shadow-soft lg:w-auto"
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
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            ref={registerItem(t.id) as React.Ref<HTMLButtonElement>}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(t.id)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-5 py-1.5 text-sm transition-colors lg:flex-none",
              active ? "font-bold text-foreground" : "font-semibold text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

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
      className="relative flex items-stretch gap-0.5 rounded-lg border border-border bg-muted p-0.5 shadow-soft"
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
              "relative z-10 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
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
 * Niveau as a compact scope button rather than a second pill row: the switcher
 * above already owns switcher rank on this page, and two grey tracks stacked
 * before any content read as a heavier header than the page it introduces.
 */
function LevelSelect({
  level,
  onSelect,
}: {
  level: HubLevel;
  onSelect: (l: HubLevel) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Niveau"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface pl-3 pr-2 text-sm shadow-soft transition-colors hover:border-primary/40"
      >
        <span className="text-muted-foreground">Niveau</span>
        <span className="font-bold tabular-nums">{level}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Niveau"
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.12, ease: "easeOut" }}
            className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
          >
            {HUB_LEVELS.map((lv) => {
              const selected = lv === level;
              return (
                <button
                  key={lv}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSelect(lv);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    selected ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex-1 tabular-nums">{lv}</span>
                  {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    // The cards keep their own height: stretching them to fill a tall phone
    // opened a void inside every card between its description and its chip, and
    // floating the block in the middle of the stage read as content that had
    // run out. Top aligned, with the spare room trailing.
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {MOCK_PART_ORDER.map((part, i) => {
        const meta = PART_META[part];
        const Icon = meta.icon;
        // A free Schreiben or Sprechen opens its trainer, which needs no exam
        // content; the other three cases need a servable level with a draw.
        const free = clock === "free";
        const viaTrainer = free && !!FREE_ROUTE[part];
        const canOpen = viaTrainer || (servable && countFor(part) > 0);
        const desc = (free && FREE_DESC[part]) || meta.desc;

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
              "flex flex-col items-start rounded-lg border border-border bg-surface p-4 text-left shadow-soft transition-transform sm:p-5",
              canOpen ? "card-hover" : "cursor-not-allowed opacity-60",
            )}
          >
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                meta.tile,
              )}
            >
              <Icon className={cn("h-7 w-7", meta.ink)} />
            </span>
            <span className="mt-3.5 text-lg font-semibold leading-tight">
              {PART_LABEL[part]}
            </span>
            <span className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
              {canOpen ? desc : "Noch keine Inhalte"}
            </span>
            {canOpen && (
              <span className="mt-auto flex w-full items-center pt-4">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                  {free ? (
                    <>
                      <TimerOff className="h-3.5 w-3.5" /> Ohne Uhr
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5" /> {PART_MINUTES[part]} Min
                    </>
                  )}
                </span>
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Modelltest ------------------------------ */

function RunBand({
  examDate,
  canStart,
  onStart,
}: {
  examDate: string | null;
  canStart: boolean;
  onStart: () => void;
}) {
  return (
    <Card className="flex flex-1 flex-col p-4 sm:p-5 lg:flex-none">
      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-3">
        <p className="text-eyebrow text-muted-foreground">Komplette Prüfung</p>
        <ExamCountdown examDate={examDate} />
      </div>

      {/* Centred in whatever room the band gains, so the CTA sits low enough to
          reach with a thumb without the timeline drifting off its own line. */}
      <div className="flex flex-1 flex-col justify-center">
        <PartTrack />
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-border pt-4">
        {canStart ? (
          <Button variant="gradient" className="w-full sm:w-auto" onClick={onStart}>
            <Play className="h-4 w-4" /> Prüfung starten
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">Noch keine Inhalte</span>
        )}
      </div>
    </Card>
  );
}

/**
 * The four modules in exam order, connected. The connector is ONE SEGMENT PER
 * GAP, drawn from the edge of one tile to the edge of the next (founder s189):
 * the single full-width line it replaced ran behind the marks and read as if it
 * crossed them.
 */
function PartTrack() {
  return (
    <div className="mt-3.5 flex items-start justify-between">
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
    <span className="inline-flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {days === 0 ? "Heute ist Prüfungstag" : `Noch ${days} Tage bis zum ${label}`}
    </span>
  );
}

/* --------------------------------- Verlauf -------------------------------- */

/**
 * The one place a past result is shown (founder s188), reworked in s189: it
 * RESTS OPEN, leading with three figures and then the newest runs, and hands
 * the rest to a button at its foot. Opening that is what allows the page to
 * grow past one screen, and the tile then obeys the app-wide expand rule
 * (`useStagePanel`): never taller than the screen, its own list scrolling
 * inside, the scroll handed on to the page at the top of that list.
 */
function Verlauf({
  runs,
  open,
  onToggle,
}: {
  runs: MockExamRecord[];
  open: boolean;
  onToggle: () => void;
}) {
  const panelRef = useStagePanel<HTMLDivElement>(open);
  const scored = useMemo(() => runs.filter((r) => r.total != null), [runs]);
  const best = scored.length ? Math.max(...scored.map((r) => r.total as number)) : null;
  const passed = scored.filter((r) => (r.total as number) >= PASS_PCT).length;
  const shown = open ? runs : runs.slice(0, VERLAUF_REST_ROWS);
  const rest = runs.length - shown.length;

  return (
    <Card
      ref={panelRef}
      className={cn(
        // The scroll margins are what keep the tile's own borders visible when
        // it is scrolled into view: `scrollIntoView` knows nothing about the
        // sticky header or the fixed bottom bar, so without them the expanded
        // tile parks its lower edge underneath the tab bar.
        "flex scroll-mt-20 scroll-mb-24 flex-col overflow-hidden lg:scroll-mb-8",
        open ? "max-h-panel-stage" : "max-h-[19rem] flex-none",
      )}
    >
      <div className="flex items-baseline justify-between gap-3 px-4 pb-2.5 pt-3.5">
        <p className="text-eyebrow text-muted-foreground">Verlauf</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {runs.length} {runs.length === 1 ? "Durchlauf" : "Durchläufe"}
        </p>
      </div>

      {/* Three figures, each centred in its own third: a label-left/value-right
          pair stretches to opposite ends and stops reading as one fact. */}
      <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
        <Kpi label="Letzter" value={fmtPct(runs[0]?.total ?? null)} />
        <Kpi label="Bester" value={fmtPct(best)} />
        <Kpi
          label="Bestanden"
          value={scored.length ? `${passed} von ${scored.length}` : "–"}
        />
      </div>

      <div className="slim-scrollbar min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {shown.map((r) => (
          <VerlaufRow key={r.id} record={r} />
        ))}
      </div>

      {(rest > 0 || open) && (
        <div className="flex justify-center border-t border-border p-1.5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-muted/60"
          >
            {open ? "Weniger anzeigen" : `Alle ${runs.length} anzeigen`}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      )}
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-2.5 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums leading-tight">{value}</p>
    </div>
  );
}

function fmtPct(pct: number | null | undefined) {
  return pct == null ? "–" : `${pct} %`;
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
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/40 sm:gap-4"
      >
        <span className="w-[62px] shrink-0 text-sm font-semibold tabular-nums sm:w-[76px]">
          {date}
        </span>
        {/* Four segments in exam order: which module carried the run, at a
            glance. A single-module run leaves the other three tracks empty,
            which is the honest picture of what was actually sat. */}
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
            <Badge variant={record.total >= PASS_PCT ? "success" : "muted"} className="tabular-nums">
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
        <div className="grid grid-cols-4 gap-3 border-t border-border px-4 py-3">
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
