import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { todayKey } from "@/lib/utils";

beforeEach(() => {
  localStorage.clear();
  useProgressStore.getState().resetProgress();
});

describe("progress store", () => {
  it("addXp accrues total and per-day XP and starts a streak", () => {
    useProgressStore.getState().addXp(10);
    useProgressStore.getState().addXp(5);
    const s = useProgressStore.getState();
    expect(s.xp).toBe(15);
    expect(s.dailyXp[todayKey()]).toBe(15);
    expect(s.streak).toBe(1);
    expect(s.lastActiveDay).toBe(todayKey());
    expect(s.activeDays).toContain(todayKey());
  });

  it("reviewVocab writes an SRS card scheduled after today", () => {
    useProgressStore.getState().reviewVocab("v_test", 4);
    const card = useProgressStore.getState().srs["v_test"];
    expect(card).toBeDefined();
    expect(card.reps).toBeGreaterThan(0);
    expect(card.due > todayKey()).toBe(true);
  });

  it("toggleSavedWord adds and removes", () => {
    useProgressStore.getState().toggleSavedWord("v_a");
    expect(useProgressStore.getState().savedWords).toContain("v_a");
    useProgressStore.getState().toggleSavedWord("v_a");
    expect(useProgressStore.getState().savedWords).not.toContain("v_a");
  });

  it("resetProgress returns to a clean slate", () => {
    useProgressStore.getState().addXp(50);
    useProgressStore.getState().reviewVocab("v_x", 4);
    useProgressStore.getState().resetProgress();
    const s = useProgressStore.getState();
    expect(s.xp).toBe(0);
    expect(Object.keys(s.srs)).toHaveLength(0);
    expect(s.streak).toBe(0);
  });
});

describe("settings store", () => {
  it("completeOnboarding flips the flag and applies the patch", () => {
    useSettingsStore.getState().completeOnboarding({ name: "Anna", level: "B1" });
    const s = useSettingsStore.getState();
    expect(s.onboarded).toBe(true);
    expect(s.name).toBe("Anna");
    expect(s.level).toBe("B1");
    useSettingsStore.getState().resetSettings();
  });

  it("pinned tabs keep Home first via setPinnedTabs callers' contract", () => {
    useSettingsStore.getState().setPinnedTabs(["/", "/library"]);
    expect(useSettingsStore.getState().pinnedTabs[0]).toBe("/");
    useSettingsStore.getState().resetSettings();
  });

  it("claimMilestone appends unique ids and is idempotent", () => {
    useSettingsStore.getState().resetSettings();
    expect(useSettingsStore.getState().claimedMilestones).toEqual([]);
    useSettingsStore.getState().claimMilestone("cd_meetings_1");
    useSettingsStore.getState().claimMilestone("cd_customer_1");
    useSettingsStore.getState().claimMilestone("cd_meetings_1"); // duplicate, ignored
    expect(useSettingsStore.getState().claimedMilestones).toEqual([
      "cd_meetings_1",
      "cd_customer_1",
    ]);
    useSettingsStore.getState().resetSettings();
    expect(useSettingsStore.getState().claimedMilestones).toEqual([]);
  });
});
