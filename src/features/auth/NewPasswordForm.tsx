import { useRef, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/lib/uiLang";

/**
 * The one "set a new password" form, shared by the recovery-link landing page
 * (`ConfirmEmail.tsx`) and the Settings "Passwort ändern/festlegen" row
 * (`AccountPanel.tsx`). Both act on `useAuthStore.setPassword`, which works
 * on any live session (a recovery session or a normal signed-in one).
 *
 * Field markup mirrors `AuthDialog.tsx`'s password input; not shared as a
 * component because that field also carries an iOS autofill-sync hack this
 * form does not need.
 */
export function NewPasswordForm({
  submitLabel,
  onDone,
}: {
  submitLabel: string;
  onDone: () => void;
}) {
  const t = useT();
  const { busy, error, setPassword, clearError } = useAuthStore();
  const [password, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (busy) return;
    if (password.length < 6) {
      setHint("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    setHint(null);
    clearError();
    const ok = await setPassword(password);
    if (ok) onDone();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t("Passwort")}</label>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-surface pl-3 pr-1 focus-within:ring-2 focus-within:ring-ring">
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("Mindestens 6 Zeichen")}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={t(showPassword ? "Passwort verbergen" : "Passwort anzeigen")}
            aria-pressed={showPassword}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {(error || hint) && (
        <p
          role="alert"
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium",
            error ? "bg-danger/10 text-danger" : "bg-accent/20 text-accent-ink",
          )}
        >
          {error ?? hint}
        </p>
      )}

      <Button variant="gradient" className="w-full" onClick={submit} disabled={busy}>
        {submitLabel}
      </Button>
    </div>
  );
}
