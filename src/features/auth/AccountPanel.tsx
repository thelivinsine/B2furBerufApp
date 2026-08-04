import { useState } from "react";
import { Cloud, CloudOff, CloudAlert, LogOut, RefreshCw, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { retryCloudSync } from "@/lib/cloudSync";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
import { AuthDialog, type AuthIntent } from "@/features/auth/AuthDialog";

const TURNSTILE_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

/** "vor 3 Minuten" / "vor 2 Stunden" / a date once it is older than a day. */
function relativeTime(ms: number): string {
  const mins = Math.round((Date.now() - ms) / 60_000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(ms).toLocaleDateString("de-DE");
}

/**
 * Account / cloud-sync panel in Settings. Guest-first: the learner can keep
 * using the app with no account (local only). Creating an account (email +
 * password, or Google) turns on cross-device cloud sync; upgrading a guest
 * preserves progress.
 */
export function AccountPanel() {
  const { status, user, busy, signInAsGuest, signOut } = useAuthStore();
  const syncHealth = useAuthStore((s) => s.syncHealth);
  const lastSyncedAt = useAuthStore((s) => s.lastSyncedAt);
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("signup");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const syncing = status === "anonymous" || status === "signedIn";
  const failing = syncing && syncHealth === "failing";

  const openAuth = (i: AuthIntent) => {
    setIntent(i);
    setAuthOpen(true);
  };

  const handleRetry = async () => {
    setRetrying(true);
    await retryCloudSync();
    setRetrying(false);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Konto & Cloud-Sync</p>
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
              (failing
                ? "bg-warning/10 text-warning"
                : syncing
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground")
            }
          >
            {failing ? (
              <CloudAlert className="h-3.5 w-3.5" />
            ) : syncing ? (
              <Cloud className="h-3.5 w-3.5" />
            ) : (
              <CloudOff className="h-3.5 w-3.5" />
            )}
            {failing ? "Sync pausiert" : syncing ? "Synchronisiert" : "Nur lokal"}
          </span>
        </div>

        {failing && (
          <div className="space-y-2 rounded-lg bg-warning/10 p-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dein Fortschritt wird gerade nur auf diesem Gerät gespeichert. Er geht nicht verloren,
              erreicht aber die Cloud noch nicht.
              {lastSyncedAt ? ` Zuletzt gesichert: ${relativeTime(lastSyncedAt)}.` : ""}
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
              <RefreshCw className={"h-4 w-4" + (retrying ? " animate-spin" : "")} />
              Erneut versuchen
            </Button>
          </div>
        )}

        {status === "signedIn" && user?.email ? (
          <div className="flex items-center gap-2 text-sm">
            <UserCircle2 className="h-4 w-4 text-primary" />
            <span className="font-medium">{user.email}</span>
            <span className="text-muted-foreground">· angemeldet</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {status === "anonymous"
              ? "Du bist als Gast unterwegs – dein Fortschritt liegt in der Cloud. Erstelle ein Konto, um dich auf weiteren Geräten anzumelden."
              : "Erstelle ein Konto, um deinen Fortschritt geräteübergreifend zu sichern. Kein Konto nötig – du kannst auch als Gast weitermachen."}
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {status !== "signedIn" && (
            <>
              <Button variant="gradient" onClick={() => openAuth("signup")} disabled={busy}>
                Konto erstellen
              </Button>
              <Button variant="outline" onClick={() => openAuth("login")} disabled={busy}>
                Anmelden
              </Button>
            </>
          )}
          {status === "signedOut" && (
            <>
              <TurnstileWidget onToken={setCaptchaToken} />
              <Button
                variant="ghost"
                onClick={() => signInAsGuest(captchaToken ?? undefined)}
                disabled={busy || (TURNSTILE_ENABLED && !captchaToken)}
              >
                Als Gast fortfahren
              </Button>
            </>
          )}
          {syncing && (
            <Button variant="ghost" onClick={signOut} disabled={busy}>
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          )}
        </div>
      </CardContent>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent={intent} />
    </Card>
  );
}
