import { useCallback, useEffect, useLayoutEffect, type RefObject } from "react";

/**
 * Sizes the Kurz/Lang writing field to the space actually left on screen
 * (founder s168) and pins the trainer's bottom clearance to the floating
 * chrome, so the action cluster stops drifting up and down between tasks.
 *
 * Three states, in order:
 *   1. At rest the field fills from its own top down to the bottom chrome (the
 *      mobile Feedback/Auswerten cluster, or the desktop Art. 50 line), so the
 *      page needs no scrolling at all. The one exception is the floor below.
 *   2. Typing past that grows the field, which turns page scrolling on, up to
 *      `GROWTH` times the resting height.
 *   3. Past that cap the field stops growing and scrolls internally.
 *
 * Measured in JS rather than expressed as a flex/`dvh` chain because the
 * trainer sits deep inside AppShell -> WritingHub -> AnimatePresence, none of
 * which is height constrained; constraining them would change every other
 * Schreiben surface.
 */

/**
 * Floor for the resting height, as a share of the viewport (never below 160px).
 * A long Aufgabe (one with Inhaltspunkte) can leave less room than this on a
 * phone; below the floor the page scrolls a little rather than the field
 * shrinking to an unusable four lines, because at that point the choice is not
 * "scroll or not" but "scroll a little or write in a slot".
 */
const MIN_SHARE = 0.22;
const MIN_ABSOLUTE = 160;
/** How far past the resting height typing may push the field. */
const GROWTH = 1.8;
/**
 * …and never less than this share of the viewport, so a tall Aufgabe (one with
 * Inhaltspunkte) does not also shrink the room the learner has to write in.
 */
const GROWTH_FLOOR = 0.6;
/** Breathing room between the field (or the card below it) and fixed chrome. */
const GAP = 12;

export function useFillEditor({
  editorRef,
  cardRef,
  rootRef,
  aboveRef,
  headerRef,
  clusterRef,
  noteRef,
  fill,
  revision,
}: {
  /** The textarea being sized. */
  editorRef: RefObject<HTMLTextAreaElement>;
  /** Card wrapping the textarea; everything it renders below travels with it. */
  cardRef: RefObject<HTMLElement>;
  /** Trainer root, which carries the clearance for the fixed bottom chrome. */
  rootRef: RefObject<HTMLElement>;
  /** Aufgabe card above the field; its reflow moves the field's top. */
  aboveRef: RefObject<HTMLElement>;
  /** Mobile "Aufgabe wählen" toolbar + panel, which also moves the field's top. */
  headerRef: RefObject<HTMLElement>;
  /** Mobile floating action cluster (laid out below `lg`). */
  clusterRef: RefObject<HTMLElement>;
  /** Desktop Art. 50 line (laid out from `lg` up). */
  noteRef: RefObject<HTMLElement>;
  /** False once a result is on screen: size to the text instead of filling. */
  fill: boolean;
  /** Any value that should force a re-measure. */
  revision: string;
}) {
  const measure = useCallback(() => {
    const ta = editorRef.current;
    const card = cardRef.current;
    if (!ta || !card) return;

    // Collapse to zero first, NOT to `auto`: a textarea's auto height is its
    // `rows` attribute, so `auto` would report 6 (Kurz) or 10 (Lang) rows as the
    // "content" and the field could never size below that. At height 0,
    // scrollHeight is the text's real height plus padding; the borders come off
    // the offset/client delta (both are border-box here).
    ta.style.height = "0px";
    const content = ta.scrollHeight + (ta.offsetHeight - ta.clientHeight);

    const taRect = ta.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    // Umlaut keys, word count, desktop actions, card padding: all of it moves
    // down with the field, so it comes off the budget.
    const tail = Math.max(0, cardRect.bottom - taRect.bottom);
    // Document coordinate, so it stays valid whatever the current scroll is.
    const top = taRect.top + window.scrollY;

    // Chrome pinned to the bottom of the viewport. Only one of the two is ever
    // laid out (the other is display:none at this breakpoint), so the larger
    // reservation simply wins.
    let reserve = GAP;
    for (const el of [clusterRef.current, noteRef.current]) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.height > 0) reserve = Math.max(reserve, window.innerHeight - r.top + GAP);
    }

    const min = Math.max(MIN_ABSOLUTE, Math.round(window.innerHeight * MIN_SHARE));
    const rest = Math.max(min, Math.floor(window.innerHeight - top - tail - reserve));
    const max = Math.max(Math.round(rest * GROWTH), Math.round(window.innerHeight * GROWTH_FLOOR));
    const height = Math.min(Math.max(content, fill ? rest : min), max);
    ta.style.height = `${height}px`;
    ta.style.overflowY = content > max ? "auto" : "hidden";

    // Clearance so whatever ends up last in the page (the field's own card once
    // it scrolls, or the result card) clears the floating chrome. AppShell's
    // own bottom padding already covers part of it; only the rest is added, so
    // the resting page still lands exactly one viewport tall.
    const root = rootRef.current;
    if (root) {
      const main = root.closest("main");
      const mainPad = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0;
      root.style.paddingBottom = `${Math.max(0, Math.round(reserve - mainPad))}px`;
    }
  }, [editorRef, cardRef, rootRef, clusterRef, noteRef, fill]);

  useLayoutEffect(() => {
    measure();
  }, [measure, revision]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    // A late webfont swap re-flows every line above the field.
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) measure();
    });
    return () => {
      live = false;
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  // Everything ABOVE the field can change height without React re-rendering the
  // field itself, or after the render that did (a longer prompt, the
  // Inhaltspunkte list, a late font swap, the Aufgabe panel finishing its exit
  // animation). Observing only these two is deliberate: neither one's size can
  // depend on the field's height, so the measurement cannot feed back on itself.
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    for (const el of [aboveRef.current, headerRef.current]) if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [aboveRef, headerRef, measure]);
}
