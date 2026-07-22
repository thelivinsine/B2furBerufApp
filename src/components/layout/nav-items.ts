import {
  Compass,
  Library,
  LineChart,
  PenLine,
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
// The Anwenden (transfer) zone is temporarily HIDDEN from the nav (founder,
// 2026-07-13: not needed for the demo). Its route stays mounted in router.tsx
// so deep links (and the /welt game entry) keep working; it is just off the
// nav rail. Re-add the entry below to restore it.
//
// Labels: "Heute" was renamed to "Praktisch" and "Bibliothek" to "Theorie"
// (founder, 2026-07-13) so the two learning zones read as a Praktisch/Theorie
// pairing. The routes are unchanged (/ and /library).
export const navItems: NavItem[] = [
  { to: "/",          label: "Praktisch",    icon: Compass,         end: true, color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Deine Session und dein Tag" },
  { to: "/library",   label: "Bibliothek",   icon: Library,                    color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Wörter, Kollokationen, Redemittel, Grammatik" },
  // Schreibtraining promoted to a dedicated nav item (founder, 2026-07-22): the
  // Fokus "Satzlabor" now has its own entry instead of only living under the
  // hidden Anwenden hub. Pencil mark already in route-icons.tsx; rose accent.
  { to: "/writing",   label: "Schreiben",    icon: PenLine,                    color: "#f43f5e", bg: "rgba(244,63,94,.08)",   desc: "Sätze schreiben und mit KI umformen" },
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
