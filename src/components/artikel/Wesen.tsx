import type { Gender } from "./gender";

/**
 * Artikel-Wesen: the three gender creatures (spiky blue = der, round rose =
 * die, boxy green = das) shown beside a noun so gender is redundantly encoded
 * (shape + color + creature identity), never a substitute for the real article
 * text. Follows the `route-icons.tsx` pattern: geometry lives here, colors come
 * from the `--der/--die/--das` tokens so dark mode is automatic.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PLACEHOLDER ART, LOCKED INTERFACE.                                         │
 * │ The `<Wesen gender size title />` prop contract below is WIRED across the  │
 * │ vocab cards / table / list and MUST NOT change. The SVG bodies here are    │
 * │ deliberately plain (wobbly triangle / circle / square). A follow-up        │
 * │ authoring pass (Fable 5, per the s128 plan §6) replaces ONLY the geometry  │
 * │ inside each `case` with the charming full creature: eyes/mouth at the full │
 * │ tier (>= 24px), one deliberate imperfection each, 2px round-cap strokes.   │
 * │ Reference: preview/artikel-visuals/gender-doodles-panel.html (Preview B).  │
 * │ Keep: currentColor-driven fills, the two size tiers, the token colors.     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
export function Wesen({
  gender,
  size = 24,
  title,
  className,
}: {
  gender: Gender;
  /** Rendered box in px. >= 24 draws the full creature; below, a solid shape. */
  size?: number;
  /** Accessible label; omit (or pass "") to render the mark decorative. */
  title?: string;
  className?: string;
}) {
  // Color comes from the gender token, which flips automatically in dark mode.
  const color = `hsl(var(--${gender}))`;
  const full = size >= 24;
  const decorative = !title;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ color, display: "inline-block", flexShrink: 0 }}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {title ? <title>{title}</title> : null}
      {body(gender, full)}
    </svg>
  );
}

/**
 * Placeholder bodies. der = spiky triangle, die = round circle, das = boxy
 * square, each with a soft rounded feel and (at the full tier) two dot eyes.
 * The Fable pass swaps these for the real creatures without touching the props.
 */
function body(gender: Gender, full: boolean) {
  const eyes = full ? (
    <>
      <circle cx="9.5" cy="12" r="1.1" fill="#fff" />
      <circle cx="14.5" cy="12" r="1.1" fill="#fff" />
    </>
  ) : null;

  switch (gender) {
    case "der":
      // Spiky: an upward triangle body.
      return (
        <g fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M12 3.5 20 19.5H4Z" />
          {eyes}
        </g>
      );
    case "die":
      // Round: a soft circle body.
      return (
        <g fill="currentColor" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8.5" />
          {eyes}
        </g>
      );
    case "das":
      // Boxy: a rounded square body.
      return (
        <g fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
          {eyes}
        </g>
      );
  }
}
