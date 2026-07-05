import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tap-to-translate gloss (redesign Phase 1.4). Shows one language by default and
 * toggles to the other on tap (and back), so a learner can peek at a translation
 * without leaving German immersion. Per-tap only: nothing is persisted. A dotted
 * underline signals it is tappable. Rendering only, both strings come from the
 * already-bilingual content banks.
 *
 * `initial` picks which side shows first ("de" by default; "en" where the line
 * is a revealed answer whose primary reading is the English meaning). The click
 * stops propagation so the gloss can live inside a tappable card (e.g. the
 * flashcard flip surface) without triggering the parent's handler.
 */
export function Gloss({
  de,
  en,
  initial = "de",
  className,
}: {
  de: string;
  en: string;
  initial?: "de" | "en";
  className?: string;
}) {
  const [lang, setLang] = useState<"de" | "en">(initial);
  const showingDe = lang === "de";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setLang((l) => (l === "de" ? "en" : "de"));
      }}
      aria-label={showingDe ? `Übersetzung zeigen: ${en}` : `Deutsch zeigen: ${de}`}
      className={cn(
        "cursor-pointer underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-primary",
        className,
      )}
    >
      {showingDe ? de : en}
    </button>
  );
}
