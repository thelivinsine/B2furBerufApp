import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * The sign-up confirmation bug (s174) was a READING problem, not a Supabase one:
 * the session arrived in the URL hash and React Router wiped it before anything
 * looked. `lib/authCallback.ts` reads at module-eval time, so these tests import
 * it FRESH per case with the URL already set, which is the only way to exercise
 * a module-level snapshot.
 */
const ORIGINAL = window.location.href;

async function loadWithUrl(url: string) {
  window.history.replaceState(null, "", url);
  vi.resetModules();
  return await import("@/lib/authCallback");
}

beforeEach(() => vi.resetModules());
afterEach(() => window.history.replaceState(null, "", ORIGINAL));

describe("auth callback parameters", () => {
  it("reads the PKCE confirmation token out of the query", async () => {
    const m = await loadWithUrl("/auth/confirm?token_hash=abc123&type=signup");
    expect(m.AUTH_CALLBACK.tokenHash).toBe("abc123");
    expect(m.AUTH_CALLBACK.type).toBe("signup");
    expect(m.hasAuthCallback()).toBe(true);
  });

  it("reads the implicit tokens out of the HASH, which is where Supabase's default template puts them", async () => {
    const m = await loadWithUrl(
      "/auth/confirm#access_token=at-1&refresh_token=rt-1&type=signup",
    );
    expect(m.AUTH_CALLBACK.accessToken).toBe("at-1");
    expect(m.AUTH_CALLBACK.refreshToken).toBe("rt-1");
    // `type` must resolve from the hash too: it is not in the query on this shape.
    expect(m.AUTH_CALLBACK.type).toBe("signup");
    expect(m.hasAuthCallback()).toBe(true);
  });

  it("surfaces an expired or spent link instead of looking like an empty visit", async () => {
    const m = await loadWithUrl(
      "/auth/confirm#error=access_denied&error_description=Email+link+is+invalid+or+has+expired",
    );
    expect(m.AUTH_CALLBACK.errorDescription).toContain("expired");
    expect(m.hasAuthCallback()).toBe(true);
  });

  it("reports nothing to do on an ordinary visit", async () => {
    const m = await loadWithUrl("/auth/confirm");
    expect(m.hasAuthCallback()).toBe(false);
    expect(m.AUTH_CALLBACK.tokenHash).toBeNull();
    expect(m.AUTH_CALLBACK.accessToken).toBeNull();
  });

  it("ignores a bare ?code= (supabase-js consumes that one itself)", async () => {
    const m = await loadWithUrl("/?code=pkce-code");
    expect(m.hasAuthCallback()).toBe(false);
  });

  it("pins the confirmation landing page to this origin, not to a dashboard setting", async () => {
    const m = await loadWithUrl("/");
    expect(m.confirmRedirectUrl()).toBe(`${window.location.origin}/auth/confirm`);
  });
});
