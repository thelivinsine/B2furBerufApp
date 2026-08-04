import { describe, it, expect, beforeEach } from "vitest";
import { RETAIN_DAYS, trimDayMaps, useProgressStore } from "@/store/useProgressStore";
import { todayKey } from "@/lib/utils";

/**
 * Day-map retention (database architecture audit R1, s185). `dailyXp` and
 * `activeDays` grew by one entry per day of account life, forever, and the whole
 * progress row is re-uploaded on every write. They are now capped at
 * RETAIN_DAYS, with the dropped ACTIVE days folded into a counter so the
 * lifetime "N aktive Tage" figure a learner sees never changes.
 */

function dayKey(offsetFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetFromToday);
  return todayKey(d);
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.getState().resetProgress();
});

describe("day-map retention", () => {
  it("keeps days inside the window untouched", () => {
    const recent = [dayKey(-1), dayKey(-30), dayKey(-RETAIN_DAYS + 1)];
    const out = trimDayMaps({
      activeDays: recent,
      dailyXp: { [recent[0]]: 10, [recent[2]]: 5 },
      activeDaysFolded: 0,
    });
    // Nothing aged out, so nothing is rewritten at all.
    expect(out).toEqual({});
  });

  it("drops days past the window and folds the active ones into the counter", () => {
    const old = [dayKey(-RETAIN_DAYS - 5), dayKey(-RETAIN_DAYS - 1)];
    const kept = [dayKey(-10), dayKey(0)];
    const out = trimDayMaps({
      activeDays: [...old, ...kept],
      dailyXp: { [old[0]]: 40, [old[1]]: 20, [kept[0]]: 15, [kept[1]]: 5 },
      activeDaysFolded: 7,
    });

    expect(out.activeDays).toEqual(kept);
    expect(out.activeDaysFolded).toBe(9); // 7 already folded + 2 dropped now
    expect(Object.keys(out.dailyXp ?? {}).sort()).toEqual([...kept].sort());
  });

  it("preserves the lifetime active-day total across a trim", () => {
    const all = [dayKey(-RETAIN_DAYS - 3), dayKey(-RETAIN_DAYS - 2), dayKey(-4)];
    const before = all.length + 0;
    const out = trimDayMaps({ activeDays: all, dailyXp: {}, activeDaysFolded: 0 });
    const after = (out.activeDays ?? all).length + (out.activeDaysFolded ?? 0);
    expect(after).toBe(before);
  });

  it("counts a day once even when two devices fold the same history", () => {
    const history = [dayKey(-RETAIN_DAYS - 1), dayKey(-2)];
    // Both devices start from the same synced base and trim independently.
    const deviceA = trimDayMaps({ activeDays: history, dailyXp: {}, activeDaysFolded: 3 });
    const deviceB = trimDayMaps({ activeDays: history, dailyXp: {}, activeDaysFolded: 3 });
    // cloudSync merges the counter with Math.max, never a sum.
    expect(Math.max(deviceA.activeDaysFolded ?? 0, deviceB.activeDaysFolded ?? 0)).toBe(4);
  });

  it("a fresh account trims nothing and reports a lifetime count of its real days", () => {
    useProgressStore.getState().addXp(10);
    const s = useProgressStore.getState();
    expect(s.activeDays).toEqual([todayKey()]);
    expect(s.activeDaysFolded).toBe(0);
  });
});
