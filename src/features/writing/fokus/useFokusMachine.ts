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
 * selection (voice, tense and mood are orthogonal and combine), never by
 * compounding the previous transform. Repeated toggles are served from an
 * in-memory cache so switching back to a seen cell is instant and free.
 */

export type FokusStatus = "idle" | "submitting" | "corrected" | "error";
export type TransformStatus = "idle" | "loading" | "done" | "error";

export interface FokusSelection {
  voice: string;
  tense: string;
  mood: string;
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

/**
 * How many AI phrasings exist per target form: the canonical one plus two
 * alternatives. The server clamps `variant` to 0..2 as the real cost cap, so
 * this is the same number from the client side and what the "Nochmal" counter
 * counts down from (founder 2026-07-31).
 */
export const TRANSFORM_VARIANTS = 3;

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
  detected: { voice: string | null; tense: string | null; mood: string | null };
  /** The learner's current target selection (drives the transform). */
  selection: FokusSelection;
  transform: TransformView;
  /** New AI phrasings still available for the CURRENT target form (0..3). */
  variantsLeft: number;
  errorMessage?: string;
  limitReached?: boolean;
  cachedCorrection?: boolean;
  /** True once a correction exists and the top text has since been edited. */
  stale: boolean;
  words: number;

  setInput: (text: string) => void;
  submit: () => Promise<void>;
  selectPill: (axis: AxisId, value: string) => void;
  /** Re-run the AI for the current selection to get an alternative phrasing. */
  regenerate: () => void;
  reset: () => void;
  startOver: () => void;
}

export function useFokusMachine(initial = ""): FokusMachine {
  const [input, setInputState] = useState(initial);
  const [status, setStatus] = useState<FokusStatus>("idle");
  const [corrected, setCorrected] = useState("");
  const [hasErrors, setHasErrors] = useState(false);
  const [detected, setDetected] = useState<{
    voice: string | null;
    tense: string | null;
    mood: string | null;
  }>({ voice: null, tense: null, mood: null });
  const [selection, setSelection] = useState<FokusSelection>({
    voice: "aktiv",
    tense: "praesens",
    mood: DEFAULT_MOOD,
  });
  const [transform, setTransform] = useState<TransformView>(EMPTY_TRANSFORM);
  // Distinct variants already generated for the CURRENT target form, so the
  // "Nochmal" button can say how many new phrasings are still coming (the rest
  // of the cycle re-serves cached ones for free).
  const [variantsUsed, setVariantsUsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [limitReached, setLimitReached] = useState(false);
  const [cachedCorrection, setCachedCorrection] = useState(false);
  const [stale, setStale] = useState(false);

  // The exact text that produced the current correction; an edit away from it
  // invalidates everything downstream (a stale correction is worse than none).
  const submittedRef = useRef<string | null>(null);
  const checkIdRef = useRef<string | undefined>(undefined);
  const focalRef = useRef<string>("");
  // Client-side transform cache for the current sentence (tuple|variant -> result),
  // so toggling back to a seen cell or an already-generated variant is instant/free.
  const cacheRef = useRef<Map<string, TransformView>>(new Map());
  // Current "Nochmal" variant per tuple (0 = canonical, 1..2 = alternatives). The
  // regenerate button cycles 0 -> 1 -> 2 -> 0; new variants generate once (server
  // caps at 2), then cycling is served from cacheRef.
  const variantRef = useRef<Map<string, number>>(new Map());
  // Monotonic request id so a slow earlier transform can't overwrite a newer one.
  const reqRef = useRef(0);

  const invalidate = useCallback(() => {
    submittedRef.current = null;
    checkIdRef.current = undefined;
    focalRef.current = "";
    cacheRef.current.clear();
    variantRef.current.clear();
    reqRef.current++;
    setStatus("idle");
    setCorrected("");
    setHasErrors(false);
    setDetected({ voice: null, tense: null, mood: null });
    setTransform(EMPTY_TRANSFORM);
    setVariantsUsed(0);
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
    setVariantsUsed(0);
    setErrorMessage(undefined);
    setLimitReached(false);
    setStale(false);
    cacheRef.current.clear();
    variantRef.current.clear();

    const res = await checkSentence(text);
    if (!res.ok || !res.corrected) {
      setStatus("error");
      setErrorMessage(res.message);
      setLimitReached(!!res.limitReached);
      return;
    }

    const focal: DetectedSentence | undefined = res.sentences?.[0];
    const norm = normalizeDetected(focal?.voice, focal?.tense, focal?.mood);
    submittedRef.current = text;
    checkIdRef.current = res.checkId;
    focalRef.current = focal?.text ?? res.corrected;
    setCorrected(res.corrected);
    setHasErrors(!!res.hasErrors);
    setDetected(norm);
    setSelection({
      voice: norm.voice ?? "aktiv",
      tense: norm.tense ?? "praesens",
      mood: norm.mood ?? DEFAULT_MOOD,
    });
    setCachedCorrection(!!res.cached);
    setStatus("corrected");
  }, [input]);

  // How many distinct variants of one target form are already generated (and so
  // free to revisit). Counted off the cache, which is the thing that decides
  // whether a "Nochmal" costs an AI call.
  const generatedFor = useCallback((tupleKey: string) => {
    let n = 0;
    for (const key of cacheRef.current.keys()) {
      if (key.startsWith(`${tupleKey}|`)) n++;
    }
    return n;
  }, []);

  const runTransform = useCallback(async (sel: FokusSelection, variant = 0) => {
    const tupleKey = `${sel.voice}|${sel.tense}|${sel.mood}`;
    const key = `${tupleKey}|${variant}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      variantRef.current.set(tupleKey, variant);
      setVariantsUsed(generatedFor(tupleKey));
      setTransform(cached);
      return;
    }
    const reqId = ++reqRef.current;
    setTransform({ ...EMPTY_TRANSFORM, status: "loading" });

    const res = await transformSentence({
      checkId: checkIdRef.current,
      source: focalRef.current,
      target: { voice: sel.voice, tense: sel.tense, mood: sel.mood },
      variant,
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
    if (view.status === "done") {
      cacheRef.current.set(key, view);
      variantRef.current.set(tupleKey, variant);
    }
    setVariantsUsed(generatedFor(tupleKey));
    setTransform(view);
  }, [generatedFor]);

  const selectPill = useCallback(
    (axis: AxisId, value: string) => {
      if (status !== "corrected") return;
      const next: FokusSelection = { ...selection, [axis]: value };
      setSelection(next);
      // Landing back on the detected base = no transform, hide the bottom box.
      const isBase =
        next.voice === detected.voice &&
        next.tense === detected.tense &&
        next.mood === detected.mood;
      if (isBase) {
        reqRef.current++;
        setTransform(EMPTY_TRANSFORM);
        setVariantsUsed(0);
        return;
      }
      // A fresh pill selection starts from the canonical version (variant 0);
      // "Nochmal" advances from there.
      variantRef.current.set(`${next.voice}|${next.tense}|${next.mood}`, 0);
      void runTransform(next, 0);
    },
    [status, selection, detected, runTransform],
  );

  // "Nochmal": cycle to the next AI phrasing of the CURRENT selection. New
  // variants generate once (server caps at 2), then 0 -> 1 -> 2 -> 0 cycles the
  // cached versions for free. No-op on the detected base (no transform shown).
  const regenerate = useCallback(() => {
    if (status !== "corrected") return;
    const sel = selection;
    const isBase =
      sel.voice === detected.voice &&
      sel.tense === detected.tense &&
      sel.mood === detected.mood;
    if (isBase) return;
    const tupleKey = `${sel.voice}|${sel.tense}|${sel.mood}`;
    const current = variantRef.current.get(tupleKey) ?? 0;
    const next = (current + 1) % 3;
    void runTransform(sel, next);
  }, [status, selection, detected, runTransform]);

  const reset = useCallback(() => {
    reqRef.current++;
    setSelection({
      voice: detected.voice ?? "aktiv",
      tense: detected.tense ?? "praesens",
      mood: detected.mood ?? DEFAULT_MOOD,
    });
    setTransform(EMPTY_TRANSFORM);
    setVariantsUsed(0);
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
    variantsLeft: Math.max(0, TRANSFORM_VARIANTS - variantsUsed),
    errorMessage,
    limitReached,
    cachedCorrection,
    stale,
    words: countWords(input),
    setInput,
    submit,
    selectPill,
    regenerate,
    reset,
    startOver,
  };
}
