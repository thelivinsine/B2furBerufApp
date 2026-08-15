/**
 * A cold open of the bare app root lands the learner in the Bibliothek, not
 * the Spielplatz dashboard (founder s212).
 *
 * "/" stays the Dashboard's route: the Spielplatz nav tab still links to it,
 * and clicking that tab must still show Spielplatz. The distinction this
 * module draws is COLD OPEN versus in-app navigation. `history.replaceState`
 * below runs once, at module-eval time, and a module evaluates exactly once
 * per real page load, never on a client-side route change — so the PWA's
 * `start_url`, a bookmark of the bare domain, and a hard reload all land on
 * `/library`, while tapping Spielplatz afterward (a `<Link>`, no reload)
 * renders Spielplatz exactly as before. Same shape as `onboarding hands a new
 * learner to /library` (s207): this just extends "the front door is the
 * Bibliothek" to every open, not only the first one.
 *
 * Any search/hash on the URL is carried over unchanged, because two things
 * legitimately arrive on the bare root and neither reads its PATH, only its
 * query/hash: Google's OAuth callback (`redirectTo: origin + "/"`, a bare
 * `?code=…` that `supabase-js` consumes itself) and a legacy Supabase
 * "Confirm signup" link (`#access_token=…`, see `lib/authCallback.ts`, which
 * has already snapshotted it by the time this runs). `/library` carries the
 * same `RequireOnboarding` gate `/` did, so a not-yet-onboarded visitor still
 * lands on `/welcome`, one hop earlier than before.
 *
 * `public/spa-redirect.js` (a plain script, runs before any module here) has
 * already restored a GitHub-Pages-mangled deep link (`/?/settings` →
 * `/settings`) by the time this evaluates, so an actual deep link never
 * reaches here with pathname `"/"` — only a genuine visit to the root does.
 */
export function libraryEntryUrl(pathname: string, search: string, hash: string): string | null {
  if (pathname !== "/") return null;
  return `/library${search}${hash}`;
}

if (typeof window !== "undefined") {
  const target = libraryEntryUrl(
    window.location.pathname,
    window.location.search,
    window.location.hash,
  );
  if (target) window.history.replaceState(null, "", target);
}
