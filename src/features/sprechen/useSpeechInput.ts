import { useCallback, useEffect, useRef, useState } from "react";
import {
  joinTranscript,
  listen,
  recognitionSupported,
  type RecognitionHandle,
} from "@/engine/speech";

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
 *  - **The transcript of one recogniser session is ASSIGNED, never appended**
 *    (s209). `listen()` reports the whole transcript heard so far on every
 *    event, precisely because a browser re-delivers a result it has already
 *    sent; accumulating those here is what printed the learner's sentence back
 *    to them word by word, over and over. Only the text of a recogniser session
 *    that has ENDED is committed, and only a restart can append.
 *  - **The recogniser ending on its own does not end the utterance.** Chrome
 *    stops after a silence and mobile Chrome routinely ignores `continuous`,
 *    which used to drop the learner back to a "Sprechen" button whose next press
 *    RESET the transcript: they watched their sentence disappear (s194 audit
 *    P13). The utterance now stays open across an automatic end, restarts
 *    itself, and only `stop()` or `reset()` close it.
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
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<RecognitionHandle | null>(null);
  // Both are read synchronously by `stop()`, which must return the transcript
  // in the same tick: React state would still hold the previous render's value.
  /** Transcripts of recogniser sessions that have already ended this utterance. */
  const committedRef = useRef("");
  /** The live transcript of the running recogniser session, replaced on every event. */
  const sessionRef = useRef("");
  /**
   * True from the moment the learner opens the microphone until they stop or
   * reset it. An automatic end from the recogniser does NOT close it, which is
   * what keeps the transcript alive across Chrome's silence timeout.
   */
  const openRef = useRef(false);
  /** Guard against an end/restart loop when the recogniser cannot run. */
  const restarts = useRef(0);
  const RESTART_LIMIT = 40;
  /**
   * The opener, reached through a ref so `onEnd` can re-open the recogniser
   * without the callback referring to itself before it is declared.
   */
  const reopen = useRef<() => boolean>(() => false);

  // A live microphone must not outlive the screen that opened it.
  useEffect(() => {
    return () => {
      openRef.current = false;
      handle.current?.stop();
      handle.current = null;
    };
  }, []);

  /** Everything heard this utterance: the ended sessions plus the running one. */
  const heard = useCallback(
    () => joinTranscript([committedRef.current, sessionRef.current]),
    [],
  );

  const open = useCallback<() => boolean>(() => {
    const h = listen({
      // ASSIGN: `t` is the whole transcript of this recogniser session, so a
      // re-delivered result overwrites itself instead of doubling the sentence.
      onPartial: (t) => {
        sessionRef.current = t;
        setText(heard());
      },
      onError: (err) => {
        // "no-speech" and "aborted" are routine and not worth a message.
        if (err === "not-allowed" || err === "service-not-allowed") {
          openRef.current = false;
          setState("denied");
          setError("Ohne Mikrofon-Erlaubnis kann ich dich nicht hören. Du kannst stattdessen tippen.");
        } else if (err !== "no-speech" && err !== "aborted") {
          setError("Ich konnte dich nicht hören. Versuch es noch einmal.");
        }
      },
      onEnd: () => {
        handle.current = null;
        // This session is over, so its text can no longer change: bank it and
        // start the next one empty. This is the ONE place text accumulates.
        committedRef.current = heard();
        sessionRef.current = "";
        // The recogniser stopped by itself while the learner is still speaking
        // (a silence, or mobile Chrome ignoring `continuous`). Re-open it and
        // keep everything heard so far; the learner never sees an interruption.
        if (openRef.current && restarts.current < RESTART_LIMIT) {
          restarts.current += 1;
          if (reopen.current()) return;
        }
        openRef.current = false;
        setState((s) => (s === "denied" ? s : "idle"));
      },
    });
    if (!h) return false;
    handle.current = h;
    setState("listening");
    return true;
  }, [heard]);

  useEffect(() => {
    reopen.current = open;
  }, [open]);

  const start = useCallback(() => {
    if (!supported || handle.current) return;
    // A fresh utterance clears the buffer; re-opening after an automatic end
    // never reaches here, because `openRef` keeps the handle path alive.
    setText("");
    setError(null);
    committedRef.current = "";
    sessionRef.current = "";
    openRef.current = true;
    restarts.current = 0;
    if (!open()) {
      openRef.current = false;
      setState("unsupported");
    }
  }, [supported, open]);

  const stop = useCallback(() => {
    openRef.current = false;
    handle.current?.stop();
    handle.current = null;
    setState((s) => (s === "denied" ? s : "idle"));
    const said = heard();
    setText("");
    committedRef.current = "";
    sessionRef.current = "";
    return said;
  }, [heard]);

  const reset = useCallback(() => {
    openRef.current = false;
    handle.current?.stop();
    handle.current = null;
    setText("");
    committedRef.current = "";
    sessionRef.current = "";
    setError(null);
    setState((s) => (s === "denied" ? s : supported ? "idle" : "unsupported"));
  }, [supported]);

  return {
    state,
    listening: state === "listening",
    supported,
    text,
    start,
    stop,
    reset,
    error,
  };
}
