import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollRoot } from "@/lib/scrollRoot";

/**
 * Incremental list rendering for the big browse grids (528 words / 396
 * collocations): render the first `pageSize` items and grow by another page
 * whenever the sentinel scrolls near the viewport. Windowing without a
 * virtualization dependency; the page resets whenever the source list changes
 * (new filter, new search) so a filter never shows a stale slice.
 *
 * Usage:
 *   const { visible, hasMore, sentinelRef, showMore } = usePagedList(items);
 *   ...render visible..., then when hasMore render a sentinel div with
 *   ref={sentinelRef} (a "Mehr anzeigen" button calling showMore doubles as
 *   the no-IntersectionObserver fallback).
 */
export function usePagedList<T>(items: readonly T[], pageSize = 60) {
  const [count, setCount] = useState(pageSize);
  // `null` on a page-scrolling surface, which is the viewport root the observer
  // used before. On a surface that scrolls internally the sentinel is clipped
  // by that container, so without this it never intersects and paging stops.
  const scrollRoot = useScrollRoot();

  // Reset the window when the list identity changes (filter/search change).
  useEffect(() => {
    setCount(pageSize);
  }, [items, pageSize]);

  const showMore = useCallback(() => setCount((c) => c + pageSize), [pageSize]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node || typeof IntersectionObserver === "undefined") return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) showMore();
        },
        // Start loading well before the sentinel is actually visible so
        // steady scrolling never hits a visible pop-in.
        { root: scrollRoot, rootMargin: "600px" },
      );
      observerRef.current.observe(node);
    },
    [showMore, scrollRoot],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return {
    visible: items.slice(0, count) as T[],
    hasMore: count < items.length,
    remaining: Math.max(0, items.length - count),
    sentinelRef,
    showMore,
  };
}
