import { useCallback, useEffect, useRef, useState } from "react";

/** A countdown timer (seconds). Calls onExpire once when it reaches zero. */
export function useCountdown(seconds: number, opts: { auto?: boolean; onExpire?: () => void } = {}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(opts.auto ?? false);
  const onExpire = useRef(opts.onExpire);
  onExpire.current = opts.onExpire;

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      onExpire.current?.();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(
    (to: number = seconds) => {
      setRemaining(to);
      setRunning(false);
    },
    [seconds],
  );

  return { remaining, running, start, pause, reset, setRemaining };
}

/** A simple elapsed-seconds stopwatch. */
export function useStopwatch(auto = false) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(auto);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return {
    elapsed,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setElapsed(0);
      setRunning(false);
    },
  };
}

/**
 * Millisecond answer timer for response-latency capture. Returns a stable getter
 * for the elapsed time (ms) since the current prompt first rendered. Pass a
 * `key` that changes per prompt (question id, card id, block key); the start
 * time resets in the render phase when `key` changes, so it captures "first
 * render of the new prompt" before paint. Ref writes are idempotent under
 * StrictMode. Unlike `useStopwatch`/`useCountdown` (second-granular) this reads
 * `performance.now()` directly for sub-second precision.
 */
export function useAnswerTimer(key: unknown): () => number {
  const startRef = useRef(performance.now());
  const keyRef = useRef(key);
  if (keyRef.current !== key) {
    keyRef.current = key;
    startRef.current = performance.now();
  }
  return useCallback(() => Math.round(performance.now() - startRef.current), []);
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
