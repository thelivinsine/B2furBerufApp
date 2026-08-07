# Project Status

_Last updated: 2026-08-07 (session 198 closed the content audit except P10: the one blanking rule,
the three pedagogical-shape gates, 25 authored verbs/adjectives, and reading-text freshness. Handoff
under "Resume here")._

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
except P10** since s198.

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

**Resume here:**
1. **P10 is the only open audit item** and it is the founder's: `pnpm review:queue` →
   decisions → `pnpm apply:reviews` → `pnpm stamp:verified`. Start with the ~166 core-frequency
   words and the Redemittel bank, the high-traffic surface.
2. **Migration 0018 applies on the next merge to `main`** (the supabase workflow runs migrations
   before the function deploy). It is `add column if not exists`, so re-running is safe.
3. **Not scheduled, deliberately:** §2.1's inverted sub-theme structure (eight workplace themes have
   no sub-themes, 59 % of words carry no `subThemeId`). Every new Unterthema drags the writing-task
   invariant behind it (≥2 tasks per Unterthema per length), so it is a session of its own.
4. CLAUDE.md is **380 lines** by the linter's count, still over its ~350 budget (377 before this
   session; two invariants in, four history paragraphs compressed out).


**Handoff after session 197 (2026-08-06): the mobile Bibliothek list dissolves behind the Üben
button (branch `claude/mobile-floating-text-readability-bs49dz`).**
Founder, with a screenshot of the dark desktop list fading at its bottom edge: "can you put similar
effect even in the mobile view so that the floating text below the ueben button is more readable and
visible? generate a couple of previews", then "insert short fade but soft blur but not above the
blue button, it should be below the blue button behind the text."
- **The diagnosis.** That screenshot is a DESKTOP-only effect. Since s189 the browse list scrolls
  inside the content column, so `browseColumnClass` masks the column's bottom edge
  (`mask-fade-bottom`) and the cards dissolve into the page ground. A phone scrolls the PAGE, so
  there is no edge to mask: the cards ran at full strength behind the floating Üben button and the
  "Etwas verbessern? Feedback geben" line, which since s189 deliberately carries no plate of its own
  (a plate read as a frosted chip over white cards). The missing edge IS the unreadable text.
- **Round 1, previews only** (`preview/mobile-cluster-fade.html`, artifact
  <https://claude.ai/code/artifact/8bbc7f2e-d581-4767-84ee-a024380d0604>): four phone frames at the
  REAL cluster offsets and tokens, in both themes: today's baseline, a short fade, a long fade, and
  a fade plus blur, each with its cost stated.
- **Founder took the short fade AND the blur, with the blur kept below the button.** Two utilities
  in `src/index.css` (`.cluster-scrim`, a 7rem page-ground ramp; `.cluster-blur`, a 2rem frosted
  band masked at its own top), both rendered by `FloatingActionCluster`, `pointer-events-none`,
  border-free, `lg:hidden`, with the note raised to `z-[25]` above them. The band is exactly the gap
  between the nav and the button's lower edge, so it frosts the note strip and STOPS at the button.
  Neither reject comes back: no bar (s168), no band across the page (s169).
- **One tuning pass, from the real app** (Playwright over the global Chromium at 390x800, seeded
  store, both themes): the first ramp reached ~0.99 through the note strip and made the frosted band
  invisible, so it holds ~0.85 there instead, which is still AA because what shows through is a card
  within a few per cent of the ground. Only the four Bibliothek tabs mount this cluster, so no
  writing editor is dimmed. The preview gained a fifth "Shipped" phone so mockup and live agree.
Gates: typecheck · lint 0 errors (77 warnings) · 624 tests · build · check:bundle 129.8 kB ·
check:contrast · lint:content.
**Resume here:** nothing is open from this change. **CI never fired for PR #818** (no check run was
created minutes after opening, and the 16:22 `main` validate run was cancelled by the platform), so
every gate validate.yml runs was run locally instead; worth a glance at the post-merge run.
