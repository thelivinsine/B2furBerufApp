import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The app-wide rule for a tile the learner EXPANDS (founder, s189): a Verlauf
 * block, a filter panel, any disclosure that can grow without limit.
 *
 * At rest the tile shows what fits and the page does not scroll. On expand it
 * takes the room it needs, pushing whatever sits above it out of view, but it
 * is never taller than one screen, so its own top and bottom borders stay
 * visible. Its list scrolls INSIDE; when that list is at its top and the
 * learner keeps scrolling, the browser hands the scroll on to the page and the
 * content above comes back. That chaining is the browser's default, so the one
 * thing an adopting surface must NOT do is set `overscroll-behavior: contain`.
 *
 * Three parts, and a surface needs all three:
 *   1. `max-h-panel-stage` on the tile while expanded (the one-screen ceiling),
 *      with `flex flex-col overflow-hidden` so the border clips its contents.
 *   2. `min-h-0 flex-1 overflow-y-auto` on the ONE region inside that scrolls.
 *   3. this hook's ref on the tile, which scrolls it into view on expand.
 *
 * The page around it also has to release whatever height cap keeps it at zero
 * scroll (`h-page-stage`) while the tile is expanded, or the tile has nowhere
 * to grow into.
 */
export function useStagePanel<T extends HTMLElement = HTMLDivElement>(expanded: boolean) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!expanded) return;
    const el = ref.current;
    if (!el) return;
    // After paint: the tile has to be at its expanded height before we can put
    // it on screen, otherwise we scroll to where it used to end.
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [expanded, reduce]);

  return ref;
}
