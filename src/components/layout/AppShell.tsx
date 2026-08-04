import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Loader2, LogOut } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { GlobalSearch } from "./GlobalSearch";
import { FeedbackDialog, FeedbackPill } from "./FeedbackButton";
import { useEffectiveStreak } from "@/store/useProgressStore";
import { useAppConfigStore } from "@/lib/appConfig";
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
  const streakPillOn = useAppConfigStore((s) => s.config.header.streakPill);

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

  // Exam chrome (s186, founder): a running Prüfungssimulation hides the mobile
  // bottom bar and swaps the streak pill + account menu for ONE quiet exit, so
  // nothing on screen competes with the task. Lighter than focus mode on
  // purpose: the header and logo stay, because an exam still needs its top bar.
  // Route-gated like focus mode, so a stale flag can never strip the chrome
  // anywhere else.
  const examExit = useSessionStore((s) => s.examExit);
  const exam = !!examExit && location.pathname === "/exam";

  // Resume Schreibtraining after sign-in. The Google OAuth flow redirects to
  // the app root, so when a learner signs in with a pending writing draft we
  // send them back to /writing, where WritingHub restores the text and resumes
  // the evaluation they were blocked on.
  useEffect(() => {
    if (authStatus !== "signedIn") return;
    if (location.pathname.startsWith("/writing")) return;
    const draft = loadWritingDraft();
    if (draft?.resume) {
      // WritingHub's resume effect restores mode + theme + text from the draft
      // itself, so a bare /writing is enough (a Fokus draft has no theme).
      navigate("/writing", { replace: true });
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

      {/* Desktop sidebar. Hidden during an exam too (founder s186): it is the
          desktop counterpart of the bottom bar, and the room it frees is what
          lets a Teil lay its two tiles side by side. */}
      {!focus && !exam && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface/60 backdrop-blur-xl lg:block">
          <Sidebar onSearch={() => setSearchOpen(true)} />
        </aside>
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile bottom tab bar (hidden in focus mode). The "Mehr" sheet was
          retired (s-polish): the bar now ends in a fixed Einstellungen tab, and
          the middle sections reorder via a long-press easter egg. */}
      {!focus && !exam && <BottomTabBar />}

      {/* The single feedback dialog is mounted app-wide (even in focus mode, so
          the in-session feedback button can open it). The quiet floating pill
          (desktop bottom-right) shows only outside focus mode; mobile + the
          session use their own triggers (icon beside Üben / in-session button). */}
      <FeedbackDialog />
      {/* The floating pill sits bottom-right, exactly where a Teil parks its
          Weiter button, so it is out during an exam as well. */}
      {!focus && !exam && <FeedbackPill />}

      <div className={cn(!focus && !exam && "lg:pl-64")}>
        {/* Top bar */}
        {/* Mobile gets a lighter blur + more opaque surface: backdrop-filter on
            fixed/sticky layers repaints on every scroll frame and was a scroll-
            jank source on phones (audit B3). Desktop keeps the original look. */}
        {!focus && (
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 pt-safe backdrop-blur-md lg:bg-surface/70 lg:backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              {/* In an exam the mark is NOT a link: with the sidebar gone this
                  is the only thing left to click on the left, and navigating
                  away would silently end the run. The exit is the way out. */}
              {exam ? (
                <Logo className="h-8 w-8" />
              ) : (
                <Link
                  to="/welcome"
                  className="flex items-center gap-2 lg:hidden"
                  aria-label="Zur Startseite"
                >
                  <Logo className="h-8 w-8" />
                </Link>
              )}
              {!exam && (
                <div className="hidden leading-tight lg:block">
                  <p className="text-sm font-semibold">
                    {greeting}
                    {name ? `, ${name}` : ""}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* In an exam the right side is ONE quiet exit and nothing else:
                  muted, unfilled, same 36px box as the account button it
                  replaces, so it is found when looked for without pulling the
                  eye off the task. The confirm lives with the runner, which
                  owns the exam copy. */}
              {exam && (
                <button
                  type="button"
                  onClick={() => examExit?.()}
                  aria-label="Prüfung verlassen"
                  title="Prüfung verlassen"
                  className={cn(
                    "flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent",
                    "text-danger transition-colors hover:bg-danger/12",
                    // Phone: the mark alone, on the same 36px box the account
                    // button used. Desktop: the mark plus the word in a quiet
                    // red outline (founder s187, preview options X1 + X2), where
                    // there is room for it and no hover to rely on for the
                    // phone. No tooltip beside a visible label.
                    "w-9 sm:w-auto sm:border-danger/30 sm:px-3",
                  )}
                >
                  <LogOut className="h-[17px] w-[17px]" />
                  <span className="hidden text-sm font-semibold sm:inline">Verlassen</span>
                </button>
              )}
              {/* Streak chip: flame + day count. The daily-goal figure lives on
                  the dashboard ring now, so the header carries the streak alone
                  (no duplicated goal gauge). Koralle since the s133 rebrand:
                  streak/celebration rides the reward tokens, warning stays a
                  semantic state color. */}
              {/* Steuerung H7: the streak pill can be hidden from remote config. */}
              {!exam && streakPillOn && (
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
              )}
              {!exam && <AccountMenu />}
            </div>
          </div>
        </header>
        )}

        <main
          className={cn(
            focus
              ? "mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pt-safe pb-safe sm:px-6"
              : exam
                ? // One viewport, no page scroll: the running Teil pins its own
                  // chrome and scrolls internally. `pb-nav` is gone with the
                  // bottom bar it was reserving room for.
                  // Wider from lg up, where the parts lay their two tiles side
                  // by side (founder s186) and a 3xl column would waste the room.
                  "mx-auto flex h-exam-stage w-full max-w-3xl flex-col px-4 pt-4 pb-safe-4 sm:px-6 lg:max-w-6xl"
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
            <motion.div
              key={location.pathname}
              // The exam stage's height has to reach the part component, which
              // sits under this wrapper.
              className={cn(exam && "flex min-h-0 flex-1 flex-col")}
            >
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
