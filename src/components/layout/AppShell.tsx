import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Loader2, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { BottomTabBar } from "./BottomTabBar";
import { MoreSheet } from "./MoreSheet";
import { GlobalSearch } from "./GlobalSearch";
import { useEffectiveStreak } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Toaster } from "./Toaster";
import { ModeSwitcher } from "./ModeSwitcher";
import { SaveProgressBanner } from "@/features/auth/SaveProgressBanner";
import { AccountMenu } from "@/features/auth/AccountMenu";
import { loadWritingDraft } from "@/features/writing/resumeDraft";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Universal shortcut (UX overhaul Phase 2, Tier 1): ⌘K / Ctrl+K opens global
  // search from anywhere, alongside the header icon and the Sidebar entry.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function enterEditMode() {
    setEditMode(true);
    setMoreOpen(true);
  }
  // Tapping the Mehr tab toggles the sheet: open it, or close it (and exit edit
  // mode) if it is already open.
  function toggleMore() {
    setMoreOpen(prev => {
      if (prev) setEditMode(false);
      return !prev;
    });
  }
  const location = useLocation();
  const navigate = useNavigate();

  // Navigating to any route (e.g. tapping Home or another tab in the bar while
  // the sheet is open) closes the More sheet and exits edit mode. This handles
  // cross-route navigation; tapping the tab that is already active doesn't
  // change the pathname, so the bar also calls closeMore() directly on tap.
  useEffect(() => {
    setMoreOpen(false);
    setEditMode(false);
  }, [location.pathname]);
  function closeMore() {
    setMoreOpen(false);
    setEditMode(false);
  }
  const authStatus = useAuthStore((s) => s.status);
  // Effective streak (0 once broken) so the header never disagrees with the
  // dashboard after a missed day.
  const streak = useEffectiveStreak();

  // Resume Schreibtraining after sign-in. The Google OAuth flow redirects to
  // the app root, so when a learner signs in with a pending writing draft we
  // send them back to /writing, where WritingHub restores the text and resumes
  // the evaluation they were blocked on.
  useEffect(() => {
    if (authStatus !== "signedIn") return;
    if (location.pathname.startsWith("/writing")) return;
    const draft = loadWritingDraft();
    if (draft?.resume) {
      navigate(`/writing?theme=${draft.theme}`, { replace: true });
    }
  }, [authStatus, location.pathname, navigate]);

  // While the redirect above is pending, show a brief resume screen instead of
  // flashing the dashboard for a frame before the hop to /writing.
  const resuming =
    authStatus === "signedIn" &&
    !location.pathname.startsWith("/writing") &&
    loadWritingDraft()?.resume === true;

  if (resuming) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background bg-mesh text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Schreibtraining wird fortgesetzt …</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Toaster />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface/60 backdrop-blur-xl lg:block">
        <Sidebar onSearch={() => setSearchOpen(true)} />
      </aside>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile bottom tab bar + "Mehr" sheet */}
      <BottomTabBar
        onMore={toggleMore}
        onNavigate={closeMore}
        onLongPress={enterEditMode}
        editMode={editMode}
        moreOpen={moreOpen}
      />
      <MoreSheet
        open={moreOpen}
        editMode={editMode}
        onLongPress={enterEditMode}
        onOpenChange={open => {
          setMoreOpen(open);
          if (!open) setEditMode(false); // auto-save: edit mode ends when sheet closes
        }}
      />

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
                <img src="/genauly-default-logo-transparent-corners.png" alt="" className="h-8 w-8 rounded-lg shadow-glow" />
                <span className="text-sm font-semibold tracking-tight">Genauly</span>
              </Link>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Willkommen zurück 👋
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <ModeSwitcher />
              <div
                className="flex h-9 items-center gap-1.5 rounded-full bg-warning/10 px-3 text-sm font-semibold text-warning"
                aria-label={`Serie: ${streak} ${streak === 1 ? "Tag" : "Tage"}`}
              >
                <Flame className={cn("h-4 w-4", streak > 0 && "fill-warning/30")} />
                {streak}
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Suche öffnen"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
              <ThemeToggle />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-nav sm:px-6 sm:pt-8 lg:pb-safe-8">
          {location.pathname === "/" && <SaveProgressBanner />}
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
