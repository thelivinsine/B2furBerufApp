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

export const navItems: NavItem[] = [
  { to: "/",             label: "Dashboard",          icon: LayoutDashboard, end: true, color: "#5b5be6", bg: "rgba(91,91,230,.08)"  },
  { to: "/vocabulary",   label: "Wortschatz",         icon: BookOpen,                   color: "#5b5be6", bg: "rgba(91,91,230,.08)"  },
  { to: "/redemittel",   label: "Redemittel",         icon: MessagesSquare,             color: "#8b5cf6", bg: "rgba(139,92,246,.08)" },
  { to: "/grammar",      label: "Grammatik",          icon: BookMarked,                 color: "#10b981", bg: "rgba(16,185,129,.08)" },
  { to: "/collocations", label: "Kollokationen",      icon: Combine,                    color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  { to: "/quiz",         label: "Quiz",               icon: ListChecks,                 color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  { to: "/writing",      label: "Schreibtraining",    icon: PenLine,                    color: "#ef4444", bg: "rgba(239,68,68,.08)"  },
  { to: "/simulation",   label: "Sprechsimulation",   icon: Mic,                        color: "#10b7cf", bg: "rgba(16,183,207,.08)" },
  { to: "/exam",         label: "Prüfungsmodus",      icon: GraduationCap,              color: "#8b5cf6", bg: "rgba(139,92,246,.08)" },
  { to: "/revision",     label: "Schnellwiederholung",icon: Zap,                        color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  { to: "/analytics",    label: "Fortschritt",        icon: LineChart,                  color: "#10b7cf", bg: "rgba(16,183,207,.08)" },
  { to: "/settings",     label: "Einstellungen",      icon: Settings,                   color: "#5b5be6", bg: "rgba(91,91,230,.08)"  },
];

export const DEFAULT_PINNED_TABS = ["/", "/vocabulary", "/quiz", "/analytics"];

/** @deprecated use pinnedTabs from useSettingsStore instead */
export const PRIMARY_TAB_PATHS = DEFAULT_PINNED_TABS;
