import { useCallback, useRef, useState } from "react";
import {
  checkSentence,
  transformSentence,
  type DetectedSentence,
} from "@/lib/sentenceStudio";
import {
  DEFAULT_MOOD,
  normalizeDetected,
  type AxisId,
} from "./grammarDimensions";

/**
 * State machine for the Fokus "Satzlabor" (plan:
 * docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md). Ephemeral single-screen state, so
 * it lives here in a hook (like SessionPlayer / the old WritingHub), NOT in
 * zustand. Draft-across-sign-in persistence is handled separately by resumeDraft.
 *
 * The loop:
 *   idle --submit--> corrected (+ detected grammar populates the rail)
 *   corrected --tap pill--> transforming --> transformed (bottom box)
 *   any edit of the top text after a correction --> back to idle (invalidate).
 *
 * Transforms always derive from the CORRECTED sentence with the FULL current
 * selection (voice + tense are orthogonal and combine), never by compounding the
 * previous transform. Repeated toggles are served from an in-memory cache so
 * switching back to a seen cell is instant and free.
 */

export type FokusStatus = "idle" | "submitting" | "corrected" | "error";
export type TransformStatus = "idle" | "loading" | "done" | "error";

export interface FokusSelection {
  voice: string;
  tense: string;
}

export interface TransformView {
  status: TransformStatus;
  applicable: boolean;
  transformed: string;
  note: string;
  noteEn: string;
  reason?: string;
  message?: string;
  cached?: boolean;
}

const EMPTY_TRANSFORM: TransformView = {
  status: "idle",
  applicable: true,
  transformed: "",
  note: "",
  noteEn: "",
};

/** Minimum words before a correction is allowed (mirrors the old editor floor). */
export const MIN_WORDS = 3;

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export interface FokusMachine {
  input: string;
  status: FokusStatus;
  corrected: string;
  hasErrors: boolean;
  /** Detected base grammar of the corrected sentence (null = not detected). */
  detected: { voice: string | null; tense: string | null };
  /** The learner's current target selection (drives the transform). */
  selection: FokusSelection;
  transform: TransformView;
  errorMessage?: string;
  limitReached?: boolean;
  cachedCorrection?: boolean;
  /** True once a correction exists and the top text has since been edited. */
  stale: boolean;
  words: number;

  setInput: (text: string) => void;
  submit: () => Promise<void>;
  selectPill: (axis: AxisId, value: string) => void;
  reset: () => void;
  startOver: () => void;
}

export function useFokusMachine(initial = ""): FokusMachine {
  const [input, setInputState] = useState(initial);
  const [status, setStatus] = useState<FokusStatus>("idle");
  const [corrected, setCorrected] = useState("");
  const [hasErrors, setHasErrors] = useState(false);
  const [detected, setDetected] = useState<{ voice: string | null; tense: string | null }>({
    voice: null,
    tense: null,
  });
  const [selection, setSelection] = useState<FokusSelection>({ voice: "aktiv", tense: "praesens" });
  const [transform, setTransform] = useState<TransformView>(EMPTY_TRANSFORM);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [limitReached, setLimitReached] = useState(false);
  const [cachedCorrection, setCachedCorrection] = useState(false);
  const [stale, setStale] = useState(false);

  // The exact text that produced the current correction; an edit away from it
  // invalidates everything downstream (a stale correction is worse than none).
  const submittedRef = useRef<string | null>(null);
  const checkIdRef = useRef<string | undefined>(undefined);
  const focalRef = useRef<string>("");
  // Client-side transform cache for the current sentence (tuple -> result), so
  // toggling back to a seen cell never hits the network.
  const cacheRef = useRef<Map<string, TransformView>>(new Map());
  // Monotonic request id so a slow earlier transform can't overwrite a newer one.
  const reqRef = useRef(0);

  const invalidate = useCallback(() => {
    submittedRef.current = null;
    checkIdRef.current = undefined;
    focalRef.current = "";
    cacheRef.current.clear();
    reqRef.current++;
    setStatus("idle");
    setCorrected("");
    setHasErrors(false);
    setDetected({ voice: null, tense: null });
    setTransform(EMPTY_TRANSFORM);
    setErrorMessage(undefined);
    setLimitReached(false);
    setCachedCorrection(false);
    setStale(false);
  }, []);

  const setInput = useCallback(
    (text: string) => {
      setInputState(text);
      // Editing after a correction invalidates the correction, rail and output.
      if (submittedRef.current !== null && text !== submittedRef.current) {
        invalidate();
      }
    },
    [invalidate],
  );

  const submit = useCallback(async () => {
    const text = input.trim();
    if (countWords(text) < MIN_WORDS) return;
    reqRef.current++;
    setStatus("submitting");
    setTransform(EMPTY_TRANSFORM);
    setErrorMessage(undefined);
    setLimitReached(false);
    setStale(false);
    cacheRef.current.clear();

    const res = await checkSentence(text);
    if (!res.ok || !res.corrected) {
      setStatus("error");
      setErrorMessage(res.message);
      setLimitReached(!!res.limitReached);
      return;
    }

    const focal: DetectedSentence | undefined = res.sentences?.[0];
    const norm = normalizeDetected(focal?.voice, focal?.tense);
    submittedRef.current = text;
    checkIdRef.current = res.checkId;
    focalRef.current = focal?.text ?? res.corrected;
    setCorrected(res.corrected);
    setHasErrors(!!res.hasErrors);
    setDetected(norm);
    setSelection({ voice: norm.voice ?? "aktiv", tense: norm.tense ?? "praesens" });
    setCachedCorrection(!!res.cached);
    setStatus("corrected");
  }, [input]);

  const runTransform = useCallback(async (sel: FokusSelection) => {
    const key = `${sel.voice}|${sel.tense}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setTransform(cached);
      return;
    }
    const reqId = ++reqRef.current;
    setTransform({ ...EMPTY_TRANSFORM, status: "loading" });

    const res = await transformSentence({
      checkId: checkIdRef.current,
      source: focalRef.current,
      target: { voice: sel.voice, tense: sel.tense, mood: DEFAULT_MOOD },
    });
    if (reqId !== reqRef.current) return; // superseded by a newer selection

    let view: TransformView;
    if (!res.ok) {
      view = {
        ...EMPTY_TRANSFORM,
        status: "error",
        message: res.message,
      };
      setLimitReached(!!res.limitReached);
    } else if (res.applicable === false) {
      view = {
        ...EMPTY_TRANSFORM,
        status: "done",
        applicable: false,
        reason: res.reason,
      };
    } else {
      view = {
        status: "done",
        applicable: true,
        transformed: res.transformed ?? "",
        note: res.note ?? "",
        noteEn: res.noteEn ?? "",
        cached: res.cached,
      };
    }
    // Only cache resolved (non-error) states so a transient failure can retry.
    if (view.status === "done") cacheRef.current.set(key, view);
    setTransform(view);
  }, []);

  const selectPill = useCallback(
    (axis: AxisId, value: string) => {
      if (status !== "corrected") return;
      const next: FokusSelection = { ...selection, [axis]: value };
      setSelection(next);
      // Landing back on the detected base = no transform, hide the bottom box.
      const isBase = next.voice === detected.voice && next.tense === detected.tense;
      if (isBase) {
        reqRef.current++;
        setTransform(EMPTY_TRANSFORM);
        return;
      }
      void runTransform(next);
    },
    [status, selection, detected, runTransform],
  );

  const reset = useCallback(() => {
    reqRef.current++;
    setSelection({ voice: detected.voice ?? "aktiv", tense: detected.tense ?? "praesens" });
    setTransform(EMPTY_TRANSFORM);
  }, [detected]);

  const startOver = useCallback(() => {
    setInputState("");
    invalidate();
  }, [invalidate]);

  return {
    input,
    status,
    corrected,
    hasErrors,
    detected,
    selection,
    transform,
    errorMessage,
    limitReached,
    cachedCorrection,
    stale,
    words: countWords(input),
    setInput,
    submit,
    selectPill,
    reset,
    startOver,
  };
}
