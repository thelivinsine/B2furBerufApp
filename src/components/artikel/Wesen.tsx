import type { Gender } from "./gender";

/**
 * Artikel-Wesen: the three gender creatures (spiky blue = der, round rose =
 * die, boxy green = das) shown beside a noun so gender is redundantly encoded
 * (shape + color + creature identity), never a substitute for the real article
 * text. Follows the `route-icons.tsx` pattern: geometry lives here, colors come
 * from the `--der/--die/--das` tokens so dark mode is automatic.
 *
 * Geometry is the founder-picked Preview B in
 * `preview/artikel-visuals/gender-doodles-panel.html`, redrawn at a 24-unit
 * viewBox: wobbly hand-drawn bodies (tinted `-bg` fill + gender-color stroke,
 * round caps/joins), dot eyes, a per-creature mouth, and ONE deliberate
 * imperfection each. der = spiky triangle with a little sprout on the apex and
 * a small smile; die = round with an unclosed outline (the gap at the top) and
 * an eyelash flick, the widest smile; das = boxy with two stray hairs and a
 * calm straight mouth. No human features, ever: gender is a property of the
 * word, not the referent (das Mädchen, die Person, der Gast).
 *
 * Two rendering tiers, per the plan: the full creature at >= 24px, and below
 * that a simplified solid shape (Preview A's 16px stop) so table/list rows get
 * a crisp mark instead of illegible eye-dots.
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
  const full = size >= 24;
  const decorative = !title;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: "inline-block", flexShrink: 0 }}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {title ? <title>{title}</title> : null}
      {full ? <FullWesen gender={gender} /> : <SmallMark gender={gender} />}
    </svg>
  );
}

/** Full-creature tier (>= 24px): tinted body, eyes, mouth, one imperfection. */
function FullWesen({ gender }: { gender: Gender }) {
  const c = `hsl(var(--${gender}))`;
  const bg = `hsl(var(--${gender}-bg))`;
  const stroke = {
    stroke: c,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  switch (gender) {
    case "der":
      // Spiky: a wobbly triangle, sprout on the apex, small smile.
      return (
        <g>
          <path
            d="M12 4.7 Q12.6 4.7 13.2 5.9 L20.2 18.7 Q21 20.2 19.2 20.25 L4.9 20.55 Q3.1 20.55 3.9 18.95 L10.8 5.9 Q11.4 4.7 12 4.7 Z"
            {...stroke}
            fill={bg}
          />
          <path d="M12 4.7 L12 2.5 M12 2.5 Q13.4 1.8 13.8 3" {...stroke} />
          <circle cx="10.1" cy="14.7" r="0.95" fill={c} />
          <circle cx="13.9" cy="14.7" r="0.95" fill={c} />
          <path d="M10.4 17.2 Q12 18.35 13.6 17.2" {...stroke} strokeWidth={1.5} />
        </g>
      );
    case "die":
      // Round: an unclosed wobbly circle (gap at the top), eyelash flick,
      // the widest smile of the three.
      return (
        <g>
          <path
            d="M12 3.5 Q20.4 3.1 20.9 12 Q21.4 20.6 12.2 21 Q3.3 21.4 3.05 12.2 Q2.85 4.5 10.2 3.65"
            {...stroke}
            fill={bg}
          />
          <path d="M16.7 4.3 Q18 2.3 19.4 3.7" {...stroke} strokeWidth={1.5} />
          <circle cx="9.6" cy="11.6" r="0.95" fill={c} />
          <circle cx="14.4" cy="11.6" r="0.95" fill={c} />
          <path d="M9.4 15 Q12 16.9 14.6 15" {...stroke} strokeWidth={1.5} />
        </g>
      );
    case "das":
      // Boxy: a wobbly rounded square, two stray hairs, calm straight mouth.
      return (
        <g>
          <path
            d="M6.1 5.7 L18.4 5.2 Q19.7 5.2 19.7 6.5 L19.3 18.4 Q19.3 19.7 17.9 19.7 L6.6 20.1 Q5.3 20.1 5.3 18.8 L5.6 6.8 Q5.6 5.7 6.1 5.7 Z"
            {...stroke}
            fill={bg}
          />
          <path d="M8.7 5.5 L7.3 3.5 M15.3 5.3 L16.7 3.2" {...stroke} strokeWidth={1.5} />
          <circle cx="9.6" cy="12.1" r="0.95" fill={c} />
          <circle cx="14.4" cy="12.1" r="0.95" fill={c} />
          <path d="M9.9 15.6 L14.1 15.6" {...stroke} strokeWidth={1.5} />
        </g>
      );
  }
}

/**
 * Small tier (< 24px, table/list rows): a solid shape in the gender color.
 * The soft stroke on its own fill rounds the corners so the tiny mark keeps
 * the hand-drawn warmth instead of reading as a hard geometric glyph.
 */
function SmallMark({ gender }: { gender: Gender }) {
  const c = `hsl(var(--${gender}))`;
  const soft = { fill: c, stroke: c, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (gender) {
    case "der":
      return <path d="M12 4 L20.6 20 H3.4 Z" {...soft} />;
    case "die":
      return <circle cx="12" cy="12" r="8.6" fill={c} />;
    case "das":
      return <rect x="4.4" y="4.4" width="15.2" height="15.2" rx="2.6" {...soft} />;
  }
}
