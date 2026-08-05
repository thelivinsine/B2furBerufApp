import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquareText, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/lib/feedback";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppConfig } from "@/lib/appConfig";
import { cn } from "@/lib/utils";

/**
 * In-app feedback + the required "built with AI" disclaimer (founder,
 * 2026-07-13). One dialog is mounted app-wide (<FeedbackDialog/> in AppShell,
 * even during a focus-mode session); every affordance just opens it via the
 * `feedbackOpen` session-store flag:
 *   - <FeedbackPill/>   the quiet floating pill (desktop bottom-right).
 *   - <FeedbackLink/>   the inline link, in the bottom caption line of the
 *     Bibliothek tabs (via <FeedbackNote/>) and of the Schreiben trainers,
 *     where it replaced the cluster's Feedback button in s192.
 *   - <FeedbackFullButton/>  the full labelled button inside a practice session.
 */

/** The single dialog. Mounted once (AppShell), controlled by the store flag. */
export function FeedbackDialog() {
  const open = useSessionStore((s) => s.feedbackOpen);
  const setOpen = useSessionStore((s) => s.setFeedbackOpen);
  const showToast = useSessionStore((s) => s.showToast);
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const res = await submitFeedback({
      message: message.trim(),
      email: email.trim() || undefined,
      page: location.pathname,
    });
    setSending(false);
    if (res.ok) {
      setOpen(false);
      setMessage("");
      setEmail("");
      showToast("Danke für dein Feedback!", "success");
    } else {
      showToast(res.message ?? "Konnte nicht gesendet werden.", "warning");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback geben</DialogTitle>
          <DialogDescription>
            Diese App wird gerade mit KI entwickelt (Beta). Dein Feedback hilft
            uns sehr, sie besser zu machen. Was ist dir aufgefallen?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="Deine Nachricht, Idee oder ein Fehler …"
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="feedback-email" className="text-xs font-medium text-muted-foreground">
              E-Mail (optional, falls wir dich erreichen dürfen)
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              placeholder="du@beispiel.de"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" disabled={!message.trim() || sending} className="w-full sm:w-auto sm:self-end">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Wird gesendet …
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Senden
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The quiet floating pill. Desktop only now: it sits bottom-right (the rail was
 * shortened so it no longer overlaps). On mobile the feedback affordance is the
 * compact icon inside each Üben action bar / the in-session button instead, so
 * the pill never floats over content cards. Skipped on the dashboard `/`
 * (Praktisch → Üben/Spielen), a sparse page.
 *
 * Desktop horizontal position (founder, 2026-07-13): centered under the
 * Bibliothek `FilterRail` column, not flush against the viewport edge. The
 * rail lives in a `max-w-6xl` main column (sidebar 16rem + content, capped at
 * 72rem = 88rem total) as the last `16rem` track of a `[1fr_16rem]` grid with
 * `sm:px-6` (1.5rem) main padding, so the rail's CENTER sits
 * `9.5rem + max(0, (100vw - 88rem)/2)` in from the viewport's right edge.
 * `right` anchors the pill's right EDGE, so we set it to the rail-center value
 * and add `lg:translate-x-1/2` (shift right by half the pill's own width) to
 * bring the pill's center onto that line, otherwise the pill hangs half its
 * width to the left of the rail (founder screenshot, 2026-07-13).
 */
export function FeedbackPill() {
  const setOpen = useSessionStore((s) => s.setFeedbackOpen);
  const { pathname } = useLocation();
  // Steuerung H5: the whole feedback affordance can be turned off, relabelled,
  // or suppressed per route from remote config (default = today's behavior).
  const feedback = useAppConfig().feedback;
  if (pathname === "/") return null;
  if (!feedback.enabled) return null;
  if (feedback.hiddenRoutes.some((r) => r && pathname.startsWith(r))) return null;
  return (
    // Docked to the FILTER RAIL's column (founder s189): the wrapper mirrors
    // AppShell's <main> (sidebar allowance, max-w-6xl, the same padding), and
    // the inner 16rem block is the rail's own width pinned to the right, so the
    // pill's right edge lands exactly on the rail's right edge at every width.
    // `ScrollTopDesktop` uses the identical wrapper and sits at that block's
    // LEFT edge, which is the rail's left edge.
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden lg:block lg:pl-64">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="ml-auto flex w-64 justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Feedback geben"
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-2 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-md transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <MessageSquareText className="h-3.5 w-3.5 text-primary" />
            <span>{feedback.label ?? "Feedback"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The bare "Feedback geben" link, styled like the privacy link beside it. Used
 * on its own in the Schreiben bottom line (next to the KI note, s192) and with
 * a lead-in inside `FeedbackNote` in the Bibliothek.
 */
export function FeedbackLink({ className }: { className?: string }) {
  const setOpen = useSessionStore((s) => s.setFeedbackOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn("font-medium text-primary underline-offset-2 hover:underline", className)}
    >
      Feedback geben
    </button>
  );
}

export function FeedbackNote() {
  return (
    <>
      Etwas verbessern? <FeedbackLink />
    </>
  );
}

/**
 * The full labelled button for inside a practice session (there is space there,
 * and the founder wants it always available while practising).
 */
export function FeedbackFullButton({ className }: { className?: string }) {
  const setOpen = useSessionStore((s) => s.setFeedbackOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Feedback geben"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      <MessageSquareText className="h-3.5 w-3.5 text-primary" />
      Feedback
    </button>
  );
}
