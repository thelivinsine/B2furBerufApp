// Shared cascade planning: WHICH model is asked, in what order, and for how
// long (s211).
// ---------------------------------------------------------------------------
// The `converse` function tries three providers in turn. Two rules about that
// sequence were wrong in a way a learner felt directly, and both are decided
// here so they can be gated by `tests/aiCascade.test.ts` without a Deno runtime,
// exactly like the pricing arithmetic in `aiUsage.ts`.
//
// 1. THE ORDER IS A PROPERTY OF THE CALL, not a constant. Free-first is right
//    for a spoken turn: it is one to three sentences, Gemini Flash writes them
//    well, and it costs nothing. It is wrong for the DEBRIEF, which is the one
//    call the whole feature exists for and which s196 deliberately put on the
//    stronger model. Leading with a leg that has to fail before the intended
//    model is asked buys nothing and spends the learner's patience.
//
// 2. A CASCADE NEEDS A TOTAL BUDGET, not only a per-leg one. Per-leg deadlines
//    (s206) stop ONE hung provider; three of them in series still add up to
//    three times the wait, which is what the founder sat through: "it spins for
//    a long time and says the feedback cannot be generated". A leg that cannot
//    finish inside what is left of the budget is not attempted at all, so the
//    request always returns an answer while the learner is still waiting for it,
//    and always inside the platform's own request ceiling.
// ---------------------------------------------------------------------------

/** The providers, by the name used in logs. */
export type LegName = "gemini" | "anthropic" | "openai";

/**
 * Which leg leads. "free" starts on Gemini's free tier; "paid" starts on the
 * model the caller named, keeping the free legs as the fallback behind it.
 */
export type CascadeLead = "free" | "paid";

/**
 * The order the legs are tried in. Gemini stays in the list either way: when it
 * is not leading it is the fallback that keeps the feature alive if the paid
 * provider is down, which is the failure the founder actually hit.
 */
export function legOrder(lead: CascadeLead): LegName[] {
  return lead === "paid"
    ? ["anthropic", "gemini", "openai"]
    : ["gemini", "anthropic", "openai"];
}

/**
 * Below this there is no point starting another provider: it cannot answer in
 * time, and abandoning it mid-flight costs the same as never asking.
 */
export const MIN_LEG_MS = 8_000;

/**
 * How long the NEXT leg may take: the per-leg deadline, capped by what is left
 * of the whole cascade's budget. Null means "do not start it", either because
 * the budget is spent or because too little of it remains to be useful.
 */
export function legDeadline(
  perLegMs: number,
  elapsedMs: number,
  budgetMs: number,
): number | null {
  const remaining = budgetMs - elapsedMs;
  if (remaining < MIN_LEG_MS) return null;
  return Math.min(perLegMs, remaining);
}

/**
 * Why a cascade produced nothing, in one token the client can print and the
 * founder can quote back. The detail (provider, HTTP status, the provider's own
 * error code) is in the function logs; this is the part a learner can see.
 */
export type CascadeFailure =
  /** Every provider was asked and none answered: keys, quota or an outage. */
  | "unavailable"
  /** A provider answered, but not in a shape the caller could use. */
  | "unreadable"
  /** The budget ran out before a provider answered. */
  | "timeout";
