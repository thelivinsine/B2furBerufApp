import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudOff, LogOut, Mail, UserCircle2, Check } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Account / cloud-sync panel. Guest-first: the learner can keep using the app
 * with no account (local only). Signing in as a guest or adding an email turns
 * on cross-device cloud sync. Adding an email to a guest upgrades the SAME
 * account, so progress is preserved.
 */
export function AccountPanel() {
  const { status, user, busy, signInAsGuest, sendMagicLink, signOut } = useAuthStore();
  const showToast = useSessionStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    const { ok } = await sendMagicLink(email.trim());
    if (ok) {
      setSent(true);
      showToast("Link gesendet – prüfe dein E-Mail-Postfach.", "success");
    } else {
      showToast("E-Mail konnte nicht gesendet werden.", "warning");
    }
  };

  const syncing = status === "anonymous" || status === "signedIn";

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Konto & Cloud-Sync</p>
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
              (syncing
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground")
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
              ? "Du bist als Gast angemeldet – dein Fortschritt wird in der Cloud gesichert. Füge eine E-Mail hinzu, um dich auf weiteren Geräten anzumelden."
              : "Melde dich an, um deinen Fortschritt geräteübergreifend zu sichern. Kein Konto nötig – starte als Gast."}
          </p>
        )}

        {/* Email upgrade / sign-in */}
        {status !== "signedIn" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">E-Mail</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSent(false);
                }}
                placeholder="du@beispiel.de"
                className="h-10 flex-1 rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={handleMagicLink} disabled={busy || !email.trim()}>
                {sent ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                {sent ? "Gesendet" : "Link senden"}
              </Button>
            </div>
            {sent && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                Wir haben dir einen Anmeldelink geschickt. Öffne ihn auf diesem Gerät.
              </motion.p>
            )}
          </div>
        )}

        <div className="flex gap-2 border-t border-border pt-3">
          {status === "signedOut" && (
            <Button variant="outline" onClick={signInAsGuest} disabled={busy}>
              Als Gast starten
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
    </Card>
  );
}
