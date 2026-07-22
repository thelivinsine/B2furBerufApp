import { supabase } from "@/lib/supabase";

/**
 * Client wrappers for the admin-center backend (migration 0008). Every call is
 * best-effort and fail-soft: on error/offline the fetchers return null or an
 * empty list and the writers return false, so admin tiles degrade gracefully.
 * The REAL gate is server-side (assert_founder() inside every RPC plus the
 * founder-only RLS policies); the client isFounder() check only decides
 * whether admin UI renders. A non-founder session calling these gets a
 * Postgres permission error, which surfaces here as the fail-soft value.
 */

export interface AdminOverview {
  generatedAt: string;
  accounts: {
    total: number;
    anonymous: number;
    email: number;
    google: number;
    new7d: number;
  };
  activity: {
    activeToday: number;
    active7d: number;
    totalSessions: number;
    totalXp: number;
    srsCards: number;
  };
  ai: {
    month: string;
    calls: number;
    costEstimate: number;
    evals30d: number;
    cachedEvals30d: number;
  };
  feedback: {
    total: number;
    neu: number;
    emailedToday: number;
  };
  reviews: {
    decided: number;
    approvedUnapplied: number;
    rejectedOpen: number;
    needsFixOpen: number;
  };
}

export type FeedbackStatus = "neu" | "erledigt" | "verworfen";
export type FeedbackPriority = "hoch" | "normal" | "niedrig";

export interface AdminFeedbackItem {
  id: string;
  createdAt: string;
  userId: string | null;
  email: string | null;
  message: string;
  page: string | null;
  userAgent: string | null;
  emailed: boolean;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  note: string | null;
  link: string | null;
}

export interface AdminDailyPoint {
  day: string; // YYYY-MM-DD
  signups: number;
  actives: number;
}

/** Headline aggregates for the Uebersicht cockpit. Null on error/offline. */
export async function fetchAdminOverview(): Promise<AdminOverview | null> {
  try {
    const { data, error } = await supabase.rpc("admin_overview");
    if (error || !data) return null;
    return data as AdminOverview;
  } catch {
    return null;
  }
}

/** Last 30 days of signups + actives. Empty on error/offline. */
export async function fetchAdminDailySeries(): Promise<AdminDailyPoint[]> {
  try {
    const { data, error } = await supabase.rpc("admin_daily_series");
    if (error || !Array.isArray(data)) return [];
    return data as AdminDailyPoint[];
  } catch {
    return [];
  }
}

/** Newest feedback rows for the inbox (default 50). Empty on error/offline. */
export async function fetchAdminFeedback(limit = 50): Promise<AdminFeedbackItem[]> {
  try {
    const { data, error } = await supabase.rpc("admin_feedback_recent", {
      p_limit: limit,
    });
    if (error || !Array.isArray(data)) return [];
    return data as AdminFeedbackItem[];
  } catch {
    return [];
  }
}

/**
 * Triage one feedback row. Undefined leaves a field unchanged; an empty
 * string clears note/link. Returns whether the write landed.
 */
export async function updateAdminFeedback(
  id: string,
  patch: {
    status?: FeedbackStatus;
    priority?: FeedbackPriority;
    note?: string;
    link?: string;
  },
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("admin_feedback_update", {
      p_id: id,
      p_status: patch.status ?? null,
      p_priority: patch.priority ?? null,
      p_note: patch.note ?? null,
      p_link: patch.link ?? null,
    });
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// app_config (Steuerung remote config). World-readable, founder-writable RLS.
// The runtime consumer plumbing (typed schema + cache + zustand store) lands
// in chunk 7 as src/lib/appConfig.ts; these are the raw table helpers.
// ---------------------------------------------------------------------------

/** Every remote-config entry, keyed by config key. Empty on error/offline. */
export async function fetchAppConfigEntries(): Promise<Map<string, unknown>> {
  const map = new Map<string, unknown>();
  try {
    const { data, error } = await supabase.from("app_config").select("key, value");
    if (error || !data) return map;
    for (const row of data as { key: string; value: unknown }[]) {
      map.set(row.key, row.value);
    }
  } catch {
    /* best-effort: keep the map empty */
  }
  return map;
}

/** Upsert one remote-config entry. Returns whether the write landed. */
export async function saveAppConfigEntry(
  key: string,
  value: unknown,
  updatedBy: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("app_config").upsert({
      key,
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/** Remove one remote-config entry (falls back to the compiled default). */
export async function deleteAppConfigEntry(key: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("app_config").delete().eq("key", key);
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// launch_checklist (founder-only RLS; items seeded by the admin UI in chunk 6).
// ---------------------------------------------------------------------------

export interface LaunchChecklistState {
  itemId: string;
  done: boolean;
  note: string | null;
}

/** Saved checklist state keyed by item id. Empty on error/offline or for a
 *  non-founder session (RLS returns no rows). */
export async function fetchLaunchChecklist(): Promise<Map<string, LaunchChecklistState>> {
  const map = new Map<string, LaunchChecklistState>();
  try {
    const { data, error } = await supabase
      .from("launch_checklist")
      .select("item_id, done, note");
    if (error || !data) return map;
    for (const row of data as { item_id: string; done: boolean; note: string | null }[]) {
      map.set(row.item_id, { itemId: row.item_id, done: row.done, note: row.note });
    }
  } catch {
    /* best-effort: keep the map empty */
  }
  return map;
}

/** Upsert one checklist item's state. Returns whether the write landed. */
export async function saveLaunchChecklistItem(
  state: LaunchChecklistState,
  updatedBy: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("launch_checklist").upsert({
      item_id: state.itemId,
      done: state.done,
      note: state.note,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
