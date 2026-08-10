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
  /** Accent colour used in the bottom tab bar when this tab is active. */
  color: string;
  /** Tinted background for the active pill / icon backdrop. */
  bg: string;
  /** Short subtitle (used on the landing/marketing surfaces and kept for reuse). */
  desc: string;
  /** Marks the zone as unfinished: the nav draws a "Beta" suffix next to its label. */
  beta?: boolean;
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
// pairing; "Praktisch" was then renamed to "Spielplatz" (founder s210) because
// "Simulation" and "Alltag" were both already taken by other parts of the app
// (the Sprechen practice route, the Berufsleben/Alltag life-area split), and the
// founder wanted a name that hints at the Neuland game sitting inside this same
// tab. The routes are unchanged (/ and /library).
//
// ORDER (founder s207): **Bibliothek leads the nav and this tab sits beside
// Einstellungen, marked Beta.** The library is what a learner meets first now
// (onboarding hands straight over to it, no taster session), and this zone
// is still being built, so it moved to the far end of the rail instead of
// owning the first slot. The routes are untouched: "/" is still the Dashboard
// and still the app's root, it is simply not the FIRST tab any more.
// This list is the order both nav surfaces draw: the sidebar top-to-bottom, and
// the bottom bar left-to-right.
export const navItems: NavItem[] = [
  // No `end` flag any more: which routes belong to which tab is `navZoneOf`'s
  // job (below), and Home matching only itself is stated there.
  { to: "/library",   label: "Bibliothek",   icon: Library,                    color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Wörter, Kollokationen, Redemittel, Grammatik" },
  // Schreiben had its own tab from 2026-07-22 until s182, when the founder
  // moved it INTO the transfer hub and renamed that hub **Prüfung**: the three
  // exam skills (Sprechen, Schreiben, Modelltest) now live in one zone,
  // which keeps the bar at five slots. `/writing` keeps its route, its icon and
  // every deep link; it is simply not a top-level nav entry any more, so it is
  // absent from this list on purpose (see ROUTE_SUCCESSOR below).
  { to: "/anwenden",  label: "Prüfung",      icon: Target,                     color: "#f97316", bg: "rgba(249,115,22,.08)", desc: "Module üben und Modelltest" },
  { to: "/analytics", label: "Fortschritt",  icon: LineChart,                  color: "#0ea5e9", bg: "rgba(14,165,233,.08)", desc: "Meilensteine und Statistiken" },
  { to: "/",          label: "Spielplatz",   icon: Compass,                    color: "#3D74ED", bg: "rgba(61,116,237,.08)",  desc: "Deine Session und dein Tag", beta: true },
  { to: "/settings",  label: "Einstellungen",icon: Settings,                   color: "#64748b", bg: "rgba(100,116,139,.08)",desc: "App und Konto verwalten" },
];

// Five slots, unchanged in count since s182 reshaped what fills them (founder:
// move Schreiben into the transfer hub and call that hub Prüfung), reordered in
// s207: Bibliothek, Prüfung, Fortschritt, Spielplatz, Einstellungen. An existing
// learner's persisted order still works: BottomTabBar completes the reorderable
// group with whatever is missing, pins the two fixed ends itself, and a pinned
// "/writing" remaps via ROUTE_SUCCESSOR.
export const DEFAULT_PINNED_TABS = ["/library", "/anwenden", "/analytics", "/"];

// The three slots the nav rail ALWAYS draws (locked bar structure): the
// Bibliothek slot that opens the rail, the Spielplatz slot beside Einstellungen,
// and Einstellungen itself. Remote config (Steuerung H2) may hide only the
// middle tabs, so a stale `hiddenTabs` entry can never empty a fixed slot on one
// surface while the other keeps drawing it.
export const NEVER_HIDEABLE = ["/library", "/", "/settings"];

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

// Routes that are NOT tabs themselves but live INSIDE a nav zone. The bar and
// the sidebar mark that zone's tab while one of them is open (founder s192:
// "the prufung bottom bar isn't selected here", on /writing). Without this the
// bar is visible with nothing lit on every page reached from a hub, which reads
// as "I have left the app" rather than "I am one level down".
//
// This is the same fold as ROUTE_SUCCESSOR (which remaps a persisted PIN) plus
// the routes that never were tabs: /welt, /session and /sammlung. The two lists
// answer different questions, so they stay separate.
export const NAV_ZONE_OF_ROUTE: Record<string, string> = {
  // Bibliothek: the retired per-tool routes redirect into /library, and the
  // quiz is a Bibliothek surface reached by deep link.
  "/vocabulary": "/library",
  "/collocations": "/library",
  "/redemittel": "/library",
  "/grammar": "/library",
  "/quiz": "/library",
  // Prüfung: the four modules and the two free trainers all sit under the hub.
  "/writing": "/anwenden",
  "/simulation": "/anwenden",
  "/lesen": "/anwenden",
  "/hoeren": "/anwenden",
  "/exam": "/anwenden",
  // Spielplatz: everything the dashboard starts (Üben, Spielen).
  "/session": "/",
  "/revision": "/",
  "/welt": "/",
  // Fortschritt: the Sammlung is entered from the quest board.
  "/sammlung": "/analytics",
};

/**
 * The nav tab a pathname belongs to, or null when it belongs to none (the
 * standalone surfaces: /sources, /hilfe, the legal pages, /admin). A tab route
 * matches itself and anything below it; everything else goes through
 * NAV_ZONE_OF_ROUTE. Home only ever matches exactly, like its `end` flag.
 */
export function navZoneOf(pathname: string): string | null {
  if (pathname === "/") return "/";
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const tab = navItems.find((i) => i.to !== "/" && under(i.to));
  if (tab) return tab.to;
  const zone = Object.keys(NAV_ZONE_OF_ROUTE).find(under);
  return zone ? NAV_ZONE_OF_ROUTE[zone] : null;
}
