import { NavLink, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { RouteIcon } from "./route-icons";

export function Sidebar({
  onNavigate,
  onSearch,
}: {
  onNavigate?: () => void;
  /** Opens the global search dialog (UX overhaul Phase 2, Tier 1). */
  onSearch?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link
        to="/welcome"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
        aria-label="Zur Startseite"
      >
        <img src="/genauly-default-logo-transparent-corners.png" alt="" className="h-9 w-9 rounded-lg shadow-glow" />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Genauly</p>
          <p className="text-xs text-muted-foreground">Deutsch im Beruf · B2</p>
        </div>
      </Link>

      {onSearch && (
        <button
          onClick={onSearch}
          className="mb-2 flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          Suche
          <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </span>
        </button>
      )}

      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-border font-semibold text-foreground"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Same custom branded mark as the bottom tab bar and More sheet
                    (full opacity everywhere; the active row is marked by its grey
                    gradient + bold text). */}
                <RouteIcon path={to} size={18} active={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl bg-mesh p-4">
        <p className="text-sm font-semibold">Bereit für die Prüfung?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Übe täglich 10 Minuten und halte deine Serie am Leben.
        </p>
      </div>
    </div>
  );
}
