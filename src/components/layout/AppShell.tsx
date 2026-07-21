import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Loader2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { GlobalSearch } from "./GlobalSearch";
import { FeedbackDialog, FeedbackPill } from "./FeedbackButton";
import { useEffectiveStreak } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Toaster } from "./Toaster";
import { SaveProgressBanner } from "@/features/auth/SaveProgressBanner";
import { AccountMenu } from "@/features/auth/AccountMenu";
import { loadWritingDraft } from "@/features/writing/resumeDraft";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Universal shortcut (UX overhaul Phase 2, Tier 1): ⌘K / Ctrl+K opens global
  // search from anywhere. The header no longer carries a search icon (s-polish);
  // the desktop Sidebar keeps a visible entry, and ⌘K works app-wide.
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

  const location = useLocation();
  const navigate = useNavigate();

  const authStatus = useAuthStore((s) => s.status);
  // Effective streak (0 once broken) so the header never disagrees with the
  // dashboard after a missed day.
  const streak = useEffectiveStreak();

  // Greeting only in the desktop top row (the XP line was removed, founder
  // 2026-07-13). Hour-based greeting keeps the header personal.
  const name = useSettingsStore((s) => s.name);
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  // Focus mode (Phase 2.1): the SessionPlayer flags an active composed session,
  // and we hide all chrome (header, bottom bar, sidebar) so it plays as a
  // full-screen stage. Both routes that mount the player (`/session` and the
  // Schnellwiederholung preset `/revision`) qualify; gating on the route too
  // means a stale flag can never strand the app chromeless anywhere else.
  const focusMode = useSessionStore((s) => s.focusMode);
  const focus =
    focusMode &&
    (location.pathname === "/session" ||
      location.pathname === "/revision" ||
      location.pathname === "/welt");

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background bg-page text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Schreibtraining wird fortgesetzt …</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-page">
      <Toaster />

      {/* Desktop sidebar */}
      {!focus && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface/60 backdrop-blur-xl lg:block">
          <Sidebar onSearch={() => setSearchOpen(true)} />
        </aside>
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile bottom tab bar (hidden in focus mode). The "Mehr" sheet was
          retired (s-polish): the bar now ends in a fixed Einstellungen tab, and
          the middle sections reorder via a long-press easter egg. */}
      {!focus && <BottomTabBar />}

      {/* The single feedback dialog is mounted app-wide (even in focus mode, so
          the in-session feedback button can open it). The quiet floating pill
          (desktop bottom-right) shows only outside focus mode; mobile + the
          session use their own triggers (icon beside Üben / in-session button). */}
      <FeedbackDialog />
      {!focus && <FeedbackPill />}

      <div className={cn(!focus && "lg:pl-64")}>
        {/* Top bar */}
        {/* Mobile gets a lighter blur + more opaque surface: backdrop-filter on
            fixed/sticky layers repaints on every scroll frame and was a scroll-
            jank source on phones (audit B3). Desktop keeps the original look. */}
        {!focus && (
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 pt-safe backdrop-blur-md lg:bg-surface/70 lg:backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Link
                to="/welcome"
                className="flex items-center gap-2 lg:hidden"
                aria-label="Zur Startseite"
              >
                <Logo className="h-8 w-8" />
              </Link>
              <div className="hidden leading-tight lg:block">
                <p className="text-sm font-semibold">
                  {greeting}
                  {name ? `, ${name}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Streak chip: flame + day count. The daily-goal figure lives on
                  the dashboard ring now, so the header carries the streak alone
                  (no duplicated goal gauge). Koralle since the s133 rebrand:
                  streak/celebration rides the reward tokens, warning stays a
                  semantic state color. */}
              <div
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-reward-bg px-3"
                role="img"
                aria-label={`Serie: ${streak} ${streak === 1 ? "Tag" : "Tage"}`}
              >
                <Flame className={cn("h-4 w-4 text-reward", streak > 0 && "fill-reward/30")} />
                <span className="text-sm font-bold tabular-nums text-reward">{streak}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {streak === 1 ? "Tag" : "Tage"}
                </span>
              </div>
              <AccountMenu />
            </div>
          </div>
        </header>
        )}

        <main
          className={cn(
            focus
              ? "mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pt-safe pb-safe sm:px-6"
              : "mx-auto w-full max-w-6xl px-4 pt-6 pb-nav sm:px-6 sm:pt-8 lg:pb-safe-8",
          )}
        >
          {/* Desktop shows this nudge at the bottom of the sidebar instead; keep
              a mobile-only copy on Heute where there is no sidebar. */}
          {location.pathname === "/" && (
            <div className="lg:hidden">
              <SaveProgressBanner />
            </div>
          )}
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
