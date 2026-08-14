# Project Status

_Last updated: 2026-08-10 (session 210 renamed the "Praktisch" nav tab to "Spielplatz". Session 209
fixed the Sprechen microphone printing the learner's sentence back to them word by word on iOS.
Sessions 204-208 (the KI-usage task, its reconciliation, the Sprechen "AI doesn't work" fix, the
nav-order + interface-language work, and the CEFR filter-chip fix) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`. All handoffs under their own "Resume
here")._

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

**Handoff after session 208 (2026-08-09): the CEFR level-band chip now stays dismissed.**
Branch `claude/filter-persistence-error-yr2716`, PR **#847** → **`de70c9b`**, squash-merged.
Post-merge housekeeping done, tree clean.
Founder report, with a screenshot: "there seems to be an error with the filter here. Even if I
remove and refresh it's still appearing. Fix it."

- **The fix is small and the pattern is worth remembering.** `showAllLevels` was local `useState`
  in three trainers, so every dismiss of the "Level: up to …" chip was wiped by the next page load.
  It now lives in `useSettingsStore.showAllCefrLevels`, persisted like `artikelLegendDismissed` and
  `signInBannerDismissed`. **Any future "dismiss this and remember it" UI should go straight into
  the settings store**, never local `useState`, or it will resurface the same bug.
- **Not verified in a browser from the sandbox** (same network-policy limits as prior sessions).
  Worth a founder check on the live site: open Wörter, dismiss the "Level: up to …" chip, hard-
  refresh, confirm it stays gone; repeat on Kollokationen and Redemittel.
- **Still open, unchanged from prior sessions:** the Sprechen/Schreiben Verlauf spinner has no
  timeout on an unreachable Supabase (client-side fetch, no deadline); the next content job is the
  reply-task wave (writing-audit P4), 47 authored `source` texts plus a rendering slot that does not
  exist yet, waiting on a founder placement pick from `preview/schreiben-source-text.html`.
