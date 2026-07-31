import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
 * over the cards. `pt-3` is the clearance between the app header and the
 * controls that the floating look needs.
 */
export function browseHeaderClass(hidden: boolean): string {
  return [
    "sticky top-[calc(4rem+env(safe-area-inset-top))] z-20 pt-3 transition-transform duration-200 lg:top-16",
    hidden ? "max-lg:-translate-y-[112%]" : "",
  ].join(" ");
}

/**
 * Contents for the Bibliothek "Üben" button (founder 2026-07-13): the label is
 * centered in the button and the bolt icon floats to its left without shifting
 * the label off-center. The span is what the button's `justify-center` centers;
 * the icon is absolutely positioned at the span's left edge (`right-full`), so
 * it takes no layout space.
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
    <span className="relative inline-flex items-center justify-center">
      <Zap className={`absolute right-full mr-1.5 ${iconClass}`} />
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
          className="fixed bottom-4 right-4 z-40 hidden rounded-full border border-border bg-surface/95 p-2 text-muted-foreground shadow-elevated-soft transition-colors hover:text-foreground lg:block"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
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
