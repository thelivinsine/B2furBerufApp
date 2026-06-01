import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { startCloudSync, stopCloudSync } from "@/lib/cloudSync";

type AuthStatus = "loading" | "anonymous" | "signedIn" | "signedOut";

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  /** True while a sign-in/up network call is in flight. */
  busy: boolean;
  error: string | null;

  init: () => void;
  signInAsGuest: () => Promise<void>;
  /** Create an account with email + password (instant, no email round-trip
   *  when "Confirm email" is disabled in Supabase). Upgrades a guest in place. */
  signUp: (email: string, password: string) => Promise<{ ok: boolean }>;
  /** Sign in with an existing email + password. */
  signIn: (email: string, password: string) => Promise<{ ok: boolean }>;
  /** One-click sign-in via Google OAuth (redirect flow). */
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function statusFor(user: User | null): AuthStatus {
  if (!user) return "signedOut";
  return user.is_anonymous ? "anonymous" : "signedIn";
}

/** Turn common Supabase auth errors into friendly German copy. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-Mail oder Passwort ist falsch.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Diese E-Mail ist bereits registriert. Melde dich an.";
  if (m.includes("email not confirmed")) return "Bitte bestätige zuerst deine E-Mail.";
  if (m.includes("password")) return "Das Passwort muss mindestens 6 Zeichen haben.";
  if (m.includes("rate limit") || m.includes("too many")) return "Zu viele Versuche. Bitte warte kurz.";
  return message;
}

let initialised = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  status: "loading",
  busy: false,
  error: null,

  init: () => {
    if (initialised) return;
    initialised = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const user = data.session?.user ?? null;
        set({ session: data.session, user, status: statusFor(user) });
        if (user) startCloudSync(user.id);
      })
      .catch(() => set({ status: "signedOut" }));

    supabase.auth.onAuthStateChange((_event, session) => {
      const prevId = get().user?.id;
      const user = session?.user ?? null;
      set({ session, user, status: statusFor(user) });
      if (user && user.id !== prevId) startCloudSync(user.id);
      if (!user) stopCloudSync();
    });
  },

  signInAsGuest: async () => {
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInAnonymously();
    if (error) set({ error: error.message });
    set({ busy: false });
  },

  signUp: async (email, password) => {
    set({ busy: true, error: null });
    // If a guest is signed in, attach email + password to the SAME uid so the
    // guest's progress is preserved as a permanent account.
    const current = get().user;
    let error;
    if (current?.is_anonymous) {
      ({ error } = await supabase.auth.updateUser({ email, password }));
    } else {
      ({ error } = await supabase.auth.signUp({ email, password }));
    }
    set({ busy: false, error: error ? friendlyError(error.message) : null });
    return { ok: !error };
  },

  signIn: async (email, password) => {
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ busy: false, error: error ? friendlyError(error.message) : null });
    return { ok: !error };
  },

  signInWithGoogle: async () => {
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (error) set({ error: friendlyError(error.message), busy: false });
  },

  signOut: async () => {
    set({ busy: true });
    stopCloudSync();
    await supabase.auth.signOut();
    set({ busy: false, session: null, user: null, status: "signedOut" });
  },

  clearError: () => set({ error: null }),
}));
