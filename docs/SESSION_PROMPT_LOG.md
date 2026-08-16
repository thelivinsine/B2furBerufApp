# Session & Prompt Log

**Purpose.** A chronological, append-only record of every instruction the founder gives and the
assistant's response to it. This exists to create a clear, timestamped **paper trail of authorship
and creative direction** for the elements of this app, in case we register or defend copyright in
them. It complements (does not replace) the primary record, which is **git history** (timestamped,
authored commits) and the **merged pull requests**.

> Not legal advice. For an actual filing, a lawyer should advise on what evidence matters in the
> relevant jurisdiction (the product targets Germany/EU, where copyright protects human-authored
> creative expression; a log showing substantial human creative direction strengthens that claim).

## How this log is maintained (the rule)
- **Every founder prompt gets one entry**, appended in order, newest at the bottom. Entries are
  never edited or deleted after the fact (append-only); corrections go in a new entry.
- Each entry records the meta info below. Prompts are stored **verbatim** (they are the creative
  direction). If a prompt included an attachment (image, file), that is noted.
- The assistant writes the entry as part of handling the prompt. Keep the **response summary**
  concise but specific, and always tie it to the resulting **artifacts** (files, commit SHAs, PRs)
  so each instruction is traceable to the code that realized it.
- **Do not paste secrets** (keys, tokens, personal data) into this file; it is committed to the repo.
- This file is the detailed trail. `CLAUDE.md` only carries the short rule and points here, and
  `docs/PROJECT_STATUS.md` keeps the higher-level session narrative. Keep those lean; put the
  blow-by-blow here.
- **Append to the tail, don't re-read the whole log.** To add an entry you only need the last entry's
  number and the template above. Read the final ~30 lines, not the entire file, so logging stays cheap
  as history grows.

### Rotation policy (keep the live file bounded, added 2026-07-05)
This live file must not grow without limit. **Budget: keep the current session plus roughly the last 5
sessions here, and rotate whenever the live file passes ~1,200 lines.** To rotate, move the oldest
entries out of this file into the **ISO-week** archive under `docs/archive/prompt-log/` (one file per
week, `SESSION_PROMPT_LOG_YYYY-Www.md`; see that folder's `README.md` index). Append each moved entry to
the week file matching **its own date** (create the week file if it does not exist yet, with the same
short header the others use). Keep this header, the rule, and the entry template in the live file. The
week archives themselves are append-only history: never rewrite entries when moving them, and loading a
single week stays cheap because each week file is small.

### Automated raw capture (removed 2026-06-25)
There used to be a `UserPromptSubmit` hook (`.claude/hooks/log-prompt.sh`) that appended one JSON
line per prompt to **`docs/prompt-log-raw.jsonl`**. The founder asked for it to be removed on
2026-06-25, so the hook and its script are gone and `.claude/settings.json` no longer wires it. The
existing `docs/prompt-log-raw.jsonl` is kept as a historical record but is no longer appended to.
This curated Markdown file remains the prompt log, and entries are now added **manually**. The founder
directed (s42) that **any "update the documentation"-type request implies updating this log too**, even
when the prompt log is not named explicitly. So whenever you update `docs/PROJECT_STATUS.md` for a
session, append that session's prompts here as well and ship them together.

### Entry template
```
## Entry N — <YYYY-MM-DD HH:MM UTC>
- **Branch:** <git branch>
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** <none | description>
- **Prompt (verbatim):**
  > <the founder's message>
- **Response summary:** <what the assistant did / answered>
- **Artifacts:** <files changed · commit SHAs · PR #s · merge SHAs>
```

---

## Archived entries

Everything **through session 208 (2026-08-09)** is archived by ISO week under
**`docs/archive/prompt-log/`** (`SESSION_PROMPT_LOG_2026-W25/W26/W27/W28/W29/W30/W31/W32.md`; see that
folder's `README.md` index). This file holds **session 209 / 2026-08-10 onward** (sessions 152–208 were
rotated into the W30/W31/W32 chunks on 2026-08-16, this file having grown to ~7,000 lines past the
~1,200-line budget). Keep appending here, newest at the bottom, and rotate per the policy above.

## Session 209 (branch `claude/microphone-bug-fix-jc70vs`)

### Prompt 1 (2026-08-10)

> [screenshot of a running Sprechen conversation, "Homeoffice-Regelung einführen · Petra Sommer",
> the learner's bubble reading "hallo hallo hallo hallo Petra hallo Petra ich hallo Petra ich finde
> ich ich ich ich finde ich finde …", mic open, caption "Ich höre zu … tippe zum Stoppen"] there
> seems to be some bug with the microphone feature. fix it

- **Response summary:** The transcript was being ACCUMULATED on the caller's side.
  `engine/speech.ts` walked each `onresult` event from `e.resultIndex` and handed the pieces on as
  new text, and `useSpeechInput` appended every final chunk it received. Neither assumption holds on
  iOS Safari, which grows an utterance by re-delivering it as a longer version of itself and flags
  interim results as final, so every snapshot of the growing sentence was concatenated onto the last
  ("hallo" · "hallo Petra" · "hallo Petra ich" …), which is the exact string in the screenshot. The
  transcript sent to the conversation partner and to the grader was that same repeated text, so
  Sprechen was unusable on an iPhone rather than merely ugly.
  Fixed at the engine, so both consumers benefit (the Sprechen mic and the Übungs-Sprechdrill in
  `SessionPlayer`): `listen()` now rebuilds the whole transcript from the full `results` list on
  every event and reports THAT (both text callbacks carry the whole transcript so far, never a
  delta), a re-delivered result overwrites itself, a new exported `joinTranscript` drops a segment
  that merely restates the one before it, and `onFinal` fires only when the settled text actually
  changes so the drill cannot grade one sentence twice. `useSpeechInput` now ASSIGNS the running
  session's text and accumulates in exactly ONE place: a recogniser session that has ENDED (the
  mobile-Chrome restart path, behaviour unchanged). Added `tests/speech.test.ts` (14 tests) covering
  the screenshot's event sequence, the spec-compliant path, a duplicate delivery, the restart, an
  unsettled tail and a denied microphone. Gates: typecheck · 715 tests (58 files, up from 701) ·
  lint 0 errors · build · check:bundle 153.3 kB. Not verifiable on a device from the sandbox; the
  founder checks it on an iPhone.
- **Artifacts:** `src/engine/speech.ts` · `src/features/sprechen/useSpeechInput.ts` ·
  `tests/speech.test.ts` · `docs/areas/SPRECHEN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` (session 207 archived off the main
  status file to stay under its line budget) · `docs/SESSION_PROMPT_LOG.md`

### Prompt 2 (2026-08-10)

> [screenshot of the Sprechen chooser, three task cards each with a two-line explanation] a 2-line
> explanation of the task from previous page is missing in the screenshot shown when the task is
> opened . finally, there's an unnecessary shadow below the top tile which overshdows the chat
> transcripts. fix these two
>
> [follow-up, same turn] the explanation here is missing in later pages
>
> [follow-up, same turn, screenshot of a running conversation with the area circled] here is the
> blur/shadow

- **Response summary:** Two separate defects on the Sprechen screens, both fixed.
  **(1) The missing explanation.** `ConversationBrief` has carried a `situation` field since s193.
  It is sent to the AI partner on every turn and was rendered by nothing, so the explanation the
  chooser card shows ("Ihr Unternehmen möchte Homeoffice einführen …") disappeared the moment the
  task was opened. It is now stated on the brief card, under the partner row and above the
  Leitpunkte it motivates, and again at the top of the running Aufgabe panel. Muted grey like the
  chooser card so the Leitpunkte stay the loudest thing in the tile, tinted hairline inside the
  accent panel, and no second "Situation" label, since the brief card's head already carries that
  eyebrow once.
  **(2) The shadow.** `ThreadStage` and `ConversationDebrief` hardcoded `mask-fade-y`, which fades
  BOTH edges of a scroll region unconditionally. A conversation resting at its top therefore faded
  its own first line out directly under the Aufgabe tile, which is what reads as a shadow the tile
  is casting. Both now apply the fade per edge through `useEdgeFade`, so it appears only where
  content actually continues. This is the identical fix s206 made after the founder reported "the
  first Redemittel is literally overshadowed"; those two files never picked it up.
  Verified both in a real browser (Chromium, 430x932, stubbed backend): screenshots of the brief
  card, the running conversation at rest and its opened Aufgabe panel. Gates: typecheck · 719 tests
  (59 files) · lint 0 errors · build · check:bundle 153.3 kB · lint:content. Added
  `tests/sprechenBrief.test.tsx` (4 tests). Pushed onto the same branch, so PR **#850** now carries
  all three fixes.
- **Artifacts:** `src/features/sprechen/ConversationRunner.tsx` ·
  `src/features/sprechen/ConversationBriefCard.tsx` · `src/features/sprechen/ConversationDebrief.tsx` ·
  `tests/sprechenBrief.test.tsx` · `docs/areas/SPRECHEN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/SESSION_PROMPT_LOG.md` · PR **#850**

- **Merge + deploy (recorded after the fact):** PR **#850** squash-merged to `main` as **`ca974d5`**;
  **Validate content** and **Deploy site to GitHub Pages** both green on that SHA, the deploy on
  attempt 1. `supabase.yml` did not run, correctly: this change touches no migration and no Edge
  Function. Verified by the workflow runs rather than by claiming it, since the sandbox cannot reach
  the live site.

### Prompt 3 (2026-08-10)

> document the session

- **Response summary:** Closed the documentation. Most of it was already written during the session
  (the `PROJECT_STATUS.md` session-209 entry and handoff, the `docs/areas/SPRECHEN.md` laws, prompts
  1-2 here, and the merge/deploy note); this pass added what was missing and re-measured what a doc
  is not allowed to carry forward.
  **Counts re-measured today (2026-08-10), not copied:** `pnpm test:unit` = **719 tests across 59
  files** (701/58 before this session), `pnpm lint:content` = pass, **3604 provenance rows**.
  **`docs/DECISIONS.md`** gained the "why" the area guides only point at: **§s209** (why the Web
  Speech API's `resultIndex`/`isFinal` invite exactly the bug that shipped, why the fix is
  assignment rather than a Safari special case, and why each supporting piece exists) and **§s209b**
  (the fade being the third report of one shape and the second identical fix, so the rule was
  restated as "never hardcode `mask-fade-*`", which is greppable and would have caught both files).
  **`CLAUDE.md`** now carries both laws as current law: the transcript rule folded into the Sprechen
  bullet, and the existing s190 scroll-edge line sharpened from "a scroll container SLICES what
  crosses its edge" to fading PER EDGE via `useEdgeFade`, never a hardcoded `mask-fade-*`. The file
  was at exactly its 350-line budget, so the additions were paid for by compressing prose whose
  detail already lives in `docs/areas/*` (no rule was dropped): 349 lines, linter quiet.
- **Artifacts:** `docs/DECISIONS.md` (§s209, §s209b) · `CLAUDE.md` · `docs/PROJECT_STATUS.md` ·
  `docs/SESSION_PROMPT_LOG.md`

## Session 210 (branch `claude/microphone-bug-fix-jc70vs`)

### Prompt 1 (2026-08-10)

> rename practice or praktsich as simulation

- **Response summary:** Flagged a naming collision before implementing: "Simulation" is already the
  route/label for the Sprechen speaking-practice chooser (`/simulation`) and "Prüfungssimulation" is
  the standing term for an exam set, so renaming the "Praktisch" nav tab to "Simulation" too would
  put two unrelated things under the same name. Asked the founder how to proceed via `AskUserQuestion`
  rather than guessing; the founder asked for name suggestions instead of resolving the collision
  another way.
  Offered Training / Praxis / Start, checked collision-free by grep against routes, `nav-items.ts`
  and life-area labels. The founder redirected: wanted a name hinting at the Neuland game that lives
  in the same tab (alongside the daily Üben training). Checked the obvious game-flavoured words
  first and ruled out "Mission" (already the game's own content unit, `mission.ts` + `?mission=`),
  "Quest" (a named Fortschritt-page element, "Nächste Quest"), "Level" (already the English
  translation of Niveau/Stufe in `uiStrings.ts`), and "Welt" (the game's own route). Offered Arena /
  Spielplatz / Abenteuer, collision-checked the same way. Founder picked **Spielplatz**.
  Renamed every user-facing instance: the nav label (`nav-items.ts`), its English translation
  (`uiStrings.ts`, "Spielplatz" → "Playground"), the Session page eyebrow, the help-center copy
  naming the home screen, three Admin Steuerung strings (DE + EN), and every code comment describing
  the tab across six files. Updated the docs the rename made stale: `CLAUDE.md` (nav-order law +
  lineage note, compressed elsewhere to hold the 350-line budget), `docs/areas/PRAKTISCH-NAV.md`
  (content renamed throughout, filename deliberately kept as the stable identifier six other docs
  link to), `docs/areas/SESSION.md`, `.claude/skills/design/SKILL.md`, `tests/nav.test.tsx` (its
  founder-quote comment kept verbatim, since that is literally what was typed in an earlier session).
  Left every dated/historical doc alone (`docs/plans/*`, `docs/branding/*`, `docs/DEMO_RUNBOOK.md`),
  same treatment as any other past-tense record. Verified in a real browser at 430×932 (bottom bar:
  "Spielplatz Beta") and 1280×900 (sidebar: "Spielplatz" + BETA chip). Gates: typecheck · 719 tests
  (59 files, unchanged count) · lint 0 errors · build · check:bundle 153.3 kB · lint:content
  (CLAUDE.md 349 lines).
- **Artifacts:** `src/components/layout/nav-items.ts` · `BottomTabBar.tsx` · `Sidebar.tsx` ·
  `route-icons.tsx` · `FeedbackButton.tsx` · `src/lib/uiStrings.ts` ·
  `src/features/session/Session.tsx` · `src/features/help/content.ts` ·
  `src/features/admin/AdminSteuerung.tsx` · `src/features/library/LibraryHub.tsx` · `src/index.css` ·
  `tests/nav.test.tsx` · `CLAUDE.md` · `docs/areas/PRAKTISCH-NAV.md` · `docs/areas/SESSION.md` ·
  `.claude/skills/design/SKILL.md` · `docs/DECISIONS.md` (§s210) · `docs/PROJECT_STATUS.md`

- **Merge + deploy (recorded after the fact):** PR **#853** squash-merged to `main` as **`53dc2e3`**;
  **Validate content** green on that SHA. Verified by the workflow's check run rather than by
  claiming it, since the sandbox cannot reach the live site.

### Prompt 2 (2026-08-10)

> what's the iPhone microphone thing?

- **Response summary:** A context-window summary had compressed the earlier PR #850 work down to a
  bare mention, so the founder asked what it referred to. Explained in plain terms: the microphone
  bug from earlier this session (a spoken sentence repeating itself word by word on iOS Safari,
  fixed in #850, already merged and live) and the one open item that fix left behind, an iPhone
  check that the sandbox has no device to perform itself. No code change; a chat-only answer.

### Prompt 3 (2026-08-10)

> that's already fixed

- **Response summary:** Founder confirmed the iPhone check from #850 passed on a real device.
  Acknowledged; nothing left open from sessions 209 or 210.

### Prompt 4 (2026-08-10)

> document the session

- **Response summary:** Closed session 210's documentation. Prompt 1's PR body already carried the
  full account of the naming search and the founder's picks, so this pass recorded what only exists
  after the fact: the merge SHA (PR **#853** → **`53dc2e3`**, squash-merged, `Validate content`
  green) in both the `PROJECT_STATUS.md` header entry and its handoff (replacing "not yet merged as
  of this handoff"), plus the founder's own confirmation that the #850 iPhone check passed, closing
  the one item session 209's handoff had left open. No further doc was made stale: `docs/areas/*`
  and `CLAUDE.md` were already updated inside PR #853 itself, not deferred to this pass.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

## Session 211 (branch `claude/speaking-drills-review-issue-3589zm`)

### Prompt 1 (2026-08-13)

> the review of speaking drills still doesn't work. check what's the issue

- **Response summary:** "The review" is one sentence covering four different failures on the Sprechen
  debrief screen, each with a different fix, so the flow was traced end to end first (client →
  `converse` → the three provider legs → the Verlauf) and then the founder was asked, with the four
  candidate symptoms spelled out, which one they see. Answer: **"it spins for a long time and says
  the feedback cannot be generated or something like that and then asks me to try again later but
  then the progress is lost"**, in Sprechen practice (not the Modelltest). That named three faults,
  all structural, all fixed here.
  **(1) The debrief led on the leg that cannot serve it.** `gemini-2.5-flash` reasons by default and
  Google bills thoughts as OUTPUT; the debrief's answer is a whole JSON object over a fourteen-turn
  transcript, so the leg reliably returned `finishReason: "MAX_TOKENS"` with no text. s206 disabled
  thinking for TURNS and left the debrief thinking, so every debrief in the app waited out a leg that
  could not succeed before the model that could was asked. The debrief now leads on the paid model
  (`lead: "paid"`, restoring the s196 intent that the debrief gets the stronger model), with Gemini
  behind it, thinking off, as a genuine fallback.
  **(2) Per-leg deadlines are not a budget.** Three 60-second legs in series is a three-minute
  request, longer than the platform's own ceiling, so a bad run could be killed before reaching its
  own failure path. Added `DEBRIEF_BUDGET_MS` (100 s) and `TURN_BUDGET_MS` (45 s): `legDeadline`
  caps each leg by what remains and refuses to start one that cannot finish (`MIN_LEG_MS` 8 s). The
  order and the budget were extracted to `supabase/functions/_shared/aiCascade.ts` so they can be
  unit-gated (`tests/aiCascade.test.ts`, 8 tests) instead of living in a Deno file no test can
  import. `DEBRIEF_MAX_TOKENS` raised 4096 → 8192, since both fallback legs spend that budget
  reasoning before writing an answer.
  **(3) "The progress is lost" was literally true.** `learner_text` was written only by a successful
  debrief, and `SprechenHistory` reads `learner_text`, never `turns`, so a conversation whose grade
  failed expanded to "Das Transkript wurde inzwischen gelöscht." over a row that held every word: the
  app contradicted its own failure screen, and the founder believed the wrong one. It is now written
  turn by turn (an abandoned conversation is on record too) and re-asserted on the debrief's failure
  path.
  **Plus diagnosability:** `cascade` returns a reason with an empty result (`unavailable` ·
  `unreadable` · `timeout`; the client adds `network`), the function logs it, and the failure screen
  prints it as a small `Code: …` line, so the next report of this sentence carries its own diagnosis.
  **What was ruled out and stated as such:** the backend is deployed current (last `supabase.yml` run
  2026-08-09, green), RLS on `speaking_conversations` is intact, and the client's debrief request,
  retry and rendering paths are sound. The provider-side behaviour of the founder's specific failed
  runs is NOT observable from the sandbox: the network policy blocks the Supabase project, so no
  live probe and no function logs. Gates (measured 2026-08-13): typecheck · 727 tests (60 files, up
  from 719) · lint 0 errors (84 warnings, unchanged baseline) · build · check:bundle 153.3 kB ·
  lint:content (CLAUDE.md back to 349 lines, the new law paid for by compressing prose whose detail
  lives in `docs/areas/SPRECHEN.md`).
- **Artifacts:** `supabase/functions/_shared/aiCascade.ts` (new) ·
  `supabase/functions/converse/index.ts` · `src/lib/speaking.ts` ·
  `src/features/sprechen/ConversationRunner.tsx` · `tests/aiCascade.test.ts` (new) ·
  `docs/areas/SPRECHEN.md` · `CLAUDE.md` · `docs/DECISIONS.md` (§s211) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (new) ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md` · `docs/SESSION_PROMPT_LOG.md`

### Prompt 2 (2026-08-13)

> [screenshot of the Sprechen Verlauf: eight conversations, every one badged "Without marking"; the
> expanded row reads "WAS DU GESAGT HAST — The transcript has since been deleted." and under it
> "There is no feedback for this conversation. Your conversation is stillgespeichert."]

- **Response summary:** Three defects in one screenshot, and the most important one was recoverable.
  **(1) The transcripts were never deleted.** `turns` held every word of all eight conversations;
  only `learner_text`, the column the Verlauf reads, was empty, because before this session nothing
  but a successful debrief wrote it. Migration **`0021`** backfills `learner_text` from `turns` for
  every row that still has one (idempotent, `lint:migrations` green), so the founder's history comes
  back with its transcripts. A retention-purged row is untouched: that job empties `turns` in the
  same statement it NULLs the text, so there is nothing to reconstruct and nothing to claim.
  **(2) "Your conversation is stillgespeichert."** The sentence was written as
  `{t("… Dein Gespräch ist trotzdem")}gespeichert.`, so the head went through the interface-language
  fold and the tail stayed German and lost its space. It is invisible in German, which is the
  language the app is authored in, and `ConfirmEmail` carried the identical construction ("Melde
  dich an, dann" + "schicken wir dir einen neuen"). Both are ONE string now, and
  `tests/uiStringSplit.test.ts` scans every `.tsx` for a `t()` used as JSX children followed by
  literal letters, so the class cannot come back.
  **(3) The copy blamed a deletion for the app's own gap.** "Das Transkript wurde inzwischen
  gelöscht." is only true past `LEARNER_TEXT_RETAIN_DAYS` (730 days); a younger row never had a
  transcript written, and now says exactly that. Also fixed "Ohne Bewertung" → **"Not assessed"**
  (it read "Without marking", an instruction about printing rather than a statement about grading),
  and its sibling "Ohne Bewertung fortfahren" → "Continue without assessment", so one German term
  does not produce two unrelated English ones.
  **What the screenshot also confirmed:** all eight conversations, 8-10 Aug, are ungraded. That is
  the s211 debrief failure, from before this session's deploy, exactly as diagnosed.
  Gates (measured 2026-08-13): typecheck · **728 tests** (61 files) · lint 0 errors (84 warnings,
  unchanged baseline) · build · check:bundle 153.5 kB · lint:content · lint:migrations.
- **Artifacts:** `supabase/migrations/0021_backfill_learner_text.sql` (new) ·
  `src/features/sprechen/SprechenHistory.tsx` · `src/features/auth/ConfirmEmail.tsx` ·
  `src/lib/uiStrings.ts` · `tests/uiStringSplit.test.ts` (new) · `docs/areas/SPRECHEN.md` ·
  `docs/DECISIONS.md` (§s211b) · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

## Session 212 (branch `claude/microphone-bug-fix-jc70vs`)

### Prompt 1 (2026-08-14)

> can you make sure when the app opens the user sees the library instead of the playground?

- **Response summary:** `/` is both the Spielplatz dashboard's route AND the Spielplatz nav tab's
  link target, so redirecting `/` itself at the router level would have made tapping the tab bounce
  straight back to the Bibliothek, breaking it. The fix needed to distinguish a COLD open (the PWA's
  `start_url`, a bookmark of the bare domain, a hard reload) from an in-app navigation to the same
  URL (a `<Link>` click, no reload), and only redirect the first.
  Landed on the fact that a JS module evaluates exactly once per real page load and never again on a
  client-side route change, which is precisely that distinction. New `src/lib/appEntry.ts`, imported
  second in `main.tsx` right after `lib/authCallback.ts` (an existing module that already runs at
  module-eval time, before React Router mounts, for the identical reason: reading the URL before
  anything rewrites it). At import time it checks `window.location.pathname === "/"` and, if so,
  calls `history.replaceState` to `/library`, search and hash preserved, before the router is even
  created.
  Preserving the search/hash mattered concretely: `grep`-ing for `redirectTo` before assuming the
  bare root was free to repoint surfaced that Google's OAuth callback lands there by design
  (`useAuthStore.ts`: `redirectTo: origin + "/"`, landing as a bare `?code=…`), and
  `lib/authCallback.ts`'s own doc comment surfaced that a legacy Supabase "Confirm signup" email
  template also lands there (`#access_token=…`). Neither reads the URL's PATH, only its query/hash,
  and `authCallback.ts` (which runs first) had already snapshotted the hash into memory before this
  module touches the URL, so relocating the path is safe for both. `public/spa-redirect.js` (runs
  before any module, restores a GitHub-Pages-mangled deep link like `/?/settings` → `/settings`)
  guarantees a real deep link never reaches `appEntry.ts` with pathname still `"/"`.
  `tests/appEntry.test.ts` (7 tests) covers the pure decision function plus the live module-eval
  redirect, same split as `authCallback.ts`/its own test. Verified in a real browser (Chromium,
  430×932) against both the dev server and the production `preview` build, checking rendered content
  and not just the resolved URL: cold open shows the actual Bibliothek, tapping Spielplatz afterward
  shows the actual Dashboard, a deep link to `/anwenden` is untouched, a reload while on Spielplatz
  bounces back to the Bibliothek. Not verifiable from the sandbox: an actual Google OAuth round trip
  or a real PWA install; the safety argument there rests on reading `supabase-js`'s behaviour rather
  than exercising it, flagged in the handoff for a founder check post-deploy.
  Gates: typecheck · 734 tests (61 files, up from 727) · lint 0 errors · build · check:bundle
  153.5 kB · lint:content (CLAUDE.md 349 lines, compressed to hold budget: dropped a redundant
  `(s195)` cross-reference the file already states in full two bullets earlier).
- **Artifacts:** `src/lib/appEntry.ts` (new) · `src/main.tsx` · `tests/appEntry.test.ts` (new) ·
  `CLAUDE.md` · `docs/areas/PRAKTISCH-NAV.md` · `docs/DECISIONS.md` (§s212) ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session
  210 archived off to stay under the status file's line budget) · `docs/SESSION_PROMPT_LOG.md`

### Prompt 2 (2026-08-15)

> check the live site once it's deployed

- **Response summary:** Confirmed the merge deployed rather than assuming it: GitHub Actions'
  **Deploy site to GitHub Pages** run for the merge commit (`5cde413`) completed successfully at
  11:45 UTC (`Deploy Supabase functions` did not run for this SHA, correctly, since the PR touched no
  migration and no Edge Function). Could not go further than that: both `curl` (403 at the sandbox's
  egress proxy) and `WebFetch` (`EGRESS_BLOCKED`) confirmed `genauly.de` itself is unreachable from
  here, exactly as `CLAUDE.md` already states ("the sandbox cannot reach the live site; the founder
  verifies live results"). Reported the deploy confirmation plus three concrete checks for the
  founder: a cold open lands on the Bibliothek, the Spielplatz tab still opens normally afterward,
  and (the one thing genuinely unverified end-to-end) a real Google sign-in round trip. No code
  change; a verification + reporting turn only.
- **Artifacts:** none (chat-only; the deploy confirmation is recorded here and in the session-212
  handoff in `docs/PROJECT_STATUS.md`).

## Session 213 (branch `fix/verlauf-history-timeout`)

### Prompt 1 (2026-08-16)

> what's next in to do?

- **Response summary:** Read `docs/PROJECT_STATUS.md`'s "Resume here" section and reported the three
  open items from the session 211/212 handoffs: the founder verification still pending on the s212
  cold-open deploy, the Sprechen/Schreiben Verlauf spinner having no timeout on an unreachable
  Supabase, and the reply-task content wave (writing-audit P4). Asked which to start on. No code
  change.
- **Artifacts:** none (chat-only).

### Prompt 2 (2026-08-16)

> can you explain clearly on what do you mean by verlauf spinner task?

- **Response summary:** Traced the concrete code path: `getSpeakingHistory` (`src/lib/speaking.ts`)
  and `getWritingHistory` (`src/lib/writing.ts`) each `await` a Supabase query with no deadline, and
  `SprechenHistory.tsx`/`WritingHistory.tsx` hold `loading = true` until that promise resolves. An
  unreachable Supabase (network hiccup, DNS issue) leaves the spinner running with no timeout, no
  error, and no way for the learner to know the app is broken versus just slow, unlike the Sprechen
  debrief AI calls which got exactly this fix (a total time budget) in session 211. Proposed wrapping
  the Supabase call with a timeout into the existing `failed` UI state. No code change; explanation
  only, asked for confirmation before implementing.
- **Artifacts:** none (chat-only).

### Prompt 3 (2026-08-16)

> yes, implement that for both

- **Response summary:** Added `withTimeout<T>(promise, ms, label)` to `src/lib/utils.ts`
  (`Promise.race` against a `setTimeout` rejection; accepts `PromiseLike<T>` so the Supabase
  `PostgrestFilterBuilder` thenable type-checks without an intermediate cast). Wrapped
  `getSpeakingHistory`'s single query and all three of `getWritingHistory`'s sequential step-down
  queries (the schema-migration fallback chain from s179/s181) at a 12s budget each; a timeout throws
  into the existing `catch { return null; }`, which the screens already render as "could not load."
  Verified `pnpm typecheck` clean for the three touched files (found and confirmed as pre-existing/
  unrelated: a Windows-only filename-case-collision error already present on `main`, being fixed on
  a separate branch already checked out at the time) and `pnpm test:unit` 735/735 passing (one
  unrelated flaky timeout in `writingAufgabe.test.tsx`, confirmed by rerunning it in isolation).
- **Artifacts:** `src/lib/utils.ts` · `src/lib/speaking.ts` · `src/lib/writing.ts` (uncommitted at
  this point).

### Prompt 4 (2026-08-16)

> is it live?

- **Response summary:** No, nothing had been committed or pushed yet; explained that only
  working-tree files had been edited and verified. Asked whether to commit and open a PR.
- **Artifacts:** none.

### Prompt 5 (2026-08-16)

> Yes, separate branch it and open the PR

- **Response summary:** The working branch (`fix/windows-case-collision-graph-helpers`) already
  carried unrelated staged/unstaged WIP from an earlier session (a `CollocationGraph`/`WordGraph`
  filename-casing fix), so the timeout fix needed its own clean branch to avoid bundling unrelated
  changes into one PR. Extracted the diff for the three touched files only (`git diff` → patch file),
  reverted them on the working branch, fetched `origin/main`, created `fix/verlauf-history-timeout`
  off it, stashed the case-collision WIP that had carried over onto the new branch (`git checkout -b`
  keeps uncommitted changes), applied the patch, confirmed `pnpm typecheck`/`pnpm test:unit` clean
  (735/735) on the isolated branch, committed, pushed, and opened **PR #859** via `gh pr create`.
  Restored the case-collision WIP onto the original branch via `git stash pop` afterward so it was
  not lost.
- **Artifacts:** commit `08aa991` on `fix/verlauf-history-timeout` · **PR #859** (github.com/
  thelivinsine/B2furBerufApp/pull/859).

### Prompt 6 (2026-08-16)

> merge it

- **Response summary:** Confirmed CI (`lint-content`) passed via `gh pr checks 859`, then
  squash-merged with `gh pr merge 859 --squash --delete-branch`, landing as **`47f0825`** on `main`.
  Did the required post-merge housekeeping: fetched `origin/main`, switched back to
  `fix/windows-case-collision-graph-helpers`, `git reset --hard origin/main`, and popped the stashed
  case-collision WIP back on top, leaving that branch exactly as found but rebased onto the new
  `main`. Pruned the now-deleted remote branch ref locally.
- **Artifacts:** merge commit `47f0825` on `main` (PR #859, squash-merged).

### Prompt 7 (2026-08-16)

> document the session

- **Response summary:** Updated `docs/PROJECT_STATUS.md`: added the session 213 entry to the session
  log and "Resume here" (with the s211 pending-item now resolved), archived session 211's session-log
  and handoff blocks into `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (only the two
  most recent sessions stay in the live file), and corrected two now-stale "Verlauf spinner has no
  timeout" bullets left over in the session 210/212 handoffs. Appended this session's prompts here.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`
  · `docs/SESSION_PROMPT_LOG.md`.

### Session 214 (2026-08-16, branch `fix/windows-case-collision-graph-helpers`)

Local-environment session on the founder's Windows machine, run concurrently with session 213
(PR #859); the branch/stash churn from that overlap is recorded in session 213's entries above.
Condensed, one line per founder prompt:

- *"clone the repo b2furberufapp locally"* → confirmed the folder already **is** the clone (remote
  `thelivinsine/b2furberufapp`, on `main`); nothing to clone.
- *"best practices working locally"* → gave the golden rules: branch/PR/merge never on `main`, pull
  first, `pnpm build` green before push, pnpm-only, plain-English asks, founder verifies live.
- *"explain the package.json change"* → the machine's global pnpm 11 had rewritten the
  `packageManager` pin from `pnpm@10.33.0`; explained, recommended discarding.
- *"update pnpm only if safe / do the analysis"* → verdict **not now**: pnpm 11 silently ignores the
  `pnpm.overrides` react-router pin and risks the `.npmrc` guardrails. Reverted the file; ran
  `corepack install` so the folder resolves to pinned v10 while global v11 stays elsewhere.
- *"run pnpm install / build"* → install clean on v10; `pnpm build` exposed a Windows-only
  case-collision (`WordGraph.tsx`/`wordGraph.ts`, `CollocationGraph.tsx`/`collocationGraph.ts`).
- *"option B, scope it / yes"* → renamed the two lowercase helpers to `*Model.ts`, fixed 5 imports +
  3 stale comments; build passes on Windows, graph tests pass. Mid-way the concurrent session stashed
  and rebased this WIP (recovered).
- *"is everything on main / the other session is done"* → confirmed PR #859 on `main`; this fix still
  uncommitted. Landed it as its own PR after the other session closed.
- *"document the session"* → this entry + the session 214 block in `PROJECT_STATUS.md`.

- **Artifacts:** `src/features/vocabulary/wordGraphModel.ts` (renamed from `wordGraph.ts`) ·
  `src/features/collocations/collocationGraphModel.ts` (renamed from `collocationGraph.ts`) ·
  `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx` ·
  `tests/wordgraph.test.ts` · `tests/collocationGraph.test.ts` · `scripts/lint-content.mjs` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

### Session 215 (2026-08-16, no branch — dashboard-only: Namecheap, Resend, Supabase)

Founder worked through `docs/reference/auth-emails/README.md` step 1 live, prompt by prompt; no
code touched. Condensed, one line per founder prompt:

- *"check the docs/reports/plans... which tasks are pending"* → read `PROJECT_STATUS.md`, summarized
  the open founder action items and resume-here handoffs.
- *"what is the smtp thing?"* → explained the Resend SMTP action item in plain terms.
- *"i'm in step 1 of readme. I got the DKIM, SPF, etc in resend. What should I do now in namecheap?"*
  → walked through adding those records in Namecheap Advanced DNS.
- *"tjere's an MX record type in resend but the option type doesn't exist in namecheap, which one to
  select?"* → first answer wrongly asserted Namecheap's Type dropdown had an MX option; founder
  screenshotted the actual dropdown and called it out ("don't gaslight me"), correctly — the option
  is hidden until Namecheap's "Mail Settings" is switched to **Custom MX** first.
- *"I found it and added. All other records are also added from resend."* → confirmed, pointed at
  Resend's Verify button next.
- *"I still didn't setup the domain email address. how to do it on namecheap? I already purchased the
  private email feature"* → walked through Namecheap Private Email mailbox setup; flagged a possible
  MX conflict with Resend's MX record depending on its Host value.
- *(screenshot: MX record Host = "send")* *"is this it?"* → confirmed no conflict (Private Email's MX
  lands on `@`, Resend's is on `send`); cleared to proceed.
- *"mailbox is set up, what's next"* → check Resend domain verification status, then API key + Supabase
  SMTP settings.
- *"correction: I used hello@genauly.de as mailbox name"* → noted, adjusted all subsequent guidance
  from `hallo@` to `hello@genauly.de`.
- *"should I select full access or sending for the api key if creating newly?"* → **Sending**, least
  privilege.
- *"created it, now what"* → gave the Supabase Custom SMTP field values to fill in.
- *"test signup with a fresh email"* → declined to create the test account directly (account/password
  creation is a prohibited action for the assistant to perform); directed founder to test it
  themselves with a `+alias` address.
- *(screenshot: "Error sending confirmation email")* → diagnosed as an SMTP-side failure, not a
  signup-form issue; asked founder to check Resend domain status and Supabase Auth Logs.
- *"on resent, it says not started"* → identified as the root cause: Resend won't send from an
  unverified domain; told founder to force a Verify check.
- *"now it's verified"* → told founder to retry the signup test.
- *(screenshot: confirmation email successfully from hello@genauly.de)* *"got it now"* → confirmed
  step 1 done; flagged remaining step 2 (templates) and the rate-limit bump.
- *(screenshot: onboarding screen)* *"It works now. there are a couple of glitches though..."* →
  three bugs reported (confirm-link doesn't auto-sign-in; post-login redirect drops to landing page
  requiring a second login; onboarding re-shows an already-accepted AGB/Datenschutz checkbox); asked
  to document for next session rather than fix now.
- *"when done documenting, get me the confirm sign up and reset password code blocks so that I can
  copy paste them in supabase"* → pasted both templates from `docs/reference/auth-emails/` inline
  (code block only, comment header stripped) for direct copy-paste into Supabase → Authentication →
  Emails.
- *(screenshot: "Kurz nicht erreichbar" fatal-error card)* *"another bug to be documented - I get
  this if I'm trying to login now in the original tab where I started logging in but after clicking
  on confirm email address link, the app opened in a new tab. The original one has some trouble
  showing the app."* → identified as `RootErrorBoundary`/`paintFatal()`'s fatal-crash screen
  (`src/main.tsx`); founder hadn't captured "Technische Details", so flagged as bug 4, to be
  reproduced and diagnosed properly next session rather than guessed at now.
- *"done with the html code pasting"* → confirmed, continued documenting.
- *"document the session, open a pr and merge to main"* → finished this entry + the session 215 block
  in `PROJECT_STATUS.md`; opened a docs-only PR and squash-merged it per the standing auto-ship rule.

- **Artifacts:** Namecheap Advanced DNS + Private Email (`genauly.de`) · Resend (domain verification
  + Sending API key) · Supabase → Authentication → SMTP Settings · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 213 archived off) ·
  `docs/SESSION_PROMPT_LOG.md`


## Session 216 (no branch)

### Prompt 1 (2026-08-16)

> can I make the gitrepo private without any risks?

- **Response summary:** Checked for committed secrets (`grep` over `.github` for keys, `git log`
  for `.env`/`.env.local`) and found none: no env file ever committed, Supabase credentials live
  only in GitHub Actions secrets. Confirmed GitHub Pages still publishes from a private repo on any
  plan (stopped being Pro-only in 2021), so `genauly.de` keeps working; the live site itself stays
  public either way, only the source becomes hidden. Flagged that anyone relying on a public
  raw.githubusercontent.com URl or a GitHub-hosted badge would lose access. Visibility change itself
  is a manual GitHub Settings action, not something to do on the founder's behalf.
- **Artifacts:** none (chat-only).

### Prompt 2 (2026-08-16)

> it's private now. document the session and merge to main

- **Response summary:** Founder flipped the repo to private themselves via GitHub Settings. No code
  changed this session, so nothing to merge; confirmed `main` was already clean and up to date.
  Documented this entry plus the session 216 block in `PROJECT_STATUS.md`, archiving the now-older
  session 214 block into `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` to keep the
  main file to its two-most-recent-handoffs rule.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md`
  (session 214 archived off) · `docs/SESSION_PROMPT_LOG.md`.

## Session 215, continued (2026-08-16, no branch — one more bug found post-merge)

### Prompt (2026-08-16)

> I tried creating an account again and when clicked on confirm, the link is redirected to the app
> in a new tab but it shows the spielplatz directly instead of asking the onboarding question of the
> purpose and learner level. Document this too as it needs to be fixed.

- **Response summary:** A fifth bug in the same sign-up/confirm flow: a freshly confirmed account
  skips onboarding (`/welcome`'s "Wofür lernst du Deutsch?"/Niveau screen) entirely and lands
  straight on the Spielplatz dashboard, meaning `RequireOnboarding`/`onboarded` is somehow being
  treated as already satisfied on this path. Added as bug 5 to the session 215 handoff in
  `PROJECT_STATUS.md`, alongside the existing four, with a note that it likely shares a root cause
  with bugs 1/2 (the confirm-link session isn't going through the normal sign-in path the onboarding
  gate expects). Bug counts corrected from "four" to "five" throughout the file. Docs only, no PR
  needed (no code change).
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.

## Session 217 (branch `password-reset-flow`)

### Prompt 1 (2026-08-16)

> the settings page doesn't seem to have a reset password option - scope it

- **Response summary:** Explored Settings (`src/features/settings/Settings.tsx` +
  `AccountPanel.tsx`), auth (`useAuthStore.ts`), and `/auth/confirm` (`ConfirmEmail.tsx`). Found the
  missing Settings row was the smaller half of a bigger gap: the app is fully password-based
  (`signInWithPassword`) but had no `resetPasswordForEmail` call anywhere, no "Passwort vergessen?"
  link, and no set-password screen — a learner who forgot their password had no way back in.
  `ConfirmEmail.tsx` already passed `type=recovery` into `verifyOtp` correctly but then dropped the
  learner into the app with nowhere to set a password, and the branded reset-email template existed
  but had never been pasted into Supabase. Asked the founder two scoping questions via
  AskUserQuestion: (1) build both the forgot-password flow and the Settings row, or just one —
  founder chose **both**; (2) what a Google-only account's Settings row should do — founder chose
  **"Passwort festlegen"**, letting a Google user add a password as a second sign-in method rather
  than hiding the row. Wrote the plan to
  `~/.claude/plans/the-settings-page-doesn-t-majestic-wigderson.md` (store additions, a shared
  `NewPasswordForm`, a recovery branch in `ConfirmEmail.tsx` reusing the existing unguarded route
  instead of a new one, the Settings row, the "Passwort vergessen?" link, uiStrings, the email
  template change, one small test) and got founder approval via ExitPlanMode.
- **Artifacts:** plan file only, no code yet.

### Prompt 2 (2026-08-16)

> continue where you left off

- **Response summary:** Continued post-approval research (reading `authCallback.ts`, the router's
  `/auth/confirm` route, the reset-password email template + its README) to confirm the exact
  mechanics before writing code.
- **Artifacts:** none (research only).

### Prompt 3 (2026-08-16)

> continue implementing the plan

- **Response summary:** Implemented the full plan: `sendPasswordReset`/`setPassword`/
  `passwordRecovery`/`hasPasswordIdentity` in `useAuthStore.ts`; new `NewPasswordForm.tsx`; the
  recovery branch in `ConfirmEmail.tsx`; the "Passwort ändern"/"Passwort festlegen" row in
  `AccountPanel.tsx`; the "Passwort vergessen?" link + neutral reset-pending panel in
  `AuthDialog.tsx` (copy deliberately never confirms whether an address has an account, matching
  Supabase's own anti-enumeration behavior); fixed `SaveProgressBanner.tsx`'s stale "Kein Passwort
  nötig." copy; added every new string to `uiStrings.ts`; changed `reset-password.html`'s link to
  spell out `type=recovery` explicitly and updated its README; added `tests/authPassword.test.ts`.
  Ran the full gate: `pnpm typecheck`, `pnpm lint` (0 errors), `pnpm test:unit` (740 passed),
  `pnpm build`, `pnpm check:bundle` — all clean.
- **Artifacts:** `src/store/useAuthStore.ts` · `src/features/auth/NewPasswordForm.tsx` (new) ·
  `src/features/auth/ConfirmEmail.tsx` · `src/features/auth/AccountPanel.tsx` ·
  `src/features/auth/AuthDialog.tsx` · `src/features/auth/SaveProgressBanner.tsx` ·
  `src/lib/uiStrings.ts` · `docs/reference/auth-emails/reset-password.html` + `README.md` ·
  `tests/authPassword.test.ts`.

### Prompt 4 (2026-08-16)

> once done - document the session and merge everything live

- **Response summary:** Documented this entry plus the session 217 block in `PROJECT_STATUS.md`,
  archiving session 215's narrative block into
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (its bug list stays live in the
  current file's "Resume here", since none of it is fixed yet) to keep the live file to its
  two-most-recent-handoffs rule. Opened a PR into `main` and squash-merged it per the standing
  auto-ship rule. **Caveat:** this session did NOT fix the five session-215 auth/onboarding bugs
  (confirmation-link sign-in, double login, re-shown consent checkbox, new-tab crash, skipped
  onboarding) — those remain open and are unrelated to the password-reset/change feature built here.
- **Artifacts:** `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 215 archived off) ·
  `docs/SESSION_PROMPT_LOG.md` · PR into `main`.

## Session 218 (no branch)

### Prompt 1 (2026-08-16)

> do the documentation maintenance

- **Response summary:** Checked `git log`/`git status` (clean, nothing since PR #865) against
  `PROJECT_STATUS.md` and this log: both already fully cover session 217 (password reset/change,
  merged) and session 216 (repo made private). No code or doc content was stale, so the only
  maintenance needed was logging this prompt itself.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`.

### Prompt 2 (2026-08-16)

> are all the rules and practices well followed for all the memory files?

- **Response summary:** Checked the persistent cross-session memory directory (separate from
  `docs/`): it was empty, so there was nothing to audit for rule compliance yet.
- **Artifacts:** none (chat-only).

### Prompt 3 (2026-08-16)

> read existing documentation on how to maintain the logs and docs

- **Response summary:** Read `docs/README.md`'s "Documentation best practices" section (the actual
  maintenance rules) and audited the repo against it. Found `SESSION_PROMPT_LOG.md` badly overdue
  for rotation (~6,950 live lines vs. the ~1,200-line budget; last real rotation stopped at session
  151/W30) and `docs/README.md`'s own `areas/`, `plans/`, `reports/` and `reference/` tables missing
  several files that exist on disk (`areas/PRUEFUNG.md`/`SPRECHEN.md`/`UI-LANGUAGE.md`, five `plans/`
  files, five `reports/` files, `reference/auth-emails/`).

- **Prompt (2026-08-16):** "yes go for it"
- **Response summary:** Rotated `SESSION_PROMPT_LOG.md`: sessions 152–171 appended to the existing
  `archive/prompt-log/SESSION_PROMPT_LOG_2026-W30.md`, new `…W31.md` (sessions 173–183) and `…W32.md`
  (sessions 184–208) created, live file now holds session 209 onward (~700 lines); updated the
  archive `README.md` index to match. Patched `docs/README.md`'s stale tables with the missing rows
  found above. **While this was in progress, PR #866 (a concurrent session's `genauly.de` outage
  fix) merged to `main` carrying an identical prompt-log rotation and the same table fixes** — so by
  the time this session went to commit, only `docs/README.md`'s "Last reviewed" header line (not
  touched by #866) was still outstanding; bumped it to record this pass.
- **Artifacts:** `docs/README.md` · (rotation itself already live via PR #866: `docs/SESSION_PROMPT_LOG.md`,
  `docs/archive/prompt-log/SESSION_PROMPT_LOG_2026-W30/W31/W32.md`, `docs/archive/prompt-log/README.md`).

### Prompt 8 (2026-08-16)

> i checked again and here's what i get:
>
> Issues found from the previous verification attempt:
> * Your home page is behind a login page.
> * Your home page does not explain the purpose of your app.
> * The app name "Genauly" configured for your OAuth consent screen does not match the app name on
>   your home page.

- **Response summary:** Progress confirmed: the unresponsive/duplicate-URL issues from round 1 were
  gone, meaning the deploy fix held; this was a genuinely new, shorter list. Loaded `genauly.de` in a
  real browser (Claude Browser tool) and confirmed it renders a full public landing page once
  hydrated: hero, FAQ, "Log in"/"Start free", no gate anywhere — directly contradicting "behind a
  login." Read `index.html` and found the real cause: the crawler-facing static content inside
  `#root` (added in an earlier session specifically for Google's reviewer) was gated behind a
  `<noscript>` CSS toggle, so it only appeared to clients with JavaScript fully disabled. A
  JS-ENABLED crawler that snapshots before the ~1.5 MB of vendor JS finishes downloading and
  hydrating sees only a bare loading spinner: no visible "Genauly" text, no explanation, which reads
  exactly like "behind a login" + "doesn't explain purpose" + "name mismatch" (the brand name existed
  only in `<title>`/`<img alt>`, not in visible body text, while the spinner was showing). Removed the
  `<noscript>` gate so the explanatory content is visible by default for every client regardless of
  render timing; React still clears it on mount, so real users see a shorter flash of real content
  instead of a bare spinner rather than a tradeoff. Rebuilt, verified via `pnpm typecheck` and a real
  browser check of the rebuilt page (`pnpm preview`, confirmed identical post-hydration rendering, no
  new console errors).
- **Artifacts:** `index.html` · `.claude/launch.json` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

### Prompt 9 (2026-08-16)

> [screenshot of Google's "Branding verification issues" dialog: same three issues as prompt 8,
> radio buttons for "I have fixed the issues" / "I believe the issues found are incorrect"]

- **Response summary:** Clarified this was the action dialog, not a fresh check result — verified
  independently (curl with a spoofed Googlebot user-agent against `genauly.de`, byte-identical to a
  normal fetch, no `robots.txt`/meta-robots block, fresh `Age: 0` response confirming no stale CDN
  cache) that the raw HTML Google would fetch is correct. Advised selecting "I have fixed the
  issues" → Proceed, not "issues are incorrect" (they were real against the old page). Also flagged
  checking the OAuth consent screen's own App name field for stray whitespace/casing as a quick
  sanity check.
- **Artifacts:** none (verification only).

### Prompt 10 (2026-08-16)

> it says the same after clicking proceed

- **Response summary:** Explained that clicking "Proceed" submits a re-review request, it does not
  run a live check inline — the dialog shown right after is still displaying the last COMPLETED
  review's results, since Google's async re-review (their Trust and Safety team) had not actually
  run again yet. Pointed to Search Console's URL Inspection → "Test Live URL" → screenshot as the
  most concrete independent way to see what Googlebot's own renderer sees, without waiting on the
  OAuth team's queue.
- **Artifacts:** none.

### Prompt 11 (2026-08-16)

> [screenshot of the Google Auth Platform "Overview" page after clicking into OAuth consent screen]
> when I click on auth consent screen, I see this.. where to check the app name?

- **Response summary:** Google renamed the OAuth consent screen UI to "Google Auth Platform" with a
  new left-nav (Overview/Branding/Audience/Clients/Data Access/Verification Center/Settings).
  Pointed to the "Branding" tab for the App name field. Also flagged an unrelated banner visible in
  the screenshot ("Your free trial ends today") about the founder's GCP billing trial, separate from
  the branding issue.
- **Artifacts:** none.

### Prompt 12 (2026-08-16)

> [screenshot of the Branding tab: App name "Genauly" (correct, no typo), User support email
> "thelivinsine@gmail.com" with a dropdown showing only that address + empty "Google Groups managed
> by you"]
> This is what I have here. How can I add the hello@genauly.de email id?

- **Response summary:** Explained that "User support email" only accepts emails tied to a Google
  Account the founder is authenticated as (or a Google Group they administer) — `hello@genauly.de`
  is a regular mailbox (Namecheap/Resend), not a Google identity, so it can't appear there without
  Google Workspace for the domain. Clarified this field is unrelated to the branding issues Google
  flagged and doesn't need to change — the app's own public contact address (already switched to
  `hello@genauly.de` in-app) is a separate thing entirely. Gave the Workspace-signup option as the
  only real path if the founder wants it later, otherwise recommended leaving it as-is.
- **Artifacts:** none.

### Prompt 13 (2026-08-16)

> what are some alternatives for hosting the app? can we not use google as it's giving me so much
> trouble?

- **Response summary:** Clarified a conflation in the question: hosting (GitHub Pages) and Google
  Sign-In (one optional auth method) are unrelated; nothing about hosting needs to change or has
  been affected by any of this. Framed the real decision as three options for the Google Sign-In
  friction specifically: keep waiting on the (largely already-fixed) verification, drop Google
  Sign-In entirely in favor of the existing email/password + guest flows, or leave the OAuth client
  in Testing mode (100-user cap, not viable long-term). Asked which the founder preferred rather
  than picking for them, since it is a product tradeoff, not a technical call.
- **Artifacts:** none.

### Prompt 14 (2026-08-16)

> let's just keep waiting on Google's review. document the session

- **Response summary:** Founder chose to keep waiting on Google's async review rather than drop
  Google Sign-In. No code changes this turn (Console navigation help + a product decision); this
  entry plus the two PRs already shipped earlier in the session (fix genauly.de outage + prerender
  /privacy #866, fix the noscript-gated boot content #868) are session 219's full artifact list.

## Session 220 (branch `fix-signup-onboarding-bugs`)

### Prompt 1 (2026-08-16)

> what's next in the to-do?

- **Response summary:** Read `docs/PROJECT_STATUS.md`'s "Open founder action items" and "Resume
  here" sections and summarized both: founder-side items (Google Sign-In review still pending,
  live-verify the session 217 password reset flow, paste email templates, fill in the Impressum
  postal address, optional LanguageTool key) and the five sign-up/onboarding bugs found in session
  215's live testing, none fixed yet.
- **Artifacts:** none (chat-only).

### Prompt 2 (2026-08-16)

> I confirm the change password works. scope the bugs found and create a robust plan to fix them.

- **Response summary:** Traced the five session-215 bug reports to three actual root causes (three
  parallel Explore agents plus manual code verification against `useAuthStore.ts`, `ConfirmEmail.tsx`,
  `router.tsx`, `cloudSync.ts`, `main.tsx`, and `@supabase/auth-js`'s own source): (A) the
  confirmation email used a PKCE `?code=` link that only works in the browser that started signup —
  Supabase's default `{{ .ConfirmationURL }}`; (B) `useAuthStore.init()` had two writers for auth
  `status` racing (`getSession()` + `onAuthStateChange`), so a late `getSession()` resolution could
  overwrite a live `SIGNED_IN` with `signedOut`, which `RequireOnboarding` treated as final and
  bounced the learner to `/welcome`; (C) `startCloudSync`'s shared-device wipe only fires for a
  genuinely different previous account, so a device with local `onboarded: true` from prior
  guest/offline use (but no sync history) let a brand-new account inherit the flag and skip
  onboarding. Also found: the onboarding consent checkbox re-renders unconditionally even when
  already recorded, and an uncaught `startCloudSync` rejection — triggerable by a DIFFERENT tab via
  supabase-js's cross-tab `BroadcastChannel` — hits a hair-trigger global handler in `main.tsx` that
  permanently wipes a working tab's DOM, with no logging anywhere. Asked two clarifying questions
  (bug 5's inheritance rule; bug 4's fix scope) — founder chose "the cloud is always the authority on
  onboarded" and "fix the cause and narrow the trigger, with logging." Wrote a 6-part plan, got
  approval, then implemented and verified all of it:
  1. `confirm-signup.html` now uses the same `token_hash` link shape `reset-password.html` already
     used (browser-independent), plus honest "you're confirmed, please log in" copy in
     `ConfirmEmail.tsx` for the case where the old template is still live and no session resulted.
  2. Deleted the duplicate `getSession()` writer in `useAuthStore.init()` (confirmed
     `onAuthStateChange` always fires `INITIAL_SESSION` with the same data on subscribe, so this is a
     genuine race removal, not a guard) and pointed the confirm-success navigation at `/library`
     instead of `/`.
  3. `mergeRemoteSettings` now takes `firstSyncOnDevice` and resets a locally-true `onboarded` flag
     when the cloud disagrees and no account has ever synced on this device, without regressing the
     session-174 fix for returning accounts (new regression test for exactly that case).
  4. The AGB/Datenschutz checkbox in `Onboarding.tsx` now renders only when `hasConsented()` is false
     at mount, read once so it doesn't vanish mid-tick.
  5. `paintFatal` now logs to console + `sessionStorage`; the two global error/rejection handlers in
     `main.tsx` only paint the destructive fatal screen before the app has mounted; caught the
     `startCloudSync` promise and moved its destructive local-wipe prefix inside a `try` (it was
     reaching zustand-persist's unguarded `localStorage.setItem`).
  6. Named but deliberately NOT fixed: `swUpdate.ts` can reload a hidden tab mid-signup since
     `hasLiveWork()` has no auth-surface claim — real, but not a crash and not reported.

  All gates green: `pnpm typecheck`, `pnpm lint` (0 errors, only pre-existing warnings), `pnpm
  test:unit` (745 passed, incl. 2 new cases in `cloudSync.test.ts`, 2 in `authCallback.test.ts`, and a
  new `onboarding.test.tsx`), `pnpm build`, `pnpm check:bundle`. One flaky pre-existing test timeout
  in `writingAufgabe.test.tsx` under full-suite parallel load, unrelated to this change, confirmed to
  pass standalone and on a clean full-suite re-run. Verified live via `pnpm preview`: a stray
  `Promise.reject` fired from the console post-mount left the UI fully alive and stashed the error in
  `sessionStorage`; walked the onboarding flow through direct `localStorage` state changes and
  confirmed the checkbox disappears (submit stays enabled) once consent is already on record, and
  that completing onboarding lands on `/library`. Rotated session 217's full log entry out of
  `PROJECT_STATUS.md` into the W33 archive (keeping the "two most recent sessions" rule) and updated
  the "Open founder action items" list (password-reset flow confirmed working; email-template item
  now explains why the confirm-signup template specifically still needs pasting).
- **Artifacts:** `docs/reference/auth-emails/confirm-signup.html` ·
  `docs/reference/auth-emails/reset-password.html` · `docs/reference/auth-emails/README.md` ·
  `src/lib/authCallback.ts` · `src/features/auth/ConfirmEmail.tsx` · `src/store/useAuthStore.ts` ·
  `src/lib/cloudSync.ts` · `src/features/onboarding/Onboarding.tsx` · `src/main.tsx` ·
  `tests/authCallback.test.ts` · `tests/cloudSync.test.ts` · `tests/onboarding.test.tsx` (new) ·
  `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W33.md` (session 217 archived off) ·
  `docs/SESSION_PROMPT_LOG.md`. Branch `fix-signup-onboarding-bugs`, PR pending.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`.
