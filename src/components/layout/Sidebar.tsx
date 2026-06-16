import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { RouteIcon } from "./route-icons";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
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
                  ? "bg-primary/20 font-semibold text-foreground"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Same custom branded mark as the bottom tab bar and More sheet.
                    Dimmed when inactive. */}
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
