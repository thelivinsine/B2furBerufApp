import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { confirmRedirectUrl } from "@/lib/authCallback";
import { supabase } from "@/lib/supabase";
import { startCloudSync, stopCloudSync, flushCloudSync, clearLocalAccountData } from "@/lib/cloudSync";

type AuthStatus = "loading" | "anonymous" | "signedIn" | "signedOut";

/** What a sign-up / sign-in attempt actually resulted in. */
export interface AuthOutcome {
  /** The call went through without an error. */
  ok: boolean;
  /** Account exists but has no session yet: the email link must be clicked. */
  needsConfirmation: boolean;
  /**
   * The address already has an account, so this was a sign-IN attempt wearing a
   * sign-up form. Only ever true on the sign-up path.
   */
  alreadyRegistered: boolean;
}

/** Turnstile is active only when a site key is configured (matches the auth UI).
 *  When active, guest sign-in must carry a captcha token so the AI budget can't
 *  be drained by automated anonymous sign-ups. Dormant in dev/CI (no key). */
export const TURNSTILE_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  /** True while a sign-in/up network call is in flight. */
  busy: boolean;
  /**
   * True once the FIRST cloud-sync pull for the current session has completed
   * (or failed offline). Route guards use this to avoid redirecting a signed-in
   * account out to the landing page before its cloud profile (which carries the
   * real `onboarded` flag) has loaded on a fresh device. Reset on sign-out and
   * at the start of each cloud sync; see lib/cloudSync.ts.
   */
  syncHydrated: boolean;
  /**
   * Is the cloud actually receiving this device's writes? `"unknown"` until the
   * first push settles, `"failing"` after a run of consecutive failures.
   *
   * supabase-js does not throw on an HTTP or RLS error, it returns `{ error }`,
   * and the push helpers used to ignore that value entirely: a permanently
   * failing sync looked identical to a working one, because localStorage kept
   * the app running. The learner only found out when they lost the device
   * (audit R3). See lib/cloudSync.ts.
   */
  syncHealth: "unknown" | "ok" | "failing";
  /** Epoch ms of the last push that landed, for the Settings status line. */
  lastSyncedAt: number | null;
  error: string | null;

  init: () => void;
  signInAsGuest: (captchaToken?: string) => Promise<void>;
  /** Create an account with email + password (instant, no email round-trip
   *  when "Confirm email" is disabled in Supabase). Upgrades a guest in place.
   *  `needsConfirmation` is true when Supabase requires the user to click a
   *  confirmation link before a session is created. `alreadyRegistered` is true
   *  when the address already has an account (see the note in the action). */
  signUp: (email: string, password: string, captchaToken?: string) => Promise<AuthOutcome>;
  /** Sign in with an existing email + password. */
  signIn: (email: string, password: string, captchaToken?: string) => Promise<AuthOutcome>;
  /** Send the confirmation mail again (link expired, never arrived, wrong tab). */
  resendConfirmation: (email: string) => Promise<boolean>;
  /** One-click sign-in via Google OAuth (redirect flow). */
  signInWithGoogle: (captchaToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Permanently delete the account + all cloud data (GDPR erasure). Calls the
   *  `delete-account` Edge Function (which removes the auth user, cascading to
   *  all rows), then clears local caches and signs out. Irreversible. */
  deleteAccount: () => Promise<boolean>;
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
  syncHydrated: false,
  syncHealth: "unknown",
  lastSyncedAt: null,
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

  signInAsGuest: async (captchaToken) => {
    if (TURNSTILE_ENABLED && !captchaToken) {
      set({ error: "Bitte bestätige zuerst die Sicherheitsprüfung." });
      return;
    }
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInAnonymously(
      captchaToken ? { options: { captchaToken } } : undefined,
    );
    if (error) set({ error: error.message });
    set({ busy: false });
  },

  signUp: async (email, password, captchaToken) => {
    set({ busy: true, error: null });
    // If a guest is signed in, attach email + password to the SAME uid so the
    // guest's progress is preserved as a permanent account.
    const current = get().user;
    let error;
    // Whether the account exists but isn't logged in yet (Supabase "Confirm
    // email" is on → a confirmation link must be clicked first).
    let needsConfirmation: boolean;
    let alreadyRegistered = false;
    if (current?.is_anonymous) {
      // updateUser upgrades an existing authenticated session — no captchaToken needed.
      const { data, error: e } = await supabase.auth.updateUser(
        { email, password },
        { emailRedirectTo: confirmRedirectUrl() },
      );
      error = e;
      // With email confirmation on, the email change is pending and the user
      // stays anonymous until the link is clicked.
      needsConfirmation = !e && (data.user?.is_anonymous ?? false);
    } else {
      const { data, error: e } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Pin the landing page to THIS origin. Without it the link follows the
          // project's Site URL, which is a dashboard setting that can still say
          // localhost, and the learner lands on a dead page.
          emailRedirectTo: confirmRedirectUrl(),
          ...(captchaToken ? { captchaToken } : {}),
        },
      });
      error = e;
      // With "Confirm email" ON, signing up with an address that ALREADY has an
      // account does not error: Supabase deliberately returns a success-shaped
      // response so nobody can probe which addresses are registered. The tell is
      // an empty `identities` array. Without this check the caller cannot
      // distinguish "we mailed you a link" from "you already have an account",
      // and tells a returning user to go and confirm an email that will never
      // arrive (which is exactly what happened, s174).
      alreadyRegistered = !e && (data.user?.identities?.length ?? 1) === 0;
      // No session returned → email confirmation is required before login.
      needsConfirmation = !e && !data.session && !alreadyRegistered;
    }
    set({ busy: false, error: error ? friendlyError(error.message) : null });
    return { ok: !error, needsConfirmation, alreadyRegistered };
  },

  signIn: async (email, password, captchaToken) => {
    set({ busy: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    // An unconfirmed account comes back as an ERROR here, so `needsConfirmation`
    // is read from the message and NOTHING else. It deliberately does not fall
    // back to "no session came back": a successful sign-in that returned a
    // session-less payload for any reason would then be reported as needing
    // confirmation, and the dialog would answer a correct password with "check
    // your inbox". A sign-in with no error is a sign-in.
    const unconfirmed = !!error && error.message.toLowerCase().includes("email not confirmed");
    set({ busy: false, error: error ? friendlyError(error.message) : null });
    void data;
    return { ok: !error, needsConfirmation: unconfirmed, alreadyRegistered: false };
  },

  resendConfirmation: async (email) => {
    set({ busy: true, error: null });
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmRedirectUrl() },
    });
    set({ busy: false, error: error ? friendlyError(error.message) : null });
    return !error;
  },

  signInWithGoogle: async (captchaToken) => {
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Always return to the root, regardless of where sign-in was opened
        // from. This matches the URL registered in Supabase's redirect
        // allowlist and avoids GitHub Pages 404ing on a deep path mid-flow.
        redirectTo: window.location.origin + "/",
        ...(captchaToken ? { captchaToken } : {}),
      },
    });
    if (error) set({ error: friendlyError(error.message), busy: false });
  },

  signOut: async () => {
    set({ busy: true });
    // Push any debounce-pending progress while the session token is still
    // valid; stopCloudSync alone would silently drop it.
    await flushCloudSync();
    stopCloudSync();
    // Wipe the device-global local caches so the next account to sign in on a
    // shared device never sees (or merges in) this account's progress/profile.
    clearLocalAccountData();
    await supabase.auth.signOut();
    set({ busy: false, session: null, user: null, status: "signedOut" });
  },

  deleteAccount: async () => {
    set({ busy: true, error: null });
    // The browser cannot delete an auth user (needs the service role), so this
    // goes through the delete-account Edge Function. supabase.functions.invoke
    // forwards the current session's JWT, which the function uses to identify
    // (and only delete) the caller.
    const { data, error } = await supabase.functions.invoke("delete-account", {
      method: "POST",
    });
    const ok = !error && (data?.ok ?? false);
    if (!ok) {
      set({
        busy: false,
        error: friendlyError(error?.message ?? data?.message ?? "Konto konnte nicht gelöscht werden."),
      });
      return false;
    }
    // Teardown: stop sync, wipe local caches, sign out the (now invalid) session.
    stopCloudSync();
    try {
      localStorage.removeItem("b2beruf.progress.v1");
      localStorage.removeItem("b2beruf.settings.v1");
    } catch {
      /* ignore storage errors */
    }
    // Reset the in-memory stores and forget which account owned the local cache.
    clearLocalAccountData();
    try {
      await supabase.auth.signOut();
    } catch {
      /* token is already invalid post-deletion; ignore */
    }
    set({ busy: false, session: null, user: null, status: "signedOut" });
    return true;
  },

  clearError: () => set({ error: null }),
}));
