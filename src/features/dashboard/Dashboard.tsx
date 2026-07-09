import { lazy, Suspense, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, Zap, Play } from "lucide-react";
import { useProgressStore, useTodayXp, useEffectiveStreak } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { dueCount } from "@/engine/srs";
import { daysBetween, todayKey, cn } from "@/lib/utils";

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

/** One Fortschritt stat: a small ring with the exact figure in its centre. */
function StatRing({
  pct,
  color,
  value,
  label,
  sub,
}: {
  pct: number;
  color: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="card-hover flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface p-4 text-center">
      <Ring pct={pct} size={62} color={color}>
        <span className="text-sm font-bold tabular-nums">{value}</span>
      </Ring>
      <span className="text-sm font-medium leading-none">{label}</span>
      <span className="text-[11.5px] leading-none text-muted-foreground">{sub}</span>
    </div>
  );
}

const tag =
  "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground";

export function Dashboard() {
  const name = useSettingsStore((s) => s.name);
  const examDate = useSettingsStore((s) => s.examDate);
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const streak = useEffectiveStreak();
  const srs = useProgressStore((s) => s.srs);
  const totalSessions = useProgressStore((s) => s.totalSessions);
  const todayXp = useTodayXp();

  const [tab, setTab] = useState<HeuteTab>("ueben");

  const goalPercent = Math.round(Math.min(todayXp / goal, 1) * 100);
  const daysToExam = examDate ? Math.max(0, daysBetween(todayKey(), examDate)) : null;
  const due = dueCount(srs);
  const learned = Object.keys(srs).length;

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  // Session length target, deterministic so the subtitle stays stable.
  const sessionMinutes = Math.max(5, Math.round(goal / 8));
  const started = totalSessions > 0 || todayXp > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1 — Orientation (unchanged): one conic ring fusing greeting, streak and
          daily goal. This is the kept "top row". */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${goalPercent}% des Tagesziels`}>
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${goalPercent * 3.6}deg, hsl(var(--border)) ${goalPercent * 3.6}deg)`,
            }}
          />
          <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-background">
            <Flame className="h-4 w-4 text-warning" />
            <span className="text-lg font-bold leading-none tabular-nums">{streak}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-tight">
            {greeting}
            {name ? `, ${name}` : ""}
          </p>
          <p className="mt-1 text-sm tabular-nums text-muted-foreground">
            {todayXp} / {goal} XP · {goalPercent}%
          </p>
          {daysToExam !== null && (
            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{daysToExam} Tage bis Prüfung</p>
          )}
        </div>
      </motion.div>

      {/* 2 — Üben / Spielen: the two ways into the day. Üben opens by default. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        role="tablist"
        aria-label="Modus"
        className="inline-flex gap-1 rounded-full border border-border bg-muted p-1"
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

            {/* Fortschritt: four figures straight from the progress store, no
                content-bank walk. Rings show progress to the next milestone;
                the centred number is the exact figure. */}
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatRing
                  pct={goalPercent}
                  color="hsl(var(--primary))"
                  value={`${goalPercent}%`}
                  label="Tagesziel"
                  sub={`${todayXp} XP heute`}
                />
                <StatRing
                  pct={Math.min(streak / 7, 1) * 100}
                  color="hsl(var(--warning))"
                  value={`${streak}`}
                  label="Serie"
                  sub="Tage in Folge"
                />
                <StatRing
                  pct={((learned % 50) / 50) * 100}
                  color="hsl(var(--accent))"
                  value={`${learned}`}
                  label="Wörter"
                  sub="gelernt"
                />
                <StatRing
                  pct={due === 0 ? 100 : Math.min(due / 25, 1) * 100}
                  color={due === 0 ? "hsl(var(--success))" : "hsl(var(--primary))"}
                  value={`${due}`}
                  label="Fällig"
                  sub={due === 0 ? "alles wiederholt" : "zum Wiederholen"}
                />
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
