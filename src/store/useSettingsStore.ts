import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PINNED_TABS } from "@/components/layout/nav-items";
import type { LearningMode } from "@/types";

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
  recognitionEnabled: boolean;
  reducedMotion: boolean;

  /** Ordered list of nav paths pinned to the bottom tab bar (max 4). */
  pinnedTabs: string[];
  /** Custom order of the routes shown in the "Mehr" sheet. Empty = navItems order. */
  moreOrder: string[];

  setSettings: (patch: Partial<SettingsState>) => void;
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
  recognitionEnabled: false,
  reducedMotion: false,
  pinnedTabs: DEFAULT_PINNED_TABS,
  moreOrder: [] as string[],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setSettings: (patch) => set(patch),
      completeOnboarding: (patch) => set({ ...patch, onboarded: true }),
      resetSettings: () => set({ ...defaults }),
      setPinnedTabs: (tabs) => set({ pinnedTabs: tabs }),
      setMoreOrder: (order) => set({ moreOrder: order }),
    }),
    { name: "b2beruf.settings.v1" },
  ),
);
