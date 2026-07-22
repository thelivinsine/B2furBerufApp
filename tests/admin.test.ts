import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

describe("server-side email gate lockstep", () => {
  const readMigration = (name: string) =>
    readFileSync(resolve(process.cwd(), "supabase/migrations", name), "utf8");
  const emailsIn = (sql: string) =>
    [...new Set(sql.match(/[a-z0-9.+_-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [])]
      .map((e) => e.toLowerCase())
      .sort();

  it("migration 0007 (provenance_reviews RLS) matches FOUNDER_EMAILS", () => {
    expect(emailsIn(readMigration("0007_provenance_reviews_admins.sql"))).toEqual(
      [...FOUNDER_EMAILS].sort(),
    );
  });

  it("migration 0008 (admin center) gates on exactly FOUNDER_EMAILS", () => {
    const sql = readMigration("0008_admin_center.sql");
    expect(emailsIn(sql)).toEqual([...FOUNDER_EMAILS].sort());
    // The single email source for every 0008 policy and RPC is is_founder();
    // both founder emails must sit inside that function body.
    const fn = sql.match(
      /create or replace function public\.is_founder\(\)[\s\S]*?\$\$;/,
    )?.[0];
    expect(fn).toBeTruthy();
    for (const email of FOUNDER_EMAILS) expect(fn).toContain(email);
  });

  it("every 0008 admin RPC asserts the founder gate in its body", () => {
    const sql = readMigration("0008_admin_center.sql");
    const rpcs = [
      "admin_overview",
      "admin_daily_series",
      "admin_feedback_recent",
      "admin_feedback_update",
    ];
    for (const rpc of rpcs) {
      const body = sql.match(
        new RegExp(
          `create or replace function public\\.${rpc}\\([\\s\\S]*?\\$\\$;`,
        ),
      )?.[0];
      expect(body, `${rpc} definition present`).toBeTruthy();
      expect(body, `${rpc} calls assert_founder()`).toContain(
        "perform public.assert_founder();",
      );
      expect(sql, `${rpc} revoked from public/anon`).toMatch(
        new RegExp(`revoke all on function public\\.${rpc}\\([^)]*\\)\\s+from public, anon`),
      );
    }
  });
});
