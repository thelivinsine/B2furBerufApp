import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Sparkles, ShieldCheck, Cloud } from "lucide-react";
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

const copy: Record<AuthIntent, { title: string; description: string; cta: string }> = {
  signup: {
    title: "Konto erstellen",
    description:
      "Sichere deinen Fortschritt und lerne auf allen Geräten weiter. Kein Passwort nötig – wir senden dir einen sicheren Anmeldelink.",
    cta: "Registrieren",
  },
  login: {
    title: "Anmelden",
    description:
      "Gib deine E-Mail ein – wir senden dir einen sicheren Anmeldelink. Kein Passwort nötig.",
    cta: "Anmelden",
  },
};

/**
 * Reusable sign-up / log-in dialog. Passwordless: the learner enters an email
 * and receives a magic link. If they are already a guest (anonymous Supabase
 * session), the email is linked to the SAME account so progress is preserved.
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
  const { busy, sendMagicLink, status } = useAuthStore();
  const showToast = useSessionStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const c = copy[intent];

  const submit = async () => {
    if (!email.trim()) return;
    const { ok } = await sendMagicLink(email.trim());
    if (ok) {
      setSent(true);
      showToast("Anmeldelink gesendet – prüfe dein Postfach.", "success");
    } else {
      showToast("E-Mail konnte nicht gesendet werden. Versuch es erneut.", "warning");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex w-fit rounded-xl bg-accent-gradient p-2.5 text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 rounded-xl border border-success/30 bg-success/5 p-4"
          >
            <div className="flex items-center gap-2 font-medium text-success">
              <Check className="h-4 w-4" /> Link gesendet
            </div>
            <p className="text-sm text-muted-foreground">
              Wir haben einen Anmeldelink an <span className="font-medium text-foreground">{email}</span>{" "}
              geschickt. Öffne ihn auf diesem Gerät, um dich anzumelden.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-Mail</label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="du@beispiel.de"
                className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              variant="gradient"
              className="w-full"
              onClick={submit}
              disabled={busy || !email.trim()}
            >
              <Mail className="h-4 w-4" /> {c.cta}
            </Button>

            {status === "anonymous" && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Cloud className="h-3.5 w-3.5" /> Dein bisheriger Fortschritt wird mit deinem Konto verknüpft.
              </p>
            )}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Kein Passwort. Wir nutzen deine E-Mail nur für die Anmeldung.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
