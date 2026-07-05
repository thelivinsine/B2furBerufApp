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

Entries **1–109 (sessions 26–49)** are archived by ISO week under **`docs/archive/prompt-log/`**
(`SESSION_PROMPT_LOG_2026-W25/W26/W27.md`; see that folder's `README.md` index). This file holds
**session 50 onward**. Keep appending here, newest at the bottom, and rotate per the policy above.

## Entry 110 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > do a thorough audit of all the docs in the docs folder and give me a report
- **Response summary:** Read all 14 Markdown docs in `docs/` and cross-checked their load-bearing
  claims against the codebase. Verdict: B (good but drifting). Findings: provenance counts stale in
  three places (769/809/1073 vs the real 1,111 rows), five plan docs with "not yet implemented"
  headers for shipped work (EXPANSION_PLAN, MOBILE_APP_PLAN, TAXONOMY_IMPLEMENTATION_PLAN,
  DESIGN_PREVIEWS, DATA_GOVERNANCE v0.3-vs-v0.4), PROJECT_STATUS at 2,317 lines with three competing
  "Resume here" pointers and stale branch names, BUSINESS_PLAN stats stale (350 words/120
  collocations vs 528/396), no docs index, and `prompt-log-raw.jsonl` unexplained. Delivered a
  prioritized fix list.
- **Artifacts:** report in chat (fixes applied in the next entry).

## Entry 111 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > apply all the recommended fixes and suggest me best practices moving forward based on the project's documentation so far
- **Response summary:** Applied every audit fix: reconciled provenance counts to 1,111 (1,086 draft /
  25 verified) in `CLAUDE.md` + `DATA_GOVERNANCE.md` (bumped to v0.5 with changelog) +
  `PROJECT_STATUS.md`; flipped the five stale status headers to shipped; refreshed BUSINESS_PLAN §5
  stats; collapsed PROJECT_STATUS to one authoritative "Resume here" and generalized stale branch
  names; split sessions 4–40 + 24 into a new `PROJECT_STATUS_ARCHIVE.md` (2,317 → ~1,279 lines, all
  47 session logs preserved); added a `docs/README.md` index marking `prompt-log-raw.jsonl` frozen.
  Suggested seven forward practices (generate counts from the linter, flip headers on ship, size
  budget + archive cadence for the status doc, de-duplicate the two logs, no branch names in prose,
  prioritize the draft→verified provenance pass, keep the working disciplines).
- **Artifacts:** commit `17c18f6` (docs audit) on the session branch; new
  `docs/PROJECT_STATUS_ARCHIVE.md`, `docs/README.md`.

## Entry 112 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > can you read the language learning success factors doc?
- **Response summary:** Extracted the full text of the binary
  `Language Learning App Success Factors.docx` (~5,200 words, 11 sections + an evaluation
  meta-prompt) via stdlib XML parsing and summarized it: retrieval practice, FSRS over SM-2,
  interleaving (~43% better retention), Swain output, Fogg/Hook behavioral design, Mayer CTML, the
  gamification dilemma, B1–B2 plateau failure modes, competitor benchmarks. Mapped it to Genauly:
  already-shipped strengths (session loop, Can-Do, global search) and the open gaps (FSRS + latency,
  speech-first drills, talker variability, the Section-11 evaluation framework).
- **Artifacts:** scratchpad extraction (committed as a readable doc in the next entry).

## Entry 113 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > First let me know what tools does the doc suggest for brainstorming? Then, save a readable format in the docs folder and then run the evaluation
- **Response summary:** Clarified that the playbook has no tooling section; the brainstorming-tool
  guidance lives in `AI_PRODUCT_STRATEGY.md` §4a/§5 (ChatGPT + Claude for generation,
  Perplexity/NotebookLM for grounded research, Gemini Flash for bulk drafts, Lovable/v0/Bolt for
  validation prototypes; one JTBD at a time). Saved a faithful Markdown transcription of the .docx
  (8 tables reconstructed, citation noise stripped) as `docs/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`.
  Ran the playbook's Section-11 evaluation framework against Genauly, grounded in code checks (SM-2
  confirmed, zero latency tracking, STT built but unused, no custom decks): 7-dimension scorecard
  (curriculum 4.5 · SLA 4 · CTML 4 · cognitive 3.5 · behavioral 3.5 · gamification 3.5 · exercises
  3), five failure modes, five recommendations. Saved as `docs/PRODUCT_EVALUATION.md`.
- **Artifacts:** commit `833eaff`; new `docs/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`,
  `docs/PRODUCT_EVALUATION.md`; `docs/README.md` index updated.

## Entry 114 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > scope all 5 recos into backolog items with priority rating
- **Response summary:** Added backlog items **#26–#30** to `docs/PROJECT_STATUS.md` under a new
  "Product-evaluation findings" subsection: #26 FSRS + latency capture (P1, split 26a/26b), #27
  speech-first drill block (P1), #28 guess-before-reveal (P2 quick win), #29 custom decks / word
  capture (P2), #30 talker variability (P3 quick win). Each names the eval dimension/failure mode it
  closes, an MVP, effort, and recommended model; suggested build sequence recorded; cross-linked
  from `PRODUCT_EVALUATION.md`.
- **Artifacts:** commit `fe359b6`; `docs/PROJECT_STATUS.md`, `docs/PRODUCT_EVALUATION.md`.

## Entry 115 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > use your fable skill and prepare a thorough and robust plan for the above recos.
- **Follow-ups (same task):** referred to the published Claude Fable 5 prompting guidelines
  "wherever relevant"; narrowed scope to "just work on the plan for now. I'll implement the quick
  wins later."; asked for "a model suggestion for each item in the plan".
- **Response summary:** Ran a plan-mode design pass: three parallel codebase explorations (SRS
  engine + review call sites; session engine + speech; stores + cloudSync + Supabase schema) plus a
  dedicated design agent, then wrote **`docs/LEARNING_ENGINE_PLAN.md`** (approved by the founder):
  Phase 0 = quick wins (26a latency capture, #28 guess-first gate, #30 voice rotation) with exact
  files/signatures/copy/verification, Phase 1 = hand-rolled FSRS behind the unchanged `srs.ts`
  surface with a `scripts/test-srs.mjs` reference-vector gate, Phase 2 = the speech-first
  SessionPlayer block (first consumer of the dormant STT), Phase 3 = custom deck with the
  `saved_words` column migration; plus a persistence/sync policy table, risk register, per-item
  model recommendations (26a Opus · #28 Sonnet · #30 Sonnet · 26b Fable-high · #27 Fable-high ·
  #29 Opus), and Fable-5-guidelines execution notes. Key discoveries recorded: `review()` has one
  call site; STT is fully built with zero consumers; a speech-rate slider already exists; the
  progress table has no catch-all jsonb. Cross-updated PROJECT_STATUS (#26–#30 scoped pointer +
  Resume-here), README index, PRODUCT_EVALUATION pointer, and this log.
- **Artifacts:** new `docs/LEARNING_ENGINE_PLAN.md`; modified `docs/PROJECT_STATUS.md`,
  `docs/README.md`, `docs/PRODUCT_EVALUATION.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 116 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > yes open a pr and merge. also document the best practices
- **Response summary:** Documented the audit's seven best practices as a durable "Documentation best
  practices" section in `docs/README.md` (single-source dated counts, flip plan headers on ship,
  PROJECT_STATUS size budget + single Resume-here, distinct jobs for the two logs, no session-branch
  names in durable prose, the standing draft→verified provenance debt, keep the working
  disciplines), commit `cc70b07`. Then opened **PR #267** bundling the whole session's five docs
  commits and squash-merged it to `main` as `532a1b5`; ran the required post-merge housekeeping
  (fetch, reset --hard to origin/main, force-with-lease push; branch level and clean). Docs-only, so
  the triggered Pages deploy changes nothing visible. A closing wrap-up prompt ("is there any action
  point left in this session?") was answered with this final log entry and a session-50 status note,
  shipped as a small follow-up docs PR per the established convention.
- **Artifacts:** `docs/README.md`, PR #267 (squash `532a1b5`), this entry + the session-50 note in
  `docs/PROJECT_STATUS.md` (follow-up PR).

## Entry 117 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > one last thing - can you also organise the documents in the docs folder following the best practices as it's currently chaotic ?
- **Response summary:** Reorganized the flat `docs/` folder (21+ mixed files) into four purpose
  subfolders, keeping only the three start-here files at root (`README.md`, `PROJECT_STATUS.md`,
  `SESSION_PROMPT_LOG.md`). `strategy/` = AI_PRODUCT_STRATEGY, BUSINESS_PLAN, CERTIFICATION_RESEARCH,
  DATA_GOVERNANCE, PRODUCT_EVALUATION, SECURITY; `plans/` = LEARNING_ENGINE_PLAN, PHASE2_SETUP,
  UX_OVERHAUL_PLAN, TAXONOMY_REDESIGN, TAXONOMY_IMPLEMENTATION_PLAN, FILTER_HARMONIZATION_PLAN;
  `archive/` = PROJECT_STATUS_ARCHIVE, EXPANSION_PLAN, IMPLEMENTATION_PLAN, MOBILE_APP_PLAN,
  DESIGN_PREVIEWS; `reference/` = the playbook .docx + its .md transcription, the taxonomy .pptx, the
  security .pdf, and the frozen prompt-log-raw.jsonl. Surveyed all cross-references first (PROJECT_STATUS
  cited in 14 files, etc.), used `git mv` (history preserved), then scripted the path updates across
  every LIVE reference (CLAUDE.md, PROJECT_STATUS, the moved strategy/plans docs) plus three `src/`
  code COMMENTS that point at moved docs (AuthDialog, supabaseConfig, Sources; comment-only, cannot
  affect the build). Left append-only history (SESSION_PROMPT_LOG, archive/) naming the old flat paths
  as written, and noted that in the rewritten README. Rewrote `docs/README.md` as the authoritative
  index with a folder-structure map, per-folder tables using the new paths, and best-practice #8
  ("put new docs in the right folder, update the index"). Verified every live `docs/...` reference
  resolves to an existing file (the only unresolved ones are pre-existing illustrative "e.g."
  placeholders for docs that never existed).
- **Artifacts:** `docs/` reorganized into `strategy/`/`plans/`/`archive/`/`reference/`; modified
  `CLAUDE.md`, `docs/README.md`, `docs/PROJECT_STATUS.md`, and comment lines in
  `src/features/auth/AuthDialog.tsx`, `src/lib/supabaseConfig.ts`, `src/features/legal/Sources.tsx`.

## Entry 118 — 2026-07-03 (session 50)
- **Branch:** `claude/docs-audit-report-0xydsz`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > that's all for the session. make sure everything is documented
- **Response summary:** Final documentation-completeness pass to close session 50. Verified all eight
  founder prompts of the session are captured as prompt-log entries 110–117, that the PROJECT_STATUS
  "Resume here" carries a "Most recent work (session 50)" block, and that every change is merged to
  `main` (PRs #267 audit + evaluation + learning-engine plan, #268 close-out, #269 docs reorg; CI
  green on #269's `lint-content`). Broadened the session-50 status block to reference all three PRs and
  the one `src/` comment-only touch, marked the session fully documented, and added this closing entry.
  Working tree clean and level with `origin/main`.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Session 51 — 2026-07-04 — Learning Engine Phase 0 shipped (latency capture, guess-first, voice variety)
Branch: `claude/whats-next-esga9u`.

## Entry 119 — 2026-07-04 (session 51)
- **Branch:** `claude/whats-next-esga9u`
- **Assistant:** Claude Code (Anthropic)
- **Prompt (verbatim):**
  > What's next?
- **Response summary:** Oriented on `docs/PROJECT_STATUS.md`. Confirmed the UX overhaul (Phases 0–5)
  shipped fully as of session 49, and session 50 was a docs-only reorg. Per the "Resume here" section,
  the designated next build is Phase 0 (quick wins) of `docs/plans/LEARNING_ENGINE_PLAN.md`: 26a
  response-latency capture, #28 guess-before-reveal, #30 voice variety. Summarized the three items and
  asked whether to start implementing.
- **Artifacts:** none (research/orientation only).

## Entry 120 — 2026-07-04 (session 51)
- **Prompt (verbatim):**
  > what is the model reco?
- **Response summary:** Read off the per-item model table from `LEARNING_ENGINE_PLAN.md` §7: 26a →
  Opus 4.8 (default effort), #28 → Sonnet 5 (medium), #30 → Sonnet 5 (medium); noted the later phases'
  recommendations (FSRS and the speech-first block → Fable 5 high effort; custom deck → Opus 4.8) for
  context.
- **Artifacts:** none.

## Entry 121 — 2026-07-04 (session 51)
- **Branch:** `claude/whats-next-esga9u`
- **Prompt (verbatim):**
  > start with 26a
- **Response summary:** Implemented 26a (response-latency capture) on Opus 4.8 per the plan's model
  recommendation. `SrsCard` gained optional `lastMs`/`emaMs` (60s clamp, EMA α=0.3); `review()`/
  `reviewVocab()` took an optional `latencyMs` that carries prior samples forward unchanged when absent.
  New `useAnswerTimer(key)` hook in `lib/hooks.ts`. Wired into 4 capture sites: Flashcards, VocabQuiz,
  MCQView (shared by QuizRunner + SessionPlayer), and SessionPlayer's flashcard block; documented the
  per-question remount keys as load-bearing. Caught and fixed a Rules-of-Hooks ordering bug in
  Flashcards during implementation (timer hook was below an early return). Verified with `pnpm
  typecheck`/`lint:content`/`build` plus 14 hand-written assertions on the latency math (EMA, clamping,
  carry-forward, invalid-input rejection, old-format tolerance, rounding) run against the real
  `engine/srs.ts` via `vite.ssrLoadModule`.
- **Artifacts:** commit `c087c10`/`e4e6e61` (re-signed) "26a: capture per-card response latency".

## Entry 122 — 2026-07-04 (session 51)
- **Branch:** `claude/whats-next-esga9u`
- **Prompt (verbatim):**
  > continue with 28 and 30
- **Response summary:** Switched to Sonnet 5 (per the plan's recommendation) and implemented both
  remaining Phase 0 items. **#28 guess-before-reveal:** new `guessFirst` setting (default on); MCQView
  and VocabQuiz hide the options grid behind a "think first" gate ("Überlege zuerst…" → "Optionen
  zeigen") with explicit reset points in VocabQuiz (`next()`/`restart()`) since it isn't remount-keyed;
  latency spans the think stage on purpose (not reset on reveal); new "Lernen" settings card. **#30
  voice variety:** new `voiceVariety` setting (default off); `nextGermanVoiceURI()` round-robins the
  German voice list in `engine/speech.ts`, wired into `SpeakButton`, `SimulationRunner`, `ExamRunner`;
  Settings UI enforces mutual exclusion with a pinned voice (enabling variety unpins; picking a voice
  turns variety off). Verified with `pnpm typecheck`/`lint:content`/`build`, isolated round-robin unit
  tests, and Playwright smoke tests against a live dev server (MCQ gate reveal flow, guessFirst=false
  bypass, voice-variety mutual exclusion in both directions). Split the two commits cleanly by
  temporarily stripping/restoring the #30 additions from the two files shared with #28
  (`useSettingsStore.ts`, `Settings.tsx`) so each commit stays independently revertable and buildable in
  isolation. A stop-hook flagged all three commits as unverified (wrong committer identity); fixed via
  `git config` + `git rebase --exec "git commit --amend --no-edit --reset-author"`, confirmed the SSH
  signatures were actually present in the raw commit objects despite `git log`'s local `%G?` showing `N`
  (missing `gpg.ssh.allowedSignersFile` for local verification, not a signing gap).
- **Artifacts:** commits `bc54780`/`7550ac3` (re-signed) "#28: guess-before-reveal", `f959923`/`7dd2317`
  (re-signed) "#30: talker variability".

## Entry 123 — 2026-07-04 (session 51)
- **Branch:** `claude/whats-next-esga9u`
- **Prompt (verbatim):**
  > go ahead with pr and merge
- **Response summary:** Pushed the branch, opened PR #271 ("Learning Engine Phase 0: latency capture,
  guess-first, voice variety") with a summary + test plan of all three items, and subscribed to PR
  activity. Waited for the `lint-content` CI check (scheduled a short check-in rather than polling);
  once green with no review comments, squash-merged as `92ab08b` and completed the required post-deploy
  housekeeping (`git fetch origin main && git reset --hard origin/main && git push --force-with-lease`),
  leaving the dev branch level with `main` and the working tree clean.
- **Artifacts:** PR #271, squash-merge SHA `92ab08b` on `main`.

## Entry 124 — 2026-07-04 (session 51)
- **Branch:** `claude/whats-next-esga9u`
- **Prompt (verbatim):**
  > update documentation
- **Response summary:** Updated `docs/PROJECT_STATUS.md` ("Resume here" section, Phase 0 marked
  shipped, next steps pointed at Phase 1 FSRS) and appended this session's prompts (entries 119–124) to
  this log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 125 — 2026-07-04 (session 52)
- **Branch:** `claude/whats-next-q1iln6`
- **Prompt (verbatim):**
  > What's next?
- **Response summary:** Read `docs/PROJECT_STATUS.md` "Resume here". Reported the next build step as
  Phase 1 of the Learning Engine plan (the FSRS scheduler, #26b), followed by #27 speech-first block and
  #29 custom deck, plus the standing lower-priority items (cefr human-verify, sector/situation tagging,
  a new life-domain theme, the `pages.yml` deploy-flake hardening, backlog #25). No code changed.
- **Artifacts:** none (informational).

## Entry 126 — 2026-07-04 (session 52)
- **Branch:** `claude/whats-next-q1iln6`
- **Prompt (verbatim):**
  > What's the model reco for the above items?
- **Response summary:** Relayed the per-item model/effort table from `docs/plans/LEARNING_ENGINE_PLAN.md`
  §7: 26b FSRS → Fable 5 (high), #27 speaking block → Fable 5 (high), #29 custom deck → Opus 4.8
  (default), noting the shipped Phase 0 items for completeness. No code changed.
- **Artifacts:** none (informational).

## Entry 127 — 2026-07-04 (session 52)
- **Branch:** `claude/whats-next-q1iln6`
- **Prompt (verbatim):**
  > do the item 29 now
- **Response summary:** Implemented Learning Engine #29 (custom deck / "save word") end to end.
  Progress store gained `savedWords: string[]` + `toggleSavedWord(id)` (cleared by resetProgress via the
  defaults spread); cloudSync writes/merges `saved_words` and migration `0005_saved_words.sql` adds the
  jsonb column. UI: a bookmark toggle on each Vokabeltrainer word card (stopPropagation like SpeakButton)
  plus a "Gespeichert" toolbar filter (`?saved=1`, kept a per-learner toggle rather than a content facet)
  with an empty state and a Settings "Lernen" saved-count row. Engine: `reviewWeight` gained a `saved`
  boost (+1) threaded through session Pool 1 so bookmarked words surface sooner. Verified with
  `pnpm typecheck`/`lint:content`/`build` (all green) and a Playwright smoke test against a live dev
  server (bookmark toggle, persistence to the progress store, filter narrowing to the saved word, and
  the empty state), zero console errors.
- **Artifacts:** commit `3a529cf`; files `src/store/useProgressStore.ts`, `src/lib/cloudSync.ts`,
  `supabase/migrations/0005_saved_words.sql`, `src/engine/srs.ts`, `src/engine/session.ts`,
  `src/features/session/SessionPlayer.tsx`, `src/features/vocabulary/VocabList.tsx`,
  `src/features/vocabulary/VocabularyTrainer.tsx`, `src/features/settings/Settings.tsx`.

## Entry 128 — 2026-07-04 (session 52)
- **Branch:** `claude/whats-next-q1iln6`
- **Prompts (verbatim):**
  > you need to explain point 1 clearly so that I can implement it

  > what should be the name of this sql query?

  > it's done
- **Response summary:** Gave the founder (non-technical) a step-by-step Supabase dashboard click-path
  for running migration `0005_saved_words.sql` (SQL Editor → New query → paste the `alter table … add
  column if not exists saved_words …` statement → Run), with reassurance that it is additive,
  idempotent, and safe. Suggested naming the saved query `0005_saved_words` to mirror the repo file.
  Founder ran it successfully. Then, on approval (AskUserQuestion → "Yes, PR + merge"), opened **PR
  #273**, subscribed to PR activity, confirmed the `lint-content` check passed and the PR was
  `mergeable_state: clean`, and **squash-merged as `c730e76`**. Completed post-merge housekeeping
  (`git fetch origin main && git reset --hard origin/main && git push --force-with-lease`); auto-
  unsubscribed on merge.
- **Artifacts:** PR #273, squash-merge SHA `c730e76` on `main`; migration `0005_saved_words.sql` applied
  in Supabase.

## Entry 129 — 2026-07-04 (session 52)
- **Branch:** `claude/whats-next-q1iln6`
- **Prompts (verbatim):**
  > should I start the next tasks in a new session?

  > okay, make sure the documentation is uptodate. I'll continue in a new session
- **Response summary:** Advised starting each remaining Learning Engine phase (26b FSRS, then #27
  speech-first block) in a fresh session: both want Fable 5 / high effort (this session ran Opus 4.8),
  a cold start keeps context lean, and 26b's plan calls for a fresh-context verification subagent.
  Then updated the docs to reflect the merged state: `docs/PROJECT_STATUS.md` (header + "Resume here"
  #29 flipped from "implemented on branch" to "shipped, PR #273 / `c730e76`", migration-run noted),
  `docs/plans/LEARNING_ENGINE_PLAN.md` (status header + Phase 3 section marked SHIPPED, noting the
  toolbar-toggle deviation), and this log.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/plans/LEARNING_ENGINE_PLAN.md`,
  `docs/SESSION_PROMPT_LOG.md` (entries 128–129).

## Entry 130 — 2026-07-04 (session 53)
- **Branch:** `claude/26b-task-n3tl75`
- **Prompt (verbatim):**
  > start with 26b task
- **Response summary:** Implemented Learning Engine Phase 1 (26b): replaced the SM-2 scheduler in
  `src/engine/srs.ts` with a compact hand-rolled **FSRS-6** scheduler behind the unchanged export
  surface (no call sites changed). `SrsCard` gained optional `stability`/`difficulty`; legacy SM-2
  cards seed lazily on their next review (stability from `interval`, difficulty inversely from
  `ease`), untouched cards keep identical `mastery()` scores; `reps` became a never-resetting
  total-review counter (cloudSync merge safety) and `ease` stays warm under the SM-2 rule (one-file
  rollback). Built the new CI gate `scripts/test-srs.mjs` (`pnpm test:srs`, wired into
  `validate.yml`): 310 assertions against golden vectors generated from py-fsrs 6.3.1 (the
  open-spaced-repetition FSRS-6 reference) run with the app's semantics (no sub-day steps, no
  fuzzing, retention 0.9), covering grade sequences, same-day/late/early reviews, legacy seeding,
  the 26a latency regression, and contract invariants. Verified per plan §7: `pnpm typecheck`/
  `lint:content`/`build`/`test:srs` all green; a fresh-context verification subagent independently
  re-derived the formulas and golden vectors from the py-fsrs source (verdict PASS, one comment nit
  fixed); Playwright smoke against a live dev server persisted the exact FSRS first-rating values
  from a composed-session flashcard review with zero console errors. Opened PR #275, waited for CI,
  squash-merged as `c1dada8`, completed post-merge realignment, then shipped these doc updates
  (status doc, this log, plan status, CLAUDE.md) as a follow-up docs PR.
- **Artifacts:** PR #275, squash-merge SHA `c1dada8` on `main`; files `src/engine/srs.ts`,
  `src/types/index.ts`, `scripts/test-srs.mjs`, `package.json`, `.github/workflows/validate.yml`;
  docs follow-up PR (`docs/PROJECT_STATUS.md`, `docs/plans/LEARNING_ENGINE_PLAN.md`,
  `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md`).

## Entry 131 — 2026-07-04 (session 53)
- **Branch:** `claude/26b-task-n3tl75`
- **Prompts (verbatim):**
  > is everything done? there seems to be an error

  > are you done?

  > can you do that?

  > i reran the session 53 close out

  > it failed again. check why it's happening

  > can you check what's the error with deployement?

  > go ahead and merge it

  > document the session

  > [screenshot of the Actions "Deploy site to GitHub Pages" history showing #282–#284 failed, #285 green]
- **Response summary:** After the 26b FSRS work merged (entry 130), diagnosed the "error" the founder
  saw: the `Deploy site to GitHub Pages` job failing on both session-53 merges (`c1dada8`, `9ba8be4`)
  with GitHub's transient `Deployment failed, try again later` at the `actions/deploy-pages` step. Ruled
  out a code cause (the `validate` gate passed and a local `pnpm build` was green; the failure is at the
  Pages publish step, not the build). It was a genuine short GitHub Pages incident: deploys succeeded
  ~30 min earlier, and even the founder's manual re-run failed before recovering. Then, on the founder's
  go, **hardened `pages.yml`**: the deploy job now runs up to 3 in-job attempts of the pinned
  `actions/deploy-pages` (fail-soft 1–2 with 15s/60s pauses, hard 3), with the `environment.url` falling
  back across attempts. Shipped as **PR #277**, `validate` gate green, **squash-merged as `c00341a`**,
  post-merge realignment done. (Correction: an interim status claim that deploy runs #282/#283/#284 went
  green was wrong, from an unreliable WebFetch read of the Actions page. A founder screenshot showed the
  incident ran long enough that #282/#283/#284 all failed, #284 exhausting all 3 retry attempts; the
  next merge's run **#285 (`ab6278e`) went green** in 2m 20s, the retry visibly rescuing a later attempt.
  Since each Pages deploy publishes the whole site, #285's success put the FSRS change live.)
  Finally updated the docs (this session close-out): `docs/PROJECT_STATUS.md` (deploy note rewritten to
  "auto-retried", PR #277 added to the session-53 handoff), `CLAUDE.md` (deploy-retry note), and this
  log.
- **Artifacts:** PR #277, squash-merge SHA `c00341a` on `main`; files `.github/workflows/pages.yml`,
  `docs/PROJECT_STATUS.md`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 132 — 2026-07-05 (session 54)
- **Branch:** `claude/german-learning-game-idea-df1675`
- **Prompts (verbatim):**
  > i have an idea that's quite rough at the moment and want to brainstorm with you. following is
  > the idea. brainstorm with me. ask questions when you don't understand something or when needed.
  > feel free to ground your facts on scientific and official sources. below is the idea:
  >
  > Hero's journey similar to Pokémon Nintendo game
  > Main story line with real life scenarios
  > 2d game interface
  > Elixers, potions, wild cards, vouchers, stones, poke balls, etc becomes verbs, nouns,
  > prepositions, konj. 1&2, passiv, grammar etc.
  > Various types of missions uses items from player's bag. All items have upgrades as the user
  > passes levels.
  >
  > The powers of the player are mainly characters panel. Potions are beers, and wild cards are
  > local german friends. Achievements and finds can include stuff like German cars, other German
  > things. Each exercise or mission earns the player xp points and collects items which determines
  > life in later stages either difficult or hard.
  >
  > Graphics similar to clash of clans or winter lockdown.
  >
  > The player as he progresses through the missions have to keep repeating the exercises again and
  > again similar to real life like doing Anmeldung when moving in Germany or changing addresses.
  > Doing each of these things should simulate real life websites, scenes, fights with strangers in
  > supermarkets or Sbahn stations, etc.
  >
  > Every line and word in the game should have a D and E button so that the player can see the
  > English translation or German explanation of the word/sentence.
  >
  > Doing the side quests will get the player lot of ammo or loot in their bag. These side quests
  > are a mix of collecting words from the real world like taking photo or recording a voice note
  > or message of a newly learnt world in the outside world. This builds on the real life
  > experience. In addition, there will be all sorts of german language learning games inspired by
  > various online platforms to help discover new words, grammar, and use cases which will again be
  > collected in the bag for the missions in the main story line. To help find the right words in
  > the vast amount of collections, there will be appropriate categorization of the words and
  > filters.
  >
  > Each level has limited number of typing and time in it and the player has to use the ammo from
  > the bag.

  > 1. broader audience and scope
  > 2. flexible. I'm open for ideas
  > 3. open for ideas
  > 4. let's pick Anmeldung

  > Sounds good. Make a note of this for future reference - The core philosophy (I'm just writing
  > my thoughts as they come, so it's a bit unpolished) of this game concept in the app is to
  > involve learner personally into a story and teach them german through cultural insights,
  > visuals and emotions - each scene and mission builds upon the last one and progresses
  > incrementally for the learner to keep learning new words and associate them properly with a
  > personal situation in the game. The ultimate goal of the app is to have a huge storyline with
  > several hundreds of missions by including 1000's of scenes like above in the game. Most of the
  > apps these days are dry text based, context-less practice apps. The personal involvement is way
  > less and visuals are almost zero. This should address that.
  > [interrupted, then:] For some reason in the text above you say B2 exam is the end game and this
  > app is for exam learners - that's wrong!!!! The scope of this app has been long ago broadened.
  > You're getting stale info!
- **Response summary:** Brainstormed the founder's story-driven 2D German life RPG idea, grounded
  in research (task-based language teaching, task-based RPG studies, Duolingo hearts/Energy
  backlash on punitive metering). Key shaped outcomes: items = language and battles = conversations
  (Redemittel as moves, Konjunktiv II crits); story-justified repetition with FSRS as the "dungeon
  master" timing recurring missions (re-Anmeldung on moves); failure is content, never lockout
  (scaffolded retries, missing-item fetch quests, opt-in Prüfungsmodus for time/typing limits);
  retro pixel art proposed over Clash-of-Clans-grade production; beer-as-potion softened to a
  Kaffee/Feierabendbier/Döner item lexicon; real-world photo/voice side quests kept on-device for
  GDPR. Founder decisions: broad audience and scope, flexible on story shape, open on failure
  design, and the **Anmeldung mission as the first vertical slice** (5 scenes: Termin parody
  website, document loadout, waiting room, Frau Schmidt dialogue boss, Anmeldeformular cloze,
  rewarding the Meldebestätigung key item). Founder correction adopted as a hard scope guardrail:
  broad audience, exam prep only an optional side path, never the spine or default endgame. Wrote
  everything (founder philosophy verbatim, pillars, chapter skeleton, open questions: naming and
  pixel-art blessing) into the new **`docs/strategy/GAME_CONCEPT.md`**, plus status-doc handoff.
  Nothing built; concept only.
- **Artifacts:** `docs/strategy/GAME_CONCEPT.md` (new), `docs/PROJECT_STATUS.md` (header +
  session-54 handoff), `docs/SESSION_PROMPT_LOG.md` (this entry); PR into `main` per auto-ship.

## Entry 133 — 2026-07-05 (session 55)
- **Branch:** `claude/session-contents-review-o5slcn`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** founder pasted the full text of a Perplexity "agent tax / token cost" research thread (comparison of Aider vs OpenCode vs Claude Code, plus follow-ups on Cursor / ChatGPT Plus+Codex and managing usage windows).
- **Prompts (verbatim):**
  > can you read the contents of this session? https://www.perplexity.ai/search/act-as-a-principal-devops-and-09NDGM2_QqKCMTHu2twguw?sm=d
  >
  > [then, after WebFetch returned 403] below is the text: [pasted Perplexity thread]
  >
  > what are key takeaways from this perplexity session for this project? What can we do from here to being extremely token efficient while being ultra-productive?
  >
  > what tools do you suggest I use when claude session hit limts?
  >
  > go ahead with all 4 recos
- **Response summary:** Could not fetch the Perplexity URL (403, anti-bot); founder pasted the text. Flagged the thread's factual errors (invented "Sonnet/Opus 4.6" + "DeepSeek V4" price tiers) while affirming its sound core thesis ("agent tax" is a prompt-shaping problem first). Grounded the takeaways in this repo's real numbers (CLAUDE.md ~7–8k tokens/turn; PROJECT_STATUS 127KB; SESSION_PROMPT_LOG 162KB) and recommended, for the founder's usage-windowed Claude Pro plan, Gemini free tier as paste-in overflow (skip Cursor, poor fit for a non-technical web-agent workflow) with Claude Max as the upgrade path if limits hit often. Then executed all four token-efficiency recos: (1) split locked-decision rationale out of `CLAUDE.md` into new `docs/DECISIONS.md` and condensed the fully-shipped UX-overhaul phase history; (2) rotated the append-only prompt log (entries 1–109 → `docs/archive/SESSION_PROMPT_LOG_ARCHIVE.md`) and the PROJECT_STATUS session-25–46 detail (→ `docs/archive/PROJECT_STATUS_ARCHIVE.md`); (3)+(4) codified read-discipline + job-size routing as a new "Working efficiently" rule in `CLAUDE.md`. Every operative do/don't rule preserved; only narrative moved. Files read per session dropped ~4110 → ~1973 lines (~52%).
- **Artifacts:** `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md` (modified); `docs/DECISIONS.md`, `docs/archive/SESSION_PROMPT_LOG_ARCHIVE.md` (new). Commit SHA: pending push to `claude/session-contents-review-o5slcn`.

## Entry 134 — 2026-07-05 (session 55)
- **Branch:** reassigned per session (see PROJECT_STATUS "Resume here"); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead and merge but also do a thorough audit/review of all the docs and make sure any stale info is archived.
- **Response summary:** Ran a full docs audit before merging. Archived the four plans whose work is 100% shipped by moving them from `docs/plans/` to `docs/archive/` (`UX_OVERHAUL_PLAN`, `FILTER_HARMONIZATION_PLAN`, `TAXONOMY_IMPLEMENTATION_PLAN`, `TAXONOMY_REDESIGN`); kept `LEARNING_ENGINE_PLAN` (Phase 2 pending) and `PHASE2_SETUP` (live runbook) in `plans/`. Rewired every live cross-reference to the new archive paths (CLAUDE.md, PROJECT_STATUS.md, DECISIONS.md) and fixed the moved files' internal cross-refs; left append-only history (`SESSION_PROMPT_LOG*`, `archive/PROJECT_STATUS_ARCHIVE.md`) as written per the docs rules. Fixed a stale status header in the index (`LEARNING_ENGINE_PLAN` was marked "not yet implemented" over shipped Phases 0/1/3). Removed the stale hardcoded session-branch name (`claude/26b-task-n3tl75`) from `CLAUDE.md` per docs best-practice #5. Refreshed `docs/README.md` (added `DECISIONS.md` + `SESSION_PROMPT_LOG_ARCHIVE.md` rows, moved the four plans to the archive table, bumped "Last reviewed"). Spot-checked content counts against `src/data` (provenance 1,111 and Can-Do 25 match the quoted figures, not stale). Then squash-merged the branch into `main` and ran post-merge realignment.
- **Artifacts:** `git mv` of 4 plans `docs/plans/*` → `docs/archive/*`; edits to `CLAUDE.md`, `docs/README.md`, `docs/PROJECT_STATUS.md`, `docs/DECISIONS.md`, `docs/SESSION_PROMPT_LOG.md`. Commit + squash-merge SHAs recorded in git history / the merged PR.

## Entry 135 — 2026-07-05 (session 55)
- **Branch:** reassigned per session; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > how does prompt logging work from now? it may keep getting bigger, right?
  >
  > 600 lines doesn't sound like much though, is it?
  >
  > and the archive session prompt log should be split by month. Because loading an archived huge session prompt is also token-costly
  >
  > scrap that - split it by weeek, not month
- **Response summary:** Explained the logging mechanism (append-only, manual since the s25 hook removal; live file is a write/tail target, not read every turn) and that only the live file's size costs tokens while the archive is cold storage. Set the live-file budget at ~1,200 lines (~14k tokens, ~10-session cadence) rather than the initially-floated 600. Then, per the founder's decision, **split the prompt-log archive by ISO week**: replaced the single `SESSION_PROMPT_LOG_ARCHIVE.md` (1,789 lines) with `docs/archive/prompt-log/SESSION_PROMPT_LOG_2026-W25/W26/W27.md` + a folder `README.md` index (27/64/21 entries, no loss), so any lookup loads one week. Codified the standing rotation policy in the live log's header (append to the tail; rotate at ~1,200 lines into the week file matching each entry's date) and updated `docs/README.md` + the PROJECT_STATUS session-55 handoff.
- **Artifacts:** new `docs/archive/prompt-log/` (3 weekly files + `README.md`); removed `docs/archive/SESSION_PROMPT_LOG_ARCHIVE.md`; edits to `docs/SESSION_PROMPT_LOG.md` (rotation policy + tail-append rule + archive pointer), `docs/README.md`, `docs/PROJECT_STATUS.md`. Commit SHA recorded in git history.

## Entry 136 — 2026-07-05 (session 56)
- **Branch:** `claude/whats-next-yqdvc9` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what's next?
- **Response summary:** Picked up the "Resume here" pointer and shipped **Learning Engine Phase 2, the #27 speech-first production block** (the last remaining phase), per `docs/plans/LEARNING_ENGINE_PLAN.md` §4. New `"speaking"` session block (first consumer of the `listen()` STT wrapper): behind the `recognitionEnabled` opt-in + browser support, the composer adds up to 2 production blocks from the top-weighted due vocab; the learner sees the EN meaning + EN example, taps the mic, says the German target, and the transcript is matched by the new pure `src/engine/pronounce.ts` (article/`sich` stripping, ß→ss, exact / word-boundary containment / length-scaled Levenshtein). Grades 4/0 into FSRS with 26a latency spanning the think stage; +12 XP. Fallback ladder: hard STT error → typed input graded by the same matcher (2 errors → remaining speaking blocks start typed); `no-speech` → retry; voluntary "Lieber tippen" always available. New CI gate `pnpm test:pronounce` (26 checks) in `validate.yml`. Verified with all five gates green plus a 21-check Playwright smoke (mocked SpeechRecognition; STT happy path with exactly +12 XP and persisted latency, typed paths, error fallback, recognition-off session shows no speaking block; zero console errors). Squash-merged and realigned; docs updated (plan status, PROJECT_STATUS handoff + next-up list, CLAUDE.md commands/engine lines, this entry).
- **Artifacts:** `src/engine/pronounce.ts`, `scripts/test-pronounce.mjs` (new); `src/types/index.ts`, `src/engine/session.ts`, `src/engine/scoring.ts`, `src/features/session/SessionPlayer.tsx`, `src/features/settings/Settings.tsx`, `package.json`, `.github/workflows/validate.yml` (modified). PR #284, squash SHA `6d1d8b4`. Docs commit follows on the same branch.

## Entry 137 — 2026-07-05 (session 56)
- **Branch:** `claude/whats-next-yqdvc9`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > continue where you left off
  >
  > are you done?
  >
  > it works
- **Response summary:** Session-56 wrap-up. "Continue" resumed mid-verification (the Playwright smoke was written but not yet run); the smoke surfaced and fixed two real bugs (StrictMode double-mount latched the unmount guard; STT `onend` after `onerror` dragged the UI back from the typed fallback) before the ship. Confirmed completion status, and the founder then **verified the #27 speaking block working on the live site** (PR #284 deploy green). Learning Engine plan fully shipped and live-verified.
- **Artifacts:** this entry only.

## Entry 138 — 2026-07-05 (session 57)
- **Branch:** `claude/whats-next-ivzj5y` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > What's next?
- **Response summary:** Read the "Resume here" pointer, reported the Learning Engine plan fully shipped, and asked the founder (AskUserQuestion) which of the remaining candidates to build; they chose the **optional Phase 1.5 latency plug-in**. Shipped it per `docs/plans/LEARNING_ENGINE_PLAN.md` §3: a **"correct but slow" demotion** in `src/engine/srs.ts`. A Good rating (grade 4) whose clamped latency exceeds **1.5×** the card's own `emaMs` is scheduled as **Hard**, gated on **≥3 prior samples** (new optional `SrsCard.msCount`), keyed purely to the per-card EMA (no absolute cross-format threshold), with a **2000ms floor** that only blocks demotion of a sub-2s confident recall. Scheduling-only: `lastGrade` keeps the honest button press, latency is still recorded. `review()` gained an `opts.latencyGrading` flag (engine default off, so pure/test callers never demote); `useProgressStore.reviewVocab` reads the new `latencyGrading` setting (default **on**, opt-out toggle in the Settings "Lernen" card) via `useSettingsStore.getState()`. No persist/Supabase migration (fields ride inside the `srs` jsonb + settings jsonb sweep). Verified: `pnpm test:srs` now **323 checks** (+13 Phase-1.5 assertions proving a demoted Good equals a real Hard on the same card state, plus fast / flag-off / <3-samples / floor-guard skip cases), `typecheck` + `lint:content` + `build` all green. Squash-merged and realigned per housekeeping.
- **Artifacts:** `src/engine/srs.ts`, `src/types/index.ts`, `src/store/useSettingsStore.ts`, `src/store/useProgressStore.ts`, `src/features/settings/Settings.tsx`, `scripts/test-srs.mjs`, `docs/plans/LEARNING_ENGINE_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR #287, squash SHA `8835b52`.

## Entry 139 — 2026-07-05 (session 57)
- **Branch:** `claude/whats-next-ivzj5y`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session and follow all best practices discussed previously for the documentation
- **Response summary:** Confirmed the session was already documented as part of the Phase-1.5 ship (PROJECT_STATUS handoff + next-up list + `_Last updated_`, this prompt log's entry 138, and the LEARNING_ENGINE_PLAN status), then closed the remaining best-practice gaps: filled the real **PR #287 / squash SHA `8835b52`** into the entry-138 artifacts and the PROJECT_STATUS handoff (had been "recorded in git history" placeholders written pre-merge), added this entry 139, and audited `CLAUDE.md` for staleness (no content-count or convention change from this session; the `pnpm test:srs` and `engine/srs.ts` lines stay accurate, so no CLAUDE.md edit needed). Shipped the doc-only follow-up on the same branch and realigned.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Doc-only PR + squash SHA recorded in git history.

## Entry 140 — 2026-07-05 (session 58)
- **Branch:** `claude/app-audit-performance-e3p23l` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > The app is currently quite buggy, laggy and unresponsive. do a thorough audit of the app and give me a detailed report of what's the issue and how you plan on fixing them and how to make the app robust to not incur such issues in future
- **Response summary:** Full performance/bug/robustness audit; no code changed yet (the deliverable is the report + fix plan, awaiting founder go-ahead). All existing gates verified green first (build, typecheck, lint:content, test:srs 323, test:pronounce 26, pnpm audit clean), so the issues are architectural: (A) startup weight, the main chunk is 606 kB because `lib/search.ts` (eager via GlobalSearch/AppShell) statically imports every content bank; (B) runtime jank, 528/396-card lists rendered unvirtualized with a motion.div per card and per-keystroke re-reconciliation, the `reducedMotion` setting a no-op (never read), triple `backdrop-blur-xl` fixed layers, `transition-all` on `card-hover`, undebounced global search; (C) bugs, header streak reads raw `streak` instead of `useEffectiveStreak`, `/session` ignores scope/minutes changes (plan built once, no key; "Neue Runde" is a full page reload), cloudSync's 1.5 s debounce has no flush on hide/sign-out so final reviews can miss the cloud; (D) robustness gaps, CI runs no typecheck/build on PRs, no ESLint, no component tests, no bundle budget, no route-level error boundaries, progress-store persist unversioned. Wrote the ranked report + 6-phase execution plan to `docs/plans/APP_AUDIT_2026-07-05.md`.
- **Artifacts:** `docs/plans/APP_AUDIT_2026-07-05.md` (new), `docs/SESSION_PROMPT_LOG.md` (this entry). Commit SHA recorded in git history.

## Entry 141 — 2026-07-05 (session 58)
- **Branch:** `claude/app-audit-performance-e3p23l`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > start working on all of them one by one
- **Response summary:** Executed the full audit fix plan from `docs/plans/APP_AUDIT_2026-07-05.md`, one PR per phase, each squash-merged after green gates + Playwright smoke against the production preview. **Phase 1 (#289)** correctness quick fixes: effective header streak, `/session` remounts on scope/length change + in-place "Neue Runde" (no full reload), real reduced-motion via `MotionConfig`, `card-hover` transitions narrowed. **Phase 2 (#290)** interaction lag: debounced `BrowseToolbar` search, memoized per-card store subscriptions, new `usePagedList` (60 cards + sentinel) in Vokabeltrainer/Kollokationen, per-card stagger dropped in Redemittel, pre-normalised lazy search index + deferred query in `GlobalSearch`. **Phase 3 (#291)** startup weight: main bundle 606 → ~322 kB (lazy `lib/search`, new light `engine/sessionPreview.ts` for the eager Dashboard, lazy `/privacy` `/terms` `/about`). **Phase 4 (#292)** `flushCloudSync()` on `visibilitychange=hidden` and before sign-out. **Phase 5a (#293)** per-route `RouteError` boundaries + progress-store persist `version: 0` + migrate hook. **Phase 5b (#294)** CI guardrails: ESLint flat config (`pnpm lint`), 23-test Vitest suite (`pnpm test:unit`), `pnpm build` on PRs, bundle budget (`pnpm check:bundle`, 400 kB); linter surfaced and fixed real bugs (dead else-if in `engine/quiz.ts`, stray escape in the plural prompt, `useHint`→`applyHint`). **Phase 6** (with the docs PR): mobile-only blur reduction on header + bottom bar, flagged for founder veto. Docs updated: PROJECT_STATUS s58 handoff, CLAUDE.md commands + eager-import rule, audit doc status header, this entry.
- **Artifacts:** PRs #289 `1099c35`, #290 `55c5a4f`, #291 `754642c`, #292 `5d2c950`, #293 `06e1a4a`, #294 `e27e6cd`, plus the Phase-6/docs PR (SHA in git history). New files: `src/lib/usePagedList.ts`, `src/engine/sessionPreview.ts`, `src/components/layout/RouteError.tsx`, `eslint.config.js`, `vitest.config.ts`, `tests/*` (3 suites), `scripts/check-bundle-size.mjs`.

## Entry 142 — 2026-07-05 (session 58)
- **Branch:** `claude/app-audit-performance-e3p23l`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Session-58 documentation wrap-up. Most docs were already updated inline during the phased work (PROJECT_STATUS s58 handoff, CLAUDE.md new CI gates + eager-import rule, `docs/plans/APP_AUDIT_2026-07-05.md` EXECUTED status header, prompt-log entries 140–141), all shipped in PR #295. This pass closed the remaining gaps: bumped the stale PROJECT_STATUS `_Last updated_` line (still said "session 57 / Phase 1.5") to reference the session-58 audit + PRs #289–#295, and added this entry 142. Shipped doc-only on the realigned branch and ran post-merge housekeeping.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Doc-only PR + squash SHA recorded in git history.

## Entry 143 — 2026-07-05 (session 59)
- **Branch:** `claude/bibliothek-grammar-redirects-dkwna6` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > there's a problem in bibliothek - when I click on Grammar tiles, it redirects me to wörter. what happened to connectors and others? fix it
- **Response summary:** Fixed the Bibliothek Grammatik tab. Tapping any grammar tile (Konnektoren, Relativsätze, etc.) bounced the user to the Wörter tab because `GrammarHub.tsx` opened a topic with `setParams({ topic: id })`, which replaces the entire query string and drops `tab=grammatik`; `LibraryHub` then read no `tab` and mounted the default segment (`DEFAULT_LIBRARY_TAB = "woerter"`), so the Vokabeltrainer appeared instead of the topic. The back button (`setParams({})`) had the same flaw. This was a Phase-5 (session 49) regression: replacing all params was harmless while GrammarHub lived at the standalone `/grammar` route, and broke silently once it became a `?tab=` segment of `/library`. Fix: `open` and the new `close` handler clone the live params (`new URLSearchParams(params)`) and only set/delete `topic`, the same idiom VocabularyTrainer, CollocationsBrowser and RedemittelTrainer already use. No content or data changes; connectors and all 10 topics were always intact. Verified with a headless Playwright check against the production preview (tile click keeps `tab=grammatik&topic=g_konnektoren`, topic view renders with drills, back returns to the grammar grid) plus a green `pnpm build`. Squash-merged to `main` and realigned per housekeeping.
- **Artifacts:** `src/features/grammar/GrammarHub.tsx` (fix), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 144 — 2026-07-05 (session 59)
- **Branch:** `claude/bibliothek-grammar-redirects-dkwna6`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > check for all such issues in the app and fix them
- **Response summary:** App-wide sweep for the entry-143 bug class (URL-param writes that wipe the `?tab=` context of the `/library` hub, plus wrong-destination deep links). Static audit covered every `useSearchParams` consumer in `src/` (9 files): VocabularyTrainer, CollocationsBrowser and RedemittelTrainer all use the clone idiom (`new URLSearchParams(params)`) for theme/facet/search/category/saved writes; WritingHub and QuizHub replace the whole param set, but both are standalone routes whose only params are their own (`theme`, `level`), so the reset is the intended flow; Session only reads params; LibrarySwitcher rebuilds params deliberately (travelling scope by design); LibraryHub only reads `tab`. All deep links into library content (GlobalSearch results, RelatedPanel "Verbunden" jumps, `practiceAreas` routes, dashboard intent cards) target the old standalone routes and pass through `LibraryRedirect`, which preserves every param and sets the correct tab. Result: **no other instances of the bug; zero code changes needed** beyond the PR #297 fix. Verified at runtime with a 7-check Playwright smoke against the production preview: Wörter saved-toggle keeps `tab=woerter`; Kollokationen search writes `q=` and keeps its tab; Redemittel renders its own surface; the switcher carries `theme=` scope between Wörter and Kollokationen and lands Grammatik on the grammar grid; the old `/grammar?topic=g_kasus` deep link opens the topic with drills; browser Back from a grammar topic returns to the grid. All pass. Doc-only ship: PROJECT_STATUS s59 handoff extended with the sweep result, this entry added.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Doc-only PR + squash SHA recorded in git history.

## Entry 145 — 2026-07-05 (session 59)
- **Branch:** `claude/bibliothek-grammar-redirects-dkwna6`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the wrong redirection of Grammar tiles to words isn't solved yet!
- **Response summary:** Diagnosed why the already-merged fix (PR #297) still looked broken on the founder's device. Server side was verified healthy: the fix is on `main`, Pages deploy runs 304 (fix) and 305 (docs) both completed green, and the Playwright check had already proven the built bundle behaves correctly. The real culprit is the PWA update path: the service worker (`registerType: "autoUpdate"`) serves the old precached app on launch and only swaps in a new deploy on the NEXT relaunch, so an installed home-screen app needs two full close-and-reopen cycles before any deploy becomes visible, which reads as "the fix didn't ship". Fixed that class of problem permanently with a new `src/lib/swUpdate.ts` (`watchSwUpdates()`, called from `main.tsx`): reload once when a new service worker takes control within 30s of load (the normal update-on-launch case); if a deploy lands mid-session, defer the reload to the next app resume so an in-progress exercise is never interrupted; on every resume, re-check `sw.js` for updates (throttled to once a minute) since iOS PWAs are resumed rather than relaunched; first-install `clientsClaim` guarded so a fresh visitor never sees a spurious reload. Complements the existing reactive `lib/recover.ts` (which only heals after a stale-chunk crash). Verified with an end-to-end Playwright service-worker test against the production preview: 0 spurious reloads on first install, auto-reload fires after a simulated deploy (byte-bumped `sw.js` precache revision), and grammar tiles still work after the auto-reload. Gates green: `pnpm build`, `check:bundle` (322.5 kB), `lint` (0 errors, known 31 warnings), `test:unit` (23). Told the founder to fully close and reopen the app once more to pick this up; after that, deploys self-adopt.
- **Artifacts:** `src/lib/swUpdate.ts` (new), `src/main.tsx`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 146 — 2026-07-05 (session 61)
- **Branch:** `claude/app-redesign-minimal-ux-043mdy` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the app currently has a lot of info.. with a lot of text and details. For someone who's nee to the app. it's a lot of info and details with too much german text. I want this app to be minimal, extremely user friendly, highly intuitive and quite engaging and interactive and interesting to keep the user's attention. Remember our user base involves busy working professionals or studients with less attention span used to tik tok and Instagram, in addition to hardcore exam prep people who actively look for all the info. How do you plan to redesign the front end, ui, ux of the app with keeping the purpose and goal of the app in mind? Remember that one of the visions for this app is to yse the progress of the exercises to feed into the game to have a unified world. Use your expertise in all the related domains and provide me with detailed report with visual design strategy, recommendations and how to implement them efficiently and effectively.
- **Response summary:** Strategy session, no app code changed (deliverable is the report + plan, awaiting founder go-ahead). Grounded in the live codebase (Dashboard, Onboarding, SessionPlayer, progress store), the session-60 UX/UI analysis (`docs/reference/GENAULY_UX_UI_ANALYSIS.md`) and the game concept (`docs/strategy/GAME_CONCEPT.md`). Delivered a visual strategy report (Artifact with before/after phone mockups: 3-element Heute with streak ring + city strip, 1-screen onboarding + 90-second taster, full-screen focus-mode session with combo counter and D/E gloss, loot-drop end screen rendering FSRS state as collection-card levels) and the engineering plan `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`. Core strategy: "lean surface, deep drawer" for the two audiences; microcopy budget (German is content, not chrome); gradients restricted to Start + rewards plus a new reward-gold token; and a unified-world game contract (one progression state, two renderers: words as loot, domain mastery as city buildings, Can-Do as quests). Four implementation phases (diet, stage, world seed, depth) with locked constraints (bottom bar, overlays, 400 kB budget, consent flow, no new deps, no tracking) restated.
- **Artifacts:** `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md` (new), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). Visual report delivered as a Claude Artifact (link in chat). Shipped in **PR #301, squash SHA `f857f1f`**.

## Entry 147 — 2026-07-05 (session 61)
- **Branch:** `claude/app-redesign-minimal-ux-043mdy`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Session-61 documentation wrap-up. The redesign-strategy deliverables were already documented inline during entry 146's work (the new plan `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`, the PROJECT_STATUS `_Last updated_` line + session-61 "Resume here" handoff, and prompt-log entry 146), all shipped in PR #301 (`f857f1f`) and the branch realigned per housekeeping. This pass closed the remaining gap: backfilled the real **PR #301 / SHA `f857f1f`** into entry 146's artifacts line (had been a "recorded in git history" placeholder written pre-merge) and added this entry 147. Audited CLAUDE.md for staleness: this was a strategy/docs session with no content-count, convention, or engine change, so no CLAUDE.md edit needed. Shipped doc-only on the realigned branch.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (this entry + entry-146 SHA backfill). Doc-only PR + squash SHA recorded in git history.

## Entry 148 — 2026-07-05 (session 62)
- **Branch:** `claude/game-idea-strategy-h4t8m3` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > What is the best way to implement the game idea for this app? how to approach this? what tools to use, etc? what should be the strategy?
- **Response summary:** Strategy session, no app code changed (deliverable is the implementation plan, awaiting founder go-ahead). Wrote **`docs/plans/GAME_IMPLEMENTATION_PLAN.md`**, the engineering companion to `docs/strategy/GAME_CONCEPT.md`, resolving the tech-approach question the concept doc had deliberately left open. Core insight: the game is ~90% UI (battles are conversations, missions are forms/parody websites/dialogues), so React + the existing engines (dialogue runner, scoring, FSRS, pronounce matcher, TTS/STT, session composer) carry the gameplay; a game engine is needed only for the walkable pixel city. Four decisions: build inside Genauly as a lazy `/welt` route (not a separate app); React renders all scenes with Phaser (MIT, lazy chunk) deferred to the walkable-world phase (Godot/Unity rejected); missions become a lintable data bank (`data/missions.ts` + `engine/mission.ts`, closed scene-type union, CI graph checks, "mission #2 touches only data files" metric); one FSRS progression state with the scheduler as dungeon master for mission recurrence. Tool/cost map (itch.io modern-city pixel packs ~10–40 EUR, Aseprite, kenney.nl CC0 audio, Tiled, Phaser; asset licenses tracked like provenance). Phases G0–G4: redesign Phases 1–3 first as the on-ramp, then mission engine + Anmeldung vertical slice in React, Chapter 1 + real-user playtest gate, Phaser overworld, content scale. Also updated the concept doc's open-questions bullet to point at the new plan, plus the PROJECT_STATUS handoff and this entry.
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md` (new); `docs/strategy/GAME_CONCEPT.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 149 — 2026-07-05 (session 63)
- **Branch:** `claude/ux-ui-redesign-plan-2q7qrl` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > refer to two latest ux ui redesign reports uploaded on the repo and prepare a robust phase wise implementation plan with clude model recommendations for each task. for each phase give a brief non tech summary.
- **Response summary:** Planning session, no app code changed. Identified the two latest redesign reports as `docs/reference/GENAULY_UX_UI_ANALYSIS.md` (PR #300, 7-dimension UX audit) and `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md` (PR #301, lean-surface/deep-drawer strategy with the 4-phase skeleton), grounded their specs against the live code (Dashboard, Onboarding, SessionPlayer, AppShell, useSettingsStore defaults), and wrote the merged execution layer: **`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`**. Contents: a 5-point design north star; a Claude model legend (Haiku 4.5 mechanical sweeps, Sonnet 5 workhorse component work, Opus 4.8 near locked constraints / persist migrations / engine helpers, Fable 5 for illustration and grading design); four phases as per-task tables (task, files, model, rationale) each with a non-technical summary, acceptance criteria and risks: Phase 1 diet (defaults flip with settings-store persist migration, 3-element Heute, 1-screen onboarding + taster, Gloss, microcopy budget), Phase 2 stage (focus-mode session, combo + reward-gold tokens, loot end screen + `engine/collection.ts` Lv mapping with unit test), Phase 3 world seed (six SVG domain buildings, city strip, quest cards, Meine Sammlung), Phase 4 depth (typed forward-recall block, authentic Lesen/Hören block, visible progression), plus a Phase 5 backlog (Übersicht visuals, variable rewards, rephrase ladder). Added an execution-layer pointer to the top of `MINIMAL_UX_REDESIGN_PLAN.md`; updated PROJECT_STATUS (header + session-63 handoff, sequenced alongside session 62's game plan whose G0 phase is redesign Phases 1-3).
- **Artifacts:** `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md` (new), `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 150 — 2026-07-05 (session 63)
- **Branch:** `claude/ux-ui-redesign-plan-2q7qrl`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):** (four short follow-ups steering the same deliverable, combined here)
  > remember you are the best designer and engineer in the industry with impeccable reputation and award winning ability to design apps which are incredibly useful and also extremely talented in writing claude ai based implementation plan when writing the plan.
  > continue
  > continue
  > did you provide model recommendation in the above plan?
- **Response summary:** Raised the plan's quality bar in response to the first follow-up (added the design north star, per-phase acceptance criteria, sequencing rationale, and a per-phase /code-review pass before each PR), continued execution through plan approval, and confirmed that every task row carries a model recommendation with a one-line rationale plus the shared model legend. Same artifacts as entry 148.
- **Artifacts:** see entry 148.

## Entry 151 — 2026-07-05 (session 64)
- **Branch:** `claude/whats-next-2nk05a` (reassigned per session); `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):** (three prompts steering one deliverable, combined here)
  > What's next?
  > what model should be used for phase 1 tasks?
  > go ahead
- **Response summary:** Read the "Resume here" pointer, confirmed the approved next step was executing UX redesign **Phase 1 "The Diet"** (`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`), and listed the per-task model recommendations from the plan (1.1/1.3 Opus, 1.2/1.4 Sonnet, 1.5/1.6 Haiku). On "go ahead", executed all six Phase-1 tasks on Opus. **1.1** flipped `voiceVariety` + `recognitionEnabled` to default `true` in `useSettingsStore` with a persist **v1 → v2** migration that adopts the new defaults for existing users (flips a persisted `false → true`, never touches an existing `true`); STT support stays gated downstream. **1.2** slimmed Heute to three elements (CSS conic goal ring with streak, one gradient Start button, icon-first Situationen chips), deleting the stats-strip and Bibliothek cards and the `sessionPreview` eager import. **1.3** collapsed the 5-step onboarding to one setup card (goal+mode tile, CEFR chip row, consent before stored progress) handing off to a `/session?min=1` composed taster; name/exam/rhythm now default in-store. **1.4** added `src/features/shared/Gloss.tsx` (tap DE↔EN, no persistence, `stopPropagation` for tappable cards) wired into the flashcard reveal and speaking answer. **1.5** deleted the filler description sentence on 11 hub/page headers and codified a **microcopy budget** rule in `CLAUDE.md`. **1.6** all gates green: `build`, `typecheck`, `lint:content`, `test:unit` (23), `check:bundle` (main chunk 77.9 kB), `lint` (0 errors / 31 baseline warnings); self-review clean; no locked files touched. Updated PROJECT_STATUS (header + session-64 handoff) and this entry.
- **Artifacts:** `src/features/shared/Gloss.tsx` (new); `src/store/useSettingsStore.ts`, `src/features/dashboard/Dashboard.tsx`, `src/features/onboarding/Onboarding.tsx`, `src/features/session/SessionPlayer.tsx`, and the 11 header files (Analytics, WritingHub, SimulationHub, Settings, RedemittelTrainer, QuizHub, CollocationsBrowser, GrammarHub, AnwendenHub, VocabularyTrainer, ExamHub); `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 152 — 2026-07-05 (session 62)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > where does it cost me money and are there any free alternatives with comparable quality?
- **Response summary:** Cost breakdown of the game implementation plan (follow-up to entry 148 in the same session; numbered here after the parallel sessions 63–64 took 149–151). Only two paid items exist, both one-time and optional (~30–60 EUR total): the modern-city pixel asset packs (~10–40 EUR) and Aseprite (~20 EUR). Everything else is free with no catch: Phaser (MIT), Tiled, kenney.nl CC0 audio, browser TTS voices, and hosting (fully client-side, no servers or subscriptions, no recurring costs anywhere). Free alternatives assessed: Pixelorama/LibreSprite/Piskel replace Aseprite at comparable quality for this project's needs; Kenney CC0 tilesets + OpenGameArt replace the paid packs but with a real trade-off in setting and style consistency (free packs in the modern-everyday-German-city style are scarce; mixing artists reads as cheap and patching costs more time than the packs cost money). Decision recorded in the plan: art-blessing mockups are produced with free assets at zero spend; packs are bought only after the founder approves the direction. Plan doc's tooling section amended with a "Cost boundary" paragraph.
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 153 — 2026-07-05 (session 64)
- **Branch:** `claude/whats-next-2nk05a`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Executed UX redesign **Phase 2 "The Stage"** (`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`) on Opus, all five tasks. **2.1** added a transient `focusMode` flag to `useSessionStore` that the SessionPlayer sets while a block is on screen (via `useLayoutEffect`) and clears on the end screen / unmount; `AppShell` hides header + bottom bar + sidebar when `focusMode && pathname ∈ {/session,/revision}`, playing the session full-screen without touching the locked bottom-bar internals. **2.2** refactored SessionPlayer into a min-h-screen focus stage: top rail (✕ exit with a dialog-overlay confirm, thin progress, combo/XP), centered one-block-per-screen with horizontal slide transitions, display-size German; the 26a latency signal is preserved through a new `captureLoot` helper. **2.3** added a consecutive-correct combo counter (gold pulse at ≥3) and new `--reward`/`--reward-bg` HSL tokens + Tailwind `reward`/`reward-bg`, reserved for loot/combo/lit buildings. **2.4** added the pure `engine/collection.ts` (`cardLevel` FSRS-stability→Lv 0-5 bands, `leveledUp`) with 5 Vitest cases pinning the boundaries, the stable game contract. **2.5** built the loot-drop end screen: an animated gold `RewardRing` filling to the daily-goal %, reviewed words as `LootCard`s with `Lv n` and an ↑ on level-ups (before/after `cardLevel` around each synchronous `reviewVocab`), keeping the "Morgen: X festigen" hook. Broadened the focus gate to `/revision` after noticing QuickRevision reuses the same player. All gates green: build, typecheck, lint (0 errors), lint:content, test:unit (28), check:bundle (78.2 kB), test:srs (323). Updated CLAUDE.md (engine collection.ts + focus-mode/reward-token notes), PROJECT_STATUS (header + Phase-2 handoff), and this entry.
- **Artifacts:** `src/engine/collection.ts`, `tests/collection.test.ts` (new); `src/features/session/SessionPlayer.tsx`, `src/components/layout/AppShell.tsx`, `src/store/useSessionStore.ts`, `src/index.css`, `tailwind.config.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 154 — 2026-07-05 (session 64)
- **Branch:** `claude/whats-next-2nk05a`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation wrap-up for session 64 (UX redesign Phases 1 + 2). Most of the record was written inline as each phase shipped: the PROJECT_STATUS `_Last updated_` header and the two "Resume here" handoffs (Phase 1 part 1, Phase 2 part 2), prompt-log entries 151 (Phase 1) and 153 (Phase 2, renumbered from 152 during a rebase after a parallel session's PR #306 also claimed entry 152), and the CLAUDE.md updates (microcopy budget rule in Phase 1; `engine/collection.ts` engine-layout line + the focus-mode / reward-gold-token session-engine note in Phase 2). This pass closed the remaining staleness: flipped the `UX_REDESIGN_IMPLEMENTATION_PLAN.md` status line from "APPROVED PLAN / execution has not started" to "IN PROGRESS" with Phase 1 (PR #305) and Phase 2 (PR #307) marked shipped and Phase 3 as next, and added this entry. Audited PROJECT_STATUS + CLAUDE.md for other drift: content counts and locked-decision sections were untouched this session (UX-only work), so no further edits needed. Doc-only change shipped on the realigned branch.
- **Artifacts:** `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). Doc-only PR + squash SHA recorded in git history.

## Entry 155 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > do the task 3.1 of ongoing ux redesign plan.
- **Response summary:** Executed UX redesign **Phase 3 task 3.1** (`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`): the six flat SVG **domain buildings** as the seed of the game's city map. New module `src/components/city/domain-buildings.tsx`, patterned on the locked `route-icons.tsx` language: every mark two-tone (unique base accent + hard-coded brighter neon second tone) on a 20×20 grid. Buildings and palettes: Büro (indigo tower + neon-cyan annex), Bürgeramt (slate colonnade + neon-amber pediment), Bank (sky block + neon-cyan cornice + coin-ring emblem), Arztpraxis (rose clinic + neon roofband + glowing cross sign), Wohnhaus (teal house + neon roof/chimney, tone order inverted vs the Home route mark), Prüfungshalle (fuchsia dome hall + neon entablature + clock and triple arches). Each mark has unlit (quiet white windows) and **lit** states; lit swaps the glow elements to the Phase-2.3 reward-gold token `hsl(var(--reward))` (dark-mode aware, reserved for loot/combo/lit buildings). Optical sizing follows the route-icon NORM approach but anchored to a **common ground line** instead of a centred box, so the future city strip sits on one street level with a varied skyline. The `DOMAIN_BUILDINGS` registry pre-wires task 3.2: per-building `domains`/`themeIds` mastery sources (buergeramt lights from the behoerde theme; bank and wohnhaus deliberately empty until the banking/housing packs exist). Design was iterated by screenshotting a generated review sheet in headless Chromium (caught the Bank emblem reading as a person; reworked to a coin ring). Added `tests/domain-buildings.test.tsx` (registry uniqueness, unambiguous mastery sources, grid render, gold-only-when-lit; test:unit 33) and the founder review sheet `preview/domain-buildings-preview.svg` + generator `preview/gen-domain-buildings-preview.mjs`. Gates green: build, typecheck, lint (0 errors), lint:content, test:unit, check:bundle (78.2 kB; module joins the bundle in 3.2). Docs updated (status header, session-65 handoff, plan status line, this entry).
- **Artifacts:** `src/components/city/domain-buildings.tsx`, `tests/domain-buildings.test.tsx`, `preview/domain-buildings-preview.svg`, `preview/gen-domain-buildings-preview.mjs` (new); `docs/PROJECT_STATUS.md`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 156 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > The icons created have lot of sharp, uh, corners, uh, like pointed corners, which are not really the case with the existing icons in the app. Can you try to match the design language of the existing icons for the icons created now?
- **Response summary:** Soft-corner pass over all six domain-building marks so they match the rounded language of the existing route icons. Every rect now carries an `rx` (bodies/annex 0.9–1.2, bands and plinths 0.6–0.85, windows/doors 0.4–0.6) and the pointed shapes are rounded with a same-color stroke using `strokeLinejoin="round"`: the Bürgeramt pediment (inset triangle + 1.3 stroke), the Wohnhaus roof (same trick), and the Prüfungshalle dome (1.2 stroke rounds its base corners). To keep the new rounded corners from leaving notches at seams, bodies were tucked under their wider neighbors and draw order adjusted: Bank and Arztpraxis bodies extend up behind their cornice/roofband, the Prüfungshalle body up behind its entablature, the Wohnhaus body up behind the roof (roof now draws last), and the Bürgeramt columns/gaps extend under the architrave above and the plinth below. Verified visually by regenerating the review sheet and screenshotting it in headless Chromium (light/dark × unlit/lit); geometry mirrored in both the TSX module (source of truth) and the preview generator. A "soft corners, don't add sharp shapes" rule was added to the module header and the PROJECT_STATUS handoff. Gates green: build, typecheck, lint (0 errors), test:unit (33), check:bundle (78.2 kB).
- **Artifacts:** `src/components/city/domain-buildings.tsx`, `preview/gen-domain-buildings-preview.mjs`, `preview/domain-buildings-preview.svg`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 157 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I don't like the lit versions. I prefer the latest unlit versions as the lit versions. come up with another set for unlit versions
- **Response summary:** Redesigned the domain buildings' state pair per founder preference. The former unlit look (bright white windows, doors and emblems; subtle slate colonnade gaps on the Bürgeramt; white coin ring on the Bank) is now the **lit** state. The new **unlit** state renders the same openings as dark shades (`#0c1222` at 0.24–0.3 opacity), so an unlit building keeps its colors but clearly has the lights off; verified in headless-Chromium screenshots that both states read in light and dark themes. Reward-gold is now fully out of the building marks: removed the `hsl(var(--reward))` usage from `domain-buildings.tsx`, updated the unit test to pin the new contract (dark openings only when unlit, no reward token in either state), and narrowed the reward-token reservation comments from "loot / combo / lit buildings" to "loot / combo moments" in `index.css`, `tailwind.config.ts` and CLAUDE.md (with a note that gold windows were tried and rejected, so a future session does not reintroduce them). Preview generator + committed review sheet regenerated. Gates green: build, typecheck, lint (0 errors), test:unit (33), check:bundle (78.2 kB).
- **Artifacts:** `src/components/city/domain-buildings.tsx`, `tests/domain-buildings.test.tsx`, `preview/gen-domain-buildings-preview.mjs`, `preview/domain-buildings-preview.svg`, `src/index.css`, `tailwind.config.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 158 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead with the next step
- **Response summary:** Executed UX redesign **Phase 3 task 3.2**, the city strip on Heute. New pure helper `src/components/city/mastery.ts`: `cityProgress(srs)` resolves each domain building's contributing themes (a building's explicit `themeIds` claim first, then domain rollup; a theme never counts twice), computes the mastered-word share per building (same mastery ≥ 0.8 bar as the Analytics theme grid and the session composer), lights a building at `LIT_THRESHOLD = 0.4`, and exposes each building's least-mastered theme as its session target. New `src/components/city/CityStrip.tsx` renders the six buildings ground-aligned on a street line inside a surface card as the fourth Heute element, no header and no visible copy (aria-labels carry the percentages); tapping a building starts `/session?theme=<weakest theme>`; Bank and Wohnhaus (future packs) render unlit and inert. Bundle discipline: the first cut imported the vocabulary bank statically from the Dashboard and blew the main chunk from 78 to 330 kB, so the strip is `React.lazy` behind a fixed-height Suspense fallback; final main chunk 78.6 kB with the strip in its own ~7 kB chunk. CLAUDE.md's eager-path rule was rewritten to the current truth (Dashboard imports no content bank; bank-dependent Heute elements go in lazy chunks). Added `tests/city-mastery.test.ts` (5 cases: fresh profile fully unlit, every word counted at most once, future packs inert, mastering behoerde lights the Bürgeramt at the threshold without leaking into other buildings, weakest-theme selection); test:unit 38. Verified against the running dev server with a seeded profile (onboarded user + 11 mastered behoerde words) via headless-Chromium screenshots at mobile width. Gates green: build, typecheck, lint (0 errors), test:unit, check:bundle (78.6 kB).
- **Artifacts:** `src/components/city/mastery.ts`, `src/components/city/CityStrip.tsx`, `tests/city-mastery.test.ts` (new); `src/features/dashboard/Dashboard.tsx`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 159 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > What's next now?
- **Response summary:** Chat-only answer (chronologically this prompt came between entries 157 and 158, before the "go ahead" that executed task 3.2). Laid out the remainder of redesign Phase 3 per the plan: 3.2 city strip on Heute from `useProgressStore` mastery, 3.3 Fortschritt as quest board (city view + claimable Can-Do quest card, charts under an expandable "Details"), 3.4 „Meine Sammlung" bag view on `engine/collection.ts`, 3.5 Bibliothek presentation-only pass, 3.6 gates + ship watching the bundle budget. Noted all are Sonnet-tier wiring (the Fable illustration work is done), roughly one session for 3.2–3.6, and that Phase 4 "The Depth" (typed forward-recall, authentic Lesen/Hören) follows. Offered to proceed.
- **Artifacts:** none (chat only).

## Entry 160 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what model should I use for the next step
- **Response summary:** Chat-only answer. Per the plan's model table: **Sonnet 5** for tasks 3.3 and 3.4 (presentational wiring over existing data, no locked constraints or engine logic in play; the Fable-tier illustration task is done). Recommended running 3.3–3.6 in one Sonnet 5 session rather than micro-switching to Haiku for the two mechanical closers, and starting that session from the PROJECT_STATUS "Resume here" handoff, which carries the 3.2 lessons (lazy-load anything touching the vocabulary bank; no reward-gold in building marks; Analytics is already a lazy route so it may import the mastery helper directly).
- **Artifacts:** none (chat only).

## Entry 161 — 2026-07-05 (session 65)
- **Branch:** `claude/ux-redesign-task-3-1-4cgajs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document this session and give me a prompt for new session
- **Response summary:** Documentation wrap-up for session 65 (redesign tasks 3.1 + 3.2 and the two founder design rounds, PRs #309–#312). Most of the record was written inline as each piece shipped: the PROJECT_STATUS header and two-part "Resume here" handoff, prompt-log entries 155–158, the plan status line, and the CLAUDE.md updates (city module layout line, rewritten eager-path bundle rule, narrowed reward-gold reservation). This pass added the missing pieces: a new **DECISIONS.md section** locking the domain-building visual language with its "why" (soft corners only + the stroke-join rounding technique and seam-tucking draw order; lit = white windows / unlit = dark openings with reward-gold rejected for buildings and pinned by unit test; ground-aligned normalisation; the preview-sheet review workflow), plus prompt-log entries 159–161 for the session's chat-only prompts and this one. Also delivered the founder a ready-to-paste prompt for the next session (execute Phase 3 tasks 3.3–3.6 on Sonnet 5, starting from the PROJECT_STATUS handoff).
- **Artifacts:** `docs/DECISIONS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Doc-only PR + squash SHA recorded in git history.
