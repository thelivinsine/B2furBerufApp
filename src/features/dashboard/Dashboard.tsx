import { lazy, Suspense, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Play, Flame, BookOpen, Clock } from "lucide-react";
import { useProgressStore, useTodayXp, useEffectiveStreak } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { dueCount } from "@/engine/srs";
import { cn, todayKey } from "@/lib/utils";

// The Neuland carousel imports the mission bank, so it loads lazily to keep the
// content bank off the Dashboard's eager path (bundle budget, CLAUDE.md), the
// same rule the city strip followed before it.
const NeulandCarousel = lazy(() => import("./NeulandCarousel"));

type HeuteTab = "ueben" | "spielen";

/** A conic progress ring with a centred label. Pure CSS gradient (no recharts
 *  on the eager path). `pct` is 0..100; `color` is any CSS colour. */
function Ring({
  pct,
  size = 92,
  color = "hsl(var(--primary))",
  hole = "hsl(var(--surface))",
  children,
}: {
  pct: number;
  size?: number;
  color?: string;
  hole?: string;
  children: ReactNode;
}) {
  const inset = size < 76 ? 7 : 9;
  const deg = Math.max(0, Math.min(100, pct)) * 3.6;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${color} ${deg}deg, hsl(var(--border)) ${deg}deg)` }}
      />
      <div
        className="absolute flex flex-col items-center justify-center rounded-full text-center"
        style={{ inset, background: hole }}
      >
        {children}
      </div>
    </div>
  );
}

const tag =
  "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground";

export function Dashboard() {
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const srs = useProgressStore((s) => s.srs);
  const dailyXp = useProgressStore((s) => s.dailyXp);
  const totalSessions = useProgressStore((s) => s.totalSessions);
  const todayXp = useTodayXp();
  const streak = useEffectiveStreak();

  const [tab, setTab] = useState<HeuteTab>("ueben");

  const goalPercent = Math.round(Math.min(todayXp / goal, 1) * 100);
  const due = dueCount(srs);
  const learned = Object.keys(srs).length;

  // Session length target, deterministic so the subtitle stays stable.
  const sessionMinutes = Math.max(5, Math.round(goal / 8));
  const started = totalSessions > 0 || todayXp > 0;

  // Last 7 days (oldest first) for the activity heatmap: each cell is shaded by
  // that day's XP against the daily goal, from the progress store (no bank walk).
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    return {
      key,
      ratio: Math.min((dailyXp[key] ?? 0) / goal, 1),
      wd: ["S", "M", "D", "M", "D", "F", "S"][d.getDay()],
      isToday: i === 6,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Üben / Spielen: the two ways into the day, centred. Üben opens by
          default. The greeting + progress graphic now live in the top row. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        role="tablist"
        aria-label="Modus"
        className="mx-auto flex w-fit gap-1 rounded-full border border-border bg-muted p-1"
      >
        {(
          [
            { id: "ueben", label: "Üben", Icon: Zap },
            { id: "spielen", label: "Spielen", Icon: Play },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
              tab === id
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4", id === "spielen" && tab === id && "fill-current")} />
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === "ueben" ? (
          <motion.div
            key="ueben"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Primary action: the existing composed session, sized from the
                daily goal + due queue. Reuses /session; no new state. */}
            <Link to="/session" className="block">
              <div className="card-hover flex items-center gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <Ring pct={goalPercent} size={92} color="hsl(var(--primary))">
                  <span className="text-lg font-bold tabular-nums">{goalPercent}%</span>
                </Ring>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Empfohlen
                  </p>
                  <h2 className="mt-1 text-lg font-bold leading-tight">Deine Session</h2>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                    ~{sessionMinutes} Min{due > 0 ? ` · ${due} fällig` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={tag}>Wortschatz</span>
                    <span className={tag}>Redemittel</span>
                    {due > 0 && <span className={tag}>{due} fällig</span>}
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md sm:inline-flex">
                  {started ? "Weitermachen" : "Session starten"}
                  <ArrowRight className="h-4 w-4" />
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground sm:hidden" />
              </div>
            </Link>

            {/* Fortschritt: one hero bar for the daily goal plus a 7-day activity
                heatmap. All from the progress store, no content-bank walk. */}
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Verlauf</p>
                  <h3 className="mt-0.5 text-lg font-bold leading-tight">Dein Fortschritt</h3>
                </div>
                <Link to="/analytics" className="text-sm font-semibold text-primary hover:underline">
                  Alle Statistiken →
                </Link>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold">Tagesziel</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {todayXp} / {goal} XP · {goalPercent}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
                <div className="mt-4 flex gap-1.5" aria-label="Aktivität der letzten 7 Tage">
                  {week.map((d) => (
                    <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className="h-6 w-full rounded-md"
                        style={{
                          background:
                            d.ratio > 0
                              ? `hsl(var(--primary) / ${(0.3 + d.ratio * 0.6).toFixed(2)})`
                              : "hsl(var(--muted))",
                          boxShadow: d.isToday ? "0 0 0 2px hsl(var(--primary) / 0.35)" : undefined,
                        }}
                      />
                      <span className="text-[9px] font-medium text-muted-foreground">{d.wd}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compact stats, told apart by icon + colour (Option B). */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                {(
                  [
                    { Icon: Flame, tint: "warning", value: streak, label: "Tage Serie" },
                    { Icon: BookOpen, tint: "accent", value: learned, label: "Wörter gelernt" },
                    { Icon: Clock, tint: "primary", value: due, label: "Fällig heute" },
                  ] as const
                ).map(({ Icon, tint, value, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `hsl(var(--${tint}) / 0.14)`, color: `hsl(var(--${tint}))` }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold leading-none tabular-nums">{value}</div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="spielen"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense
              fallback={<div className="h-[300px] rounded-2xl border border-border bg-surface" />}
            >
              <NeulandCarousel />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
