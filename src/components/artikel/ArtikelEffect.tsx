import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Gender } from "./gender";

/**
 * The gender answer-reveal effect that plays behind a noun's flip / correct
 * answer (Artikel-Visuals, s128 plan; geometry from the founder-picked
 * Preview D): der BURSTS (8 rays fly outward), die BLOOMS (3 staggered
 * expanding rings), das SHATTERS (6 spinning shards). This is where the
 * research says the memorable moment belongs (retrieval, not browse), so it
 * is short (~500ms after a flip-sync delay), quiet, and fires on every reveal.
 *
 * Contract (wired into the vocab card back face, and in Phase 3 the session
 * grade path): `play` is a numeric trigger; increment it to (re)play. The
 * `key={play}` remount restarts the CSS animations, which live in
 * src/index.css (`.artikel-fx-*`). All elements carry a 200ms delay so the
 * effect is still mid-flight once the card flip makes the back face visible.
 *
 * Reduced-motion users get a brief gender-tinted glow that only fades
 * (opacity, no transforms).
 */
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const RING_DELAYS = ["200ms", "310ms", "420ms"];

/** Shard trajectories: spread on all sides, varied spin, no two symmetric. */
const SHARDS: { dx: number; dy: number; rot: number }[] = [
  { dx: -46, dy: -30, rot: -80 },
  { dx: 44, dy: -34, rot: 70 },
  { dx: -52, dy: 18, rot: -140 },
  { dx: 50, dy: 22, rot: 120 },
  { dx: -18, dy: -50, rot: -40 },
  { dx: 20, dy: 46, rot: 160 },
];

export function ArtikelEffect({
  gender,
  play,
  className,
}: {
  gender: Gender;
  /** Increment to (re)play. `0`/unchanged = idle. */
  play: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  // Idle before the first play, so an un-flipped card renders nothing.
  if (!play) return null;

  return (
    <span key={play} aria-hidden className={cn("artikel-fx", className)}>
      {reduce ? (
        <span
          className="artikel-fx-tint"
          style={{
            background: `radial-gradient(circle at 50% 42%, hsl(var(--${gender}-bg)), transparent 70%)`,
          }}
        />
      ) : gender === "der" ? (
        RAY_ANGLES.map((a) => (
          <span
            key={a}
            className="artikel-fx-ray"
            style={{ "--a": `${a}deg` } as CSSProperties}
          />
        ))
      ) : gender === "die" ? (
        RING_DELAYS.map((d) => (
          <span
            key={d}
            className="artikel-fx-ring"
            style={{ "--d": d } as CSSProperties}
          />
        ))
      ) : (
        SHARDS.map((s, i) => (
          <span
            key={i}
            className="artikel-fx-shard"
            style={{ "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, "--rot": `${s.rot}deg` } as CSSProperties}
          />
        ))
      )}
    </span>
  );
}
