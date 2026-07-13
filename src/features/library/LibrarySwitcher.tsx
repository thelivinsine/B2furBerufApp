import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useLibraryScope } from "@/store/useLibraryScope";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
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
  const { trackRef, registerItem, rect } = useSlidingPill(current);

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
  // a SINGLE always-mounted element measured to the active tab (useSlidingPill),
  // so it glides on a pure transform instead of a mount/unmount crossfade that
  // stutters against the trainer re-render. Type stays `text-sm` so all four
  // labels fit a phone row without a horizontal scroll.
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label="Theorie"
      // Doubles as the page header now that the HubHero is gone (founder s92):
      // a lifted bar (shadow) anchors the top of the page, while the active tab
      // reads as the current section title (bold + brand) and the others stay
      // quiet. Still a fully functional tab row. `relative` is the positioning
      // context the pill measures against (offsetLeft/offsetWidth).
      className="relative flex w-full items-stretch gap-0.5 rounded-full border border-border bg-muted p-1 shadow-soft sm:gap-1"
    >
      {/* The one shared pill. Rendered once measured (useLayoutEffect sets `rect`
          before paint, so no flash). `initial={false}` means it appears in place
          and only animates on subsequent tab changes. */}
      {rect && (
        <motion.span
          aria-hidden
          className="absolute top-1 bottom-1 left-0 rounded-full bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }
          }
        />
      )}
      {SEGMENTS.map((seg) => {
        const active = current === seg.tab;
        return (
          <Link
            key={seg.tab}
            ref={registerItem(seg.tab) as React.Ref<HTMLAnchorElement>}
            to={linkFor(seg)}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            className={cn(
              // text-sm everywhere (the mobile-only enlargement the founder
              // asked for; wider screens are NOT bumped to text-base, which read
              // as oversized). Tight mobile padding so the four labels including
              // "Kollokationen" still fit a phone row without a horizontal scroll.
              "relative z-10 flex-1 whitespace-nowrap rounded-full px-1.5 py-2.5 text-center text-sm leading-none transition-colors sm:px-3",
              active
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {seg.label}
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
