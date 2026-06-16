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
  // Dashboard / Home — a house (roof + body with a doorway cutout)
  "/": c => (
    <>
      <path d="M10 2.2 1.5 9.3H18.5L10 2.2Z" fill={c} />
      <path d="M3.3 9.3V17.8H7.7V13H12.3V17.8H16.7V9.3Z" fill={c} opacity=".82" />
    </>
  ),
  // Wortschatz — open book
  "/vocabulary": c => (
    <>
      <path d="M10 3.4C7.7 2.4 4.8 2.4 2.4 3.4V16.6c2.4-1 5.3-1 7.6 0V3.4Z" fill={c} />
      <path d="M10 3.4c2.3-1 5.2-1 7.6 0V16.6c-2.4-1-5.3-1-7.6 0V3.4Z" fill={c} opacity=".5" />
      <line x1="4.4" y1="7"  x2="8.2"  y2="7"  stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".75" />
      <line x1="4.4" y1="9.6" x2="8.2" y2="9.6" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55" />
      <line x1="4.4" y1="12.2" x2="7" y2="12.2" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".4" />
    </>
  ),
  // Redemittel — speech bubble with reply dots
  "/redemittel": c => (
    <>
      <path d="M3 5a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 17 5v5a2.5 2.5 0 0 1-2.5 2.5H8l-3.4 3V12.5A2.5 2.5 0 0 1 3 10V5Z" fill={c} />
      <circle cx="6.8" cy="7.5" r="1.05" fill="#fff" opacity=".9" />
      <circle cx="10"  cy="7.5" r="1.05" fill="#fff" opacity=".7" />
      <circle cx="13.2" cy="7.5" r="1.05" fill="#fff" opacity=".5" />
    </>
  ),
  // Grammatik — bookmark with text lines
  "/grammar": c => (
    <>
      <path d="M5.5 2.5h9a1 1 0 0 1 1 1V17.2l-5.5-3.1L4.5 17.2V3.5a1 1 0 0 1 1-1Z" fill={c} />
      <line x1="7.4" y1="6.2" x2="12.6" y2="6.2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
      <line x1="7.4" y1="8.8" x2="11"   y2="8.8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
    </>
  ),
  // Kollokationen — two interlocking rings (combine)
  "/collocations": c => (
    <>
      <circle cx="7.6"  cy="10" r="4.4" stroke={c} strokeWidth="2.3" fill="none" />
      <circle cx="12.4" cy="10" r="4.4" stroke={c} strokeWidth="2.3" fill="none" opacity=".55" />
    </>
  ),
  // Quiz — disc with check
  "/quiz": c => (
    <>
      <circle cx="10" cy="10" r="8.6" fill={c} />
      <polyline points="6,10.5 8.7,13 14,7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  // Schreibtraining — pencil
  "/writing": c => (
    <>
      <path d="M14.7 2.9a1.7 1.7 0 0 1 2.4 2.4L7.5 14.9l-3.4.9.9-3.4 9.7-9.5Z" fill={c} />
      <line x1="13.2" y1="4.4" x2="15.6" y2="6.8" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity=".65" />
    </>
  ),
  // Sprechsimulation — microphone
  "/simulation": c => (
    <>
      <rect x="7.5" y="2.4" width="5" height="9.2" rx="2.5" fill={c} />
      <path d="M5 9.4a5 5 0 0 0 10 0" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".6" />
      <line x1="10" y1="14.4" x2="10" y2="17" stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      <line x1="7.2" y1="17" x2="12.8" y2="17" stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
    </>
  ),
  // Prüfungsmodus — graduation cap
  "/exam": c => (
    <>
      <path d="M10 2.8 1.8 6.4 10 10l8.2-3.6L10 2.8Z" fill={c} />
      <path d="M4.8 8.6v3.4c0 1.5 2.4 2.7 5.2 2.7s5.2-1.2 5.2-2.7V8.6L10 10.9 4.8 8.6Z" fill={c} opacity=".55" />
      <line x1="17.4" y1="6.6" x2="17.4" y2="11.2" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  // Schnellwiederholung — lightning bolt
  "/revision": c => (
    <polygon points="12,2 4.8,11 9.2,11 8,18 15.2,8.6 10.8,8.6" fill={c} />
  ),
  // Fortschritt — bar chart
  "/analytics": c => (
    <>
      <rect x="2.5"  y="11"  width="3.5" height="6.5"  rx="1.2" fill={c} />
      <rect x="8.25" y="7"   width="3.5" height="10.5" rx="1.2" fill={c} opacity=".78" />
      <rect x="14"   y="3"   width="3.5" height="14.5" rx="1.2" fill={c} opacity=".52" />
    </>
  ),
  // Einstellungen — gear
  "/settings": c => (
    <g transform="translate(10 10) scale(0.83) translate(-12 -12)">
      <path
        fill={c}
        fillRule="evenodd"
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z"
      />
    </g>
  ),
};

export function RouteIcon({
  path,
  size = 24,
  active = true,
}: {
  path: string;
  size?: number;
  active?: boolean;
}) {
  const item = navItems.find(i => i.to === path);
  const color = item?.color ?? BRAND;
  const render = RENDERERS[path];

  if (!render) {
    // Safety net: any route without a custom mark falls back to its lucide icon.
    const Icon = item?.icon;
    if (!Icon) return null;
    return <Icon style={{ color, opacity: active ? 1 : 0.38, width: size, height: size }} />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="transition-opacity"
      style={{ opacity: active ? 1 : 0.38 }}
    >
      {render(color)}
    </svg>
  );
}

// The "Mehr" overflow button is not a route, so it gets its own branded mark:
// a 2×2 tile grid (the classic "more / apps" glyph) in the brand indigo.
export const MORE_BRAND = BRAND;

export function MoreIcon({ active = true, size = 24 }: { active?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="transition-opacity"
      style={{ opacity: active ? 1 : 0.38 }}
    >
      <rect x="2"  y="2"  width="7" height="7" rx="1.6" fill={BRAND} />
      <rect x="11" y="2"  width="7" height="7" rx="1.6" fill={BRAND} opacity=".72" />
      <rect x="2"  y="11" width="7" height="7" rx="1.6" fill={BRAND} opacity=".72" />
      <rect x="11" y="11" width="7" height="7" rx="1.6" fill={BRAND} opacity=".45" />
    </svg>
  );
}
