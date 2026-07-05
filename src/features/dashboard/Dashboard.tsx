import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  Zap,
  Home,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useProgressStore, useTodayXp, useEffectiveStreak } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { dueCount } from "@/engine/srs";
import { daysBetween, todayKey } from "@/lib/utils";
import { intentCardsForMode, type IntentCard } from "./intentCards";

/** Where a Situationen chip launches: a scoped session for theme cards, else
 *  the card's own target (writing / redemittel). */
function chipTarget(card: IntentCard): string {
  if (card.vocab?.theme) return `/session?theme=${card.vocab.theme}`;
  return card.to;
}

/** Icon-first affordance for a Situationen chip, derived from its domain eyebrow
 *  (rendering only, so intentCards data stays untouched). */
function chipIcon(card: IntentCard): typeof Home {
  if (card.eyebrowDe.startsWith("Alltag")) return Home;
  if (card.eyebrowDe.startsWith("Prüfung")) return GraduationCap;
  if (card.eyebrowDe.startsWith("Beruf &")) return Sparkles;
  return Briefcase;
}

export function Dashboard() {
  const name = useSettingsStore((s) => s.name);
  const learningMode = useSettingsStore((s) => s.mode);
  const examDate = useSettingsStore((s) => s.examDate);
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const streak = useEffectiveStreak();
  const srs = useProgressStore((s) => s.srs);
  const todayXp = useTodayXp();

  const goalPercent = Math.round(Math.min(todayXp / goal, 1) * 100);
  const daysToExam = examDate ? Math.max(0, daysBetween(todayKey(), examDate)) : null;
  const due = dueCount(srs);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  // Session length target, deterministic so the subtitle stays stable.
  const sessionMinutes = Math.max(5, Math.round(goal / 8));

  // Mode-aware situation shortcuts: 3 compact chips launching scoped sessions.
  const situations = intentCardsForMode(learningMode).slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1 — Orientation: one conic ring fusing greeting, streak and daily goal.
          Pure CSS gradient, no recharts on the eager path. */}
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

      {/* 2 — The one primary action. The only gradient element on the screen. */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Link to="/session" className="block">
          <div className="card-hover relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-soft sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Zap className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight">Session starten</p>
                <p className="mt-0.5 text-sm tabular-nums text-white/85">
                  ~{sessionMinutes} Min{due > 0 ? ` · ${due} fällig` : ""}
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 shrink-0" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* 3 — Situationen: icon-first shortcuts into a scoped session. No header. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {situations.map((card, i) => {
          const Icon = chipIcon(card);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
            >
              <Link to={chipTarget(card)}>
                <div className="card-hover flex h-full items-center gap-2.5 rounded-xl border border-border bg-surface p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="truncate text-sm font-medium">{card.titleDe}</p>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
