import { create } from "zustand";
import { fetchAppConfigEntries } from "@/lib/adminApi";

/**
 * Steuerung remote config (Kontrollzentrum §H). A small settings object read
 * from Supabase `app_config` at startup, merged over the COMPILED defaults, and
 * consumed app-wide. The founder edits it from /admin/steuerung; changes go
 * live for everyone within a minute, no deploy.
 *
 * THE CRITICAL INVARIANT: with `app_config` empty or unreachable the merged
 * config equals `DEFAULT_APP_CONFIG`, which equals today's hard-coded behavior
 * byte-for-byte. Every consumer reads `config.X` where the default IS the
 * current value, so a missing/offline config changes nothing. `mergeAppConfig`
 * is defensive: any malformed remote value (wrong type, unknown key) is ignored
 * rather than trusted, so a bad row can never break navigation or boot.
 *
 * Guardrails (from the scoping plan, enforced here + at the consumers):
 *  - Visibility toggles never unmount routes; they only hide nav/link entries.
 *  - The locked bottom bar keeps Home + Einstellungen fixed; only middle tabs
 *    can be relabelled or hidden.
 *  - Label overrides do not reach content banks or the prerendered /hilfe pages.
 */

export type DashboardStartTab = "ueben" | "spielen";

export interface FeatureFlags {
  /** Vokabeltrainer in-page Karteikarten/Quiz tabs (SHOW_PRACTICE_TABS). */
  practiceTabs: boolean;
  /** The cross-module "Verbunden" panel on vocab rows (SHOW_RELATED). */
  relatedPanel: boolean;
  /** The flip-to-reveal hint affordance (forward-declared; parked today). */
  flipHint: boolean;
}

export interface FeedbackConfig {
  /** The in-app feedback pill/dialog is mounted at all. */
  enabled: boolean;
  /** Override the pill label; null keeps the built-in copy. */
  label: string | null;
  /** Route path prefixes on which the pill is suppressed. */
  hiddenRoutes: string[];
}

export interface AppConfigData {
  /** Nav label overrides keyed by route path (e.g. "/library" -> "Theorie"). */
  navLabels: Record<string, string>;
  /** Middle-tab route paths hidden from the nav rail (routes stay mounted). */
  hiddenTabs: string[];
  features: FeatureFlags;
  feedback: FeedbackConfig;
  /** The Neuland "Beta" suffix chip. */
  betaChip: boolean;
  /** Which Heute tab opens first. */
  dashboardStartTab: DashboardStartTab;
}

/**
 * TODAY'S BEHAVIOR, exactly. Do not change a value here without changing the
 * matching hard-coded default at the consumer in the SAME commit — this object
 * is the contract that "empty config == current app".
 */
export const DEFAULT_APP_CONFIG: AppConfigData = {
  navLabels: {},
  hiddenTabs: [],
  features: {
    practiceTabs: false, // VocabularyTrainer SHOW_PRACTICE_TABS
    relatedPanel: false, // VocabList SHOW_RELATED
    flipHint: true,
  },
  feedback: {
    enabled: true,
    label: null,
    hiddenRoutes: [],
  },
  betaChip: true,
  dashboardStartTab: "ueben",
};

// ---- Defensive per-field coercion ------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asStringMap(v: unknown): Record<string, string> {
  if (!isRecord(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "string" && val.trim()) out[k] = val;
  }
  return out;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/**
 * Merge remote entries (a key -> jsonb-value map from `app_config`) over the
 * compiled defaults. Unknown keys and mis-typed values are ignored, so the
 * result is always a valid, safe AppConfigData.
 */
export function mergeAppConfig(remote: Map<string, unknown> | Record<string, unknown>): AppConfigData {
  const get = (key: string): unknown =>
    remote instanceof Map ? remote.get(key) : (remote as Record<string, unknown>)[key];

  const d = DEFAULT_APP_CONFIG;

  const featuresRaw = get("features");
  const features: FeatureFlags = isRecord(featuresRaw)
    ? {
        practiceTabs: asBool(featuresRaw.practiceTabs, d.features.practiceTabs),
        relatedPanel: asBool(featuresRaw.relatedPanel, d.features.relatedPanel),
        flipHint: asBool(featuresRaw.flipHint, d.features.flipHint),
      }
    : d.features;

  const feedbackRaw = get("feedback");
  const feedback: FeedbackConfig = isRecord(feedbackRaw)
    ? {
        enabled: asBool(feedbackRaw.enabled, d.feedback.enabled),
        label:
          typeof feedbackRaw.label === "string" && feedbackRaw.label.trim()
            ? feedbackRaw.label
            : null,
        hiddenRoutes: asStringArray(feedbackRaw.hiddenRoutes),
      }
    : d.feedback;

  const startTabRaw = get("dashboardStartTab");
  const dashboardStartTab: DashboardStartTab =
    startTabRaw === "spielen" || startTabRaw === "ueben" ? startTabRaw : d.dashboardStartTab;

  return {
    navLabels: { ...d.navLabels, ...asStringMap(get("navLabels")) },
    hiddenTabs: get("hiddenTabs") !== undefined ? asStringArray(get("hiddenTabs")) : d.hiddenTabs,
    features,
    feedback,
    betaChip: asBool(get("betaChip"), d.betaChip),
    dashboardStartTab,
  };
}

// ---- Store ------------------------------------------------------------------

interface AppConfigStore {
  config: AppConfigData;
  loaded: boolean;
  /** Fetch app_config and merge. Fail-soft: on error the config stays at
   *  defaults (today's behavior). Safe to call more than once. */
  load: () => Promise<void>;
  /** Apply a locally-known config immediately (used by the admin panel after a
   *  save so the founder sees the change without a reload). */
  applyLocal: (config: AppConfigData) => void;
}

export const useAppConfigStore = create<AppConfigStore>((set) => ({
  config: DEFAULT_APP_CONFIG,
  loaded: false,
  load: async () => {
    try {
      const entries = await fetchAppConfigEntries();
      set({ config: mergeAppConfig(entries), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  applyLocal: (config) => set({ config }),
}));

/** The merged, live app config. */
export const useAppConfig = (): AppConfigData => useAppConfigStore((s) => s.config);

/** A nav label with the remote override applied (falls back to the built-in). */
export function useNavLabel(path: string, fallback: string): string {
  return useAppConfigStore((s) => s.config.navLabels[path] ?? fallback);
}
