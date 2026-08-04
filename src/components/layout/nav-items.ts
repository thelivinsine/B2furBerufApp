import {
  Compass,
  Library,
  LineChart,
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
// The transfer zone was HIDDEN from the nav for the demo (founder,
// 2026-07-13) and came back in s182 (audit P4): the speaking simulation and the
// exam run were reachable only from the dashboard recommendation and ⌘K, which
// is not a home for the skill the product is built around. The founder then
// reshaped it rather than growing the bar: **Schreiben moved into the hub and
// the hub is called Prüfung**, so the zone holds the three exam skills and the
// bar still has five slots.
//
// Labels: "Heute" was renamed to "Praktisch" and "Bibliothek" to "Theorie"
// (founder, 2026-07-13) so the two learning zones read as a Praktisch/Theorie
// pairing. The routes are unchanged (/ and /library).
export const navItems: NavItem[] = [
  { to: "/",          label: "Praktisch",    icon: Compass,         end: true, color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Deine Session und dein Tag" },
  { to: "/library",   label: "Bibliothek",   icon: Library,                    color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Wörter, Kollokationen, Redemittel, Grammatik" },
  // Schreiben had its own tab from 2026-07-22 until s182, when the founder
  // moved it INTO the transfer hub and renamed that hub **Prüfung**: the three
  // exam skills (Sprechen, Schreiben, Modelltest) now live in one zone,
  // which keeps the bar at five slots. `/writing` keeps its route, its icon and
  // every deep link; it is simply not a top-level nav entry any more, so it is
  // absent from this list on purpose (see ROUTE_SUCCESSOR below).
  { to: "/anwenden",  label: "Prüfung",      icon: Target,                     color: "#f97316", bg: "rgba(249,115,22,.08)", desc: "Sprechen, Schreiben und Modelltest" },
  { to: "/analytics", label: "Fortschritt",  icon: LineChart,                  color: "#0ea5e9", bg: "rgba(14,165,233,.08)", desc: "Meilensteine und Statistiken" },
  { to: "/settings",  label: "Einstellungen",icon: Settings,                   color: "#64748b", bg: "rgba(100,116,139,.08)",desc: "App und Konto verwalten" },
];

// Five slots, unchanged in count since s182 reshaped what fills them (founder:
// move Schreiben into the transfer hub and call that hub Prüfung): Home,
// Bibliothek, Prüfung, Fortschritt, Einstellungen. An existing learner's
// persisted order still works: BottomTabBar completes the reorderable group
// with whatever is missing, and a pinned "/writing" remaps via ROUTE_SUCCESSOR.
export const DEFAULT_PINNED_TABS = ["/", "/library", "/anwenden", "/analytics"];

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
  // Schreiben went back under the transfer hub in s182 (founder), so a pin
  // saved while it was a top-level tab (2026-07-22 to s182) remaps again.
  "/writing": "/anwenden",
  "/simulation": "/anwenden",
  "/exam": "/anwenden",
  "/revision": "/",
};

/** @deprecated use pinnedTabs from useSettingsStore instead */
export const PRIMARY_TAB_PATHS = DEFAULT_PINNED_TABS;
