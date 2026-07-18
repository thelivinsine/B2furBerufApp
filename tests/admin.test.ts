import { describe, it, expect } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isFounder, FOUNDER_EMAILS } from "@/lib/admin";

const asUser = (email?: string) => ({ email }) as User;

describe("admin gate", () => {
  it("admits both founder accounts", () => {
    expect(isFounder(asUser("thelivinsine@gmail.com"))).toBe(true);
    expect(isFounder(asUser("thesuhaspala@gmail.com"))).toBe(true);
  });

  it("is case-insensitive on the email", () => {
    expect(isFounder(asUser("TheLivinSine@Gmail.com"))).toBe(true);
    expect(isFounder(asUser("THESUHASPALA@GMAIL.COM"))).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(isFounder(asUser("someone@example.com"))).toBe(false);
    expect(isFounder(asUser("thelivinsine@gmail.com.evil.com"))).toBe(false);
    expect(isFounder(asUser(undefined))).toBe(false);
    expect(isFounder(null)).toBe(false);
    expect(isFounder(undefined)).toBe(false);
  });

  it("keeps exactly the two intended founder accounts", () => {
    expect([...FOUNDER_EMAILS].sort()).toEqual([
      "thelivinsine@gmail.com",
      "thesuhaspala@gmail.com",
    ]);
  });
});
