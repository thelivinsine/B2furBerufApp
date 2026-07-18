import { useReducedMotion } from "framer-motion";
import type { Gender } from "./gender";

/**
 * The gender answer-reveal effect that plays behind a noun's flip / correct
 * answer (der bursts, die blooms, das shatters). This is where the research
 * says the memorable moment belongs (retrieval, not browse), so it is short
 * (~500ms), quiet, and fires on every reveal.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PLACEHOLDER EFFECT, LOCKED INTERFACE.                                      │
 * │ The `<ArtikelEffect gender play className />` contract is WIRED into the   │
 * │ vocab card back face (and, in Phase 3, the session grade path) and MUST    │
 * │ NOT change. `play` is a numeric trigger: increment it to (re)play; the     │
 * │ `key={play}` remount restarts the CSS animation. The keyframes live in     │
 * │ src/index.css (`.artikel-effect--{der,die,das}`); a follow-up authoring    │
 * │ pass (Fable 5, plan §6) replaces the keyframe bodies + the placeholder     │
 * │ shape below with the real burst / bloom / shatter art, without renaming    │
 * │ the classes or changing these props. Reference:                           │
 * │ preview/artikel-visuals/gender-doodles-panel.html (Preview D).            │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Reduced-motion users get a brief static color tint instead of the animation.
 */
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

  const tint = `hsl(var(--${gender}-bg))`;

  return (
    <span
      key={play}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className ?? ""}`}
    >
      <span
        className={reduce ? undefined : `artikel-effect artikel-effect--${gender}`}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, ${tint}, transparent 70%)`,
          // Reduced motion: a brief static tint (fades via the transition below).
          ...(reduce ? { opacity: 0.6 } : null),
          transformOrigin: "50% 45%",
        }}
      />
    </span>
  );
}
