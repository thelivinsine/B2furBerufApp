import {
  LayoutDashboard,
  BookOpen,
  MessagesSquare,
  BookMarked,
  Combine,
  ListChecks,
  PenLine,
  Mic,
  GraduationCap,
  Zap,
  LineChart,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vocabulary", label: "Wortschatz", icon: BookOpen },
  { to: "/redemittel", label: "Redemittel", icon: MessagesSquare },
  { to: "/grammar", label: "Grammatik", icon: BookMarked },
  { to: "/collocations", label: "Kollokationen", icon: Combine },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/writing", label: "Schreibtraining", icon: PenLine },
  { to: "/simulation", label: "Sprechsimulation", icon: Mic },
  { to: "/exam", label: "Prüfungsmodus", icon: GraduationCap },
  { to: "/revision", label: "Schnellwiederholung", icon: Zap },
  { to: "/analytics", label: "Fortschritt", icon: LineChart },
  { to: "/settings", label: "Einstellungen", icon: Settings },
];

export const PRIMARY_TAB_PATHS = ["/", "/vocabulary", "/quiz", "/analytics"];
