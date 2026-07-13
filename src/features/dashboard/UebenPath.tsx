import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { missions, chapters } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { useIsDark } from "@/lib/useTheme";
import { cn } from "@/lib/utils";

/**
 * Heute → "Üben": the Neuland journey as a soft illustrated city map (design
 * review, s88). The map alone carries the journey state (the s86 stepper was
 * retired by the founder): rounded streets, one colored landmark tile per stop,
 * an indigo route that runs solid to the current stop and dotted onward, a
 * white dot on every completed stop, and a location pin with a "Du bist hier"
 * chip marking where the learner is. Landmarks always sit inside their blocks,
 * never on a street.
 *
 * Layout parity with Spielen (founder, s88 follow-up): a centered "Lernpfad"
 * title mirrors the Spielen "Neuland" header, and the map is a native 3:2
 * block (360x240 viewBox, no mat padding) so it has the SAME dimensions and
 * screen position as the Spielen chapter hero. A left/right module pager at
 * the bottom flips the practice card through every Kapitel-1 mission (the pin
 * stays truthful to actual progress; paging only changes what you practise).
 *
 * Lazy by design (imports the mission bank) so the Dashboard keeps NO content
 * bank on its eager path (bundle budget, CLAUDE.md). Adding a chapter = extend
 * STOPS + SEG_PATHS.
 *
 * s104 (founder-picked from preview/ueben-map-mockups.html): the street grid
 * was re-spaced so no landmark tile hugs a map edge, and the palettes moved to
 * the brand-tinted "Stimmung 3" (light) + "Dunkel D: Klarer Abend" (dark,
 * deliberately bright with near-white labels; the old night palette was too
 * dark). The route color rides the palette (`P.route`), not --primary.
 */

type StopState = "done" | "current" | "locked";

// Kapitel-1 stops in mission order, bound to their missions. `stop` is the
// route point on the street grid, `tile` the landmark tile center (inside a
// block). Coordinates live in the 360 x 230 map viewBox. Re-spaced in s104
// (founder-picked mockup): the street grid sits at y 88/170 and x 76/176/276
// so every tile keeps clear margin to the map edges.
//
// `labelPos` and `chipPos` are collision-authored per stop (s104 follow-up):
// the top-row stops (tile ABOVE the stop point) label ABOVE the tile and put
// the "Du bist hier" chip to the RIGHT of the pin, because a below-label and
// an above-chip both land exactly where the pin + pulse ring render when that
// stop is current (the founder's live screenshot showed the pin slicing
// through "Bahnhof" and the chip covering the tile).
const STOPS = [
  { key: "bahnhof", label: "Bahnhof", missions: ["m_kap1_willkommen", "m_kap1_automat"], stop: [44, 88], tile: [44, 48], color: "#5b5be6", labelPos: "above", chipPos: "right" },
  { key: "laden", label: "Laden", missions: ["m_kap1_sim", "m_kap1_einkauf"], stop: [120, 88], tile: [120, 48], color: "#f0705f", labelPos: "above", chipPos: "right" },
  { key: "zuhause", label: "Zuhause", missions: ["m_kap1_dach"], stop: [276, 128], tile: [310, 128], color: "#f2a03d", labelPos: "below", chipPos: "above" },
  { key: "amt", label: "Amt", missions: ["m_kap1_anmeldung"], stop: [216, 170], tile: [216, 205], color: "#2fa8a0", labelPos: "right", chipPos: "above" },
] as const;

// Route legs between consecutive stops, along the street grid. Leg i arrives at
// stop i+1; it renders solid when that stop is at or before the current one.
const SEG_PATHS = ["M44 88 H120", "M120 88 H276 V128", "M276 128 V170 H216"];

// Map scenery palette (theme-aware: the map is an app surface on Heute).
// s104 founder pick: light = "Brand-Ton" (indigo-tinted ground and blocks,
// green parks), dark = "Klarer Abend" (the brightest of the dark candidates;
// blue-grey ground, near-white labels, dusk rather than deep night). `route`
// rides the palette because the dark map needs a brighter indigo than the
// --primary token to keep contrast on the lifted ground.
const MAP_LIGHT = {
  ground: "#eef0f7", park: "#d6e6cf", parkDeep: "#bfd9b4",
  lotA: "#e5e4f1", lotB: "#dbd9ea",
  casing: "#dee0ee", street: "#ffffff", dash: "#d3d5e7",
  label: "#5a5e78", dotFill: "#ffffff", pinRing: "#ffffff",
  route: "#5b5be6",
};
const MAP_DARK = {
  ground: "#2e3450", park: "#3a5545", parkDeep: "#4b7058",
  lotA: "#42486e", lotB: "#393f60",
  casing: "#232841", street: "#5a6187", dash: "#8f97bd",
  label: "#dde1f2", dotFill: "#f4f5fc", pinRing: "#f4f5fc",
  route: "#a6a6fd",
};

// The "you are here" pin is a dedicated red (distinct from the indigo route
// line) so it reads as a live location marker, not part of the path itself.
const PIN_COLOR = "#e5484d";

// White glyphs inside the landmark tiles (drawn at the tile center).
function TileGlyph({ kind, color }: { kind: (typeof STOPS)[number]["key"]; color: string }) {
  switch (kind) {
    case "bahnhof":
      return (
        <>
          <rect x={-7} y={-9} width={14} height={14} rx={3.5} fill="#fff" />
          <rect x={-4.5} y={-6} width={9} height={4.5} rx={1.5} fill={color} />
          <circle cx={-3.2} cy={1.8} r={1.6} fill={color} />
          <circle cx={3.2} cy={1.8} r={1.6} fill={color} />
          <path d="M-5 9 L-2 5.5 M5 9 L2 5.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "laden":
      return (
        <>
          <path d="M-7 -3 h14 l-1.6 11 a2.5 2.5 0 0 1 -2.5 2 h-5.8 a2.5 2.5 0 0 1 -2.5 -2 z" fill="#fff" />
          <path d="M-3.5 -3 v-2 a3.5 3.5 0 0 1 7 0 v2" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "zuhause":
      return (
        <>
          <path d="M-8 0 L0 -8 L8 0 V8 a1.5 1.5 0 0 1 -1.5 1.5 h-13 A1.5 1.5 0 0 1 -8 8 z" fill="#fff" />
          <rect x={-2.2} y={2.5} width={4.4} height={7} rx={1.4} fill={color} />
        </>
      );
    default:
      return (
        <>
          <path d="M-9 -3 L0 -9 L9 -3 z" fill="#fff" />
          <rect x={-8} y={-1.5} width={3} height={8.5} rx={1} fill="#fff" />
          <rect x={-1.5} y={-1.5} width={3} height={8.5} rx={1} fill="#fff" />
          <rect x={5} y={-1.5} width={3} height={8.5} rx={1} fill="#fff" />
          <rect x={-9} y={8} width={18} height={2.5} rx={1.2} fill="#fff" />
        </>
      );
  }
}

export default function UebenPath() {
  const navigate = useNavigate();
  const missionsDone = useProgressStore((s) => s.missionsDone);
  const isDark = useIsDark();
  const P = isDark ? MAP_DARK : MAP_LIGHT;

  const kap1 = useMemo(
    () => missions.filter((m) => m.chapter === "kap1").sort((a, b) => a.index - b.index),
    [],
  );
  const chapterTitle = chapters.find((c) => c.id === "kap1")?.title ?? "";
  const doneKey = missionsDone.join(",");

  const { states, currentIndex, nextMission, doneCount } = useMemo(() => {
    const isDone = (id: string) => missionsDone.includes(id);
    let cur = STOPS.findIndex((s) => !s.missions.every(isDone));
    const complete = cur === -1;
    if (complete) cur = STOPS.length - 1;
    const st: StopState[] = STOPS.map((s, i) => {
      const allDone = s.missions.every(isDone);
      if (allDone) return complete && i === cur ? "current" : "done";
      return i === cur ? "current" : "locked";
    });
    const next = kap1.find((m) => !isDone(m.id)) ?? kap1[kap1.length - 1];
    const dc = kap1.filter((m) => isDone(m.id)).length;
    return { states: st, currentIndex: cur, nextMission: next, doneCount: dc };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, kap1]);

  const [pinX, pinY] = STOPS[currentIndex].stop;

  // Module pager: which mission's content the practice card shows. Defaults to
  // the next unplayed mission; paging never moves the map pin (progress truth).
  const nextIdx = Math.max(0, kap1.findIndex((m) => m.id === nextMission.id));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState(1);
  const idx = selectedIdx ?? nextIdx;
  const selected = kap1[idx] ?? nextMission;
  const selectedDone = missionsDone.includes(selected.id);
  const isNextModule = selected.id === nextMission.id && !selectedDone;
  const reducedMotion = useReducedMotion();

  // Mobile module navigation: no arrows (founder), the dots plus a horizontal
  // swipe on the practice card move between modules.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const goTo = (i: number) => {
    const target = Math.min(kap1.length - 1, Math.max(0, i));
    setSlideDir(target >= idx ? 1 : -1);
    setSelectedIdx(target);
  };

  // Tappable stops (s104 follow-up): tapping a landmark slides the practice
  // card to that stop's first unplayed mission (else its first mission). The
  // pin never moves; like the pager, tapping only changes what you practise.
  const stopTarget = (s: (typeof STOPS)[number]) => {
    const ids = s.missions as readonly string[];
    const unplayed = kap1.findIndex((m) => ids.includes(m.id) && !missionsDone.includes(m.id));
    return unplayed !== -1 ? unplayed : kap1.findIndex((m) => m.id === ids[0]);
  };

  return (
    // Single column on both phone and desktop (founder). Phone: header + map
    // pinned to the top, the card + pager grouped and vertically centered in
    // the space below the map (`my-auto`) so the map tile lands at the same
    // screen position as the Spielen hero and the dots aren't stranded at the
    // bottom; the tab fills the viewport without scrolling. Desktop (lg): the
    // column takes its natural height (`lg:min-h-0`, `lg:my-0`) and the whole
    // start page is vertically centered + widened by the Dashboard wrapper, so
    // it reads as a deliberate focused column instead of a stranded one.
    <div className="flex min-h-[calc(100dvh-15rem)] flex-col gap-4 lg:min-h-0">
      {/* Centered page title, mirroring the Spielen "Neuland" header row */}
      <h1 className="text-center text-2xl font-bold">Lernpfad</h1>

      {/* Illustrated city map: the single journey surface (stepper retired s88).
          Native 3:2 (360x240) in a surface mat (the same mat, same dimensions
          and screen position as the Spielen hero), with a neutral gray
          border shared with the Spielen hero mat (founder: colored borders
          read poorly here; the section color lives on the toggle instead). */}
      <div className="rounded-2xl border border-border bg-surface p-2 shadow-soft">
        <div className="relative overflow-hidden rounded-xl">
        <svg
          viewBox="0 0 360 240"
          className="block h-auto w-full"
          role="group"
          aria-label="Neuland-Karte mit deinem Lernweg"
        >
          <rect width={360} height={240} fill={P.ground} />
          <g transform="translate(0 5)">
            <defs>
              <filter id="ueben-lm-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#2a2e3f" floodOpacity="0.22" />
              </filter>
            </defs>

            {/* parks + ambient lots (all inside blocks, never on streets; the
                zones above the Bahnhof/Laden tiles stay clear for the above-labels) */}
            <rect x={140} y={10} width={20} height={52} rx={10} fill={P.park} />
            <circle cx={150} cy={22} r={5.5} fill={P.parkDeep} />
            <circle cx={150} cy={44} r={6} fill={P.parkDeep} />
            <rect x={192} y={104} width={68} height={48} rx={12} fill={P.park} />
            <circle cx={212} cy={120} r={9} fill={P.parkDeep} />
            <circle cx={242} cy={136} r={10} fill={P.parkDeep} />
            <rect x={92} y={188} width={68} height={24} rx={11} fill={P.park} />
            <rect x={8} y={6} width={20} height={10} rx={5} fill={P.lotA} />
            <rect x={192} y={14} width={40} height={28} rx={7} fill={P.lotA} />
            <rect x={240} y={20} width={20} height={44} rx={7} fill={P.lotB} />
            <rect x={294} y={14} width={50} height={24} rx={7} fill={P.lotA} />
            <rect x={300} y={48} width={28} height={16} rx={6} fill={P.lotB} />
            <rect x={12} y={104} width={40} height={48} rx={7} fill={P.lotB} />
            <rect x={92} y={104} width={44} height={48} rx={7} fill={P.lotA} />
            <rect x={144} y={104} width={16} height={30} rx={6} fill={P.lotB} />
            <rect x={10} y={186} width={44} height={24} rx={7} fill={P.lotA} />
            <rect x={294} y={186} width={50} height={26} rx={7} fill={P.lotB} />

            {/* streets: casing, surface, center dashes */}
            <g fill="none" stroke={P.casing} strokeWidth={20} strokeLinecap="round">
              <path d="M-10 88 H370" />
              <path d="M-10 170 H370" />
              <path d="M76 -10 V240" />
              <path d="M176 -10 V240" />
              <path d="M276 -10 V240" />
            </g>
            <g fill="none" stroke={P.street} strokeWidth={13} strokeLinecap="round">
              <path d="M-10 88 H370" />
              <path d="M-10 170 H370" />
              <path d="M76 -10 V240" />
              <path d="M176 -10 V240" />
              <path d="M276 -10 V240" />
            </g>
            <g fill="none" stroke={P.dash} strokeWidth={1.6} strokeDasharray="7 9">
              <path d="M0 88 H360" />
              <path d="M0 170 H360" />
              <path d="M76 0 V230" />
              <path d="M176 0 V230" />
              <path d="M276 0 V230" />
            </g>

            {/* route: solid (with glow) up to the current stop, dotted onward */}
            {SEG_PATHS.map((d, i) =>
              i + 1 <= currentIndex ? (
                <g key={d}>
                  <path d={d} fill="none" stroke={P.route} strokeWidth={12} strokeOpacity={0.14} strokeLinecap="round" strokeLinejoin="round" />
                  <path d={d} fill="none" stroke={P.route} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : (
                <path key={d} d={d} fill="none" stroke={P.route} strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" strokeDasharray="0.5 11" />
              ),
            )}

            {/* a white dot on every completed stop */}
            {STOPS.map((s, i) =>
              states[i] === "done" && i !== currentIndex ? (
                <circle key={s.key} cx={s.stop[0]} cy={s.stop[1]} r={5.5} fill={P.dotFill} stroke={P.route} strokeWidth={3} />
              ) : null,
            )}

            {/* landmark tiles (inside blocks) + labels; each is a button that
                slides the practice card to that stop's module (stopTarget) */}
            {STOPS.map((s) => (
              <g
                key={s.key}
                role="button"
                tabIndex={0}
                aria-label={`${s.label}: Übungsmodul wählen`}
                className="ueben-stop"
                onClick={() => goTo(stopTarget(s))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goTo(stopTarget(s));
                  }
                }}
              >
                {/* invisible hit area (~44px tap target incl. the label zone) */}
                <rect x={s.tile[0] - 22} y={s.tile[1] - 22} width={44} height={44} rx={12} fill="transparent" />
                <rect x={s.tile[0] - 17} y={s.tile[1] - 17} width={34} height={34} rx={10} fill={s.color} filter="url(#ueben-lm-shadow)" />
                <g transform={`translate(${s.tile[0]} ${s.tile[1]})`}>
                  <TileGlyph kind={s.key} color={s.color} />
                </g>
                {s.labelPos === "right" ? (
                  <text x={s.tile[0] + 23} y={s.tile[1] + 4} fontSize={10.5} fontWeight={700} fill={P.label} fontFamily="inherit">
                    {s.label}
                  </text>
                ) : (
                  <text
                    x={s.tile[0]}
                    y={s.tile[1] + (s.labelPos === "above" ? -24 : 29)}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={700}
                    fill={P.label}
                    fontFamily="inherit"
                  >
                    {s.label}
                  </text>
                )}
              </g>
            ))}

            {/* current stop: pulse ring + location pin, both in the pin's red
                so the ring reads as "part of the marker", not the route */}
            <circle cx={pinX} cy={pinY} r={8} fill="none" stroke={PIN_COLOR} strokeWidth={1.5} className="uben-pulse" />
            {/* pin at 70% (founder s104 follow-up), scaled about its tip so it
                still points exactly at the stop */}
            <g transform={`translate(${pinX} ${pinY}) scale(0.7)`}>
              <ellipse cx={0} cy={3} rx={7} ry={2.4} fill="#3b3f4a" opacity={0.18} />
              <path
                d="M0 2 c-8 -10.5 -12 -16 -12 -22.5 a12 12 0 1 1 24 0 c0 6.5 -4 12 -12 22.5 z"
                fill={PIN_COLOR}
                stroke={P.pinRing}
                strokeWidth={2.5}
              />
              <circle cx={0} cy={-20.5} r={4.6} fill={P.pinRing} />
            </g>
          </g>
        </svg>

          {/* "Du bist hier" chip floats beside the pin, per-stop placement so
              it never covers the current stop's tile (chipPos in STOPS);
              sized down (s106 follow-up) so it stays proportionate to the
              now-smaller pin instead of dwarfing it */}
          <span
            className={cn(
              "absolute whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[9px] font-bold shadow-soft",
              STOPS[currentIndex].chipPos === "right" ? "-translate-y-1/2" : "-translate-x-1/2 -translate-y-full",
            )}
            style={
              STOPS[currentIndex].chipPos === "right"
                ? { left: `${((pinX + 9) / 360) * 100}%`, top: `${((pinY + 5 - 6) / 240) * 100}%` }
                : { left: `${(pinX / 360) * 100}%`, top: `${((pinY + 5 - 20) / 240) * 100}%` }
            }
          >
            Du bist hier
          </span>
        </div>
      </div>

      {/* Card + pager as one group. Phone: vertically centered in the leftover
          space (`my-auto`) with a tight internal gap so the tile drops down and
          the dots rise to sit just below it. Desktop: natural flow right under
          the map (`lg:my-0`), the whole column centered by the Dashboard. */}
      <div className="my-auto space-y-3 lg:my-0">
      {/* Practice-module card: shows the mission selected in the pager below
          (defaults to the next unplayed mission). Swipe left/right to change
          the module on touch. */}
      <div
        className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-soft"
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const t = touchStart.current;
          touchStart.current = null;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(dx < 0 ? idx + 1 : idx - 1);
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Kapitel 1 · {chapterTitle}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold tabular-nums text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {doneCount} / {kap1.length}
          </span>
        </div>
        {/* Module content slides horizontally when the pager changes modules */}
        <motion.div
          key={selected.id}
          initial={reducedMotion ? false : { x: slideDir * 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.13, ease: "easeOut" }}
        >
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[13px] font-bold tabular-nums text-muted-foreground">1.{selected.index}</span>
            {isNextModule && (
              <span className="inline-flex rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Als Nächstes
              </span>
            )}
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold leading-tight tracking-tight">{selected.title}</h2>
            {selectedDone && (
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                <Check className="h-3 w-3" />
                Erledigt
              </span>
            )}
          </div>
          {/* ONE state-aware CTA (founder): "Jetzt üben" for a new module,
              "Wiederholen" for a completed one. Both open the same composed
              practice session focused on THIS mission (its own vocab +
              Redemittel first, then theme-related fill), NOT the game itself.
              Playing a mission lives under Heute → Spielen (and /welt). */}
          <button
            type="button"
            onClick={() => navigate(`/session?mission=${selected.id}`)}
            className={cn(
              "mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-extrabold transition active:scale-[0.99]",
              selectedDone
                ? "bg-muted text-foreground"
                : "bg-accent-gradient text-white shadow-glow",
            )}
          >
            {selectedDone ? (
              <>
                <RotateCcw className="h-[17px] w-[17px] text-muted-foreground" />
                Wiederholen
              </>
            ) : (
              <>
                Jetzt üben
                <ArrowRight className="h-[18px] w-[18px]" />
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Module pager: dots for every Kapitel-1 practice module. Arrows only on
          desktop (founder: on mobile the dots + card swipe are enough). Sits
          just below the card inside the centered group. */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Vorheriges Modul"
          disabled={idx === 0}
          onClick={() => goTo(idx - 1)}
          className="hidden h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground shadow-soft transition active:scale-95 disabled:opacity-35 sm:grid"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <div className="flex items-center">
          {kap1.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={`Modul 1.${m.index}`}
              aria-current={i === idx}
              onClick={() => goTo(i)}
              className="grid h-8 place-items-center px-1.5"
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === idx
                    ? "w-5 bg-primary"
                    : missionsDone.includes(m.id)
                      ? "w-2 bg-success/50"
                      : "w-2 bg-border",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Nächstes Modul"
          disabled={idx === kap1.length - 1}
          onClick={() => goTo(idx + 1)}
          className="hidden h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground shadow-soft transition active:scale-95 disabled:opacity-35 sm:grid"
        >
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>
      </div>

      <style>{`.uben-pulse{animation:uben-pulse 2.2s ease-in-out infinite}@keyframes uben-pulse{0%,100%{opacity:.45}50%{opacity:1}}.ueben-stop{cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .16s ease-out;outline:none}.ueben-stop:hover,.ueben-stop:focus-visible{transform:scale(1.08)}.ueben-stop:focus-visible rect:first-of-type{stroke:hsl(var(--primary));stroke-width:2}@media (prefers-reduced-motion:reduce){.uben-pulse{animation:none}.ueben-stop{transition:none}.ueben-stop:hover,.ueben-stop:focus-visible{transform:none}}`}</style>
    </div>
  );
}
