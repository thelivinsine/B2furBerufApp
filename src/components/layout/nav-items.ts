import {
  Compass,
  Library,
  LineChart,
  PenLine,
  Settings,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Accent colour used in the bottom tab bar when this tab is active. */
  color: string;
  /** Tinted background for the active pill / icon backdrop. */
  bg: string;
  /** Short subtitle (used on the landing/marketing surfaces and kept for reuse). */
  desc: string;
}

// Each route owns ONE unique accent colour. The same colour is reused
// everywhere its icon appears (bottom tab bar, More sheet, desktop sidebar)
// so a section is recognisable by its colour across the whole app.
//
// UX overhaul Phase 5 (session 49): the nav collapsed from a "drawer of 11
// tools" to the four-zone model (Heute · Bibliothek · Anwenden · Fortschritt,
// + Einstellungen). The individual library tools (Wortschatz/Kollokationen/
// Redemittel/Grammatik) now live inside the Bibliothek hub, and the transfer
// tools (Sprechen/Schreiben/Prüfung) inside Anwenden, so they are no longer
// top-level nav destinations. Their routes still resolve (redirected into the
// hub or reachable via deep links); they are just off the nav rail.
// The Anwenden (transfer) zone was HIDDEN from the nav for the demo (founder,
// 2026-07-13) and is BACK on the desktop sidebar since s182 (audit P4): the
// speaking simulation and the exam run were reachable only from the dashboard
// recommendation and ⌘K, which is not a home for the skill the product is
// built around. The mobile bottom bar is a locked 5-slot structure, so this
// entry shows in the sidebar (and the More surfaces that read `navItems`)
// without touching it; mobile placement is a separate founder decision.
//
// Labels: "Heute" was renamed to "Praktisch" and "Bibliothek" to "Theorie"
// (founder, 2026-07-13) so the two learning zones read as a Praktisch/Theorie
// pairing. The routes are unchanged (/ and /library).
export const navItems: NavItem[] = [
  { to: "/",          label: "Praktisch",    icon: Compass,         end: true, color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Deine Session und dein Tag" },
  { to: "/library",   label: "Bibliothek",   icon: Library,                    color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Wörter, Kollokationen, Redemittel, Grammatik" },
  // Schreibtraining promoted to a dedicated nav item (founder, 2026-07-22): the
  // Fokus "Satzlabor" now has its own entry instead of only living under the
  // hidden Anwenden hub. Nib mark (Federspitze) in route-icons.tsx; the accent
  // moved from rose to brand blue with the s158 icon family harmonization.
  { to: "/writing",   label: "Schreiben",    icon: PenLine,                    color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Sätze schreiben und mit KI umformen" },
  // Anwenden (Sprechen + Prüfung). Schreiben has its own tab since 2026-07-22,
  // so this hub is the transfer layer's speaking and exam half.
  { to: "/anwenden",  label: "Anwenden",     icon: Target,                     color: "#f97316", bg: "rgba(249,115,22,.08)", desc: "Sprechsimulation und Prüfungsmodus" },
  { to: "/analytics", label: "Fortschritt",  icon: LineChart,                  color: "#0ea5e9", bg: "rgba(14,165,233,.08)", desc: "Meilensteine und Statistiken" },
  { to: "/settings",  label: "Einstellungen",icon: Settings,                   color: "#64748b", bg: "rgba(100,116,139,.08)",desc: "App und Konto verwalten" },
];

export const DEFAULT_PINNED_TABS = ["/", "/library", "/writing", "/analytics"];

// Removed top-level routes → their successor zone. Used by the settings-store
// migration so an existing learner's custom pins / More-sheet order remap onto
// the new four-zone nav instead of silently disappearing (founder decision
// 2026-07-02: "a pinned Wortschatz becomes Bibliothek").
export const ROUTE_SUCCESSOR: Record<string, string> = {
  "/vocabulary": "/library",
  "/collocations": "/library",
  "/redemittel": "/library",
  "/grammar": "/library",
  "/quiz": "/library",
  // "/writing" is a top-level nav item again (2026-07-22), so it no longer
  // remaps into the hidden Anwenden hub.
  "/simulation": "/anwenden",
  "/exam": "/anwenden",
  "/revision": "/",
};

/** @deprecated use pinnedTabs from useSettingsStore instead */
export const PRIMARY_TAB_PATHS = DEFAULT_PINNED_TABS;
