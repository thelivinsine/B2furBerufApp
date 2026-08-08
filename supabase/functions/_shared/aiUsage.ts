// Shared AI usage accounting (founder s197: "how do we make sure we see real
// usage and costs and not just estimates?").
// ---------------------------------------------------------------------------
// Until now every function computed a cost and threw the token counts away, and
// three of the four priced GPT-5 at a hardcoded flat $0.004 per call. So the
// figure in the admin control centre could not tell an expensive call from a
// cheap one, and nothing recorded what the providers actually reported.
//
// This module is the one place that:
//   1. reads the token counts out of a provider response (each provider names
//      them differently), so USAGE is measured rather than assumed;
//   2. prices those tokens from ONE rate table, overridable at runtime from
//      `app_config.ai_rates` so a provider reprice is a config edit, not a
//      redeploy of four functions;
//   3. writes one `ai_calls` row per call (migration 0018), which is what a
//      later reconciliation against the providers' own usage/cost APIs is
//      compared to.
//
// COST IS STILL DERIVED. Only the tokens are measured. The reconciliation step
// (Anthropic's and OpenAI's organization usage/cost endpoints) is what turns
// the money figure from "our arithmetic" into "checked against the bill", and
// it is deliberately not part of this change.
// ---------------------------------------------------------------------------

/** Who answered the call. Gemini is the free-tier primary in every cascade. */
export type Provider = "google" | "anthropic" | "openai";

/** Which product surface spent the call. Mirrors the `feature` check in 0018. */
export type AiFeature =
  | "check"
  | "transform"
  | "writing_short"
  | "writing_long"
  | "converse_turn"
  | "converse_debrief";

/** What a provider reported about one call. Zeroes when it reported nothing. */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  /** Prompt tokens served from the provider's own cache, billed at a discount. */
  cachedInputTokens: number;
}

export const EMPTY_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cachedInputTokens: 0,
};

/**
 * Bumped whenever the numbers below change, and stored on every row, so a later
 * reconciliation can tell "we mispriced it" from "the provider changed its
 * price". Date-shaped on purpose: it is a fact about when, not a semver.
 */
export const RATE_VERSION = "2026-08-06";

/**
 * USD per MILLION tokens, [input, output], matched by model-id PREFIX so a
 * dated snapshot (`claude-sonnet-5-20260101`) prices like its family.
 *
 * Verified against Anthropic's published rates on 2026-08-06. Sonnet 5 carries
 * an introductory $2/$10 through 2026-08-31; the standard $3/$15 is used here
 * on purpose, so the spend fuse errs conservative rather than optimistic.
 *
 * Gemini is 0 because the calls run inside Google's free tier. That is an
 * ASSUMPTION about the key, not a measurement: on a billing-enabled project
 * past the free quota Google charges and this table would still say zero. The
 * token counts beside it are real either way, which is the point of recording
 * them: they are what tells us how close the free tier is to running out.
 */
const DEFAULT_RATES: Record<string, [number, number]> = {
  "claude-opus": [5, 25],
  "claude-sonnet": [3, 15],
  "claude-haiku": [1, 5],
  "gpt-5": [1.25, 10],
  "gpt-4": [2.5, 10],
  gemini: [0, 0],
};

/** Cache reads are ~0.1x input on every provider that reports them. */
const CACHE_READ_MULTIPLIER = 0.1;

/** An unknown model is priced as the most expensive family we serve, never 0. */
const FALLBACK_RATE: [number, number] = [5, 25];

export type RateTable = Record<string, [number, number]>;

/**
 * Just enough of the supabase-js service client for the two calls this module
 * makes. Restating the real builder's types here would be a maintenance burden
 * for no safety, and `any` would hide genuine mistakes in the callers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export type AdminLike = { from: (table: string) => any };

let rateCache: { at: number; rates: RateTable } | null = null;
/** One lookup per isolate per minute, not one per call. */
const RATE_CACHE_MS = 60_000;

/**
 * Rates for pricing, with any `app_config.ai_rates` overrides merged on top of
 * the compiled defaults. An absent, empty or malformed config leaves today's
 * behavior exactly as it is (the remote-config contract), so a broken edit can
 * never silently zero the spend fuse.
 */
export async function loadRates(admin: AdminLike): Promise<RateTable> {
  if (rateCache && Date.now() - rateCache.at < RATE_CACHE_MS) return rateCache.rates;
  try {
    const { data } = await admin
      .from("app_config")
      .select("value")
      .eq("key", "ai_rates")
      .maybeSingle();
    const raw = (data?.value ?? null) as Record<string, unknown> | null;
    if (!raw || typeof raw !== "object") {
      rateCache = { at: Date.now(), rates: DEFAULT_RATES };
      return DEFAULT_RATES;
    }
    const merged: RateTable = { ...DEFAULT_RATES };
    for (const [prefix, pair] of Object.entries(raw)) {
      if (
        Array.isArray(pair) && pair.length === 2 &&
        typeof pair[0] === "number" && typeof pair[1] === "number" &&
        pair[0] >= 0 && pair[1] >= 0
      ) {
        merged[prefix] = [pair[0], pair[1]];
      }
    }
    rateCache = { at: Date.now(), rates: merged };
    return merged;
  } catch {
    // A failed lookup must not pin the compiled defaults for a whole minute:
    // leave the cache empty so the next call retries the config.
    return DEFAULT_RATES;
  }
}

/** The [input, output] rate for a model id, matched by longest prefix. */
export function rateFor(model: string, rates: RateTable = DEFAULT_RATES): [number, number] {
  const id = (model ?? "").toLowerCase();
  let best: [number, number] | null = null;
  let bestLen = -1;
  for (const [prefix, pair] of Object.entries(rates)) {
    if (id.startsWith(prefix) && prefix.length > bestLen) {
      best = pair;
      bestLen = prefix.length;
    }
  }
  return best ?? FALLBACK_RATE;
}

/** What one call cost, from the tokens the provider actually reported. */
export function priceCall(
  model: string,
  usage: TokenUsage,
  rates: RateTable = DEFAULT_RATES,
): number {
  const [inRate, outRate] = rateFor(model, rates);
  const fresh = Math.max(0, usage.inputTokens - usage.cachedInputTokens);
  return (
    (fresh / 1e6) * inRate +
    (usage.cachedInputTokens / 1e6) * inRate * CACHE_READ_MULTIPLIER +
    (usage.outputTokens / 1e6) * outRate
  );
}

/* ------------------- reading the counts out of a response ------------------ */
// Each provider names these differently, and every one of them can omit the
// block entirely on an error path, so all three coerce to 0 rather than NaN.

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
}

/** One level of a provider response, without trusting its shape. */
function at(obj: unknown, key: string): unknown {
  return obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined;
}

/** Anthropic `usage`: input_tokens / output_tokens / cache_read_input_tokens. */
export function anthropicUsage(data: unknown): TokenUsage {
  const u = at(data, "usage");
  return {
    inputTokens: num(at(u, "input_tokens")) + num(at(u, "cache_read_input_tokens")),
    outputTokens: num(at(u, "output_tokens")),
    cachedInputTokens: num(at(u, "cache_read_input_tokens")),
  };
}

/** OpenAI `usage`: prompt_tokens / completion_tokens (reasoning tokens are in
 *  completion_tokens already, which is what OpenAI bills). */
export function openaiUsage(data: unknown): TokenUsage {
  const u = at(data, "usage");
  return {
    inputTokens: num(at(u, "prompt_tokens") ?? at(u, "input_tokens")),
    outputTokens: num(at(u, "completion_tokens") ?? at(u, "output_tokens")),
    cachedInputTokens: num(at(at(u, "prompt_tokens_details"), "cached_tokens")),
  };
}

/** Gemini `usageMetadata`: promptTokenCount / candidatesTokenCount, plus the
 *  thinking tokens, which Google bills as output on a thinking model. */
export function geminiUsage(data: unknown): TokenUsage {
  const u = at(data, "usageMetadata");
  return {
    inputTokens: num(at(u, "promptTokenCount")),
    outputTokens: num(at(u, "candidatesTokenCount")) + num(at(u, "thoughtsTokenCount")),
    cachedInputTokens: num(at(u, "cachedContentTokenCount")),
  };
}

/* ------------------------------ the ledger row ----------------------------- */

export interface AiCallRow {
  userId: string | null;
  feature: AiFeature;
  provider: Provider;
  model: string;
  usage: TokenUsage;
  costEstimate: number;
  /** True when the answer came from our own cache, so no provider call happened. */
  cacheHit?: boolean;
  /** False when the call failed or its output was unusable (a leg that lost the
   *  cascade still costs money, so it is recorded, not dropped). */
  ok?: boolean;
}

/**
 * Write one row per provider call. Best-effort by design: this is accounting,
 * and it must never be the reason a learner's correction fails. The failure is
 * logged rather than swallowed silently, so a broken ledger is visible in the
 * function logs instead of looking like zero usage.
 */
export async function recordAiCall(admin: AdminLike, row: AiCallRow): Promise<void> {
  try {
    const { error } = await admin.from("ai_calls").insert({
      user_id: row.userId,
      feature: row.feature,
      provider: row.provider,
      model: row.model,
      input_tokens: row.usage.inputTokens,
      output_tokens: row.usage.outputTokens,
      cached_input_tokens: row.usage.cachedInputTokens,
      cost_estimate: row.costEstimate,
      rate_version: RATE_VERSION,
      cache_hit: row.cacheHit ?? false,
      ok: row.ok ?? true,
    });
    if (error) console.error(`[ai_calls] insert failed: ${error.message}`);
  } catch (e) {
    console.error(`[ai_calls] insert threw: ${e}`);
  }
}

/** Which provider a model id belongs to. */
export function providerOf(model: string): Provider {
  const id = (model ?? "").toLowerCase();
  if (id.startsWith("gemini")) return "google";
  if (id.startsWith("claude")) return "anthropic";
  return "openai";
}
