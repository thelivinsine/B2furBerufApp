import { describe, it, expect } from "vitest";
import {
  legDeadline,
  legOrder,
  MIN_LEG_MS,
} from "../supabase/functions/_shared/aiCascade.ts";

/**
 * Pins the cascade plan behind the Sprechen debrief (s211).
 *
 * The founder: "it spins for a long time and says the feedback cannot be
 * generated ... and then the progress is lost". Two facts about the SEQUENCE
 * produced that, and both are decided by the two functions below rather than by
 * a hardcoded array inside a Deno file nothing can import:
 *
 *  - the debrief led on the free leg, which is the one call in that function it
 *    cannot serve (it spends its output budget thinking before it writes any
 *    JSON), so the model that could answer was only reached after a leg that had
 *    to fail first;
 *  - three per-leg deadlines in series are three times the wait, longer than the
 *    platform's own request ceiling, so the spinner could outlive the request.
 */

describe("leg order", () => {
  it("leads on the free tier for a spoken turn", () => {
    expect(legOrder("free")[0]).toBe("gemini");
  });

  it("leads on the paid model for the debrief", () => {
    expect(legOrder("paid")[0]).toBe("anthropic");
  });

  it("keeps the free leg as a fallback when it does not lead", () => {
    // The point of leading paid is latency, not dropping the free provider: a
    // dead paid provider must degrade the debrief, never remove it.
    expect(legOrder("paid")).toContain("gemini");
  });

  it("asks every provider exactly once, whichever leads", () => {
    for (const lead of ["free", "paid"] as const) {
      const order = legOrder(lead);
      expect(new Set(order).size).toBe(order.length);
      expect(order).toHaveLength(3);
    }
  });
});

describe("leg deadline", () => {
  it("gives a leg its full deadline while the budget is untouched", () => {
    expect(legDeadline(60_000, 0, 100_000)).toBe(60_000);
  });

  it("caps a leg by what is left of the budget", () => {
    // 60s per leg, but only 30s of the cascade's budget remains: the leg gets
    // 30s, so the whole request still answers inside its budget.
    expect(legDeadline(60_000, 70_000, 100_000)).toBe(30_000);
  });

  it("does not start a leg that cannot finish in what remains", () => {
    expect(legDeadline(60_000, 100_000 - MIN_LEG_MS + 1, 100_000)).toBeNull();
  });

  it("does not start a leg once the budget is spent or overrun", () => {
    expect(legDeadline(60_000, 100_000, 100_000)).toBeNull();
    expect(legDeadline(60_000, 140_000, 100_000)).toBeNull();
  });
});
