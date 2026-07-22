/**
 * C1 "Ist meine Änderung live?" logic for the admin Übersicht. Compares the
 * build stamp baked into this bundle (__BUILD_SHA__, via Vite `define`) against
 * the latest commit on `main` from the public GitHub API, and turns the result
 * into plain-language verdicts. Fully fail-soft: an unreachable API or a "dev"
 * build just yields the "unknown" verdict, never an error.
 *
 * The recurring founder confusion this kills: "I merged but I don't see it" is
 * usually either (a) the deploy is still running, or (b) the PWA service worker
 * is serving a cached bundle and the device needs a hard refresh.
 */

const REPO = "thelivinsine/b2furberufapp";

export type DeployState = "current" | "behind" | "unknown";

export interface DeployStatus {
  /** The short sha this bundle was built from ("dev" locally). */
  buildSha: string;
  /** ISO timestamp of the build. */
  buildTime: string;
  /** Latest short sha on origin/main, or null if the API was unreachable. */
  latestSha: string | null;
  state: DeployState;
}

/** Read the injected build sha, normalised to 7 chars. Falls back to "dev". */
export function buildSha(): string {
  try {
    return (__BUILD_SHA__ || "dev").slice(0, 7);
  } catch {
    return "dev";
  }
}

export function buildTime(): string {
  try {
    return __BUILD_TIME__ || "";
  } catch {
    return "";
  }
}

/**
 * Fetch the latest `main` sha and compute the deploy state. Never throws.
 * The GitHub commits API is unauthenticated here (60 req/hour/IP is ample for
 * an occasional glance); on any failure `latestSha` is null → state "unknown".
 */
export async function fetchDeployStatus(signal?: AbortSignal): Promise<DeployStatus> {
  const build = buildSha();
  const time = buildTime();
  let latestSha: string | null = null;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    });
    if (res.ok) {
      const data = (await res.json()) as { sha?: string };
      if (typeof data.sha === "string") latestSha = data.sha.slice(0, 7);
    }
  } catch {
    /* offline / rate-limited: leave latestSha null */
  }

  let state: DeployState = "unknown";
  if (build !== "dev" && latestSha) {
    state = build === latestSha ? "current" : "behind";
  }

  return { buildSha: build, buildTime: time, latestSha, state };
}
