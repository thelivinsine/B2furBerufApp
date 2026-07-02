import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AuthDialog } from "@/features/auth/AuthDialog";

/**
 * Gentle nudge shown to learners who aren't signed in with an email yet
 * (guests / local-only), inviting them to save their progress. Shown once
 * per device on Heute only; dismissal persists (the "Nur lokal" pill in
 * Settings remains the durable reminder afterwards).
 */
export function SaveProgressBanner() {
  const status = useAuthStore((s) => s.status);
  const dismissed = useSettingsStore((s) => s.signInBannerDismissed);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [authOpen, setAuthOpen] = useState(false);

  // Only nudge guests / signed-out learners — never someone already signed in.
  const show = !dismissed && (status === "anonymous" || status === "signedOut");

  return (
    <>
      <AnimatePresence>
        {show && (
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
                Melde dich an, um auf allen Geräten weiterzulernen – kein Passwort nötig.
              </p>
            </div>
            <Button size="sm" variant="gradient" onClick={() => setAuthOpen(true)}>
              Anmelden
            </Button>
            <button
              onClick={() => setSettings({ signInBannerDismissed: true })}
              aria-label="Hinweis schließen"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent="signup" />
    </>
  );
}
