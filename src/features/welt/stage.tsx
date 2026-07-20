import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SceneSetting } from "@/types/game";
import amtUrl from "./assets/amt.png";
import wartezimmerUrl from "./assets/wartezimmer.png";
import wohnungUrl from "./assets/wohnung.png";
import strasseUrl from "./assets/strasse.png";
import terminalUrl from "./assets/terminal.png";
import ladenUrl from "./assets/laden.png";
import schmidtUrl from "./assets/schmidt.png";
import beamterUrl from "./assets/beamter.png";
import miloUrl from "./assets/milo.png";
import kassiererinUrl from "./assets/kassiererin.png";
import brandtUrl from "./assets/brandt.png";
import jonasUrl from "./assets/jonas.png";
import playerUrl from "./assets/player.png";
import bagUrl from "./assets/bag.png";
import dictUrl from "./assets/dict.png";
import docAusweisUrl from "./assets/doc-ausweis.png";
import docVertragUrl from "./assets/doc-vertrag.png";
import docWgbUrl from "./assets/doc-wgb.png";

/**
 * The Neuland stage + game-UI atoms (game G1; pixel-UI pass s74). The founder
 * ruled that the app-language cards over the pixel world read as a patchwork,
 * so every in-game surface now speaks the pixel language itself: chunky
 * outlined panels (the sprite outline color), hard offset shadows instead of
 * soft blurs, near-square corners, flat fills. Brand indigo stays the single
 * loud accent. The game ships LIGHT THEME ONLY in v1 (founder decision), so
 * these atoms use fixed light colors on purpose, independent of the app
 * theme. Placeholder art is code-authored (preview/game-pixel-mockups/
 * welt_assets.py); G2 swaps in licensed packs, the components do not care.
 */

/** World backdrop per scene setting; null renders the neutral paper stage. */
const SETTING_ART: Record<SceneSetting, string | null> = {
  website: null,
  wohnung: wohnungUrl,
  strasse: strasseUrl,
  wartezimmer: wartezimmerUrl,
  amt: amtUrl,
  terminal: terminalUrl,
  laden: ladenUrl,
};

/** Where-am-I caption per setting, shown as a chip on the stage. */
const SETTING_LABEL: Record<SceneSetting, string | null> = {
  website: null,
  wohnung: "Deine Wohnung",
  strasse: "Neustadt",
  wartezimmer: "Bürgeramt · Wartezimmer",
  amt: "Bürgeramt · Schalter 2",
  terminal: "Bahnhof",
  laden: "Geschäft",
};

/** Character sprites (transparent PNGs) keyed by GameNpc.sprite. */
export const NPC_SPRITES: Record<string, string> = {
  schmidt: schmidtUrl,
  beamter: beamterUrl,
  milo: miloUrl,
  kassiererin: kassiererinUrl,
  brandt: brandtUrl,
  jonas: jonasUrl,
};
export const PLAYER_SPRITE = playerUrl;
export const BAG_SPRITE = bagUrl;
export const DICT_SPRITE = dictUrl;

/** Pixel document icons for bag/loadout items, keyed by key-item id. */
export const DOC_ICONS: Record<string, string> = {
  ki_personalausweis: docAusweisUrl,
  ki_mietvertrag: docVertragUrl,
  ki_wohnungsgeberbestaetigung: docWgbUrl,
};
export const DOC_ICON_FALLBACK = docVertragUrl;

/** Brand accents, mirroring the scene-7 mockup palette. */
export const GAME_BLUE = "#3D74ED"; // Nachtblau (brand primary)
export const GAME_AMBER = "#f3a64a";
/** The sprite outline color: every pixel panel borders in it. */
export const GAME_OUT = "#463c44";
/** The dark surround of the full-screen game layer. */
export const GAME_BG = "#26232c";

/** Hard offset shadow (no blur): the pixel-UI replacement for elevation. */
const HARD_SHADOW = "shadow-[0_3px_0_rgba(70,60,68,0.30)]";

export function PixelStage({
  setting,
  children,
  className,
  label,
  themed,
}: {
  setting: SceneSetting;
  children?: ReactNode;
  className?: string;
  /** Override the where-am-I chip; pass null to hide it. */
  label?: string | null;
  /**
   * App-theme aware (hub surfaces only, NOT in-mission scenes which are
   * light-only): darkens the paper base and dims the bright daytime backdrop
   * art in dark mode so it doesn't glare against the app shell.
   */
  themed?: boolean;
}) {
  const src = SETTING_ART[setting];
  const caption = label === undefined ? SETTING_LABEL[setting] : label;
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        themed && "bg-[#e9e5dd] dark:bg-[#1b1f28]",
        className,
      )}
      style={{ aspectRatio: "3 / 2", ...(themed ? {} : { backgroundColor: "#e9e5dd" }) }}
    >
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      {themed && (
        <div className="pointer-events-none absolute inset-0 hidden bg-[#0b1220]/20 dark:block" />
      )}
      {caption && (
        <span
          className="absolute right-2 top-2 border-2 bg-white/95 px-2 py-0.5 text-[11px] font-bold text-slate-600"
          style={{ borderColor: GAME_OUT, borderRadius: 4 }}
        >
          {caption}
        </span>
      )}
      {children}
    </div>
  );
}

/** A character sprite positioned on the stage in world percentages. */
export function StageSprite({
  src,
  x,
  y,
  w,
  className,
}: {
  src: string;
  /** Left edge, percent of stage width. */
  x: number;
  /** Top edge, percent of stage height. */
  y: number;
  /** Width, percent of stage width. */
  w: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={cn("pointer-events-none absolute select-none", className)}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, imageRendering: "pixelated" }}
    />
  );
}

/** Outlined pixel panel, the game's base surface (always light). */
export function GameCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-md border-2 bg-[#fdfcf8] text-slate-800", HARD_SHADOW, className)}
      style={{ borderColor: GAME_OUT }}
    >
      {children}
    </div>
  );
}

/**
 * The RPG dialogue box: a pixel panel with an optional name plate sitting on
 * its top border (replaces the old bottom-sheet look).
 */
export function SheetCard({
  children,
  className,
  name,
}: {
  children: ReactNode;
  className?: string;
  /** Speaker plate on the box edge ("Frau Schmidt"). */
  name?: string;
}) {
  return (
    <div className="relative">
      {name && (
        <span
          className="absolute -top-3 left-3 z-10 border-2 bg-[#3D74ED] px-2 py-0.5 text-xs font-bold text-white"
          style={{ borderColor: GAME_OUT, borderRadius: 4 }}
        >
          {name}
        </span>
      )}
      <GameCard className={cn(name && "pt-4", className)}>{children}</GameCard>
    </div>
  );
}

/** Pixel button; primary = filled Nachtblau (one loud accent per screen). */
export function Pill({
  children,
  onClick,
  primary,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border-2 px-4 py-2 text-sm font-semibold transition-all",
        HARD_SHADOW,
        "active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50",
        primary ? "bg-[#3D74ED] text-white" : "bg-[#fdfcf8] text-slate-700",
        className,
      )}
      style={{ borderColor: GAME_OUT }}
    >
      {children}
    </button>
  );
}

/** Small outlined chip (level badges, move tags). */
export function Chip({
  children,
  tone = "indigo",
  className,
}: {
  children: ReactNode;
  tone?: "indigo" | "slate" | "teal" | "amber";
  className?: string;
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    slate: "bg-slate-100 text-slate-600",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 text-xs font-bold",
        tones[tone],
        className,
      )}
      style={{ borderColor: `${GAME_OUT}55`, borderRadius: 4 }}
    >
      {children}
    </span>
  );
}

/** Chunky outlined progress bar (Geduld / Mut). */
export function Meter({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs font-bold text-slate-500">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-2.5 flex-1 overflow-hidden border-2 bg-slate-100"
        style={{ borderColor: GAME_OUT, borderRadius: 5 }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, borderRadius: 2 }}
        />
      </div>
    </div>
  );
}

/**
 * A bilingual game line. German always shows; English only while the
 * Wörterbuch is active for the current scene (founder direction s74:
 * translation is a limited bag resource, not an always-on button).
 */
export function GameText({
  de,
  en,
  translate,
  className,
}: {
  de: string;
  en: string;
  translate: boolean;
  className?: string;
}) {
  return (
    <span className={className}>
      {de}
      {translate && (
        <span className="mt-0.5 block text-xs font-normal leading-snug text-teal-700/90">{en}</span>
      )}
    </span>
  );
}
