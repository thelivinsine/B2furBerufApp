import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, navZoneOf, NEVER_HIDEABLE } from "./nav-items";
import { RouteIcon } from "./route-icons";
import { SaveProgressBanner } from "@/features/auth/SaveProgressBanner";
import { Logo } from "@/components/shared/Logo";
import { useAppConfig } from "@/lib/appConfig";
import { useT } from "@/lib/uiLang";
import { useAuthStore } from "@/store/useAuthStore";
import { isFounder } from "@/lib/admin";

export function Sidebar({
  onNavigate,
  onSearch,
}: {
  onNavigate?: () => void;
  /** Opens the global search dialog (UX overhaul Phase 2, Tier 1). */
  onSearch?: () => void;
}) {
  // Steuerung H1/H2: remote nav-label overrides + middle-tab hiding (routes
  // stay mounted; the three fixed slots in NEVER_HIDEABLE — Bibliothek,
  // Praktisch, Einstellungen — are never hideable, so remote config can't empty
  // a slot here that the bottom bar keeps drawing).
  const { navLabels, hiddenTabs } = useAppConfig();
  const shownNav = navItems.filter(
    (i) => NEVER_HIDEABLE.includes(i.to) || !hiddenTabs.includes(i.to),
  );
  const founder = isFounder(useAuthStore((s) => s.user));
  // Interface language (s207). A remote `navLabels` override is founder-authored
  // copy and is taken verbatim; only the built-in label is translated.
  const t = useT();
  // Same zone fold as the bottom bar (s192): the Schreibtrainer marks Prüfung,
  // a running session marks Praktisch, the Sammlung marks Fortschritt.
  const activeZone = navZoneOf(useLocation().pathname);
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link
        to="/welcome"
        onClick={onNavigate}
        className="mb-4 flex flex-col items-start gap-1.5 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
        aria-label={t("Zur Startseite")}
      >
        <Logo variant="wordmark" className="h-7 w-auto" />
        {/* The ONE tagline (s207 founder correction): "Deutsch im Beruf · B2" was
            the pre-repositioning line, from when the product was B2-Beruf
            speaking-exam prep. The scope has been the B1-B2 plateau (work AND
            everyday life) since s21, and the landing page, index.html and the
            PWA manifest all say so. This is the same line, in the interface
            language. */}
        <p className="text-xs text-muted-foreground">{t("Deutsch fürs echte Leben · B1–B2")}</p>
      </Link>

      {onSearch && (
        <button
          onClick={onSearch}
          className="mb-2 flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          {t("Suche")}
          <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </span>
        </button>
      )}

      <nav className="flex flex-col gap-0.5">
        {shownNav.map(({ to, label, beta }) => {
          const active = activeZone === to;
          return (
            // Plain Link: the active row is the ZONE's, see BottomTabBar.
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {/* Same custom branded mark as the bottom tab bar and More sheet
                  (full opacity everywhere; the active row is marked by its grey
                  gradient + bold text). */}
              <RouteIcon path={to} size={18} active={active} />
              {navLabels[to] ?? t(label)}
              {/* Beta suffix (founder s207, Praktisch). Same neutral chip as the
                  Neuland heading: bordered, muted, never the accent colour. */}
              {beta && (
                <span className="ml-auto rounded-full border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-muted-foreground">
                  Beta
                </span>
              )}
            </Link>
          );
        })}

        {/* Founder tooling: the Control Center lives in the nav panel on desktop
            (moved out of the account menu, s164-follow-up). Styled like the other
            nav rows (neutral, not accent-blue); the ShieldCheck mark sets it
            apart. The account menu keeps a mobile-only copy since there is no
            sidebar below lg and the bottom bar is locked. */}
        {founder && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted font-semibold text-foreground"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
              )
            }
          >
            <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-muted-foreground group-hover:text-foreground" />
            {t("Kontrollzentrum")}
          </NavLink>
        )}
      </nav>

      {/* Sign-in nudge, pinned to the bottom-left of the nav panel. */}
      <div className="mt-auto pt-4">
        <SaveProgressBanner variant="sidebar" />
      </div>
    </div>
  );
}
