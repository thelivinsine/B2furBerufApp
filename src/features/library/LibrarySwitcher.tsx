import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useLibraryScope } from "@/store/useLibraryScope";
import { cn } from "@/lib/utils";

/**
 * Segmented switcher across the four library surfaces. Since UX overhaul
 * Phase 5 (session 49) all four live under the single `/library` hub, selected
 * by a `?tab=` param (the hard merge that Phase 3 deferred). Each segment link
 * carries the shared scope (`useLibraryScope`) so the active theme travels when
 * you hop between the two theme-scoped segments.
 */
const SEGMENTS: { tab: string; label: string; scoped: boolean }[] = [
  { tab: "woerter", label: "Wörter", scoped: true },
  { tab: "kollokationen", label: "Kollokationen", scoped: true },
  { tab: "redemittel", label: "Redemittel", scoped: false },
  { tab: "grammatik", label: "Grammatik", scoped: false },
];

export const LIBRARY_TABS = SEGMENTS.map((s) => s.tab);
export const DEFAULT_LIBRARY_TAB = "woerter";

export function LibrarySwitcher() {
  const [params] = useSearchParams();
  const current = params.get("tab") ?? DEFAULT_LIBRARY_TAB;
  const { theme, sub } = useLibraryScope();
  const reduce = useReducedMotion();

  const linkFor = (seg: (typeof SEGMENTS)[number]) => {
    const p = new URLSearchParams();
    p.set("tab", seg.tab);
    if (seg.scoped && theme !== "all") {
      p.set("theme", theme);
      if (seg.tab === "woerter" && sub) p.set("sub", sub);
    }
    return `/library?${p.toString()}`;
  };

  // Premium toggle language (matches the Dashboard Üben/Spielen toggle): a
  // recessed grey track with a lifted white pill on the active tab. The pill is
  // a shared-layout motion element, so it glides to the tapped tab instead of
  // snapping. Type scales down on phones (`text-xs`) so all four labels fit
  // without a horizontal scroll; `sm+` gets the roomier `text-sm`.
  return (
    <div
      role="tablist"
      aria-label="Bibliothek"
      className="flex w-full items-stretch gap-0.5 rounded-full border border-border bg-muted p-1 sm:gap-1"
    >
      {SEGMENTS.map((seg) => {
        const active = current === seg.tab;
        return (
          <Link
            key={seg.tab}
            to={linkFor(seg)}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            className={cn(
              // Bigger type (text-sm on mobile, text-base on desktop) with tight
              // mobile padding/gap so the four labels including "Kollokationen"
              // still fit a phone row without a horizontal scroll.
              "relative flex-1 whitespace-nowrap rounded-full px-1.5 py-2 text-center text-sm font-semibold leading-none transition-colors sm:px-4 sm:py-2.5 sm:text-base",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="library-tab-pill"
                className="absolute inset-0 rounded-full bg-surface shadow-soft"
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
            <span className="relative z-10">{seg.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

/** Dismissible chip showing the active library scope on theme-scoped surfaces. */
export function ScopeChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      Kontext: {label}
      <button onClick={onClear} aria-label="Kontext entfernen" className="hover:text-primary/70">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
