import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SceneSetting } from "@/types/game";
import amtUrl from "./assets/amt.png";
import wartezimmerUrl from "./assets/wartezimmer.png";
import wohnungUrl from "./assets/wohnung.png";
import strasseUrl from "./assets/strasse.png";
import schmidtUrl from "./assets/schmidt.png";
import playerUrl from "./assets/player.png";

/**
 * The Neuland stage + game-UI atoms (game phase G1), styled to the blessed
 * scene-7 reference (docs/DECISIONS.md "Game art direction"): chunky pixel
 * world under crisp app-language UI (floating rounded cards, pill buttons,
 * thin bars, sentence case), brand indigo as the single loud accent. The
 * game ships LIGHT THEME ONLY in v1 (founder decision, dark mode deferred),
 * so these atoms use fixed light colors on purpose, independent of the app
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
};

/** Character sprites (transparent PNGs) keyed by GameNpc.sprite. */
export const NPC_SPRITES: Record<string, string> = {
  schmidt: schmidtUrl,
};
export const PLAYER_SPRITE = playerUrl;

/** Brand accents, mirroring the scene-7 mockup palette. */
export const GAME_INDIGO = "#5b5be6";
export const GAME_AMBER = "#f3a64a";

export function PixelStage({
  setting,
  children,
  className,
}: {
  setting: SceneSetting;
  children?: ReactNode;
  className?: string;
}) {
  const src = SETTING_ART[setting];
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl", className)}
      style={{ aspectRatio: "3 / 2", backgroundColor: "#e9e5dd" }}
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

/** Floating rounded card, the game's base surface (always light). */
export function GameCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white/95 text-slate-800 shadow-elevated-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Bottom-sheet flavored card: grab handle on top (scene-7 dialogue sheet). */
export function SheetCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <GameCard className={cn("relative pt-4", className)}>
      <div className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-slate-200" />
      {children}
    </GameCard>
  );
}

/** Pill button; primary = filled brand indigo (one loud accent per screen). */
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
        "rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        primary
          ? "bg-[#5b5be6] text-white shadow-soft hover:brightness-110"
          : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Small rounded chip (level badges, move tags). */
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
    indigo: "bg-indigo-50 text-indigo-600",
    slate: "bg-slate-100 text-slate-500",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thin rounded progress bar (Geduld / Mut). */
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
      <span className="w-14 shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
