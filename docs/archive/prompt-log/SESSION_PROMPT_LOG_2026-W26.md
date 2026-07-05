# Session & Prompt Log — Archive 2026-W26 (2026-06-22 to 2026-06-28)

_Weekly archive slice of the append-only prompt log (ISO week 2026-W26). The maintenance rule and
entry template live in the live log `docs/SESSION_PROMPT_LOG.md`; the index of weekly files is
`docs/archive/prompt-log/README.md`. Left as written (append-only history)._

## Entry 31 — 2026-06-23 (automated provenance reference-URL checker)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what needs human verification?
  > [then:] yes
- **Response summary:** Explained the four-eyes verification gap (all 809 provenance rows are
  `review_status: "draft"`; the machine-assigned references are unchecked), then built the validator
  the founder approved. `scripts/check-provenance-refs.mjs` (`pnpm check:refs`) fetches every
  reference URL and flags dead links / wrong Wiktionary headwords (404) / missing Wikipedia articles /
  unknown DWDS entries; it dedups 809 rows → 701 unique URLs (629 status-checkable, 72 DWDS
  corpus-search flagged "not auto-checkable", 0 malformed) and exits non-zero on failure. This sandbox
  blocks outbound HTTPS (`x-deny-reason: host_not_allowed`), so it also ships a manual
  `workflow_dispatch` GitHub Action (`.github/workflows/check-refs.yml`) the founder can run from the
  Actions tab where egress is open. Verified the parse/dedup path locally with `--dry`. Honest scope:
  attests to "link is live", not "correct sense"; content accuracy still needs human review.
- **Artifacts:** `scripts/check-provenance-refs.mjs`, `.github/workflows/check-refs.yml`,
  `package.json` (check:refs alias), `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 32 — 2026-06-23 (in-app Sources & Licenses page)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you explain me what the current setup is when it comes to data checks and audit readiness? where can I see the data and the corresponding links for sources?
- **Response summary:** Explained the two checks (the `lint:content` gate run automatically on every
  PR/push, and the on-demand `check:refs` link checker) and the four audit-readiness pillars, then
  pointed at where the data lives (`src/data/*.ts`, register in `src/data/provenance.ts`). Since those
  are code files, offered a readable view; founder chose the in-app page (via AskUserQuestion). Built
  the auto-generated **"Sources & Licenses" page at `/sources`** (`src/features/legal/Sources.tsx`),
  generated entirely from the provenance register: traceability intro, upstream references (Wiktionary,
  DWDS, Wikipedia, CEFR) with licences + counts, our content's licence breakdown, and the full
  itemised list of all 809 items with a source link each, grouped by type in collapsible sections.
  Bilingual DE/EN (shared `LegalChrome`); linked from Settings + landing footer; surfaces any required
  attribution automatically. Lazy-loaded so the register stays out of the main bundle (main chunk
  unchanged at 124 KB gzip; register is a separate 24 KB-gzip chunk). `pnpm build` + typecheck green.
- **Artifacts:** `src/features/legal/Sources.tsx`, `src/router.tsx`, `src/features/settings/Settings.tsx`,
  `src/features/landing/LandingPage.tsx`, `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 33 — 2026-06-23 (first check:refs run + reference corrections)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the failed "Check provenance references" workflow run
- **Prompt (verbatim):**
  > this is what I get when I run the workflow [screenshot: step "Check provenance reference URLs" failed]
- **Response summary:** Pulled the Actions log via the GitHub MCP tools and triaged the 183 reported
  failures: the checker was too harsh, not 183 dead links. ~70 were HTTP 429 (Wikimedia rate-limiting
  at concurrency 5, valid pages), 33 were HTTP 403 (Council of Europe blocks bots), and 117 were
  genuine 404s (B2-Beruf compound nouns absent from Wiktionary, reflexive/particle verbs, headword bugs
  like gender pairs and "(Pl.)"/"(PSA)", 2 bad collocation DWDS lemmas, 1 wrong Wikipedia title). Fixed
  both: hardened the checker (concurrency 2, Retry-After, CEFR not-status-checkable, 429/403 → "could
  not verify" instead of failure) and re-pointed the 117 dead references via
  `scripts/fix-provenance-refs.mjs` (vocab/collocations → DWDS corpus search; Konnektoren grammar →
  de.wikipedia "Konjunktion (Wortart)"). Status-checkable set 629 → 517. `pnpm build` +
  `pnpm lint:content` green. Asked founder to re-run the workflow to confirm.
- **Artifacts:** `scripts/check-provenance-refs.mjs`, `scripts/fix-provenance-refs.mjs`,
  `src/data/provenance.ts`, `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR # appended on push/merge.

## Entry 34 — 2026-06-23 (check:refs second pass — clear the 26 stragglers)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I ran it again and still got an error
- **Response summary:** Pulled run #2's log: down to 26 failures (from 183), all genuine Wiktionary
  404s, the stragglers that were masked as HTTP 429 in run #1 and surfaced once the gentler checker
  stopped hitting rate limits (it reported zero 429s this time). Added the 26 vocab ids to the
  `fix-provenance-refs.mjs` DEAD_404 set and re-pointed them to DWDS corpus search. Total dead refs
  corrected across both passes: 143. Status-checkable set 517 → 491 (the remaining 491 all resolved
  cleanly in run #2, so the next run is expected green). `pnpm lint:content` + `pnpm build` green.
- **Artifacts:** `scripts/fix-provenance-refs.mjs`, `src/data/provenance.ts`,
  `docs/DATA_GOVERNANCE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit SHAs + PR #
  appended on push/merge.

## Entry 35 — 2026-06-23 (docs update + two strategy backlog items)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > now it's successful. Can you summarise what happened?
  > [then:] can you update documentation from this session and also add it to the tondo list the following items:
  > - a comprehensive end to end data strategy for the app
  > - a thorough and detailed visualization plan for all the learning components of the app
- **Response summary:** Confirmed `check:refs` run #3 is green (all 491 status-checkable references
  resolve; 143 dead refs corrected across runs #1–#2). Updated `docs/PROJECT_STATUS.md`: recorded the
  run #3 green result in the session 33 entry, added a session 34 entry, bumped the header to session
  34, and added two backlog items — **#22 comprehensive end-to-end data strategy** (`DATA_STRATEGY.md`
  umbrella over all data classes) and **#23 detailed visualization plan for all learning components**
  (`VISUALIZATION_PLAN.md`, per-component visual + data-viz specs) — plus mapped both in the
  model-guidance table. Docs-only change; no code.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 36 — 2026-06-23 (fix Wortschatz Kollokationen tab cut off on the right)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the collocations section within wortschatz is cut off to the right fix it
- **Response summary:** Diagnosed the Wortschatz tab row (`VocabularyTrainer`, 4 tabs) overflowing on
  narrow screens — the shared `TabsList` uses `overflow-x-auto` + `no-scrollbar`, clipping the
  rightmost "Kollokationen" tab with no visible scrollbar. Fixed by adding `flex-wrap` to that
  `TabsList` instance so the tabs wrap to a second row and all four stay visible. Local override; shared
  primitive untouched. `pnpm build` green.
- **Artifacts:** `src/features/vocabulary/VocabularyTrainer.tsx`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 37 — 2026-06-24 (fix collocation tiles overflowing right in Wortschatz)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the Wortschatz → Kollokationen tiles with the teal "formell" badge clipped at the right edge
- **Prompt (verbatim):**
  > I didn't ask about the tabs swtiches. I was talking about the tiles down below. see attached picture. fix it
- **Response summary:** Correct target this time: the collocation **tiles** (`CollocationsList`), not the
  tab row. Root cause: the tile grid was `grid gap-3 sm:grid-cols-2` — on mobile there is no explicit
  column count, so the grid used an implicit `auto` column sized by its widest content. The tile titles
  use `truncate` (`white-space: nowrap`) with no `min-w-0`, so the longest collocation phrase in the
  list forced the column wider than the viewport; every tile overflowed right and the rightmost element
  (the `formell` badge) was clipped at the screen edge. Fixed by (1) adding `grid-cols-1` so the mobile
  column uses `minmax(0,1fr)` and is capped to the container, and (2) adding `min-w-0`/`flex-1` down the
  tile's flex chain (grid item, text column, title row, title `<p>`) + `shrink-0` on the SpeakButton, so
  long titles truncate within the card instead of forcing width. The standalone `/collocations`
  (`CollocationsBrowser`) wraps its titles (no truncate) so it does not have this bug; left untouched.
  `pnpm build` green.
- **Artifacts:** `src/features/vocabulary/CollocationsList.tsx`, `docs/SESSION_PROMPT_LOG.md`. Commit
  SHA appended on push.

## Entry 38 — 2026-06-24 (match dedicated Kollokationen cards to the Wortschatz tile design)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you apply the same design as the tiles under the collocations within wortschatz menu to the collocations menu items as well?
- **Response summary:** Asked (AskUserQuestion) whether to match exactly or keep the browser's extra
  content; founder chose **keep extra content**. Restyled `CollocationsBrowser`'s `CollocationCard` to
  match `CollocationsList` (Wortschatz tab): truncating `font-semibold` phrase + always-visible
  speaker, muted non-italic English meaning, a `formell` badge top-right (replacing the indigo
  formal-card background), and a top-border divider with the italic German example in „…" quotes. Kept
  the example's English translation and its audio button (always visible). Removed the hover-reveal
  speaker state machinery. `pnpm build` green.
- **Artifacts:** `src/features/collocations/CollocationsBrowser.tsx`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 39 — 2026-06-24 (founder-only "verify + comment" overlay for the data-sources page)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want you to build an option to mark the data sources as verified and add any comments if necessary for the data sources pages - only to one user. is that possible?
- **Response summary:** Confirmed feasible. Asked (AskUserQuestion) about persistence + visibility;
  founder chose **Supabase** storage and **everything private** (admin-only). Built a founder-only
  review overlay on `/sources`: a new `provenance_reviews` table (migration 0004) locked by RLS to the
  founder's JWT email, a client gate (`src/lib/admin.ts` `isFounder`), a best-effort data layer
  (`src/lib/provenanceReviews.ts`), and admin UI in `Sources.tsx` (per-item "geprüft" checkbox + "Notiz"
  field, live verified count, save status, `verified/total ✓` group summaries). Public page unchanged.
  Documented the one-time migration step in `docs/PHASE2_SETUP.md`. `pnpm build` + `pnpm lint:content`
  green. **Requires founder to run migration 0004 in Supabase for saves to persist.**
- **Artifacts:** `supabase/migrations/0004_provenance_reviews.sql`, `src/lib/admin.ts`,
  `src/lib/provenanceReviews.ts`, `src/features/legal/Sources.tsx`, `docs/PHASE2_SETUP.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Entry 39 — 2026-06-25 (collocations tiles appear cut off)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of /collocations (Kollokationen) with a tile meeting the bottom tab bar.
- **Prompt (verbatim):**
  > the tiles are being cut off. fix it
- **Response summary:** Investigated the bottom clearance. The shared AppShell `<main>` already
  applies `.pb-nav` (`calc(3.9375rem + env(safe-area-inset-bottom) + 1.5rem)` = 63px bar + safe-area +
  24px), so the last tile clears the fixed bar by 24px. The screenshot shows the first two
  collocations with no filter (132 results), i.e. the top of the list mid-scroll, where the
  translucent fixed bar overlaps a passing tile (normal, universal behaviour). No clipping bug found;
  no code change. Asked the founder to confirm at the true bottom of the list, and offered to widen
  the comfort gap if the last tile still reads as cut.
- **Artifacts:** none (investigation only).

## Entry 40 — 2026-06-25 (account-creation button stays disabled)
- **Branch:** `claude/genauly-ai-strategy-8wrlcz`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of the "Konto erstellen" dialog: email + password filled,
  Turnstile "Success!", consent checked, but the submit button greyed out.
- **Prompt (verbatim):**
  > there seems to be a bug with account creation window. even after entering email and password the button below doesn't activate
  > check why is it and fix it.
- **Response summary:** Root cause was iOS Safari / password-manager **autofill not firing React's
  `onChange`**, leaving the controlled `email`/`password` state empty so `canSubmit` never became
  true. (The rendered Turnstile widget proved the captcha key is set and was solved; consent was
  visibly checked, so the credentials state was the only remaining gate.) Fix: a WebKit autofill hook
  via a no-op `@keyframes onAutoFillStart` on `input:-webkit-autofill` in `index.css`, with
  `AuthDialog` listening on `onAnimationStart` to copy the autofilled `ref.value` into state. Typing
  is unaffected. `pnpm build` green.
- **Artifacts:** `src/features/auth/AuthDialog.tsx`, `src/index.css`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`. Commit SHA appended on push.

## Session 39 — 2026-06-25 — Mobile card-grid overflow + remove prompt-logging hook
Branch: `claude/bug-attached-picture-fxgv5j`.

## Entry 41 — 2026-06-25 (mismatched quotation marks on collocation cards)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of /collocations (Kollokationen) example sentences.
- **Prompt (verbatim):**
  > there's a bug in the attached picture. check and tell me what it is
- **Response summary:** Diagnosed (no fix requested) the example sentences using **mismatched German
  quotes**: opening with `„` (U+201E) but closing with a straight ASCII `"` instead of the German
  closing `"` (U+201C), at `CollocationsBrowser.tsx:58` (`„{c.example.de}"`). Also confirmed the en
  dash `–` in the page subtitle is **not** a bug (the style guide bans only em dashes). Noted the same
  `„…"` pattern likely recurs in other card components and offered to sweep.
- **Artifacts:** none (diagnosis only).

## Entry 42 — 2026-06-25 (collocations tiles cut off on the right)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot of /collocations with cards bleeding off the right edge; the
  `formell` badge on "Protokoll führen" clipped to "for".
- **Prompt (verbatim):**
  > the collocations tiles are all being cut off to the right, do you see it?
- **Response summary:** Root cause: the card grid at `CollocationsBrowser.tsx:270` declared
  `sm:`/`lg:grid-cols-N` but **no base `grid-cols-1`**, so below the `sm` breakpoint CSS grid falls
  back to an implicit `auto` (max-content) single column that stretches to the widest card's longest
  unwrapped line and overflows the viewport. Added `grid-cols-1`. `pnpm build` green; committed to the
  branch.
- **Artifacts:** `src/features/collocations/CollocationsBrowser.tsx` (commit 41885c4).

## Entry 43 — 2026-06-25 (still happening → sweep the whole app)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** mobile screenshot still showing the right-edge cutoff.
- **Prompt (verbatim):**
  > it's still happening
  >
  > (then, via AskUserQuestion → "Also sweep other pages", plus:)
  > check through the app and apply the fixes everywhere where this is the case
- **Response summary:** Explained the earlier fix was on the feature branch, not on `main`, so the
  live site (which serves `main`) was unchanged. Then swept every responsive card grid missing a base
  column and added `grid-cols-1`: `ExamHub` (×2), `VocabList`, `GrammarDrillCard`, `GrammarHub` (×2),
  `LandingPage`, `QuizHub` (×2), `RedemittelTrainer`, `Settings`, `Dashboard` (hero + cards),
  `SimulationHub`, `WritingHub`, `Analytics` (`CollocationsList` and `Flashcards` already had a base
  count). `pnpm build` green. Shipped via PR #219 (squash-merged to `main`).
- **Artifacts:** 12 feature files; PR #219 (merge SHA ce0c6e2); session log PR #220 (merge SHA b69b011).

## Entry 44 — 2026-06-25 (log it; manual prompt-logging from now on)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes log it. but don't automatically log the prompt log. I'll prompt you from now on when to log it.
- **Response summary:** Logged Session 39 (the grid fix) in `docs/PROJECT_STATUS.md` only (new session
  entry, header date/branch, "Resume here" pointer) and shipped it via PR #220. **Preference recorded:**
  the prompt log (`SESSION_PROMPT_LOG.md`) is now updated **manually only when the founder asks**, never
  automatically.
- **Artifacts:** `docs/PROJECT_STATUS.md`; PR #220 (merge SHA b69b011).

## Entry 45 — 2026-06-25 (remove the prompt-logging hook)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > get rid of the hook - that's what I'm talking about
- **Response summary:** Removed the `UserPromptSubmit` auto-logging hook: deleted
  `.claude/hooks/log-prompt.sh`, set `.claude/settings.json` to `{}`, and updated the now-stale
  references in `CLAUDE.md` and this file's header. Kept `docs/prompt-log-raw.jsonl` as a historical
  record (no longer appended to). Shipped via PR #221.
- **Artifacts:** `.claude/hooks/log-prompt.sh` (deleted), `.claude/settings.json`, `CLAUDE.md`,
  `docs/SESSION_PROMPT_LOG.md`; PR #221 (merge SHA 5ea364d).

## Entry 46 — 2026-06-25 (why delete the raw log?)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > why to delete it?
- **Response summary:** Clarified there is no good reason to delete `docs/prompt-log-raw.jsonl`; it is
  a harmless static file now that the hook is gone and it is the authorship paper trail. Recommended
  keeping it. No change made.
- **Artifacts:** none.

## Entry 47 — 2026-06-25 (document this session)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > document the developments, preferences, and important prompts in this session
- **Response summary:** Extended the Session 39 entry in `docs/PROJECT_STATUS.md` (grid fix + hook
  removal + recorded preferences) and backfilled Entries 41–47 in this prompt log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 48 — 2026-06-25 (no save option on the source-review overlay)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > reg. the sources and the option to add notes and mark as verified, when I mark it verified and write something for a particular word, I have no option to save. Can you add the necessary features?
- **Response summary:** The s37 admin overlay auto-saved silently (verified on toggle, note on blur)
  with only a small global indicator, so it felt like there was no way to save. Added a per-row **Save**
  button (`src/features/legal/Sources.tsx`) that commits the `verified` flag + note together, disabled
  until dirty, showing `Speichern`/`Speichern…`/`Gespeichert ✓` and red `Nicht gespeichert` on failure;
  Enter in the note saves too. Made `AdminApi.onChange` return `Promise<boolean>` and only update the
  local cache on a successful write, so a failed save no longer looks saved. Bilingual DE/EN.
  `pnpm build` green.
- **Artifacts:** `src/features/legal/Sources.tsx`; PR #223 (merge SHA 014d44f).

## Entry 49 — 2026-06-25 (what is my action point?)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > explain me clearly what is the action point from my side
- **Response summary:** Explained the single action point: run the one-time Supabase migration
  `supabase/migrations/0004_provenance_reviews.sql` in the SQL editor (steps from
  `docs/PHASE2_SETUP.md` → "Admin source review"), because the saves write to the `provenance_reviews`
  table which must exist first. Gave step-by-step instructions and how to confirm it worked.
- **Artifacts:** none (explanation only).

## Entry 50 — 2026-06-25 ("Nicht gespeichert" — is it normal?)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of /sources admin rows showing red "Nicht gespeichert" next to Save, with
  a test note "it's asking me to login, should find a better source url" on a dwds.de item.
- **Prompt (verbatim):**
  > I'm getting something like "nicht gespeichert" Is it normal?
- **Response summary:** Clarified it is **not** OK: "Nicht gespeichert" means the save did not persist,
  the expected symptom when migration 0004 has not been run (the `provenance_reviews` table is missing).
  Asked whether the migration had been run and offered to paste the full SQL. Also noted the dwds.de
  login observation is a separate source-quality issue.
- **Artifacts:** none.

## Entry 51 — 2026-06-25 (Supabase task done, saving works)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > I did the supabase task and it's working well for me now
- **Response summary:** Confirmed the source-review feature is fully working now that migration 0004 is
  applied (marks persist to the founder's account, private, cross-device). Offered to log the session
  and to look into the flagged dwds.de source.
- **Artifacts:** none.

## Entry 52 — 2026-06-25 (add a task for source review + strategy)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > before doing the second item, can you add a task to deep-dive and properly review each of the sources used, their licenses and prepare a good source strategy as part of the data strategy?
- **Response summary:** Added **backlog #24** to `docs/PROJECT_STATUS.md`: deep-dive review of every
  external source, confirm licences/commercial-use terms, fix problem sources (incl. the dwds.de
  login item), reconcile against the SPDX allowlist, and define a ranked source strategy per content
  type. Cross-linked to #7 (audit infra) and #22 (data strategy). Deferred the actual dwds.de source
  swap under this item at the founder's request.
- **Artifacts:** `docs/PROJECT_STATUS.md`; PR #224 (merge SHA 04e9217).

## Entry 53 — 2026-06-25 (document this session before moving on)
- **Branch:** `claude/bug-attached-picture-fxgv5j`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > update necessary developments and prompts from this session in the relevant documentation files. I'll move on with a new session later.
- **Response summary:** Extended the Session 39 entry in `docs/PROJECT_STATUS.md` (Sources Save button +
  migration-0004 confirmation + backlog #24) and the "Resume here" pointer, and appended Entries 48–53
  to this prompt log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Session 41 — 2026-06-26 — Taxonomy & filtering redesign (research, deck, Mode layer, implementation plan)
Branch: `claude/theme-taxonomy-filtering-redesign-7q0gco`. Docs-only session; shipped via PR #231
(squash-merged to `main`, merge SHA `6fe25c7`).

## Entry 54 — 2026-06-26 (taxonomy research brief)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim — long structured brief, reproduced in a fenced block for fidelity):**
~~~~
# Prompt: Research & Redesign Theme Categorization and Filtering System for Language Learning App

You are a senior product strategist, learning experience designer, and taxonomy architect specializing in language-learning platforms.

## Context
We are building a highly ambitious language-learning app with broad scope and deep coverage across multiple learning modules, including: Vocabulary (Wortschatz), Collocations, Redemittel (functional phrases / expressions), Schreibtraining (writing practice).

The current categorization system in the app is limited and may not adequately support long-term scalability, discoverability, personalization, and advanced learning pathways. We want to redesign the entire taxonomy and filtering framework for these modules from first principles.

## Objective
Conduct deep research and provide a comprehensive recommendation for redesigning how themes/topics should be categorized and filtered across the modules listed above. [Goal: intuitive, pedagogically sound, scalable, flexible across modules, suitable for adaptive learning/personalization, easy layered filtering.]

## Research Scope
1. Benchmark Research (Duolingo, Babbel, Busuu, Lingoda, Goethe, TELC, CEFR, publishers, LMS/EdTech).
2. Theme Categorization Framework (theme/topic, difficulty A1–C2, CEFR, use case, domain/industry, skill type, formality, communication purpose, frequency/usefulness, grammar dependency, linguistic complexity).
3. Multi-Layer Filtering System (Core / Contextual / Linguistic / Learning filters; essential vs optional vs advanced).
4. Theme Hierarchy Design (number of broad themes, sub-themes, deeper categories; ideal depth; Broad → Sub → Micro example).
5. Module-Specific Considerations (should all modules share one taxonomy? module-specific layers? standardization vs customization?).
6. Important Parameters We May Be Missing (learner motivation, intent-based navigation, progression pathways, search behavior, content tagging strategy, AI personalization, content expansion readiness, cross-module linking).

## Deliverables
Provide a detailed report in the format of a professional slide deck. [Slide 1 Executive Summary; 2–4 Benchmark Analysis; 5–7 Core Taxonomy Principles; 8–12 Proposed Theme Architecture; 13–16 Proposed Filtering System; 17–19 Module-Specific Recommendations; 20–22 Risks & Tradeoffs; 23–25 Final Recommendation.]

## Output Requirements
- Be extremely detailed and analytical; structured frameworks and tables; visual hierarchy examples; explain tradeoffs; recommendations backed by research; both learner UX and backend content architecture perspectives; prioritize long-term scalability and excellence. Challenge assumptions and propose better approaches where necessary.
~~~~
- **Response summary:** Audited the live taxonomy in code (11 flat themes on one shared `ThemeId`, three
  incompatible per-module taxonomies, no CEFR field, single-dropdown filter) and wrote a 25-slide
  research/strategy deck recommending a faceted model + shallow Domain→Theme→Sub-theme hierarchy +
  progressive faceted filtering, grounded in the current code.
- **Artifacts:** `docs/TAXONOMY_REDESIGN.md`; first commit on the branch.

## Entry 55 — 2026-06-26 (where to access the deck)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > are you done with all the tasks from the above promp? where can i access the slide deck?
- **Response summary:** Confirmed the research deliverable was complete; pointed to
  `docs/TAXONOMY_REDESIGN.md` on the branch (GitHub-rendered) and offered other formats. Was honest that
  it was delivered as a markdown "slide deck", not a real presentation file.
- **Artifacts:** none (existing `docs/TAXONOMY_REDESIGN.md`).

## Entry 56 — 2026-06-26 (too technical; review robustness; plain language; mockups)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > the content of the ppt is too technical and dry. First, review your work if the analysis is robust. And then, explain the slides better for a non-tech person? Also, generate previews and inlcude screenshots with several examples of how the app looks when implemented the ideas from the ppt.
- **Response summary:** (1) Stress-tested the analysis (re-verified core claims against the code; flagged
  the soft spots: benchmarks not freshly web-sourced, the "15,000 slices" combinatorics oversells given
  sparsity). (2) Rewrote the deck in plain language with a supermarket analogy. (3) Built 6 app mockups
  in `preview/taxonomy/` (HTML in the app's brand tokens, screenshotted with the bundled Chromium) and
  generated a real **.pptx** (python-pptx) embedding them. Fixed a real bug where multi-line callouts
  stored literal newlines that PowerPoint would collapse.
- **Artifacts:** `docs/TAXONOMY_REDESIGN.pptx`, `preview/taxonomy/*` (01–06 + app.css), updated
  `docs/TAXONOMY_REDESIGN.md`.

## Entry 57 — 2026-06-26 (link to ppt)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > give me the link to ppt
- **Response summary:** Gave the GitHub blob + raw download links for `docs/TAXONOMY_REDESIGN.pptx` on the
  branch (noting GitHub can't preview .pptx and the repo is private), and re-sent the file directly.
- **Artifacts:** none.

## Entry 58 — 2026-06-26 (add Work/Personal/Both Mode; deep research)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > I really like the analysis and suggestions. I want to add a further broader category/mode - Personal life vs Work vs Both. Once the user selects one of the modes, then all the category/filters with the recommended tree system and build the backbone. When work mode is chosen, the user should be able to select a wide range of categories like work sector, kind of tasks, typical work place situations, department specific, etc. I'm just blurting out my ideas. Can you do a deep research on how to integrate this idea into your analysis and update the ppt?
- **Response summary:** Ran real web research (telc/BAMF *Rahmencurriculum für den Beruf*, DeuFöV sector
  modules, telc *Deutsch Pflege*, Babbel/Duolingo onboarding) that validated the idea. Integrated a
  top-level **Work/Personal/Both Mode** lens (lens-not-wall) with work-only facets (sector, situation,
  counterpart, task type). Added a new Mode section to the deck (now 35 slides), two new mockups
  (onboarding Mode picker + Work-mode browser), and a full technical addendum to the markdown.
- **Artifacts:** updated `docs/TAXONOMY_REDESIGN.pptx` + `.md`, `preview/taxonomy/07-mode-onboarding.html`,
  `08-work-mode.html` + screenshots.

## Entry 59 — 2026-06-26 (add all research sources to the ppt)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you make sure to add all the sources from your research in the ppt?
- **Response summary:** Added two **References** slides (deck now 37 slides) listing the 10 research
  sources as clickable hyperlinks (primary telc/BAMF/DeuFöV + CEFR; secondary Babbel), with an honesty
  note distinguishing cited claims from general product knowledge. Mirrored the source list into the
  markdown addendum.
- **Artifacts:** updated `docs/TAXONOMY_REDESIGN.pptx` + `.md`.

## Entry 60 — 2026-06-26 (make an implementation plan)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > Make an implementation plan for the taxonomy redesign of genauly. Provide the plan with detailed instructions and an executive summary of each section of the plan.
- **Response summary:** Entered plan mode; read the settings store, content linter, onboarding flow and
  cloudSync to ground the plan in real integration points (found `goal`/`level` already in the store,
  cloudSync auto-syncs new keys, the linter's mirror-array pattern, the reusable onboarding `SelectRow`).
  Drafted a staged 5-phase implementation plan with an executive summary per phase.
- **Artifacts:** plan file (later written to `docs/TAXONOMY_IMPLEMENTATION_PLAN.md` in Entry 63).

## Entry 61 — 2026-06-26 (decisions 1A/2A + install plugins request)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > 1A, 2A. Before you provide with the plan, can you install fallow and ponytail agents/plugins and then provide the updated plan?
- **Response summary:** Recorded the decisions (full 5-phase plan; `mode` as a separate axis from
  `goal`). Was honest that I **cannot** install "fallow"/"ponytail": no install tool is available, they
  are not in the session's agent list, and I could not verify they exist; explained plugin install is
  founder-driven via the client's `/plugin` flow. Noted the plan already reflected 1A/2A.
- **Artifacts:** none.

## Entry 62 — 2026-06-26 (give me the questions)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > give me the questions
- **Response summary:** Re-presented the two clarifying questions in text (plan depth: full 5-phase vs
  first-milestone-only; and how `mode` relates to the existing `goal` field) after the interactive
  question tool had errored. Founder had already answered 1A/2A.
- **Artifacts:** none.

## Entry 63 — 2026-06-26 (write the plan to docs + merge to main)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you write the plan in the docs folder and merge to main along with the analysis ppt?
- **Response summary:** Wrote the approved plan to `docs/TAXONOMY_IMPLEMENTATION_PLAN.md` (with a doc
  header + cross-link from the redesign deck), committed it, opened **PR #231** and squash-merged the
  whole taxonomy effort (deck `.md` + `.pptx`, plan, `preview/taxonomy/` mockups) into `main`. Ran the
  post-merge realignment (reset branch to `origin/main`, force-with-lease). Docs-only; nothing built.
- **Artifacts:** `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/TAXONOMY_REDESIGN.md`; PR #231 (merge SHA
  `6fe25c7`).

## Entry 64 — 2026-06-26 (document this session)
- **Branch:** `claude/theme-taxonomy-filtering-redesign-7q0gco`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > update the documentation for this session
- **Response summary:** Added the **Session 41** entry to `docs/PROJECT_STATUS.md` (research deck + Mode
  layer + implementation plan, all merged via PR #231), updated the `_Last updated_` header and tied the
  work into backlog #5 (domain/sector filtering, now scoped), and appended Entries 54–64 to this prompt
  log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

---

## Session 42 — 2026-06-27 — Taxonomy redesign Phases 0–2 implemented & shipped
Branch: `claude/taxonomy-redesign-qp2euj`. First build session on the approved
`docs/TAXONOMY_IMPLEMENTATION_PLAN.md`. (Entries 65–66 were given before a context compaction and are
backfilled from the session summary so the trail is complete.)

## Entry 65 — 2026-06-27 (start implementing the taxonomy plan)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you start implementing the taxonomy redesign plan by referring relevant documentation?
- **Response summary:** Began Phase 0 + Phase 1 (the plan's recommended first milestone). Phase 0: added
  the faceted types (`DomainId`, `LearningMode`, `ContextTag`, `ContentCefr`, `Frequency`, `WorkSector`,
  `Counterpart`, `WorkSituation`, `TaskType`) and optional facet fields to `src/types/index.ts`, the
  `src/data/domains.ts` registry (6 domains), `domain`/`context` on all 11 themes, `mode` in
  `useSettingsStore`, and matching linter mirror-arrays/validations. Phase 1: tagged all 515 vocab + 396
  collocations with `cefr`, added the onboarding Mode step, the header `ModeSwitcher`, the CEFR Level
  filter in `VocabularyTrainer` (`filterVocab`), and the quiz CEFR relabel. Committed on the branch.
- **Artifacts:** `src/types/index.ts`, `src/data/domains.ts`, `src/data/themes.ts`,
  `src/store/useSettingsStore.ts`, `scripts/lint-content.mjs`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/features/onboarding/Onboarding.tsx`,
  `src/components/layout/ModeSwitcher.tsx` (new), `src/components/layout/AppShell.tsx`,
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/quiz/*`, `src/engine/quiz.ts`; later
  shipped via PR #233.

## Entry 66 — 2026-06-27 (also read CLAUDE.md for context)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > read relevant sections of claude.md as well for context
- **Response summary:** Read the content-conventions, writing-style (no em dashes) and workflow sections
  of `CLAUDE.md` and applied them to the Phase 0/1 work (linter mirror-array pattern, em-dash-free copy,
  auto-ship workflow). No separate artifact; informed Entry 65's implementation.
- **Artifacts:** none (context only).

## Entry 67 — 2026-06-27 (is it live?)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > is it live?
- **Response summary:** Explained that feature-branch work does not deploy until merged to `main`, then
  opened **PR #233** (Phase 0+1) and squash-merged it so the Pages deploy runs. Ran the post-merge
  realignment (reset branch to `origin/main`, force-with-lease).
- **Artifacts:** PR #233 (merge SHA `ebacbbd`).

## Entry 68 — 2026-06-27 (what changes should I see?)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > what changes am I supposed to see in the app
- **Response summary:** Listed the visible changes: the onboarding Mode step, the header Mode pill, the
  CEFR Level dropdown in the Vokabeltrainer, and the CEFR labels on the quiz level cards. Noted the
  taxonomy foundations are under the hood.
- **Artifacts:** none (answer only).

## Entry 69 — 2026-06-27 (I don't see the changes)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > I don't see any of these changes
- **Response summary:** Checked the GitHub Actions runs for `main` and confirmed the deploy for merge
  commit `ebacbbde` completed successfully, so the changes are live. Advised a hard refresh (PWA service
  worker cache) and noted onboarding only shows for new users.
- **Artifacts:** none (diagnosis only).

## Entry 70 — 2026-06-27 (gap analysis of Phase 0 & 1)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you do a gap analysis of what's in the plan vs what's implemented for phase 0 & 1?
- **Response summary:** Verified each plan item against the code and reported: Phase 0/1 functionally
  complete; three minor Phase-0 misses (`ExamTheme.subThemes?` field, `SubThemeId` alias, unvalidated
  `WorkSituation`/`TaskType`); two substantive carry-overs (CEFR tags AI-drafted not human-verified;
  `mode` persisted but no content effect yet).
- **Artifacts:** none (analysis only).

## Entry 71 — 2026-06-27 (close the Phase-0 misses)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes, go ahead and give your best
- **Response summary:** Closed the Phase-0 checklist tail: added the `SubThemeId` alias + `SubTheme`
  interface + `ExamTheme.subThemes?`, and wired `workSituation?`/`taskType?` as real validate-when-present
  facets (peers of `sector`/`counterpart`) with `WORK_SITUATIONS`/`TASK_TYPES` linter arrays + theme
  `subThemes` structural checks. Typecheck/lint/build green; shipped via **PR #234**.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`; PR #234 (merge SHA `3c21360`).

## Entry 72 — 2026-06-27 (start Phase 2)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes, go ahead and do your best
- **Response summary:** Implemented Phase 2 (sub-themes). Added `subThemes` to `behoerde` (4),
  `customer` (3) and `meetings` (3); tagged 122 vocab + 105 collocations with `subThemeId` (cross-cutting
  items left to roll up); built the `SubThemePicker` drill-down with `?sub=` + breadcrumb in
  `VocabularyTrainer`; added `vocabBySubTheme`/`collocationsBySubTheme` + a `sub` option on `filterVocab`;
  and made the linter cross-validate every `subThemeId` against its theme. Shipped via **PR #235**, then
  logged **Session 42** in `docs/PROJECT_STATUS.md` (**PR #236**). Counts reconcile to each theme total.
- **Artifacts:** `src/data/themes.ts`, `src/data/vocabulary.ts`, `src/data/collocations.ts`,
  `src/features/vocabulary/SubThemePicker.tsx` (new), `src/features/vocabulary/VocabularyTrainer.tsx`,
  `scripts/lint-content.mjs`, `docs/PROJECT_STATUS.md`; PR #235 (merge SHA `59b9e62`), PR #236
  (merge SHA `1355ea0`).

## Entry 73 — 2026-06-27 (update the documentation so far)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > update the documentation so far
- **Response summary:** Brought the long-lived docs in line with Phases 0–2. Added a "Taxonomy layer"
  bullet to `CLAUDE.md` (domains, sub-themes, facets, `mode`, linter validations, filter helpers), fixed
  the stale collocations count (132 → 396) and added the facet fields to the schema notes; marked Phases
  0/1/2 SHIPPED and Phase 3 NEXT in `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`. Shipped via **PR #237**.
- **Artifacts:** `CLAUDE.md`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`; PR #237 (merge SHA `590794c`).

## Entry 74 — 2026-06-27 (is the prompt log updated?)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > is prompt log also updated?
- **Response summary:** It was not, so appended the **Session 42** block (Entries 65–74) to this log,
  covering every founder prompt of the session with its artifacts and merge SHAs, and shipped it.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`; PR #238.

## Entry 75 — 2026-06-27 (standing rule: docs updates include the prompt log)
- **Branch:** `claude/taxonomy-redesign-qp2euj`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > you should update prompt log as well when I say update documentation along with others. I may not be too explicit about it.
- **Response summary:** Encoded the standing preference so future sessions honour it without being told
  explicitly: amended the **Documentation** and **Prompt & session log** rules in `CLAUDE.md` to state
  that any "update the documentation"-type request implies updating `docs/SESSION_PROMPT_LOG.md` too (plus
  any stale plan/CLAUDE.md docs), and mirrored the rule in this log's "How this log is maintained" header.
- **Artifacts:** `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md`; PR #239.

## Session 43 — 2026-06-27 (Taxonomy Phase 3a: mode-aware intent cards)

## Entry 76 — 2026-06-27 (continue with the taxonomy plan, next phase)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue with the taxxonomy review plan next phase
- **Response summary:** Started **Phase 3** of the taxonomy plan. Phase 3 is large and its Work-mode
  facets (sector/workSituation/counterpart) have **zero tagged content**, so I shipped the cleanest,
  highest-value slice first: **step 4, the mode-aware intent/goal cards**. Added
  `src/features/dashboard/intentCards.ts` (7 starting-point cards, each with a pre-built filter bundle +
  deep-link, `intentCardsForMode()` lens filter, and live `filterVocab`-based word-count/CEFR-range meta)
  and rendered them as a new "Was möchtest du üben?" section atop the dashboard. This gives `mode` its
  **first real content effect** (switching the header Mode pill now changes which cards show). `pnpm
  lint:content` + `pnpm build` green. Documented the remaining Phase 3b work (shared faceted filter,
  register unification, and the Work-facet content back-fill) in the plan + status doc.
- **Artifacts:** `src/features/dashboard/intentCards.ts` (new), `src/features/dashboard/Dashboard.tsx`,
  `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #240.

## Entry 77 — 2026-06-27 (continue: Phase 3b)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > yes, continue
- **Response summary:** Shipped **Phase 3b**: register unification + the reusable faceted filter, first
  integration. Widened `Collocation.register` to `neutral|formal|diplomatic` (linter + card badge).
  Built **`src/features/shared/FacetSheet.tsx`**, a generic slide-up filter sheet (on `dialog.tsx`,
  overridden to a bottom sheet) with multi-select pills showing live counts and greyed zero-yield
  options (AND-across / OR-within; exports `matchesFacets`/`applyFacets`/`activeFacetCount`). Wired it
  into the **CollocationsBrowser** with CEFR + Register facets (`?cefr=`/`?register=`) and removable
  active-filter chips. Collocations had no level/register filtering before. `pnpm lint:content` +
  `pnpm build` green. Documented remaining 3c (vocab + redemittel integration, then the Work-facet
  back-fill).
- **Artifacts:** `src/features/shared/FacetSheet.tsx` (new), `src/features/collocations/CollocationsBrowser.tsx`,
  `src/types/index.ts`, `scripts/lint-content.mjs`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #241.

## Entry 78 — 2026-06-27 (sector back-fill, then continue)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > start with sector back-fill and then continue with the plan
- **Response summary:** Flagged that the `sector` facet had no taggable content (existing vocab is
  generic office German) and asked how to populate it; founder chose **author a real Pflege pack**. Then
  (1) **sector back-fill (PR #242):** authored a 13-word care/Pflege vocab pack spread across existing
  themes so `sector` cuts across topics, tagged a curated set of `office` words, added 13 provenance
  rows (vocab 515→528); (2) **Phase 3c:** wired the `FacetSheet` into the VocabularyTrainer with CEFR +
  Wortart facets and the Work-mode **`sector` ("Branche") facet shown only when `mode === "work"`** (state
  in `?cefr=`/`?pos=`/`?sector=`, removable chips). So the Work-mode facets are now functional end to end.
  `pnpm lint:content` + `pnpm build` green throughout. Updated CLAUDE.md content counts + the plan/status
  docs; documented the remaining polish (redemittel faceting, workSituation/counterpart tagging).
- **Artifacts:** `src/data/vocabulary.ts`, `src/data/provenance.ts`, `src/features/vocabulary/VocabularyTrainer.tsx`,
  `CLAUDE.md`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`;
  PRs #242 (back-fill) + #243 (3c).

## Entry 79 — 2026-06-27 (dashboard: lead with intent tiles, slim the progress block)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** dashboard screenshot (focal "Zeit zum Wiederholen" hero + status strip).
- **Prompt (verbatim):**
  > I now understand what the dropdown on the top does - it changes the tiles in was moechtet du ueben. But the problem with the dashboard is that there is the attached progress section which is taking up too much space. My suggestion is that you move this all to Fortschritt section. You can just put a very small summarized section below the was moechtet du ueben tiles so that the user sees these tiles the first thing. It's okay to keep the position and promising of the dropdown pill intact. After this is done, go ahead with the plan.
- **Response summary:** Restructured the dashboard so the **"Was möchtest du üben?" intent tiles come first**.
  Removed the large focal hero block + the four-stat status strip + level progress bar (all of which is
  already on the Fortschritt/Analytics page, so nothing was lost). Replaced them with **one compact
  summary strip below the tiles** (streak · today XP/goal · days-to-exam · the recommended primary action
  + a "Fortschritt" link to the full breakdown). Mode pill placement/prominence left intact. `pnpm build`
  green. Then continued with the plan: shipped the dashboard restructure as **PR #244**, then wired a
  Register filter into the Redemittel browse view (**PR #245**).
- **Artifacts:** `src/features/dashboard/Dashboard.tsx` (PR #244); `src/features/redemittel/RedemittelTrainer.tsx`
  (PR #245); `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Entry 80 — 2026-06-27 (continue: workSituation facet)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue with the plan now
- **Response summary:** Tagged **`workSituation`** on a cross-cutting set of vocab (`shift-handover` for
  the care shift words, `instructions` for safety/hygiene, `meeting`, `customer-call`) and exposed it as a
  **second Work-mode facet "Situation"** in the Vokabeltrainer next to "Branche" (both appear only when
  `mode==="work"`; state in `?workSituation=`). Made the honest call to **leave `counterpart` 0-tagged**
  (redemittel are general-purpose, so counterpart tags would be low-signal guesswork; documented to author
  counterpart-specific variants later if wanted). Refreshed the stale CLAUDE.md taxonomy + Vokabeltrainer
  UI notes. `pnpm lint:content` + `pnpm build` green. Phase 3 is effectively complete; **Phase 4** is next.
- **Artifacts:** `src/data/vocabulary.ts`, `src/features/vocabulary/VocabularyTrainer.tsx`, `CLAUDE.md`,
  `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #246.

## Entry 81 — 2026-06-27 (continue: Phase 4 cross-module Related panel)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue with the next step.
- **Response summary:** Started **Phase 4** with step 1, the cross-module **"Verbunden" panel**
  (`src/features/vocabulary/RelatedPanel.tsx`). In the Vokabeltrainer Übersicht list each word now expands
  to show matching content from the other banks via the shared `themeId`/`subThemeId` join key: a
  Kollokation (same sub-theme if available, else theme), the theme's Schreibtraining prompt, and a Dialog,
  each deep-linking to the right browser. No hand-maintained id lists. Redemittel are not linked (they
  carry no `themeId`). `pnpm build` green. Documented remaining Phase 4 (mode/level-aware SRS review,
  writing-coach deep-links).
- **Artifacts:** `src/features/vocabulary/RelatedPanel.tsx` (new), `src/features/vocabulary/VocabList.tsx`,
  `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`; PR #247.

## Entry 82 — 2026-06-27 (continue: Phase 4 steps 2 + 3)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > continue working with step 2 and 3
- **Response summary:** Finished **Phase 4**. **Step 2 (mode/level-aware review):** added a pure
  `reviewWeight()` to `src/engine/srs.ts` and rebuilt `QuickRevision`'s deck so the Schnellwiederholung is
  weighted by the Mode lens (theme `context`), card weakness (low mastery), and the learner's weakest CEFR
  band (computed from started cards). Weighted, not walled. **Step 3 (writing-coach deep-links):** added
  `practiceRoute()` to `practiceAreas.ts` and used it in `WritingHub` so the "Üben" button folds the
  prompt's `theme` into the deep-link (theme-aware `/vocabulary`/`/collocations`/`/quiz`; formal Redemittel
  for the register weakness). `pnpm build` green. **The taxonomy redesign (Phases 0–4) is now fully shipped.**
- **Artifacts:** `src/engine/srs.ts`, `src/features/revision/QuickRevision.tsx`, `src/data/practiceAreas.ts`,
  `src/features/writing/WritingHub.tsx`, `docs/TAXONOMY_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md`; PR #248.

## Entry 83 — 2026-06-27 (pause + update documentation)
- **Branch:** `claude/taxonomy-review-next-phase-ynw1lt`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > pause here. update documentation
- **Response summary:** Closing-pass on the docs for session 43. Fixed the leftover `PR #TBD` placeholders
  (Entries 79/81/82 → PRs #244/#247/#248), added a **Session 43** summary block to `docs/PROJECT_STATUS.md`
  (taxonomy Phases 3–4 + dashboard restructure, PRs #240–#248), and confirmed `CLAUDE.md`
  (counts/facets/UI) and `docs/TAXONOMY_IMPLEMENTATION_PLAN.md` are current. No app code changed.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

## Session 44 — 2026-06-28 — Session-43 review, dark-mode fix, filter-harmonization plan
Branch: `claude/review-previous-session-69pxat`.

## Entry 84 — 2026-06-28 16:57 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > can you make sure all the changes in the previous session are all well done as per the plan? fix any bugs you may find and make sure all the updates are both computer and mobile friendly.
- **Response summary:** Reviewed all of session 43 (taxonomy Phases 3–4, PRs #240–248) against the
  documented plan. Installed deps and confirmed `pnpm typecheck` + `pnpm build` + `pnpm lint:content`
  all green. Read every new/changed file (FacetSheet, intent cards, Dashboard, Work-mode facets,
  RelatedPanel, adaptive QuickRevision, `practiceRoute`, SubThemePicker) and verified each matches the
  plan and is responsive on mobile + desktop. Found and fixed one latent mobile bug: the `FacetSheet`
  bottom sheet inherited `overflow-y-auto` on the whole container, so on a short viewport the "Apply"
  button scrolled away. Constrained the grid to `[auto auto minmax(0,1fr) auto]` so only the facet list
  scrolls and the footer stays pinned.
- **Artifacts:** `src/features/shared/FacetSheet.tsx`; commit `0c3bd71` (pre-fix), PR #250; merge `0ed2190`.

## Entry 85 — 2026-06-28 17:25 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (Kollokationen page in dark mode showing bright-white filter pills, verb chips and scroll arrows).
- **Prompt (verbatim):**
  > there's a problem with dark mode here. look for such bugs all across the app and fix and auto deploy
- **Response summary:** Diagnosed the root cause beyond the reported pills: **Tailwind's opacity scale
  only contains multiples of 5, so any color utility using `/8` or `/12` silently failed to compile**
  (confirmed via an isolated Tailwind run and by grepping the production CSS, zero rules emitted). Two
  effects in dark mode: `bg-white dark:bg-white/8` elements lost their dark override and fell back to
  bright white; every `/12` tint (badges, stat cards, header streak/level pills, exam/simulation/
  onboarding icon boxes, RelatedPanel chips) rendered with no background. Bumped all `/8` and `/12`
  color-opacity utilities to `/10` (34 utilities, 16 files). Audited the whole `src` tree: those were
  the only non-multiple-of-5 steps in use and no hardcoded light-only colors lack a dark variant.
  Verified the tints now appear in the emitted CSS; typecheck/build/lint green. Shipped and auto-merged.
- **Artifacts:** 16 files incl. `components/ui/badge.tsx`, `components/shared/StatCard.tsx`,
  `components/layout/AppShell.tsx`, `features/shared/FacetSheet.tsx`,
  `features/collocations/CollocationsBrowser.tsx`, `features/vocabulary/RelatedPanel.tsx`, exam/
  simulation/onboarding/redemittel/quiz files; commit `0c3bd71`, PR #251; merge `f6effee`.

## Entry 86 — 2026-06-28 17:45 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 4 screenshots (Vokabeltrainer + Redemittel + Kollokationen filter sheets and the Quiz level picker, showing the inconsistent header/search/filter controls).
- **Prompt (verbatim):**
  > the search bar, filter button, filter options, themes and branches available are all super chaotic and inconsistent across the menu items like wortschatz, collocations and other relevant items where these filters are applicable. check the taxonomy plan, and recently uploaded playbook for learning apps and prepare a plan for harmonizing these features, redesign the app to have smoothest UX/UI with least confusion and straightforward usage with highest value.
- **Response summary:** Entered plan mode. Read the uploaded playbook
  (`docs/Language Learning App Success Factors.docx`, extracted via python) and the taxonomy spec
  (`docs/TAXONOMY_REDESIGN.md`), and ran two Explore agents to map every browse page's
  header/search/filter structure and the intended faceted-filter UX. Confirmed the divergences
  (two header styles, search only on Kollokationen, Filter button placed differently per page, bespoke
  verb-rail + legend, inconsistent CEFR labels). Asked the founder four scoping questions; answers:
  phased rollout, one responsive panel, branded HubHero everywhere, inline `Search + Theme + Filter`.
  Wrote the plan (a shared `BrowseToolbar` + the existing `FacetSheet` on every page, a shared
  `src/lib/cefr.ts`, declutter the verb-rail/legend into the sheet). Plan approved.
- **Artifacts:** plan file `the-search-bar-filter-enumerated-stream.md` (later saved into the repo, see Entry 87). No app code changed.

## Entry 87 — 2026-06-28 17:55 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > save the plan in the main branch. I'll implement it later
- **Response summary:** Saved the approved plan into the repo as
  **`docs/FILTER_HARMONIZATION_PLAN.md`** (marked "PLANNED, not yet implemented"). Docs-only, no code.
  Shipped to `main` via PR and realigned the dev branch.
- **Artifacts:** `docs/FILTER_HARMONIZATION_PLAN.md` (new); commit `9f567f6`, PR #252; merge `619f812`.

## Entry 88 — 2026-06-28 18:02 UTC
- **Branch:** `claude/review-previous-session-69pxat`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none.
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Added a **Session 44** block to `docs/PROJECT_STATUS.md` (review + dark-mode
  fix + filter-harmonization plan, PRs #250–#252, with the "only use opacity steps that are multiples
  of 5" lesson and the "resume here" pointer to the harmonization plan) and bumped its "Last updated"
  line. Appended Entries 84–88 here.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.

