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
 * via the `max-lg:` guard). The opaque masking background is applied ONLY once
 * the page is `scrolled`, so at rest the header is transparent (no white block
 * beside the tabs, founder 2026-07-13); when content scrolls under the sticky
 * header the backdrop fades in to mask it.
 */
export function browseHeaderClass(hidden: boolean, scrolled: boolean): string {
  return [
    "sticky top-[calc(4rem+env(safe-area-inset-top))] z-20 transition-[transform,background-color] duration-200 lg:top-16",
    scrolled ? "bg-background/90 backdrop-blur" : "",
    hidden ? "max-lg:-translate-y-[112%]" : "",
  ].join(" ");
}

/**
 * Contents for the Bibliothek "Üben" button (founder 2026-07-13): the WORD
 * "Üben" is centered in the button and the bolt icon floats to its left without
 * shifting the word off-center. The label span is what the button's
 * `justify-center` centers; the icon is absolutely positioned at the span's
 * left edge (`right-full`), so it takes no layout space.
 */
export function UebenLabel({ iconClass = "h-4 w-4" }: { iconClass?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <Zap className={`absolute right-full mr-1.5 ${iconClass}`} />
      Üben
    </span>
  );
}

/** Small centered "go to top" button, shown above the mobile Üben action bar. */
export function ScrollTopButton({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="scrolltop"
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Nach oben"
          title="Nach oben"
          className="fixed left-1/2 z-30 -translate-x-1/2 rounded-full border border-border bg-surface/95 p-2 text-muted-foreground shadow-elevated-soft backdrop-blur transition-colors hover:text-foreground lg:hidden bottom-[calc(3.9375rem+env(safe-area-inset-bottom)+3.5rem)]"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
