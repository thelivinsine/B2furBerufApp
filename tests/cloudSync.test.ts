import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Account-isolation regression suite (s517d1). The bug: on a shared device the
 * device-global localStorage cache (progress + settings) was merged into every
 * account that logged in, so account A's XP/streak/SRS/saved words leaked into
 * account B's view AND were pushed up to B's cloud row. These tests pin the fix:
 * switching to a different account wipes the local cache first; the guest/first
 * sync preserves it.
 */

// In-memory stand-in for the two Supabase tables, keyed by account id.
const remoteRows: Record<"progress" | "profiles", Record<string, Record<string, unknown>>> = {
  progress: {},
  profiles: {},
};
// Everything upsert() was asked to write, so we can assert what got pushed up.
const pushed: Record<"progress" | "profiles", Record<string, unknown>[]> = {
  progress: [],
  profiles: [],
};

/**
 * What upsert() should return, per table. `null` = success. Set this to make a
 * push fail the way supabase-js actually fails: a returned `{ error }`, never a
 * thrown exception (which is exactly why the failure used to go unnoticed).
 */
const upsertError: Record<"progress" | "profiles", { code?: string; message?: string } | null> = {
  progress: null,
  profiles: null,
};

function makeQuery(table: "progress" | "profiles") {
  const state: { uid?: string } = {};
  const q = {
    select: () => q,
    eq: (_col: string, val: string) => {
      state.uid = val;
      return q;
    },
    maybeSingle: async () => ({ data: remoteRows[table][state.uid ?? ""] ?? null, error: null }),
    upsert: async (row: Record<string, unknown>) => {
      pushed[table].push(row);
      const error = upsertError[table];
      if (error) return { error };
      const key = String(table === "progress" ? row.user_id : row.id);
      remoteRows[table][key] = row;
      return { error: null };
    },
  };
  return q;
}

vi.mock("@/lib/supabase", () => ({
  supabase: { from: (t: "progress" | "profiles") => makeQuery(t) },
  SUPABASE_CONFIGURED: true,
}));

import {
  startCloudSync,
  stopCloudSync,
  clearLocalAccountData,
  retryCloudSync,
} from "@/lib/cloudSync";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";

const SYNC_UID_KEY = "b2beruf.syncUid";

beforeEach(() => {
  stopCloudSync();
  localStorage.clear();
  remoteRows.progress = {};
  remoteRows.profiles = {};
  pushed.progress = [];
  pushed.profiles = [];
  upsertError.progress = null;
  upsertError.profiles = null;
  useProgressStore.getState().resetProgress();
  useSettingsStore.getState().resetSettings();
  useAuthStore.setState({ syncHealth: "unknown", lastSyncedAt: null });
});

afterEach(() => {
  stopCloudSync();
});

describe("cloud sync account isolation", () => {
  it("wipes the previous account's local cache before syncing a different account", async () => {
    // Account B's real cloud data.
    remoteRows.progress["B"] = { user_id: "B", xp: 5, saved_words: ["b_word"] };
    remoteRows.profiles["B"] = { id: "B", name: "Beatrix", settings: {} };

    // Simulate account A having been synced on this device, then leaving its
    // data behind in the shared cache (the pre-fix sign-out did not clear it).
    localStorage.setItem(SYNC_UID_KEY, "A");
    useProgressStore.setState({ xp: 100, savedWords: ["a_word"] });

    await startCloudSync("B");

    const s = useProgressStore.getState();
    // A's progress must be gone; only B's remote survives.
    expect(s.xp).toBe(5);
    expect(s.savedWords).toEqual(["b_word"]);
    expect(s.savedWords).not.toContain("a_word");
    expect(localStorage.getItem(SYNC_UID_KEY)).toBe("B");

    // And nothing A-shaped was ever pushed up to B's cloud row.
    const pushedToB = pushed.progress.find((r) => r.user_id === "B");
    expect(pushedToB).toBeDefined();
    expect(pushedToB?.xp).toBe(5);
    expect(pushedToB?.saved_words).toEqual(["b_word"]);
  });

  it("preserves local progress on the first-ever sync (guest / offline play)", async () => {
    // No sync marker yet: this device's local progress is the current user's own
    // (a guest that just authenticated, or an install upgrading to this build).
    remoteRows.progress["G"] = { user_id: "G", xp: 3, saved_words: ["remote"] };
    useProgressStore.setState({ xp: 40, savedWords: ["local_guest"] });

    await startCloudSync("G");

    const s = useProgressStore.getState();
    // Merge, not wipe: local guest progress is kept (Math.max / union).
    expect(s.xp).toBe(40);
    expect(s.savedWords).toEqual(expect.arrayContaining(["local_guest", "remote"]));
    expect(localStorage.getItem(SYNC_UID_KEY)).toBe("G");
  });

  it("does not wipe when the same account re-syncs", async () => {
    remoteRows.progress["A"] = { user_id: "A", xp: 2, saved_words: [] };
    localStorage.setItem(SYNC_UID_KEY, "A");
    useProgressStore.setState({ xp: 100, savedWords: ["a_word"] });

    await startCloudSync("A");

    // Same owner: its local progress is preserved and merged with its own row.
    const s = useProgressStore.getState();
    expect(s.xp).toBe(100);
    expect(s.savedWords).toContain("a_word");
  });

  it("clearLocalAccountData resets both stores and forgets the account", () => {
    localStorage.setItem(SYNC_UID_KEY, "A");
    useProgressStore.setState({ xp: 100, savedWords: ["a_word"] });
    useSettingsStore.setState({ name: "Anna", onboarded: true });

    clearLocalAccountData();

    expect(useProgressStore.getState().xp).toBe(0);
    expect(useProgressStore.getState().savedWords).toEqual([]);
    expect(useSettingsStore.getState().name).toBe("");
    expect(useSettingsStore.getState().onboarded).toBe(false);
    expect(localStorage.getItem(SYNC_UID_KEY)).toBeNull();
  });
});

/**
 * The onboarding loop (s174). `onboarded` rides the profile's `settings` jsonb
 * and was being pushed up correctly, but the read path gated adoption on
 * `profile.name`, which onboarding never collects. So the flag never came back
 * and every sign-in on a device restarted onboarding.
 */
describe("onboarded survives a re-login", () => {
  it("adopts the cloud profile of an account that finished onboarding, with no name set", async () => {
    remoteRows.profiles["acct-a"] = {
      id: "acct-a",
      // Exactly what onboarding produces: goal + level, and an empty name.
      name: "",
      goal: "pruefung",
      level: "B2",
      settings: { onboarded: true, mode: "beides" },
    };
    // A different account synced here last, so the local cache is wiped first
    // and `onboarded` can ONLY come back from the cloud.
    localStorage.setItem(SYNC_UID_KEY, "acct-b");

    await startCloudSync("acct-a");

    expect(useSettingsStore.getState().onboarded).toBe(true);
    expect(useSettingsStore.getState().level).toBe("B2");
  });

  it("does NOT adopt the empty row the sign-up trigger creates", async () => {
    // A brand-new account: the trigger made a profile of nulls, nothing else.
    remoteRows.profiles["fresh"] = { id: "fresh", name: null, settings: {} };
    localStorage.setItem(SYNC_UID_KEY, "acct-b");

    await startCloudSync("fresh");

    // Still not onboarded, so the route guard sends them to onboarding once.
    expect(useSettingsStore.getState().onboarded).toBe(false);
  });

  it("keeps local settings when this device already onboarded", async () => {
    useSettingsStore.getState().completeOnboarding({ goal: "beruf", level: "B1" });
    remoteRows.profiles["acct-a"] = {
      id: "acct-a",
      name: "",
      settings: { onboarded: true },
      level: "C1",
    };

    await startCloudSync("acct-a");

    // Local wins; the write-through pushes local → cloud, not the reverse.
    expect(useSettingsStore.getState().level).toBe("B1");
  });
});

/**
 * s215: a device that had `onboarded: true` locally from years of guest/offline
 * use, but had never synced ANY account, let a brand-new account inherit that
 * flag and skip straight to the dashboard without ever asking "Wofür lernst du
 * Deutsch?". The shared-device wipe only fires for a DIFFERENT previous
 * account, so a device with no sync history at all kept its local flag. The
 * cloud is now the authority: a local `onboarded: true` is only trusted when
 * some account has synced on this device before.
 */
describe("a device's local onboarding flag is not inherited by a new account (s215)", () => {
  it("does not let a stale local flag skip onboarding on the device's first-ever sync", async () => {
    // Local history: onboarded, but this device has NEVER synced any account
    // (no SYNC_UID_KEY at all).
    useSettingsStore.getState().completeOnboarding({ goal: "beruf", level: "B1" });
    // The auto-provision trigger's empty row for a genuinely brand-new account.
    remoteRows.profiles["brand-new"] = { id: "brand-new", name: null, settings: {} };

    await startCloudSync("brand-new");

    expect(useSettingsStore.getState().onboarded).toBe(false);
  });

  it("does NOT reset a returning account just because its cloud pull is momentarily stale", async () => {
    useSettingsStore.getState().completeOnboarding({ goal: "beruf", level: "B1" });
    // This account HAS synced on this device before (the returning-device case).
    localStorage.setItem(SYNC_UID_KEY, "acct-a");
    // Cloud row hasn't caught up to `onboarded: true` yet (e.g. offline push).
    remoteRows.profiles["acct-a"] = { id: "acct-a", name: "", settings: {} };

    await startCloudSync("acct-a");

    expect(useSettingsStore.getState().onboarded).toBe(true);
  });
});

/**
 * Sync health (database architecture audit R3, s185). supabase-js returns
 * `{ error }` instead of throwing, and the push helpers ignored that value
 * entirely: a push that never landed looked exactly like one that did, so a
 * learner could believe their progress was backed up for months while nothing
 * reached the cloud. These tests pin that a run of failures becomes visible and
 * that recovery clears it.
 */
describe("sync health is reported, not swallowed", () => {
  it("marks the sync as failing after a run of rejected pushes", async () => {
    await startCloudSync("acct-h");
    // The cloud starts rejecting writes (expired token, RLS, quota).
    upsertError.progress = { code: "42501", message: "permission denied" };

    // Three consecutive failures is the alarm threshold.
    await retryCloudSync();
    await retryCloudSync();
    expect(useAuthStore.getState().syncHealth).not.toBe("failing");
    await retryCloudSync();

    expect(useAuthStore.getState().syncHealth).toBe("failing");
  });

  it("clears the alarm and stamps the time once pushes land again", async () => {
    await startCloudSync("acct-h");
    upsertError.progress = { code: "42501", message: "permission denied" };
    await retryCloudSync();
    await retryCloudSync();
    await retryCloudSync();
    expect(useAuthStore.getState().syncHealth).toBe("failing");

    upsertError.progress = null;
    await retryCloudSync();

    expect(useAuthStore.getState().syncHealth).toBe("ok");
    expect(useAuthStore.getState().lastSyncedAt).toBeGreaterThan(0);
  });

  it("retries without the young columns when the migration has not landed yet", async () => {
    // The site deploy can beat the migration deploy, so a column the client
    // writes may not exist for a few minutes. The whole upsert fails on it.
    upsertError.progress = {
      code: "PGRST204",
      message: "Could not find the 'active_days_folded' column of 'progress'",
    };
    await startCloudSync("acct-young");

    const attempts = pushed.progress.filter((r) => r.user_id === "acct-young");
    // First attempt carries the column, the retry drops it rather than
    // stranding every push in the deploy window.
    expect(attempts[0]).toHaveProperty("active_days_folded");
    expect(attempts.at(-1)).not.toHaveProperty("active_days_folded");
  });

  it("reports a healthy sync as ok", async () => {
    await startCloudSync("acct-ok");
    expect(useAuthStore.getState().syncHealth).toBe("ok");
    expect(useAuthStore.getState().lastSyncedAt).toBeGreaterThan(0);
  });
});
