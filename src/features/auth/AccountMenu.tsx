import { useEffect, useRef, useState } from "react";
import { LogOut, UserCircle2, Cloud, CloudOff, Settings as SettingsIcon, Sun, Moon, Monitor, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { isFounder } from "@/lib/admin";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore, type ThemeMode } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { AuthDialog, type AuthIntent } from "@/features/auth/AuthDialog";
import { cn } from "@/lib/utils";

// Theme control moved off the header into this menu (s-polish): light/system/dark.
const THEME_OPTIONS: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Hell" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dunkel" },
];

/**
 * Compact account control for the top bar. Always visible on every app screen
 * so signing out (and signing in) is one click away instead of buried in
 * Settings. Adapts to auth state: a signed-in user sees their email + Abmelden;
 * a guest or signed-out visitor sees the login / sign-up options.
 */
export function AccountMenu() {
  const { status, user, busy, signOut } = useAuthStore();
  const showToast = useSessionStore((s) => s.showToast);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("signup");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signedIn = status === "signedIn";
  const synced = status === "signedIn" || status === "anonymous";
  const founder = isFounder(user);

  const openAuth = (i: AuthIntent) => {
    setIntent(i);
    setOpen(false);
    setAuthOpen(true);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    showToast("Du wurdest abgemeldet.", "default");
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Konto"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9"
      >
        <UserCircle2 className="h-5 w-5" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-elevated-soft"
        >
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <UserCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {signedIn ? user?.email : status === "anonymous" ? "Gast" : "Nicht angemeldet"}
              </p>
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  synced ? "text-success" : "text-muted-foreground",
                )}
              >
                {synced ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
                {synced ? "Synchronisiert" : "Nur lokal"}
              </p>
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          {/* Design (theme) — moved here from the header. */}
          <div className="px-2 py-1.5">
            <p className="pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Design
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSettings({ themeMode: value })}
                  aria-pressed={themeMode === value}
                  className={cn(
                    "flex min-w-0 items-center justify-center gap-1.5 rounded-lg border px-1 py-2 text-xs font-medium transition-colors",
                    themeMode === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          {!signedIn && (
            <>
              <Button
                variant="gradient"
                className="w-full justify-start px-2"
                onClick={() => openAuth("signup")}
                disabled={busy}
              >
                Konto erstellen
              </Button>
              <Button
                variant="ghost"
                className="mt-1 w-full justify-start px-2"
                onClick={() => openAuth("login")}
                disabled={busy}
              >
                Anmelden
              </Button>
            </>
          )}

          <Link to="/settings" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start px-2">
              <SettingsIcon className="h-4 w-4" />
              Einstellungen
            </Button>
          </Link>

          {founder && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start px-2 text-primary hover:text-primary">
                <ShieldCheck className="h-4 w-4" />
                Kontrollzentrum
              </Button>
            </Link>
          )}

          {synced && (
            <Button
              variant="ghost"
              className="w-full justify-start px-2 text-danger/80 hover:text-danger"
              onClick={handleSignOut}
              disabled={busy}
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          )}
        </div>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent={intent} />
    </div>
  );
}
