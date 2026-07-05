import type { ReactNode } from "react";
import type { DomainId, ThemeId } from "@/types";

// ─────────────────────────────────────────────────────────────────────────
// Domain buildings — the seed of the game's city map (redesign Phase 3.1).
//
// Six flat SVG buildings, one per life area the product teaches German for:
// Büro, Bürgeramt, Bank, Arztpraxis, Wohnhaus, Prüfungshalle. Drawn in the
// established route-mark language (see layout/route-icons.tsx): every mark
// is two-tone, a base accent plus a hard-coded brighter neon second tone,
// on a 20×20 grid with optical-size normalisation.
//
// Each building has an UNLIT and a LIT state. Lit swaps the glow elements
// (windows, doors, emblems) to the reward-gold token, which is reserved for
// loot / combo / lit buildings (redesign Phase 2.3) and adapts to dark mode
// via hsl(var(--reward)). Unlit keeps them as quiet white/tint details, so
// an unlit building still looks like a finished mark, just with the lights
// off. Container styling (halo, chip, label) is the call site's job.
//
// Unlike route marks, buildings are normalised to a COMMON GROUND LINE
// instead of a centred box: a city strip needs a shared baseline with a
// varied skyline (the tower may be taller than the bank). Skyline variety
// is deliberate; keep it.
//
// Static review sheet: preview/domain-buildings-preview.svg (regenerate via
// preview/gen-domain-buildings-preview.mjs after any geometry edit; this
// file is the source of truth).
// ─────────────────────────────────────────────────────────────────────────

export type DomainBuildingId =
  | "buero"
  | "buergeramt"
  | "bank"
  | "arztpraxis"
  | "wohnhaus"
  | "pruefungshalle";

export interface DomainBuilding {
  id: DomainBuildingId;
  /** German building name (also the display label). */
  label: string;
  /** Base accent tone of the mark (the neon second tone is per-mark). */
  color: string;
  /**
   * Taxonomy domains whose mastery lights this building (wired in task
   * 3.2). Empty + empty themeIds = a future content pack (banking,
   * housing); the building stays unlit until that pack exists.
   */
  domains: DomainId[];
  /** Theme packs that light this building directly (more precise than a
   *  whole domain, e.g. behoerde inside the broad alltag domain). */
  themeIds: ThemeId[];
}

export const DOMAIN_BUILDINGS: DomainBuilding[] = [
  { id: "buero", label: "Büro", color: "#5b5be6", domains: ["beruf", "arbeitswelt"], themeIds: [] },
  { id: "buergeramt", label: "Bürgeramt", color: "#64748b", domains: [], themeIds: ["behoerde"] },
  { id: "bank", label: "Bank", color: "#0ea5e9", domains: [], themeIds: [] },
  { id: "arztpraxis", label: "Arztpraxis", color: "#e11d48", domains: ["gesundheit"], themeIds: [] },
  { id: "wohnhaus", label: "Wohnhaus", color: "#0d9488", domains: [], themeIds: [] },
  { id: "pruefungshalle", label: "Prüfungshalle", color: "#c026d3", domains: ["pruefung", "bildung"], themeIds: [] },
];

export const domainBuildingById = (id: DomainBuildingId) =>
  DOMAIN_BUILDINGS.find(b => b.id === id)!;

/** Reward-gold token (Phase 2.3); adapts to dark mode via the CSS var. */
const REWARD = "hsl(var(--reward))";

/** Fill props for a glow element (window/door/emblem): quiet white detail
 *  when unlit, full reward-gold when lit. */
const glow = (lit: boolean, unlitOpacity: number) =>
  lit ? { fill: REWARD } : { fill: "#fff", opacity: unlitOpacity };

type Render = (c: string, lit: boolean) => ReactNode;

const RENDERERS: Record<DomainBuildingId, Render> = {
  // Büro — indigo office tower with a neon-cyan annex; a window grid glows.
  buero: (c, lit) => (
    <>
      <rect x="3.4" y="2.6" width="9.2" height="14.6" rx="0.9" fill={c} />
      <rect x="12.6" y="8.6" width="4.8" height="8.6" rx="0.9" fill="#22d3ee" />
      {[4.6, 7.5, 10.4, 13.3].map(y => (
        <g key={y}>
          <rect x="5.2" y={y} width="2.1" height="1.7" rx="0.3" {...glow(lit, 0.5)} />
          <rect x="8.6" y={y} width="2.1" height="1.7" rx="0.3" {...glow(lit, 0.5)} />
        </g>
      ))}
      <rect x="14" y="10.6" width="2.1" height="1.7" rx="0.3" {...glow(lit, 0.8)} />
      <rect x="14" y="13.5" width="2.1" height="1.7" rx="0.3" {...glow(lit, 0.8)} />
    </>
  ),
  // Bürgeramt — civic slate colonnade under a neon-amber pediment; light
  // pours through the colonnade gaps when lit.
  buergeramt: (c, lit) => (
    <>
      <path d="M10 2 2.4 7.2H17.6L10 2Z" fill="#fbbf24" />
      <circle cx="10" cy="5.5" r="0.9" fill="#fff" opacity="0.75" />
      <rect x="3.2" y="7.2" width="13.6" height="1.4" rx="0.3" fill={c} />
      {[5.8, 9.2, 12.6].map(x =>
        lit ? (
          <rect key={x} x={x} y="8.6" width="1.6" height="6.9" fill={REWARD} />
        ) : (
          <rect key={x} x={x} y="8.6" width="1.6" height="6.9" fill={c} opacity="0.28" />
        )
      )}
      {[4.0, 7.4, 10.8, 14.2].map(x => (
        <rect key={x} x={x} y="8.6" width="1.8" height="6.9" fill={c} />
      ))}
      <rect x="2.4" y="15.5" width="15.2" height="1.7" rx="0.4" fill={c} />
    </>
  ),
  // Bank — sky-blue block with a neon-cyan cornice; the coin-ring emblem
  // turns gold when lit.
  bank: (c, lit) => (
    <>
      <rect x="2.4" y="4.8" width="15.2" height="1.7" rx="0.5" fill="#67e8f9" />
      <rect x="3.2" y="6.5" width="13.6" height="9.2" fill={c} />
      <rect x="2.6" y="15.7" width="14.8" height="1.5" rx="0.4" fill={c} opacity="0.85" />
      {lit ? (
        <circle cx="10" cy="9.7" r="1.7" fill="none" strokeWidth="1.25" stroke={REWARD} />
      ) : (
        <circle cx="10" cy="9.7" r="1.7" fill="none" strokeWidth="1.25" stroke="#fff" opacity="0.85" />
      )}
      <rect x="8.9" y="13.6" width="2.2" height="2.1" {...glow(lit, 0.5)} />
      <rect x="4.6" y="12.4" width="1.9" height="1.9" rx="0.3" {...glow(lit, 0.5)} />
      <rect x="13.5" y="12.4" width="1.9" height="1.9" rx="0.3" {...glow(lit, 0.5)} />
    </>
  ),
  // Arztpraxis — rose clinic with a neon roofband; the white cross sign
  // glows gold when lit (like a pharmacy sign at night).
  arztpraxis: (c, lit) => (
    <>
      <rect x="2.6" y="5" width="14.8" height="1.7" rx="0.5" fill="#fb7185" />
      <rect x="3.4" y="6.7" width="13.2" height="10.5" fill={c} />
      <rect x="8.8" y="7.7" width="2.4" height="5.8" rx="0.4" {...glow(lit, 0.95)} />
      <rect x="7.1" y="9.4" width="5.8" height="2.4" rx="0.4" {...glow(lit, 0.95)} />
      <rect x="9.1" y="14.2" width="1.8" height="3" {...glow(lit, 0.55)} />
      <rect x="4.8" y="14.2" width="2" height="1.9" rx="0.3" {...glow(lit, 0.5)} />
      <rect x="13.2" y="14.2" width="2" height="1.9" rx="0.3" {...glow(lit, 0.5)} />
    </>
  ),
  // Wohnhaus — teal house with a neon roof and chimney; two windows and the
  // front door glow. (Inverted tone order vs the Home route mark so the two
  // house glyphs stay distinct.)
  wohnhaus: (c, lit) => (
    <>
      <rect x="13.4" y="3.6" width="1.9" height="3.4" fill={c} />
      <path d="M10 2.2 2.6 8.4H17.4L10 2.2Z" fill="#5eead4" />
      <rect x="4" y="8.4" width="12" height="8.8" fill={c} />
      <rect x="5.6" y="10" width="2.3" height="2.3" rx="0.3" {...glow(lit, 0.55)} />
      <rect x="12.1" y="10" width="2.3" height="2.3" rx="0.3" {...glow(lit, 0.55)} />
      <rect x="8.8" y="12.9" width="2.4" height="4.3" {...glow(lit, 0.55)} />
    </>
  ),
  // Prüfungshalle — fuchsia dome hall with a neon entablature; the clock
  // and the three entrance arches glow.
  pruefungshalle: (c, lit) => (
    <>
      <path d="M2.8 9.6a7.2 7.2 0 0 1 14.4 0Z" fill={c} />
      <rect x="2.2" y="9.6" width="15.6" height="1.5" rx="0.4" fill="#f0abfc" />
      <rect x="3" y="11.1" width="14" height="6.1" fill={c} opacity="0.85" />
      <circle cx="10" cy="6.4" r="1.8" {...glow(lit, 0.85)} />
      <path d="M4.9 17.2v-2.2a1.1 1.1 0 0 1 2.2 0v2.2Z" {...glow(lit, 0.5)} />
      <path d="M8.9 17.2v-2.2a1.1 1.1 0 0 1 2.2 0v2.2Z" {...glow(lit, 0.5)} />
      <path d="M12.9 17.2v-2.2a1.1 1.1 0 0 1 2.2 0v2.2Z" {...glow(lit, 0.5)} />
    </>
  ),
};

// ── Optical size normalisation (ground-aligned) ──────────────────────────
// Same idea as route-icons.tsx (bounding box + per-mark weight), but marks
// are anchored to a shared ground line rather than centred, so a row of
// buildings sits on one street level with a varied skyline.
const TARGET = 16; // max mark dimension after scaling, on the 20-unit grid
const GROUND_SRC = 17.2; // every mark's ground line in its own coordinates
const GROUND_DST = 18; // where that ground line lands on the 20-unit grid

// [x, y, w, h] bounding box of each mark's inked area, plus optical weight.
const NORM: Record<DomainBuildingId, { box: [number, number, number, number]; weight: number }> = {
  buero: { box: [3.4, 2.6, 14, 14.6], weight: 1.0 },
  buergeramt: { box: [2.4, 2, 15.2, 15.2], weight: 0.98 },
  bank: { box: [2.4, 4.8, 15.2, 12.4], weight: 0.96 },
  arztpraxis: { box: [2.6, 5, 14.8, 12.2], weight: 0.96 },
  wohnhaus: { box: [2.6, 2.2, 14.8, 15], weight: 1.0 },
  pruefungshalle: { box: [2.2, 2.4, 15.6, 14.8], weight: 0.98 },
};

function groundTransform(box: [number, number, number, number], weight: number): string {
  const [x, , w, h] = box;
  const s = (TARGET * weight) / Math.max(w, h);
  const cx = x + w / 2;
  return `translate(10 ${GROUND_DST}) scale(${s.toFixed(4)}) translate(${(-cx).toFixed(4)} ${-GROUND_SRC})`;
}

export function DomainBuildingIcon({
  id,
  lit = false,
  size = 56,
}: {
  id: DomainBuildingId;
  /** Lit = mastered/earned: glow elements render in reward gold. */
  lit?: boolean;
  size?: number;
}) {
  const building = domainBuildingById(id);
  const norm = NORM[id];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <g transform={groundTransform(norm.box, norm.weight)}>
        {RENDERERS[id](building.color, lit)}
      </g>
    </svg>
  );
}
