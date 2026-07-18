import { remapProgressIds } from "@/lib/idRenames";
import { supabase } from "@/lib/supabase";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { SrsCard } from "@/types";

/**
 * Offline-first cloud sync. localStorage (zustand persist) stays the local
 * cache and source of truth for the running app; this layer (a) pulls the
 * remote row on login and MERGES it with local state so a guest's local
 * progress is never lost, then (b) write-throughs subsequent local changes to
 * Supabase, debounced. Every call is best-effort: network failure is swallowed
 * so the UI keeps working offline.
 */

let userId: string | null = null;
let applyingRemote = false; // guard against echo writes while merging
let unsubProgress: (() => void) | null = null;
let unsubSettings: (() => void) | null = null;
let progressTimer: ReturnType<typeof setTimeout> | null = null;
let settingsTimer: ReturnType<typeof setTimeout> | null = null;

const DEBOUNCE_MS = 1500;

/**
 * The account id whose data currently sits in the device-global localStorage
 * cache. Persisted so that switching accounts on a SHARED DEVICE is detected
 * across reloads: if the incoming account differs from this, the local cache
 * belongs to someone else and must be wiped before we pull/merge/push, so one
 * account's progress can never leak into (or be uploaded to) another's row.
 */
const SYNC_UID_KEY = "b2beruf.syncUid";

function readSyncedUid(): string | null {
  try {
    return localStorage.getItem(SYNC_UID_KEY);
  } catch {
    return null;
  }
}

function writeSyncedUid(uid: string) {
  try {
    localStorage.setItem(SYNC_UID_KEY, uid);
  } catch {
    /* ignore storage errors (private mode, quota) */
  }
}

function clearSyncedUid() {
  try {
    localStorage.removeItem(SYNC_UID_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Wipe the device-global local caches back to a clean slate. Used when a
 * different account starts syncing on the same device and on sign-out, so no
 * trace of the previous account's progress/settings can merge into or be shown
 * under the next one. Resets in-memory store state (UI updates immediately) and,
 * via zustand persist, the localStorage rows too.
 */
function resetLocalStores() {
  applyingRemote = true;
  useProgressStore.getState().resetProgress();
  useSettingsStore.getState().resetSettings();
  applyingRemote = false;
}

/**
 * Clear all locally-cached account data and forget which account owned it.
 * Called on sign-out so the sign-in screen (and the next account to log in on a
 * shared device) never sees the previous user's progress or profile.
 */
export function clearLocalAccountData() {
  resetLocalStores();
  clearSyncedUid();
}

type ProgressSnapshot = ReturnType<typeof useProgressStore.getState>;
type SettingsSnapshot = ReturnType<typeof useSettingsStore.getState>;

/* ----------------------------- merge helpers ----------------------------- */

function mergeNumberMax(a: Record<string, number>, b: Record<string, number>) {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

function mergeSrs(
  a: Record<string, SrsCard>,
  b: Record<string, SrsCard>,
): Record<string, SrsCard> {
  const out: Record<string, SrsCard> = { ...a };
  for (const [k, card] of Object.entries(b)) {
    const cur = out[k];
    // Keep the more-reviewed card; tie-break on the later due date.
    if (!cur || card.reps > cur.reps || (card.reps === cur.reps && card.due > cur.due)) {
      out[k] = card;
    }
  }
  return out;
}

function unionStrings(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

/** Merge a remote progress row into the local progress store (local wins ties). */
function mergeRemoteProgress(remote: Record<string, unknown> | null) {
  if (!remote) return;
  const s = useProgressStore.getState();
  // A remote row written by an older client may still carry pre-rename content
  // ids; remap BEFORE merging so old and new keys collapse instead of forking.
  const r = remapProgressIds({
    srs: (remote.srs as Record<string, SrsCard>) ?? {},
    redemittelSeen: (remote.redemittel_seen as Record<string, number>) ?? {},
    savedWords: (remote.saved_words as string[]) ?? [],
    scenariosDone: (remote.scenarios_done as string[]) ?? [],
  });
  const examsLocal = s.examsDone;
  const examsRemote = (remote.exams_done as typeof examsLocal) ?? [];
  const examKey = (e: { id: string; date: string; score: number }) =>
    `${e.id}|${e.date}|${e.score}`;
  const examsMap = new Map(examsLocal.map((e) => [examKey(e), e]));
  for (const e of examsRemote) examsMap.set(examKey(e), e);

  applyingRemote = true;
  useProgressStore.setState({
    xp: Math.max(s.xp, (remote.xp as number) ?? 0),
    dailyXp: mergeNumberMax(s.dailyXp, (remote.daily_xp as Record<string, number>) ?? {}),
    streak: Math.max(s.streak, (remote.streak as number) ?? 0),
    longestStreak: Math.max(s.longestStreak, (remote.longest_streak as number) ?? 0),
    lastActiveDay:
      [s.lastActiveDay, remote.last_active_day as string | null]
        .filter(Boolean)
        .sort()
        .pop() ?? null,
    activeDays: unionStrings(s.activeDays, (remote.active_days as string[]) ?? []),
    srs: mergeSrs(s.srs, r.srs ?? {}),
    redemittelSeen: mergeNumberMax(s.redemittelSeen, r.redemittelSeen ?? {}),
    scenariosDone: unionStrings(s.scenariosDone, r.scenariosDone ?? []),
    examsDone: Array.from(examsMap.values()),
    totalSessions: Math.max(s.totalSessions, (remote.total_sessions as number) ?? 0),
    savedWords: unionStrings(s.savedWords, r.savedWords ?? []),
  });
  applyingRemote = false;
}

/** Adopt remote profile/settings on login when the local profile is empty. */
function mergeRemoteSettings(profile: Record<string, unknown> | null) {
  if (!profile) return;
  const local = useSettingsStore.getState();
  const remoteSettings = (profile.settings as Partial<SettingsSnapshot>) ?? {};
  // Only overwrite local settings from the cloud when the local user has not
  // completed onboarding yet (fresh device); otherwise keep local and let the
  // write-through push local → cloud.
  if (local.onboarded) return;
  if (!profile.name) return;
  applyingRemote = true;
  useSettingsStore.setState({
    name: (profile.name as string) ?? local.name,
    level: (profile.level as SettingsSnapshot["level"]) ?? local.level,
    goal: (profile.goal as SettingsSnapshot["goal"]) ?? local.goal,
    examDate: (profile.exam_date as string | null) ?? local.examDate,
    dailyGoalXp: (profile.daily_goal_xp as number) ?? local.dailyGoalXp,
    ...remoteSettings,
    onboarded: true,
  });
  applyingRemote = false;
}

/* ------------------------------ push helpers ------------------------------ */

function progressRow(s: ProgressSnapshot) {
  return {
    user_id: userId,
    xp: s.xp,
    daily_xp: s.dailyXp,
    streak: s.streak,
    longest_streak: s.longestStreak,
    last_active_day: s.lastActiveDay,
    active_days: s.activeDays,
    srs: s.srs,
    redemittel_seen: s.redemittelSeen,
    scenarios_done: s.scenariosDone,
    exams_done: s.examsDone,
    total_sessions: s.totalSessions,
    saved_words: s.savedWords,
    updated_at: new Date().toISOString(),
  };
}

function profileRow(s: SettingsSnapshot) {
  const {
    name,
    goal,
    level,
    examDate,
    dailyGoalXp,
    // everything else goes into the settings jsonb blob
    ...rest
  } = s;
  // strip non-serialisable store actions
  const settings = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => typeof v !== "function"),
  );
  return {
    id: userId,
    name,
    goal,
    level,
    exam_date: examDate,
    daily_goal_xp: dailyGoalXp,
    settings,
    updated_at: new Date().toISOString(),
  };
}

async function pushProgress() {
  if (!userId) return;
  try {
    await supabase.from("progress").upsert(progressRow(useProgressStore.getState()));
  } catch {
    /* best-effort: stay offline-first */
  }
}

async function pushSettings() {
  if (!userId) return;
  try {
    await supabase.from("profiles").upsert(profileRow(useSettingsStore.getState()));
  } catch {
    /* best-effort */
  }
}

/**
 * Push the current local progress to the cloud immediately (no debounce) and
 * report success. Used by the Settings "reset" flow so a signed-in user's
 * zeroed progress actually overwrites the cloud row; otherwise the next login
 * merge (which takes Math.max/union) would silently restore the old values.
 */
export async function pushProgressNow(): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from("progress")
      .upsert(progressRow(useProgressStore.getState()));
    return !error;
  } catch {
    return false;
  }
}

function scheduleProgressPush() {
  if (applyingRemote || !userId) return;
  if (progressTimer) clearTimeout(progressTimer);
  progressTimer = setTimeout(() => {
    progressTimer = null;
    void pushProgress();
  }, DEBOUNCE_MS);
}

function scheduleSettingsPush() {
  if (applyingRemote || !userId) return;
  if (settingsTimer) clearTimeout(settingsTimer);
  settingsTimer = setTimeout(() => {
    settingsTimer = null;
    void pushSettings();
  }, DEBOUNCE_MS);
}

/**
 * Fire any debounce-pending pushes immediately. Called when the app is
 * backgrounded (the mobile pattern "finish the session, close the PWA"
 * previously lost whatever was inside the 1.5 s debounce window) and before
 * sign-out tears the session down (stopCloudSync used to silently discard a
 * pending push).
 */
export async function flushCloudSync(): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = null;
    tasks.push(pushProgress());
  }
  if (settingsTimer) {
    clearTimeout(settingsTimer);
    settingsTimer = null;
    tasks.push(pushSettings());
  }
  await Promise.all(tasks);
}

function onVisibilityHidden() {
  if (document.visibilityState === "hidden") void flushCloudSync();
}

/* ------------------------------- lifecycle -------------------------------- */

export async function startCloudSync(uid: string) {
  if (userId === uid) return; // already syncing this user
  stopCloudSync();

  // Account isolation on a shared device: if the local cache belongs to a
  // DIFFERENT account, wipe it before doing anything else. Otherwise the merge
  // below (Math.max / union / mergeSrs) would fold the previous account's
  // progress into this one AND the step-2 push would write it up to this
  // account's cloud row, contaminating it on every device. A missing marker
  // (first sync ever, or a pre-existing install upgrading to this build) is
  // treated as "same owner" so genuine offline/guest progress is preserved; the
  // guest→account upgrade keeps the same uid and never reaches this branch.
  const prevUid = readSyncedUid();
  if (prevUid && prevUid !== uid) {
    resetLocalStores();
  }
  writeSyncedUid(uid);

  userId = uid;

  // 1) Pull + merge remote → local.
  try {
    const [{ data: progress }, { data: profile }] = await Promise.all([
      supabase.from("progress").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    ]);
    mergeRemoteProgress(progress);
    mergeRemoteSettings(profile);
  } catch {
    /* offline: keep local */
  }

  // 2) Push the merged local state up so both sides converge immediately.
  await Promise.all([pushProgress(), pushSettings()]);

  // 3) Write-through subsequent local changes (debounced), with a flush when
  // the app is backgrounded so closing the PWA right after a session never
  // strands the last reviews inside the debounce window.
  unsubProgress = useProgressStore.subscribe(scheduleProgressPush);
  unsubSettings = useSettingsStore.subscribe(scheduleSettingsPush);
  document.addEventListener("visibilitychange", onVisibilityHidden);
}

export function stopCloudSync() {
  unsubProgress?.();
  unsubSettings?.();
  unsubProgress = null;
  unsubSettings = null;
  document.removeEventListener("visibilitychange", onVisibilityHidden);
  if (progressTimer) clearTimeout(progressTimer);
  if (settingsTimer) clearTimeout(settingsTimer);
  progressTimer = null;
  settingsTimer = null;
  userId = null;
}
