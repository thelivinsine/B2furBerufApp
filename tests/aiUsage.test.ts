import { describe, it, expect } from "vitest";
import {
  anthropicUsage,
  geminiUsage,
  openaiUsage,
  priceCall,
  providerOf,
  rateFor,
  EMPTY_USAGE,
} from "../supabase/functions/_shared/aiUsage.ts";

/**
 * Pins the AI usage accounting shipped in s204 (founder: "how do we make sure we
 * see real usage and costs and not just estimates?").
 *
 * The module runs inside Deno on the Edge Functions, but it is plain TypeScript
 * with no Deno APIs precisely so it can be gated here: this is the arithmetic
 * behind the money figure in the admin control centre, and it used to be four
 * hand-copied formulas, one of which was a flat $0.004 guess.
 *
 * What matters and is therefore tested: the counts come out of the shape each
 * provider actually returns, a missing usage block reads as zero rather than
 * NaN, and an unknown model is never free.
 */

describe("provider token parsing", () => {
  it("reads Anthropic's usage block, counting cache reads as input", () => {
    // Anthropic reports cache reads SEPARATELY from input_tokens, so the total
    // prompt is the sum; billing them at the cheaper rate happens in priceCall.
    expect(
      anthropicUsage({ usage: { input_tokens: 900, output_tokens: 120, cache_read_input_tokens: 100 } }),
    ).toEqual({ inputTokens: 1000, outputTokens: 120, cachedInputTokens: 100 });
  });

  it("reads OpenAI's usage block, including its cached-prompt detail", () => {
    expect(
      openaiUsage({
        usage: { prompt_tokens: 800, completion_tokens: 200, prompt_tokens_details: { cached_tokens: 300 } },
      }),
    ).toEqual({ inputTokens: 800, outputTokens: 200, cachedInputTokens: 300 });
  });

  it("counts Gemini's thinking tokens as output, because Google bills them", () => {
    expect(
      geminiUsage({
        usageMetadata: { promptTokenCount: 500, candidatesTokenCount: 100, thoughtsTokenCount: 400 },
      }),
    ).toEqual({ inputTokens: 500, outputTokens: 500, cachedInputTokens: 0 });
  });

  it("reads a response with no usage block as zero, never NaN", () => {
    // Every provider omits it on some error path. A NaN here would poison the
    // cost column and, through it, the monthly spend fuse.
    for (const parse of [anthropicUsage, openaiUsage, geminiUsage]) {
      expect(parse({})).toEqual(EMPTY_USAGE);
      expect(parse(null)).toEqual(EMPTY_USAGE);
    }
  });
});

describe("pricing", () => {
  it("prices Claude from the published per-million rates", () => {
    // Sonnet 5 at $3 in / $15 out: 1M in + 1M out = $18.
    const cost = priceCall("claude-sonnet-5", {
      inputTokens: 1_000_000, outputTokens: 1_000_000, cachedInputTokens: 0,
    });
    expect(cost).toBeCloseTo(18, 6);
  });

  it("matches a dated model snapshot to its family by prefix", () => {
    expect(rateFor("claude-sonnet-5-20260101")).toEqual([3, 15]);
    expect(rateFor("claude-haiku-4-5")).toEqual([1, 5]);
  });

  it("charges cached prompt tokens at a tenth of the input rate", () => {
    // 1M prompt tokens, all of them cache reads, at $3/M -> $0.30, not $3.
    expect(
      priceCall("claude-sonnet-5", {
        inputTokens: 1_000_000, outputTokens: 0, cachedInputTokens: 1_000_000,
      }),
    ).toBeCloseTo(0.3, 6);
  });

  it("prices Gemini at zero while it answers from the free tier", () => {
    expect(
      priceCall("gemini-2.5-flash", { inputTokens: 5000, outputTokens: 5000, cachedInputTokens: 0 }),
    ).toBe(0);
  });

  it("never treats an unknown model as free", () => {
    // A model id we do not recognise is priced as the most expensive family we
    // serve. The wrong direction here would silently disarm the spend fuse.
    const cost = priceCall("some-new-model", {
      inputTokens: 1_000_000, outputTokens: 0, cachedInputTokens: 0,
    });
    expect(cost).toBeGreaterThan(0);
  });

  it("costs nothing when nothing was spent (a cache hit)", () => {
    expect(priceCall("claude-sonnet-5", EMPTY_USAGE)).toBe(0);
  });
});

describe("provider attribution", () => {
  it("names the provider from the model id", () => {
    expect(providerOf("gemini-2.5-flash")).toBe("google");
    expect(providerOf("claude-sonnet-5")).toBe("anthropic");
    expect(providerOf("gpt-5")).toBe("openai");
  });
});
