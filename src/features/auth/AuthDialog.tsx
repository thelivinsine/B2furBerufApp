import { useEffect, useRef, useState } from "react";
import { Lock, Mail, Cloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
import { useAuthStore } from "@/store/useAuthStore";
import { useSessionStore } from "@/store/useSessionStore";
import { recordConsent } from "@/lib/consent";

const TURNSTILE_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

export type AuthIntent = "signup" | "login";

/**
 * Toggle for the "Weiter mit Google" button. Turned on once the Google OAuth
 * provider is configured in Supabase + Google Cloud (Client ID / Secret saved
 * in the Supabase Google provider settings). See docs/PHASE2_SETUP.md §8 for
 * the exact setup steps and redirect URLs.
 */
const GOOGLE_ENABLED = true;

/**
 * Email + password sign-up / log-in dialog. Instant and in-app (no email
 * round-trip) as long as "Confirm email" is disabled in Supabase. A guest's
 * progress is preserved when they upgrade (the email is attached to the same
 * account). Google one-click sign-in is offered as an alternative once
 * `GOOGLE_ENABLED` is turned on.
 */
export function AuthDialog({
  open,
  onOpenChange,
  intent = "signup",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent?: AuthIntent;
}) {
  const { busy, error, status, signUp, signIn, signInWithGoogle, clearError } = useAuthStore();
  const showToast = useSessionStore((s) => s.showToast);
  const [mode, setMode] = useState<AuthIntent>(intent);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // iOS Safari / password managers autofill the email + password without firing
  // a change event, so the controlled state stays empty and the submit button
  // never enables. The `:-webkit-autofill` CSS animation (see index.css) fires
  // an animationstart we hook here to copy the filled values into state.
  const syncAutofilled = () => {
    if (emailRef.current) setEmail(emailRef.current.value);
    if (passwordRef.current) setPassword(passwordRef.current.value);
  };

  // Sync to the requested intent each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setMode(intent);
      clearError();
      setCaptchaToken(null); // widget re-renders and re-solves on each open
      // Always start unchecked on sign-up so a new user must actively agree to
      // the AGB + Datenschutz in this dialog before the sign-up buttons (incl.
      // "Weiter mit Google") become clickable. Log-in does not require it.
      setConsent(false);
    }
  }, [open, intent, clearError]);

  const isSignup = mode === "signup";
  const captchaReady = !TURNSTILE_ENABLED || captchaToken !== null;
  // Sign-up requires accepting the AGB + Datenschutzerklärung; log-in does not.
  const consentReady = !isSignup || consent;
  const canSubmit =
    email.trim().length > 3 && password.length >= 6 && !busy && captchaReady && consentReady;

  const submit = async () => {
    if (!canSubmit) return;
    // Record consent before the call so it persists locally and syncs to the
    // cloud once the session resolves (covers the email + guest-upgrade paths).
    if (isSignup) recordConsent();
    const fn = isSignup ? signUp : signIn;
    const { ok, needsConfirmation } = await fn(email.trim(), password, captchaToken ?? undefined);
    if (!ok) return;
    if (needsConfirmation) {
      // Account created but not logged in yet — Supabase requires email
      // confirmation. Tell the user honestly instead of a false "welcome".
      showToast(
        "Fast geschafft! Bestätige deine E-Mail über den Link, den wir dir geschickt haben.",
        "default",
      );
    } else {
      showToast(isSignup ? "Konto erstellt – willkommen!" : "Willkommen zurück!", "success");
    }
    onOpenChange(false);
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        // Radix focuses the first focusable element on open. That's normally
        // the Google button, but it's `disabled` while Turnstile is still
        // resolving, so focus would land on the email input instead, popping
        // the on-screen keyboard open and lighting up its focus ring (plus
        // the browser/password-manager's own autofill highlight) before the
        // user has tapped anything. Keep focus on the dialog itself instead.
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <img src="/genauly-default-logo-transparent-corners.png" alt="" className="mb-1 h-10 w-10 rounded-xl shadow-glow" />
          <DialogTitle>{isSignup ? "Konto erstellen" : "Anmelden"}</DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Sichere deinen Fortschritt und lerne auf allen Geräten weiter."
              : "Melde dich an, um auf allen Geräten weiterzulernen."}
          </DialogDescription>
        </DialogHeader>

        {/* Segmented toggle: makes "Anmelden" for returning users obvious right
            next to "Konto erstellen", instead of a buried link at the bottom. */}
        <div
          role="tablist"
          aria-label="Konto erstellen oder anmelden"
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            onClick={() => {
              setMode("signup");
              clearError();
            }}
            className={cn(
              "h-9 rounded-md text-sm font-medium transition-colors",
              isSignup
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Konto erstellen
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            onClick={() => {
              setMode("login");
              clearError();
            }}
            className={cn(
              "h-9 rounded-md text-sm font-medium transition-colors",
              !isSignup
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Anmelden
          </button>
        </div>

        <div className="space-y-3">
          {/* Sign-up requires agreeing to the AGB + Datenschutz before any
              sign-up method (Google or email) becomes available. Placed above
              the buttons so the dependency is obvious. Log-in skips this. */}
          {isSignup && (
            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
              />
              <span>
                Ich stimme den{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  AGB
                </a>{" "}
                und der{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Datenschutzerklärung
                </a>{" "}
                zu.
              </span>
            </label>
          )}

          {GOOGLE_ENABLED && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // OAuth redirects away immediately, so record consent first.
                  if (isSignup) recordConsent();
                  signInWithGoogle(captchaToken ?? undefined);
                }}
                disabled={busy || !captchaReady || !consentReady}
              >
                <GoogleIcon /> Weiter mit Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> oder <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">E-Mail</label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-surface px-3 focus-within:ring-2 focus-within:ring-ring">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onAnimationStart={syncAutofilled}
                placeholder="du@beispiel.de"
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Passwort</label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-surface px-3 focus-within:ring-2 focus-within:ring-ring">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                ref={passwordRef}
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onAnimationStart={syncAutofilled}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={isSignup ? "Mindestens 6 Zeichen" : "Dein Passwort"}
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <TurnstileWidget onToken={setCaptchaToken} />

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <Button variant="gradient" className="w-full" onClick={submit} disabled={!canSubmit}>
            {isSignup ? "Konto erstellen" : "Anmelden"}
          </Button>

          {status === "anonymous" && isSignup && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" /> Dein bisheriger Fortschritt wird übernommen.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
