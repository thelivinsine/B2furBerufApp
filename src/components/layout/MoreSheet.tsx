import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink } from "react-router-dom";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreSheet({ open, onOpenChange }: Props) {
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  // Tracks paths whose "added" confirmation badge is still visible.
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());

  const nonPinnedItems = navItems.filter(i => !pinnedTabs.includes(i.to));
  const atMax          = pinnedTabs.length >= 4;

  function addTab(path: string) {
    if (atMax) return;
    const next = navItems.map(i => i.to).filter(p => [...pinnedTabs, path].includes(p));
    setPinnedTabs(next);
    // Flash the "added" checkmark for 800ms, then fade it out.
    setJustAdded(prev => new Set([...prev, path]));
    setTimeout(() => {
      setJustAdded(prev => { const s = new Set(prev); s.delete(path); return s; });
    }, 800);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay stops just above the bottom tab bar so the bar stays visible. */}
        <DialogPrimitive.Overlay
          className="fixed inset-x-0 top-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[75dvh] overflow-y-auto",
            "rounded-t-2xl border-t border-x-0 border-b-0 border-border bg-surface px-5 pt-3",
            // Clear the full bar height (name strip ~30px + icon rail 62px + safe area).
            "pb-[calc(5.75rem+env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-slide-up lg:hidden",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Mehr Bereiche</DialogPrimitive.Title>

          {/* Grab handle */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

          {/* ── Section 1: Deine Leiste — draggable to reorder ── */}
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Deine Leiste
          </p>
          <Reorder.Group
            axis="x"
            values={pinnedTabs}
            onReorder={setPinnedTabs}
            className="mb-6 flex gap-2"
            as="div"
          >
            {pinnedTabs.map(path => {
              const item = navItems.find(i => i.to === path);
              if (!item) return null;
              const { label, icon: Icon, color, bg } = item;
              return (
                <Reorder.Item
                  key={path}
                  value={path}
                  as="div"
                  className="flex flex-1 flex-col items-center gap-1.5"
                  style={{ touchAction: "none" }}
                >
                  <motion.div
                    className="flex h-14 w-full cursor-grab items-center justify-center rounded-2xl active:cursor-grabbing"
                    style={{ background: bg }}
                    whileDrag={{ scale: 1.08, boxShadow: "0 8px 20px rgba(0,0,0,.18)" }}
                  >
                    <Icon style={{ width: 26, height: 26, color }} />
                  </motion.div>
                  <span className="text-center text-[10px] font-medium leading-tight text-foreground/70">
                    {label}
                  </span>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* ── Section 2: Weitere Bereiche — tap to add ── */}
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Weitere Bereiche
          </p>

          {nonPinnedItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Alle Bereiche sind bereits in der Leiste.
            </p>
          ) : (
            <nav className="grid grid-cols-3 gap-x-3 gap-y-5">
              {nonPinnedItems.map(({ to, label, icon: Icon, color, bg }) => {
                const added = justAdded.has(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={e => {
                      if (!atMax) {
                        // Add to the bar instead of navigating when there is room.
                        e.preventDefault();
                        addTab(to);
                      } else {
                        // At max — navigate normally and close the sheet.
                        onOpenChange(false);
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl outline-none",
                      "focus-visible:ring-2 focus-visible:ring-primary",
                      atMax && !added && "opacity-50",
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className="relative flex h-16 w-full items-center justify-center rounded-2xl transition-all duration-150"
                          style={{ background: isActive ? bg : "rgba(0,0,0,.04)" }}
                        >
                          <Icon
                            style={{
                              width: 28,
                              height: 28,
                              color,
                              opacity: added ? 0 : (isActive ? 1 : 0.65),
                              transition: "opacity 0.15s",
                            }}
                          />

                          {/* Added checkmark flash */}
                          <AnimatePresence>
                            {added && (
                              <motion.div
                                key="check"
                                className="absolute inset-0 flex items-center justify-center rounded-2xl"
                                style={{ background: bg }}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.1, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check
                                  className="font-bold"
                                  style={{ width: 28, height: 28, color, strokeWidth: 3 }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* + badge — shown when there's room and item is not active */}
                          {!atMax && !added && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[11px] font-bold text-white shadow">
                              +
                            </span>
                          )}
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
                );
              })}
            </nav>
          )}

          {atMax && nonPinnedItems.length > 0 && (
            <p className="mt-4 text-center text-[12px] text-muted-foreground">
              Leiste voll (max. 4). Erst ein Icon entfernen, um ein neues hinzuzufügen.
            </p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
