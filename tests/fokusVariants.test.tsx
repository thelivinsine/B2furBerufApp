import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

/**
 * Pins the "Nochmal" counter (s179, founder: "when generating new umformen with
 * AI, there's no count like (2 left out of 3)"). The number is how many NEW AI
 * phrasings the current target form can still produce; the server clamps
 * `variant` to 0..2, so it starts at 3 and never goes below 0. Cycling back to
 * an already-generated phrasing is free and must NOT count down again, and
 * picking a different target form starts a fresh set.
 */

const transformSentence = vi.fn(async (args?: { variant?: number }) => ({
  ok: true,
  applicable: true,
  transformed: `Umgeformt v${args?.variant ?? 0}.`,
  note: "note",
  noteEn: "note",
}));

vi.mock("@/lib/sentenceStudio", () => ({
  checkSentence: vi.fn(async () => ({
    ok: true,
    checkId: "c1",
    corrected: "Der Chef schreibt die E-Mail.",
    hasErrors: false,
    sentences: [
      { text: "Der Chef schreibt die E-Mail.", voice: "aktiv", tense: "praesens", mood: "indikativ" },
    ],
  })),
  transformSentence: (args: { variant?: number }) => transformSentence(args),
}));

const { useFokusMachine, TRANSFORM_VARIANTS } = await import(
  "@/features/writing/fokus/useFokusMachine"
);

describe("Fokus Nochmal counter", () => {
  beforeEach(() => transformSentence.mockClear());

  it("counts 3 -> 2 -> 1 -> 0 as new phrasings are generated, then stops", async () => {
    const { result } = renderHook(() => useFokusMachine(""));
    expect(TRANSFORM_VARIANTS).toBe(3);

    act(() => result.current.setInput("Der Chef schreibt die E-Mail."));
    await act(async () => {
      await result.current.submit();
    });
    await waitFor(() => expect(result.current.status).toBe("corrected"));

    // Pick a target form away from the detected base: variant 0 is generated.
    act(() => result.current.selectPill("tense", "praeteritum"));
    await waitFor(() => expect(result.current.transform.status).toBe("done"));
    expect(result.current.variantsLeft).toBe(2);

    act(() => result.current.regenerate());
    await waitFor(() => expect(result.current.variantsLeft).toBe(1));

    act(() => result.current.regenerate());
    await waitFor(() => expect(result.current.variantsLeft).toBe(0));
    expect(transformSentence).toHaveBeenCalledTimes(3);

    // The 4th press wraps to the cached variant 0: free, no new AI call, and
    // the counter stays at 0 rather than going negative.
    act(() => result.current.regenerate());
    await waitFor(() => expect(result.current.transform.transformed).toBe("Umgeformt v0."));
    expect(result.current.variantsLeft).toBe(0);
    expect(transformSentence).toHaveBeenCalledTimes(3);
  });

  it("starts a fresh set of 3 for a different target form", async () => {
    const { result } = renderHook(() => useFokusMachine(""));
    act(() => result.current.setInput("Der Chef schreibt die E-Mail."));
    await act(async () => {
      await result.current.submit();
    });
    await waitFor(() => expect(result.current.status).toBe("corrected"));

    act(() => result.current.selectPill("tense", "praeteritum"));
    await waitFor(() => expect(result.current.transform.status).toBe("done"));
    act(() => result.current.regenerate());
    await waitFor(() => expect(result.current.variantsLeft).toBe(1));

    act(() => result.current.selectPill("voice", "passiv"));
    await waitFor(() => expect(result.current.transform.status).toBe("done"));
    expect(result.current.variantsLeft).toBe(2);
  });
});
