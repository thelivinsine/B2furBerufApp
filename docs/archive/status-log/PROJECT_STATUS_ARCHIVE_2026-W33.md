# Project Status archive — 2026 W33

Archived from `docs/PROJECT_STATUS.md` on 2026-08-13 (session 211), which keeps only the two
most recent session logs and handoffs.

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
