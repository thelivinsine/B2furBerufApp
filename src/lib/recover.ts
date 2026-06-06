/**
 * Self-heal from a stale Service Worker after a deploy.
 *
 * The PWA service worker precaches `index.html` plus every content-hashed JS
 * chunk. After a new deploy the chunk filenames change, but a returning user's
 * SW can keep serving the OLD `index.html` — which references chunks that no
 * longer exist on the server. The dynamic `import()` then fails with
 * "Failed to fetch dynamically imported module".
 *
 * A plain `location.reload()` does NOT fix this: the SW serves the same stale
 * `index.html` again. The only reliable recovery is to drop the caches and
 * unregister the SW so the reload fetches a fresh `index.html` over the network.
 *
 * Guarded by a timestamp in sessionStorage: we recover at most once per ~10s so
 * a genuine, persistent failure (offline, server down) shows the error boundary
 * instead of looping forever — while a later deploy can still trigger recovery.
 */
let recovering = false;

export async function recoverFromStaleAssets(): Promise<void> {
  if (recovering) return;
  const last = Number(sessionStorage.getItem("_chunkReloadAt") || "0");
  if (Date.now() - last < 10_000) return; // recovered very recently — avoid a reload loop
  recovering = true;
  sessionStorage.setItem("_chunkReloadAt", String(Date.now()));

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    // best-effort — reload regardless so we at least re-fetch index.html
  }
  window.location.reload();
}

/** True if an error looks like a failed dynamic-chunk import (stale SW). */
export function isChunkLoadError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("Unable to preload CSS")
  );
}
