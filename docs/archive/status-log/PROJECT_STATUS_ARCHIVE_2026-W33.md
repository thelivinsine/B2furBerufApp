# Project Status archive — 2026 W33

Archived from `docs/PROJECT_STATUS.md` on 2026-08-13 (session 211), which keeps only the two
most recent session logs and handoffs.

**Session 215 (2026-08-16, no branch — dashboard-only work on Resend + Namecheap + Supabase): auth
emails now send from `hello@genauly.de` via Resend instead of Supabase's rate-limited built-in
sender.** Founder walked through `docs/reference/auth-emails/README.md` step 1 live, guided prompt
by prompt; no code changed.
- **Namecheap DNS:** added Resend's DKIM/SPF/return-path records under Advanced DNS, plus an MX
  record on host `send` (needed "Mail Settings" switched to **Custom MX** first before Namecheap's
  Advanced DNS "Add Record" Type dropdown even offered "MX Record" — not obvious from the UI).
  Founder also set up Namecheap Private Email (`hello@genauly.de` mailbox) on the already-purchased
  plan; confirmed no conflict since Private Email's MX lands on `@` and Resend's is on `send`.
- **Resend:** domain `genauly.de` verified (after DNS propagated — first check showed "Not started",
  resolved by re-running Verify once records had propagated). Created a **Sending**-scope API key
  (not Full access — least privilege, SMTP send is all this needs).
- **Supabase → Authentication → SMTP Settings:** Custom SMTP enabled with `smtp.resend.com:465`,
  username `resend`, password = the Resend API key, sender `hello@genauly.de` / `Genauly`. First
  live test failed with "Error sending confirmation email" because the Resend domain wasn't verified
  yet; retried after verification and it worked. **Confirmed live:** the confirmation email now
  arrives from `Genauly <hello@genauly.de>` with no Supabase branding.
- **Five bugs surfaced by that live testing, still unfixed as of session 217 (full detail carried
  forward in `PROJECT_STATUS.md`'s "Resume here", since none are fixed yet):** the confirmation link
  doesn't complete sign-in automatically; a second manual login drops back to the landing page
  instead of the app; onboarding re-shows the pre-checked AGB/Datenschutz consent checkbox; the
  original tab crashes to "Kurz nicht erreichbar" when the link opens in a new tab; a freshly
  confirmed account skips onboarding and lands straight on Spielplatz. Session 217 built password
  reset/change instead (a separate, adjacent gap found while scoping a founder request); these five
  remain the next priority.
- **Still open from the README:** step 2 (paste the branded `confirm-signup.html` /
  `reset-password.html` templates into Supabase → Authentication → Emails) and raising Supabase's
  "Emails per hour" rate limit now that a real sender is configured. `reset-password.html`'s link
  shape changed in session 217 (now spells out `type=recovery` explicitly); paste the CURRENT version
  when doing this step.
- **Artifacts:** Namecheap Advanced DNS (`genauly.de`) · Namecheap Private Email (`hello@genauly.de`
  mailbox) · Resend (domain + API key) · Supabase Auth SMTP Settings · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 213 archived off) ·
  `docs/SESSION_PROMPT_LOG.md`.

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

**Session 209 (2026-08-10, branch `claude/microphone-bug-fix-jc70vs`): the microphone repeated
everything the learner said, plus two Sprechen-screen corrections.**
Shipped as PR **#850** → **`ca974d5`**, squash-merged; the Pages deploy succeeded on attempt 1, so
all three fixes are live.
Founder report, with a screenshot of a running Sprechen conversation: "there seems to be some bug
with the microphone feature. fix it." The learner's bubble read *"hallo hallo hallo hallo Petra hallo
Petra ich hallo Petra ich finde ich ich ich ich finde …"* for a single spoken sentence.
- **Root cause:** `engine/speech.ts` treated every recognition event as NEW text and
  `useSpeechInput` APPENDED it. Neither holds on iOS Safari, which grows an utterance by
  re-delivering it as a longer version of itself and flags interim results as final, so each
  snapshot of the growing sentence was concatenated onto the last: the sentence was written out
  word by word, over and over. The transcript that reached the AI partner and the grader was that
  same garbage, so the whole speaking feature was unusable on an iPhone, not just ugly.
- **Fix:** the transcript is now ASSIGNED, never appended. `listen()` rebuilds the whole transcript
  from the full `results` list on every event and reports THAT (both callbacks now carry the whole
  transcript so far, never a delta), so a re-delivered result overwrites itself instead of doubling
  the sentence. A new exported `joinTranscript` drops a segment that merely restates the one before
  it, which is what folds Safari's growing snapshots back into one sentence. `useSpeechInput`
  accumulates in exactly ONE place: a recogniser session that has ENDED and therefore cannot change
  (the mobile-Chrome restart path, unchanged in behaviour). `onFinal` now fires only when the
  settled text actually changes, so the Übungs-Sprechdrill in `SessionPlayer` cannot grade the same
  sentence twice.
- **New gate:** `tests/speech.test.ts` (14 tests) replays the screenshot's exact event sequence plus
  the spec-compliant, duplicate-delivery, restart, unsettled-tail and denied-permission paths.
- **Two follow-up reports, same screen, both fixed in this PR.**
  - *"a 2-line explanation of the task from previous page is missing … the explanation here is
    missing in later pages."* `brief.situation` was in the brief object all along, sent to the AI
    partner and rendered by nothing: the chooser card explained the task in two lines and every
    screen after it dropped the explanation. It is now stated on the brief card (under the partner
    row) and at the top of the running Aufgabe panel, above the Leitpunkte. Muted, one statement per
    screen, no second "Situation" label. Gated by `tests/sprechenBrief.test.tsx`.
  - *"an unnecessary shadow below the top tile which overshadows the chat transcripts"* (with the
    area circled). `ThreadStage` and `ConversationDebrief` hardcoded `mask-fade-y`, so a
    conversation resting at its top faded its own first line out under the Aufgabe tile and read as
    a shadow that tile was casting. Both now apply the fade per edge via `useEdgeFade`, exactly the
    fix s206 already made for the Redemittel list ("the first Redemittel is literally
    overshadowed"), which those two files never picked up.
- Gates (measured 2026-08-10): typecheck · **719 tests** (59 files, up from 701) · lint 0 errors (84 warnings, the
  pre-existing baseline plus 6 `any` in the new speech test, matching how `engine/speech.ts` already
  types the Web Speech API) · build · check:bundle 153.3 kB · lint:content.
- **Both UI fixes verified in a real browser** at 430x932, against a stubbed backend: the brief card
  now states the situation, and the running conversation's first line is crisp at rest. The
  MICROPHONE fix cannot be verified without a device, so it stays a founder check on an iPhone: open
  a Sprechen conversation, speak one long sentence, confirm the bubble shows it ONCE.


**Handoff after session 209 (2026-08-10): the Sprechen microphone no longer repeats the learner.**
Branch `claude/microphone-bug-fix-jc70vs`, PR **#850** → **`ca974d5`**, squash-merged and deployed
green on attempt 1. Post-merge housekeeping done, tree clean.
Founder report, with a screenshot of a live conversation: "there seems to be some bug with the
microphone feature. fix it."

- **The law to remember: a transcript is ASSIGNED, never appended.** `listen()` rebuilds the whole
  transcript from the full `results` list on every event, so a browser re-sending a result it has
  already sent (iOS Safari does exactly that, and also flags interim results as final) cannot
  double the sentence. Anything reading `listen()` must ASSIGN what it receives; the ONE place text
  accumulates is a recogniser session that has already ENDED. Detail in `docs/areas/SPRECHEN.md`,
  gated by `tests/speech.test.ts`.
- **`resultIndex` and `isFinal` are not trustworthy signals of new text** on mobile Safari. Do not
  reintroduce a call site that walks the result list from `e.resultIndex`.
- **Two more Sprechen laws landed with it:** the task explanation (`brief.situation`) is stated on
  every screen the learner meets it on, not just the chooser card; and an edge fade is applied PER
  EDGE via `useEdgeFade`, never hardcoded, or a region resting at its top shades its own first line
  and reads as a shadow. The second was already fixed once (s206, the Redemittel list) and two
  files never picked it up, so **grep for a hardcoded `mask-fade-*` before assuming a fade rule is
  applied everywhere**.
- **Worth a founder check on an iPhone**, since the sandbox has no device: open a Sprechen
  conversation, speak one long sentence, confirm the bubble shows it ONCE and that the partner
  answers what was actually said.
- **Still open, unchanged:** the Sprechen/Schreiben Verlauf spinner has no timeout on an unreachable
  Supabase (client-side fetch, no deadline); the next content job is the reply-task wave
  (writing-audit P4), 47 authored `source` texts plus a rendering slot that does not exist yet,
  waiting on a founder placement pick from `preview/schreiben-source-text.html`.

---

## Session 210 (archived from PROJECT_STATUS.md by session 212)

**Session 210 (2026-08-10, branch `claude/microphone-bug-fix-jc70vs`): "Praktisch" renamed
"Spielplatz".** Shipped as PR **#853** → **`53dc2e3`**, squash-merged; deployed.
Founder: "rename practice or praktsich as simulation." The nav tab's actual name is "Praktisch", not
"Practice"; flagged that "Simulation" was already the route/label for the Sprechen practice chooser
(`/simulation`) and "Prüfungssimulation" for exam sets, so reusing it would create two unrelated
things with the same name. The founder agreed and asked for name suggestions instead; "Alltag" was
also ruled out (already the Berufsleben/Alltag life-area split, used throughout Bibliothek/Prüfung
filters). The founder then asked for a name that hints at the Neuland game living inside the same
tab; "Mission", "Quest", "Level" and "Welt" were all already taken by the game or other UI elsewhere,
so those were ruled out too. Picked from three collision-free options: **Spielplatz**.
- **Every user-facing instance renamed**, code and copy: the nav label (`nav-items.ts`), its English
  translation in `uiStrings.ts` ("Spielplatz" → "Playground", replacing "Praktisch" → "Practice"),
  the Session page eyebrow, the help-center line naming the home screen, three Admin Steuerung
  strings (DE + EN), and every code comment describing the tab across `BottomTabBar.tsx`,
  `Sidebar.tsx`, `route-icons.tsx`, `FeedbackButton.tsx`, `LibraryHub.tsx`, `nav-items.ts`,
  `index.css`. The route (`/`) is unchanged, as are the internal `dashboardStartTab` values
  (`"ueben"`/`"spielen"`).
- **Docs updated in the same PR**, per the doc rule: `CLAUDE.md` (the nav-order law + a lineage
  note), `docs/areas/PRAKTISCH-NAV.md` (content renamed throughout; the FILE keeps its old name as
  the stable identifier every other doc links to, noted at the top), `docs/areas/SESSION.md`, and
  `.claude/skills/design/SKILL.md`. `docs/DECISIONS.md` gets a new §s210 recording the naming
  process; historical/dated docs (`docs/plans/*`, `docs/branding/*`, `docs/DEMO_RUNBOOK.md`) are
  left untouched, same as any other past-tense record.
- `tests/nav.test.tsx` updated (its founder-quote comment kept verbatim, lowercase "praktisch"
  intact, since that is what the founder actually typed in s207).
- Gates (measured 2026-08-10): typecheck · **719 tests** (59 files, unchanged count) · lint 0 errors
  · build · check:bundle 153.3 kB · lint:content (including the CLAUDE.md size ratchet: 349 lines).
- **Verified in a real browser** at both breakpoints: the bottom tab bar reads "Spielplatz Beta" and
  the desktop sidebar reads "Spielplatz" with the BETA chip, both at 430×932 and 1280×900.

## Session 211 (archived from PROJECT_STATUS.md by session 213)

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

**Handoff after session 211 (2026-08-13): the Sprechen debrief no longer waits on a leg that cannot
answer, a failed grade no longer looks like lost work, and the eight conversations that read as
deleted were backfilled.**
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
- **The transcripts were never gone, and the old rows were recovered.** `turns` held every word;
  only `learner_text`, the column the Verlauf reads, was empty. Migration `0021` backfills it from
  `turns` for every existing row (idempotent). **Before assuming learner data is lost, check whether
  it is simply in a column nothing displays.**
- **Three copy bugs from the same screenshot are fixed:** the split sentence that rendered as
  "Your conversation is stillgespeichert." (and its twin in `ConfirmEmail`), now gated by
  `tests/uiStringSplit.test.ts` — **ONE `t()` per sentence, never a translated head with a literal
  tail**, since the bug is invisible in German; "Das Transkript wurde inzwischen gelöscht." now
  prints only past the 730-day retention clock, and a younger row says no transcript was saved; and
  "Ohne Bewertung" reads "Not assessed" in English, not "Without marking".
- **This needs a backend deploy to take effect:** merging to `main` runs `supabase.yml`, which
  applies migrations (none here) and deploys every Edge Function. A feature-branch push changes
  nothing live.
- **Founder check after the deploy:** hold a short practice conversation at `/simulation`, press
  Beenden, and confirm the feedback arrives in well under a minute. If it still fails, the screen now
  prints `Code: …` under the message — that word is the diagnosis, so send it.

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
  existing `catch { return null; }` / `failed` UI path was already exercised by other tests.

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

## Session 216 (2026-08-16, no branch — GitHub repo settings only)

The repo went private. Founder asked whether flipping visibility carried any risk. Checked git
history for committed secrets (none: no `.env`/`.env.local` ever committed, Supabase credentials
live only in GitHub Actions secrets) and *believed* GitHub Pages still publishes from a private repo
on any plan (stopped being Pro-only in 2021), so `genauly.de` looked unaffected. Founder flipped
visibility to private via GitHub Settings themselves. No code changed; nothing to merge.
**This assumption turned out to be wrong** — see session 219: GitHub Pages actually disabled itself
the moment the repo went private (Free-plan Pages requires a public repo), taking `genauly.de` fully
offline for two sessions before anyone noticed.
