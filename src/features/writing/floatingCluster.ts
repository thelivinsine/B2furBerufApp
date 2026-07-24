/**
 * Shared class names for the mobile floating action cluster used by Fokus
 * (Korrigieren) and Kurz/Lang (Auswerten).
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
