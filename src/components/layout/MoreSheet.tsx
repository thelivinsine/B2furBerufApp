import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true the sheet lets users add sections to the tab bar instead of navigating. */
  addMode?: boolean;
}

export function MoreSheet({ open, onOpenChange, addMode = false }: Props) {
  const pinnedRaw     = useSettingsStore(s => s.pinnedTabs);
  const setPinnedTabs = useSettingsStore(s => s.setPinnedTabs);
  const pinnedTabs    = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;

  // Items not currently pinned to the bar.
  const moreItems = navItems.filter(i => !pinnedTabs.includes(i.to));

  function addTab(path: string) {
    if (pinnedTabs.length >= 4) return;
    // Insert in navItems order so the bar always sorts consistently.
    const next = navItems.map(i => i.to).filter(p => [...pinnedTabs, path].includes(p));
    setPinnedTabs(next);
    // Auto-close when the bar is now full.
    if (next.length >= 4) onOpenChange(false);
  }

  const atMax = pinnedTabs.length >= 4;

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
            // Clear the full bottom tab bar height (name strip ~30px + icon rail 62px + safe area).
            "pb-[calc(5.75rem+env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-slide-up lg:hidden",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {addMode ? "Tab hinzufügen" : "Mehr Bereiche"}
          </DialogPrimitive.Title>

          {/* Grab handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

          {addMode ? (
            /* ── Add-mode: icon grid with + badges, tapping pins a section ── */
            <>
              <p className="mb-4 text-[13px] font-semibold text-foreground/70">
                {atMax
                  ? "Leiste ist voll (max. 4). Erst ein Icon entfernen."
                  : `Bereich hinzufügen (${pinnedTabs.length}/4 belegt)`
                }
              </p>
              <nav className="grid grid-cols-3 gap-x-3 gap-y-5">
                {moreItems.map(({ to, label, icon: Icon, color, bg }) => (
                  <button
                    key={to}
                    onClick={() => addTab(to)}
                    disabled={atMax}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl outline-none",
                      "focus-visible:ring-2 focus-visible:ring-primary",
                      atMax && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <div
                      className="relative flex h-16 w-full items-center justify-center rounded-2xl"
                      style={{ background: bg }}
                    >
                      <Icon style={{ width: 28, height: 28, color }} />
                      {!atMax && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[11px] font-bold text-white shadow">
                          +
                        </span>
                      )}
                    </div>
                    <span className="text-center text-[11px] font-medium leading-tight text-foreground/80">
                      {label}
                    </span>
                  </button>
                ))}
                {moreItems.length === 0 && (
                  <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
                    Alle Bereiche sind bereits in der Leiste.
                  </p>
                )}
              </nav>
            </>
          ) : (
            /* ── Normal mode: icon grid, tapping navigates ── */
            <nav className="grid grid-cols-3 gap-x-3 gap-y-5">
              {moreItems.map(({ to, label, icon: Icon, color, bg }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => onOpenChange(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className="flex h-16 w-full items-center justify-center rounded-2xl transition-colors duration-150"
                        style={
                          isActive
                            ? { background: bg, outline: `2px solid ${color}` }
                            : { background: "rgba(0,0,0,.04)" }
                        }
                      >
                        <Icon
                          style={{
                            width: 28,
                            height: 28,
                            color,
                            opacity: isActive ? 1 : 0.6,
                          }}
                        />
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
              {moreItems.length === 0 && (
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
