import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A grid tile that flips on click to reveal a back face, used across the
 * Bibliothek "Karten" views to show the English translation on the back
 * (founder 2026-07-13). Both faces are stacked in ONE grid cell so the tile
 * sizes to the taller face, and a 3D `rotateY` reveals the back.
 *
 * Interactive controls inside `front`/`back` (Sprechen, Lesezeichen, the
 * "Verbunden" toggle) MUST call `stopPropagation` in their own onClick so
 * tapping them does not also flip the tile. Reduced-motion users get an
 * instant swap instead of the rotation.
 */
export function FlipCard({
  front,
  back,
  className,
  label = "Übersetzung zeigen",
  onFlip,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  label?: string;
  /** Fires after each flip with the new state, so a caller can play a reveal
   *  effect on front→back (Artikel-Visuals). Optional; no-op when omitted. */
  onFlip?: (flipped: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const toggle = () =>
    setFlipped((f) => {
      const next = !f;
      onFlip?.(next);
      return next;
    });

  return (
    <div
      className={cn("group relative h-full cursor-pointer select-none", className)}
      style={{ perspective: 1400 }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={label}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {/* `grid-cols-1` (= minmax(0,1fr)) constrains the stacked faces to the
          container width so wide inner content (e.g. an expanded RelatedPanel)
          wraps/truncates instead of overflowing to the right. */}
      <div
        className="grid h-full grid-cols-1"
        style={{
          transformStyle: "preserve-3d",
          transition: reduce ? "none" : "transform 450ms cubic-bezier(0.2,0.7,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="h-full min-w-0 [grid-area:1/1]"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          aria-hidden={flipped}
        >
          {front}
        </div>
        <div
          className="h-full min-w-0 [grid-area:1/1]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

/**
 * Small corner affordance that hints a tile can flip (a rotate glyph). Purely
 * decorative: the whole FlipCard is the click target, so this is not itself a
 * button. Sits quiet until the tile is hovered.
 */
export function FlipHint({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 transition-colors group-hover:text-muted-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    </span>
  );
}
