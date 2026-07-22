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

  return (
    <div className="min-h-dvh bg-page text-foreground">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1240px] grid-cols-1 md:grid-cols-[224px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-1 border-b border-border bg-surface/70 p-3 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2.5 px-2 pb-3 pt-1">
            <Logo className="h-7 w-7" variant="mark" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">genauly</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("Kontrollzentrum", "Control center")}
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-4 gap-1 md:grid-cols-1">
            {NAV.map((item) => {
              const badge = item.badge?.(overview);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      "md:justify-start justify-center",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{t(item.de, item.en)}</span>
                  {badge != null && (
                    <span className="ml-auto hidden rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary md:inline">
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto hidden px-2 pt-4 md:block">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("Zurück zur App", "Back to the app")}
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {t(
                "Angemeldet als Gründer. Alle Nutzerzahlen sind Aggregate, keine Einzelprofile.",
                "Signed in as founder. All user figures are aggregates, never individual profiles.",
              )}
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-col">
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

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">
            <Outlet context={{ overview, loading, supabaseOk: resolvedOk, reload } satisfies AdminOutletContext} />
          </main>
        </div>
      </div>
    </div>
  );
}
