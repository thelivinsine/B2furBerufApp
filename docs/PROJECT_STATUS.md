# Project Status

_Last updated: 2026-08-07 (session 199 ran the s181-queued writing-task QUALITY audit, then acted on
its top finding: Branche tags are earned or gone, the filter hierarchy inverts to
Lebensbereich → Thema → Branche in every rail, Branche locks where it has nothing, and the rails lost
their seams. Shipped as PR #824 / `66061c3` and PR #825 / `bf9db0b`, both deploys green. **P2 is the
next session's work**, spelled out under "Resume here")._

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

**Handoff after session 199 (2026-08-07): the audit shipped, its top fix shipped, and P2 is the
next session's work (founder: "I'll continue with the p2 and others in next session").**
Founder prompts: "what's next in the task list?" → "go ahead" → "go with your recommendation reg
branche. I prefer to have Berufsleben and Alltag as the first filter and then themen and only then
Branchen filter as the heirarchy of the filter rail all across. When a user selects a thema where
there is no branche specific content, just show the options within Branche as locked." → "no need of
design preview for the above mention rail changes" → "the header and footer of the filter rail seems
to look like separate pieces attached to the main body. remove the separator lines and make all the
filter rail same shade to look like one piece." → "document the session."

**Shipped:** PR **#824** (the audit report) → **`66061c3`**; PR **#825** (three commits: `acb21f7`
Branche cleanup, `7f5c464` rails, `40176d1` docs) → **`bf9db0b`**. Validate content and Deploy site
to GitHub Pages green on `main` for both. **Deploy Supabase functions did not run on `bf9db0b`, and
that is correct**: it is path-filtered to `supabase/functions/**`, `supabase/migrations/**` and its
own file, none of which this session touched. Housekeeping done after both merges.

### START HERE next session: audit P2

The one where the app currently punishes a learner for doing exactly what the brief asked.
**Six C1 Stellungnahmen at a 200-word target carry only descriptive Leitpunkte**, while `level` is
what tells `evaluate-writing` to "bewerte streng auf C1-Niveau":
`wt_conflict_l01`, `wt_conflict_l05`, `wt_conflict_l15`, `wt_conflict_l17`, `wt_conflict_l25`,
`wt_bildung_l10`.
1. **REPLACE the weakest descriptive point with a justification one; never add a fifth.** Four
   Leitpunkte in 200 words is already the exam shape, and `wt_conflict_l05` shows the pattern:
   "Beschreiben Sie das Problem / Zeigen Sie Verständnis / Schlagen Sie eine Regel vor / Sagen Sie,
   wer beschließen soll" has no point that forces an argument.
2. Then sweep the wider set: **20 of 35 `beschwerde`** and **9 of 54 `stellungnahme`** tasks carry no
   justification point either.
3. Then **gate it**, so it cannot come back: a `stellungnahme`, `forumsbeitrag` or `widerspruch` at
   B2 or above must carry ≥1 justification Leitpunkt. Anchor the check on the same phrase-level
   classifier the audit used, and **read §9 of the report first**: an opening-verb classifier is
   WRONG for German, because a separable prefix carries the meaning ("**Legen** Sie dar, warum …"
   scored as unargumentative and is exactly the opposite). Getting this wrong cost a re-run in s199.
4. Load `/content` before editing `writingPrompts.ts`; ids are permanent, so this edits fields only.

**Then, in priority order (all AI-shippable):**
- **P3:** retire `exam` from the schema (nothing reads it: not the trainer, not the evaluator, not a
  filter; the shipped-ids law protects ids, not fields), or fix its 69 out-of-band tags. Either way
  correct the `words` doc comment, which claims the target follows the exam shape when it is fully
  determined by (Niveau, Länge).
- **P4:** add `source` to the 71 reaction tasks (54 Stellungnahmen, 17 Forumsbeiträge), AFTER P2,
  because a quoted position is what makes a justification Leitpunkt answerable. No schema change.
- **P5:** the 19-item tail. 5 Textsorte re-tags (`wt_meetings_s05`, `wt_meetings_l17`,
  `wt_logistics_s13`, `wt_bildung_l03`, `wt_wohnen_l05`) and 14 Adressat/register fixes where `du`
  meets "Frau <Nachname>". About an hour.

**Two things to know before touching the rails again:**
- **The rail order lives INSIDE the rails** (`FilterRail` reorders its own `scopes` array), never in
  a caller. That is what s184 centralised and s199 kept; do not re-introduce per-surface ordering.
- **The lock lives in ONE place** (`ScopeSelect`'s row renderer + `ScopeLocked` in `ScopeRail.tsx`,
  plus `lockZero` on the Bibliothek's `ScopeMultiSelect`). It shipped WITHOUT a preview round at the
  founder's explicit waiver, so if they dislike the look it is a single-file change, not an
  eight-rail one. **Niveau moved below the hierarchy** on a literal reading of "Berufsleben and
  Alltag as the first filter"; flipping it back is one move per rail.

**Standing debt, unchanged:** P10 human content verification is still the only open s178 audit item
and is founder-owned (`pnpm review:queue` → decisions → `pnpm apply:reviews` → `pnpm stamp:verified`).
`verify:grammar` has still never run over the s198 sentences (no LanguageTool toolchain in this
sandbox). CLAUDE.md is **378 lines** against its ~350 budget, down from 380 despite three new rules;
the compression pass is worth finishing.

Gates on the merged work: lint:content 0 errors · typecheck · lint 0 errors (77 warnings) ·
**649 tests** · build · check:bundle 128.2 kB · check:contrast.

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

**Resume here:**
1. **P10 is the only open audit item** and it is the founder's: `pnpm review:queue` →
   decisions → `pnpm apply:reviews` → `pnpm stamp:verified`. Start with the ~166 core-frequency
   words and the Redemittel bank, the high-traffic surface.
2. **Not scheduled, deliberately:** §2.1's inverted sub-theme structure (eight workplace themes have
   no sub-themes, 59 % of words carry no `subThemeId`). Every new Unterthema drags the writing-task
   invariant behind it (≥2 tasks per Unterthema per length), so it is a session of its own.
3. CLAUDE.md is **380 lines** by the linter's count, still over its ~350 budget (377 before this
   session; two invariants in, four history paragraphs compressed out).

Older handoffs (s197 and earlier) are archived in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W32.md`.
