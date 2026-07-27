import { hasLiveWork } from "./liveWork";

/**
 * Adopt a freshly deployed version without waiting for the user to relaunch
 * the app twice.
 *
 * The PWA registers with `registerType: "autoUpdate"` (vite-plugin-pwa), so a
 * new service worker installs and takes control (`skipWaiting` +
 * `clientsClaim`) shortly after launch — but the page keeps running the OLD
 * precached JS until the next full reload. On an installed home-screen app
 * that means a deploy only becomes visible on the second relaunch, which reads
 * as "the fix didn't ship".
 *
 * Strategy, deliberately conservative about interrupting a learner:
 * - A reload NEVER happens while a surface holds unsaved work (`hasLiveWork()`:
 *   a writing draft, a running Üben session). Losing a half-written email to
 *   pick up a deploy a few minutes earlier is a terrible trade, and it is
 *   exactly what the founder reported in s172.
 * - If the new worker takes control within the first 30s after load (the
 *   normal update-on-launch case) and nothing is in progress, reload
 *   immediately: the user has barely started, and this is when they expect
 *   fresh content.
 * - Otherwise the reload is deferred to the next time the app is resumed from
 *   the background AND nothing is in progress. If work is still open at that
 *   moment we simply keep waiting, re-checking on every later resume.
 * - When the app is resumed, also ask the browser to re-check `sw.js`
 *   (throttled to once a minute): iOS PWAs are usually resumed, not
 *   relaunched, so without this a long-lived app never sees new deploys.
 */
export function watchSwUpdates(): void {
  if (!("serviceWorker" in navigator)) return;

  // On the very first visit `clientsClaim` also fires `controllerchange`;
  // reloading there would flash the fresh install for no benefit.
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloaded = false;
  let pendingReload = false;

  /** Reload only when nothing would be destroyed; otherwise stay pending. */
  const reloadIfSafe = () => {
    if (reloaded) return;
    if (hasLiveWork()) {
      pendingReload = true;
      return;
    }
    reloaded = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if (performance.now() < 30_000) reloadIfSafe();
    else pendingReload = true;
  });

  let lastCheck = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (pendingReload) {
      // Either this reloads, or work is still open and the update stays queued
      // for the next resume. Re-checking `sw.js` is moot either way.
      reloadIfSafe();
      return;
    }
    const now = Date.now();
    if (now - lastCheck < 60_000) return;
    lastCheck = now;
    // A background update check is best-effort: offline / airplane mode / a
    // transient network blip makes `update()` reject with "Failed to update a
    // ServiceWorker ... An unknown error occurred when fetching the script".
    // That is harmless (the app runs from the precache), so swallow it — an
    // unhandled rejection here would otherwise trip the global error handler
    // and paint the fatal "App failed to load" screen over a working app.
    void navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.update())
      .catch(() => {});
  });
}
