import { NavLink, useLocation } from "react-router-dom";
import { Reorder, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import { RouteIcon } from "./route-icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

// Flat light-grey backdrop for the active pill (no gradient, no section-colour tint).
const ACTIVE_BOX = "bg-border";
const IZ = 29; // icon size

// The middle content sections. Home is the fixed first slot and Einstellungen
// the fixed last slot (they replaced the retired "Mehr" sheet in s-polish), so
// these are the only reorderable tabs. Anwenden stays hidden from the nav
// (founder, 2026-07-13, demo); Schreiben was promoted to its own tab (2026-07-22),
// so the middle is Bibliothek · Schreiben · Fortschritt.
const CONTENT = ["/library", "/writing", "/analytics"];

// Every surface (bottom bar, sidebar) draws the SAME custom branded SVG for a
// route — defined once in route-icons.tsx — so an icon is recognisable
// everywhere. The mark carries the route's accent colour itself.
function TabIcon({ path }: { path: string }) {
  return <RouteIcon path={path} size={IZ} />;
}

/** Normal-mode tab: a NavLink with the compact squircle active pill + underline. */
function BarTab({ path, moreHidden }: { path: string; moreHidden?: boolean }) {
  const item = navItems.find(i => i.to === path);
  if (!item) return null;
  const { to, end, label } = item;
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className="flex flex-1 p-1"
      onContextMenu={e => e.preventDefault()}
    >
      {({ isActive }) => {
        const showActive = isActive && !moreHidden;
        return (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-0.5">
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
            </span>
          </div>
        );
      }}
    </NavLink>
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

  // The three content sections ALWAYS appear, ordered by any saved custom order
  // (so the reorder easter egg persists) then completed with any missing ones.
  // Because there is no add/remove any more, this guarantees a section can never
  // be stranded off the bar.
  const saved  = pinnedTabs.filter(p => CONTENT.includes(p));
  const middle = [...saved, ...CONTENT.filter(p => !saved.includes(p))];

  // Navigating anywhere ends the reorder easter egg (there is no sheet to close).
  useEffect(() => { setEditMode(false); }, [pathname]);

  function handleReorder(newMiddle: string[]) {
    setPinnedTabs(["/", ...newMiddle]);
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
              {/* Home — always fixed first */}
              <div className="flex flex-1 p-1">
                <div className="flex flex-1 items-center justify-center rounded-xl">
                  <TabIcon path="/" />
                </div>
              </div>

              {/* Reorderable content sections (the easter egg). No add/remove
                  badges — the fixed Home/Einstellungen ends plus the always-on
                  content set mean nothing can be added or stranded.
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

              {/* Einstellungen — always fixed last */}
              <div className="flex flex-1 p-1">
                <div className="flex flex-1 items-center justify-center rounded-xl">
                  <TabIcon path="/settings" />
                </div>
              </div>
            </>
          ) : (
            /* Normal mode: Home · content sections · Einstellungen */
            <>
              <BarTab path="/" />
              {middle.map(path => <BarTab key={path} path={path} />)}
              <BarTab path="/settings" />
            </>
          )}
        </div>
      </nav>
    </>
  );
}
