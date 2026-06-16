import { NavLink, useLocation } from "react-router-dom";
import { Reorder, motion } from "framer-motion";
import { useRef } from "react";
import { X } from "lucide-react";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import type { NavItem } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";

const MORE_COLOR = "#5b5be6";
const MORE_BG    = "rgba(91,91,230,.08)";
const IZ = 29; // icon size

function getContextMeta(pathname: string, pinnedTabs: string[]) {
  const exact = navItems.find(i => i.to === pathname);
  if (exact) return { label: exact.label, color: exact.color, bg: exact.bg };
  const prefix = navItems.find(i => i.to !== "/" && pathname.startsWith(i.to));
  if (prefix) return { label: prefix.label, color: prefix.color, bg: prefix.bg };
  const mehr = navItems.find(i => !pinnedTabs.includes(i.to) && pathname.startsWith(i.to));
  return { label: mehr?.label ?? "Mehr", color: MORE_COLOR, bg: MORE_BG };
}

function IcoDashboard({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill="#5b5be6" />
      <rect x="11" y="2"  width="7" height="7" rx="1.5" fill="#5b5be6" opacity=".72" />
      <rect x="2"  y="11" width="7" height="7" rx="1.5" fill="#5b5be6" opacity=".72" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5b5be6" opacity=".45" />
    </svg>
  );
}
function IcoBook({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <path d="M10 2.5C7.5 1.5 4.5 1.5 2 2.5V17.5c2.5-1 5.5-1 8 0V2.5Z" fill="#2563eb" />
      <path d="M10 2.5c2.5-1 5.5-1 8 0V17.5c-2.5-1-5.5-1-8 0V2.5Z" fill="#60a5fa" />
      {active && (<>
        <line x1="4.5" y1="7"  x2="8.5"  y2="7"  stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.7} />
        <line x1="4.5" y1="10" x2="8.5"  y2="10" stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.5} />
        <line x1="4.5" y1="13" x2="8.5"  y2="13" stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.35} />
        <line x1="11.5" y1="7" x2="15.5" y2="7"  stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.5} />
        <line x1="11.5" y1="10" x2="15.5" y2="10" stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.35} />
      </>)}
    </svg>
  );
}
function IcoQuiz({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <circle cx="10" cy="10" r="9" fill="#f97316" />
      <polyline points="6,10.5 8.5,13 14,7" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function IcoAnalytics({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <rect x="2.5"  y="12"  width="3.5" height="6"    rx="1.2" fill="#0ea5e9" />
      <rect x="8.25" y="7.5" width="3.5" height="10.5" rx="1.2" fill="#0ea5e9" opacity=".8" />
      <rect x="14"   y="3"   width="3.5" height="15"   rx="1.2" fill="#0ea5e9" opacity=".55" />
    </svg>
  );
}
function IcoMore({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <circle cx="5"  cy="5"  r="2.4" fill="#5b5be6" opacity=".9"  />
      <circle cx="10" cy="5"  r="2.4" fill="#5b5be6" opacity=".7"  />
      <circle cx="15" cy="5"  r="2.4" fill="#5b5be6" opacity=".5"  />
      <circle cx="5"  cy="10" r="2.4" fill="#5b5be6" opacity=".7"  />
      <circle cx="10" cy="10" r="2.4" fill="#5b5be6" opacity=".5"  />
      <circle cx="15" cy="10" r="2.4" fill="#5b5be6" opacity=".35" />
      <circle cx="5"  cy="15" r="2.4" fill="#5b5be6" opacity=".45" />
      <circle cx="10" cy="15" r="2.4" fill="#5b5be6" opacity=".3"  />
      <circle cx="15" cy="15" r="2.4" fill="#5b5be6" opacity=".2"  />
    </svg>
  );
}

const CUSTOM_ICON: Record<string, (active: boolean) => React.ReactNode> = {
  "/":           a => <IcoDashboard active={a} />,
  "/vocabulary": a => <IcoBook      active={a} />,
  "/quiz":       a => <IcoQuiz      active={a} />,
  "/analytics":  a => <IcoAnalytics active={a} />,
};

function TabIcon({ path, active, color }: { path: string; active: boolean; color: string }) {
  if (path in CUSTOM_ICON) return <>{CUSTOM_ICON[path](active)}</>;
  const item = navItems.find(i => i.to === path);
  if (!item) return null;
  const Icon = item.icon;
  return <Icon className="transition-opacity" style={{ color, opacity: active ? 1 : 0.38, width: IZ, height: IZ }} />;
}

interface Props {
  onMore: () => void;
  onLongPress: () => void;
  editMode: boolean;
}

export function BottomTabBar({ onMore, onLongPress, editMode }: Props) {
  const location      = useLocation();
  const pathname      = location.pathname;
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  // Read store directly — no localOrder buffer. This ensures any external
  // change (e.g. MoreSheet adding a tab) is reflected here immediately.
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  const longPressRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moreActive  = !pinnedTabs.includes(pathname);
  const ctx         = getContextMeta(pathname, pinnedTabs);
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
      {/* Context strip */}
      <div
        className="flex items-center gap-2 px-4 py-[7px]"
        style={{ background: editMode ? MORE_BG : ctx.bg, borderBottom: "1px solid rgba(0,0,0,.05)" }}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: editMode ? MORE_COLOR : ctx.color }} />
        <span className="text-[13px] font-semibold leading-snug tracking-[0.01em]" style={{ color: editMode ? MORE_COLOR : ctx.color }}>
          {editMode ? "Leiste anpassen" : ctx.label}
        </span>
      </div>

      {/* Icon rail */}
      <div
        className="flex h-[62px] items-stretch"
        onTouchStart={startLongPress}
        onTouchMove={cancelLongPress}
        onTouchEnd={cancelLongPress}
      >
        {editMode ? (
          <>
            {/* Home — always fixed, no badge */}
            {(() => {
              const home = navItems.find(i => i.to === "/")!;
              return (
                <div className="flex flex-1 p-1">
                  <div className="flex flex-1 items-center justify-center rounded-xl">
                    <TabIcon path="/" active={false} color={home.color} />
                  </div>
                </div>
              );
            })()}

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
              {moveablePaths.map((path, idx) => {
                const item = navItems.find(i => i.to === path);
                if (!item) return null;
                const { label, color } = item;
                return (
                  <Reorder.Item
                    key={path}
                    value={path}
                    as="div"
                    className="flex flex-1 p-1"
                    style={{ touchAction: "none" }}
                  >
                    <motion.div
                      className="relative flex flex-1 items-center justify-center rounded-xl"
                      animate={{ rotate: [-1.5, 1.5, -1.5] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.08, ease: "easeInOut" }}
                    >
                      <TabIcon path={path} active={false} color={color} />
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
                {({ isActive }) => (
                  <div
                    className="relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150"
                    style={isActive ? { background: bg } : {}}
                  >
                    <TabIcon path={to} active={isActive} color={color} />
                    {isActive && (
                      <span className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-6 rounded-full"
                        style={{ height: 3, background: color }} />
                    )}
                  </div>
                )}
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
