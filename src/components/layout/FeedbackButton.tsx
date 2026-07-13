import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Send, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

/**
 * In-app feedback + the required "built with AI" disclaimer (founder,
 * 2026-07-13). One dialog is mounted app-wide (<FeedbackDialog/> in AppShell,
 * even during a focus-mode session); every affordance just opens it via the
 * `feedbackOpen` session-store flag:
 *   - <FeedbackPill/>   the quiet floating pill (desktop bottom-right).
 *   - <FeedbackIconButton/> a compact icon for the mobile Üben action bars.
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
 */
export function FeedbackPill() {
  const setOpen = useSessionStore((s) => s.setFeedbackOpen);
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Feedback geben"
      className="fixed bottom-4 right-4 z-40 hidden items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-2 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-md transition-colors hover:border-primary/40 hover:text-foreground lg:flex"
    >
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      <span>Mit KI gebaut · Feedback</span>
    </button>
  );
}

/** Compact icon trigger for the mobile Üben action bars (left of the Üben button). */
export function FeedbackIconButton({ className }: { className?: string }) {
  const setOpen = useSessionStore((s) => s.setFeedbackOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Mit KI gebaut · Feedback geben"
      title="Mit KI gebaut · Feedback geben"
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      <Sparkles className="h-5 w-5 text-primary" />
    </button>
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
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      Mit KI gebaut · Feedback geben
    </button>
  );
}
