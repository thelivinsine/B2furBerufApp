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
  /** Send a magic-link / OTP to the given email. */
  sendMagicLink: (email: string) => Promise<{ ok: boolean }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function statusFor(user: User | null): AuthStatus {
  if (!user) return "signedOut";
  return user.is_anonymous ? "anonymous" : "signedIn";
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

  sendMagicLink: async (email) => {
    set({ busy: true, error: null });
    // If a guest is signed in, link the email to the SAME uid so progress
    // survives the guest→account upgrade.
    const current = get().user;
    let error;
    if (current?.is_anonymous) {
      ({ error } = await supabase.auth.updateUser({ email }));
    } else {
      ({ error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      }));
    }
    set({ busy: false, error: error ? error.message : null });
    return { ok: !error };
  },

  signOut: async () => {
    set({ busy: true });
    stopCloudSync();
    await supabase.auth.signOut();
    set({ busy: false, session: null, user: null, status: "signedOut" });
  },

  clearError: () => set({ error: null }),
}));
