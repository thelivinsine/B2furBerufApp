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

import { startCloudSync, stopCloudSync, clearLocalAccountData } from "@/lib/cloudSync";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const SYNC_UID_KEY = "b2beruf.syncUid";

beforeEach(() => {
  stopCloudSync();
  localStorage.clear();
  remoteRows.progress = {};
  remoteRows.profiles = {};
  pushed.progress = [];
  pushed.profiles = [];
  useProgressStore.getState().resetProgress();
  useSettingsStore.getState().resetSettings();
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
