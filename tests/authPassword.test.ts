import { describe, it, expect } from "vitest";
import type { User, UserIdentity } from "@supabase/supabase-js";
import { hasPasswordIdentity } from "@/store/useAuthStore";

function identity(provider: string): UserIdentity {
  return { provider } as UserIdentity;
}

function user(overrides: Partial<User>): User {
  return { app_metadata: {}, user_metadata: {}, identities: [], ...overrides } as User;
}

describe("hasPasswordIdentity", () => {
  it("is true for an account with an email identity", () => {
    expect(hasPasswordIdentity(user({ identities: [identity("email")] }))).toBe(true);
  });

  it("is false for a Google-only account", () => {
    expect(hasPasswordIdentity(user({ identities: [identity("google")] }))).toBe(false);
  });

  it("falls back to app_metadata.providers when identities is empty", () => {
    expect(
      hasPasswordIdentity(user({ identities: [], app_metadata: { providers: ["email"] } })),
    ).toBe(true);
  });

  it("is false for a guest with no identities", () => {
    expect(hasPasswordIdentity(user({ identities: [] }))).toBe(false);
  });

  it("is false for no user", () => {
    expect(hasPasswordIdentity(null)).toBe(false);
  });
});
