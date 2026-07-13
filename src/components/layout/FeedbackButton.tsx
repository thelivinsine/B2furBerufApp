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

/**
 * The subtle "Mit KI gebaut · Feedback" affordance shown at the bottom of every
 * page (founder, 2026-07-13). It doubles as the required AI disclaimer (the
 * pill text says the app is AI-built) and the feedback entry point: tapping it
 * opens a small dialog whose submission emails the founder via the
 * `submit-feedback` Edge Function. Google-style: quiet, out of the way, always
 * reachable. Not rendered in focus mode (AppShell hides it during a session).
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const location = useLocation();
  const showToast = useSessionStore((s) => s.showToast);
  const path = location.pathname;

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

  // Skip on the dashboard (Praktisch → Üben/Spielen): it's a focused, sparse
  // single-column layout where a floating pill just hangs over empty space
  // (founder 2026-07-13). Other pages still show it.
  if (path === "/") return null;

  // The Theorie browse tabs (/library) pin a sticky ~52px "Üben" action bar to
  // the bottom on mobile, so raise the pill above it there; everywhere else it
  // sits just above the nav bar.
  const hasBottomBar = path.startsWith("/library");
  const mobileBottom = hasBottomBar
    ? "bottom-[calc(3.9375rem+env(safe-area-inset-bottom)+3.25rem)]"
    : "bottom-[calc(3.9375rem+env(safe-area-inset-bottom)+0.5rem)]";

  return (
    <>
      {/* Fixed, subtle pill. On mobile it is centered just above the bottom tab
          bar (founder 2026-07-13); on desktop it floats in the bottom-right
          corner. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Feedback geben"
        className={`fixed left-1/2 -translate-x-1/2 ${mobileBottom} z-40 flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-2 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-md transition-colors hover:border-primary/40 hover:text-foreground lg:left-auto lg:right-4 lg:translate-x-0 lg:bottom-4`}
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>
          Mit KI gebaut<span className="hidden sm:inline"> · Feedback</span>
        </span>
      </button>

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
    </>
  );
}
