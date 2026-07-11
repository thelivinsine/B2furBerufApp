import { useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Table2, Waypoints, LayoutGrid, List } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  return (
    <div
      role="group"
      aria-label="Ansicht"
      className={cn(
        // Same lifted-white-pill toggle language as the page toggle
        // (LibrarySwitcher): recessed grey track, active button on a white pill.
        "inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5",
        className,
      )}
    >
      {views.map((v) => {
        const { label, icon: Icon } = VIEW_META[v];
        const active = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={cn(
              "relative inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="view-tab-pill"
                className="absolute inset-0 rounded-md bg-surface shadow-soft"
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
