import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useOutletContext, Link } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Users,
  Activity,
  SlidersHorizontal,
  Rocket,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { fetchAdminOverview, type AdminOverview } from "@/lib/adminApi";
import { useAdminLang } from "./adminI18n";

/** Data shared from the shell to every admin screen (one fetch, no duplication). */
export interface AdminOutletContext {
  overview: AdminOverview | null;
  loading: boolean;
  /** True once a fetch has resolved with data (the Supabase reachability signal). */
  supabaseOk: boolean;
  reload: () => void;
}

export function useAdminData(): AdminOutletContext {
  return useOutletContext<AdminOutletContext>();
}

interface NavDef {
  to: string;
  end?: boolean;
  icon: typeof LayoutGrid;
  de: string;
  en: string;
  /** Optional live badge count read from the overview. */
  badge?: (o: AdminOverview | null) => number | undefined;
}

const NAV: NavDef[] = [
  { to: "/admin", end: true, icon: LayoutGrid, de: "Übersicht", en: "Overview" },
  { to: "/admin/pruefen", icon: ClipboardCheck, de: "Prüfen", en: "Review" },
  {
    to: "/admin/feedback",
    icon: MessageSquare,
    de: "Feedback",
    en: "Feedback",
    badge: (o) => o?.feedback.neu || undefined,
  },
  { to: "/admin/inhalte", icon: BarChart3, de: "Inhalte", en: "Content" },
  { to: "/admin/nutzer", icon: Users, de: "Nutzer", en: "Audience" },
  { to: "/admin/system", icon: Activity, de: "System", en: "System" },
  { to: "/admin/steuerung", icon: SlidersHorizontal, de: "Steuerung", en: "Controls" },
  { to: "/admin/launch", icon: Rocket, de: "Launch", en: "Launch" },
];

/**
 * The /admin front door: a full-screen founder cockpit with its own sidebar,
 * outside the app's AppShell chrome (like /sources uses LegalChrome). Fetches
 * the headline aggregates once and shares them with the active screen via
 * Outlet context. Bilingual DE/EN with a header toggle.
 */
export function AdminShell() {
  const { lang, setLang, t } = useAdminLang();
  const user = useAuthStore((s) => s.user);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedOk, setResolvedOk] = useState(false);
  const mounted = useRef(true);

  const reload = useCallback(() => {
    setLoading(true);
    void fetchAdminOverview().then((data) => {
      if (!mounted.current) return;
      setOverview(data);
      setResolvedOk(data !== null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  const initial = (user?.email?.[0] ?? "G").toUpperCase();

  const backToApp = t("Zurück zur App", "Back to the app");

  // The prominent "back to the app" affordance, pinned to the TOP of the nav
  // panel (founder request): an accent-tinted tile so it stands out against the
  // neutral nav rows without reading as loud brand chrome (Himmelblau selection-
  // tile recipe, §3). `compact` is the mobile top-bar variant.
  const backButton = (compact?: boolean) => (
    <Link
      to="/"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 font-semibold text-accent-ink transition-colors hover:bg-accent/25 dark:border-accent/25 dark:bg-accent/10 dark:hover:bg-accent/20",
        compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
      )}
    >
      <ArrowLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4 shrink-0"} />
      {compact ? t("App", "App") : backToApp}
    </Link>
  );

  const navRows = (compact?: boolean) =>
    NAV.map((item) => {
      const badge = item.badge?.(overview);
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
              compact ? "flex-col justify-center gap-1 px-2 py-2 text-xs" : "px-3 py-2",
              isActive
                ? "bg-muted font-semibold text-foreground"
                : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span className={compact ? "text-[11px]" : undefined}>{t(item.de, item.en)}</span>
          {badge != null && !compact && (
            <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {badge}
            </span>
          )}
        </NavLink>
      );
    });

  return (
    <div className="min-h-dvh bg-page text-foreground">
      {/* Desktop sidebar — mirrors the app's AppShell: a fixed rail pinned to the
          left viewport edge (w-64), NOT a centered grid column, so switching in
          from the app keeps the same left anchor and margins. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface/60 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col gap-1 p-4">
          <div className="mb-3 flex flex-col items-start gap-1.5 px-2 py-2">
            <Logo variant="wordmark" className="h-7 w-auto" />
            <p className="text-xs text-muted-foreground">
              {t("Kontrollzentrum", "Control center")}
            </p>
          </div>

          {backButton()}

          <nav className="mt-2 flex flex-col gap-0.5">{navRows()}</nav>

          <div className="mt-auto px-2 pt-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t(
                "Angemeldet als Gründer. Alle Nutzerzahlen sind Aggregate, keine Einzelprofile.",
                "Signed in as founder. All user figures are aggregates, never individual profiles.",
              )}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile top nav bar — the fixed rail is desktop-only, so below lg the nav
          rides a top bar (there is no admin bottom tab bar). Back button stays at
          the top-right here so it is easy to spot on phones too. */}
      <div className="border-b border-border bg-surface/70 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Logo variant="wordmark" className="h-6 w-auto" />
          {backButton(true)}
        </div>
        <nav className="grid grid-cols-4 gap-1 px-3 pb-3">{navRows(true)}</nav>
      </div>

      {/* Content — offset by the fixed rail (lg:pl-64) and capped + centered at
          max-w-6xl, exactly like the app's main, so the content column width and
          gutters match. */}
      <div className="lg:pl-64">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-0.5 text-xs font-semibold">
            {(["de", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "rounded-full px-2.5 py-1 uppercase transition-colors",
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-gradient text-[10px] font-bold text-primary-foreground">
              {initial}
            </span>
            {t("Gründer-Konto", "Founder account")}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <Outlet context={{ overview, loading, supabaseOk: resolvedOk, reload } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
}
