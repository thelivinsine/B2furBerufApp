import { useCallback, useEffect, useRef, useState } from "react";
import { listen, recognitionSupported, type RecognitionHandle } from "@/engine/speech";

/**
 * The microphone, as a hook (s193).
 *
 * `engine/speech.ts` has shipped a working, feature-detected speech-recognition
 * wrapper since the one-word production drill, and until now the entire
 * Sprechen area never called it. This is what calls it.
 *
 * Three things it has to get right, all of which are the difference between a
 * speaking feature that feels solid and one that feels broken:
 *
 *  - **Partial text is shown while speaking.** A microphone that shows nothing
 *    until you stop reads as frozen.
 *  - **The final transcript is assembled from every final chunk**, not just the
 *    last one. Recognition emits a stream of finals for a long utterance;
 *    keeping only the newest silently truncates what the learner said.
 *  - **Unsupported browsers get typing, not a dead button.** Firefox has no Web
 *    Speech recognition at all, so `supported` is false there and the caller
 *    renders the text fallback. That fallback is exactly today's experience, so
 *    nobody ends up worse off than before this feature existed.
 */

export type MicState = "idle" | "listening" | "denied" | "unsupported";

export interface SpeechInput {
  state: MicState;
  /** True while the microphone is open. */
  listening: boolean;
  /** Whether this browser can transcribe at all. */
  supported: boolean;
  /** Everything recognised so far this utterance, finals + the live partial. */
  text: string;
  start: () => void;
  /** Stop and hand back what was heard. */
  stop: () => string;
  /** Throw away the current utterance without submitting it. */
  reset: () => void;
  /** Set when recognition failed in a way worth telling the learner about. */
  error: string | null;
}

export function useSpeechInput(): SpeechInput {
  const supported = recognitionSupported();
  const [state, setState] = useState<MicState>(supported ? "idle" : "unsupported");
  const [finals, setFinals] = useState("");
  const [partial, setPartial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<RecognitionHandle | null>(null);
  // Read synchronously by `stop()`, which must return the transcript in the
  // same tick: React state would still hold the previous render's value.
  const finalsRef = useRef("");

  // A live microphone must not outlive the screen that opened it.
  useEffect(() => {
    return () => {
      handle.current?.stop();
      handle.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (!supported || handle.current) return;
    setFinals("");
    setPartial("");
    setError(null);
    finalsRef.current = "";
    const h = listen({
      onPartial: (t) => setPartial(t),
      onFinal: (t) => {
        // Append: one utterance can produce several final chunks.
        finalsRef.current = `${finalsRef.current} ${t}`.trim();
        setFinals(finalsRef.current);
        setPartial("");
      },
      onError: (err) => {
        // "no-speech" and "aborted" are routine and not worth a message.
        if (err === "not-allowed" || err === "service-not-allowed") {
          setState("denied");
          setError("Ohne Mikrofon-Erlaubnis kann ich dich nicht hören. Du kannst stattdessen tippen.");
        } else if (err !== "no-speech" && err !== "aborted") {
          setError("Ich konnte dich nicht hören. Versuch es noch einmal.");
        }
      },
      onEnd: () => {
        handle.current = null;
        setState((s) => (s === "denied" ? s : "idle"));
      },
    });
    if (!h) {
      setState("unsupported");
      return;
    }
    handle.current = h;
    setState("listening");
  }, [supported]);

  const stop = useCallback(() => {
    handle.current?.stop();
    handle.current = null;
    setState((s) => (s === "denied" ? s : "idle"));
    const said = `${finalsRef.current} ${partial}`.trim();
    setFinals("");
    setPartial("");
    finalsRef.current = "";
    return said;
  }, [partial]);

  const reset = useCallback(() => {
    handle.current?.stop();
    handle.current = null;
    setFinals("");
    setPartial("");
    finalsRef.current = "";
    setError(null);
    setState((s) => (s === "denied" ? s : supported ? "idle" : "unsupported"));
  }, [supported]);

  return {
    state,
    listening: state === "listening",
    supported,
    text: `${finals} ${partial}`.trim(),
    start,
    stop,
    reset,
    error,
  };
}
