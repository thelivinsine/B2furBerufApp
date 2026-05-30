import { useId } from "react";

/**
 * Sprechfit brand mark: a speech bubble (speaking) with an ascending
 * bar motif inside (fitness / progress). Rendered as a white glyph with
 * the bars knocked out, so it sits on the app's accent-gradient tile and
 * lets the gradient show through the bars. Uses `currentColor`, so set the
 * colour via the parent's text colour (white on the gradient tile).
 */
export function Logo({ className }: { className?: string }) {
  const maskId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <mask id={maskId}>
        {/* visible = white */}
        <rect x="6" y="7" width="20" height="12" rx="3.5" fill="white" />
        <path d="M10 19 L10 23 L15 19 Z" fill="white" />
        {/* knocked out = black (ascending bars) */}
        <rect x="10.5" y="12.5" width="2.4" height="3" rx="1" fill="black" />
        <rect x="14" y="11" width="2.4" height="4.5" rx="1" fill="black" />
        <rect x="17.5" y="9.5" width="2.4" height="6" rx="1" fill="black" />
      </mask>
      <g mask={`url(#${maskId})`} fill="currentColor">
        <rect x="6" y="7" width="20" height="12" rx="3.5" />
        <path d="M10 19 L10 23 L15 19 Z" />
      </g>
    </svg>
  );
}
