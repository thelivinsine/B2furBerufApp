import { cn } from "@/lib/utils";

/**
 * Hold-to-peek English toggle (founder s93: the Grammatik lesson is
 * German-first; English is a peek, not a default). Reports `true` while the
 * chip is pressed (pointer held down, or Space/Enter held on the keyboard)
 * and `false` on release. Never a sticky toggle: releasing, leaving or
 * cancelling always hides the translation again.
 */
export function EnPeek({
  active,
  onChange,
  className,
}: {
  active: boolean;
  onChange: (peek: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label="Englische Übersetzung anzeigen (gedrückt halten)"
      title="Gedrückt halten: Englisch"
      onPointerDown={(e) => {
        // Keep the press from selecting text or scrolling; capture the pointer
        // so releasing outside the chip still ends the peek.
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onChange(true);
      }}
      onPointerUp={() => onChange(false)}
      onPointerCancel={() => onChange(false)}
      onPointerLeave={() => onChange(false)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange(true);
        }
      }}
      onKeyUp={() => onChange(false)}
      onBlur={() => onChange(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "no-callout inline-flex h-6 shrink-0 touch-none select-none items-center rounded-md border px-1.5 text-[10px] font-bold leading-none transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      EN
    </button>
  );
}
