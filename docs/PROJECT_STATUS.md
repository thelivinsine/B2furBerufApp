# Project Status

_Last updated: 2026-08-08 (session 203 was a documentation-maintenance pass: CLAUDE.md is back under
its line budget and every bank count in the docs is re-measured. Session 202 put the Redemittel a
learner needs on screen WHILE they speak. Both handoffs under "Resume here")._

## Session 203 log

Founder: "do the documentation maintenance". No app code was touched.

**Two standing debts, both closed.**
- **`CLAUDE.md` is back inside its budget: 399 → 349 lines** (the `lint:content` ratchet warns past
  ~350 and had been warning since s198). It was over because rules had accreted their own history:
  measurements that live in `docs/areas/CONTENT.md`, mechanisms that live in `PRUEFUNG.md`, and the
  story of what went wrong, which belongs in `DECISIONS.md`. **No law was dropped.** Each bullet was
  cut back to the RULE plus a pointer, and the three details with no area-doc home were given one
  first: the `source`-belongs-to-the-reply-genre rule and the phrase-level (never opening-verb)
  argumentation classifier went into `CONTENT.md`, and the touch-`:hover` law went into the `/design`
  skill's landmine list as #12, beside the focus-ring law it mirrors. The maintenance rule at the top
  of the file now says what a law looks like, so the next session has a shape to write to.
- **Every bank count in the docs was re-measured**, and most had drifted silently. `PROJECT_STATUS`
  was quoting grammar drills at 195 (really **320**), texts at 42 (**52**), scenarios at 30 (**36**),
  exam sets at 15 (**21**) and provenance at 3,457 rows / 3,444 draft (**3,604 / 3,591**);
  `CONTENT.md` still described the provenance register as two array parts when it has been four since
  s182, and told authors to append to the second. `SPRECHEN.md` counted 15 exam sets in the
  no-`anruf`-set-yet note. All corrected against `pnpm lint:content` output and stamped with the date
  they were measured. **New rule in `CLAUDE.md`:** a count in a doc is MEASURED, never carried
  forward.
- Also corrected: the taxonomy line claimed 5 top-level domains "all populated"; `pruefung` carries
  no themes and never has.
- Housekeeping: the s199 and s200 session logs and the s201 handoff moved into
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`, per the two-most-recent rule.

## Session 202 log

Founder: "for the sprechen part, I'd want you to add a filter rail kind of rail with useful
redemittle even in the practice sessions", then the pick: "option a's layout for desktop and option
c for mobile and also desktop's content".

**The gap:** a spoken task named its four Redemittel CATEGORIES on the brief card and ticked them in
the debrief, while the eight phrases behind each name lived only in the Bibliothek. The learner had
the label ("Vorschläge machen") and never the language, at the one moment they were speaking, and
the debrief then graded whether they had reached for exactly those.
- **Previews first** (`preview/sprechen-redemittel-rail.html`, published as an artifact): today's
  screens plus three placements, each with desktop and phone frames and its cost.
- **Shipped the founder's pick:** ONE content (`RedemittelHelp`) in two shells. A 16rem `ScopeRail`
  tile beside the conversation from `lg` up (the stage widens `max-w-2xl` → `lg:max-w-4xl`, so the
  conversation column keeps its width), and the second tab of the brief drawer below it, **Aufgabe |
  Redemittel**. One `useMediaQuery` decides, so the phrases never print twice.
- **Practice only, structurally:** the runner takes the help as a PROP and the Modelltest passes
  nothing, so a candidate is never shown the phrases they are graded on and the exam chunk carries
  no phrase bank (`MockExamRunner` has no `redemittel-*.js` import in the build; `SprechenHub` does).
- **`src/lib/anrede.ts`, the ONE du/Sie rule.** The bank's `register` is formality, not Anrede, so
  the Anrede is derived from the phrase text, in one place, gated by `tests/anrede.test.ts` (which
  also asserts every scenario's four intents stay servable in both registers). It never empties a
  category.
- **Defaults taken where the founder answered layout only** (each one line to flip): all eight
  phrases of the chosen intent, Anrede matched to the partner, English hold-to-peek.
- Verified in a real browser at 1440x900, 1280x800 and 393x852, light and dark; every screen rests
  at 0 page scroll. Gates: typecheck · lint 0 errors · **662 tests** · build · bundle 128.3 kB.

## Session 201 log

Founder: four phone screenshots (`/lesen`, `/hoeren`, `/simulation`, `/writing`) with "make these
pages consistent and highly polished ... leave no stone unturned", two named bugs, then "go with
verlauf on all four".
**The headline is a bug the screenshots only hinted at: `/lesen` and `/hoeren` were dead pages.**
Tapping a text or "Zufällige Auswahl" wrote a run into `useExamStore`, and the Prüfung hub was the
only screen in the app that rendered a run, so nothing happened. What the founder reported as "the
shuffle button doesn't deactivate" was a stuck touch-`:hover` on a button whose tap led nowhere.
- **Both choosers work now.** `TextModuleHub` renders `<MockExamRunner />` while a run exists, the
  shell knows the two routes (`ZONE_ROUTES` + the new `STAGE_ROUTES`), and finishing or leaving a
  drill lands back on the list it was picked from. Verified end to end in a real browser.
- **The zone's ONE exit was missing on those same two pages** (they were never in `ZONE_ROUTES`),
  which is the visible difference in the founder's first two screenshots.
- **The Aufgabe toggle left the module row** for the chooser's own toolbar row (founder's bug 1).
- **Sticky touch-hover is gone app-wide:** `future.hoverOnlyWhenSupported` (founder's bug 2, the
  same law as s190's focus rings one input mode further).
- **One chooser for three modules:** `ModulePicker` owns the toolbar, `ChooserCard` is the one card,
  `ModuleTabs` the one switcher, and all four pages read module row → switcher → content.
- **A Verlauf on all four** (founder pick): the hub's Verlauf card was extracted to
  `features/pruefung/verlauf.tsx` and Lesen/Hören list their own sittings from it.
- **Re-verified after the `origin/main` merge**, not just before it: every gate green (652 tests,
  bundle 128.2 kB, contrast, content lint) and all four pages walked again at 360x640 and 1280x860,
  light and dark, including the full drill loop and both Verlauf states. `CLAUDE.md` came down 391 →
  383 lines (the merge had left one rule stated twice) but was still over its ~350 budget, which it
  had been since s198. (That debt was closed in s203; the file is 349 lines now.)

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
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

**Handoff after session 203 (2026-08-08): the docs are back inside their own rules.** Branch
`claude/documentation-maintenance-0w4ywg`. Founder prompt: "do the documentation maintenance".
No app code was touched, so nothing needs live verification.

- **`CLAUDE.md` is 349 lines** (was 399; the linter warns past ~350). It now carries the RULE plus a
  pointer, and nothing else. **Write to that shape:** if a new bullet needs a measurement, a
  mechanism or a story, that part goes in the matching `docs/areas/*` file and the "why" in
  `DECISIONS.md`. There is ~1 line of headroom, so any new law costs an old line somewhere.
- **Counts are measured, not remembered.** Five bank counts in `PROJECT_STATUS` and three claims in
  the area docs had drifted, some by 60 %. Every number in "Where things stand" is now stamped
  2026-08-08 and comes from `pnpm lint:content`. Re-run it before quoting any of them.
- **Nothing was reworded away.** The three laws that had no area-doc home were given one first
  (`CONTENT.md` for the `source` reply-genre rule and the phrase-level argumentation classifier, the
  `/design` skill §7 #12 for the touch-`:hover` law), so the trim removed duplication only.
- **Still open, small** (unchanged from s201): the Sprechen/Schreiben Verlauf spinner has no timeout,
  so an unreachable Supabase hangs it forever.
- **The next content job** is still the reply-task wave (writing-audit P4 replacement): 47 authored
  `source` texts plus the rendering slot that does not exist yet. The brief is in
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`, and the founder has not yet picked a
  placement from `preview/schreiben-source-text.html`.

**Handoff after session 202 (2026-08-08): a practice conversation now carries its Redemittel while
the learner speaks.** Branch `claude/sprechen-filter-rail-practice-70gydw`, PR **#830** →
squash-merged **`9c4ca3b`**. Validate content and Deploy site to GitHub Pages both green on `main`;
Deploy Supabase functions correctly did not run (path-filtered, nothing under `supabase/` changed).
Post-merge housekeeping done, tree clean.
Founder prompts: "for the sprechen part, I'd want you to add a filter rail kind of rail with useful
redemittle even in the practice sessions" → "option a's layout for desktop and option c for mobile
and also desktop's content".

- **What to check first:** the founder answered layout only, so three content defaults are stated
  and one-line reversible (`docs/DECISIONS.md` §s202): all eight phrases per intent, Anrede matched
  to the partner, English hold-to-peek. Ask if they want any flipped.
- `RedemittelHelp` is one content in two shells; `ConversationRunner` takes it as `help`, which is
  what keeps it out of the Modelltest and out of the exam chunk. Never import it in the runner.
- `ScopeRail.onReset` is now optional, for the one rail that browses rather than narrows. Every
  other caller is unchanged.
- **Not done, deliberately:** no speak button on a phrase (it would fight the partner's voice) and
  no way to send a phrase into the conversation (reading is not saying, and the transcript is what
  the debrief grades).

Older handoffs and session logs (s201 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
