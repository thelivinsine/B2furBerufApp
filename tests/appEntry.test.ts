import { describe, it, expect, afterEach, vi } from "vitest";
import { libraryEntryUrl } from "@/lib/appEntry";

/**
 * A cold open of the bare app root lands on `/library`, not the Spielplatz
 * dashboard (founder s212). `libraryEntryUrl` is the pure decision the
 * module's side-effecting top level acts on; these tests exercise it
 * directly rather than the module-eval `history.replaceState`, same split as
 * `lib/authCallback.ts` / `tests/authCallback.test.ts`.
 */

const ORIGINAL = window.location.href;
afterEach(() => window.history.replaceState(null, "", ORIGINAL));

describe("libraryEntryUrl", () => {
  it("sends a bare root visit to the Bibliothek", () => {
    expect(libraryEntryUrl("/", "", "")).toBe("/library");
  });

  it("leaves every other path alone, Spielplatz included", () => {
    expect(libraryEntryUrl("/library", "", "")).toBeNull();
    expect(libraryEntryUrl("/anwenden", "", "")).toBeNull();
    expect(libraryEntryUrl("/settings", "", "")).toBeNull();
    expect(libraryEntryUrl("/welcome", "", "")).toBeNull();
  });

  it("carries a bare Google OAuth callback's ?code= across, so supabase-js still finds it", () => {
    expect(libraryEntryUrl("/", "?code=pkce-abc123", "")).toBe("/library?code=pkce-abc123");
  });

  it("carries a legacy Supabase confirm-signup hash across untouched", () => {
    expect(libraryEntryUrl("/", "", "#access_token=at-1&refresh_token=rt-1")).toBe(
      "/library#access_token=at-1&refresh_token=rt-1",
    );
  });

  it("carries both search and hash when a link somehow has both", () => {
    expect(libraryEntryUrl("/", "?ref=x", "#y")).toBe("/library?ref=x#y");
  });

  it("actually loading the module redirects a root visit, live", async () => {
    window.history.replaceState(null, "", "/");
    vi.resetModules();
    await import("@/lib/appEntry");
    expect(window.location.pathname).toBe("/library");
  });

  it("does not touch the URL when the module loads on a non-root path", async () => {
    window.history.replaceState(null, "", "/anwenden");
    vi.resetModules();
    await import("@/lib/appEntry");
    expect(window.location.pathname).toBe("/anwenden");
  });
});
