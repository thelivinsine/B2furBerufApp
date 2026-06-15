import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DEFAULT_PINNED_TABS } from "./nav-items";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreSheet({ open, onOpenChange }: Props) {
  const pinnedRaw  = useSettingsStore(s => s.pinnedTabs);
  const pinnedTabs = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;
  const moreItems  = navItems.filter(i => !pinnedTabs.includes(i.to));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay stops short of the tab bar (bottom ~96px) so the bar stays visible */}
        <DialogPrimitive.Overlay
          className="fixed inset-x-0 top-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 z-50 max-h-[75dvh] overflow-y-auto",
            "rounded-t-2xl border-t border-x-0 border-b-0 border-border bg-surface px-5 pt-3",
            // Clear the bottom tab bar (strip ~30px + rail 62px + safe area)
            "pb-[calc(5.75rem+env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-slide-up lg:hidden",
          )}
          // Position sheet bottom at screen bottom; bar sits on top via z-[60]
          style={{ bottom: 0 }}
        >
          <DialogPrimitive.Title className="sr-only">Mehr Bereiche</DialogPrimitive.Title>

          {/* grab handle */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

          {/* Grid: 3 columns, icon + label below */}
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
                      className={cn(
                        "flex h-16 w-full items-center justify-center rounded-2xl transition-colors duration-150",
                        isActive ? "" : "bg-muted/50",
                      )}
                      style={isActive ? { background: bg, outline: `2px solid ${color}` } : {}}
                    >
                      <Icon
                        className="shrink-0"
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
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
