import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Pins the daily-allowance readout (s179, founder: "there's no count like
 * (2 left out of 3)"). The number a learner reads beside Korrigieren / Auswerten
 * must be the number the Edge Function enforces, so the rules under test are:
 *   - what the server last reported wins over the local default,
 *   - a reported remaining is clamped into [0, limit] (never negative, never
 *     more than the limit),
 *   - each mode is counted on its OWN budget (Kurz cannot spend Lang's).
 */

// The module pulls in the Supabase client and the auth store only for the row
// count / user id, neither of which this suite exercises.
vi.mock("@/lib/supabase", () => ({ supabase: {} }));
vi.mock("@/store/useAuthStore", () => ({ useAuthStore: () => null }));

const load = async () => {
  vi.resetModules();
  return await import("@/lib/aiAllowance");
};

describe("daily AI allowance", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  // Sprechen joined in s193 at 2 conversations/day, and s204 split that into 6
  // practice + 3 Prüfung on the founder's word ("it's very less").
  // The Umformung joined in s204 on its OWN budget (30 = DAILY_CHECK_LIMIT 10 x
  // TRANSFORM_VARIANTS 3): it never spends a Fokus Korrektur, and before s204 it
  // was the one AI feature whose daily wall arrived with no warning at all.
  it("keeps the documented defaults (Fokus 10 / Kurz 4 / Lang 2 / Sprechen 6+3 / Umformung 30)", async () => {
    const { DAILY_ALLOWANCE } = await load();
    expect(DAILY_ALLOWANCE).toEqual({
      fokus: 10, kurz: 4, lang: 2, sprechen: 6, sprechenExam: 3, transform: 30,
    });
  });

  // Founder s204 ("it's very less"): Sprechen went from one shared budget of 2
  // to 6 practice + 3 exam, counted apart on `speaking_conversations.exam`.
  it("spends practice and Prüfung conversations from separate budgets", async () => {
    const { reportServerAllowance, readAllowance } = await load();
    reportServerAllowance("sprechen", 6, 4);
    expect(readAllowance("sprechenExam")).toBeUndefined();
    reportServerAllowance("sprechenExam", 3, 0);
    // Exhausting the exam budget must leave the practice meter untouched.
    expect(readAllowance("sprechen")).toEqual({ limit: 6, remaining: 4 });
    expect(readAllowance("sprechenExam")).toEqual({ limit: 3, remaining: 0 });
  });

  it("counts the Umformung apart from the Korrektur that preceded it", async () => {
    const { reportServerAllowance, readAllowance } = await load();
    reportServerAllowance("transform", 30, 27);
    expect(readAllowance("transform")).toEqual({ limit: 30, remaining: 27 });
    // A transform response must never move the Fokus meter: one Korrektur can
    // be followed by three Umformungen and still cost exactly one Korrektur.
    expect(readAllowance("fokus")).toBeUndefined();
  });

  it("adopts the limit the server reports, not the compiled default", async () => {
    const { reportServerAllowance, readAllowance } = await load();
    reportServerAllowance("fokus", 25, 24);
    expect(readAllowance("fokus")).toEqual({ limit: 25, remaining: 24 });
  });

  it("clamps a reported remaining into [0, limit]", async () => {
    const { reportServerAllowance, readAllowance } = await load();
    reportServerAllowance("kurz", 4, -3);
    expect(readAllowance("kurz")).toEqual({ limit: 4, remaining: 0 });
    reportServerAllowance("kurz", 4, 99);
    expect(readAllowance("kurz")).toEqual({ limit: 4, remaining: 4 });
  });

  it("ignores a response that carries no numbers at all", async () => {
    const { reportServerAllowance, readAllowance } = await load();
    reportServerAllowance("lang", undefined, undefined);
    expect(readAllowance("lang")).toBeUndefined();
  });

  it("counts each mode on its own budget", async () => {
    const { reportServerAllowance, readAllowance } = await load();
    reportServerAllowance("kurz", 4, 1);
    expect(readAllowance("lang")).toBeUndefined();
    reportServerAllowance("lang", 2, 2);
    expect(readAllowance("kurz")).toEqual({ limit: 4, remaining: 1 });
    expect(readAllowance("lang")).toEqual({ limit: 2, remaining: 2 });
  });
});
