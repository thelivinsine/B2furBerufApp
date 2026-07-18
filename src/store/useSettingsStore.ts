import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PINNED_TABS, ROUTE_SUCCESSOR, navItems } from "@/components/layout/nav-items";
import type { LearningMode } from "@/types";

// Known nav destinations after the Phase-5 four-zone re-map.
const KNOWN_TABS = new Set(navItems.map((i) => i.to));

// Remap a saved list of nav paths onto the new four-zone nav: forward removed
// routes to their successor zone, drop anything unknown, and de-duplicate while
// preserving order.
function remapTabs(saved: string[] | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const path of saved ?? []) {
    const mapped = ROUTE_SUCCESSOR[path] ?? path;
    if (KNOWN_TABS.has(mapped) && !seen.has(mapped)) {
      seen.add(mapped);
      out.push(mapped);
    }
  }
  return out;
}

export type ThemeMode = "light" | "dark" | "system";
export type CefrLevel = "A2" | "B1" | "B2" | "C1";
export type LearningGoal = "exam" | "work" | "fluency";

interface SettingsState {
  name: string;
  goal: LearningGoal;
  level: CefrLevel;
  examDate: string | null; // YYYY-MM-DD
  dailyGoalXp: number;
  onboarded: boolean;
  mode: LearningMode;

  // GDPR consent record (rides into profiles.settings jsonb via cloudSync).
  consentedAt: string | null; // ISO timestamp of when the user accepted AGB + Datenschutz
  consentVersion: string | null; // CONSENT_VERSION accepted, for future re-consent prompts

  themeMode: ThemeMode;
  speechEnabled: boolean;
  speechRate: number;
  voiceURI: string | null;
  /** Rotate through the available German voices instead of a pinned one (talker variability). */
  voiceVariety: boolean;
  recognitionEnabled: boolean;
  reducedMotion: boolean;
  /** MCQ questions hide options behind a "think first" gate (anticipatory retrieval). */
  guessFirst: boolean;
  /**
   * Grade a correct-but-slow recall as Hard rather than Good (Phase 1.5 latency
   * plug-in), so a laboured answer schedules sooner. Self-relative and inert
   * until a card has enough latency samples; see engine/srs.ts.
   */
  latencyGrading: boolean;

  /** Ordered list of nav paths pinned to the bottom tab bar (max 4). */
  pinnedTabs: string[];
  /** Custom order of the routes shown in the "Mehr" sheet. Empty = navItems order. */
  moreOrder: string[];

  /** Whether the learner dismissed the "save your progress" sign-in nudge. Persists across sessions. */
  signInBannerDismissed: boolean;

  /**
   * Whether the learner dismissed the one-time Artikel-Wesen legend on the
   * Wörter tab (Artikel-Visuals, s128 plan). Once true the hint never shows
   * again; rides cloudSync via the settings jsonb blob.
   */
  artikelLegendDismissed: boolean;

  /** Fortschritt "Details" section (charts/calendar/mastery grid) expanded state, redesign Phase 3.3. */
  progressDetailsExpanded: boolean;

  /**
   * Can-Do milestone ids the learner has explicitly claimed on the Fortschritt
   * quest board (redesign Phase 3.3 "claim moment"). A milestone becomes
   * claimable once its theme-mastery ratio crosses the threshold; claiming it
   * acknowledges the win so the reward card advances to the next one. Rides
   * cloudSync via the settings jsonb blob like the other flags.
   */
  claimedMilestones: string[];

  setSettings: (patch: Partial<SettingsState>) => void;
  claimMilestone: (id: string) => void;
  completeOnboarding: (patch: Partial<SettingsState>) => void;
  resetSettings: () => void;
  setPinnedTabs: (tabs: string[]) => void;
  setMoreOrder: (order: string[]) => void;
}

const defaults = {
  name: "",
  goal: "exam" as LearningGoal,
  level: "B2" as CefrLevel,
  examDate: null,
  dailyGoalXp: 80,
  onboarded: false,
  mode: "both" as LearningMode,
  consentedAt: null,
  consentVersion: null,
  themeMode: "system" as ThemeMode,
  speechEnabled: true,
  speechRate: 0.95,
  voiceURI: null,
  // Redesign Phase 1.1: two research-backed pedagogy features ship ON by default
  // (talker variability + speech-first production). STT support is still enforced
  // downstream by recognitionSupported() with a typed fallback, so an unsupported
  // browser sees no ill effect from recognitionEnabled being true.
  voiceVariety: true,
  recognitionEnabled: true,
  reducedMotion: false,
  guessFirst: true,
  latencyGrading: true,
  pinnedTabs: DEFAULT_PINNED_TABS,
  moreOrder: [] as string[],
  signInBannerDismissed: false,
  artikelLegendDismissed: false,
  progressDetailsExpanded: false,
  claimedMilestones: [] as string[],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setSettings: (patch) => set(patch),
      claimMilestone: (id) =>
        set((s) =>
          s.claimedMilestones.includes(id)
            ? {}
            : { claimedMilestones: [...s.claimedMilestones, id] },
        ),
      completeOnboarding: (patch) => set({ ...patch, onboarded: true }),
      resetSettings: () => set({ ...defaults }),
      setPinnedTabs: (tabs) => set({ pinnedTabs: tabs }),
      setMoreOrder: (order) => set({ moreOrder: order }),
    }),
    {
      name: "b2beruf.settings.v1",
      // v1 (Phase 5, session 49): the bottom-bar nav collapsed to the four-zone
      // model, so an existing learner's pinned tabs and More-sheet order can
      // reference routes that are no longer nav destinations. Remap them onto
      // their successor zones instead of letting them silently vanish.
      // v2 (redesign Phase 1.1): adopt the new pedagogy defaults for existing
      // users. Both switches were default-off and effectively inert (voiceVariety
      // unused; recognitionEnabled gated a session block that only shipped in s56),
      // so a persisted `false` reflects the old default, not a deliberate opt-out.
      // We flip false → true and never touch a value already `true` (a real
      // opt-in) or any other setting.
      version: 2,
      migrate: (persisted, version) => {
        const s = persisted as SettingsState;
        if (s && version < 1) {
          let pins = remapTabs(s.pinnedTabs);
          pins = ["/", ...pins.filter((p) => p !== "/")].slice(0, 4);
          s.pinnedTabs = pins.length >= 2 ? pins : DEFAULT_PINNED_TABS;
          s.moreOrder = remapTabs(s.moreOrder);
        }
        if (s && version < 2) {
          if (s.voiceVariety === false) s.voiceVariety = true;
          if (s.recognitionEnabled === false) s.recognitionEnabled = true;
        }
        return s;
      },
    },
  ),
);
