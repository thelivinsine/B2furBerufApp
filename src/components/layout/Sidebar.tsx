import { NavLink, Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link
        to="/welcome"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
        aria-label="Zur Startseite"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Genauly</p>
          <p className="text-xs text-muted-foreground">Deutsch im Beruf · B2</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
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
            <Icon className="h-[18px] w-[18px]" />
            {label}
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
