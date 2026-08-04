import { clearAllAutosavedDrafts } from "@/features/writing/draftAutosave";
import { clearWritingDraft } from "@/features/writing/resumeDraft";
import { remapProgressIds } from "@/lib/idRenames";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import {
  trimDayMaps,
  trimMockExams,
  useProgressStore,
  type MockExamRecord,
} from "@/store/useProgressStore";
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

/* ---------------------------- sync health ---------------------------- */

/**
 * How many pushes in a row have to fail before the learner is told. One failure
 * is normal life (a tunnel, a sleeping laptop, a token being refreshed); a run
 * of them means the cloud copy is genuinely not being written, which the
 * offline-first design otherwise hides completely: localStorage keeps working,
 * the app looks perfect, and the backup silently does not exist (audit R3).
 */
const FAILURES_BEFORE_ALARM = 3;
/** Automatic retry backoff. After the last step the learner drives it. */
const RETRY_BACKOFF_MS = [5_000, 20_000, 60_000, 300_000];

/** Consecutive failures per channel, so one healthy row cannot mask a stuck one. */
const failures = { progress: 0, settings: 0 };
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function clearRetryTimer() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
}

/**
 * Record the outcome of one push. Success on BOTH channels clears the alarm and
 * stamps the moment for the UI; a failure counts toward the alarm and schedules
 * a backed-off retry, so a transient failure heals itself without the learner
 * ever seeing it and a persistent one surfaces instead of being swallowed.
 */
function settle(channel: "progress" | "settings", ok: boolean) {
  if (ok) {
    failures[channel] = 0;
    if (failures.progress === 0 && failures.settings === 0) {
      clearRetryTimer();
      useAuthStore.setState({ syncHealth: "ok", lastSyncedAt: Date.now() });
    }
    return;
  }
  failures[channel] += 1;
  const worst = Math.max(failures.progress, failures.settings);
  if (worst >= FAILURES_BEFORE_ALARM) useAuthStore.setState({ syncHealth: "failing" });
  const delay = RETRY_BACKOFF_MS[Math.min(worst - 1, RETRY_BACKOFF_MS.length - 1)];
  clearRetryTimer();
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void retryCloudSync();
  }, delay);
}

/**
 * Push both rows now, outside the debounce. Backs the automatic retry above and
 * the "Erneut versuchen" button in Settings, which must always act (a dead
 * control at rest reads as broken).
 */
export async function retryCloudSync(): Promise<boolean> {
  if (!userId) return false;
  const [a, b] = await Promise.all([pushProgress(), pushSettings()]);
  return a && b;
}

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
  // The Schreiben drafts live outside the zustand stores (their own
  // localStorage keys), so resetLocalStores() does not reach them. They hold the
  // learner's own text and must leave the device with the account: on sign-out
  // so the next person on a shared device never sees it, and on deletion so
  // erasure is not only server-side. Both drafts go here because sign-out ends
  // the sign-in hand-off too (nothing is left to resume into).
  clearAllAutosavedDrafts();
  clearWritingDraft();
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

  // Mock-exam runs (s186): ids are start timestamps, so a union by id merges
  // devices without duplicating a run; re-trim to the retention cap after.
  const mockRemote = (remote.mock_exams as MockExamRecord[]) ?? [];
  const mockMap = new Map(s.mockExams.map((m) => [m.id, m]));
  for (const m of mockRemote) if (!mockMap.has(m.id)) mockMap.set(m.id, m);
  const mockExams = trimMockExams(
    Array.from(mockMap.values()).sort((a, b) => a.id.localeCompare(b.id)),
  );

  const dailyXp = mergeNumberMax(s.dailyXp, (remote.daily_xp as Record<string, number>) ?? {});
  const activeDays = unionStrings(s.activeDays, (remote.active_days as string[]) ?? []);
  // Both sides may hold days from before the retention window (a device that has
  // not rolled over yet, or a row written by an older client), so re-trim after
  // the union. Math.max on the folded counter: each device increments from the
  // same synced base, so a day is counted exactly once however many devices
  // fold it. See trimDayMaps in the progress store.
  const activeDaysFolded = Math.max(
    s.activeDaysFolded,
    (remote.active_days_folded as number) ?? 0,
  );
  const trimmed = trimDayMaps({ dailyXp, activeDays, activeDaysFolded });

  applyingRemote = true;
  useProgressStore.setState({
    xp: Math.max(s.xp, (remote.xp as number) ?? 0),
    dailyXp,
    streak: Math.max(s.streak, (remote.streak as number) ?? 0),
    longestStreak: Math.max(s.longestStreak, (remote.longest_streak as number) ?? 0),
    lastActiveDay:
      [s.lastActiveDay, remote.last_active_day as string | null]
        .filter(Boolean)
        .sort()
        .pop() ?? null,
    activeDays,
    activeDaysFolded,
    ...trimmed,
    srs: mergeSrs(s.srs, r.srs ?? {}),
    redemittelSeen: mergeNumberMax(s.redemittelSeen, r.redemittelSeen ?? {}),
    scenariosDone: unionStrings(s.scenariosDone, r.scenariosDone ?? []),
    examsDone: Array.from(examsMap.values()),
    mockExams,
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
  // Is this cloud profile worth adopting, or is it the empty row the
  // auto-provision trigger creates at sign-up? Ask the flag that answers that
  // question directly.
  //
  // This used to test `profile.name`, on the assumption that a real profile has
  // one. Onboarding never asks for a name (it collects goal, mode and level),
  // so `name` is "" for EVERY account, and this bailed every time: `onboarded`
  // was pushed to the cloud but never read back, so each new sign-in on a
  // device wiped the local flag and started onboarding again. The founder saw
  // the onboarding screen on every single log-in (s174).
  if (remoteSettings.onboarded !== true) return;
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
    active_days_folded: s.activeDaysFolded,
    srs: s.srs,
    redemittel_seen: s.redemittelSeen,
    scenarios_done: s.scenariosDone,
    exams_done: s.examsDone,
    mock_exams: s.mockExams,
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

/**
 * Does this error mean "that column does not exist yet"? The site deploy and
 * the migration deploy are two independent workflows, so a build that writes a
 * newly added column can go live minutes before the migration that creates it.
 * An unknown column fails the WHOLE upsert, which would strand every push in
 * that window, so the caller retries once without the young columns instead.
 */
function isUnknownColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    /column .* does not exist|could not find the .* column/i.test(error.message ?? "")
  );
}

/** Columns added after the initial schema, dropped on an unknown-column retry. */
const YOUNG_PROGRESS_COLUMNS = ["active_days_folded", "mock_exams"] as const;

async function pushProgress(): Promise<boolean> {
  if (!userId) return false;
  try {
    const row = progressRow(useProgressStore.getState());
    let { error } = await supabase.from("progress").upsert(row);
    if (isUnknownColumn(error)) {
      const fallback = { ...row } as Record<string, unknown>;
      for (const col of YOUNG_PROGRESS_COLUMNS) delete fallback[col];
      ({ error } = await supabase.from("progress").upsert(fallback));
    }
    settle("progress", !error);
    return !error;
  } catch {
    // Network-level throw: offline-first, so the local cache keeps the data.
    settle("progress", false);
    return false;
  }
}

async function pushSettings(): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabase.from("profiles").upsert(profileRow(useSettingsStore.getState()));
    settle("settings", !error);
    return !error;
  } catch {
    settle("settings", false);
    return false;
  }
}

/**
 * Push the current local progress to the cloud immediately (no debounce) and
 * report success. Used by the Settings "reset" flow so a signed-in user's
 * zeroed progress actually overwrites the cloud row; otherwise the next login
 * merge (which takes Math.max/union) would silently restore the old values.
 */
export async function pushProgressNow(): Promise<boolean> {
  return pushProgress();
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

  // A route guard may be waiting on this: until the first pull below lands, a
  // fresh device does not yet know the account's real `onboarded` flag (it
  // lives in the cloud profile). Mark unhydrated so the guard waits instead of
  // bouncing the user to the landing page.
  useAuthStore.setState({ syncHydrated: false });

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
    // Same reason as in clearLocalAccountData: the autosaved drafts belong to
    // the account that wrote them. The one-shot RESUME draft is deliberately
    // kept: this branch is also the "wrote something, hit the login wall, signed
    // in" path, where the text in flight is the arriving learner's own and
    // WritingHub consumes it immediately.
    clearAllAutosavedDrafts();
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
  } finally {
    // Whether the pull succeeded or failed offline, the initial reconcile is
    // done: `onboarded` now reflects the cloud profile (or the local fallback),
    // so route guards can safely decide. Set AFTER the merge so an existing
    // account's `onboarded: true` is already applied when this flips.
    useAuthStore.setState({ syncHydrated: true });
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
  clearRetryTimer();
  failures.progress = 0;
  failures.settings = 0;
  userId = null;
  // No session is syncing anymore; the next sign-in re-hydrates from its cloud.
  // The health verdict goes with it: it described the session that just ended.
  useAuthStore.setState({ syncHydrated: false, syncHealth: "unknown", lastSyncedAt: null });
}
