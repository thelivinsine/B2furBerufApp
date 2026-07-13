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
 * Strategy, deliberately conservative about interrupting a learning session:
 * - If the new worker takes control within the first 30s after load (the
 *   normal update-on-launch case), reload immediately — the user has barely
 *   started, and this is exactly when they expect fresh content.
 * - If it takes control later (e.g. a deploy lands mid-session), defer the
 *   reload to the next time the app is resumed from the background, so an
 *   in-progress exercise is never yanked away.
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

  const reload = () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if (performance.now() < 30_000) reload();
    else pendingReload = true;
  });

  let lastCheck = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (pendingReload) {
      reload();
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
