import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * The mobile floating action cluster: Fokus (Korrigieren), Kurz/Lang
 * (Auswerten) and, since s189, the four Bibliothek tabs (Üben). The founder
 * asked for ONE geometry ("the buttons on the bottom on mobile view should be
 * in same positions and design as schreiben aufgabe wählen"), so it lives here
 * rather than being copied per surface.
 *
 * The cluster is sticky and carries NO bar chrome (founder s159/s160): no
 * border, no full-width backdrop. That means it floats straight over the
 * content cards, so anything in it that is not opaque by itself lets the card
 * behind shine through and reads as two labels stacked on each other (founder
 * report, s164): `variant="outline"` is `bg-surface/50`, the disabled state is
 * `opacity-50`, and plain text is transparent by definition.
 *
 * The answer is a per-element opaque backing in the page ground color rather
 * than a bar: `--background` matches the page stops (identical in dark mode,
 * all at 98% lightness in light mode), so the backing is invisible against the
 * page and only ever shows as "this control masks what is behind it".
 */

/** Wraps a control (button) in the cluster so it never shows content through. */
export const floatingSlot = "rounded-xl bg-background";

/**
 * Wraps the caption line under the buttons (hint / Art. 50 note). Softer than
 * `floatingSlot`: the same `bg-background/90 backdrop-blur` the other mobile
 * action bars use, so it blends into the page ground at rest and only turns
 * into a readable plate where it happens to float over a card.
 */
export const floatingNote =
  "inline-block rounded-lg bg-background/90 px-2 py-0.5 backdrop-blur-sm";

/**
 * The cluster itself: one fixed row above the bottom nav, no bar behind it.
 *
 * FIXED, not sticky (founder s168): sticky parks the row at the end of the
 * content whenever the page fits the viewport, so it sat at a different height
 * per mode and drifted per task. Fixed pins it at one height for good, and the
 * offsets mirror AppShell's `<main>` so it stays in the content column.
 *
 * PORTALLED to <body> because both the Schreiben and the Bibliothek hubs slide
 * their tab panels with an `x` transform, and a transformed ancestor becomes
 * the containing block for its fixed descendants, which would re-anchor the
 * cluster to the panel mid-slide.
 *
 * The surface that mounts it owes the flow the matching clearance, or its last
 * card ends up underneath the buttons.
 *
 * Since s197 the cluster also brings its own SOFT BOTTOM: a short scrim in the
 * page-ground colour (7rem, `.cluster-scrim`) that dissolves the cards on their
 * way down, plus a 2rem frosted band (`.cluster-blur`) in the strip between the
 * nav and the button's bottom edge, which is where the note line sits. Together
 * they are the mobile answer to the desktop `mask-fade-bottom`: the founder's
 * screenshot was that desktop edge, and a phone had nothing equivalent because
 * it scrolls the page rather than a column. Both layers are
 * `pointer-events-none` and neither carries a border, so the s168 sticky-bar and
 * the s169 blurred-band rejects stay rejected: there is no bar here, only the
 * ground reasserting itself under the controls.
 */
export function FloatingActionCluster({
  children,
  note,
}: {
  children: ReactNode;
  /** The lower line, pinned just above the nav: a disclaimer on Schreiben, the
   *  Feedback link in the Bibliothek. Both sit at the SAME offset. */
  note?: ReactNode;
}) {
  return createPortal(
    <>
      {/* The soft bottom, under everything else in the cluster: the scrim first,
          then the frosted strip on top of it, so the frosting acts on whatever
          the scrim still lets through. Both stop at the nav's top edge. */}
      <div
        aria-hidden
        className="cluster-scrim pointer-events-none fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-20 h-28 lg:hidden"
      />
      <div
        aria-hidden
        className="cluster-blur pointer-events-none fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-20 h-8 lg:hidden"
      />
      <div className="fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom)_+_2rem)] z-30 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:hidden">
        <div className="flex items-stretch justify-center gap-2">{children}</div>
      </div>
      {note && (
        // No `floatingNote` plate here (founder s189): on Schreiben the plate
        // is invisible because the page ground sits behind it, but the
        // Bibliothek's line floats over WHITE cards, where the same
        // `bg-background/90` reads as a frosted chip. Plain text is what the
        // founder is matching. The line used to have no backing at all where it
        // crossed a card, which is what made it hard to read; the scrim + frosted
        // strip above answer that WITHOUT giving the text its own chip, because
        // they belong to the whole bottom of the screen rather than to the line.
        <p className="fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom)_+_0.5rem)] z-[25] text-center text-[11px] leading-snug text-muted-foreground lg:hidden">
          {note}
        </p>
      )}
    </>,
    document.body,
  );
}

/** Flow clearance for a surface that mounts the cluster (mobile only). */
export const CLUSTER_CLEARANCE = "h-20 shrink-0 lg:hidden";
