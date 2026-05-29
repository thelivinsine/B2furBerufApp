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
