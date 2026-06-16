import { NavLink, useLocation } from "react-router-dom";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { X } from "lucide-react";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import type { NavItem } from "./nav-items";
import { RouteIcon, MoreIcon } from "./route-icons";
import { useSettingsStore } from "@/store/useSettingsStore";

const MORE_COLOR = "#5b5be6";
const MORE_BG    = "rgba(91,91,230,.08)";
const IZ = 32; // icon size

// Every surface (bottom bar, More sheet, sidebar) draws the SAME custom branded
// SVG for a given route — defined once in route-icons.tsx — so an icon is
// recognisable everywhere. The mark carries the route's accent colour itself;
// `active` only toggles the opacity.
function TabIcon({ path, active }: { path: string; active: boolean }) {
  return <RouteIcon path={path} size={IZ} active={active} />;
}

function IcoMore({ active }: { active: boolean }) {
  return <MoreIcon active={active} size={IZ} />;
}

interface Props {
  onMore: () => void;
  onLongPress: () => void;
  editMode: boolean;
  /** Whether the "Mehr" sheet is open — keeps the More icon selected while browsing it. */
  moreOpen: boolean;
}

export function BottomTabBar({ onMore, onLongPress, editMode, moreOpen }: Props) {
  const location      = useLocation();
  const pathname      = location.pathname;
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  // Read store directly — no localOrder buffer. This ensures any external
  // change (e.g. MoreSheet adding a tab) is reflected here immediately.
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  const longPressRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The More tab is selected while its sheet is open, or when the current route
  // lives in the More sheet (not pinned to the bar). When the sheet is open the
  // pinned tabs drop their highlight so the selection clearly sits on More.
  const moreActive  = moreOpen || !pinnedTabs.includes(pathname);
  const displayTabs = pinnedTabs
    .map(path => navItems.find(i => i.to === path))
    .filter((i): i is NavItem => i != null);

  // "/" (Home) is always fixed first — only the others are reorderable.
  const moveablePaths = pinnedTabs.filter(p => p !== "/");

  function handleReorder(newMoveable: string[]) {
    setPinnedTabs(["/", ...newMoveable]);
  }

  function removeFromBar(path: string) {
    if (pinnedTabs.length <= 2) return; // keep at least home + 1 other
    setPinnedTabs(pinnedTabs.filter(t => t !== path));
  }

  function startLongPress() {
    if (editMode) return;
    longPressRef.current = setTimeout(() => {
      try { navigator.vibrate(40); } catch { /* not available */ }
      onLongPress();
    }, 600);
  }
  function cancelLongPress() {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  }

  return (
    <nav
      id="bottom-tab-bar"
      className="no-callout fixed bottom-0 inset-x-0 z-[60] flex flex-col border-t border-border bg-surface/95 backdrop-blur-xl pb-safe lg:hidden"
      onContextMenu={e => e.preventDefault()}
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      {/* Icon rail. The old context strip was removed: every section already
          shows its own title at the top of the page, so it was redundant. */}
      <div
        className="flex h-[70px] items-stretch"
        onTouchStart={startLongPress}
        onTouchMove={cancelLongPress}
        onTouchEnd={cancelLongPress}
      >
        {editMode ? (
          <>
            {/* Home — always fixed, no badge */}
            <div className="flex flex-1 p-1">
              <div className="flex flex-1 items-center justify-center rounded-xl">
                <TabIcon path="/" active={false} />
              </div>
            </div>

            {/* Reorderable pinned tabs.
                flexGrow = icon count keeps each slot the same width as Home/Mehr. */}
            <Reorder.Group
              axis="x"
              values={moveablePaths}
              onReorder={handleReorder}
              as="div"
              className="flex"
              style={{ flexGrow: moveablePaths.length, flexShrink: 1, flexBasis: 0 }}
            >
              <AnimatePresence initial={false}>
                {moveablePaths.map((path, idx) => {
                  const item = navItems.find(i => i.to === path);
                  if (!item) return null;
                  const { label } = item;
                  return (
                    <Reorder.Item
                      key={path}
                      value={path}
                      as="div"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-1 p-1"
                      style={{ touchAction: "none" }}
                    >
                      <motion.div
                        className="relative flex flex-1 items-center justify-center rounded-xl"
                        animate={{ rotate: [-1.5, 1.5, -1.5] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.08, ease: "easeInOut" }}
                      >
                        <TabIcon path={path} active={false} />
                        {pinnedTabs.length > 2 && (
                          <button
                            type="button"
                            onPointerDownCapture={e => e.stopPropagation()}
                            onPointerDown={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); removeFromBar(path); }}
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-md active:scale-90"
                            aria-label={`${label} entfernen`}
                          >
                            <X className="h-3 w-3 text-white" strokeWidth={3} />
                          </button>
                        )}
                      </motion.div>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>

            {/* Mehr — fixed last, opens sheet to add icons */}
            <button onClick={onMore} aria-label="Mehr" className="flex flex-1 p-1">
              <div className="flex flex-1 items-center justify-center rounded-xl">
                <IcoMore active={false} />
              </div>
            </button>
          </>
        ) : (
          /* Normal mode */
          <>
            {displayTabs.map(({ to, end, label, color, bg }) => (
              <NavLink
                key={to} to={to} end={end} aria-label={label}
                className="flex flex-1 p-1"
                onContextMenu={e => e.preventDefault()}
              >
                {({ isActive }) => {
                  // While the More sheet is open the selection belongs to Mehr,
                  // so pinned tabs drop their active highlight.
                  const showActive = isActive && !moreOpen;
                  return (
                    <div
                      className="relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150"
                      style={showActive ? { background: bg } : {}}
                    >
                      <TabIcon path={to} active={showActive} />
                      {showActive && (
                        <span className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-6 rounded-full"
                          style={{ height: 3, background: color }} />
                      )}
                    </div>
                  );
                }}
              </NavLink>
            ))}
            <button onClick={onMore} aria-label="Mehr" className="flex flex-1 p-1">
              <div
                className="relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150"
                style={moreActive ? { background: MORE_BG } : {}}
              >
                <IcoMore active={moreActive} />
                {moreActive && (
                  <span className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-6 rounded-full"
                    style={{ height: 3, background: MORE_COLOR }} />
                )}
              </div>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
