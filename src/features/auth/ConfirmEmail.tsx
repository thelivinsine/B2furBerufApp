import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/uiLang";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { AUTH_CALLBACK } from "@/lib/authCallback";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useSessionStore } from "@/store/useSessionStore";
import { NewPasswordForm } from "@/features/auth/NewPasswordForm";

/**
 * Landing page for the "Bestätige deine E-Mail" link (`/auth/confirm`).
 *
 * Before this existed the link went straight to the app root, and clicking it
 * confirmed the account SERVER-side but never signed the learner in: Supabase's
 * default template hands the session back in the URL hash, which React Router
 * wipes on mount, and the app's PKCE client was not looking there anyway. The
 * learner clicked the link, landed on a normal signed-out home page, and
 * reasonably concluded that confirming had not worked (founder report, s174).
 *
 * This route handles every shape a confirmation link can arrive in, so it works
 * whether or not the project's email template has been updated:
 *   * `?token_hash=…&type=…` — our own template. Exchanged with `verifyOtp`.
 *   * `#access_token=…`      — Supabase's DEFAULT template. Captured before
 *                              React Router by `lib/authCallback.ts`.
 *   * `?code=…`              — PKCE. supabase-js has already handled it by the
 *                              time we mount, so we just read the session.
 *
 * Whatever happens, the learner sees a plain answer instead of a silent bounce.
 */
type Phase = "working" | "done" | "failed" | "recovery" | "codeElsewhere";

export function ConfirmEmail() {
  const t = useT();
  const navigate = useNavigate();
  const showToast = useSessionStore((s) => s.showToast);
  const status = useAuthStore((s) => s.status);
  const [phase, setPhase] = useState<Phase>("working");
  const [detail, setDetail] = useState<string | null>(null);
  // StrictMode mounts effects twice in dev; a token may only be redeemed once.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const finish = (ok: boolean, message?: string) => {
      // A recovery link verifies exactly like a signup link (same `verifyOtp`
      // / `setSession` / `getSession` calls above), so the branch happens
      // here, after success, not in the shape-detection above. `AUTH_CALLBACK
      // .type` catches shapes 1 and 3 (both carry `type=recovery`); the store
      // flag catches shape 2 (`?code=`), where supabase-js already consumed
      // the code and fired `PASSWORD_RECOVERY` before this component mounted.
      const recovery =
        ok && (AUTH_CALLBACK.type === "recovery" || useAuthStore.getState().passwordRecovery);
      if (recovery) {
        setPhase("recovery");
        return;
      }
      setPhase(ok ? "done" : "failed");
      setDetail(message ?? null);
      if (ok) {
        showToast("E-Mail bestätigt. Willkommen!", "success");
        // Straight into the Bibliothek, same as every other entry point
        // (onboarding s207, cold-open s212). Replace, so Back does not return
        // to a spent token.
        navigate("/library", { replace: true });
      }
    };

    void (async () => {
      const { tokenHash, type, accessToken, refreshToken, errorDescription } = AUTH_CALLBACK;

      if (errorDescription) {
        // Supabase itself refused the link (expired, or already used).
        finish(false, errorDescription);
        return;
      }

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (type as EmailOtpType) || "signup",
        });
        finish(!error, error?.message);
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        finish(!error, error?.message);
        return;
      }

      // Nothing in the URL for us. Either supabase-js already consumed a `?code=`
      // (in which case a session exists) or the link was opened without its
      // parameters, e.g. copied by hand.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        finish(true);
        return;
      }
      if (AUTH_CALLBACK.hadCode) {
        // The account IS confirmed server-side (Supabase already exchanged the
        // code before this component mounted); there is just no session in
        // THIS browser, because a PKCE `?code=` link only exchanges in the
        // browser that started signUp. Telling them the link is invalid would
        // send them in a loop; telling them to log in gets them in (s215).
        setPhase("codeElsewhere");
        return;
      }
      finish(false, "Kein Bestätigungs-Code in der Adresse.");
    })();
  }, [navigate, showToast]);

  // A confirmation that lands while the tab already holds a session (the link
  // opened twice) is a success, not an error.
  if (phase === "failed" && status === "signedIn") {
    return null;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <Logo variant="wordmark" className="mx-auto mb-6 h-8 w-auto" />

        {phase === "working" && (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <h1 className="text-lg font-semibold text-foreground">{t("E-Mail wird bestätigt")}</h1>
          </>
        )}

        {phase === "done" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-8 w-8 text-success" />
            <h1 className="text-lg font-semibold text-foreground">{t("Bestätigt")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("Es geht gleich weiter.")}</p>
          </>
        )}

        {phase === "recovery" && (
          <>
            <h1 className="text-lg font-semibold text-foreground">{t("Neues Passwort setzen")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Leg ein neues Passwort für dein Konto fest.")}
            </p>
            <div className="mt-5 text-left">
              <NewPasswordForm
                submitLabel={t("Passwort speichern")}
                onDone={() => {
                  showToast("Passwort gespeichert.", "success");
                  navigate("/", { replace: true });
                }}
              />
            </div>
          </>
        )}

        {phase === "codeElsewhere" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-8 w-8 text-success" />
            <h1 className="text-lg font-semibold text-foreground">{t("Bestätigt")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Dein Konto ist bestätigt. Melde dich hier an, um weiterzumachen.")}
            </p>
            <Button variant="gradient" className="mt-5 w-full" onClick={() => navigate("/")}>
              Zur Anmeldung
            </Button>
          </>
        )}

        {phase === "failed" && (
          <>
            <MailWarning className="mx-auto mb-4 h-8 w-8 text-danger" />
            <h1 className="text-lg font-semibold text-foreground">{t("Link nicht mehr gültig")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {/* ONE string: split, the English rendered as "Sign in,
                  thenschicken wir dir einen neuen." (s211). */}
              {t("Bestätigungs-Links laufen ab und lassen sich nur einmal öffnen. Melde dich an, dann schicken wir dir einen neuen.")}
            </p>
            <Button variant="gradient" className="mt-5 w-full" onClick={() => navigate("/")}>
              Zur Anmeldung
            </Button>
            {detail && (
              <p className="mt-4 text-xs text-muted-foreground/80">{detail}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
