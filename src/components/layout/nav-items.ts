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
  /** Accent colour used in the bottom tab bar when this tab is active. */
  color: string;
  /** Tinted background for the active pill and context strip. */
  bg: string;
}

// Each route owns ONE unique accent colour. The same colour is reused
// everywhere its icon appears (bottom tab bar, More sheet, desktop sidebar)
// so a section is recognisable by its colour across the whole app.
export const navItems: NavItem[] = [
  { to: "/",             label: "Dashboard",          icon: LayoutDashboard, end: true, color: "#5b5be6", bg: "rgba(91,91,230,.08)"  },
  { to: "/vocabulary",   label: "Wortschatz",         icon: BookOpen,                   color: "#2563eb", bg: "rgba(37,99,235,.08)"  },
  { to: "/redemittel",   label: "Redemittel",         icon: MessagesSquare,             color: "#8b5cf6", bg: "rgba(139,92,246,.08)" },
  { to: "/grammar",      label: "Grammatik",          icon: BookMarked,                 color: "#10b981", bg: "rgba(16,185,129,.08)" },
  { to: "/collocations", label: "Kollokationen",      icon: Combine,                    color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  { to: "/quiz",         label: "Quiz",               icon: ListChecks,                 color: "#f97316", bg: "rgba(249,115,22,.08)" },
  { to: "/writing",      label: "Schreibtraining",    icon: PenLine,                    color: "#ef4444", bg: "rgba(239,68,68,.08)"  },
  { to: "/simulation",   label: "Sprechsimulation",   icon: Mic,                        color: "#06b6d4", bg: "rgba(6,182,212,.08)"  },
  { to: "/exam",         label: "Prüfungsmodus",      icon: GraduationCap,              color: "#c026d3", bg: "rgba(192,38,211,.08)" },
  { to: "/revision",     label: "Schnellwiederholung",icon: Zap,                        color: "#eab308", bg: "rgba(234,179,8,.08)"  },
  { to: "/analytics",    label: "Fortschritt",        icon: LineChart,                  color: "#0ea5e9", bg: "rgba(14,165,233,.08)" },
  { to: "/settings",     label: "Einstellungen",      icon: Settings,                   color: "#64748b", bg: "rgba(100,116,139,.08)"},
];

export const DEFAULT_PINNED_TABS = ["/", "/vocabulary", "/quiz", "/analytics"];

/** @deprecated use pinnedTabs from useSettingsStore instead */
export const PRIMARY_TAB_PATHS = DEFAULT_PINNED_TABS;
