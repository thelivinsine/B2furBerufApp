import { Link, useLocation } from "react-router-dom";
import { Reorder, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { navItems, DEFAULT_PINNED_TABS, navZoneOf } from "./nav-items";
import { RouteIcon } from "./route-icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useNavLabel, useAppConfigStore } from "@/lib/appConfig";
import { useT } from "@/lib/uiLang";
import { cn } from "@/lib/utils";

// Flat light-grey backdrop for the active pill (no gradient, no section-colour tint).
const ACTIVE_BOX = "bg-border";
const IZ = 29; // icon size

// The bar's three fixed slots and its reorderable middle.
//
// Until s207 Home ("/") was the fixed first slot. The founder reordered the
// rail: **Bibliothek opens it and Spielplatz sits directly left of
// Einstellungen**, because onboarding now hands a new learner straight to the
// library and the Spielplatz zone is still Beta. So the ends are Bibliothek and
// Spielplatz + Einstellungen, and the middle that reorders (the long-press
// easter egg) is Prüfung · Fortschritt.
//
// `/writing` keeps its route and every deep link; it is a card in the Prüfung
// hub instead of a tab, and `ROUTE_SUCCESSOR` remaps a persisted pin.
const FIXED_FIRST = "/library";
const REORDERABLE = ["/anwenden", "/analytics"];
const FIXED_LAST_CONTENT = "/";

// Every surface (bottom bar, sidebar) draws the SAME custom branded SVG for a
// route — defined once in route-icons.tsx — so an icon is recognisable
// everywhere. The mark carries the route's accent colour itself.
function TabIcon({ path }: { path: string }) {
  return <RouteIcon path={path} size={IZ} />;
}

/**
 * Normal-mode tab: a link with the compact squircle active pill + underline.
 *
 * The active state comes from `navZoneOf`, NOT from NavLink's own `isActive`:
 * a zone owns more routes than its own path (the Schreibtrainer is Prüfung, a
 * running session is Spielplatz), and matching the URL alone left the bar with
 * nothing lit on every page one level below a hub (founder s192).
 */
function BarTab({ path, active, moreHidden }: { path: string; active: boolean; moreHidden?: boolean }) {
  const item = navItems.find(i => i.to === path);
  // Steuerung H1: apply a remote label override (falls back to the built-in).
  // Called unconditionally before the early return to respect the hooks rule.
  // s207: the built-in label goes through the interface language first, so an
  // A2/B1 learner reads "Library"; a founder-authored override wins verbatim.
  const t = useT();
  const label = useNavLabel(path, item ? t(item.label) : "");
  if (!item) return null;
  const { to } = item;
  const showActive = active && !moreHidden;
  return (
    // A plain Link, not a NavLink: the active state is the ZONE's, and NavLink
    // would both re-decide it from the URL and swallow the `aria-current` we
    // set (it treats that prop as "the value to use when I consider myself
    // active"), so the lit tab would never announce itself.
    <Link
      to={to}
      aria-label={item.beta ? `${label} (Beta)` : label}
      aria-current={showActive ? "page" : undefined}
      // `min-w-0` is what lets a slot shrink below its label width, so the
      // truncate on the name actually fires. Without it the longest label
      // ("Einstellungen") set a 73px floor, and at six slots that pushed the
      // last tab off a 320px screen (s182, when Anwenden joined the bar).
      className="flex min-w-0 flex-1 p-1"
      onContextMenu={e => e.preventDefault()}
    >
      <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5">
        {/* Compact squircle "cloud" hugs the icon instead of filling the whole
            slot. Flat, even grey (no raised dome). */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-150",
            showActive && ACTIVE_BOX,
          )}
        >
          <TabIcon path={to} />
        </div>
        {/* Section name under the icon. The label slot is reserved on EVERY
            tab (fixed height) so selecting a tab never shifts the icon rail;
            the name only becomes visible on the active tab (founder request:
            "add the name to the bottom of the icon, only when selected"). */}
        <span
          className={cn(
            // Neutral dark grey (theme-aware) reads more premium than the
            // section accent under the coloured icon (founder).
            "h-3 max-w-full truncate text-[10px] font-semibold leading-none text-slate-600 transition-opacity duration-150 dark:text-slate-300",
            showActive ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!showActive}
        >
          {label}
          {/* Beta suffix (founder s207, Spielplatz): a plain lighter suffix, not
              a chip — the label slot is a fixed 12px line, and a bordered chip
              would grow it and shift the icon rail the slot exists to hold
              still. It rides inside the truncate like the label itself. */}
          {item.beta && <span className="ml-1 font-bold text-muted-foreground">Beta</span>}
        </span>
      </div>
    </Link>
  );
}

export function BottomTabBar() {
  const location      = useLocation();
  const pathname      = location.pathname;
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  // Read store directly — no localOrder buffer, so any external write is
  // reflected immediately (this was the root cause of an old "reorder didn't
  // stick" bug; keep it direct).
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  const [editMode, setEditMode] = useState(false);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The middle sections ALWAYS appear: the reorderable ones in any saved custom
  // order (so the reorder easter egg persists) completed with any missing ones.
  // Because there is no add/remove any more, this guarantees a section can never
  // be stranded off the bar.
  const saved       = pinnedTabs.filter(p => REORDERABLE.includes(p));
  const middle      = [...saved, ...REORDERABLE.filter(p => !saved.includes(p))];
  // Steuerung H2: hide middle tabs from the RAIL only (routes stay mounted, and
  // edit-mode reorder keeps operating on the full `middle` so hidden tabs are
  // never dropped from the persisted pins). The three fixed slots (Bibliothek,
  // Spielplatz, Einstellungen) are never hideable (locked bar structure).
  const hiddenTabs = useAppConfigStore(s => s.config.hiddenTabs);
  const shownMiddle = middle.filter(p => !hiddenTabs.includes(p));

  // Which tab is lit: the ZONE the current route belongs to, so a page one
  // level below a hub (the Schreibtrainer under Prüfung, a session under
  // Spielplatz) still marks its section instead of leaving the bar blank.
  const activeZone = navZoneOf(pathname);

  // Navigating anywhere ends the reorder easter egg (there is no sheet to close).
  useEffect(() => { setEditMode(false); }, [pathname]);

  function handleReorder(newMiddle: string[]) {
    setPinnedTabs([FIXED_FIRST, ...newMiddle, FIXED_LAST_CONTENT]);
  }

  function startLongPress() {
    if (editMode) return;
    longPressRef.current = setTimeout(() => {
      try { navigator.vibrate(40); } catch { /* not available */ }
      setEditMode(true);
    }, 600);
  }
  function cancelLongPress() {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  }

  // blur-md, not xl: at 95% surface opacity the stronger blur is barely visible
  // but repaints the whole bar region every scroll frame (audit B3).
  return (
    <>
      {/* Tap-anywhere-to-finish layer while reordering (no sheet overlay now). */}
      {editMode && (
        <div
          className="fixed inset-0 z-[55] lg:hidden"
          onPointerDown={() => setEditMode(false)}
          aria-hidden
        />
      )}
      <nav
        id="bottom-tab-bar"
        className="no-callout fixed bottom-0 inset-x-0 z-[60] flex flex-col border-t border-border bg-surface/95 backdrop-blur-md pb-safe lg:hidden"
        onContextMenu={e => e.preventDefault()}
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div
          className="flex h-[63px] items-stretch"
          onTouchStart={startLongPress}
          onTouchMove={cancelLongPress}
          onTouchEnd={cancelLongPress}
        >
          {editMode ? (
            <>
              {/* Bibliothek — always fixed first (s207) */}
              <div className="flex flex-1 p-1">
                <div className="flex flex-1 items-center justify-center rounded-xl">
                  <TabIcon path={FIXED_FIRST} />
                </div>
              </div>

              {/* Reorderable content sections (the easter egg). No add/remove
                  badges — the fixed ends plus the always-on content set mean
                  nothing can be added or stranded.
                  flexGrow = count keeps each slot the same width as the ends. */}
              <Reorder.Group
                axis="x"
                values={middle}
                onReorder={handleReorder}
                as="div"
                className="flex"
                style={{ flexGrow: middle.length, flexShrink: 1, flexBasis: 0 }}
              >
                {middle.map((path, idx) => (
                  <Reorder.Item
                    key={path}
                    value={path}
                    as="div"
                    className="flex flex-1 p-1"
                    style={{ touchAction: "none" }}
                  >
                    <motion.div
                      className="flex flex-1 items-center justify-center rounded-xl"
                      animate={{ rotate: [-1.5, 1.5, -1.5] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.08, ease: "easeInOut" }}
                    >
                      <TabIcon path={path} />
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Spielplatz — pinned left of Einstellungen, not reorderable
                  (founder, s207), so it renders as a still tile like the ends. */}
              <div className="flex flex-1 p-1">
                <div className="flex flex-1 items-center justify-center rounded-xl">
                  <TabIcon path={FIXED_LAST_CONTENT} />
                </div>
              </div>

              {/* Einstellungen — always fixed last */}
              <div className="flex flex-1 p-1">
                <div className="flex flex-1 items-center justify-center rounded-xl">
                  <TabIcon path="/settings" />
                </div>
              </div>
            </>
          ) : (
            /* Normal mode: Bibliothek · content sections · Spielplatz · Einstellungen */
            <>
              <BarTab path={FIXED_FIRST} active={activeZone === FIXED_FIRST} />
              {shownMiddle.map(path => (
                <BarTab key={path} path={path} active={activeZone === path} />
              ))}
              <BarTab path={FIXED_LAST_CONTENT} active={activeZone === FIXED_LAST_CONTENT} />
              <BarTab path="/settings" active={activeZone === "/settings"} />
            </>
          )}
        </div>
      </nav>
    </>
  );
}
