import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Measured sliding-pill mechanism for segmented controls (the Theorie tab bar,
 * the view switcher, and any future toggle in the same language).
 *
 * Why not framer's `layoutId` shared-layout crossfade? That mounts a NEW pill on
 * the active segment and unmounts the old one, so on every switch framer has to
 * re-measure both, keep the exiting node alive, and cross-fade. When the switch
 * also triggers a heavy re-render on the same commit (the library tabs swap in a
 * whole trainer that walks a content bank), that measurement competes for the
 * main thread and the pill visibly stutters. Instead we keep ONE pill mounted for
 * the control's lifetime and animate only its `x`/`width` (a compositor-friendly
 * transform when the width is constant, which it is for equal-width segments), so
 * the glide is decoupled from whatever else renders that frame.
 *
 * Positions are MEASURED from the live DOM (offsetLeft/offsetWidth relative to the
 * track), so gaps, padding, responsive type changes and unequal segment widths all
 * work without hand-computed percentages. Re-measures on active change and on any
 * resize of the track.
 */
export function useSlidingPill<K extends string>(activeKey: K) {
  const trackRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Map<K, HTMLElement>>(new Map());
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);

  const registerItem = useCallback(
    (key: K) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(key, el);
      else itemRefs.current.delete(key);
    },
    [],
  );

  const measure = useCallback(() => {
    const el = itemRefs.current.get(activeKey);
    if (!el) return;
    setRect((prev) =>
      prev && prev.left === el.offsetLeft && prev.width === el.offsetWidth
        ? prev
        : { left: el.offsetLeft, width: el.offsetWidth },
    );
  }, [activeKey]);

  // useLayoutEffect: measure synchronously after DOM mutation and BEFORE paint, so
  // the pill is in place on the very first frame (no flash from an unmeasured 0,0).
  useLayoutEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  return { trackRef, registerItem, rect };
}
