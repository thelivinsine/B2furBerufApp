import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { FeedbackLink } from "@/components/layout/FeedbackButton";
import { floatingNote } from "@/features/shared/floatingCluster";

/**
 * The fixed KI line the Schreiben trainers share, below their floating action
 * cluster. It lives here rather than being copied per trainer, because anything
 * mode-specific in that region shows up as a jump on every tab switch (founder
 * s169) and two hand-kept copies are exactly how that happened before.
 *
 * The `BackToPruefung` pill that used to sit in the cluster beside it is gone
 * (s195): the zone's one exit is the shell's top-right corner now, on every
 * screen and at every width, which is also the first time the desktop trainers
 * have had a way back at all.
 */

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
