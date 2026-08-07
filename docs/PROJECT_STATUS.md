# Project Status

_Last updated: 2026-08-07 (session 200 made the four Ohne-Zeit module pages one product and fixed
the two dead ones: Lesen and Hören started runs nothing rendered. Handoff under "Resume here")._

## Session 200 log

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
  `tests/moduleScope.test.ts` forced this and 11-task Alltag pools cannot satisfy it by authoring.
- **The Niveau tag scales the word target and the AI grader's strictness, but not the task**: 236
  tasks (207 B2, 29 C1) ask for no justification, sharpest in 6 C1 Stellungnahmen at 200 words.
- **`exam` is dead metadata** (read by nothing) that contradicts `words`, and **`source` is unused on
  all 717 tasks**.
Full detail, the 19-item tail and the P1–P5 fix list are in the report; "Resume here" has the
decision P1 needs from the founder.

## Session 198 log

Founder: "what's next in the content audit plan?", then "build the frequency and part-of-speech
linter gates", then "except human review task, complete all the recommendations from this plan, push
them live and document the session".
**The content audit is closed except P10 (human review, founder-deferred).**
- **The 116 words that "could never be a cloze" were a matcher bug**, not a content gap: 25 start
  with an umlaut (JavaScript's `\b` is ASCII-only, so `\bÜberweisung` never matches) and 85 are
  verbs whose examples use a real verb form rather than the infinitive. `src/engine/blank.ts` is now
  the ONE blanking rule (it was four copies, all carrying both defects) and reads the Partizip II /
  Präteritum / zu-infinitive from `verbForms.ts`, which did not exist when the audit was written. It
  reports WHICH form it blanked, so distractors match the gap's shape. 116 → **0**, and the 67
  words with no resolving related term → **0**.
- **The three gates the audit's §5 asked for** are in `scripts/content-shape.mjs`, each a ratchet or
  floor anchored on the measured bank (never an invented target, which is how a gate gets disabled
  instead of obeyed). `tests/contentShape.test.ts` asserts each in both directions.
- **25 everyday verbs and adjectives** were authored to clear the part-of-speech floor: `digitales`
  had no verb and no adjective at all; `freizeit`, `behoerde` and `mobilitaet` had no adjective.
- **Reading texts stop repeating** (`progress.textsDone`, migration 0018).
Full detail in "Resume here"; the "why" is in `docs/DECISIONS.md` §s198.

## Session 197 log

Founder: "in one of the previous sessions, I asked sonnet to replace the hello greeting with the
page's name as a header ... But it created this funny looking page ... It is looking ridiculous at
the moment", then "C, medium".
**The Prüfung hub has ONE column now and no page title.** s196 had read "aligned to left vertically
with the toggle buttons" as the APP header's left gutter, which is a different left edge from every
control it was meant to line up with; the page under it nested three separately centred widths, so
nothing shared an edge with anything. A preview round
(`preview/pruefung-header-align.html`, artifact
<https://claude.ai/code/artifact/77b2bdcf-aa2d-431d-a45a-cd6ea9d16c49>) offered A (title in the
page), B (title in the header, page moves to its edge) and C (no title, the switcher IS the page
header, as in the Bibliothek). The founder picked **C at 640px**: the app header's greeting slot
stays empty on this route, and one `HUB_COL` (`max-w-[40rem]`) carries the switcher row, the scope
row, the module grid and the Verlauf card. The tile grid and the Stärkeprofil dropped their own
caps, because the column was measured from the TILES rather than the page.
**Full detail in "Resume here" below**, including the two resting scrolls this deliberately did not
fix and the CI/Pages situation around the merge. The "why" is in `docs/DECISIONS.md` §s197.

**A PARALLEL s197 branch ran at the same time** and shipped the mobile Bibliothek's soft bottom edge
plus the "Nach oben" button that was sitting behind the Üben CTA (PRs #818 and #820). Its handoff is
the first block under "Resume here"; the two branches touched no common source file, only the shared
docs, and every conflict was resolved by keeping BOTH sessions' facts. The prompt log labels them
**parallel A** (Bibliothek) and **parallel B** (Prüfung).

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
tags are unearned and the Niveau tag scales the word target without scaling the task. Its P1–P5 fix
list is open and starts with a founder decision.

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

**Handoff after session 199 (2026-08-07): the writing-task quality audit is done and needs ONE
founder decision (branch `claude/task-list-priorities-3f50ad`).**
Founder: "what's next in the task list?", then "go ahead".

- **The deliverable is `docs/reports/writing-tasks-audit-2026-08-07.md`.** No content and no code
  changed, deliberately: the top finding's fix starts with a decision that is the founder's.
- **The decision P1 needs.** The Branche tags are dishonest on a third of the bank because
  `tests/moduleScope.test.ts` requires all 15 Branchen on every theme at both lengths, and an
  11-task Alltag pool cannot represent 15 industries. Two options: **(a)** relax the floor for Alltag
  and delete the tags no brief earns (recommended: Branche is SOFT, untagged = universal, so nothing
  becomes unavailable and the surviving tags start meaning something), or **(b)** keep the floor and
  author ~199 sector-specific variants, which is a real authoring wave. Everything else in the fix
  list is AI-shippable without asking.
- **P2 is the one to ship first once P1 is answered** and it is small: add one justification
  Leitpunkt to `wt_conflict_l01/l05/l15/l17/l25` and `wt_bildung_l10` (replace the weakest
  descriptive point, never add a fifth), then sweep the 20 `beschwerde` and 9 `stellungnahme` tasks,
  then gate it (`stellungnahme`/`forumsbeitrag`/`widerspruch` at B2+ must carry ≥1 justification
  point). This removes the case where the grader punishes a learner for obeying the brief.
- **P3/P4/P5:** retire `exam` from the schema (nothing reads it; the shipped-ids law protects ids,
  not fields) or fix its 69 out-of-band tags and correct the `words` doc comment · add `source` to
  the 71 reaction tasks, AFTER P2, because a quoted position is what makes a justification Leitpunkt
  answerable · the 19-item tail (5 Textsorte re-tags, 14 Adressat/register fixes), about an hour.
- **Two heuristic corrections are recorded in the report's §9** so they are not re-made: an
  opening-verb demand classifier is wrong for German (it scored 9 of 11 `widerspruch` tasks as
  unargumentative because "**Legen** Sie dar, warum …" puts the verb's meaning in the separable
  prefix), and a thin Branche lexicon overstates the problem by 7 points.
- **Content edits from this report must load `/content` first** and will touch `writingPrompts.ts`
  plus the provenance rows; ids are permanent, so a re-tag edits fields and never renumbers a pool.
Gates: none run, and none needed. No source, content or migration file was touched, so
`lint:content` and the test suite are unchanged from `03ea3dc`.

**Handoff after session 198 (2026-08-07): the content audit is closed except P10
(branch `claude/content-audit-plan-mbiout`).**
Founder: "what's next in the content audit plan?", then "build the frequency and part-of-speech
linter gates", then "except human review task, complete all the recommendations from this plan, push
them live and document the session".

- **What was actually open.** P1–P9 were closed across s178/s181/s182/s185. What remained was P10
  (human verification, founder-gated and deferred), the §4 word-level residuals (116 words that
  could never produce a cloze/typed gap/listening item, 67 with no resolving related term), the §5
  closing observation that pedagogical shape has no gates, and §2.2's "Reuse" defect. The four §3.2
  LanguageTool defects were checked and are already fixed in the bank.
- **The 116 were a regex bug, and fixing the content would have been the wrong fix.** 25 of them
  start with an umlaut and JavaScript's `\b` is defined on ASCII `\w`, so `\bÜberweisung` can never
  match; 85 are verbs whose examples use a Perfekt or a finite form rather than the infinitive.
  Bending 85 natural German sentences into infinitives to satisfy a broken search would have made
  the content worse to make a report greener. `src/engine/blank.ts` is now the ONE rule (previously
  four copies: MCQ cloze, listening cloze, typed cloze, coverage report, every one carrying both
  defects) and it looks for the forms the sentences actually use, including the Partizip II /
  Präteritum / zu-infinitive from `verbForms.ts`. The blank REPORTS which form it took, so
  distractors are drawn in that same form ("gebucht" against "verschoben"/"abgesagt", never against
  a list of infinitives that gives the answer away). Only 15 separable verbs kept a genuine gap and
  got one example rewritten into a Perfekt or modal construction.
- **The three gates** (`scripts/content-shape.mjs`, run from `lint:content`): worth-learning (rare
  share **53.87 %**, no-corpus-evidence **100**), CEFR plausibility (hard: no `core`-frequency word
  at B2.2/C1; beginner-rare ratchet **32**), part-of-speech mix (**≥3 verbs AND ≥3 adjectives** per
  theme, noun share **77.59 %**). Every number is the measured bank on the day it landed, so nothing
  shipped is retroactively illegal, and raising one is a deliberate edit there with a reason.
  `tests/contentShape.test.ts` asserts each in both directions.
- **25 authored items** cleared the floors (digitales had 0 verbs and 0 adjectives; freizeit,
  behoerde, mobilitaet had 0 adjectives), all core-or-common frequency, which also serves P7's
  standing authoring rule. `verbForms.ts` and `frequency.ts` were regenerated for them
  (`build:verbs-subset` needs the npm registry, `build:frequency-subset` needs `pip install wordfreq`).
- **Reading freshness:** `progress.textsDone` + migration **0018**, unioned across devices like
  `scenariosDone`; the composer draws from unread texts and falls back to the full pool when all are
  read, so the block never disappears.
Gates: lint:content · lint:migrations · typecheck · lint 0 errors (77 warnings) · **647 tests** ·
build · check:bundle 128.2 kB · verify:facts 0 errors · verify:cefr FLAG 0.
`verify:grammar` was SKIPPED (the LanguageTool toolchain is not built in this sandbox; warn-only by
design), so the 40 new/edited German sentences have not been through Layer 3. Worth a run in a
session that has `pnpm build:languagetool` available.

**Shipped:** PR **#822**, squash-merged as **`03ea3dc`**. All three `main` workflows green on that
commit: Validate content, Deploy site to GitHub Pages and Deploy Supabase functions, whose "Apply
migrations" step ran and passed, so **migration 0018 is live on the database**. The Pages deploy did
NOT self-cancel, which is the s197 `timeout: 1800000` fix holding on its first real run.

**Resume here (s200):**
1. **Verify the four module pages live** (`/lesen`, `/hoeren`, `/simulation`, `/writing`): pick a
   text, finish the drill, check the score lands in the module's new Verlauf tab AND in the hub's
   Stärkeprofil. The sandbox cannot reach the deployed site.
2. **`/lesen` and `/hoeren` had NEVER worked since s196.** Nothing caught it because no test drives
   a chooser to a running drill. A route-level smoke test (start a run from each of the four
   choosers, assert something renders) is the cheap guard and is not written yet.
3. **The writing-task audit's P1 still needs a founder decision** (`docs/reports/
   writing-tasks-audit-2026-08-07.md`): drop the dishonest Branche tags, which means relaxing the
   all-15-Branchen invariant in `tests/moduleScope.test.ts`.
4. **P10 (human content review) is still the only open content-audit item** and it is the founder's:
   `pnpm review:queue` → decisions → `pnpm apply:reviews` → `pnpm stamp:verified`.
5. **Not scheduled, deliberately:** §2.1's inverted sub-theme structure. Every new Unterthema drags
   the writing-task invariant behind it, so it is a session of its own.
6. CLAUDE.md is ~**389** lines against its ~350 budget. It grew again this session (two invariants
   in); worth a compression pass.

Older handoffs (s197 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
