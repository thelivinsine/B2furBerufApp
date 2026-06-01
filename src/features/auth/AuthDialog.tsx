import { useEffect, useState } from "react";
import { Lock, Mail, Sparkles, ShieldCheck, Cloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useSessionStore } from "@/store/useSessionStore";

export type AuthIntent = "signup" | "login";

/**
 * Toggle for the "Weiter mit Google" button. Off until the Google OAuth
 * provider is configured in Supabase + Google Cloud — flip to `true` once
 * the Client ID / Secret are saved in the Supabase Google provider settings.
 */
const GOOGLE_ENABLED = false;

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

  // Sync to the requested intent each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setMode(intent);
      clearError();
    }
  }, [open, intent, clearError]);

  const isSignup = mode === "signup";
  const canSubmit = email.trim().length > 3 && password.length >= 6 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    const fn = isSignup ? signUp : signIn;
    const { ok } = await fn(email.trim(), password);
    if (ok) {
      showToast(isSignup ? "Konto erstellt – willkommen!" : "Willkommen zurück!", "success");
      onOpenChange(false);
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex w-fit rounded-xl bg-accent-gradient p-2.5 text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle>{isSignup ? "Konto erstellen" : "Anmelden"}</DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Sichere deinen Fortschritt und lerne auf allen Geräten weiter."
              : "Melde dich an, um auf allen Geräten weiterzulernen."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {GOOGLE_ENABLED && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={busy}
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
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={isSignup ? "Mindestens 6 Zeichen" : "Dein Passwort"}
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <Button variant="gradient" className="w-full" onClick={submit} disabled={!canSubmit}>
            {isSignup ? "Konto erstellen" : "Anmelden"}
          </Button>

          {status === "anonymous" && isSignup && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cloud className="h-3.5 w-3.5" /> Dein bisheriger Fortschritt wird übernommen.
            </p>
          )}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Wir nutzen deine E-Mail nur für die Anmeldung.
          </p>

          <p className="pt-1 text-center text-sm text-muted-foreground">
            {isSignup ? "Schon ein Konto?" : "Noch kein Konto?"}{" "}
            <button
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                clearError();
              }}
              className="font-semibold text-primary hover:underline"
            >
              {isSignup ? "Anmelden" : "Registrieren"}
            </button>
          </p>
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
