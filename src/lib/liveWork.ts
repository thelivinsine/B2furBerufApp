/**
 * "Live work" registry: never yank the page out from under a learner.
 *
 * The app auto-adopts new deploys by reloading the page (`lib/swUpdate.ts`) and
 * self-heals a stale precache the same way (`lib/recover.ts`). Both were
 * unconditional, so a deploy landing while someone was writing an email or
 * halfway through an Üben session wiped the draft / the run (founder report,
 * s172). A reload is never worth losing typed work.
 *
 * Any surface holding unsaved in-memory work claims it here:
 *   - `hasLiveWork()` tells the reloaders to wait.
 *   - `flushLiveWork()` gives every claim a last chance to persist itself
 *     before a reload we cannot avoid (a chunk-load crash, the OS discarding
 *     the tab, the learner hitting refresh).
 *
 * Claims are cheap module state, not a store: the reloaders run outside React.
 */
import { useEffect, useRef } from "react";

export interface LiveWorkClaim {
  /** Short debugging label, e.g. "writing:kurz" or "session". */
  label: string;
  /** Persist whatever is in memory right now. Must be synchronous. */
  flush?: () => void;
}

const claims = new Map<number, LiveWorkClaim>();
let nextId = 1;

/** Register unsaved work. Returns the release function (call it when done). */
export function claimLiveWork(claim: LiveWorkClaim): () => void {
  const id = nextId++;
  claims.set(id, claim);
  return () => {
    claims.delete(id);
  };
}

/** True while any surface holds work a reload would destroy. */
export function hasLiveWork(): boolean {
  return claims.size > 0;
}

/** Labels of the current claims (debugging / diagnostics only). */
export function liveWorkLabels(): string[] {
  return Array.from(claims.values(), (c) => c.label);
}

/**
 * Ask every claim to persist now. Best-effort and never throws: this runs on
 * the way out (pagehide / an unavoidable reload), where one broken handler must
 * not stop the others from saving.
 */
export function flushLiveWork(): void {
  for (const claim of claims.values()) {
    try {
      claim.flush?.();
    } catch {
      /* a failed save must not block the rest */
    }
  }
}

/** Test seam: drop every claim. */
export function resetLiveWork(): void {
  claims.clear();
}

/**
 * Persist in-flight work whenever the page is on its way out. `pagehide` is the
 * one event iOS Safari reliably fires before discarding a backgrounded tab;
 * `visibilitychange` covers app-switching on Android, and `beforeunload` covers
 * a desktop refresh. All three just flush, so firing several times is harmless.
 */
export function installLiveWorkFlush(): void {
  const flush = () => flushLiveWork();
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

/**
 * React binding: hold a claim while `active`, and keep the flush callback
 * fresh without re-registering on every keystroke (the ref indirection means a
 * changing closure does not churn the registry).
 */
export function useLiveWork(active: boolean, label: string, flush?: () => void): void {
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => {
    if (!active) return;
    const release = claimLiveWork({ label, flush: () => flushRef.current?.() });
    return () => {
      // Unmounting (a tab switch, a route change) is also a moment where a
      // debounced save may not have fired yet, so persist on the way out.
      flushRef.current?.();
      release();
    };
  }, [active, label]);
}
