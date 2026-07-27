/**
 * Capture the auth parameters that arrive in the URL, BEFORE anything else runs.
 *
 * Supabase can hand a session back in three shapes, depending on the flow and on
 * which email template the project uses:
 *
 *   1. `?token_hash=…&type=signup`  — the PKCE-safe confirmation link. Exchanged
 *      with `verifyOtp()`. This is what our own email template asks for.
 *   2. `?code=…`                    — the PKCE OAuth callback (Google sign-in).
 *      supabase-js picks this up itself via `detectSessionInUrl`.
 *   3. `#access_token=…&refresh_token=…` — the IMPLICIT callback, which is what
 *      Supabase's DEFAULT "Confirm signup" template still produces.
 *
 * Shape 3 is the reason this module exists and why it is imported first in
 * `main.tsx`. The tokens live in the URL *hash*, and React Router rewrites the
 * URL as it mounts, so by the time any component looks the hash is already gone
 * (the same collision that made Google sign-in fail before the client moved to
 * PKCE, see `lib/supabase.ts`). Reading `window.location.hash` at module-eval
 * time happens before `createRoot()`, so the values are still there.
 *
 * Nothing here talks to the network. It only remembers what the URL said, so
 * `/auth/confirm` can act on it whenever it mounts.
 */

export interface AuthCallbackParams {
  /** PKCE confirmation token from our email template (shape 1). */
  tokenHash: string | null;
  /** What the link is confirming: signup, recovery, email_change, … */
  type: string | null;
  /** Implicit-flow tokens from Supabase's default template (shape 3). */
  accessToken: string | null;
  refreshToken: string | null;
  /** An error Supabase reported in the link itself (expired, already used). */
  errorDescription: string | null;
}

function readCallbackParams(): AuthCallbackParams {
  if (typeof window === "undefined") {
    return {
      tokenHash: null,
      type: null,
      accessToken: null,
      refreshToken: null,
      errorDescription: null,
    };
  }
  const search = new URLSearchParams(window.location.search);
  // The hash arrives as "#access_token=…&refresh_token=…", so drop the "#".
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const pick = (key: string) => search.get(key) ?? hash.get(key);
  return {
    tokenHash: pick("token_hash"),
    type: pick("type"),
    accessToken: hash.get("access_token"),
    refreshToken: hash.get("refresh_token"),
    errorDescription: pick("error_description") ?? pick("error"),
  };
}

/** Snapshot taken at import time (see the note above about the hash). */
export const AUTH_CALLBACK: AuthCallbackParams = readCallbackParams();

/** True when this page load carries something `/auth/confirm` can act on. */
export function hasAuthCallback(): boolean {
  return Boolean(
    AUTH_CALLBACK.tokenHash ||
      AUTH_CALLBACK.accessToken ||
      AUTH_CALLBACK.errorDescription,
  );
}

/**
 * Where a confirmation link should land. Pinned to the running origin rather
 * than read from the project's Site URL, so a dashboard setting cannot send a
 * learner to localhost. Must stay inside Supabase's redirect allowlist.
 */
export function confirmRedirectUrl(): string {
  return `${window.location.origin}/auth/confirm`;
}
