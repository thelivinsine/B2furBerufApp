import { useState } from "react";
import { Cloud, CloudOff, LogOut, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthDialog, type AuthIntent } from "@/features/auth/AuthDialog";

/**
 * Account / cloud-sync panel in Settings. Guest-first: the learner can keep
 * using the app with no account (local only). Creating an account (email +
 * password, or Google) turns on cross-device cloud sync; upgrading a guest
 * preserves progress.
 */
export function AccountPanel() {
  const { status, user, busy, signInAsGuest, signOut } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("signup");

  const syncing = status === "anonymous" || status === "signedIn";

  const openAuth = (i: AuthIntent) => {
    setIntent(i);
    setAuthOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Konto & Cloud-Sync</p>
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
              (syncing ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")
            }
          >
            {syncing ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
            {syncing ? "Synchronisiert" : "Nur lokal"}
          </span>
        </div>

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
            <Button variant="ghost" onClick={signInAsGuest} disabled={busy}>
              Als Gast fortfahren
            </Button>
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
