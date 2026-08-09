import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/uiLang";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, Cloud, Eye, EyeOff, MailCheck } from "lucide-react";
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
import { Logo } from "@/components/shared/Logo";

const TURNSTILE_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

export type AuthIntent = "signup" | "login";

/**
 * Toggle for the "Weiter mit Google" button. Turned on once the Google OAuth
 * provider is configured in Supabase + Google Cloud (Client ID / Secret saved
 * in the Supabase Google provider settings). See docs/plans/PHASE2_SETUP.md §8 for
 * the exact setup steps and redirect URLs.
 */
const GOOGLE_ENABLED = true;

/**
 * Routes that live OUTSIDE the app shell and keep rendering a signed-out story
 * (the landing page still says "Start free"). Signing in on one of these has to
 * navigate away, or nothing visibly happens. Every other route already shows
 * the signed-in state in place, so we leave the learner where they are, e.g. in
 * Settings.
 */
const PUBLIC_PATHS = new Set(["/welcome", "/about", "/privacy", "/terms", "/sources"]);

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
  const t = useT();
  const { busy, error, status, signUp, signIn, signInWithGoogle, resendConfirmation, clearError } =
    useAuthStore();
  const showToast = useSessionStore((s) => s.showToast);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mode, setMode] = useState<AuthIntent>(intent);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  /** Why the primary action could not run yet. Set on click, never at rest, so
   *  the button stays live instead of sitting disabled (design landmine). */
  const [hint, setHint] = useState<string | null>(null);
  /**
   * Address we ACTUALLY mailed a confirmation link to, i.e. a fresh sign-up.
   * Switches the dialog to the "check your inbox" panel instead of closing
   * behind a small toast. Never set from the log-in path: see `resendFor`.
   */
  const [pending, setPending] = useState<string | null>(null);
  /**
   * Address whose log-in was refused because it is not confirmed yet. This is
   * NOT the same state as `pending`: no mail was just sent, and the form has to
   * stay on screen. Taking the log-in form away here and replacing it with
   * "we sent you a link" would both lie and remove the only way in, which is
   * precisely how a stale unconfirmed account reads as "log-in is broken".
   */
  const [resendFor, setResendFor] = useState<string | null>(null);
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
  // Held in a ref so the reset effect below depends on OPENING the dialog, not
  // on the identity of a store action. With `clearError` in the dependency list
  // any caller whose store hands back a fresh function each render re-runs the
  // effect on every render, which wipes the consent tick and the pending panel
  // the moment they are set.
  const clearErrorRef = useRef(clearError);
  // Kept current in its own effect (never during render) so the reset effect
  // below can call the latest action without listing it as a dependency.
  // Declared first, so it runs before the reset effect on every commit.
  useEffect(() => {
    clearErrorRef.current = clearError;
  });

  useEffect(() => {
    if (!open) return;
    setMode(intent);
    clearErrorRef.current();
    setCaptchaToken(null); // widget re-renders and re-solves on each open
    // Always start unchecked on sign-up so a new user must actively agree to
    // the AGB + Datenschutz in this dialog before we create an account.
    setConsent(false);
    setShowPassword(false);
    setHint(null);
    setPending(null);
    setResendFor(null);
  }, [open, intent]);

  const isSignup = mode === "signup";
  const captchaReady = !TURNSTILE_ENABLED || captchaToken !== null;
  // Sign-up requires accepting the AGB + Datenschutzerklärung; log-in does not.
  const consentReady = !isSignup || consent;

  /**
   * The FIRST unmet requirement, named. Returned on click rather than used to
   * disable the button: a dead control reads as a broken app, and the founder
   * hit exactly that ("it's very unclear why the signup button doesn't work").
   */
  const blockingReason = (): string | null => {
    if (email.trim().length <= 3) return "Bitte gib deine E-Mail-Adresse ein.";
    if (password.length < 6) return "Das Passwort muss mindestens 6 Zeichen haben.";
    if (!consentReady) return "Bitte stimme den AGB und der Datenschutzerklärung zu.";
    if (!captchaReady) return "Die Sicherheitsprüfung läuft noch. Einen Moment.";
    return null;
  };

  const startGoogle = () => {
    if (!consentReady) {
      setHint("Bitte stimme den AGB und der Datenschutzerklärung zu.");
      return;
    }
    if (!captchaReady) {
      setHint("Die Sicherheitsprüfung läuft noch. Einen Moment.");
      return;
    }
    // OAuth redirects away immediately, so record consent first.
    if (isSignup) recordConsent();
    signInWithGoogle(captchaToken ?? undefined);
  };

  const submit = async () => {
    if (busy) return;
    const blocked = blockingReason();
    if (blocked) {
      setHint(blocked);
      return;
    }
    setHint(null);
    setResendFor(null);
    // Record consent before the call so it persists locally and syncs to the
    // cloud once the session resolves (covers the email + guest-upgrade paths).
    if (isSignup) recordConsent();
    const fn = isSignup ? signUp : signIn;
    const address = email.trim();
    const { ok, needsConfirmation, alreadyRegistered } = await fn(
      address,
      password,
      captchaToken ?? undefined,
    );

    // Signing UP with an address that already has an account. Supabase returns a
    // success-shaped response here (it refuses to confirm which addresses are
    // registered), so without this the learner was told to go and confirm an
    // email that is never sent. Send them to the log-in tab instead, with their
    // address kept.
    if (alreadyRegistered) {
      setMode("login");
      setPassword("");
      setHint("Diese E-Mail hat schon ein Konto. Melde dich hier an.");
      return;
    }

    if (!ok) {
      // Refused because the address is not confirmed yet. Recoverable, so offer
      // the way out UNDER the error, with the form left exactly where it is:
      // the learner may want to try a different address or password, and no
      // mail was sent just now, so the "check your inbox" panel would be a lie.
      if (needsConfirmation) setResendFor(address);
      return;
    }

    // Sign-up only. A confirmation link really was just sent, so the panel that
    // says so is accurate here.
    if (needsConfirmation) {
      setPending(address);
      setPassword("");
      return;
    }

    showToast(isSignup ? "Konto erstellt – willkommen!" : "Willkommen zurück!", "success");
    onOpenChange(false);
    setPassword("");
    // Signing in from a PUBLIC page has to move the learner off it. Closing the
    // dialog used to leave them standing on the marketing page, which still
    // shows "Start free", so a successful log-in looked exactly like a failed
    // one. Hand over to "/" and let RequireOnboarding decide: into the app, or
    // on to onboarding if this account never finished it.
    if (PUBLIC_PATHS.has(pathname)) navigate("/", { replace: true });
  };

  const resend = async () => {
    const address = pending ?? resendFor;
    if (!address) return;
    const sent = await resendConfirmation(address);
    showToast(
      sent ? "Neue E-Mail ist unterwegs." : "Konnte nicht gesendet werden. Versuch es später.",
      sent ? "success" : "default",
    );
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
          <Logo variant="wordmark" className="mb-1 h-8 w-auto self-start" />
          <DialogTitle>
            {pending ? "E-Mail bestätigen" : isSignup ? "Konto erstellen" : "Anmelden"}
          </DialogTitle>
          <DialogDescription>
            {pending
              ? "Nur noch ein Klick, dann geht es los."
              : isSignup
                ? "Sichere deinen Fortschritt und lerne auf allen Geräten weiter."
                : "Melde dich an, um auf allen Geräten weiterzulernen."}
          </DialogDescription>
        </DialogHeader>

        {/* Confirmation pending. Deliberately a full panel that KEEPS the dialog
            open: this used to close the dialog behind a small toast, which the
            founder could barely see and which offered no way to get a new link
            (s174). */}
        {pending ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-accent/20 bg-accent/20 p-4 text-sm text-accent-ink shadow-soft">
              <MailCheck className="mb-2 h-5 w-5" />
              <p>
                Wir haben dir einen Link an <strong className="font-semibold">{pending}</strong>{" "}
                geschickt. Öffne ihn, dann bist du direkt angemeldet.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Nichts angekommen? Schau im Spam-Ordner nach.
            </p>
            <Button variant="outline" className="w-full" onClick={resend} disabled={busy}>
              E-Mail erneut senden
            </Button>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                setHint(null);
                clearError();
              }}
              className="w-full text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Andere E-Mail-Adresse verwenden
            </button>
          </div>
        ) : (
          <>
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
          {GOOGLE_ENABLED && (
            <>
              <Button variant="outline" className="w-full" onClick={startGoogle} disabled={busy}>
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
                placeholder={t("du@beispiel.de")}
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Passwort</label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-surface pl-3 pr-1 focus-within:ring-2 focus-within:ring-ring">
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onAnimationStart={syncAutofilled}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={isSignup ? "Mindestens 6 Zeichen" : "Dein Passwort"}
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              {/* Typing a password you cannot see is the single most common
                  reason a sign-up is abandoned on a phone keyboard. */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                aria-pressed={showPassword}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <TurnstileWidget onToken={setCaptchaToken} />

          {/* Consent sits DIRECTLY above the button it gates, so the dependency
              is visible without scrolling back up (it used to head the dialog,
              far from the action it blocked). Log-in skips it. */}
          {isSignup && (
            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (e.target.checked) setHint(null);
                }}
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
                  {t("Datenschutzerklärung")}
                </a>{" "}
                zu.
              </span>
            </label>
          )}

          {/* One message slot: a server error, or the reason the last tap could
              not act. Never both, and never a bare red line the learner has to
              guess at. */}
          {(error || hint) && (
            <p
              role="alert"
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                error
                  ? "bg-danger/10 text-danger"
                  : "bg-accent/20 text-accent-ink",
              )}
            >
              {error ?? hint}
            </p>
          )}

          {/* The unblock for an unconfirmed account, offered WITHOUT taking the
              form away, so logging in stays possible on the same screen. */}
          {resendFor && (
            <Button variant="outline" className="w-full" onClick={resend} disabled={busy}>
              E-Mail erneut senden
            </Button>
          )}

          {/* Always live. If something is missing it says so above, rather than
              sitting greyed out with no explanation (design landmine). */}
          <Button variant="gradient" className="w-full" onClick={submit} disabled={busy}>
            {isSignup ? "Konto erstellen" : "Anmelden"}
          </Button>

          {status === "anonymous" && isSignup && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" /> Dein bisheriger Fortschritt wird übernommen.
            </p>
          )}
        </div>
          </>
        )}
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
