import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { joinTranscript, listen } from "@/engine/speech";
import { useSpeechInput } from "@/features/sprechen/useSpeechInput";

/**
 * The microphone transcript (s209).
 *
 * The bug this file exists for: on iOS the Sprechen screen printed the
 * learner's sentence back to them word by word, over and over ("hallo hallo
 * hallo Petra hallo Petra ich finde …"), because every recognition event was
 * APPENDED. Safari re-delivers a result it has already sent, as a longer
 * version of itself, and flags interim results as final, so appending is
 * exactly wrong. The transcript is rebuilt from the full result list instead.
 */

/** A `SpeechRecognitionResult`: an indexed alternative list plus `isFinal`. */
function result(transcript: string, isFinal: boolean) {
  return { 0: { transcript }, length: 1, isFinal };
}

/** The event shape both browsers deliver: the full list so far + a start index. */
function resultEvent(results: ReturnType<typeof result>[], resultIndex: number) {
  return { results: { ...results, length: results.length }, resultIndex };
}

class FakeRecognition {
  static last: FakeRecognition | null = null;
  lang = "";
  continuous = false;
  interimResults = false;
  started = false;
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.started = true;
  }
  stop() {
    this.started = false;
    this.onend?.();
  }
}

beforeEach(() => {
  FakeRecognition.last = null;
  (window as any).SpeechRecognition = FakeRecognition;
});

afterEach(() => {
  delete (window as any).SpeechRecognition;
  delete (window as any).webkitSpeechRecognition;
});

describe("joinTranscript", () => {
  it("keeps distinct segments", () => {
    expect(joinTranscript(["Ich finde", "die Idee gut"])).toBe("Ich finde die Idee gut");
  });

  it("replaces a segment that restates and extends the one before it", () => {
    expect(joinTranscript(["hallo", "hallo Petra", "hallo Petra ich finde"])).toBe(
      "hallo Petra ich finde",
    );
  });

  it("treats a capitalised restatement as the same segment", () => {
    expect(joinTranscript(["hallo petra", "Hallo Petra, ich"])).toBe("Hallo Petra, ich");
  });

  it("drops empty pieces instead of padding the join", () => {
    expect(joinTranscript(["", "  ", "Guten Tag", ""])).toBe("Guten Tag");
  });

  it("never merges a genuine repetition into one word", () => {
    expect(joinTranscript(["Ja", "genau", "ja"])).toBe("Ja genau ja");
  });
});

describe("listen", () => {
  it("reports the whole transcript so far, not the delta", () => {
    const partials: string[] = [];
    const finals: string[] = [];
    listen({ onPartial: (t) => partials.push(t), onFinal: (t) => finals.push(t) });
    const rec = FakeRecognition.last!;

    rec.onresult!(resultEvent([result("Ich finde", true)], 0));
    rec.onresult!(resultEvent([result("Ich finde", true), result("die Idee", false)], 1));
    rec.onresult!(resultEvent([result("Ich finde", true), result("die Idee gut", true)], 1));

    expect(partials).toEqual(["Ich finde", "Ich finde die Idee", "Ich finde die Idee gut"]);
    expect(finals).toEqual(["Ich finde", "Ich finde die Idee gut"]);
  });

  it("survives a result the browser sends twice", () => {
    const partials: string[] = [];
    const finals: string[] = [];
    listen({ onPartial: (t) => partials.push(t), onFinal: (t) => finals.push(t) });
    const rec = FakeRecognition.last!;

    const event = resultEvent([result("Guten Morgen", true)], 0);
    rec.onresult!(event);
    rec.onresult!(event);

    expect(partials).toEqual(["Guten Morgen", "Guten Morgen"]);
    // Unchanged settled text is not a new final: a caller grading on `onFinal`
    // must not grade the same sentence twice.
    expect(finals).toEqual(["Guten Morgen"]);
  });

  it("never appends an iOS interim that arrives flagged as final", () => {
    let live = "";
    listen({ onPartial: (t) => (live = t) });
    const rec = FakeRecognition.last!;

    // iOS Safari: the growing utterance, every snapshot flagged final, the
    // result index parked on the same entry.
    for (const snapshot of ["hallo", "hallo Petra", "hallo Petra ich", "hallo Petra ich finde"]) {
      rec.onresult!(resultEvent([result(snapshot, true)], 0));
    }

    expect(live).toBe("hallo Petra ich finde");
  });
});

describe("useSpeechInput", () => {
  it("shows the utterance once, however often the browser re-sends it", () => {
    const { result: hook } = renderHook(() => useSpeechInput());
    act(() => hook.current.start());
    const rec = FakeRecognition.last!;

    // The screenshot's exact sequence: one growing utterance, delivered as a
    // chain of longer and longer snapshots.
    act(() => {
      for (const snapshot of [
        "ich",
        "ich finde",
        "ich finde die Idee",
        "ich finde die Idee für Home Office ist gut",
      ]) {
        rec.onresult!(resultEvent([result(snapshot, true)], 0));
      }
    });

    expect(hook.current.text).toBe("ich finde die Idee für Home Office ist gut");
  });

  it("keeps what was heard when the recogniser restarts mid-utterance", () => {
    const { result: hook } = renderHook(() => useSpeechInput());
    act(() => hook.current.start());

    act(() => {
      FakeRecognition.last!.onresult!(resultEvent([result("Ich finde die Idee gut", true)], 0));
    });
    // Mobile Chrome ignores `continuous` and ends after a pause. The utterance
    // stays open, a second recogniser opens, and its text is appended to the
    // banked text rather than replacing it.
    act(() => FakeRecognition.last!.onend!());
    act(() => {
      FakeRecognition.last!.onresult!(resultEvent([result("weil wir flexibler sind", true)], 0));
    });

    expect(hook.current.text).toBe("Ich finde die Idee gut weil wir flexibler sind");
    expect(hook.current.listening).toBe(true);

    let said = "";
    act(() => {
      said = hook.current.stop();
    });
    expect(said).toBe("Ich finde die Idee gut weil wir flexibler sind");
    expect(hook.current.text).toBe("");
    expect(hook.current.listening).toBe(false);
  });

  it("hands back the live tail the browser never settled", () => {
    const { result: hook } = renderHook(() => useSpeechInput());
    act(() => hook.current.start());
    act(() => {
      FakeRecognition.last!.onresult!(resultEvent([result("Das sehe ich auch so", false)], 0));
    });

    let said = "";
    act(() => {
      said = hook.current.stop();
    });
    expect(said).toBe("Das sehe ich auch so");
  });

  it("starts the next utterance empty", () => {
    const { result: hook } = renderHook(() => useSpeechInput());
    act(() => hook.current.start());
    act(() => {
      FakeRecognition.last!.onresult!(resultEvent([result("Erste Antwort", true)], 0));
    });
    act(() => {
      hook.current.stop();
    });

    act(() => hook.current.start());
    act(() => {
      FakeRecognition.last!.onresult!(resultEvent([result("Zweite Antwort", true)], 0));
    });
    expect(hook.current.text).toBe("Zweite Antwort");
  });

  it("stops on a denied microphone instead of restarting forever", () => {
    const { result: hook } = renderHook(() => useSpeechInput());
    act(() => hook.current.start());
    const rec = FakeRecognition.last!;
    act(() => rec.onerror!({ error: "not-allowed" }));
    act(() => rec.onend!());

    expect(hook.current.state).toBe("denied");
    expect(hook.current.error).toBeTruthy();
  });
});

describe("recognition is not supported", () => {
  it("reports unsupported rather than a dead microphone", () => {
    delete (window as any).SpeechRecognition;
    const { result: hook } = renderHook(() => useSpeechInput());
    expect(hook.current.supported).toBe(false);
    expect(hook.current.state).toBe("unsupported");
    expect(listen({})).toBeNull();
  });
});

/** Nothing above may leave a live recogniser behind. */
afterEach(() => vi.restoreAllMocks());
