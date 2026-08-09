import { describe, it, expect } from "vitest";
import {
  centsToUsd,
  dayOf,
  foldCostReport,
  nextPage,
  reportWindow,
} from "../supabase/functions/_shared/costReport.ts";

/**
 * Pins the parsing behind "ours vs theirs" (s205). This is the number the
 * founder compares against our own estimate, so the two mistakes that would
 * make the comparison lie are tested first: the amount is in CENTS as a string
 * (a missing /100 makes the bill look 100x worse), and a day arrives as many
 * rows that have to be summed (taking the first row makes it look far cheaper).
 */

describe("amounts", () => {
  it("reads the reported cents as dollars", () => {
    // Anthropic's own example: "123.45" in USD means $1.2345.
    expect(centsToUsd("123.45")).toBeCloseTo(1.2345, 6);
  });

  it("treats a missing or unreadable amount as zero, never NaN", () => {
    for (const bad of [undefined, null, "", "abc", {}]) {
      expect(centsToUsd(bad)).toBe(0);
    }
  });
});

describe("days", () => {
  it("takes the UTC calendar day from the bucket start", () => {
    expect(dayOf("2026-08-09T00:00:00Z")).toBe("2026-08-09");
    // Late-evening UTC still belongs to that UTC day, whatever the local zone.
    expect(dayOf("2026-08-09T23:30:00Z")).toBe("2026-08-09");
  });

  it("returns null for an unreadable timestamp rather than guessing today", () => {
    expect(dayOf("not a date")).toBeNull();
    expect(dayOf(undefined)).toBeNull();
  });
});

describe("folding a cost report", () => {
  const page = {
    data: [
      {
        starting_at: "2026-08-07T00:00:00Z",
        ending_at: "2026-08-08T00:00:00Z",
        results: [
          { amount: "100", currency: "USD", model: "claude-sonnet-5", token_type: "uncached_input_tokens" },
          { amount: "50.5", currency: "USD", model: "claude-sonnet-5", token_type: "output_tokens" },
        ],
      },
      {
        starting_at: "2026-08-08T00:00:00Z",
        ending_at: "2026-08-09T00:00:00Z",
        results: [{ amount: "25", currency: "USD", model: "claude-haiku-4-5" }],
      },
    ],
    has_more: false,
    next_page: null,
  };

  it("sums every row in a day, not just the first", () => {
    // $1.00 + $0.505 on the 7th; one row of $0.25 on the 8th.
    expect(foldCostReport(page)).toEqual([
      { day: "2026-08-07", costUsd: 1.505 },
      { day: "2026-08-08", costUsd: 0.25 },
    ]);
  });

  it("returns days in ascending order", () => {
    expect(foldCostReport(page).map((d) => d.day)).toEqual(["2026-08-07", "2026-08-08"]);
  });

  it("skips a bucket whose timestamp cannot be read instead of misattributing it", () => {
    const broken = { data: [{ starting_at: "???", results: [{ amount: "999" }] }] };
    expect(foldCostReport(broken)).toEqual([]);
  });

  it("survives an empty or malformed payload", () => {
    expect(foldCostReport({})).toEqual([]);
    expect(foldCostReport(null)).toEqual([]);
    expect(foldCostReport({ data: [{ starting_at: "2026-08-07T00:00:00Z" }] })).toEqual([
      { day: "2026-08-07", costUsd: 0 },
    ]);
  });
});

describe("pagination", () => {
  it("follows the cursor only while has_more is true", () => {
    expect(nextPage({ has_more: true, next_page: "page_abc" })).toBe("page_abc");
    expect(nextPage({ has_more: false, next_page: "page_abc" })).toBeNull();
    expect(nextPage({ has_more: true })).toBeNull();
  });
});

describe("the window we ask for", () => {
  const now = new Date("2026-08-09T15:12:00Z");

  it("ends at the start of today, so a partial day is never stored as final", () => {
    expect(reportWindow(14, now).endingAt).toBe("2026-08-09T00:00:00.000Z");
  });

  it("starts N whole days earlier", () => {
    expect(reportWindow(2, now).startingAt).toBe("2026-08-07T00:00:00.000Z");
  });

  it("clamps a silly range rather than asking for years", () => {
    expect(reportWindow(0, now).startingAt).toBe("2026-08-08T00:00:00.000Z");
    expect(reportWindow(9999, now).startingAt).toBe("2026-07-09T00:00:00.000Z");
  });
});
