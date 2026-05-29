import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  themeMode: ThemeMode;
  speechEnabled: boolean;
  speechRate: number;
  voiceURI: string | null;
  recognitionEnabled: boolean;
  reducedMotion: boolean;

  setSettings: (patch: Partial<SettingsState>) => void;
  completeOnboarding: (patch: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const defaults = {
  name: "",
  goal: "exam" as LearningGoal,
  level: "B2" as CefrLevel,
  examDate: null,
  dailyGoalXp: 80,
  onboarded: false,
  themeMode: "system" as ThemeMode,
  speechEnabled: true,
  speechRate: 0.95,
  voiceURI: null,
  recognitionEnabled: false,
  reducedMotion: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setSettings: (patch) => set(patch),
      completeOnboarding: (patch) => set({ ...patch, onboarded: true }),
      resetSettings: () => set({ ...defaults }),
    }),
    { name: "b2beruf.settings.v1" },
  ),
);
