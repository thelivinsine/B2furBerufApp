import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Flame, Zap, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useProgressStore, useTodayXp } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { levelFromXp } from "@/engine/scoring";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Toaster } from "./Toaster";
import { SaveProgressBanner } from "@/features/auth/SaveProgressBanner";
import { AccountMenu } from "@/features/auth/AccountMenu";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
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

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="left-0 top-0 h-full max-h-none w-64 max-w-[16rem] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-l-0 p-0 sm:max-w-[16rem]">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-surface/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
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

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <SaveProgressBanner />
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
