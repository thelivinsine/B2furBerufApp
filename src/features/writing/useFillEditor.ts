import { useCallback, useEffect, useLayoutEffect, type RefObject } from "react";

/**
 * Sizes the Kurz/Lang writing field to the space actually left on screen
 * (founder s168) and pins the trainer's bottom clearance to the floating
 * chrome, so the action cluster stops drifting up and down between tasks.
 *
 * Three states, in order:
 *   1. At rest the field fills from its own top down to the bottom chrome (the
 *      mobile Feedback/Auswerten cluster, or the desktop Art. 50 line), so the
 *      page needs no scrolling at all. Two exceptions: the floor below, and
 *      `desktopCap`, which stops the field short of the chrome from `lg` up.
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
 * phone; the shortfall first comes out of the Aufgabe card's prompt region
 * (capped + internal scroll, see TASK_BODY_MIN below), and only when that
 * region hits ITS floor does the page scroll a little, because at that point
 * the choice is "scroll a little or read the Aufgabe through a slot".
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
/** Tailwind's `lg`, i.e. the breakpoint where `desktopCap` starts applying. */
const WIDE = "(min-width: 1024px)";
/** Breathing room between the field (or the card below it) and fixed chrome. */
const GAP = 12;
/**
 * The least of the Aufgabe text that must stay visible when the card is capped
 * (~4 lines). Below this the card stops shrinking and the page scrolls after
 * all: on a very short viewport, "a sliver of Aufgabe over a sliver of field"
 * would be worse than a small scroll.
 */
const TASK_BODY_MIN = 96;

export function useFillEditor({
  editorRef,
  cardRef,
  rootRef,
  aboveRef,
  taskBodyRef,
  headerRef,
  clusterRef,
  noteRef,
  desktopCap,
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
  /**
   * The scrollable prompt + Inhaltspunkte region INSIDE the Aufgabe card.
   * When the card's natural height would push the field below its floor (the
   * old "a long Aufgabe still scrolls the page a little" case), this region is
   * capped and scrolls internally instead, keeping the eyebrow + dice row
   * visible and the page at exactly one viewport.
   */
  taskBodyRef: RefObject<HTMLElement>;
  /** Mobile "Aufgabe wählen" toolbar + panel, which also moves the field's top. */
  headerRef: RefObject<HTMLElement>;
  /** Mobile floating action cluster (laid out below `lg`). */
  clusterRef: RefObject<HTMLElement>;
  /** Desktop Art. 50 line (laid out from `lg` up). */
  noteRef: RefObject<HTMLElement>;
  /**
   * From `lg` up, cap the RESTING height at `max(min, share x viewport)`. A
   * desktop window is tall and wide, so filling every last pixel reads as one
   * giant empty box (founder s168 follow-up); mobile has no cap and still fills.
   */
  desktopCap: { min: number; share: number };
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
    let top = taRect.top + window.scrollY;

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

    // A long Aufgabe (Inhaltspunkte) can leave less than the field's floor, in
    // which case the page used to scroll at rest. Instead, cap the Aufgabe
    // card's prompt region by exactly the shortfall and let IT scroll (down to
    // TASK_BODY_MIN, past which a small page scroll is the lesser evil). The
    // math works off scrollHeight, never by clearing the cap to re-measure, so
    // the ResizeObserver watching the card cannot ping-pong.
    const body = taskBodyRef.current;
    if (body) {
      const bodyVisible = body.getBoundingClientRect().height;
      const bodyNatural = body.scrollHeight;
      const availNatural =
        window.innerHeight - top - tail - reserve - (bodyNatural - bodyVisible);
      const deficit = min - availNatural;
      const capped = Math.max(TASK_BODY_MIN, Math.round(bodyNatural - Math.max(0, deficit)));
      if (deficit > 0.5 && capped < bodyNatural - 0.5) {
        body.style.maxHeight = `${capped}px`;
        body.style.overflowY = "auto";
      } else {
        body.style.maxHeight = "";
        body.style.overflowY = "";
      }
      // The cap moved the field's top; re-read it (forced reflow, one per pass).
      top = ta.getBoundingClientRect().top + window.scrollY;
    }

    const available = Math.max(min, Math.floor(window.innerHeight - top - tail - reserve));
    // Desktop stops short of the bottom chrome on purpose; mobile fills it.
    const wide = window.matchMedia(WIDE).matches;
    const rest = wide
      ? Math.min(available, Math.max(desktopCap.min, Math.round(window.innerHeight * desktopCap.share)))
      : available;
    // Growth is measured off the resting height, but never below what the
    // screen actually offers: on desktop `rest` is deliberately short of that,
    // and where a tall Aufgabe pushes `available` down to the floor, 1.8x a
    // floor is still a floor. Without `available` in here, typing would hit
    // internal scrolling while empty screen was still going spare.
    const max = Math.max(
      Math.round(rest * GROWTH),
      available,
      Math.round(window.innerHeight * GROWTH_FLOOR),
    );
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
  }, [editorRef, cardRef, rootRef, taskBodyRef, clusterRef, noteRef, desktopCap.min, desktopCap.share, fill]);

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
