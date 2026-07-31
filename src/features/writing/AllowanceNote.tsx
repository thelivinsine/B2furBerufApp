import { cn } from "@/lib/utils";

/**
 * The two "how much AI have I got left" readouts in Schreiben (founder
 * 2026-07-31: "there's no count like (2 left out of 3)"). Both share ONE
 * phrasing, "noch X von Y", so a learner reads the same shape whether the
 * number is a daily allowance or the phrasings left for one Umformung.
 *
 * Quiet muted chrome, never a badge or a warning colour: this is a fact about
 * the day, not an alarm. The count stays visible at 0 rather than swapping to a
 * different sentence, since a line that changes shape reads as unreliable
 * (`/design` §7).
 */

/** Daily allowance beside an AI action: "Heute noch 7 von 10". */
export function AllowanceNote({
  remaining,
  limit,
  what,
  className,
}: {
  remaining: number;
  limit: number;
  /** Plural noun for the tooltip, e.g. "Korrekturen", "Auswertungen". */
  what: string;
  className?: string;
}) {
  return (
    <p
      className={cn("text-xs text-muted-foreground", className)}
      title={`Heute noch ${remaining} von ${limit} ${what}`}
    >
      Heute noch <span className="font-semibold tabular-nums">{remaining}</span> von{" "}
      <span className="tabular-nums">{limit}</span>
    </p>
  );
}

/**
 * Inline counter inside a button: "2 von 3 übrig". Says how many are LEFT, not
 * which one is showing, and says it in a word rather than a "2/3" that could be
 * read either way.
 */
export function LeftCount({
  remaining,
  total,
  className,
}: {
  remaining: number;
  total: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums text-muted-foreground/80", className)}>
      {remaining} von {total} übrig
    </span>
  );
}

/**
 * Tooltip for the "Nochmal" button. At 0 it stops promising something new: the
 * cycle keeps working (already-generated phrasings are cached and free), it just
 * shows them again rather than costing another AI call.
 */
export function variantTitle(remaining: number, total: number): string {
  return remaining > 0
    ? `Noch ${remaining} von ${total} neuen KI-Formulierungen für diese Umformung`
    : `Alle ${total} Formulierungen erzeugt. Nochmal zeigt sie wieder der Reihe nach.`;
}
