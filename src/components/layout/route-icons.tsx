import { navItems } from "./nav-items";

// ─────────────────────────────────────────────────────────────────────────
// Custom branded route icons.
//
// One hand-drawn SVG per route, all on a 20×20 grid in a single cohesive
// style: a filled mark in the route's unique accent colour, with lighter
// layers built from opacity of that same colour. This registry is the ONE
// source for a route's icon, so the SAME mark renders everywhere it appears
// (bottom tab bar, More sheet, desktop sidebar). Active vs inactive is just
// the root opacity.
// ─────────────────────────────────────────────────────────────────────────

const BRAND = "#5b5be6";

type Render = (c: string) => React.ReactNode;

const RENDERERS: Record<string, Render> = {
  // Dashboard / Home — a house (indigo roof + neon-cyan body)
  "/": c => (
    <>
      <path d="M10 2.2 1.5 9.3H18.5L10 2.2Z" fill={c} />
      <path d="M3.3 9.3V17.8H7.7V13H12.3V17.8H16.7V9.3Z" fill="#22d3ee" />
    </>
  ),
  // Wortschatz — two-tone open book (indigo spine + cyan right page), matching
  // the F2 "Per-section Color" preview. This is the one icon that intentionally
  // uses two distinct hues rather than opacity layers of a single accent, so it
  // ignores the route accent `c`.
  "/vocabulary": () => (
    <>
      <path d="M10 3.4C7.7 2.4 4.8 2.4 2.4 3.4V16.6c2.4-1 5.3-1 7.6 0V3.4Z" fill="#5b5be6" />
      <path d="M10 3.4c2.3-1 5.2-1 7.6 0V16.6c-2.4-1-5.3-1-7.6 0V3.4Z" fill="#10b7cf" />
      <line x1="4.4"  y1="7"   x2="8.2"  y2="7"   stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".7" />
      <line x1="4.4"  y1="9.6" x2="8.2"  y2="9.6" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".5" />
      <line x1="11.8" y1="7"   x2="15.6" y2="7"   stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".5" />
      <line x1="11.8" y1="9.6" x2="15.6" y2="9.6" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".35" />
    </>
  ),
  // Redemittel — speech bubble with neon-magenta reply dots
  "/redemittel": c => (
    <>
      <path d="M3 5a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 17 5v5a2.5 2.5 0 0 1-2.5 2.5H8l-3.4 3V12.5A2.5 2.5 0 0 1 3 10V5Z" fill={c} />
      <circle cx="6.8" cy="7.5" r="1.15" fill="#e879f9" />
      <circle cx="10"  cy="7.5" r="1.15" fill="#e879f9" />
      <circle cx="13.2" cy="7.5" r="1.15" fill="#e879f9" />
    </>
  ),
  // Grammatik — bookmark split into emerald + neon-lime halves
  "/grammar": c => (
    <>
      <path d="M5.5 2.5h9a1 1 0 0 1 1 1V17.2l-5.5-3.1L4.5 17.2V3.5a1 1 0 0 1 1-1Z" fill={c} />
      <path d="M10 2.5h4.5a1 1 0 0 1 1 1V17.2L10 14.1V2.5Z" fill="#a3e635" />
    </>
  ),
  // Kollokationen — two interlocking rings (amber + neon-yellow)
  "/collocations": c => (
    <>
      <circle cx="7.6"  cy="10" r="4.4" stroke={c} strokeWidth="2.3" fill="none" />
      <circle cx="12.4" cy="10" r="4.4" stroke="#fde047" strokeWidth="2.3" fill="none" />
    </>
  ),
  // Quiz — disc with neon-yellow check
  "/quiz": c => (
    <>
      <circle cx="10" cy="10" r="8.6" fill={c} />
      <polyline points="6,10.5 8.7,13 14,7" stroke="#fde047" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  // Schreibtraining — pencil (red body + neon-pink tip)
  "/writing": c => (
    <>
      <path d="M14.7 2.9a1.7 1.7 0 0 1 2.4 2.4L7.5 14.9l-3.4.9.9-3.4 9.7-9.5Z" fill={c} />
      <path d="M4.1 15.8l.9-3.4 2.5 2.5-3.4.9Z" fill="#fb7185" />
    </>
  ),
  // Sprechsimulation — microphone (cyan capsule + neon-teal stand)
  "/simulation": c => (
    <>
      <rect x="7.5" y="2.4" width="5" height="9.2" rx="2.5" fill={c} />
      <path d="M5 9.4a5 5 0 0 0 10 0" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <line x1="10" y1="14.4" x2="10" y2="17" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7.2" y1="17" x2="12.8" y2="17" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  // Prüfungsmodus — graduation cap (fuchsia top + neon-pink base)
  "/exam": c => (
    <>
      <path d="M10 2.8 1.8 6.4 10 10l8.2-3.6L10 2.8Z" fill={c} />
      <path d="M4.8 8.6v3.4c0 1.5 2.4 2.7 5.2 2.7s5.2-1.2 5.2-2.7V8.6L10 10.9 4.8 8.6Z" fill="#f0abfc" />
      <line x1="17.4" y1="6.6" x2="17.4" y2="11.2" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  // Schnellwiederholung — lightning bolt (amber-yellow top, neon-yellow lower)
  "/revision": c => (
    <>
      <polygon points="12,2 4.8,11 9.2,11 8,18 15.2,8.6 10.8,8.6" fill={c} />
      <polygon points="9.2,11 8,18 15.2,8.6 10.8,8.6" fill="#fde047" />
    </>
  ),
  // Fortschritt — bar chart (sky base rising into neon cyan)
  "/analytics": c => (
    <>
      <rect x="2.5"  y="11"  width="3.5" height="6.5"  rx="1.2" fill={c} />
      <rect x="8.25" y="7"   width="3.5" height="10.5" rx="1.2" fill="#22d3ee" />
      <rect x="14"   y="3"   width="3.5" height="14.5" rx="1.2" fill="#67e8f9" />
    </>
  ),
  // Einstellungen — gear (slate ring + neon-blue centre)
  "/settings": c => (
    <>
      <g transform="translate(10 10) scale(0.83) translate(-12 -12)">
        <path
          fill={c}
          fillRule="evenodd"
          d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
        />
      </g>
      <circle cx="10" cy="10" r="2.6" fill="#38bdf8" />
    </>
  ),
};

// ── Optical size normalisation ───────────────────────────────────────────
// Each mark is drawn freehand on the 20×20 grid, so its actual inked area
// differs (a filled disc spans ~17px, a speech bubble ~13px). Left as-is they
// look like different sizes. We scale every mark so its bounding box fits a
// common target, centred in the grid, with a per-mark weight so visually heavy
// shapes (filled discs) don't read larger than airy ones.
const TARGET = 16; // content fits a centred 16×16 area of the 20-unit grid

// [x, y, w, h] bounding box of each mark's inked area, plus an optical weight.
const NORM: Record<string, { box: [number, number, number, number]; weight: number }> = {
  "/":             { box: [1.5, 2.2, 17, 15.6],     weight: 1.07 },
  "/vocabulary":   { box: [2.4, 2.4, 15.2, 15.2],   weight: 1.05 },
  "/redemittel":   { box: [3, 2.5, 14, 13],         weight: 1.05 },
  "/grammar":      { box: [4.5, 2.5, 11, 14.7],     weight: 1.08 },
  "/collocations": { box: [2.05, 4.45, 15.9, 11.1], weight: 1.05 },
  "/quiz":         { box: [1.4, 1.4, 17.2, 17.2],   weight: 0.92 },
  "/writing":      { box: [3.5, 2.9, 13.6, 12.9],   weight: 1.04 },
  "/simulation":   { box: [4.2, 1.6, 11.6, 16.2],   weight: 1.05 },
  "/exam":         { box: [1.8, 2.8, 16.4, 11.9],   weight: 1.08 },
  "/revision":     { box: [4.8, 2, 10.4, 16],       weight: 1.0 },
  "/analytics":    { box: [2.5, 3, 15, 14.5],       weight: 1.08 },
  "/settings":     { box: [2.31, 2.31, 15.38, 15.38], weight: 1.01 },
};

function normTransform(box: [number, number, number, number], weight: number): string {
  const [x, y, w, h] = box;
  const s = (TARGET * weight) / Math.max(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `translate(10 10) scale(${s.toFixed(4)}) translate(${(-cx).toFixed(4)} ${(-cy).toFixed(4)})`;
}

export function RouteIcon({
  path,
  size = 24,
}: {
  path: string;
  size?: number;
  // Accepted for call-site compatibility but no longer dims the icon: every
  // icon renders at full opacity. The active tab is marked by its background
  // pill + underline (bar), highlight (More sheet) or row styling (sidebar).
  active?: boolean;
}) {
  const item = navItems.find(i => i.to === path);
  const color = item?.color ?? BRAND;
  const render = RENDERERS[path];

  if (!render) {
    // Safety net: any route without a custom mark falls back to its lucide icon.
    const Icon = item?.icon;
    if (!Icon) return null;
    return <Icon style={{ color, width: size, height: size }} />;
  }

  const norm = NORM[path];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {norm ? <g transform={normTransform(norm.box, norm.weight)}>{render(color)}</g> : render(color)}
    </svg>
  );
}

// The "Mehr" overflow button is not a route, so it gets its own branded mark:
// a 2×2 tile grid (the classic "more / apps" glyph) in the brand indigo.
export const MORE_BRAND = BRAND;

export function MoreIcon({ size = 24 }: { active?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <g transform={normTransform([2, 2, 16, 16], 1.0)}>
        <rect x="2"  y="2"  width="7" height="7" rx="1.6" fill={BRAND} />
        <rect x="11" y="2"  width="7" height="7" rx="1.6" fill={BRAND} opacity=".72" />
        <rect x="2"  y="11" width="7" height="7" rx="1.6" fill={BRAND} opacity=".72" />
        <rect x="11" y="11" width="7" height="7" rx="1.6" fill={BRAND} opacity=".45" />
      </g>
    </svg>
  );
}
