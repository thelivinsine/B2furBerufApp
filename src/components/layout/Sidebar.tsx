import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  MessagesSquare,
  BookMarked,
  ListChecks,
  Mic,
  GraduationCap,
  Zap,
  LineChart,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vocabulary", label: "Wortschatz", icon: BookOpen },
  { to: "/redemittel", label: "Redemittel", icon: MessagesSquare },
  { to: "/grammar", label: "Grammatik", icon: BookMarked },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/simulation", label: "Sprechsimulation", icon: Mic },
  { to: "/exam", label: "Prüfungsmodus", icon: GraduationCap },
  { to: "/revision", label: "Schnellwiederholung", icon: Zap },
  { to: "/analytics", label: "Fortschritt", icon: LineChart },
  { to: "/settings", label: "Einstellungen", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 flex items-center gap-2.5 px-2 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Sprechtraining</p>
          <p className="text-xs text-muted-foreground">B2 Beruf</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
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
