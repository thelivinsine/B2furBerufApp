import { cn } from "@/lib/utils";

/**
 * DE/EN switch for AI FEEDBACK prose (founder 2026-07-31: "with an english
 * toggle button even for this section").
 *
 * Deliberately NOT `EnPeek`. Hold-to-peek is right for learning content, where a
 * one-line gloss is a peek and a sticky toggle would let a learner dodge the
 * German (s93). A Kurz/Lang tip is three sentences of INSTRUCTION about the
 * learner's own text: it has to be readable end to end, and nobody reads a
 * paragraph with a finger held down. So this one sticks until it is pressed
 * again, and it says which language it will switch TO, which is also what keeps
 * the two chips apart at a glance: the peek chip always reads "EN", this one
 * flips between "EN" and "DE".
 *
 * Only render it when an English version actually exists (rows written before
 * migration 0014 have none), never as a dead control.
 */
export function FeedbackLangChip({
  showEnglish,
  onChange,
  className,
}: {
  showEnglish: boolean;
  onChange: (english: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={showEnglish}
      aria-label={showEnglish ? "Auf Deutsch anzeigen" : "Auf Englisch anzeigen"}
      title={showEnglish ? "Auf Deutsch anzeigen" : "Auf Englisch anzeigen"}
      onClick={() => onChange(!showEnglish)}
      className={cn(
        "no-callout inline-flex h-6 shrink-0 select-none items-center rounded-md border px-1.5 text-[10px] font-bold leading-none transition-colors",
        showEnglish
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {showEnglish ? "DE" : "EN"}
    </button>
  );
}
