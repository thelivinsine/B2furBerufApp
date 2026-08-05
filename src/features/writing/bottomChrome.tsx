import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeedbackLink } from "@/components/layout/FeedbackButton";
import { floatingNote } from "@/features/shared/floatingCluster";
import { cn } from "@/lib/utils";

/**
 * The two pieces of mobile bottom chrome the Schreiben trainers share: the
 * Zurück button in the floating action cluster and the fixed KI line under it.
 * They live here rather than being copied per trainer, because anything
 * mode-specific in that row shows up as a jump on every tab switch (founder
 * s169) and the two hand-kept copies are exactly how that happened before.
 */

/**
 * The way out of a trainer, back to the Prüfung hub (founder s192: "replace the
 * feedback button with zurück and the user should navigate back to the prüfung
 * hub"). It took the Feedback button's slot in the cluster, so it keeps that
 * button's geometry exactly: same 44px height, same squircle, same quiet
 * outline. Feedback moved to the line below, beside the KI note, which is where
 * the Bibliothek tabs already carry it.
 *
 * It goes to `/anwenden` rather than back through history: `/writing` is
 * reached from the hub's Schreiben card (Ohne Zeit), from the dashboard
 * recommendation and from ⌘K, and "zurück" has to mean the same place from all
 * three.
 *
 * Opaque `bg-surface` is load-bearing: the cluster carries no bar behind it, so
 * a see-through control lets the card underneath read through it (s164).
 */
export function BackToPruefung({ className }: { className?: string }) {
  return (
    <Link
      to="/anwenden"
      aria-label="Zurück zur Prüfung"
      className={cn(
        "flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 text-primary" />
      Zurück
    </Link>
  );
}

/**
 * The one bottom line, locked just above the nav in EVERY state (founder s169:
 * a caption that swaps content between states reads as unreliable). It carries
 * the EU AI Act Art. 50 note plus, since s192, the Feedback link the cluster
 * used to hold as a button, in the Bibliothek's own wording.
 *
 * Fokus measures this element (`kiNoteRef`) to size its tile column, hence the
 * forwarded ref.
 */
export const MobileAiNote = forwardRef<HTMLParagraphElement>(function MobileAiNote(_props, ref) {
  return (
    <p
      ref={ref}
      className="fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom)_+_0.5rem)] z-20 text-center text-[11px] leading-snug text-muted-foreground lg:hidden"
    >
      <span className={floatingNote}>
        KI-geprüft, kann Fehler enthalten.{" "}
        <Link to="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
          Mehr
        </Link>
        <span className="px-1 text-muted-foreground/60" aria-hidden>
          ·
        </span>
        <FeedbackLink />
      </span>
    </p>
  );
});
