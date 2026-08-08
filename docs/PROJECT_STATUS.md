# Project Status

_Last updated: 2026-08-08 (session 202 put the Redemittel a learner needs on screen WHILE they
speak. Session 201 made the four Ohne-Zeit module pages one product and fixed the two dead ones.
Both handoffs under "Resume here")._

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
  383 lines (the merge had left one rule stated twice); it is still over the ~350 budget it was
  already over at `66061c3` (378), so that older debt wants a pass of its own.

## Session 200 log

Founder: "what's next?" → "go ahead" → "is Text zur Aufgabe really necessary? in my B2 für Beruf exam
they just gave the topic overview and asked to write a forumsbeitrag ... can you research what is
more realistic".
- **P2, the fix that mattered.** An argumentative Textsorte at B2+ must now carry a Leitpunkt
  demanding a **reason, a consequence or a stance**, because `level` is what makes `evaluate-writing`
  mark strictly. **30 tasks fixed** (each REPLACING its weakest descriptive point), **110 gated**,
  one shared classifier for gate and test (`scripts/justification-markers.mjs`).
- **P3:** `exam` gone from 717 tasks, the interface and the types, with a guard against its return.
- **P5:** five Textsorte re-tags and the 14 du/Sie hybrids, both now gated.
- **P4 stopped, then closed.** The founder's own exam contradicted the audit, the published
  Modellsätze back the founder, and the report carries a correction. The supplied text belongs to the
  reply genre, so the honest target is the 47 "Antworten Sie" tasks, not the 71 opinion tasks.
  Nothing was changed, and the founder agreed: the reply wave is the next session's work.

## Session 199 log

Founder: "what's next in the task list?", then "go ahead".
**The writing-task quality audit is done, and its headline is: the tasks are well written, the tags
on them are not.** s181 closed the COVERAGE backlog (717 tasks, every Unterthema, Textsorte and
Branche represented); this audit asked whether the tags are EARNED.
- **The good news, measured first:** only 6 near-duplicate instruction pairs across 256,686
  comparisons (all same-theme, zero cross-theme), 2,355 distinct Leitpunkte of 2,691, zero Leitpunkte
  demanding a non-written act, and a demand ladder that genuinely rises with the Niveau tag.
- **Branche is a coverage artifact.** All 40 theme×length pools carry exactly 15 distinct sectors,
  the size of the `WorkSector` enum, assigned in enum order down the pool index, in pools as small as
  11 tasks. 199 of 600 tagged tasks (33%) carry no marker of the sector they claim.
  `tests/writingScope.test.ts` forced this and 11-task Alltag pools cannot satisfy it by authoring.
- **The Niveau tag scales the word target and the AI grader's strictness, but not the task**: 236
  tasks (207 B2, 29 C1) ask for no justification, sharpest in 6 C1 Stellungnahmen at 200 words.
- **`exam` is dead metadata** (read by nothing) that contradicts `words`, and **`source` is unused on
  all 717 tasks**.
Full detail and the P1–P5 fix list are in the report.

**Then the founder answered P1 and asked for two more things**, so the session shipped three commits:
- **P1, option (a): a Branche tag is EARNED or it is not there.** `scripts/sector-markers.mjs` is the
  ONE lexicon (shared by `lint:content` AND `tests/writingScope.test.ts`, so gate and test cannot
  drift); 331 unearned tag instances stripped, 220 tasks universal again, no id or task text touched.
  The all-15-Branchen floor is replaced by the property it only proxied for, plus a floor keeping
  Berufsleben real (≥8 of 15 sectors per pool). Nothing became unreachable: Branche is soft, and a
  test asserts every Branche still draws everywhere.
- **The filter hierarchy inverts, in all 8 rails:** Lebensbereich → Thema → Unterthema → Branche, then
  Niveau and Textsorte (founder: "Berufsleben and Alltag as the first filter ... all across"). Applied
  inside the rails, never by a caller.
- **Branche LOCKS instead of greying.** Its count is now the DEDICATED one, so a padlock means nothing
  is written for that industry on this Thema; when every option is locked, one line replaces the
  control. The engine keeps its untagged-=-universal fallback, so deep links still work.
- **The rails are one piece.** The header and footer were painting the accent wash on top of the
  tile's own, compositing darker, with a tinted rule under each seam. Both fills and both rules gone.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · **Prüfung** · Fortschritt, s182: Schreiben moved into the Prüfung hub),
the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-08-07, session 198, measured against the live banks — re-verify with
`pnpm lint:content` before quoting):** vocab **1,768** (**1,758 browsable**; 8 mis-filed noun+verb combos
retired in s142 + 2 true duplicates retired in s178, ids kept; +25 everyday verbs/adjectives in s198
for the part-of-speech floor, so the mix is **77.6 % noun / 13.6 % verb / 6.1 % adjective**) ·
collocations **1,072** ·
Redemittel **220** (s182: +62 Alltag phrases in 5 packs; 111 carry a `themeId`, 109 are universal;
18 categories) · grammar **32 topics / 195 drills** (18 groups; 37 productive, s182) · Lese-/Hörtexte **42** (126 checks) ·
writing tasks **717**, every one servable (s181) in 20 pools ·
Can-Do **57** · dialogues **30** (178 nodes, 335 options; every scenario ends in a free-speak turn since s182) · exam sets **15** · missions **6** ·
provenance **3,457 rows** (four concatenated parts since s182, TS2590) · themes **20** / sub-themes **46** (five new `alltag` themes in s126:
einkaufen/essen/mobilitaet/freizeit/digitales). Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **3,444 of 3,457 provenance rows are AI-drafted `draft`**; only **13** are
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

**Handoff after session 201 (2026-08-07): the four Ohne-Zeit module pages are one product, and
the two that did nothing work.** Branch `claude/ui-polish-consistency-56ja1y`, PR #827.
Founder prompts: four phone screenshots + "make these pages consistent and highly polished ... leave
no stone unturned ... some of the observed bugs: the header bar shouldn't have the aufgabe button /
shuffle button ... deactivates when tapped on empty spaces" → "either keep verlauf in every module or
remove it from all of the individual modules" → "go with verlauf on all four".

- **The reported shuffle bug was a dead page.** `/lesen` and `/hoeren` wrote a run into
  `useExamStore` and nothing rendered it (only the hub did), so every card and the draw did nothing;
  the "stuck" button was a touch-`:hover` that never cleared. `TextModuleHub` renders
  `<MockExamRunner />` now, `AppShell` has `STAGE_ROUTES`, and the chooser's `zoneExit` steps aside
  while the runner owns the exit, clearing only an exit that is still its own.
- **`ZONE_ROUTES` never had those two routes**, so they were the only screens in the zone without
  the header exit. Fixed with the same one-line law.
- **One chooser for three modules:** `ModulePicker` (frame + toolbar row), `ChooserCard` (one card
  anatomy), `ModuleTabs` (one switcher), `verlauf.tsx` (the Verlauf card, extracted from the hub so
  a chooser never imports it and drags the writing-prompt bank into `/lesen`).
- **`future.hoverOnlyWhenSupported`** is app-wide: a `hover:` fill can no longer read as an ON state
  on a phone. Any new toggle states its ON state in its own class, never as a hover fill.
- Verified in a real browser at 360x640 and 1280x860, light and dark: the drill loop end to end, the
  Aufgabe panel, the empty scope, both Verlauf states. Gates: typecheck · lint 0 errors · 652 tests ·
  build · bundle 128.2 kB · contrast · lint:content.
- **The header carries ONE control where there is a way out** (founder, same session): `quietHeader`
  drops the streak pill and the account menu wherever the zone exit shows, which the exam already
  did. The hub keeps both, because it is a nav destination and registers no exit.
- **Open, small:** `CLAUDE.md` is over its ~350-line budget (it was before this session too); the
  Sprechen/Schreiben Verlauf spinner has no timeout, so an unreachable Supabase hangs it forever.

Older handoffs (s200 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
