import { Suspense, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Zap, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { BottomTabBar } from "./BottomTabBar";
import { MoreSheet } from "./MoreSheet";
import { useProgressStore, useTodayXp } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { levelFromXp } from "@/engine/scoring";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Toaster } from "./Toaster";
import { SaveProgressBanner } from "@/features/auth/SaveProgressBanner";
import { AccountMenu } from "@/features/auth/AccountMenu";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const todayXp = useTodayXp();
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const level = levelFromXp(xp).level;
  const goalProgress = Math.min(todayXp / goal, 1);

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Toaster />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface/60 backdrop-blur-xl lg:block">
        <Sidebar />
      </aside>

      {/* Mobile bottom tab bar + "Mehr" sheet */}
      <BottomTabBar onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-surface/70 pt-safe backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Link
                to="/welcome"
                className="flex items-center gap-2 lg:hidden"
                aria-label="Zur Startseite"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-glow">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold tracking-tight">Genauly</span>
              </Link>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Willkommen zurück 👋
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-9 items-center gap-1.5 rounded-full bg-warning/12 px-3 text-sm font-semibold text-warning">
                <Flame className={cn("h-4 w-4", streak > 0 && "fill-warning/30")} />
                {streak}
              </div>
              <div className="hidden h-9 items-center gap-1.5 rounded-full bg-primary/12 px-3 text-sm font-semibold text-primary sm:flex">
                <Zap className="h-4 w-4" />
                Lvl {level}
              </div>
              <ProgressRing value={goalProgress} size={36} stroke={4}>
                <span className="text-[9px] font-bold tabular-nums">{todayXp}</span>
              </ProgressRing>
              <ThemeToggle />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-nav sm:px-6 sm:pt-8 lg:pb-safe-8">
          <SaveProgressBanner />
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>
              <Suspense
                fallback={
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
