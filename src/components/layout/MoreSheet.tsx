import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import type { NavItem } from "./nav-items";
import { RouteIcon } from "./route-icons";
import { useSettingsStore } from "@/store/useSettingsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  onLongPress: () => void;
}

/** Build a full ordering of every route, honouring the saved custom order and
 *  appending any routes the saved order doesn't know about yet. */
function fullOrder(saved: string[]): string[] {
  const all = navItems.map(i => i.to);
  if (saved.length === 0) return all;
  const seen = new Set(saved);
  return [...saved.filter(p => all.includes(p)), ...all.filter(p => !seen.has(p))];
}

function EditGridIcon({
  item, idx, atMax, dragId, onReorder, onAdd, onDragStart, onDragEnd, registerRef,
}: {
  item: NavItem;
  idx: number;
  atMax: boolean;
  dragId: string | null;
  onReorder: (path: string, info: PanInfo) => void;
  onAdd: (path: string) => void;
  onDragStart: (path: string) => void;
  onDragEnd: () => void;
  registerRef: (path: string, el: HTMLDivElement | null) => void;
}) {
  const { to, label, color, bg } = item;
  const isDragging = dragId === to;

  return (
    // `layout` drives the sibling-slide on add/remove. Enter/exit is opacity-only
    // (no scale): animating a transform on a layout element fights framer's
    // projection and was freezing the jiggle until the next re-render.
    <motion.div
      layout
      ref={el => registerRef(to, el)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ zIndex: isDragging ? 50 : 1, position: "relative" }}
      className="flex flex-col items-center gap-2"
    >
      {/* Drag wrapper handles reordering; the inner element does the jiggle so
          the continuous rotate doesn't fight the drag transform. */}
      <motion.div
        drag
        dragSnapToOrigin
        dragElastic={0.18}
        dragMomentum={false}
        whileDrag={{ scale: 1.12 }}
        onDragStart={() => onDragStart(to)}
        onDrag={(_, info) => onReorder(to, info)}
        onDragEnd={onDragEnd}
        style={{ touchAction: "none" }}
        className="relative w-full"
      >
        <motion.div
          className="relative flex h-16 w-full items-center justify-center rounded-2xl"
          style={{ background: bg }}
          animate={isDragging ? { rotate: 0 } : { rotate: [-2.5, 2.5, -2.5] }}
          transition={isDragging
            ? { duration: 0.15 }
            : { repeat: Infinity, duration: 0.45, ease: "easeInOut", delay: idx * 0.05 }}
        >
          <RouteIcon path={to} size={29} active />

          {/* Green + badge — tap to add this section to the bar */}
          {!atMax && (
            <button
              type="button"
              onPointerDownCapture={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onAdd(to); }}
              className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-md active:scale-90"
              aria-label={`${label} zur Leiste hinzufügen`}
            >
              <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </button>
          )}
        </motion.div>
      </motion.div>
      <span className="text-center text-[11px] font-medium leading-tight" style={{ color }}>
        {label}
      </span>
    </motion.div>
  );
}

export function MoreSheet({ open, onOpenChange, editMode, onLongPress }: Props) {
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  const moreOrderRaw  = useSettingsStore(s => s.moreOrder);
  const setMoreOrder  = useSettingsStore(s => s.setMoreOrder);
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemEls      = useRef<Map<string, HTMLDivElement>>(new Map());
  // Drives the lift/zIndex of the tile currently being dragged. Only changes on
  // drag start/end, so it doesn't re-render on every pointer move.
  const [dragId, setDragId] = useState<string | null>(null);

  // Non-pinned routes, ordered by the saved custom order.
  const order = useMemo(() => fullOrder(moreOrderRaw), [moreOrderRaw]);
  const nonPinnedItems = useMemo(() => {
    return order
      .filter(p => !pinnedTabs.includes(p))
      .map(p => navItems.find(i => i.to === p))
      .filter((i): i is NavItem => i != null);
  }, [order, pinnedTabs]);

  const atMax = pinnedTabs.length >= 4;

  function addToBar(path: string) {
    if (atMax) return;
    const next = navItems.map(i => i.to).filter(p => [...pinnedTabs, path].includes(p));
    setPinnedTabs(next);
  }

  function registerRef(path: string, el: HTMLDivElement | null) {
    if (el) itemEls.current.set(path, el);
    else itemEls.current.delete(path);
  }

  // Live reorder: while a tile is dragged, find the tile whose centre is closest
  // to the pointer and slot the dragged tile into that position.
  function reorderDuringDrag(path: string, info: PanInfo) {
    const current = nonPinnedItems.map(i => i.to);
    const from = current.indexOf(path);
    if (from === -1) return;

    // Reorder only when the pointer sits over another tile (not just nearest),
    // which keeps the shuffle stable and jitter-free in the gaps between tiles.
    let closest = from;
    current.forEach((p, i) => {
      if (p === path) return; // the dragged tile follows the pointer — skip it
      const el = itemEls.current.get(p);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside =
        info.point.x >= r.left && info.point.x <= r.right &&
        info.point.y >= r.top  && info.point.y <= r.bottom;
      if (inside) closest = i;
    });

    if (closest !== from) {
      const next = [...current];
      next.splice(from, 1);
      next.splice(closest, 0, path);
      // Persist the new order across ALL routes, keeping pinned routes in place.
      let k = 0;
      const merged = order.map(p => (pinnedTabs.includes(p) ? p : next[k++]));
      setMoreOrder(merged);
    }
  }

  function startLongPress() {
    if (editMode) return;
    longPressRef.current = setTimeout(() => {
      try { navigator.vibrate(40); } catch { /* not available */ }
      onLongPress();
    }, 600);
  }
  function cancelLongPress() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }

  // modal={false} is essential: a modal Radix dialog sets pointer-events:none
  // on everything outside the sheet, which makes the bottom tab bar inert so its
  // drag-to-reorder and X buttons stop responding while the sheet is open.
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogPrimitive.Portal>
        {/* Overlay stops just above the tab bar so the bar stays visible and
            interactive. Tapping the dimmed area closes the sheet (saves). */}
        <DialogPrimitive.Overlay
          className="pointer-events-auto fixed inset-x-0 top-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden"
          style={{ bottom: "calc(3.9375rem + env(safe-area-inset-bottom))" }}
          onPointerDown={() => onOpenChange(false)}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          // no-callout: cascades to all <a> children to suppress iOS link popup.
          // In edit mode, overflow-visible lets dragged icons render outside the sheet
          // boundary while being reordered.
          className={cn(
            "no-callout",
            "fixed inset-x-0 bottom-0 z-50 max-h-[75dvh]",
            editMode ? "overflow-visible" : "overflow-y-auto",
            "rounded-t-2xl border-t border-x-0 border-b-0 border-border bg-surface px-5 pt-3",
            // Clear the bottom tab bar (~63px tall) with extra breathing room so the
            // last row's labels never sit under the bar.
            "pb-[calc(5.75rem+env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-slide-up lg:hidden",
          )}
          onContextMenu={e => e.preventDefault()}
          onTouchStart={startLongPress}
          onTouchMove={cancelLongPress}
          onTouchEnd={cancelLongPress}
          // With modal={false} Radix still fires interact-outside; keep the sheet
          // open when the user is operating the tab bar (drag/X), close otherwise.
          onInteractOutside={e => {
            const target = e.target as HTMLElement | null;
            if (target?.closest("#bottom-tab-bar")) e.preventDefault();
          }}
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">Mehr Bereiche</DialogPrimitive.Title>

          {/* Grab handle */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

          {editMode ? (
            /* ── Edit mode: icons jiggle; drag to reorder, tap + to add to bar ── */
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              <AnimatePresence initial={false}>
                {nonPinnedItems.map((item, idx) => (
                  <EditGridIcon
                    key={item.to}
                    item={item}
                    idx={idx}
                    atMax={atMax}
                    dragId={dragId}
                    onReorder={reorderDuringDrag}
                    onAdd={addToBar}
                    onDragStart={setDragId}
                    onDragEnd={() => setDragId(null)}
                    registerRef={registerRef}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Normal mode: clean icon grid, tap to navigate ── */
            <nav className="grid grid-cols-3 gap-x-3 gap-y-5">
              {nonPinnedItems.map(({ to, label, color, bg }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => onOpenChange(false)}
                  onContextMenu={e => e.preventDefault()}
                  className="flex flex-col items-center gap-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className="flex h-16 w-full items-center justify-center rounded-2xl transition-all duration-150"
                        style={
                          isActive
                            ? { background: bg, outline: `2px solid ${color}` }
                            : { background: "rgba(0,0,0,.04)" }
                        }
                      >
                        <RouteIcon path={to} size={29} active />
                      </div>
                      <span
                        className="text-center text-[11px] font-medium leading-tight"
                        style={{ color: isActive ? color : undefined }}
                      >
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}

              {nonPinnedItems.length === 0 && (
                <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
                  Alle Bereiche sind in der Leiste.
                </p>
              )}
            </nav>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
