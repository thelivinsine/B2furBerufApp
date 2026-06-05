import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, PRIMARY_TAB_PATHS } from "./nav-items";

const primaryTabs = navItems.filter((i) => PRIMARY_TAB_PATHS.includes(i.to));

interface Props {
  onMore: () => void;
}

export function BottomTabBar({ onMore }: Props) {
  const location = useLocation();
  const moreActive = !PRIMARY_TAB_PATHS.includes(location.pathname);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-stretch border-t border-border bg-surface/80 backdrop-blur-xl pb-safe lg:hidden">
      {primaryTabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <button
        onClick={onMore}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
          moreActive ? "text-primary" : "text-muted-foreground",
        )}
        aria-label="Mehr"
      >
        <LayoutGrid className={cn("h-5 w-5", moreActive && "stroke-[2.5]")} />
        <span className="text-[11px] font-medium leading-none">Mehr</span>
      </button>
    </nav>
  );
}
