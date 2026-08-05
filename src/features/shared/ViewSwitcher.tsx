import { useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Table2, Waypoints, LayoutGrid, List } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { cn } from "@/lib/utils";

/**
 * Library view switcher (Bibliothek views, session 91, from the founder's
 * hand-drawn mockup): a segmented icon control that flips one browse surface
 * between presentations of the SAME filtered list. Views are per-tab
 * (Grammatik has none, only Wörter has the graph); the choice persists in the
 * URL as `?view=` so deep links and reloads keep it. "karten" is the default
 * everywhere and stays OUT of the URL for clean links.
 */
export type LibraryView = "tabelle" | "graph" | "karten" | "liste";

export const DEFAULT_VIEW: LibraryView = "karten";

const VIEW_META: Record<LibraryView, { label: string; icon: LucideIcon }> = {
  tabelle: { label: "Tabelle", icon: Table2 },
  graph: { label: "Graph", icon: Waypoints },
  karten: { label: "Karten", icon: LayoutGrid },
  liste: { label: "Liste", icon: List },
};

/** Read + write `?view=` against a whitelist of views the tab supports. */
export function useViewParam(views: LibraryView[]): [LibraryView, (v: LibraryView) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("view") as LibraryView | null;
  const view = raw && views.includes(raw) ? raw : DEFAULT_VIEW;

  const setView = (v: LibraryView) => {
    const p = new URLSearchParams(params);
    if (v === DEFAULT_VIEW) p.delete("view");
    else p.set("view", v);
    setParams(p, { replace: true });
  };

  return [view, setView];
}

export function ViewSwitcher({
  views,
  value,
  onChange,
  className,
}: {
  /** Which views this tab offers, in display order (mockup: Tabelle · Graph · Karten · Liste). */
  views: LibraryView[];
  value: LibraryView;
  onChange: (view: LibraryView) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(value);
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="group"
      aria-label="Ansicht"
      className={cn(
        // Same lifted-white-pill toggle language as the page toggle
        // (LibrarySwitcher): recessed grey track, active button on a white pill.
        // 30px tall since s189, a quarter down from the 40px that matched the
        // toolbar's icon buttons (founder: "reduce the view buttons size by
        // 25%"). The row is `items-center`, so it stays centred against the
        // 40px buttons beside it. `relative` is the pill's positioning context.
        // `shadow-soft`: the toolbar row behind it is transparent, so the track
        // does its own lifting off the cards scrolling underneath.
        "relative inline-flex h-[1.875rem] shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5 shadow-soft",
        className,
      )}
    >
      {/* One always-mounted pill measured to the active button; glides on a pure
          transform instead of a mount/unmount crossfade (see useSlidingPill). */}
      {rect && (
        <motion.span
          aria-hidden
          className="absolute top-0.5 bottom-0.5 left-0 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }
          }
        />
      )}
      {views.map((v) => {
        const { label, icon: Icon } = VIEW_META[v];
        const active = v === value;
        return (
          <button
            key={v}
            ref={registerItem(v)}
            onClick={() => onChange(v)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={cn(
              "relative z-10 inline-flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-md transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
