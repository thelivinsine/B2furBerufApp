import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AuthDialog } from "@/features/auth/AuthDialog";

/**
 * Gentle nudge shown to learners who aren't signed in with an email yet
 * (guests / local-only), inviting them to save their progress. Dismissal
 * persists (the "Nur lokal" pill in Settings remains the durable reminder).
 *
 * `variant`:
 *  - `banner` (default): the original horizontal card (mobile, top of Heute).
 *  - `sidebar`: a compact vertical card that sits at the bottom of the desktop
 *    navigation panel.
 */
export function SaveProgressBanner({
  variant = "banner",
}: {
  variant?: "banner" | "sidebar";
}) {
  const status = useAuthStore((s) => s.status);
  const dismissed = useSettingsStore((s) => s.signInBannerDismissed);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [authOpen, setAuthOpen] = useState(false);

  // Only nudge guests / signed-out learners — never someone already signed in.
  const show = !dismissed && (status === "anonymous" || status === "signedOut");
  const dismiss = () => setSettings({ signInBannerDismissed: true });

  return (
    <>
      <AnimatePresence>
        {show &&
          (variant === "sidebar" ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="rounded-xl border border-primary/25 bg-primary/10 p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <CloudUpload className="h-4 w-4" />
                </div>
                <p className="min-w-0 flex-1 text-sm font-semibold leading-tight">
                  Sichere deinen Fortschritt
                </p>
                <button
                  onClick={dismiss}
                  aria-label="Hinweis schließen"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                Melde dich an, um auf allen Geräten weiterzulernen. Kein Passwort nötig.
              </p>
              <Button
                size="sm"
                variant="gradient"
                className="mt-3 w-full"
                onClick={() => setAuthOpen(true)}
              >
                Anmelden
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="mb-5 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 p-3.5 sm:p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Sichere deinen Fortschritt</p>
                <p className="text-xs text-muted-foreground">
                  Melde dich an, um auf allen Geräten weiterzulernen. Kein Passwort nötig.
                </p>
              </div>
              <Button size="sm" variant="gradient" onClick={() => setAuthOpen(true)}>
                Anmelden
              </Button>
              <button
                onClick={dismiss}
                aria-label="Hinweis schließen"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
      </AnimatePresence>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent="signup" />
    </>
  );
}
