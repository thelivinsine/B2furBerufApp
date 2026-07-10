import { lazy, Suspense, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Play, Check } from "lucide-react";
import { useProgressStore, useTodayXp } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
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
  const inset = size < 76 ? 7 : size < 120 ? 9 : 11;
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

export function Dashboard() {
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const srs = useProgressStore((s) => s.srs);
  const dailyXp = useProgressStore((s) => s.dailyXp);
  const totalSessions = useProgressStore((s) => s.totalSessions);
  const todayXp = useTodayXp();

  const [tab, setTab] = useState<HeuteTab>("ueben");

  const goalPercent = Math.round(Math.min(todayXp / goal, 1) * 100);
  const learned = Object.keys(srs).length;
  const goalReached = goalPercent >= 100;

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
          default. The greeting + streak now live in the top row. */}
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
            className="mx-auto max-w-md space-y-6"
          >
            {/* Goal ring hero: the single daily-goal meter (deduped — the header
                carries the streak, this carries the goal). */}
            <div className="flex flex-col items-center pt-1 text-center">
              <Ring pct={goalPercent} size={128} hole="hsl(var(--background))">
                <span className="text-[26px] font-bold leading-none tabular-nums">{goalPercent}%</span>
                <span className="mt-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {todayXp} / {goal} XP
                </span>
              </Ring>
              <div className="mt-3">
                {goalReached ? (
                  <p className="flex items-center justify-center gap-1.5 text-base font-bold text-success">
                    <Check className="h-4 w-4" strokeWidth={3} /> Tagesziel erreicht
                  </p>
                ) : (
                  <p className="text-base font-bold">
                    Noch {Math.max(0, goal - todayXp)} XP bis zum Ziel
                  </p>
                )}
              </div>
            </div>

            {/* 7-day activity heatmap. From the progress store, no bank walk. */}
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex gap-1.5" aria-label="Aktivität der letzten 7 Tage">
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

            {/* Primary action: the composed session, with a real full-width
                button (no faint arrow). Minutes only on the subtitle. */}
            <Link to="/session" className="block">
              <div className="card-hover rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Empfohlen
                    </p>
                    <h2 className="mt-1 text-lg font-bold leading-tight">Deine Session</h2>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {sessionMinutes} Min
                  </span>
                </div>
                <span className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-md">
                  {started ? "Weitermachen" : "Session starten"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* One slim stats line: the only non-duplicated number + the way to
                the full statistics. */}
            <div className="flex items-baseline justify-between px-1">
              <span className="text-sm text-muted-foreground">
                <span className="font-bold tabular-nums text-foreground">{learned}</span> Wörter gelernt
              </span>
              <Link to="/analytics" className="text-sm font-semibold text-primary hover:underline">
                Alle Statistiken →
              </Link>
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
