# Project Status

_Last updated: 2026-08-16 (session 214 fixed a Windows-only build break from case-colliding graph
filenames and pinned pnpm back to the project's v10, on the founder's local machine. Session 213
gave the Sprechen/Schreiben Verlauf history fetch a 12s timeout, merged as PR #859. Session 212 made
a cold app-open land on the Bibliothek instead of the Spielplatz dashboard, merged as PR #857.
Sessions 209-211 are archived in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`,
sessions 204-208 in the `W32` file beside it. All handoffs under their own "Resume here")._

**Session 214 (2026-08-16, branch `fix/windows-case-collision-graph-helpers`): the repo now builds
on the founder's Windows laptop.** No app behavior changed; this was local tooling + a
build-portability fix. Ran concurrently with session 213 (PR #859) in the same working tree, which
caused some branch/stash churn, all recovered.
- **pnpm pin restored.** The founder's machine has pnpm 11 installed globally and corepack was
  defaulting to it, so every `pnpm` run rewrote `packageManager` from `pnpm@10.33.0` to v11, and
  pnpm 11 then ignored the `pnpm.overrides` `react-router` pin and risked the `.npmrc` supply-chain
  guardrails. Reverted the file and ran `corepack install` so the project folder resolves to pinned
  v10 while the global v11 is untouched elsewhere. Upgrading to v11 is deferred: it needs a
  deliberate migration of `overrides` + guardrail settings to `pnpm-workspace.yaml`, its own tested
  PR. `pnpm install` and `pnpm build` then ran clean on v10.
- **Windows case-collision fix (the branch's actual change).** `tsc -b` failed on Windows because
  `WordGraph.tsx`/`wordGraph.ts` and `CollocationGraph.tsx`/`collocationGraph.ts` differ only by
  case. Case-sensitive Linux (CI, deploy) builds them fine, so the live site was never affected;
  Windows' case-insensitive FS makes the imports ambiguous. Renamed the two lowercase helper files
  to `wordGraphModel.ts` and `collocationGraphModel.ts` and updated the 5 importing lines (2
  components, 2 tests) plus 3 stale filename comments (incl. the `normalizeForm` mirror note in
  `scripts/lint-content.mjs`). No content ids touched, so the id-permanence law does not apply.
  After clearing a stale `node_modules/.vite` cache, `pnpm build` passes on Windows; graph unit
  tests pass. (`writingAufgabe.test.tsx` timed out once at the default 5s on the cold, loaded
  machine and passed cleanly at 30s, a timing flake, not a regression.)
- **Resume here:** nothing outstanding once this merges. The win is local: Windows builds now work;
  nothing to verify on the live site since the build was never broken there.

**Session 213 (2026-08-16, branch `fix/verlauf-history-timeout`): a stuck Verlauf history fetch no
longer spins forever.** Shipped as PR **#859** → **`47f0825`**, squash-merged.
Founder asked what was next on the roadmap; the answer named the open item from the s211/s212
handoffs: "the Sprechen/Schreiben Verlauf spinner has no timeout on an unreachable Supabase." Asked
to implement it for both.
- **Root cause:** `getSpeakingHistory` (`src/lib/speaking.ts`) and `getWritingHistory`
  (`src/lib/writing.ts`) each `await`ed a plain Supabase query with no deadline. If the request hung
  (dropped connection, unreachable project), the screen's `loading` state never cleared: the
  `Loader2` spinner in `SprechenHistory.tsx`/`WritingHistory.tsx` ran indefinitely with no error, no
  retry prompt, nothing.
- **Fix:** new `withTimeout<T>(promise, ms, label)` in `src/lib/utils.ts` (`Promise.race` against a
  `setTimeout` rejection). Both fetchers wrap their Supabase call(s) in it at a 12s budget; a timeout
  throws into the existing `catch { return null; }`, which the screens already treat as "could not
  load" (there was no new UI state to add). `writing.ts`'s three sequential step-down queries
  (schema-migration fallback, s179/s181) are each wrapped individually, since a hang can happen on
  any of them and the step-down logic still needs to see each query's own `error`/`data`.
- Gates (measured 2026-08-16): typecheck clean for the touched files (the repo's pre-existing
  Windows filename-case-collision errors in `CollocationGraph`/`WordGraph` are unrelated, present on
  `main` already, and being fixed on a separate branch) · **735 tests** passing (one unrelated flaky
  timeout in `writingAufgabe.test.tsx` reran green in isolation) · `lint-content` CI check passed.
- **Artifacts:** `src/lib/utils.ts` · `src/lib/speaking.ts` · `src/lib/writing.ts` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session
  211 archived off to stay under the status file's line budget) · `docs/SESSION_PROMPT_LOG.md`

**Session 212 (2026-08-14, branch `claude/microphone-bug-fix-jc70vs`): the app now opens on the
Bibliothek, not Spielplatz.** Shipped as PR **#857** → **`5cde413`**, squash-merged; Pages deploy
confirmed green via GitHub Actions (`curl`/`WebFetch` cannot reach `genauly.de` itself from here).
Founder: "can you make sure when the app opens the user sees the library instead of the playground?"
- **`/` stays the Spielplatz route** (the nav tab still links to it and must keep working), so the
  fix could not redirect `/` itself — it had to distinguish a COLD open (the PWA's `start_url`, a
  bookmark, a hard reload) from an in-app navigation to the same URL (tapping the Spielplatz tab).
  New `src/lib/appEntry.ts`, imported second in `main.tsx` right after `lib/authCallback.ts` (same
  "must run before React mounts" pattern, same reason): at module-eval time, which happens exactly
  once per real page load and never on a client-side route change, it `history.replaceState`s a
  bare `"/"` to `/library` before React Router ever sees the URL. A tab click afterward is a
  `<Link>`, no reload, so the module never re-runs and Spielplatz still opens normally.
- **Search and hash are carried over untouched**, because two things legitimately land on the bare
  root and neither reads its PATH: Google's OAuth PKCE callback (`redirectTo: origin + "/"` in
  `useAuthStore.ts`, a bare `?code=…` `supabase-js` consumes regardless of path) and a legacy
  Supabase "Confirm signup" link (`#access_token=…`, already snapshotted by `authCallback.ts` before
  this runs). Verified by reading the source, not assumed: losing either silently would have been a
  sign-in regression hiding behind a UX polish. `public/spa-redirect.js` has already restored any
  GitHub-Pages-mangled deep link before this evaluates, so a real deep link never reaches here with
  pathname `"/"`. `/library` carries the same `RequireOnboarding` gate `/` did, so a not-yet-onboarded
  visitor still lands on `/welcome`, one hop earlier than before.
- New `tests/appEntry.test.ts` (7 tests): the pure decision function plus the live module-eval
  redirect. **Verified in a real browser** (Chromium, 430×932, dev AND the production `preview`
  build) that content renders correctly, not just that the URL resolves right: a cold open shows the
  actual Bibliothek, tapping Spielplatz afterward shows the actual Dashboard, a deep link to
  `/anwenden` is untouched, and a reload while on Spielplatz bounces back to the Bibliothek (a reload
  is a cold open too).
- Docs: `CLAUDE.md` (the nav-order law, compressed elsewhere to hold the 350-line budget: dropped a
  redundant `(s195)` cross-reference to a rule the file already states in full two bullets earlier),
  `docs/areas/PRAKTISCH-NAV.md` (the full mechanism), `docs/DECISIONS.md` (§s212).
- Gates (measured 2026-08-14): typecheck · **734 tests** (61 files, up from 727) · lint 0 errors
  (84 warnings, unchanged baseline) · build · check:bundle 153.5 kB · lint:content (CLAUDE.md 349
  lines / linter-counted 350).

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the five-slot nav
(Bibliothek · **Prüfung** · Fortschritt · Spielplatz, named Praktisch until s210 · Einstellungen,
s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks — every number below is `pnpm lint:content` output measured on 2026-08-08 (s203).
Re-measure before quoting; do not carry these forward.** vocab **1,768** (**1,758 browsable**; 8
mis-filed noun+verb combos retired in s142 + 2 true duplicates retired in s178, ids kept; the mix is
**77.3 % noun / 13.7 % verb / 6.1 % adjective**) · collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 320 drills** (18 groups; 110 productive, i.e. no options) ·
Lese-/Hörtexte **52** (156 checks) ·
writing tasks **717**, every one servable (s181), in 40 theme×length pools ·
Can-Do **57** · Sprech-Szenarien **36** (214 nodes, 394 options; level mix 13 / 15 / 8; every
scenario ends in a free-speak turn since s182) · exam sets **21** (the 6 above the entry rung came in
s194) · missions **6** (35 scenes, 11 NPCs, 7 key items) ·
provenance **3,604 rows** (four concatenated parts since s182, TS2590; append to the LAST) ·
themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121); four of them carry themes,
`pruefung` carries none and never has. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,591 of 3,604 provenance rows are AI-drafted `draft`**; only **13** are
human-verified (13 vocabulary rows signed off 2026-07-24, after the 2026-07-22 reset to restart the
review pass; see `strategy/DATA_GOVERNANCE.md`). The full picture of what the banks do and do not
cover is `docs/reports/CONTENT_AUDIT_2026-07-30.md` (session 178), whose backlog is **closed
except P10** since s198. The writing bank has its own quality audit since s199,
`docs/reports/writing-tasks-audit-2026-08-07.md`: the tasks read well, but a third of the Branche
tags were unearned and the Niveau tag scaled the word target without scaling the task. **P1, P2, P3
and P5 are shipped (s199, s200); P4 is marked WRONG in the report** and replaced by an optional
reply-task wave.

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`, and the ones that were ticked off
in this list live in `docs/archive/PROJECT_STATUS_ARCHIVE.md` with their dates. The s147 Satzlabor
redeploy is done (s150: all three AI functions deployed on the Gemini-primary cascade,
`GEMINI_API_KEY` set). Still open:
- [ ] **Add Resend SMTP** (Auth → SMTP settings). Was optional; now needed, because "Confirm email"
      is ON and Supabase's built-in sender only allows a few messages an hour. Founder bought the
      `genauly.de` mailbox 2026-07-27; next is verifying the domain in Resend, then the SMTP fields,
      then pasting the two branded templates. Full steps: `docs/reference/auth-emails/README.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 213 (2026-08-16): the Verlauf history fetch times out instead of spinning
forever.**
Branch `fix/verlauf-history-timeout`, PR **#859** → **`47f0825`**, squash-merged. Post-merge
housekeeping done; the unrelated `fix/windows-case-collision-graph-helpers` branch's WIP (stashed
during the merge) was restored on top of the new `main`, untouched.
Founder: "what's next in to do?" → (after the Verlauf task was explained) "yes, implement that for
both" → "yes, separate branch it and open the PR" → "merge it."

- **The law to remember: a client-side `await supabase....` has no deadline of its own.** A dropped
  connection or unreachable project leaves the promise pending forever, and any `loading` state
  gated on it hangs with the spinner forever, no error, no retry. `withTimeout` (`src/lib/utils.ts`)
  is the generic fix: `Promise.race` the query against a timer. It does not cancel the underlying
  request, so a slow-but-eventually-successful query is still wasted network; that is fine here,
  the goal was only to stop the UI hanging.
- **`writing.ts`'s step-down queries needed the wrap on EACH query, not just the outer call.** It
  runs up to three sequential queries falling back on schema-mismatch errors (s179/s181, columns
  that may not exist yet post-migration). A hang can happen on any one of them, so each is wrapped
  individually rather than wrapping the whole function body once.
- **This was NOT verified against a real hung connection**, only reasoned through and typechecked/
  unit-tested: the sandbox cannot simulate an unreachable Supabase project realistically, and the
  existing `catch { return null; }` / `failed` UI path was already exercised by other tests. Worth a
  founder check if this ever recurs: does the Verlauf now show "could not load" within ~12s instead
  of spinning, on a genuinely bad connection.
- **Still open, unchanged:** the next content job is the reply-task wave (writing-audit P4), 47
  authored `source` texts plus a rendering slot that does not exist yet, waiting on a founder
  placement pick from `preview/schreiben-source-text.html`.

**Handoff after session 212 (2026-08-14/15): a cold app-open lands on the Bibliothek.**
Branch `claude/microphone-bug-fix-jc70vs` (same branch as sessions 209-210), PR **#857** →
**`5cde413`**, squash-merged. **Deploy confirmed** via GitHub Actions: `Deploy site to GitHub Pages`
succeeded on `5cde413` at 2026-08-15 11:45 UTC. Post-merge housekeeping done, tree clean.
Founder: "can you make sure when the app opens the user sees the library instead of the playground?"
→ "check the live site once it's deployed."

- **The law to remember: a JS module runs once per real page load, never on a client-side route
  change.** That is the ONLY reason `/` could be redirected on a cold open without breaking the
  Spielplatz tab, which links to the same URL. `lib/appEntry.ts` is the second import in `main.tsx`,
  right after `lib/authCallback.ts` — the same slot, for the same reason: something that has to see
  the URL before React Router rewrites it.
- **Never drop the search/hash when relocating a URL a real feature depends on.** The bare root
  carries Google's OAuth `?code=…` and a legacy Supabase `#access_token=…` by design (`grep` for
  `redirectTo` before assuming a path is free to repoint). `appEntry.ts` preserves both.
- **Still not verified LIVE, only reasoned through** (`docs/DECISIONS.md` §s212): a real Google OAuth
  round trip and a real PWA cold open. The sandbox cannot reach `genauly.de` at all (`curl` 403 at the
  egress proxy, `WebFetch` reports `EGRESS_BLOCKED`) — this is the standing limit, not new to this
  session. **Worth a founder check:** open the app fresh (or hard-refresh an installed PWA) and
  confirm it lands on the Bibliothek; tap Spielplatz afterward and confirm it still opens normally;
  one Google sign-in round trip if convenient, since that path could not be exercised at all here.
- **Still open, unchanged:** the next content job is the reply-task wave (writing-audit P4).

**Handoff after session 210 (2026-08-10): the "Praktisch" tab is "Spielplatz" everywhere.**
Branch `claude/microphone-bug-fix-jc70vs` (same branch as session 209), PR **#853** → **`53dc2e3`**,
squash-merged and deployed. Post-merge housekeeping done, tree clean.
Founder: "rename practice or praktsich as simulation."

- **The name is "Spielplatz", not "Simulation".** "Simulation" collides with the existing
  `/simulation` route (Sprechen practice) and "Prüfungssimulation"; "Alltag" collides with the
  Berufsleben/Alltag life-area split. Both were ruled out before asking the founder to pick, and the
  founder then asked for a name hinting at the game, which "Mission"/"Quest"/"Level"/"Welt" all
  already meant something else for. **Before naming anything else in this nav, grep for the
  candidate name first** — this is the second time a proposed name collided with something already
  shipped (first was "Simulation" itself).
- **The route stayed `/`.** Only the label, its English translation, and every comment/string
  naming the tab changed. `docs/areas/PRAKTISCH-NAV.md` deliberately kept its OLD filename: renaming
  a doc file is a bigger churn (six other docs link to it by name) than the value it returns, so the
  content was renamed but the identifier was not. If a future session renames this tab again, decide
  the filename question fresh rather than assuming the precedent.
- **Verified in a real browser**, not just by grep: both the mobile bottom bar and the desktop
  sidebar were screenshotted after the change (430×932 and 1280×900).
- **Still open, unchanged:** the next content job is the reply-task wave (writing-audit P4), 47
  authored `source` texts plus a rendering slot that does not exist yet, waiting on a founder
  placement pick from `preview/schreiben-source-text.html`.
