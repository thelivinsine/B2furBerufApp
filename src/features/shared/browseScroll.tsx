import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUp, Zap } from "lucide-react";

/**
 * Scroll-direction tracker for the Bibliothek browse pages (founder 2026-07-13).
 * On mobile the tabs + toolbar collapse away on scroll-down (more room for the
 * content) and reappear on scroll-up; a "go to top" button shows once the page
 * is scrolled a bit. `hidden` = collapse the header, `scrolled` = show the
 * go-to-top button. Near the very top both reset to visible.
 */
export function useScrollDirection() {
  const [state, setState] = useState({ hidden: false, scrolled: false });
  const lastY = useRef(0);
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const scrolled = y > 280;
      if (y < 72) {
        setState({ hidden: false, scrolled });
        lastY.current = y;
        return;
      }
      const dy = y - lastY.current;
      if (Math.abs(dy) < 6) {
        setState((s) => (s.scrolled === scrolled ? s : { ...s, scrolled }));
        return;
      }
      setState({ hidden: dy > 0, scrolled });
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return state;
}

/**
 * The sticky/collapsing classes for the tabs+toolbar row (both breakpoints).
 * `hidden` slides it up under the app header on mobile (desktop never collapses
 * via the `max-lg:` guard).
 *
 * The row is ALWAYS fully transparent (founder 2026-07-31): the earlier version
 * faded in a `bg-background/90 backdrop-blur` mask once the page scrolled, which
 * read as a blurred band strapped across the page. The controls carry their own
 * opaque fill + `shadow-soft`, so with no band behind them they read as floating
 * over the cards.
 *
 * The clearance under the app header that the floating look needs (0.75rem) is
 * baked into the STICKY OFFSET, not into padding (founder follow-up, same day:
 * "at top it's way too much"). Padding applies in every state and pushed the
 * controls away from the tabs at rest too; a sticky `top` does nothing until the
 * row actually pins, so at rest the spacing is exactly what it was before this
 * work and the gap appears only while the row floats. It also keeps the flow
 * height constant, so nothing shifts at the moment it pins.
 */
export function browseHeaderClass(hidden: boolean): string {
  return [
    "sticky top-[calc(4rem+env(safe-area-inset-top)+0.75rem)] z-20 transition-transform duration-200 lg:top-[4.75rem]",
    hidden ? "max-lg:-translate-y-[112%]" : "",
  ].join(" ");
}

/**
 * Classes every icon button in a browse toolbar row wears (Filter, Bookmark,
 * Search). The row behind them is transparent, so they must be OPAQUE: the
 * `outline` variant fills with `bg-surface/50` and hovers to `bg-muted/60`, and
 * at half alpha the card titles scrolling underneath printed straight through
 * the buttons (founder 2026-07-31, "the buttons are illegible"). `shadow-soft`
 * is what separates them from the cards instead of a background band. Append
 * this AFTER the variant classes so the opaque fills win the merge.
 */
export const BROWSE_TOOLBAR_BUTTON =
  // 30px square since s189, a quarter down from 40 (founder: the WHOLE toolbar
  // row, not just the view switcher). Overrides the `size="icon"` variant, so
  // it has to come after it in the class list, which `cn()` handles.
  "h-[1.875rem] w-[1.875rem] shrink-0 rounded-lg bg-surface shadow-soft hover:bg-muted";

/**
 * The filter toggle is the one toolbar button that OPENS an accent rail, so it
 * wears that rail's own Himmelblau fill rather than the white toolbar surface
 * (founder s189; the same rule the Schreiben "Aufgabe wählen" toggle follows,
 * s166). It has to come AFTER `BROWSE_TOOLBAR_BUTTON` in a `cn()` call, whose
 * `bg-surface` would otherwise win the merge.
 */
export const BROWSE_FILTER_BUTTON =
  "border-accent/35 bg-accent/35 text-accent-ink shadow-soft hover:border-accent/50 hover:bg-accent/50 dark:border-accent/[0.18] dark:bg-accent/[0.18] dark:hover:border-accent/[0.28] dark:hover:bg-accent/[0.28]";

/**
 * Contents for the Bibliothek "Üben" button. The mark and the label are ONE
 * centred group (founder s189: "the emoji should be treated as part of the text
 * when center aligning"). It used to hang the icon outside the flow
 * (`absolute right-full`) so the words alone sat dead centre, which left the
 * pair looking pushed to the left in a wide button.
 *
 * When `count` + `noun` are given the label folds the filtered-set size into the
 * button ("Üben mit 47 Wörtern"), so it is always obvious that Üben practises
 * exactly what the filters narrowed to (founder 2026-07-14). `noun` must already
 * be in the DATIVE case the caller's count needs (mit + Dativ), e.g. singular
 * "Wort" vs plural "Wörtern". Without them it falls back to the bare "Üben".
 */
export function UebenLabel({
  iconClass = "h-4 w-4",
  count,
  noun,
}: {
  iconClass?: string;
  count?: number;
  noun?: string;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5">
      <Zap className={iconClass} />
      {count != null && noun ? `Üben mit ${count} ${noun}` : "Üben"}
    </span>
  );
}

/**
 * "Go to top", shown once the page is scrolled. Two placements, one per
 * breakpoint: mobile keeps the centered button above the Üben action bar,
 * desktop gets the same button in the bottom-right corner (founder 2026-07-31,
 * it was mobile-only before). The desktop one clears the Feedback pill, which
 * floats further left on its own offset.
 */
export function ScrollTopButton({ show }: { show: boolean }) {
  return (
    <>
      <ScrollTopMobile show={show} />
      <ScrollTopDesktop show={show} />
    </>
  );
}

function ScrollTopDesktop({ show }: { show: boolean }) {
  return (
    // Same wrapper as the Feedback pill (see `FeedbackButton`), so this button
    // sits at the LEFT edge of the filter rail's column while the pill sits at
    // its right edge (founder s189).
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden lg:block lg:pl-64">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="ml-auto flex w-64 justify-start">
          <AnimatePresence>
            {show && (
              <motion.button
                key="scrolltop-desktop"
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Nach oben"
                title="Nach oben"
                className="pointer-events-auto rounded-full border border-border bg-surface/95 p-2 text-muted-foreground shadow-elevated-soft transition-colors hover:text-foreground"
              >
                <ArrowUp className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ScrollTopMobile({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="scrolltop"
          type="button"
          // Keep x at -50% across every keyframe: framer writes an inline
          // `transform` for the y animation, which would otherwise override the
          // Tailwind `-translate-x-1/2` centering class and shift the button off
          // center. Animating x here keeps the horizontal centering intact.
          initial={{ opacity: 0, x: "-50%", y: 8 }}
          animate={{ opacity: 1, x: "-50%", y: 0 }}
          exit={{ opacity: 0, x: "-50%", y: 8 }}
          transition={{ duration: 0.15 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Nach oben"
          title="Nach oben"
          className="fixed left-1/2 z-30 rounded-full border border-border bg-surface/95 p-2 text-muted-foreground shadow-elevated-soft backdrop-blur transition-colors hover:text-foreground lg:hidden bottom-[calc(3.9375rem+env(safe-area-inset-bottom)+3.5rem)]"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * A horizontally scrolling region that SAYS it scrolls (founder s189: "show a
 * horizontal scroll wherever applicable in the views all across the bibliothek
 * to indicate there are more columns to the right").
 *
 * A soft fade at whichever edge still has content behind it, and nothing at all
 * once the region fits or has been scrolled to its end, so the hint is never a
 * decoration that lies. `pointer-events-none` on the fades keeps the row itself
 * fully clickable underneath.
 */
export function HScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge({ left: el.scrollLeft > 1, right: max > 1 && el.scrollLeft < max - 1 });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // The column count changes with the filters, not only with the window, so
    // a ResizeObserver where there is one. jsdom has none, and neither do a few
    // old mobile browsers, so the window resize is the floor rather than a
    // crash on mount.
    const ro =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (ro) {
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    } else {
      window.addEventListener("resize", measure);
    }
    return () => {
      el.removeEventListener("scroll", measure);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={ref} className={cn("overflow-x-auto", className)}>
        {children}
      </div>
      {edge.left && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-px left-px w-8 rounded-l-xl bg-gradient-to-r from-surface to-transparent"
        />
      )}
      {edge.right && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-px right-px w-8 rounded-r-xl bg-gradient-to-l from-surface to-transparent"
        />
      )}
    </div>
  );
}
