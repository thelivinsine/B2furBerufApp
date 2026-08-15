# Project Status

_Last updated: 2026-08-14 (session 212 made a cold app-open land on the Bibliothek instead of the
Spielplatz dashboard. Session 211 fixed the Sprechen debrief: it no longer waits out a leg that
cannot answer, and a failed grade no longer loses the transcript. Sessions 209-210 (the microphone
repeat, the Spielplatz rename) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`, sessions 204-208 in the `W32` file
beside it. All handoffs under their own "Resume here")._

**Session 212 (2026-08-14, branch `claude/microphone-bug-fix-jc70vs`): the app now opens on the
Bibliothek, not Spielplatz.**
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

**Session 211 (2026-08-13, branch `claude/speaking-drills-review-issue-3589zm`): the Sprechen
debrief waited three minutes on a leg that could not answer, then lost the conversation.**
Founder: "the review of speaking drills still doesn't work. check what's the issue." Asked what the
screen actually does, since four different faults produce that sentence; the answer named the
symptom exactly: *"it spins for a long time and says the feedback cannot be generated or something
like that and then asks me to try again later but then the progress is lost."* Practice
conversations (`/simulation`), not the Modelltest. Third report of this screen (s196, s206, now).
- **Root cause 1, the long spin.** The debrief LED on the free Gemini leg, which is the one call in
  `converse` it cannot serve: `gemini-2.5-flash` reasons by default and Google bills thoughts as
  output, so a whole-JSON answer over a fourteen-turn transcript comes back `MAX_TOKENS` with no
  text. s206 fixed exactly this for TURNS (`think: false`) and left the debrief thinking. Every
  debrief therefore paid a full leg's deadline before the model that could answer was even asked.
  The debrief now leads on the paid model (`lead: "paid"`), Gemini stays behind it with thinking off
  as a real fallback, so a dead paid provider degrades the debrief instead of removing it.
- **Root cause 2, the failure at the end of the spin.** Per-leg deadlines (s206) do not bound a
  cascade: three 60-second legs in series is a three-minute request, longer than the platform's own
  ceiling, so the worst runs could be killed before reaching their own failure path. Added a TOTAL
  budget (`DEBRIEF_BUDGET_MS` 100 s, `TURN_BUDGET_MS` 45 s); each leg is capped by what is left and
  a leg that cannot finish in it is never started. Order and budget live in
  `supabase/functions/_shared/aiCascade.ts` so they are unit-gated, not buried in a Deno file no
  test can import. `DEBRIEF_MAX_TOKENS` 4096 → 8192, because both fallback legs spend that budget
  reasoning before they write anything.
- **Root cause 3, "the progress is lost", which was literally true.** `learner_text` was written by
  the successful debrief and by nothing else, while the Verlauf reads `learner_text` and never
  `turns`: a conversation whose grade failed rendered as "Das Transkript wurde inzwischen gelöscht."
  over a row holding every word. It is now written turn by turn (so an abandoned conversation is on
  record too) and re-asserted on the debrief's failure path.
- **The next report will name its own cause.** `cascade` returns a reason with an empty result
  (`unavailable` · `unreadable` · `timeout`; the client adds `network`), it is logged, and the
  failure screen prints it as a small `Code: …` line.
- New gate `tests/aiCascade.test.ts` (8 tests). Gates (measured 2026-08-13): typecheck · **727
  tests** (60 files, up from 719) · lint 0 errors (84 warnings, unchanged baseline) · build ·
  check:bundle 153.3 kB · lint:content (CLAUDE.md 349 lines).
- **Not verifiable from the sandbox:** the network policy blocks the Supabase project, so the
  provider-side behaviour of the founder's failing runs cannot be observed from here. The founder
  confirms after the deploy.

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

**Handoff after session 212 (2026-08-14): a cold app-open lands on the Bibliothek.**
Branch `claude/microphone-bug-fix-jc70vs` (same branch as sessions 209-210), PR still pending as of
this handoff.
Founder: "can you make sure when the app opens the user sees the library instead of the playground?"

- **The law to remember: a JS module runs once per real page load, never on a client-side route
  change.** That is the ONLY reason `/` could be redirected on a cold open without breaking the
  Spielplatz tab, which links to the same URL. `lib/appEntry.ts` is the second import in `main.tsx`,
  right after `lib/authCallback.ts` — the same slot, for the same reason: something that has to see
  the URL before React Router rewrites it.
- **Never drop the search/hash when relocating a URL a real feature depends on.** The bare root
  carries Google's OAuth `?code=…` and a legacy Supabase `#access_token=…` by design (`grep` for
  `redirectTo` before assuming a path is free to repoint). `appEntry.ts` preserves both.
- **Not verified live** (the sandbox has no way to test a real Google OAuth round trip or a real PWA
  install), but reasoned through and documented in `docs/DECISIONS.md` §s212: neither consumer reads
  the URL's path, only its query/hash, so relocating the path alone is safe. Worth a founder check on
  an actual Google sign-in after this deploys, since that path could not be exercised here.
- **Still open, unchanged:** the Sprechen/Schreiben Verlauf spinner has no timeout on an unreachable
  Supabase; the next content job is the reply-task wave (writing-audit P4).

**Handoff after session 211 (2026-08-13): the Sprechen debrief no longer waits on a leg that cannot
answer, and a failed grade no longer looks like lost work.**
Branch `claude/speaking-drills-review-issue-3589zm`.
Founder: "the review of speaking drills still doesn't work. check what's the issue." → *"it spins for
a long time and says the feedback cannot be generated ... and then the progress is lost."*

- **The law to remember: a cascade has an ORDER and a TOTAL budget, and both are properties of the
  CALL.** Free-first is right for a spoken turn and wrong for the debrief, whose answer is a whole
  JSON object the free leg spends its output budget thinking about. Per-leg deadlines do not bound a
  three-leg cascade. Both rules now live in `supabase/functions/_shared/aiCascade.ts`, gated by
  `tests/aiCascade.test.ts` — put sequence rules there, not inside a Deno file no test can import.
- **A learner's work is written when they DO it, never when a grade succeeds.** `learner_text` is
  written turn by turn now. Before touching any Verlauf, check which COLUMN it reads: this one read
  `learner_text` and never `turns`, so the app told the learner their transcript was deleted while
  the failure screen promised it was saved.
- **This needs a backend deploy to take effect:** merging to `main` runs `supabase.yml`, which
  applies migrations (none here) and deploys every Edge Function. A feature-branch push changes
  nothing live.
- **Founder check after the deploy:** hold a short practice conversation at `/simulation`, press
  Beenden, and confirm the feedback arrives in well under a minute. If it still fails, the screen now
  prints `Code: …` under the message — that word is the diagnosis, so send it.
- **Still open, unchanged:** the Sprechen/Schreiben Verlauf spinner has no timeout on an unreachable
  Supabase (client-side fetch, no deadline); the next content job is the reply-task wave
  (writing-audit P4), 47 authored `source` texts plus a rendering slot that does not exist yet,
  waiting on a founder placement pick from `preview/schreiben-source-text.html`.

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
- **Still open, unchanged:** the Sprechen/Schreiben Verlauf spinner has no timeout on an unreachable
  Supabase; the next content job is the reply-task wave (writing-audit P4), 47 authored `source`
  texts plus a rendering slot that does not exist yet, waiting on a founder placement pick from
  `preview/schreiben-source-text.html`.
