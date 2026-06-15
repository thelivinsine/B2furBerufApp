import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  onLongPress: () => void;
}

export function MoreSheet({ open, onOpenChange, editMode, onLongPress }: Props) {
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nonPinnedItems = navItems.filter(i => !pinnedTabs.includes(i.to));
  const atMax          = pinnedTabs.length >= 4;

  function addToBar(path: string) {
    if (atMax) return;
    const next = navItems.map(i => i.to).filter(p => [...pinnedTabs, path].includes(p));
    setPinnedTabs(next);
    setJustAdded(prev => new Set([...prev, path]));
    setTimeout(() => {
      setJustAdded(prev => { const s = new Set(prev); s.delete(path); return s; });
    }, 800);
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

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay stops just above the tab bar so the bar stays visible. */}
        <DialogPrimitive.Overlay
          className="fixed inset-x-0 top-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          // no-callout: cascades to all <a> children to suppress iOS link popup.
          className={cn(
            "no-callout",
            "fixed inset-x-0 bottom-0 z-50 max-h-[75dvh] overflow-y-auto",
            "rounded-t-2xl border-t border-x-0 border-b-0 border-border bg-surface px-5 pt-3",
            "pb-[calc(5.75rem+env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-slide-up lg:hidden",
          )}
          onContextMenu={e => e.preventDefault()}
          onTouchStart={startLongPress}
          onTouchMove={cancelLongPress}
          onTouchEnd={cancelLongPress}
        >
          <DialogPrimitive.Title className="sr-only">Mehr Bereiche</DialogPrimitive.Title>

          {/* Grab handle */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

          {editMode ? (
            /* ── Edit mode: icons jiggle; tap one to add it to the bar ── */
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {nonPinnedItems.map(({ to, label, icon: Icon, color, bg }, idx) => {
                const added = justAdded.has(to);
                return (
                  <div key={to} className="flex flex-col items-center gap-2">
                    <motion.button
                      type="button"
                      disabled={atMax}
                      className="relative flex h-16 w-full items-center justify-center rounded-2xl outline-none disabled:cursor-not-allowed"
                      style={{ background: bg }}
                      animate={{ rotate: [-1.5, 1.5, -1.5] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.07, ease: "easeInOut" }}
                      onClick={() => { if (!atMax && !added) addToBar(to); }}
                    >
                      <Icon style={{ width: 28, height: 28, color, opacity: added ? 0 : (atMax ? 0.35 : 0.85) }} />

                      {/* Added confirmation flash */}
                      <AnimatePresence>
                        {added && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center rounded-2xl"
                            style={{ background: bg }}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check style={{ width: 28, height: 28, color, strokeWidth: 3 }} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Green + badge — tap to add to the bar */}
                      {!atMax && !added && (
                        <span
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow-md"
                          aria-hidden="true"
                        >
                          <Plus className="h-3 w-3 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </motion.button>
                    <span className="text-center text-[11px] font-medium leading-tight text-foreground/70">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Normal mode: clean icon grid, tap to navigate ── */
            <nav className="grid grid-cols-3 gap-x-3 gap-y-5">
              {nonPinnedItems.map(({ to, label, icon: Icon, color, bg }) => (
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
                        <Icon style={{ width: 28, height: 28, color, opacity: isActive ? 1 : 0.65 }} />
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

          {editMode && atMax && nonPinnedItems.length > 0 && (
            <p className="mt-4 text-center text-[12px] text-muted-foreground">
              Leiste voll (max. 4). Erst ein Icon entfernen.
            </p>
          )}
          {editMode && !atMax && nonPinnedItems.length > 0 && (
            <p className="mt-4 text-center text-[12px] text-muted-foreground">
              Icon antippen, um es zur Leiste hinzuzufügen.
            </p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
