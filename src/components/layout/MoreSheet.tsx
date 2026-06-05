import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems, PRIMARY_TAB_PATHS } from "./nav-items";

const moreItems = navItems.filter((i) => !PRIMARY_TAB_PATHS.includes(i.to));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreSheet({ open, onOpenChange }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed bottom-0 inset-x-0 z-50 max-h-[80dvh] overflow-y-auto",
            "rounded-t-2xl border-t border-x-0 border-b-0 border-border bg-surface px-4 pt-3",
            "pb-[calc(4rem+env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-slide-up lg:hidden",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Mehr</DialogPrimitive.Title>
          {/* grab handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

          <nav className="flex flex-col gap-0.5">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/20 font-semibold text-foreground"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
