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

## Entry 162 — 2026-07-05 (session 66)
- **Branch:** `claude/ux-redesign-phase-3-rsyqlt`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Read the "Resume here" section of docs/PROJECT_STATUS.md, then execute UX redesign Phase 3 tasks 3.3 to 3.6 from docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md:
  > 3.3 Fortschritt becomes the quest board: lead with the city view (reuse CityStrip / cityProgress from src/components/city) plus the next Can-Do milestone as a claimable quest card driven by canDo.ts thresholds; collapse charts, calendar and the mastery grid under an expandable "Details" section whose expanded flag persists in useSettingsStore.
  > 3.4 Build the "Meine Sammlung" bag view: savedWords plus mastered items as a browsable collection using the Lv 1-5 levels from engine/collection.ts, reachable from Fortschritt.
  > 3.5 Bibliothek presentation pass, styling only: the German word leads each row at higher weight, meta demoted to one quiet line; structure, facets and search unchanged.
  > 3.6 Run all gates (build, lint, lint:content, test:unit, check:bundle), then ship via PR to main, squash-merge, realign the branch, and update the docs (PROJECT_STATUS, SESSION_PROMPT_LOG, and any stale CLAUDE.md facts).
  > Constraints: no reward-gold in building marks (lit = white windows, see DECISIONS.md); anything importing a content bank from eager code must be lazy-loaded (Analytics is already a lazy route, so it may import components/city/mastery.ts directly); respect the microcopy budget and the no-em-dash rule.
- **Response summary:** Executed redesign Phase 3 tasks 3.3–3.6, completing "The World Seed". **3.3:** `src/features/analytics/Analytics.tsx` now leads with `<CityStrip/>`, a next-quest card (nearest unachieved `canDo.ts` milestone by threshold gap, progress bar + session CTA, with an all-done fallback state), and a "Meine Sammlung" entry card; the XP chart, per-theme mastery grid, vocab-mastery chart and activity calendar moved behind a plain-button "Details" disclosure gated on new `useSettingsStore.progressDetailsExpanded` (additive persisted key, no migration needed). **3.4:** new `src/features/collection/Sammlung.tsx` (route `/sammlung`, lazy, off-nav deep link like `/quiz`) lists every bookmarked or `cardLevel >= 1` word as a `Lv n`-badged card with a level filter, reusing `usePagedList` and the existing bookmark toggle; `engine/collection.ts` untouched. **3.5:** styling-only pass on `VocabList.tsx`, `CollocationsBrowser.tsx` and `RedemittelTrainer.tsx` row cards — the lead German word/phrase bumped to `text-base font-semibold sm:text-lg`, the English gloss (plus plural or the Redemittel note) collapsed into one quiet `text-xs` line; no structural, facet or search changes. **3.6:** all gates green — `build`, `typecheck`, `lint` (0 errors, the same 31 baseline warnings), `lint:content`, `test:unit` (38, unchanged), `test:srs` (323), `check:bundle` (main chunk 78.9 kB). Updated `docs/PROJECT_STATUS.md` (header + a new "Resume here" session-66 handoff), the plan's status line and task table, and `CLAUDE.md`'s Layout section (new `features/collection/Sammlung.tsx` bullet).
- **Artifacts:** `src/features/analytics/Analytics.tsx`, `src/features/collection/Sammlung.tsx` (new), `src/router.tsx`, `src/store/useSettingsStore.ts`, `src/features/vocabulary/VocabList.tsx`, `src/features/collocations/CollocationsBrowser.tsx`, `src/features/redemittel/RedemittelTrainer.tsx`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). **PR #314**, squash-merged to `main` at **`e077af3`**; dev branch realigned (`git reset --hard origin/main` + force-with-lease push).

## Entry 163 — 2026-07-05 (session 66)
- **Branch:** `claude/ux-redesign-phase-3-rsyqlt`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session and give me prompt for next session
- **Response summary:** Documentation wrap-up for session 66 (redesign Phase 3 tasks 3.3–3.6, PR #314). Most of the record was already written inline while shipping (the PROJECT_STATUS header + session-66 "Resume here" handoff, the plan's status line and task table, the CLAUDE.md Layout bullet, prompt-log entry 162). This pass filled in the one gap left as a placeholder: entry 162's Artifacts line now records the real **PR #314** and squash SHA **`e077af3`** instead of "PR # + squash SHA recorded in git history", plus this entry 163. Delivered the founder a ready-to-paste prompt for the next session below (Phase 4 "The Depth" is unscoped; the next session's first job is to turn it into a task table like Phase 3's, using `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`'s Phase 4 sketch as the source).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (modified). Doc-only, no PR needed unless the founder wants this pushed as a follow-up commit.

## Entry 164 — 2026-07-05 (session 67)
- **Branch:** `claude/phase-4-task-breakdown-3vn7b8`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Read the "Resume here" section of docs/PROJECT_STATUS.md. UX redesign Phase 3 "The World Seed" is complete (tasks 3.1–3.6, all shipped). Phase 4 "The Depth" (typed forward-recall, authentic Lesen/Hören) is not yet scoped into tasks.
  > First, turn Phase 4 into a task table like Phase 3's: read docs/plans/MINIMAL_UX_REDESIGN_PLAN.md's Phase 4 sketch and docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md's structure, then draft the task breakdown with per-task files and model recommendations (Fable for original assets, Sonnet for wiring, Haiku for mechanical gates), and check in with me before executing — I want to confirm scope and priority against docs/plans/GAME_IMPLEMENTATION_PLAN.md (still PROPOSED) before committing a session to it. Set a timer for yourself for 11:50 pm to continue then because I'm approaching token limit and that's when my next session renews.
  > (follow-up: I meant 11:50 pm CET)
- **Response summary:** Read the three plan docs and the PROJECT_STATUS "Resume here" handoff, then expanded the Phase 4 sketch into a Phase-3-granularity task table in `UX_REDESIGN_IMPLEMENTATION_PLAN.md`: 6 tasks (4.1 typed-recall grading engine / Fable, 4.2 typing block / Opus, 4.3 Lesen/Hören content bank / Fable, 4.4 reading-listening composer block / Opus, 4.5 progression chip / Sonnet, 4.6 gates-ship / Haiku), each with files + model rationale, plus a suggested 2–3 session split (A = 4.1+4.2, B = 4.3+4.4, C = 4.5+4.6). Committed as `fa7d023` (branch only, NOT merged) pending founder confirmation; surfaced the two open questions (Phase 4 vs game-plan G1 priority; approve the breakdown/split) and set a `send_later` self-timer for 23:52 CET (11:50 pm + 2 min buffer past window renewal).
- **Artifacts:** `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md` (modified), commit `fa7d023`. Self-timer trigger `trig_01TRLQYbwG62Vgg8z2bYCpFf`.

## Entry 165 — 2026-07-05 (session 67)
- **Branch:** `claude/phase-4-task-breakdown-3vn7b8`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > do 4.1 now
- **Response summary:** Executed Phase 4 task 4.1, the typed-recall grading engine. New pure `src/engine/typing.ts` with `gradeTyped(typed, expected)` returning a three-tier verdict (correct/almost/wrong + optional `reason`) designed to map onto the FSRS Grade scale (Good/Hard/Again). Rules: alternate umlaut/ß spellings fold to digraphs on both sides (fully correct, Bär/Bar kept distinct); spacing + hyphenation interchangeable; article and reflexive "sich" graded separately from the head word (missing/wrong lead with a correct head = "almost", never a fail or a pass); typo tolerance tighter than the spoken matcher (0/1/2 edits by length) grading "almost"; no containment credit. Exported `levenshtein` from `engine/pronounce.ts` for reuse (behavior unchanged, `test:pronounce` 26 green). 18 new Vitest cases in `tests/typing.test.ts` (`test:unit` 38 → 56) including a contrast test vs `matchesSpoken` containment. All gates green (build, typecheck, lint 0 errors, lint:content, check:bundle 78.9 kB unchanged since the engine has no consumer yet). Shipped via **PR #316**, squash-merged to `main` at **`8bbe1d6`**; dev branch realigned (reset --hard origin/main + force-with-lease). Plan doc updated to mark 4.1 executed.
- **Artifacts:** `src/engine/typing.ts` (new), `tests/typing.test.ts` (new), `src/engine/pronounce.ts`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md` (modified). **PR #316**, squash SHA **`8bbe1d6`**.

## Entry 166 — 2026-07-05 (session 67)
- **Branch:** `claude/phase-4-task-breakdown-3vn7b8`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > (self-timer fired at 23:52 CET) Resume the Phase 4 planning thread: check whether the founder confirmed scope/priority; if confirmed proceed, else re-surface the two open questions and wait.
- **Response summary:** Timer fired after the thread had already advanced (the founder said "do 4.1 now" and 4.1 shipped as PR #316). Rather than re-ask stale questions, did the deferred documentation pass for session 67: PROJECT_STATUS header + a new session-67 "Resume here" handoff (Phase 4 scoped, 4.1 shipped, 4.2-vs-G1 decision framed), and prompt-log entries 164–166. Re-surfaced the one genuinely open decision (continue with task 4.2 to finish Session A, or pivot to game-plan G1) and waited.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Doc-only.

## Entry 167 — 2026-07-05 (session 68)
- **Branch:** `claude/task-4-2-ueh4yw`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > do task 4.2
- **Response summary:** Executed Phase 4 task 4.2, the typed-recall block in the loop (finishing Session A). Added a `kind: "typing"` variant to `SessionBlock` (vocab-only forward recall, same shape as `speaking`). In the composer (`engine/session.ts`), added `graduatedToTyping(card)` + `TYPING_STABILITY_FLOOR` (8 days): a due card graduates from a recognition flashcard to typed forward recall once it is `reps >= 2` AND `(stability ?? interval) >= 8`, so new/young cards stay on flashcards. Pool 1 now emits `typing` blocks (`ty_` key) for graduated cards. New `TypingBlock` renderer in `SessionPlayer.tsx`: EN prompt display-size, typed DE input graded by 4.1's `gradeTyped`, an "Anzeigen" reveal that grades as a miss, three-tier feedback (success/warning/danger) with the answer + SpeakButton + example, latency captured mount→answer. Verdict maps onto the SRS `Grade` scale (correct → 4, almost → 3/Hard, wrong → 0) so near-misses schedule gently; combo/XP reward only a clean correct. Refactored `captureLoot` to take an explicit `Grade` (all callers updated). 3 new composer Vitest cases (`test:unit` 56 → 59). All gates green (build, typecheck, lint 0 errors, lint:content, check:bundle main chunk 78.9 kB). Shipped via PR → squash-merge → branch realign.
- **Artifacts:** `src/types/index.ts`, `src/engine/session.ts`, `src/features/session/SessionPlayer.tsx`, `tests/engine.test.ts`, `docs/PROJECT_STATUS.md`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). **PR #318**, squash SHA **`09c3886`**.

## Entry 168 — 2026-07-05 (session 68)
- **Branch:** `claude/task-4-2-ueh4yw`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > What's model recommendation for the next tasks
- **Response summary:** Restated the per-task model recommendations already in the Phase 4 table for the remaining tasks: 4.3 Lesen/Hören content bank → **Fable 5** (authored CEFR-calibrated German + new schema contract), 4.4 reading/listening composer block + renderer → **Opus 4.8** (new first-class block kind, weighting + focus-mode, regression-sensitive), 4.5 progression chip → **Sonnet 5** (small derived-state UI), 4.6 gates/ship/docs → **Haiku 4.5** (mechanical). Recommended the split Session B = 4.3 + 4.4 (Fable authors, then Opus builds, as a hand-off not parallel work since 4.4 depends on 4.3's schema), short Session C = 4.5 + 4.6. Flagged the standing alternative of pivoting to game-plan G1 (Opus), while recommending finishing Session B first.
- **Artifacts:** none (advisory answer, no file changes).

## Entry 169 — 2026-07-05 (session 68)
- **Branch:** `claude/task-4-2-ueh4yw`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation pass for session 68. The core status docs were already updated when 4.2 shipped (PROJECT_STATUS header + a new session-68 "Resume here" handoff; the Phase 4 plan marking 4.2 ✅ and Session A complete; prompt-log entry 167). This pass filled entry 167's PR/SHA (PR #318, `09c3886`) and appended prompt-log entries 168 (model-recommendation Q&A) and 169 (this documentation request) so every founder prompt of the session is captured. Shipped via PR → squash-merge → branch realign.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded on merge.

## Entry 170 — 2026-07-06 (session 69)
- **Branch:** `claude/task-4-3-2mzx51`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > implement task 4.3
- **Response summary:** Executed Phase 4 task 4.3, the Lesen/Hören content bank (first half of Session B). New `src/data/texts.ts` with 10 authored authentic-style B1–B2 texts across 9 themes in the five planned genres: 2 Behörden letters (Anmeldung appointment B1.2/meldewesen, missing Wohngeld documents with deadline B2.1/antrag), 2 workplace emails (rescheduling B1.2, complaint response B2.1/reklamation), 2 memos (meeting minutes B2.1/entscheidung, project status B2.2), 2 announcements (IT maintenance B1.2, warehouse safety briefing B2.1), 2 voicemail scripts (flight rebooking B1.2, delivery delay B2.1; these double as TTS listening input in 4.4). Each carries a German title + full text, an English gloss and 2–3 German MCQ comprehension checks with English explains (30 checks total); all names/numbers fictitious, no em dashes. New types `TextKind`/`TextCheck`/`ReadingText` and `"text"` added to `ProvenanceContentType`. Linter gained the `TEXT_KINDS` closed-enum mirror plus `lintTexts` (kind/themeId/cefr enums, required fields, checks length >= 2 as an error, answer among options, globally unique check ids, subThemeId cross-check, tx_ prefix warning); the bank is loaded, counted and wired into the provenance cross-check. 10 authored/OWNED provenance rows at review_status "draft" (CoE level descriptors cited as CEFR calibration reference); register now 1,121 rows. `/sources` page got the label + order entry the `Record<ProvenanceContentType, ...>` map requires. Gates all green: lint:content (10 texts / 30 checks, 0 errors/warnings), build, lint 0 errors, test:unit 59, check:bundle 78.9 kB unchanged (no eager consumer). Shipped via PR #320, squash-merged to main at `f09da8e`, branch realigned. Docs updated (plan 4.3 checkmark, PROJECT_STATUS header + session-69 handoff + content counts, CLAUDE.md counts, this entry).
- **Artifacts:** `src/data/texts.ts` (new), `src/types/index.ts`, `scripts/lint-content.mjs`, `src/data/provenance.ts`, `src/features/legal/Sources.tsx`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md` (modified). **PR #320**, squash SHA **`f09da8e`**.

## Entry 171 — 2026-07-06 (session 69)
- **Branch:** `claude/task-4-3-2mzx51`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > (after switching the session model to Opus 4.8:) continue
- **Response summary:** With 4.3 shipped (entry 170) and the model switched to Opus 4.8, "continue" was the signal to proceed to Phase 4 **task 4.4** (the plan's Opus task, second half of Session B): the Lesen/Hören composer block + renderer. Added a first-class `kind: "reading"` `SessionBlock` (`textId` + `listening` flag). Composer (`engine/session.ts`): Pool 6 emits exactly one reading block per session, preferring a text on the scoped/weak theme, else the active Mode lens, else any; a voicemail text plays as a **listening** variant when the caller reports TTS (new pure `listening` opt, player passes `ttsSupported()`), every other genre renders as readable text. New `src/features/session/ReadingBlock.tsx` renderer, extracted so `SessionPlayer` stays under the plan's ~1000-line line: a two-stage full-screen focus block, read/listen the passage (tap-gloss title, `Übersetzung` toggle, TTS play/replay + `Text anzeigen` reveal for the listening variant) then the 2–3 comprehension MCQs one at a time, reusing the quiz MCQ styling + `explain`. Scoring: `XP.readingCheck` (8) per correct check; the block registers ONE aggregate tally result (majority-correct) at completion so it never inflates correct/total, and it **never touches vocab FSRS** (comprehension practice, not a graded SRS card, keeping 4.5's "no new state" invariant intact). Wired into `SessionPlayer` with `listening: ttsSupported()`. 3 new composer Vitest cases (one-block, listening-gating, theme-scope); `test:unit` 59 → 62. All gates green (build, typecheck, lint 0 errors, lint:content, check:bundle main chunk 78.9 kB — bank + renderer ride the lazy session chunk). Shipped **PR #322**, squash-merged at **`98c4688`**, branch realigned. Verification note: no Playwright module was available to drive the new block in a browser, so verification rests on the composer unit tests + green typecheck (`noUnusedLocals` proves every import is exercised) and the renderer reusing the proven MCQ pattern; a live check on the deployed site is worth doing. Session B (4.3 + 4.4) is complete; tasks 4.5 + 4.6 remain.
- **Artifacts:** `src/types/index.ts`, `src/engine/scoring.ts`, `src/engine/session.ts`, `src/features/session/ReadingBlock.tsx` (new), `src/features/session/SessionPlayer.tsx`, `tests/engine.test.ts`. **PR #322**, squash SHA **`98c4688`**. Docs (plan 4.4 checkmark + PROJECT_STATUS handoff + CLAUDE.md session-engine anchor + this entry): **PR #323** (`f41db39`).

## Entry 172 — 2026-07-06 (session 69)
- **Branch:** `claude/task-4-3-2mzx51`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the second and provide me with prompts for next sessions
- **Response summary:** Tidied the prompt log so each founder prompt owns one entry: entry 170 = "implement task 4.3", entry 171 rewritten to be the clean "continue" → task 4.4 entry (previously it redundantly re-documented 4.3). Confirmed task 4.4's substantive docs were already shipped in PR #323 (plan checkmark, PROJECT_STATUS session-69 handoff, CLAUDE.md session-engine anchor + ReadingBlock in the layout list). Provided the founder with ready-to-paste prompts for the next sessions (Session C: task 4.5 progression chip, then 4.6 wrap; plus the standing game-plan G1 alternative). Doc-only.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded on merge.

## Entry 173 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > does the plan provide model recommendations for the tasks? and also a phase wise non tech executive summary?
- **Response summary:** Honest answer: it had neither (the game plan predates the session-63 convention set by `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`). Both added to `docs/plans/GAME_IMPLEMENTATION_PLAN.md` in that plan's format: (1) a plain-words executive summary, one paragraph per phase G0–G4, non-technical; (2) a "Claude model recommendations" section with the shared four-tier table (Haiku 4.5 / Sonnet 5 / Opus 4.8 / Fable 5) and a per-task model map across the phases (Fable for the mission schema + Anmeldung content + chapter-arc design + pixel mockups; Opus for dialogue-battle wiring, FSRS-recurrence composer logic, and the React↔Phaser bridge; Sonnet as the workhorse for scene renderers and mission data at volume; Haiku for gates + ship), including the "open on the strongest-model task, then downshift" working pattern and a `/code-review` pass before each phase PR. Also refreshed the plan's G0 status while rebasing over the parallel sessions' work: redesign Phases 1–3 (plus Phase 4 Sessions A+B) are fully shipped, so the G0 prerequisite is COMPLETE and G1 is eligible now.
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 174 — 2026-07-06 (session 70)
- **Branch:** `claude/phase-4-session-c-tasks-79shhv`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Finish Phase 4 Session C: implement task 4.5 (progression chip) and then task 4.6 (gates + docs wrap), shipping each to main.
- **Response summary:** Executed the final two tasks of Phase 4. **4.5** (progression chip): new `src/lib/phase.ts` exporting a pure `themePhase(ratio)` function mapping a theme's existing mastery ratio to a three-step **Aufbau → Festigen → Gemischt** label, reusing the app's two existing mastery bars (below the city `LIT_THRESHOLD` 0.4 = Aufbau, below the SRS `mastery() >= 0.8` "mastered" bar = Festigen, at/above it = Gemischt) so the ladder lines up with bars learners already see elsewhere; no new state, both call sites (`Analytics.tsx` theme grid, `components/city/mastery.ts` city progress) already compute the ratio. Wired a phase `Badge` onto each row of the Fortschritt "Beherrschung nach Thema" grid, and folded the phase label into `CityStrip`'s per-building `aria-label`/`title` (the existing "tap" affordance) alongside the mastery percentage. Shipped standalone via a first commit. **4.6** (gates + docs wrap): ran the full gate suite (`pnpm install` first, since `node_modules` was missing in the fresh session) — `build`, `typecheck`, `lint` (0 errors, only the documented pre-existing react-hooks warnings), `test:unit` 62 passed, `test:srs` 323 checks, `test:pronounce` 26 checks, `check:bundle` main chunk 79.0 kB, `lint:content` 0 errors. Updated docs: `CLAUDE.md` `lib/` file list gained `phase.ts`; `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md` marked 4.5/4.6 ✅ and Phase 4 COMPLETE; `docs/PROJECT_STATUS.md` got a new session-70 "Resume here" handoff (with the two oldest handoffs, sessions 68 and 69's 4.3-only entry, rotated into `docs/archive/PROJECT_STATUS_ARCHIVE.md` per the two-most-recent rule) and a trimmed top summary line; this prompt-log entry. Rebased over the parallel session-62 game-plan doc update (entry 173) that landed on `main` concurrently. Both tasks pushed to `main` via PR → squash-merge → branch realign, closing out Phase 4.
- **Artifacts:** `src/lib/phase.ts` (new), `src/features/analytics/Analytics.tsx`, `src/components/city/CityStrip.tsx` (4.5). `CLAUDE.md`, `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (4.6). PR #s + squash SHAs recorded on merge.

## Entry 175 — 2026-07-06 (session 71)
- **Branch:** `claude/frontend-design-audit-6r743d`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you do a thorough audit of the front end design, brand and visual assets and provide me with a report on weaknesses and top 5 recommendations?
- **Response summary:** Read-only design/brand audit, delivered as `docs/plans/DESIGN_AUDIT_2026-07-06.md` (no app code changed). Reviewed the token system (`tailwind.config.ts`, `src/index.css`), `index.html`/PWA manifest, all `public/` brand assets, the shared component layer, app chrome, landing page, and repo-wide color/a11y greps. Verdict: the token + component architecture is genuinely strong; the gaps are coherence and outward-facing surfaces. Weaknesses found: (A) zero social/link-preview metadata and no OG image or canonical URL, no SVG logo master, three near-identical brand indigos, stale `favicon.svg` still shipped + SW-precached, dark-only `theme-color`; (B) five parallel accent systems (~43 raw Tailwind palette classes + 57 hex literals) so zones wear different colors on different surfaces; (C) wrong-theme boot flash for light-mode users (hardcoded `class="dark"` + dark splash, default themeMode `system`); (D) unregulated Denglish (CTA labels disagree: "Kostenlos starten" vs "testen"; "a Arztbesuch"; `html lang="en"` vs manifest `lang: "de"`); (E) contrast failures (`text-warning` ~2.2:1 as text) and button-instead-of-link navigation on the landing page; (F) minor: single-face typography, no German hyphenation strategy. Top-5 recommendations (impact ÷ effort): 1) ship OG/twitter meta + 1200×630 share image + canonical; 2) define ONE brand indigo + a curated zone palette as tokens and remap themes/hubs/nav onto it; 3) CSP-safe pre-boot theme script + light/dark `theme-color` metas + theme-aware splash; 4) codify the Sprachmix voice rule in CLAUDE.md and sweep the landing copy, set `lang="de"`; 5) contrast + link-semantics a11y pass. Also flagged: create an SVG logo master, remove/replace the stale `favicon.svg`. Docs updated per workflow (this entry + PROJECT_STATUS handoff, session-69 handoff rotated to the archive).
- **Artifacts:** `docs/plans/DESIGN_AUDIT_2026-07-06.md` (new), `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md`. PR # + squash SHA recorded on merge.

## Entry 176 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > give me a prompt to start in a new session
- **Response summary:** Provided two ready-to-paste prompts for the next sessions, now that the parallel sessions (63–71) have completed the entire UX redesign (Phases 1–4) plus the design/brand audit, leaving game Phase G1 as the standing next step. Primary prompt: approve and start **G1** (read `docs/plans/GAME_IMPLEMENTATION_PLAN.md` + `docs/strategy/GAME_CONCEPT.md`, build the Mission/Scene schema + `engine/mission.ts` runner + lint checks first, then scene renderers and the Anmeldung mission content, free placeholder art only, normal PR flow, announce model downshift points), to be run on Fable 5 per the plan's model map. Secondary optional prompt: the pre-G1 **pixel-art mockups** for the founder's art blessing (2–3 Anmeldung scenes, free assets, zero spend, no purchases, no game code). Doc-only ship: this entry.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded in git history.

## Entry 177 — 2026-07-06 (session 71)
- **Branch:** `claude/ux-audit-gap-analysis-91yadk`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > do a comprehensive audit and gap analysis of ux implementation that's done the latest. provide me with a detailed report.
- **Response summary:** Ran a full code-level audit of the UX redesign (Phases 1–4, sessions 63–70) against `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`, verifying each of the 22 tasks against the actual code (not the docs' "COMPLETE" claims) via four parallel per-phase code reviews, and re-ran every gate from a clean install (all green: build, typecheck, lint 0 errors, lint:content 10 texts/30 checks, test:unit 62, test:srs 323, test:pronounce 26, check:bundle 79.0 kB). Verdict: the redesign is faithfully implemented, not doc-inflation; all locked invariants intact (persist migration `v1→2` flips only false→true with no wipe; FSRS `latencyMs` reaches `reviewVocab` on every main graded path; focus mode route-guarded with iOS `translateZ`/`no-callout` fixes intact; reward-gold tokens match spec; `engine/collection.ts` band mapping clean + unit-tested; typed grader sound; reading block never touches vocab FSRS). Gaps surfaced: (1) 🔴 a latent eager-bundle landmine — `intentCards.ts` statically imported `filterVocab` from the 245 kB vocab bank, kept out of the main chunk only by tree-shaking dead `cardMeta`/`cefrRange`; (2) 🟠 the promised Can-Do "claim moment" was silently passive; (3) 🟡 onboarding defers name/exam-date to Settings (which covers them, acceptable); (4) 🟡 word-order quiz feeds FSRS without a latency sample (pre-existing); (5) 🟡 `bank`/`wohnhaus` city buildings can't light (await content packs). Wrote the report both in chat and as `docs/plans/UX_AUDIT_2026-07-06.md`.
- **Artifacts:** `docs/plans/UX_AUDIT_2026-07-06.md` (new). Fixes shipped under entry 178.

## Entry 178 — 2026-07-06 (session 71)
- **Branch:** `claude/ux-audit-gap-analysis-91yadk`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead with your recommendations
- **Response summary:** Implemented the two actionable audit recommendations. **(1) Eager-bundle de-risk:** removed the dead `cardMeta`/`cefrRange` helpers and the `filterVocab`/`CEFR_ORDER` imports from `src/features/dashboard/intentCards.ts`, so the eager Dashboard path no longer has any static edge into a content bank — Heute's ~78 kB eager-path invariant is now structural rather than an accident of tree-shaking (main chunk unchanged, 79.1 kB). **(2) Quest claim moment:** added a persisted `claimedMilestones: string[]` + idempotent `claimMilestone(id)` action to `useSettingsStore` (rides cloudSync via the settings jsonb blob, `SettingsSnapshot` is derived from the store so no cloudSync change and no persist version bump needed — a new field merges to its default). Fortschritt (`Analytics.tsx`) now renders a reward-gold, spring-in (framer-motion, reduced-motion honored via the global `MotionConfig`) "Quest geschafft · <Thema>" card for any achieved-but-unclaimed Can-Do milestone, with an "Einlösen" button that claims it and advances to the next unclaimed win; count suffix when several are waiting. Added a `claimMilestone` idempotency unit test (`tests/stores.test.ts`, test:unit 62 → 63). Verified gap #3 (onboarding-deferred fields) as acceptable — name/XP-goal/exam-date are all editable in `Settings.tsx`, so no code change. All gates green. Docs: audit report `docs/plans/UX_AUDIT_2026-07-06.md` "Actions taken" section, `docs/PROJECT_STATUS.md` session-71 handoff, this entry.
- **Artifacts:** `src/features/dashboard/intentCards.ts`, `src/store/useSettingsStore.ts`, `src/features/analytics/Analytics.tsx`, `tests/stores.test.ts`, `docs/plans/UX_AUDIT_2026-07-06.md`, `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md`. PR # + squash SHA recorded on merge.

## Entry 179 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what's this blessing part you keep talking about?
- **Response summary:** Explained the docs' shorthand: "blessing" = the founder's explicit approval of the pixel-art direction, a gate set in `GAME_CONCEPT.md` (session 54) because art style is a taste/brand decision only the founder can make (precedent: rejected gold windows, the long tab-bar iteration). The rule: no asset purchases and no shipped sprites until the founder approves 2–3 mockup scenes, which cost nothing to produce. Answer was interrupted mid-delivery by the next prompt; no artifacts.
- **Artifacts:** none (chat answer only; logged here).

## Entry 180 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > before we move ahead with the game implementation, I want you to write a detailed gameplan with storyline with descriptions of each mission, what are various elemnts of the game, how the player interacts, etc, etc. Provide this as a well-formatted slide deck.
- **Response summary:** Wrote the detailed game design and delivered it two ways: (1) the durable source of truth **`docs/strategy/GAME_DESIGN.md`** (new), the design layer between `GAME_CONCEPT.md` and `GAME_IMPLEMENTATION_PLAN.md`; (2) a 21-slide founder deck as a Claude Artifact (link in chat) in a retro-pixel visual identity built on the app's brand indigo + reward gold. Design contents: premise and character creation (no villain; everyday Germany as the antagonist), proposals for the game title ("Neuland") and city ("Neustadt"), a six-NPC recurring cast (Jonas, Frau Schmidt, Ayşe, Herr Krause, Frau Weber, Herr Nguyen), the core loop (map → loadout → scenes → loot → FSRS-scheduled recurrence), the interaction model (D/E on every line, tap→type→speak input ladder, register-marked choices, playable parody documents, TTS listening), conversation-battle anatomy (Geduld vs Standing, Redemittel moves, Konjunktiv-II crits, kind status effects, Jonas wild card), the six-class bag taxonomy, progression (one shared state with the app), failure-is-content rules, **six chapters with ~36 individually described missions** (Ankommen, Wohnen, Geld & Papierkram, Arbeit, Gesund & Sozial, Mein Ziel with five endgame paths, exam optional per the scope guardrail), real-world side quests (Wort-Safari, Kiez-Aufträge, Fundstücke), and tone/art rules (pixel direction still awaiting blessing). PROJECT_STATUS updated (new handoff, hygiene move of the older s71 handoff to the archive), GAME_CONCEPT.md pointer added.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md` (new); `docs/strategy/GAME_CONCEPT.md`, `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Slide deck delivered as a Claude Artifact. PR # + squash SHA recorded in git history.

## Entry 181 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the link to deck isn't working. where can I find it on the repo?
- **Response summary:** The deck existed only as a hosted Claude Artifact (session-delivered link) and was not in the repo; only the markdown design doc was. Fixed by committing the deck itself: new **`docs/strategy/GAME_DESIGN_DECK.html`**, the self-contained 21-slide deck (inline CSS/JS, no external requests) with a proper doctype/meta header so it opens standalone in any browser. Told the founder the three ways to view it: the file sent directly in chat, the repo file (download raw + open), and `docs/strategy/GAME_DESIGN.md` which renders readably on GitHub with the same content. PROJECT_STATUS handoff amended to name the committed deck path.
- **Artifacts:** `docs/strategy/GAME_DESIGN_DECK.html` (new); `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 182 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i love it. only weird thing I found it with the job interview. even though the interview is the boss round, I see there are more missions after that. shouldn't the interview with boss be the final mission and all tasks leading up to that should be the missions before? the activities after the interview can be part of later chapters. come up with missions leading up to interview. can you create a new version of the above html by updating this part?
- **Response summary:** Founder review of the game design: approved overall ("i love it") with one structural correction, which is now a **locked structural rule: every chapter ends on its boss**. Restructured the Arbeit chapter accordingly in BOTH `docs/strategy/GAME_DESIGN.md` and `docs/strategy/GAME_DESIGN_DECK.html` (+ redeployed the Artifact, same URL): **Kapitel 4 is now "Die Jobsuche"** (Agentur & Zuhause), 7 missions leading up to the interview boss: 4.1 Die Orientierung (skills inventory + parody job portal), 4.2 Die Stellenanzeige (job-ad reading battle incl. a red-flag ad), 4.3 Der Lebenslauf (tabellarischer Lebenslauf typed finale), 4.4 Das Anschreiben (cover letter from Redemittel blocks, Schreibtraining tie-in), 4.5 Der Anruf (phone call + voicemail, listening/speaking), 4.6 Die Generalprobe (WG mock interview with Ayşe + Jonas, bag loadout), BOSS Das Vorstellungsgespräch (reward: Arbeitsvertrag, Büropark unlocks). The former post-interview office missions moved to a new **Kapitel 5 "Im Büro"** (5 missions, boss = Die Dienstreise); Gesund & Sozial renumbered to K6, Mein Ziel to K7 ("chapter-6 finale" reference updated). Story is now **seven chapters / ~40 authored missions**; deck is 22 slides with renumbered eyebrows and updated overview slide. PROJECT_STATUS handoff amended.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md`, `docs/strategy/GAME_DESIGN_DECK.html`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). Artifact redeployed at the same URL. PR # + squash SHA recorded in git history.

## Entry 183 — 2026-07-06 (session 72)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Read docs/strategy/GAME_CONCEPT.md and the tooling section of docs/plans/GAME_IMPLEMENTATION_PLAN.md, then produce 2 or 3 mockup scenes of the Anmeldung mission in the proposed retro pixel style, using free assets only and spending nothing. Show them to me as images so I can approve or reject the art direction. No game code and no purchases.
- **Response summary:** Produced the pre-G1 art-blessing mockups: three scenes of the Anmeldung vertical slice in retro GBA pixel style (240x160 native, 4x nearest-neighbor upscale to 960x640), delivered as PNGs in `preview/game-pixel-mockups/` and sent to the founder as images. Scene 1: the parody Termin booking website (Serviceportal header, "Nächster freier Termin: IN 8 WOCHEN" in red, wait-vs-spontan-6-Uhr choice in a GBA dialogue box). Scene 2: the Bürgeramt waiting room (LED call board AUFRUF 087 / SCHALTER 3, ticket chip "Deine Nr. 112", two chair rows with seated NPCs, ambient listening hook). Scene 3: the Frau Schmidt boss dialogue battle (GEDULD bar for her, MUT bar for the player, 2x2 Redemittel move menu with Konjunktiv II selected, "Höflich trifft kritisch!"). Every scene carries the D/E chips and the brand indigo #5b5be6 in the dialogue chrome. Zero spend honored with a documented constraint: the sandbox network policy blocks kenney.nl, OpenGameArt and itch.io, so no packs could be downloaded; all art was instead hand-authored in code (original + license-clean), imitating the Kenney/LimeZu reference style: `scenes.py` composes the scenes and `pixfont.py` is a hand-drawn bitmap pixel font with umlauts and ß; both committed next to the PNGs for reproducibility. No game code, no purchases, nothing merged to `main` app-wise; work parked on the branch pending the founder's approve/reject of the direction.
- **Artifacts:** `preview/game-pixel-mockups/` (3 PNGs + `README.md` + `scenes.py` + `pixfont.py`), `docs/PROJECT_STATUS.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 184 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > can you generate a couple more mockups of the scene with frau schmidt?
- **Response summary:** Added three more Frau Schmidt boss-scene mockups in the same hand-authored GBA pixel style, each testing a different beat of the dialogue battle (`preview/game-pixel-mockups/scenes2.py`, same zero-spend, license-clean approach as entry 183). Scene 4 "Am Schalter": close-up confrontation with a newly authored large (2x) Frau Schmidt bust looming behind the counter glass (mirror-built 44x42 sprite: grey bun, stern brow, glasses, teal cardigan), the player's documents laid out on the counter (Ausweis, Vertrag) with the missing Wohnungsgeberbestätigung as a red dashed slot, and the Konjunktiv-II choice in the dialogue box. Scene 5 "Kritischer Treffer": the wide battle layout mid-attack, Konjunktiv II lands with a gold KRITISCH! banner, -18 GEDULD floating damage, sparkle bursts, her Geduld bar in the red, full-width message box. Scene 6 "Sieg": victory screen with retro dither-dimmed background and a gold-bordered Schlüssel-Item card for the Meldebestätigung (+120 XP) plus the chapter-3 bank dependency hook; deliberately the one mockup using the app's reserved reward-gold family, matching the loot-only gold rule. Sent all three to the founder as images; direction approval still pending.
- **Artifacts:** `preview/game-pixel-mockups/` (3 new PNGs + `scenes2.py`, README updated), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 185 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the mockups look good in being honest to the art form but the color and design language feels quite outdated. It reminds me of the 90's. Can you generate a couple more mock ups of the same picture but with different colour choices and design of the elements?
  > it should look as modern and relatable as possible but the 2D art form should stay
- **Response summary:** Restyled the wide Frau Schmidt battle scene into a modern indie-pixel direction while keeping the 2D pixel form (`preview/game-pixel-mockups/scenes3.py`, two images). What changed versus the GBA look: muted contemporary palette instead of saturated primaries; the office became a relatable modern Bürgeramt (wood plank floor, monstera plants, bookshelf, big window, minimal wall signage, white desk with a monitor); sprite outlines softened from black to warm dark tones and the player recolored into a brand-indigo hoodie; all boxy black-bordered chrome replaced with app-style UI, floating rounded cards with soft drop shadows, thin rounded progress bars, level chips, pill buttons (filled indigo primary "Konjunktiv II"), a bottom sheet with grab handle, sentence case instead of ALL CAPS. Technique: world stays chunky 240x160 while the UI layer renders at 480x320 (half-size pixels), the crisp-UI-over-pixel-world convention of modern pixel games. Two themes delivered: `scene7-modern-hell.png` (light, warm) and `scene8-modern-dunkel.png` (dark mode at dusk: night window, dithered lamp-pool light, dark UI surfaces). Same zero-spend hand-authored approach; both sent to the founder as images for the direction call.
- **Artifacts:** `preview/game-pixel-mockups/` (2 new PNGs + `scenes3.py`, README updated), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 186 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i love this new mock up style! dark mode in the game is a bit of a stretch because of limited budget but we'll keep it as a future to-do. save all these mockups and document clearly my preferences and decisions made
- **Response summary:** Recorded the founder's art blessing across the docs so the direction is locked and future sessions do not relitigate it. Decisions captured: (1) 2D pixel form approved; (2) GBA-era styling of mockup scenes 1–6 rejected as dated ("reminds me of the 90's"); (3) the modern restyle `preview/game-pixel-mockups/scene7-modern-hell.png` blessed as THE art-direction reference (muted contemporary palette, modern Bürgeramt set design, soft outlines, app-language UI with rounded floating cards / pills / bottom sheet / brand-indigo accent, crisp half-size UI pixels over the chunky pixel world); (4) in-game dark mode (scene 8) liked but deferred as a future to-do for budget reasons. Where it is documented: new "Game art direction (session 72)" section in `docs/DECISIONS.md` (full verdicts with the founder's verbatim wording and the trait list G1/G2 must match); `docs/strategy/GAME_CONCEPT.md` Visuals pillar updated from "awaiting blessing" to BLESSED-with-styling-correction and the open-questions bullet resolved; `docs/plans/GAME_IMPLEMENTATION_PLAN.md` pixel-blessing guardrail bullet and founder-decision item marked done with the verdict; game dark mode added as backlog item #31 in `docs/PROJECT_REFERENCE.md`; verdict banner added at the top of `preview/game-pixel-mockups/README.md`; session-72 handoff in `docs/PROJECT_STATUS.md` rewritten to "blessing complete, next step G1". All eight mockup PNGs + their generators were already committed on the branch (entries 183–185); this turn merged the whole mockup + decision-record branch to `main` so the record is permanent.
- **Artifacts:** `docs/DECISIONS.md`, `docs/strategy/GAME_CONCEPT.md`, `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_REFERENCE.md`, `preview/game-pixel-mockups/README.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 187 — 2026-07-06 (session 72, continued)
- **Branch:** `claude/anmeldung-pixel-mockups-zhn0oc`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > neuland is good. document the session and give a prompt for a fresh session
- **Response summary:** Recorded the founder's approval of the game title **"Neuland"** (from the `GAME_DESIGN.md` naming proposals): design-doc header and §1 updated from proposal to approved, §13 open decisions updated (art blessing RESOLVED via session 72's mockups; names PARTIALLY RESOLVED, title approved while city "Neustadt" + NPC cast remain unobjected proposals; chapter-1 sign-off STILL OPEN), a short "Game title (session 72)" record appended to `docs/DECISIONS.md`, and the `PROJECT_STATUS.md` header + session-72 handoff refreshed accordingly. Session-wide documentation was already current from entries 183–186 (mockups, blessing record, PR #334 squash-merged to `main` with the post-merge branch realignment done). Closed the session by giving the founder a ready-to-paste prompt for a fresh session: start game phase G1 on Fable 5 per the plan's model map (Mission/Scene schema + `engine/mission.ts` + lint checks first, then scene renderers to the blessed scene-7 style, then the Anmeldung mission content from `GAME_DESIGN.md` chapter 1), zero purchases, normal PR flow.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md`, `docs/DECISIONS.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 188 — 2026-07-06 (session 62, continued)
- **Branch:** `claude/game-idea-strategy-h4t8m3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > move the im buro chapter into one of the options for mein ziel. another thing is that pfand should not just be a decorative item. it should have some value in the game and it should be a recurring gag in the game as it's culturally an important thing in Germany.
- **Response summary:** Applied both founder directions to `docs/strategy/GAME_DESIGN.md` and the deck (`docs/strategy/GAME_DESIGN_DECK.html`; Artifact redeployed at the same URL). (1) **Im Büro moved into Mein Ziel:** the office arc is now the CAREER endgame chain ("Die Karriere: Im Büro": erster Arbeitstag, Meeting, schwieriger Kunde, Streit ums Projekt, Dienstreise, BOSS: der unbefristete Vertrag with Frau Weber; maps the ten workplace themes, unlocks the Büropark). The spine is back to six chapters (K5 Gesund & Sozial, K6 Mein Ziel); K4 interview-boss reward text adjusted; deck back to 21 slides with renumbered eyebrows/mission numbers. (2) **Pfand is a real economy + recurring gag** (new §6 subsection): Pfandflaschen are the game's found currency (own bag row, removed from Fundstücke); the Leergutautomat return is a micro-review mini-game (accepted bottle = one retrieval, miss = red X) paying der Pfandbon → Pfandgeld, which buys the consumables at Herr Nguyen's Späti plus flat cosmetics; recurring gag beats specced (1.4 first Pfandbon + Einweg 25 ct vs Mehrweg 8 ct lore, Ayşe's "you do NOT throw away Pfand" house rule, the Pfandspende kindness scene, Herr Nguyen's bottle appraisals, the post-party bottle-mountain payday, the Pfandmillionär achievement). Rebased over the parallel session-72 merges (#334 art blessing, #335 "Neuland" title approval) and amended the PROJECT_STATUS session-62 handoff accordingly.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md`, `docs/strategy/GAME_DESIGN_DECK.html`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (modified). PR # + squash SHA recorded in git history.

## Entry 189 — 2026-07-06 (session 73)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Start game phase G1 per docs/plans/GAME_IMPLEMENTATION_PLAN.md. First read that plan plus docs/strategy/GAME_DESIGN.md and docs/strategy/GAME_CONCEPT.md, and honor the locked session-72 decisions in docs/DECISIONS.md: modern pixel style per preview/game-pixel-mockups/scene7-modern-hell.png (not the GBA mockups), light theme only, title "Neuland". Build in this order: (1) the Mission/Scene data schema and the engine/mission.ts runner with lint-content graph checks, sized to survive hundreds of missions; (2) the scene renderers for the Anmeldung vertical slice styled to the scene-7 reference; (3) the Anmeldung mission content from chapter 1 of GAME_DESIGN.md. Before authoring content, show me the chapter-1 mission list for sign-off. Free placeholder art only, no purchases, everything in a lazy chunk that keeps the 400 kB main budget. Announce when it's sensible to downshift to a cheaper model, run the full gates plus a /code-review pass before each PR, and ship via the normal PR flow.
- **Response summary:** Built and shipped game phase G1 end to end. (1) Schema + runner: `src/types/game.ts` (Mission/Scene closed unions: cutscene, websiteParody, loadout, listening, dialogueBattle, formCloze; chapter/NPC/key-item registries; BiText everywhere for D/E) and `engine/mission.ts` (pure immutable runner in the dialogue.ts style; transitions emit effects like XP, FSRS vocab grades, Redemittel practice, key items, which the player component applies to the real stores, honoring the one-progression-state rule). Game state (`missionsDone`, `keyItems`) added to `useProgressStore`, local-only until a G2 Supabase migration (a new column in the upsert would break cloud sync). (2) Lint gates: `lint-content.mjs` loads the mission bank and enforces graph integrity (routing resolves + reachable win scene, battle node graphs with reachable win terminals, content-bank id references, key-item obtainability so a mission can never soft-lock, acyclic mission dependencies, closed enums mirrored); `tests/mission.test.ts` (13 runner tests: win path, fetch-quest loss, bar drain, loadout grading tiers). (3) Renderers: `src/features/welt/` (stage atoms, six scene views, MissionPlayer, Welt hub) in the blessed scene-7 style: light-only floating cards, pill buttons, thin bars, brand-indigo accent, chunky pixel backdrops with code-authored placeholder art (`welt_assets.py` generator, zero spend), focus mode hides chrome on `/welt`; entry via a Neuland (Beta) card on the Anwenden hub. (4) The founder-approved chapter-1 mission list (approved as-is via the sign-off question this session) unblocked authoring the Anmeldung boss mission `m_kap1_anmeldung` (9 scenes incl. the Frau Schmidt battle with Geduld/Mut bars, Konjunktiv-II crits, the missing-Wohnungsgeberbestätigung fetch-quest loop) plus 2 new vocab entries and 3 provenance rows. Verified with a full scripted playthrough in the sandbox browser (zero console errors); all gates green; game ships as its own ~53 kB lazy chunk, main chunk unchanged at 79.5 kB. Code-review pass run before the PR; findings fixed (see PR).
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/data/missions.ts`, `src/features/welt/*`, `src/data/vocabulary.ts`, `src/data/provenance.ts`, `scripts/lint-content.mjs`, `tests/mission.test.ts`, `src/store/useProgressStore.ts`, `src/router.tsx`, `src/components/layout/AppShell.tsx`, `src/features/anwenden/AnwendenHub.tsx`, `src/features/legal/Sources.tsx`, `preview/game-pixel-mockups/welt_assets.py`, docs. PR # + squash SHA recorded on merge.

## Entry 191 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > there's a latest version of design doc committed in the repo. refer to it.
- **Response summary:** Verified the branch was level with `origin/main` (4a36086) at that moment, so the working tree carried the then-latest committed design doc (v2). The founder was referring to design v3 (PR #336: Im Büro moved into the Mein Ziel career chain, six-chapter spine, Pfand economy), which a parallel session merged to `main` shortly after; it surfaced during the pre-merge rebase of this session's PR, and the game schema was aligned to it (ChapterId union + `chapters` registry + linter mirror updated to the six-chapter spine; Kapitel 1 unchanged, so the approved mission list stood).
- **Artifacts:** none (verification only).

## Entry 191 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Continued the G1 build. Presented the chapter-1 mission list (1.1 Willkommen in Neuland, 1.2 Der Fahrkarten-Automat, 1.3 Die SIM-Karte, 1.4 Der erste Einkauf, 1.5 Ein Dach über dem Kopf, 1.6 BOSS Die Anmeldung) for sign-off; the founder chose "Approved as-is", resolving GAME_DESIGN.md §13 open decision 3. The rest of the session's work is recorded under entry 188.
- **Artifacts:** `docs/strategy/GAME_DESIGN.md` (§13 sign-off recorded), `docs/DECISIONS.md` (chapter-1 list approval record).

## Entry 192 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (the loadout scene on the founder's phone)
- **Prompt (verbatim):**
  > this one feels a bit off. There's no clear way of telling what this image means. Also, in every screen, there is way too much text which would overwhelm the player.
- **Response summary:** First founder playtest feedback on the shipped G1 slice, applied immediately (the G1 exit-criterion loop). (1) **The loadout image now tells the task:** the stage shows an open pixel travel bag with one dashed slot per required document (new code-authored sprites: bag + Ausweis/Vertrag/Bestätigung doc icons in `welt_assets.py`); the active slot glows indigo and a packed document pops in full-color with a teal ring, so progress is visible in the world, not in a text checklist. (2) **Where-am-I chips:** every stage now carries a small location caption ("Deine Wohnung", "Bürgeramt · Wartezimmer", "Bürgeramt · Schalter 2") via a `SETTING_LABEL` map in `stage.tsx`. (3) **Text diet:** the loadout's intro sentence and the redundant English checklist are gone (sheet = one "Pack ein:" prompt + options + a shortened skip link); the listening scene lost its intro line (the ticker chip already says it) and shows the check explanation only after a WRONG answer; the booking-parody website dropped its redundant "Dienstleistung" row. Schema: `LoadoutScene.intro` became optional (linter updated). All gates green; full scripted playthrough re-verified; shipped via PR (squash-merged, branch realigned).
- **Artifacts:** `src/features/welt/stage.tsx`, `src/features/welt/scenes.tsx`, `src/features/welt/Welt.tsx`, `src/types/game.ts`, `src/data/missions.ts`, `scripts/lint-content.mjs`, `preview/game-pixel-mockups/welt_assets.py`, `src/features/welt/assets/` (4 new sprites), `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 193 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > this can come later but important to document now that whenever there is a waiting period, it should have an effect in the gameplay. Like waiting at the queue need not resemble exact time counter but there should be some fictional timer running and the user have to either wait or engage with the world, like make small talk, or complete a side quest, etc, etc. We can flesh out the details later but this should be done at some point.
  > also, in the exercise to pack important things for the Anmeldung.. the player is not engaged enough and it's entirely text based game. The exercise can be something like there are various items in the room but the user have to go to each of the important items in the room and pick these things up and then pack them in the bag to go. The missions should actually be playable game like missions, not just a visual with a lot of text on the screen
  > an example for side quest in an interactive world can be - Werbung, or Anzeige, Folie (pamphlet) which will be recurring in many of the scenes and everytime a player engages with these, they'll have to complete an exercise like reading comprehension or crossword puzzle or guessing game like gridgames.. completing these will give more powers/points/ perks in the game.
  > A bug I observed is that when the geduld of frau schmidt is reduced, the number is shown in the players Mut bar. Another weird thing I observed is that the player's Mut is unchanged no matter what option is chosen and how much ever the geduld of Frau Schmidt is decreased. Both should be dependent on each other. In this case, the goals is to maintain both the bars high.
  > In the kind of questions asked in conversation with Frau Schmidt, all the questions shouldn't be multiple choice questions. There should be more variety and make the user put in effort to complete the mission. Finishing with good amount of points vs less points should have some effect on the progress of the player.
- **Response summary:** Split into build-now and document-now. BUILT NOW: (1) **Battle bar bug fixed**: the Geduld delta now floats on Frau Schmidt's card and the Mut delta on the player's card (previously one combined chip sat on the player card, showing her Geduld numbers there). (2) **Mut is alive**: battles gained a `mutStart` (Anmeldung: 60 of 100), so gains have visible headroom; every move's deltas were rebalanced so each choice noticeably moves BOTH bars. (3) **Finish quality matters**: winning pays a victory bonus scaled by the remaining Geduld+Mut (up to 30 XP, `BATTLE_FINISH_BONUS`), so keeping both bars high is the game. (4) **Input variety**: battle moves support typed cloze challenges (`BattleMove.cloze`, linted as a substring of the sentence); both Konjunktiv-II crits now require TYPING the key word (freundlich / Kugelschreiber); a correct answer lands the crit + typing bonus, a near-miss loses the crit, a wrong answer misfires with bar penalties. (5) **Walk-and-pick loadout**: the packing exercise is now a room interaction: three documents lie at spots in the room, tapping one walks the player sprite over, the retrieval question packs it, the bag (with an n/3 counter) is the tappable exit, thin-bag exit behind a confirm. One line of on-screen text. DOCUMENTED NOW for G2 (founder direction recorded in `GAME_DESIGN.md` §4/§10 + backlog #32a/#32b + CLAUDE.md): **waiting periods are gameplay** (fictional clock; wait or engage via small talk/side quests, engagement rewarded) and **Print-Prop-Quests** (recurring Werbung/Anzeige/Flyer props opening comprehension/crossword/grid mini-exercises that pay perks). Also recorded the interaction-first principle (missions must play, minimal text). All gates green, 81 unit tests, full scripted playthrough re-verified (typed crit included).
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/data/missions.ts`, `src/features/welt/scenes.tsx`, `src/features/welt/BattleView.tsx`, `scripts/lint-content.mjs`, `tests/mission.test.ts`, `docs/strategy/GAME_DESIGN.md`, `docs/PROJECT_REFERENCE.md`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). PR # + squash SHA recorded on merge.

## Entry 194 — 2026-07-06 (session 73, continued)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Can I use opus 4.8 for the changes in g1 and then implement g2? I ask because I'm running out of fable usage limit
- **Response summary:** Confirmed yes: the Fable-tier G1 work (mission schema architecture, art direction, chapter-1 narrative specs, Anmeldung content) is done and locked, so remaining G1 tweaks and all of G2 run on cheaper models per the plan's own model map: Opus 4.8 for the FSRS-recurrence engine work and other SRS-adjacent changes, Sonnet 5 for authoring missions 1.1-1.5 against the scene-by-scene `GAME_DESIGN.md` specs and for component work, Haiku 4.5 for gates/ship. Safety nets that make this safe: the mission graph linter (broken missions cannot pass CI) and the 81-test runner suite. Optional Fable spend later: a single tone/humor pass over the finished chapter-1 German, or a mechanic rethink if the playtest demands one. Recorded the decision in the `PROJECT_STATUS.md` G2 handoff so the next session picks it up on any model.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry).

## Entry 195 — 2026-07-06 (session 73, close)
- **Branch:** `claude/game-phase-g1-trh4v5`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Document this session so far. I'll continue in another session. I have more feedback and tweaks to make
- **Response summary:** Session-73 documentation wrap. The session shipped game phase G1 end to end plus two same-day founder playtest rounds, across four merged PRs: **#338** (mission engine: `types/game.ts` schema, `engine/mission.ts` runner, linter graph checks, Vitest suite, six scene renderers under `src/features/welt/`, the Anmeldung boss mission, chapter-1 list sign-off, design-v3 alignment to the six-chapter spine), **#339** (playtest round 1: where-am-I stage chips, text diet, bag-slot loadout visual), **#340** (playtest round 2: walk-and-pick loadout room interaction, battle delta-chip bug fix, live Mut bar via `mutStart` + rebalance, typed cloze battle moves, bar-scaled victory bonus; waiting-as-gameplay + Print-Prop-Quests specced into `GAME_DESIGN.md` §4/§10 and backlog #32a/#32b), **#341** (founder model decision: G2 runs on Opus 4.8/Sonnet 5/Haiku, Fable optional for a later content tone pass). All prompts logged as entries 188–194; `PROJECT_STATUS.md` header + handoff refreshed, noting the founder has MORE feedback/tweaks queued as the next session's first order of business, before G2. Gates green throughout (81 unit tests, bundle 79.5 kB main, game in its own lazy chunk); every round verified with a full scripted browser playthrough.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (this entry). Merge SHAs: #338 `70fa084`, #339 `6337dbb`, #340 `54aaef1`, #341 `405e106`.

## Entry 196 — 2026-07-06 (session 74, open)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Read the "Resume here" handoff in docs/PROJECT_STATUS.md. First apply my feedback below to the Neuland G1 slice, then continue with G2 per the plan. Here's my feedback:
  > 1. The pokemon style bag is missing. It should be with the player and should be visible in the game at all times and the items within should be useful to the player when completing the missions.
  > 2. The english translation button should not be available to the player all the time, else it doesn't feel like a game anymore.
  > 3. I want more variety in the questions type - in the mission with Frau schmidt, if there are multiple options with a much nicer option and another one also a nice option, then it doesn't make much of a difference to the player if they chose either of those. And another question is like can you handover a personalauswies - instead of providing text options below the question, the user should search in the bag to tap on one of the items.
  > 4. I want you to do write a robust plan on researching, brainstorming and ideating what kind of questions and activities should be part of the missions - just sharing an idea but you could also use different approach if better - may be you could use multiple agents with various personalities like expert german teacher meets expert game developer meets expert in german literature to ideate this. Once this research and brainstorming is completed - in the first part of the report I want the outcome of the research, then in second section I want complete sccript for the gameplay for each of the first chapter in a html based slide deck (similar to the design doc v3) missions leading upto the boss stage including the intorduction of the game to the player, introduction tot he characters, backstory, selection of language level of the player, his friends, what environments the player travels across in each stage, what challenges the player has, the help and options he has like the freinds or bag or EN translation, mission challenges and any other aspects I may have missed.
  > 5. The dimensions of objects vs player are way too off. Example - the chairs in the waiting room are way too bigger than the player, and the player itself is too small and looks somewhat vertically squished. Such dimensions of the things and relative sizes should be taken care of and well defined.
  > 6. I expected the game to be in full screen where all the interactions happen inside the game area, and I want the design of questions and other interactive elements to follow the game 2d pixelated art as it currently looks like a patchwork of different arts and not immersive.
- **Response summary:** Playtest round 3 applied and shipped (PR #343, squash `5aa4080`), then the research
  commissioned in item 4 executed and shipped (PR #346, squash `7769a6c`). **Code (items 1/2/3/5/6):**
  (1) persistent HUD bag with item count that pulses on demands; (2) the always-on E toggle removed and
  replaced by the Wörterbuch bag item (3 charges per mission; one charge reveals English for the current
  scene only; engine: `MissionRun.dictUses` + `useDictionary`); (3) new battle `ask` nodes: document
  demands are answered by opening the Tasche and tapping the item (engine `handItem`/`admitMissing`;
  wrong item costs Geduld + earns a deadpan reaction line; conceding routes into the fetch-quest
  branch); both Schmidt document demands converted, remaining option lists differentiated (visible
  costs + reaction feedback on the plain-polite moves, a costly "So tun als ob" bluff path, crits no
  longer telegraphed); (5) world scale locked in `welt_assets.py` (standing adult 28-32 px, chair
  ~19 px, seated ~20 px; player sprite redrawn 16x30, chairs shrunk, committed `proportions-check.png`);
  (6) the mission player became a fixed full-screen game layer and every in-game surface was restyled
  to the pixel language (outlined panels, hard offset shadows, RPG name plates, chunky bars). Linter
  gained ask-node graph checks + `dictUses`; runner tests extended to 85; verified with a full scripted
  phone-viewport browser playthrough (wrong-item beat + dictionary flow included), zero console errors.
  **Research (item 4, the multi-agent brainstorm):** four independent expert personas ran IN PARALLEL as
  subagents, each blind to the others, each grounded in `GAME_DESIGN.md` + `src/data/missions.ts` +
  `src/types/game.ts`: (P1) a veteran DaF-Didaktikerin and telc/Goethe examiner (activity types by
  competence + SLA principle, meaningful-choice rules, error-handling design), (P2) a veteran 2D-RPG
  game designer (interaction verbs beyond multiple choice, choice-architecture levers, Pokemon-grade bag
  design, full-screen scene grammar, chapter pacing), (P3) a German culture and literature expert
  (authentic text-genre props, per-mission comedy beats, unwritten-rules moments, NPC register voices,
  text-genre difficulty ladder), and (P4) a market researcher with live web access who surveyed 11
  shipped language-learning games (Wagotabi, Noun Town, Influent, Shashingo, Lingotopia, Learn Japanese
  to Survive, Duolingo Stories/Adventures, Crystallize, Newcomer, Terra Alia, Kagami) with sources, and
  extracted the most-praised patterns, the failure modes, and the gaps nobody owns. Per the founder's
  budget decision (s73), the personas ran on the cheaper tiers (two on Opus 4.8, two on Sonnet 5); the
  lead session synthesized the four reports. Deliverables: `docs/strategy/MISSION_ACTIVITY_RESEARCH.md`
  (method as a rerunnable plan, the merged 20-entry activity catalog with engine-fit + CEFR bands, six
  meaningful-choice levers, recast-based error handling, market evidence, ranked G2 adoption order,
  chapter-1 pedagogy map) and `docs/strategy/CHAPTER1_GAMEPLAY_DECK.html` (the founder-facing two-part
  slide deck in the v3 deck's visual language: Part 1 research outcomes; Part 2 the complete chapter-1
  gameplay script: opening + character creation incl. language-level selection, cast + backstory, help
  systems, missions 1.1-1.6 scene by scene with German lines, environments/text-genre ladder, the
  one-new-mechanic-per-mission ramp), also delivered as a claude.ai Artifact for immediate viewing.
- **Artifacts:** PR #343 (`5aa4080`): `src/types/game.ts`, `src/engine/mission.ts`, `src/data/missions.ts`,
  `src/features/welt/*` (stage/MissionPlayer/scenes/BattleView/Welt + assets incl. new `dict.png`),
  `scripts/lint-content.mjs`, `tests/mission.test.ts`, `src/index.css`,
  `preview/game-pixel-mockups/welt_assets.py` + `proportions-check.png`. PR #346 (`7769a6c`):
  `docs/strategy/MISSION_ACTIVITY_RESEARCH.md`, `docs/strategy/CHAPTER1_GAMEPLAY_DECK.html`.

## Entry 197 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the player avatar is standing in an empty space in a weird position in the newly generated boss mission scene. The lady and her patience bar is on the top of the screen so the player avatar and the player's bar can be to the bottom so that the user/player has clear idea of the elements on the screen
- **Response summary:** Battle composition rule applied (PR #344, squash `1aa76dd`): Frau Schmidt and her
  Geduld bar keep the top band, the player sprite moved to the bottom band standing on a proper ground
  shadow (regenerated `amt.png`), next to the "Du"/Mut card. Top = opponent, bottom = you.
- **Artifacts:** `src/features/welt/BattleView.tsx`, `preview/game-pixel-mockups/welt_assets.py`,
  `src/features/welt/assets/amt.png` (part of PR #344).

## Entry 198 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the tasche pop up window looks good but it would be even better if the outline of the pop up window is in the shape of a backpack
- **Response summary:** The bag popup is now drawn as the backpack itself (same PR #344): carry handle on
  top, leather dome with rounded shoulders, amber zip band, cream interior holding the item grid.
- **Artifacts:** `src/features/welt/MissionPlayer.tsx` (part of PR #344).

## Entry 199 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > now the player avatar looks way too big. Can you keep the people's sixes more or less the same?
- **Response summary:** The foreground zoom from the composition fix was reverted (PR #345, squash
  `9bfa14b`): the player renders at the same human scale as Frau Schmidt (7% stage width, matching the
  loadout walk sprite) on a proportional shadow, still holding the bottom band. Locked as a rule: people
  stay at ONE world scale, no foreground zoom (recorded in `DECISIONS.md`).
- **Artifacts:** `src/features/welt/BattleView.tsx`, `welt_assets.py`, `amt.png` (PR #345).

## Entry 200 — 2026-07-06 (session 74, continued)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session first, espcially the brainstorming with multi agents and the research involved.
- **Response summary:** This documentation pass: prompt-log entries 196-201, a new `PROJECT_STATUS.md`
  handoff (older handoff archived to the W28 chunk), the session-74 founder rulings recorded in
  `docs/DECISIONS.md` ("Game interaction & pixel-UI rules"), `GAME_DESIGN.md` §4 amended (translation as
  a bag resource supersedes always-on D/E inside missions; bag-answered demands; battle composition),
  and the CLAUDE.md game-layer section refreshed. The multi-agent research method and outcomes were
  already durably recorded in `docs/strategy/MISSION_ACTIVITY_RESEARCH.md` (PR #346); entry 196 above
  carries the full method description for the paper trail.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 196-201),
  `docs/DECISIONS.md`, `docs/strategy/GAME_DESIGN.md`, `CLAUDE.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`.

## Entry 201 — 2026-07-06 (session 74, close)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > where are you now in the game implementation plan? stop before proceeding with g2. Wait for my go
- **Response summary:** G2 halted per founder instruction. Plan position: G0 complete (s63-66), G1
  complete and shipped with three founder playtest rounds applied (s73 rounds 1-2, s74 round 3 across
  PRs #343/#344/#345), the s74 activity research + chapter-1 gameplay deck complete (PR #346). G2 had
  just been STARTED when the stop arrived: schema groundwork (three new scene settings terminal/laden/
  supermarkt with generated backdrops, scene `label` override, Reisepass icon, four chapter-1 NPCs,
  three key items) plus draft mission data for 1.1 "Willkommen in Neuland" and 1.2 "Der
  Fahrkarten-Automat". That work was PARKED UNMERGED as a clearly-labeled WIP commit on the session
  branch (missions 1.3-1.5, provenance rows, boss gating, gates and playthrough all still open); main
  contains no G2 content. Next session resumes from the WIP commit only after the founder's explicit go.
- **Artifacts:** parked WIP commit on `claude/neuland-g1-g2-feedback-wkf28n` (unmerged; see PROJECT_STATUS
  "Resume here").

## Entry 202 — 2026-07-06 (session 74, close)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim, two consecutive messages):**
  > save the multi agent research and ideation as a separate file complementing the other relevant docs
  > with all the details from the chat in it
- **Response summary:** Created `docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`: the
  complete, verbatim archive of the multi-agent brainstorm: the founder's commission, the method
  (four personas in parallel, blind to each other, two on Opus 4.8 + two on Sonnet 5), the exact
  brief given to each persona, and each persona's full unedited report (DaF-Didaktikerin
  activity catalog + choice/error design in German, the game designer's 20-verb interaction
  catalog + six choice levers + bag spec + full-screen scene grammar + chapter pacing, the
  culture expert's prop catalog + comedy beats + unwritten rules + register voices + genre
  ladder, and the market researcher's 12-game sweep with sources, praised/panned patterns, gaps
  and ranked recommendations). Cross-linked from `MISSION_ACTIVITY_RESEARCH.md` §1.
- **Artifacts:** `docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`,
  `docs/strategy/MISSION_ACTIVITY_RESEARCH.md` (cross-link).

## Entry 203 — 2026-07-06 (session 74, close)
- **Branch:** `claude/neuland-g1-g2-feedback-wkf28n`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session. i'll continue in another session
- **Response summary:** Final documentation pass for session 74 (most of the session was already
  documented in PR #347: prompt-log entries 196-202, the PROJECT_STATUS handoff, DECISIONS.md
  "Game interaction & pixel-UI rules", GAME_DESIGN.md §4 amendments, CLAUDE.md game-layer
  refresh, and the verbatim multi-agent transcripts in
  `docs/strategy/MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md`). This entry adds the closing prompt to
  the log and sharpens the PROJECT_STATUS "Resume here" pointer to the parked G2 WIP (named by
  branch + commit-message prefix `wip(G2, PARKED, DO NOT MERGE)` rather than a fragile SHA, with
  the exact resume command). Session-74 shipping recap: G1 playtest round 3 (#343) + two live
  hotfixes (#344 battle composition + backpack popup, #345 one human scale), the multi-agent
  mission-activity research + chapter-1 gameplay deck (#346), and the documentation wrap (#347),
  all squash-merged to `main` and deploying via Pages. G2 remains HALTED awaiting the founder's
  explicit go; its partial draft stays parked unmerged on the session branch.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (this entry), `docs/PROJECT_STATUS.md` (Resume-here
  pointer sharpened).

## Entry 204 — 2026-07-07 (session 75)
- **Branch:** `claude/whats-next-l61ca3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim, in order):**
  > what's next?

  > 4

  > I'd like you to work in content expansion
- **Response summary:** (1) Briefed the founder on current state: session 74 shipped (playtest
  round 3 + mission-activity research), the roadmap's next item G2 is HALTED on the founder's
  explicit order, parked unmerged on `claude/neuland-g1-g2-feedback-wkf28n`. Offered the session's
  options. (2) Founder picked "4" (just brief me), so walked through the G2 plan, the four-persona
  research findings (market gaps we own, chapter-1 mission map, adoption order), and the honest
  risk of scaling on an un-playtested slice. (3) Founder chose content expansion. Surveyed the
  content banks (10 workplace themes + `behoerde`; the `gesundheit`/`bildung`/`pruefung` domains
  had zero themes). The AskUserQuestion tool failed twice in this environment, so made the CTO call
  to build the **Arzt & Gesundheit** pack (fills the empty `gesundheit` domain, most universal
  daily-life situation), using `behoerde` as the reference template. Built the full theme: ThemeId
  + linter, Stethoscope icon, ExamTheme with 4 sub-themes, writing prompt, 28 vocab, 36
  collocations, 3 Can-Do milestones, 2 reading texts (6 checks), 1 branching dialogue, 71
  provenance rows. All gates green (lint:content, build, bundle 79.5 kB, 85 unit tests, eslint 0
  errors). No em dashes. Pushed to the session branch; NOT merged to `main` pending the founder's
  OK on the domain choice (Arzt vs Wohnen/Bank).
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/writingPrompts.ts`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/data/canDo.ts`, `src/data/texts.ts`, `src/data/dialogues.ts`,
  `src/data/provenance.ts`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. Commit SHA(s): see the branch.

## Entry 205 — 2026-07-07 (session 75, cont.)
- **Branch:** `claude/whats-next-l61ca3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim, in order):**
  > merge

  > go ahead with wohnen and bank
- **Response summary:** (1) "merge" → opened **PR #349** for the Arzt & Gesundheit pack and
  squash-merged it to `main` (`fc35d60`); ran the post-merge housekeeping (realign dev branch to
  `origin/main` via reset --hard + force-with-lease). (2) "go ahead with wohnen and bank" → built
  two more full daily-life themes on the same template: **`wohnen` (Wohnen & Zuhause)** and
  **`bank` (Bank & Finanzen)**, both `alltag` domain. Each: ThemeId + linter, icon (Home /
  Banknote), ExamTheme with 4 sub-themes, writing prompt, 28 vocab, 36 collocations, 3 Can-Do, 2
  reading texts (6 checks), 1 branching dialogue, provenance rows (142 across both). Also wired the
  placeholder `bank`/`wohnhaus` city-strip domain buildings to their new themes
  (`domain-buildings.tsx`) and updated the now-outdated `tests/city-mastery.test.ts` ("future packs
  empty" → "packs wired"). Gates green: lint:content (14 themes, 614 vocab, 504 collocations, 1,337
  provenance), build, bundle 79.5 kB, 85 unit tests, eslint 0 errors. No em dashes.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/writingPrompts.ts`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/data/canDo.ts`, `src/data/texts.ts`, `src/data/dialogues.ts`,
  `src/data/provenance.ts`, `src/components/city/domain-buildings.tsx`, `tests/city-mastery.test.ts`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md`. PR #349 (Arzt, merged);
  Wohnen+Bank PR to follow. Commit SHAs: see the branch.

## Entry 206 — 2026-07-07 (session 75, cont.)
- **Branch:** `claude/whats-next-l61ca3`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Took "continue" as content expansion and built the highest-value next
  move: **`bildung` (Bildung & Sprache)**, filling the last empty top-level domain (`bildung`), so
  all six domains are now populated. Full theme on the same template: ThemeId + linter,
  GraduationCap icon, ExamTheme (domain `bildung`, context `both`, 4 sub-themes
  sprachkurs/anerkennung/pruefung/weiterbildung), writing prompt, 28 vocab, 36 collocations, 3
  Can-Do, 2 reading texts (course-confirmation email + Anerkennung letter, 6 checks), 1 branching
  dialogue (`sc_sprachkursberatung`), 71 provenance rows. `bildung` maps into the existing
  `pruefungshalle` city building via the domain rollup (no building-registry change needed). Gates
  green: lint:content (15 themes, 642 vocab, 540 collocations, 1,408 provenance), build, bundle
  79.5 kB, 85 unit tests, eslint 0 errors. No em dashes. Squash-merged via PR (see below); ran the
  post-merge branch realignment.
- **Artifacts:** `src/types/index.ts`, `scripts/lint-content.mjs`, `src/lib/icons.ts`,
  `src/data/themes.ts`, `src/data/writingPrompts.ts`, `src/data/vocabulary.ts`,
  `src/data/collocations.ts`, `src/data/canDo.ts`, `src/data/texts.ts`, `src/data/dialogues.ts`,
  `src/data/provenance.ts`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`, `CLAUDE.md`.
  Commit SHAs: see the branch.

## Entry 207 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`; `main` is the source of truth.
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I want you to author a comprehensive and robust data strategy for the app. The challenge I have is neither am I a native German speaker nor do I possess the skill to manually verify each of the word in the app. this strategy should also adress the following among other important and relevant points: one of the important questions and challenges is that how do we make sure the data/content in the app is source verified, audit-ready but it should also be automated.
- **Response summary:** Researched the existing provenance infrastructure (register, license
  allowlist, `check:refs`, `lint-content.mjs`) and found the legal/licensing layer mature but the
  German-accuracy layer explicitly unsolved (blocked on a native reviewer). Authored
  **`docs/strategy/DATA_STRATEGY.md` (v1.0)**: a six-layer **verification ladder** (structural →
  provenance → factual-match → linguistic → AI jury → rationed human audit) that replaces one native
  reviewer with a panel of independent sources + models (agreement = confidence, disagreement = the
  only thing a human sees). Added a per-item `verification` trust model extending `ProvenanceEntry`, a
  CI-vs-scheduled automation split, cost envelope, decay/re-verification cadence, and an EU AI Act
  Article 10 mapping. Cross-linked `DATA_GOVERNANCE.md` both ways (legal layer) without duplicating it.
- **Artifacts:** `docs/strategy/DATA_STRATEGY.md` (new), `docs/strategy/DATA_GOVERNANCE.md`
  (companion cross-link). Commit on the branch; later shipped via PR #352.

## Entry 208 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > so this strategy is applied for the existing content or the ones we would in future?
- **Response summary:** Explained it is both by design: a one-time cleanup sweep over the ~1,170
  `draft` backlog **and** a permanent CI gate on new content, with the AI jury as triage-only until
  calibrated. Offered to make it explicit in the doc.

## Entry 209 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes
- **Response summary:** Added a "Scope: existing vs. future content" subsection to
  `DATA_STRATEGY.md` (one-time backlog sweep of Phases A–E + permanent CI gate for new content; the
  jury is triage-only until golden-set-calibrated). Committed and pushed.
- **Artifacts:** `docs/strategy/DATA_STRATEGY.md`.

## Entry 210 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > merge
- **Response summary:** Opened **PR #352** (no PR template in repo) and squash-merged the data
  strategy to `main` (`c0d3d1a`). Ran the post-merge housekeeping: realigned the dev branch to
  `origin/main` (reset --hard + `--force-with-lease`).
- **Artifacts:** PR #352 (merged).

## Entry 211 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > scope it
- **Response summary:** Interpreted as "scope Phase A" (the Layer 2 fact-match gate). Ran plan mode
  (Explore agents for the vocab/collocation schemas + lint/CI patterns; verified real counts of 642
  vocab / 540 collocations after the agent undercounted), produced an approved plan, then **built the
  spike**. Discovered kaikki/Wiktionary are blocked by the environment's network policy (npm is the
  only allowed host), so pivoted the data source to **`german-words-dict`** (Apache-2.0, derived from
  LanguageTool's `german-pos-dict`, CC-BY-SA-4.0) fetched from npm — fully offline and CI-capable, a
  better outcome than the plan's network approach. Shipped `scripts/build-dict-subset.mjs`
  (`pnpm build:dict-subset`), `scripts/verify-facts.mjs` (`pnpm verify:facts`), a 12 KB vendored
  subset, and a generated report. **Result over 489 nouns:** 224 genders + 174 plurals machine-verified
  with zero human effort; 3 plurale-tantum headwords auto-detected/skipped; 47% coverage. **Key
  finding:** a single lexicon can't gate — all 4 remaining disagreements were hand-checked as
  lexicon-side issues (`der Husten` correct; `Risiken`/`Visa` are the standard plurals), validating
  the strategy's multi-source thesis. Scoped the next step (second oracle + compound gender rule).
- **Artifacts:** `scripts/build-dict-subset.mjs`, `scripts/verify-facts.mjs`,
  `scripts/vendor/german-words-subset.json`, `docs/reports/verify-facts-report.md`, `package.json`
  (`build:dict-subset` + `verify:facts` scripts). Commit `b9fbbb2`.

## Entry 212 — 2026-07-07 (session 76)
- **Branch:** `claude/app-data-strategy-oshuhs`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > merge and document the session
- **Response summary:** Documented the session (this `SESSION_PROMPT_LOG.md` entry set +
  `docs/PROJECT_STATUS.md` handoff and header; moved the session-74 handoff to the W28 archive per the
  doc-hygiene rule), then opened a PR folding the fact-check spike + docs and squash-merged it to
  `main`, followed by the post-merge branch realignment.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. PR + commit: see below.

## Entry 213 — 2026-07-07 (session 77)
- **Branch:** `claude/data-strategy-plan-78r0jq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue the data strategy plan
- **Response summary:** Completed Phase A of the verification ladder by shipping the **second oracle**
  the v1.1 spike said was required. Confirmed kaikki/de.wiktionary/dwds are still 403-blocked by the
  network policy, then found the "Wiktionary route" through an allowed host: **`german-nouns`** on PyPI
  (~100k nouns compiled from German Wiktionary, CC-BY-SA-4.0, already allowlisted), an independent
  lineage from oracle A (LanguageTool). Built `scripts/build-nouns-subset.mjs`
  (`pnpm build:nouns-subset`, +`build:oracles`) writing a 25 KB vendored subset with a compound
  **head-noun gender fallback**. Rewrote `scripts/verify-facts.mjs` to two-oracle voting: an error is
  reported **only when both oracles reject a form and agree on the correction** (`GATE`), everything
  else is a review signal. **Result over 489 nouns: coverage 47% → 97%, 458 articles + 260 plurals
  verified (221/167 by both oracles), 0 two-oracle-confirmed errors**; the 6 review signals and the old
  4 disagreements all hand-checked as valid variants/head-heuristic artefacts. Promoted `verify:facts`
  to a real **offline CI gate** in `validate.yml`. Updated `DATA_STRATEGY.md` → v1.2, regenerated the
  report, and did the doc handoff (moved the session-75 handoff to the W28 archive per the doc-hygiene
  rule). Gates green: `pnpm lint:content`, `pnpm verify:facts` (exit 0).
- **Artifacts:** `scripts/build-nouns-subset.mjs`, `scripts/verify-facts.mjs` (rewritten),
  `scripts/vendor/german-nouns-subset.json`, `package.json` (`build:nouns-subset` + `build:oracles`),
  `.github/workflows/validate.yml`, `docs/strategy/DATA_STRATEGY.md`,
  `docs/reports/verify-facts-report.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. Shipped via **PR #354**
  (squash-merged, `37073b4`), then the post-merge branch realignment.

## Entry 214 — 2026-07-07 (session 77)
- **Branch:** `claude/data-strategy-plan-78r0jq`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session and give me a prompt to continue the work in a new session
- **Response summary:** The session's substantive docs were already updated and merged in entry 213
  (`PROJECT_STATUS.md` handoff + header, `DATA_STRATEGY.md` v1.2, `CLAUDE.md` gate note, regenerated
  report, W28 archive move). Appended this prompt-log entry and shipped the doc-only change, then handed
  the founder a ready-to-paste continuation prompt for the next session (Phase B / Layer 3: LanguageTool
  sentence grammar; plus optional Layer-2 coverage polish and the Phase C `verification` trust block).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`. PR + commit: see below.

## Entry 215 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > Continue the data strategy plan (docs/strategy/DATA_STRATEGY.md). Phase A (Layer 2, the two-oracle
  > noun-fact CI gate) is done and merged — start at the "Resume here" handoff in docs/PROJECT_STATUS.md
  > (session 77). Build Phase B — Layer 3, the offline linguistic engine: run LanguageTool over every
  > German sentence in the content banks (vocab examples, collocation example.de, dialogue lines,
  > reading texts, redemittel) for grammar/spelling, plus a CEFR plausibility heuristic (word-frequency
  > + sentence complexity) that flags items far from their claimed cefr facet. Constraints, mirroring
  > Phase A: outbound HTTPS only reaches npm/PyPI/crates/Go/JSR (kaikki, de.wiktionary, DWDS are
  > 403-blocked); check early whether a usable LanguageTool distribution is reachable, else fall back to
  > an unrestricted CI machine. Layer 3 is warn-only / scheduled report, NOT a hard merge gate. Emit a
  > bucketed report to docs/reports/. Work on branch claude/data-strategy-plan-78r0jq, keep gates green,
  > auto-ship via a squash-merged PR into main, update docs + prompt log. If Phase B's tooling is
  > blocked, fall back to Phase C instead.
- **Response summary:** Built **Phase B (Layer 3)**. First proved the tooling is reachable: the
  LanguageTool download host + kaikki/de.wiktionary are 403, but **Maven Central is reachable**, and
  Java 21 + Maven are installed, so LanguageTool 6.8 `language-de` (88 jars, ~69 MB) resolves in-sandbox
  — no fallback needed. **Grammar/spelling:** `scripts/build-languagetool.mjs` (resolves LT pinned from
  Maven, gitignored) + a Java runner `scripts/lt/LtCheck.java` + `scripts/verify-grammar.mjs` run LT over
  **2,315 German sentences** (vocab/collocation examples, dialogue lines/options/models/prompts,
  reading-text bodies/questions, redemittel phrases/examples). **0 grammar errors, 98.8% clean**, one
  real headword typo caught and fixed (`v_kulanzloesung`: "Kulanslösung" → "Kulanzlösung"). **CEFR
  heuristic:** `scripts/build-frequency-subset.mjs` (vendors `wordfreq` German Zipf, offline) +
  `scripts/verify-cefr.mjs` compare claimed `cefr` to word frequency + sentence complexity. First cut
  flagged 44% (unigram frequency can't grade German compounds), so recalibrated to precision-first —
  flags only the reliable "common word, advanced label" direction, vocab only → **6 FLAG + 72 WATCH** of
  1,182 items. Both are **warn-only reports** (`docs/reports/verify-grammar-report.md`,
  `verify-cefr-report.md`), regenerated monthly by `.github/workflows/verify-sentences.yml` (artifacts,
  no auto-commit); `validate.yml` untouched. All gates green: `lint:content`, `verify:facts` (0 gate
  errors), `build`, `lint` (0 errors), `test:unit/srs/pronounce`, `check:bundle`. Updated
  `DATA_STRATEGY.md` → v1.3, `CLAUDE.md`, `PROJECT_STATUS.md` (+ moved the session-76 handoff to the W28
  archive per the doc-hygiene rule). (Branch used: `claude/data-strategy-phase-b-wiw3mu`, the one this
  session was assigned.)
- **Artifacts:** `scripts/lt/LtCheck.java`, `scripts/build-languagetool.mjs`, `scripts/verify-grammar.mjs`,
  `scripts/build-frequency-subset.mjs`, `scripts/verify-cefr.mjs`,
  `scripts/vendor/german-frequency-subset.json`, `scripts/vendor/german-nouns-subset.json` (1-line
  regen), `src/data/vocabulary.ts` (typo fix), `package.json`, `.gitignore`,
  `.github/workflows/verify-sentences.yml`, `docs/reports/verify-grammar-report.md`,
  `docs/reports/verify-cefr-report.md`, `docs/strategy/DATA_STRATEGY.md`, `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`,
  `docs/SESSION_PROMPT_LOG.md`. Shipped via **PR #356** (squash-merged, `56e4225`), then branch realignment.

## Entry 216 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > what's next?
- **Response summary:** Gave a CTO read of the remaining verification-ladder phases. Recommended **Phase C
  (the trust model)** next as the highest-leverage free move: it turns the Layer 2/3 checks into a
  per-item, auditable tier surfaced on `/sources` (the Article 10 payoff), needs no German and no spend.
  Flagged the alternatives (small content cleanups from the Phase B reports; Phase D, the AI jury, as the
  first paid rung needing ~150 human-labeled calibration items). Asked whether to build Phase C.
- **Artifacts:** none (recommendation only).

## Entry 217 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes, implement phase c
- **Response summary:** Built **Phase C (the trust model)**. Added the `Verification` block
  (`tier`/`checks[]`/`confidence`/`last_verified` + `VerificationTier`/`Layer`/`Result` enums) to
  `ProvenanceEntry`. Wrote `scripts/build-verification.mjs` (`pnpm build:verification`) that composes the
  Layer 2 fact verdicts + Layer 3 grammar (via a new `docs/reports/verify-grammar.json` sidecar emitted by
  `verify:grammar`) + CEFR results into the **generated** `src/data/verification.ts`, keyed by content_id,
  every record sharing one sweep-date const so re-runs only diff moved items. Exported the compute helpers
  from `verify-facts`/`verify-cefr` (and guarded their `main()`) so the aggregator reuses them without
  re-running LanguageTool. `/sources` (`Sources.tsx`) now shows a per-item **tier badge + confidence** and
  a tier-distribution section; `lint:content` validates the closed enums and prints the distribution
  (records, not a gate). **First sweep over 1,408 items: 25 human · 1,266 linguistic · 1 facts · 116
  provenance** (1,292 machine-attested). `DATA_STRATEGY.md` → **v1.4**. All gates green (`lint:content`
  with the tier summary, `verify:facts`, `build`, `lint` 0 errors, `test:unit/srs/pronounce`,
  `check:bundle` main 79.5 kB; `verification.ts` rides the lazy `/sources` chunk).
- **Artifacts:** `src/types/index.ts`, `scripts/build-verification.mjs`, `src/data/verification.ts` (generated),
  `scripts/verify-facts.mjs` + `scripts/verify-cefr.mjs` (export helpers + guard main),
  `scripts/verify-grammar.mjs` (owner tags + `verify-grammar.json` sidecar), `scripts/lint-content.mjs`,
  `src/features/legal/Sources.tsx`, `package.json`, `docs/reports/verify-grammar.json`,
  `docs/strategy/DATA_STRATEGY.md`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md`.
  Shipped via **PR #357** (squash-merged, `05d21fd`), then branch realignment.

## Entry 218 — 2026-07-07 (session 78)
- **Branch:** `claude/data-strategy-phase-b-wiw3mu`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** The session's substantive docs were already written and merged inline with the
  work: `PROJECT_STATUS.md` (session-78 handoff covering Phase B + Phase C, header, content counts, W28
  archive move of the session-76 handoff), `DATA_STRATEGY.md` → v1.4 (Phase B + C "SHIPPED" notes,
  roadmap, changelog), `CLAUDE.md` (new `verify:grammar` / `verify:cefr` / `build:languagetool` /
  `build:frequency-subset` / `build:verification` command docs + `verification.ts` in the data layout),
  and prompt-log entries 215–217. This entry closes the paper trail for the "document the session"
  request; shipped as a doc-only change.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md`. PR + commit: see below.

## Entry 219 — 2026-07-07 (session 79)
- **Branch:** `claude/human-loop-data-strategy-scale-jp0lzf`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > following the data strategy implementation plan, how would a hum in the loop keep track of the content, share the data matched with sources to auditors and how would the database be managed when the app is scaled 100x from now?
- **Response summary:** Research-and-answer only, no code changes. Read `DATA_STRATEGY.md` (v1.4),
  `DATA_GOVERNANCE.md`, the provenance/verification infra (`provenance.ts`, generated `verification.ts`,
  `Sources.tsx`), and the Supabase schema (`provenance_reviews` migration 0004 + `provenanceReviews.ts`,
  the five migrations). Answered in three parts framed around Genauly's **two data planes** (static
  content plane vs Supabase user plane). **(1) Human-in-the-loop tracking:** the verification ladder tracks
  every item's `tier`/`confidence` in data; the human works only the machine-generated **exception queue**,
  and verdicts persist via the founder-only `provenance_reviews` table + `/sources` admin overlay
  (`review_status → verified`), with a staleness re-verification cadence. **(2) Auditor sharing:** the
  reproducible per-item chain (source + license snapshot + fact/grammar/jury verdicts with tool/version/date
  + human sign-off), surfaced on the auto-generated `/sources` page and mapped to EU AI Act Art. 10/12.
  **(3) 100x DB:** content plane stays CDN-cheap (migrate files → content table only if the *library* grows
  100x); user plane is standard Postgres scaling (Supavisor pooling → indexed/index-friendly RLS →
  partition/archive `ai_usage`+writing → replicas) plus the real lever: **server-side metering/capping of
  AI-writing-coach token spend**, and resolving the `progress` fixed-column upsert debt. Offered three
  follow-up deliverables (now backlog #33–#35).
- **Artifacts:** none (Q&A; no files changed).

## Entry 220 — 2026-07-07 (session 79)
- **Branch:** `claude/human-loop-data-strategy-scale-jp0lzf`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document this session. we'll come back to these tasks later
  >
  > also add the above tasks to backlog tiems
- **Response summary:** Doc-only session close. Appended prompt-log entries 219–220; added a session-79
  handoff pointer to `PROJECT_STATUS.md` "Resume here" (the three follow-ups are parked, no code shipped);
  and added the three offered deliverables to the founder backlog in `PROJECT_REFERENCE.md` as **#33**
  (human-in-the-loop exception-queue tooling), **#34** (auditor handoff package), and **#35** (scale-to-100x
  database plan). No product code touched.
- **Artifacts:** `docs/PROJECT_REFERENCE.md` (backlog #33–#35), `docs/PROJECT_STATUS.md` (Resume-here
  pointer), `docs/SESSION_PROMPT_LOG.md` (entries 219–220).

## Entry 221 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > based on the project documentation what are the top 3 most value added tasks to work on next?
- **Response summary:** Research-only answer. Read `PROJECT_STATUS.md` + `PROJECT_REFERENCE.md` and
  recommended, ranked, as a CTO: (1) **EU AI Act Article 50 transparency (#21)** — hard 2 Aug 2026
  deadline, cheap, de-risking; (2) **SEO + landing FAQ/copy (#10/#11/#12)** — the product is
  feature-complete but has had no acquisition work; (3) **deepen the daily-life content + verify the draft
  rows** — the repositioning's core differentiation, with the newest packs still shallow. Noted the built
  roadmap's own next rung (Phase D, the AI jury) but ranked it below, since it is the first *paid* rung and
  parked items #33–35 were deferred by the founder.
- **Artifacts:** none (advice; no files changed).

## Entry 222 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > isn't the first point already done? if not, do it. work on all three now
- **Response summary:** Verified and executed all three. **#21:** the Art. 50 *copy* was already live
  (`WritingHub.tsx` point-of-use notice + "KI-generierte Rückmeldung" label + `PrivacyPolicy.tsx` DE/EN AI
  section); the missing piece was the documented Article 6(3) risk assessment, now written as
  **`docs/strategy/AI_ACT_RISK_ASSESSMENT.md`** (v1.0: not high-risk/limited-risk, Art. 6(3) derogation,
  profiling flagged for counsel). **SEO:** added Open Graph + Twitter meta, canonical, and two JSON-LD
  graphs (WebApplication + FAQPage) to `index.html`; added `public/robots.txt` + `public/sitemap.xml`; added
  a "Wie funktioniert Genauly?" 3-step strip and a 6-item FAQ accordion to `LandingPage.tsx`. **Content:**
  +4 reading texts (18→22, checks 54→66), one per newest daily-life theme covering a new sub-theme + new
  kind, with +4 provenance rows (1408→1412, all draft). All gates green (`lint:content`, `build`,
  `check:bundle` 83 kB, `lint` 0 errors, `test:unit` 85). Marked #21 CLOSED in `PROJECT_REFERENCE.md`.
- **Artifacts:** `docs/strategy/AI_ACT_RISK_ASSESSMENT.md` (new), `index.html`, `public/robots.txt` (new),
  `public/sitemap.xml` (new), `src/features/landing/LandingPage.tsx`, `src/data/texts.ts`,
  `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/PROJECT_REFERENCE.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/SESSION_PROMPT_LOG.md` (entries
  221–222). Shipped as PR #360 (squash-merged to `main`, commit `cb7d9dc`).

## Entry 223 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > it's live now. What's next?
- **Response summary:** Recommended the next push and offered four directions via a choice prompt; the
  founder picked **"Deepen daily-life content."** Executed: added **5 exam sets** (`examSets` 10→15), one per
  daily-life theme (behoerde/arzt/wohnen/bank/bildung), each a telc-style joint-planning speaking simulation
  referencing the theme's existing scenario and reusing `sharedRubric`, so every life domain now has
  exam-prep parity with the workplace themes (previously workplace-only). +5 `exam_set` provenance rows
  (draft), 1412→1417. `ExamHub` maps over all sets unfiltered, so they surface immediately. Gates green
  (`lint:content` 15 examSets / 1417 rows, `build`, `check:bundle` 83 kB, `test:unit` 85). Docs updated
  (handoff follow-on, counts, CLAUDE.md provenance count).
- **Artifacts:** `src/data/examSets.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 223). Shipped as PR #361 (squash-merged to `main`, commit `2b396de`).

## Entry 224 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > continue
- **Response summary:** Continued the daily-life depth work with the next suggested step: a **2nd branching
  dialogue per newest daily-life theme** (`dialogues` 16→20, all level 2). Added `sc_apotheke` (arzt,
  redeeming a prescription at the pharmacy), `sc_wohnungsmangel` (wohnen, reporting a heating defect to the
  landlord), `sc_kartesperren` (bank, blocking a lost card), and `sc_pruefungsanmeldung` (bildung,
  registering for the telc exam). Each is a 5-node graph (4 partner turns + narrator end, 3 scored options
  each) matching the existing schema and covering a different situation than the theme's L1 scenario. +4
  `dialogue` provenance rows (draft), 1417→1421. Verified against the dialogue linter's graph-integrity
  rules (start/next/reachability/no-orphans/valid speakers+redemittel). Gates green (`lint:content` 20
  dialogues / 1421 rows, `build`, `check:bundle` 83 kB, `test:unit` 85). Docs updated.
- **Artifacts:** `src/data/dialogues.ts`, `src/data/provenance.ts`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 224). Shipped as PR #362 (squash-merged to `main`, commit `7ffe5ae`).

## Entry 225 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > work on seo task then
- **Response summary:** Closed the one open SEO/growth follow-up: a proper **1200×630 Open Graph share
  image** (previously the link preview used the square PWA icon). Built `public/og-image.png` as a branded
  card (logo, "Break through the B1–B2 plateau", domain pills, genauly.de tagline) via a new generator
  `preview/og-image/make-og.mjs` that writes a self-contained HTML card screenshotted with the pre-installed
  Chromium (the repo has no headless-render dependency). Wired `index.html`: `og:image` + `twitter:image`
  now point at it, added `og:image:width/height/type` + descriptive alt, and upgraded the Twitter card to
  `summary_large_image`. Build green; the image ships to `dist/og-image.png`; main chunk holds at 83 kB.
  This completes the SEO surface (meta/OG/Twitter/canonical/JSON-LD, robots, sitemap, landing FAQ, share
  card); remaining growth work is non-code (real screenshots/testimonials) or a separate lane.
- **Artifacts:** `public/og-image.png` (new), `preview/og-image/make-og.mjs` (new), `index.html`,
  `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 225). Shipped as PR #363 (squash-merged to
  `main`, commit `a6f0690`).

## Entry 226 — 2026-07-07 (session 80)
- **Branch:** `claude/top-value-tasks-842u60`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Session documentation pass. Prompt-log entries 221–225 were written as the work
  shipped; this pass backfilled the PR/commit references on the last entry, added this entry (226), and
  verified `docs/PROJECT_STATUS.md` (consolidated session-80 handoff + all content counts:
  22 texts/66 checks, 15 exam sets, 20 dialogues, 1,421 provenance rows), `docs/PROJECT_REFERENCE.md`
  (#21 marked closed), and `CLAUDE.md` (text/provenance counts) are current. **Session 80 shipped 4 PRs to
  `main`:** #360 (EU AI Act Art. 6(3) risk assessment doc + full SEO meta/OG/JSON-LD/robots/sitemap +
  landing FAQ/how-it-works + 4 daily-life reading texts), #361 (5 daily-life exam sets), #362 (4 second
  daily-life dialogues), #363 (1200×630 OG share image). No code changed in this doc pass.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (entries 225–226), `docs/PROJECT_STATUS.md` (verified).
  Commit SHA + PR # to be filled on push/merge.

## Entry 227 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > What's next in the game plan?
- **Response summary:** Explained the Neuland game roadmap state (`GAME_IMPLEMENTATION_PLAN.md`): G0/G1
  shipped, **G2 is the next rung but HALTED on founder order**. Noted the parked G2 groundwork draft (missions
  1.1/1.2 + settings) sitting unmerged on the old branch `claude/neuland-g1-g2-feedback-wkf28n`, the Supabase
  game-state migration prerequisite, and that G2 = 5–8 Kapitel-1 missions + a real learner playtest. Asked
  whether to unpark or keep on hold. No code.
- **Artifacts:** none (chat only).

## Entry 228 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is ut really necessary to pay in g2? what is it I'm paying for?
- **Response summary:** Clarified the cost boundary: the only paid items in the whole game plan are optional,
  one-time, and ~30–60 EUR total (itch.io modern-city pixel art packs + Aseprite editor), with zero recurring
  cost. Free path exists (Kenney CC0 packs + Pixelorama/LibreSprite). The trade-off is setting/consistency
  and my patching time, not raw quality. Recommended: pay nothing yet, ship G2 with free/placeholder art,
  run the playtest first, buy one matching pack only if the playtest succeeds. No code.
- **Artifacts:** none (chat only).

## Entry 229 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > yes let's do that then
- **Response summary:** Founder gave the go for G2 (zero-spend, incremental, playtest-first). Started G2 with
  the first increment: **ported chapter-1 missions 1.1 (Willkommen in Neuland) and 1.2 (Der Fahrkarten-Automat)**
  from the parked draft onto current `main`. Did NOT rebase the whole parked branch (189 files, diverged since
  s74); extracted only the two draft missions and reconciled them against the current schema. Small contained
  schema extension: added a `terminal` scene setting (airport/station backdrop, neutral stage + "Bahnhof"
  caption for now) and an optional per-scene `label` (stage caption override), mirrored in `lint-content.mjs`
  and threaded through the Cutscene/Listening/Battle renderers. Added NPCs `npc_beamter`/`npc_automat`, key
  items `ki_reisepass`/`ki_fahrschein`, and 2 provenance rows (draft). Missions are travel-theme, B1.1, each a
  cutscene → dialogue battle → payoff arc with a scaffolded-retry lose path (failure-as-content). Neuland now
  has **3 missions** (1.1, 1.2, 1.6 boss); 1.3–1.5 remain for the next increments. Gates green:
  `lint:content` (3 missions / 18 scenes / 8 NPCs / 6 key items / 1423 rows), `build`, `check:bundle` (83 kB,
  game stays lazy), `test:unit` (85), `lint` (0 errors).
- **Artifacts:** `src/data/missions.ts`, `src/data/provenance.ts`, `src/types/game.ts`,
  `scripts/lint-content.mjs`, `src/features/welt/stage.tsx`, `src/features/welt/scenes.tsx`,
  `src/features/welt/BattleView.tsx`, `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entries 227–229).
  Shipped as **PR #365** (squash-merged to `main`, commit `e4e00e7`).

## Entry 230 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead with 1.3 to 1.5
- **Response summary:** Authored the remaining three chapter-1 Neuland missions (not in the parked draft, so
  written fresh against the established scene patterns), completing **Kapitel 1 end-to-end**:
  **1.3 "Die SIM-Karte"** (phone-shop upsell battle vs Milo, resist the Vertrag, tariff-page parody, grants
  `ki_sim_vertrag`; theme `technology`), **1.4 "Der erste Einkauf"** (Leergutautomat/Pfand parody teaching
  Mehrweg 8 ct / Einweg 25 ct + the legendary checkout-speed battle vs the Kassiererin; theme `sustainability`
  via the recycling angle), **1.5 "Ein Dach über dem Kopf"** (landlord Herr Brandt polite-register battle +
  the Wohnungsgeberbestätigung form-cloze, grants `ki_wohnungsgeberbestaetigung`, sets up the boss's document
  chain; theme `wohnen`). Added a `laden` (shop) scene setting, NPCs `npc_milo`/`npc_kassiererin`/
  `npc_herr_brandt`, key item `ki_sim_vertrag`, and 3 draft provenance rows. Chained 1.2→1.3→1.4→1.5 via
  `requiresMissions`; **left the boss (1.6) ungated on purpose** (a `mission.test.ts` fixture pins it as the
  standalone playtest slice) after briefly gating it broke that test. Neuland now has **6 missions** (full
  Kapitel 1). Gates green: `lint:content` (6 missions / 35 scenes / 11 NPCs / 7 key items / 1426 rows),
  `build`, `check:bundle` (83 kB, game stays lazy), `test:unit` (85), `lint` (0 errors).
- **Artifacts:** `src/data/missions.ts`, `src/data/provenance.ts`, `src/types/game.ts`,
  `scripts/lint-content.mjs`, `src/features/welt/stage.tsx`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 230). Shipped as **PR #366** (squash-merged to `main`, commit `bfd143b`).

## Entry 231 — 2026-07-08 (session 81)
- **Branch:** `claude/game-plan-next-steps-aqhim3`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document the session
- **Response summary:** Documentation wrap-up for session 81 (G2 kickoff + Neuland Kapitel 1 completed across
  PRs #365 and #366). Most of the record was written inline as the two increments shipped: the
  `PROJECT_STATUS.md` header, content counts (game missions 1→6, scenes→35, NPCs→11, key items→7, provenance
  →1,426) and the session-81 "Resume here" handoff (rewritten to reflect the complete chapter), plus
  prompt-log entries 227–230 and the move of the session-79 handoff into the W28 status archive. This pass
  backfilled the PR/commit references on entries 229 (**PR #365**, `e4e00e7`) and 230 (**PR #366**, `bfd143b`),
  refreshed the stale game facts in `CLAUDE.md` (Kapitel 1 now complete, G2 is GO) and flipped the
  `GAME_IMPLEMENTATION_PLAN.md` G2 phase status from not-started to in-progress, and added this entry.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` (entries 229–231), `CLAUDE.md`,
  `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md` (verified current). Doc-only; shipped
  via PR → squash-merge → branch realign.

## Entry 232 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 2 screenshots of `/welt` (the Willkommen passport battle + the Fahrkarten-Automat cutscene), both showing a blank beige game stage
- **Prompt (verbatim):**
  > looks like there's no game visuals here..
- **Response summary:** Diagnosed and fixed. Root cause: `SETTING_ART` in `src/features/welt/stage.tsx`
  mapped the `terminal` (8 scenes) and `laden` (8 scenes) settings to `null`, so the two most-used
  Chapter-1 backdrops rendered as the neutral paper stage. Authored two code-authored placeholder backdrops
  in `preview/game-pixel-mockups/welt_assets.py` (blessed scene-7 pixel language, new polished-tile floor
  helper): **terminal** (transit hall: split-flap board, passport/service counter under the battle-opponent
  spot, self-service ticket machine, direction sign) and **laden** (shop: product shelves, checkout counter
  with register + card terminal, sale poster). Installed Pillow, regenerated `terminal.png`/`laden.png`,
  wired both into `SETTING_ART` (`website` stays `null` on purpose). Sent the founder upscaled previews.
  Gates green: `pnpm build`, `check:bundle` (83 kB, game stays lazy).
- **Artifacts:** `preview/game-pixel-mockups/welt_assets.py`, `src/features/welt/assets/terminal.png`,
  `src/features/welt/assets/laden.png`, `src/features/welt/stage.tsx`. Shipped as **PR #368** (squash-merged
  to `main`, commit `5445b79`).

## Entry 233 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** 1 screenshot (Fahrkarten-Automat now rendering with the transit-hall backdrop after deploy)
- **Prompts (verbatim):**
  > yes.. automerge!!
  > the visual is the same in 1.2, is that correct?
  > will the character be able to walk in the game as per the plan?
  > is g2 complete?
  > should we continue g2 implementation here or in a fresh session?
  > go ahead
- **Response summary:** Opened + squash-merged **PR #368** into `main`, ran the post-merge branch realign
  (reset to `origin/main`, force-with-lease push). Answered a run of roadmap questions: (1) the repeated
  backdrop within mission 1.2 is correct, backdrops are per-location and 1.2 is all at the Hauptbahnhof;
  the unoccupied counter is because the battle opponent (`npc_automat`) has no sprite. (2) Walking is
  planned but phased, full free-roam is **G3** (Phaser overworld, playtest-gated); battle/cutscene scenes
  are staged React tableaux by design; only the loadout scene walks today. (3) **G2 is in progress, not
  complete**, remaining: recurring-mission composer, fetch-quest loop, Supabase game-state migration.
  Recommended doing those in a fresh session (different subsystem, wants plan-first) and closing the
  doc-accuracy update here. On "go ahead", updated the stale "neutral stages" lines in `CLAUDE.md` +
  `GAME_IMPLEMENTATION_PLAN.md`, refreshed `PROJECT_STATUS.md` (s82 header + handoff, dropped backdrops
  from the G2-pending list, moved the aged-out s80 handoff into the W28 archive), and added these entries.
- **Artifacts:** `CLAUDE.md`, `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`,
  `docs/SESSION_PROMPT_LOG.md` (entries 232–233). Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 234 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > why is every mission looking like final boss mission with energy bars? is there no variety?
  > your explanation is too technical. can you brief me in simpler language and what's your recommendation?
  > is it necessary to change the order? if we complete the game implementation plan, anyway everything will be in place, right?
  > go with your recommendation
- **Response summary:** Confirmed the founder's observation from the data: all 6 Kapitel-1 missions have
  exactly one dialogueBattle as centerpiece (scene mix 20 cutscene / 6 battle / 3 websiteParody /
  2 listening / 2 formCloze / 1 loadout), so the Geduld/Mut bars appear every mission. Cause: the battle is
  the only fully-built interactive mechanic; the 20-type activity catalog in
  `MISSION_ACTIVITY_RESEARCH.md` mostly needs renderers not yet built (mission 1.2 was always intended as
  a Keypad/Automat scene, authored as a battle because that kind doesn't exist). Recommended, and the
  founder approved after a plain-language briefing and an is-it-necessary check (answer: same total work,
  re-sequenced so the playtest measures fun, not repetition): **build scene variety before the plumbing.**
  New G2 order: (1) hotspot tappable-stage layer, (2) Keypad/Automat kind + re-skin 1.2 and the 1.4
  Leergut beat, (3) type-under-timer for the 1.4 checkout, then (4) recurring-mission composer,
  (5) fetch-quest loop, (6) Supabase game-state migration. Decision recorded in
  `GAME_IMPLEMENTATION_PLAN.md` (G2 status block) and the s82 handoff in `PROJECT_STATUS.md`.
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 234). Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 235 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I'd like to complete the implementation of the game plan before showing it to a crowd because the crowd I'll be sharing with are b2 learners. if they don't have enough content to play with they'll be bored with the easy stuff in the beginning.
- **Response summary:** Validated the concern with data (all Kapitel-1 missions are B1.1–B1.2, too easy
  for a B2 crowd) and sized the options: the assistant recommended a middle path (G2 variety + Kapitel 2
  + a start-at-your-level entry, city after external feedback), and offered "through Kapitel 3" and "full
  plan incl. city" as alternatives. **The founder chose the full plan: complete G2 + author Kapitel 2–6 +
  build the G3 walkable city before the external 5–10-learner playtest.** Risk management agreed: founder
  remains the internal per-chapter tester, content before engine, zero-spend holds, and a chapter-select /
  start-at-your-level entry joins the build list so B2 testers can skip the easy opening. Recorded in
  `GAME_IMPLEMENTATION_PLAN.md` (G2 status block + a G3 gating note: G3 no longer playtest-gated; the
  external test moves to the end of G3) and the s82 handoff in `PROJECT_STATUS.md` (long-road order:
  G2 variety rungs → Kapitel 2–6 → plumbing interleaved → chapter-select → G3 city → external playtest).
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 235). Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 236 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > is model recommendations included in the plan?
- **Response summary:** Yes: `GAME_IMPLEMENTATION_PLAN.md` has a "Claude model recommendations" section
  (tier table + per-task map + the open-strong/downshift working pattern), and general per-session model
  guidance lives in `PROJECT_REFERENCE.md`. The map predated the two s82 decisions, so added rows for the
  newly approved work: variety scene-kind SCHEMA shape (Fable 5, closed-union longevity), variety
  renderers + 1.2/1.4 re-skin (Sonnet 5), chapter-select entry (Sonnet 5), Kapitel 2–6 arc design per
  chapter (Fable 5), and Kapitel 2–6 mission authoring (Sonnet 5 draft + Haiku 4.5 gates).
- **Artifacts:** `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/SESSION_PROMPT_LOG.md` (entry 236).
  Doc-only; shipped via PR → squash-merge → branch realign.

## Entry 237 — 2026-07-08 (session 82)
- **Branch:** `claude/missing-game-visuals-qcmde6`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompts (verbatim):**
  > okay. document this session. I'll continue in another one
  > continue
- **Response summary:** Session-82 documentation wrap-up. Most of the record was written inline as the work
  shipped (PROJECT_STATUS s82 header + handoff, the two decision notes in `GAME_IMPLEMENTATION_PLAN.md`, the
  model-map rows, prompt-log entries 232–236, the s80 handoff moved to the W28 archive). This pass finished
  it: rewrote the `PROJECT_STATUS.md` `_Last updated_` header to lead with the visuals fix + both G2
  decisions, refreshed the stale game-layer header in `CLAUDE.md` (G2 GO → G2 in progress; added the s82
  direction summary), and added this entry. Session shipped 5 PRs to `main`: #368 (terminal/laden
  backdrops, the only code change), #369 (doc-accuracy), #370 (variety-first reorder), #371 (playtest gate
  to end of full build), #372 (model-map rows).
- **Artifacts:** `docs/PROJECT_STATUS.md`, `CLAUDE.md`, `docs/SESSION_PROMPT_LOG.md` (entry 237). Doc-only;
  shipped via PR → squash-merge → branch realign.

## Entry 238 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > start the G2 variety work
- **Response summary:** Read the s82-approved G2 reorder (scene variety before plumbing) and built
  **rung 1: the `hotspot` scene kind** (activity catalog #2 "Hotspot antippen", one generic
  tappable-stage layer that also carries #7 "Aufruf abfangen" and #18 "Listen-and-act" via an optional
  TTS `audio` line). The player proves comprehension by TAPPING the right place on the pixel stage
  instead of picking a sentence; wrong taps earn only a deadpan reaction (failure is content), the scene
  clears once every `correct` spot is found. Missions stay data, not code: `types/game.ts` (`Hotspot` +
  `HotspotScene` in the closed `MissionScene` union), `engine/mission.ts` (pure `tapHotspot`/
  `hotspotSolved` with scene-scoped first-try FSRS grading + XP, two run-state maps), `HotspotView`
  renderer in `features/welt/scenes.tsx` (blessed pixel-UI language, wired into `MissionPlayer`),
  `lint-content.mjs` mirror + spot validation, 6 runner tests over an inline fixture. Used the kind in
  the two earliest-played missions so the variety is visible: **1.1** gains a listen-and-act departure
  board (tap Gleis 4), **1.4** gains the shelf search (tap Milch/Brot/Äpfel among distractors). Gates
  green: `lint:content` (6 missions / 37 scenes), `test:unit` (91, +6), `build`, `check:bundle` (83 kB),
  `lint` (0 errors). Shipped as PR #374.
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/features/welt/scenes.tsx`,
  `src/features/welt/MissionPlayer.tsx`, `scripts/lint-content.mjs`, `src/data/missions.ts`,
  `tests/mission.test.ts`; docs `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`, `docs/archive/PROJECT_STATUS_ARCHIVE.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 238). PR #374 → squash-merge → branch realign.

## Entry 239 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead
- **Response summary:** Built **G2 variety rung 2: the `automat` (Keypad/Automat) scene kind** (activity
  catalog #8). A step-by-step rendered machine: the player reads the screen and presses the right key; a
  correct key advances the machine, a wrong key only buzzes (infinite patience, no bars, no lockout).
  Missions stay data, not code: `types/game.ts` (`AutomatKey`/`AutomatStep`/`AutomatScene` in the closed
  union), `engine/mission.ts` (pure `pressKey`/`currentAutomatStep`/`automatDone` with per-step first-try
  FSRS grading + XP, `AutomatRuntime` on the run, cleared on win), `AutomatView` renderer (device plate +
  LCD screen + keypad) wired into `MissionPlayer`, `lint-content.mjs` step-graph validation, 6 runner
  tests. **Re-skinned off the dialogueBattle per the founder's s82 reorder:** 1.2 Fahrkarten-Automat (the
  ticket-machine battle becomes a real machine; removed the unused `neustart` retry scaffolding, one fewer
  battle) and the 1.4 Leergut beat (the Pfand websiteParody becomes the Leergutautomat; removed the
  `vergessen` branch). `npc_automat` now unused, left in the registry (harmless). Gates green:
  `lint:content` (6 missions / 35 scenes), `test:unit` (97, +6), `build`, `check:bundle` (83 kB), `lint`
  (0 errors). Shipped as PR #375.
- **Artifacts:** `src/types/game.ts`, `src/engine/mission.ts`, `src/features/welt/scenes.tsx`,
  `src/features/welt/MissionPlayer.tsx`, `scripts/lint-content.mjs`, `src/data/missions.ts`,
  `tests/mission.test.ts`; docs `docs/plans/GAME_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`,
  `docs/SESSION_PROMPT_LOG.md` (entry 239). PR #375 → squash-merge → branch realign.

## Entry 240 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** screenshot of the 1.1 departure-board hotspot scene (game `/welt`)
- **Prompt (verbatim):**
  > @".../7a56fccf-1000085657.png" is this what you intended? it looks weird. what are the bubbles supposed to mean in thr game world?
- **Response summary:** Explained the "bubbles" are the hotspot tap targets (tap your platform, Gleis 4,
  to advance) and agreed the presentation was poor: big translucent circles read as floating soap bubbles
  disconnected from the world. **Fix (PR #376):** restyled labeled hotspot targets as solid pixel
  sign-plates (opaque cream fill, `GAME_OUT` border, hard shadow, gentle idle bob) so they read as
  tappable station/shelf signs; kept the translucent pulsing ring only for label-less "tap the real object"
  spots; found → teal plate + check, wrong → rose shake. Tidied 1.1 platform signs into a row and 1.4 shelf
  tags into two rows. Verified the look with a Chromium-rendered mock over the real `terminal.png` backdrop
  and sent it to the founder. Gates green (lint:content, 97 tests, build, bundle 83 kB, lint 0 errors);
  CI green; squash-merged; branch realigned.
- **Artifacts:** `src/features/welt/scenes.tsx`, `src/data/missions.ts`; PR #376 → squash-merge → realign.
  `docs/SESSION_PROMPT_LOG.md` (entry 240).

## Entry 241 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the story line and the exercises/missions are weak. suggest me how can I research and brainstorm with various tools like chatgpt or Gemini
- **Response summary:** Advisory answer (no code). Named the two real problems (story = no player *want* /
  flat stakes / thin NPCs; missions = repeated shape + choices without consequence), gave the four-rule
  method that makes LLM brainstorming work (prime with real docs → ask for a named artifact → force a
  critique loop → cross-examine tools then synthesize), a tool-by-tool guide (Claude/ChatGPT deep
  research/Gemini/NotebookLM), and a starter copy-paste prompt pack. Offered four concrete next actions
  (primer pack, in-house brainstorm, deep-research report, expanded prompt pack). A follow-up
  AskUserQuestion failed on a tool-permission error, so the options were restated in plain text.
- **Artifacts:** none (advisory). `docs/SESSION_PROMPT_LOG.md` (entry 241).

## Entry 242 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > i want all four
- **Response summary:** Produced all four deliverables as `docs/strategy/` docs (PR #377, docs-only),
  grounding them in `GAME_CONCEPT.md` + `GAME_DESIGN.md` and real web research (Wagotabi, Influent,
  Duolingo Adventures, Terra Alia, the serious-games narrative review, Dan Harmon story circle, task-based
  SLA): **`NEULAND_PRIMER.md`** (paste-ready context pack), **`BRAINSTORM_TOOLKIT.md`** (method + prompt
  pack + tool tactics), **`STORY_MISSION_BRAINSTORM.md`** (worked multi-lens brainstorm: keystone want
  "stop being a problem to be processed, become a person who belongs"; Chapter 1 on the Harmon circle
  with 1.5 as false victory and 1.6 as the cost; cast want/flaw/tic; per-mission fixes for 1.1/1.3/1.5),
  **`LANGUAGE_RPG_RESEARCH.md`** (cited survey + 10 prioritized recommendations). Sent all four to the
  founder; committed and squash-merged; branch realigned. Recommended the keystone decision is the player
  *want*, and flagged that all AI-drafted German stays a draft until `verify:grammar`/native review.
- **Artifacts:** `docs/strategy/NEULAND_PRIMER.md`, `docs/strategy/BRAINSTORM_TOOLKIT.md`,
  `docs/strategy/STORY_MISSION_BRAINSTORM.md`, `docs/strategy/LANGUAGE_RPG_RESEARCH.md`; PR #377 →
  squash-merge → realign. `docs/SESSION_PROMPT_LOG.md` (entry 242).

## Entry 243 — 2026-07-08 (session 83)
- **Branch:** `claude/g2-variety-work-0t6c9a`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > I'll run it through other llms. document the session for now
- **Response summary:** Session-documentation pass. Updated `docs/PROJECT_STATUS.md` (header + s83 handoff:
  added the hotspot sign-plate polish and the four story-research docs, noting the founder is taking them
  to other LLMs and the keystone decision is the player want) and appended prompt-log entries 240–243.
  No code changes.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/SESSION_PROMPT_LOG.md` (entry 243). Doc-only; shipped via
  PR → squash-merge → branch realign.

## Entry 244 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > the categorization of the items in the bibliothek needs a lot of improvement. Define what each
  > filter or classification means (difference between Situation and Thema) and do a thorough analysis
  > of the weak or vague or incorrect implementation of the various filters like Thema, Branche, etc. I
  > personally think it's helpful to classify using filters like below (not comprehensive): * Thema/
  > Situation - Teamarbeit, Besprechung, Transport, etc. * Branche - Pflege, Schule, Finanz, Bank, IT,
  > etc. (currently, there is Buro in Branche which is redundant and wrong to keep it here because every
  > Branche area has a Buro - if anything it should be in Thema but it's too vague to be there as there
  > are already specific Buro situations there. ) * Why Kollocations and Redemittel have way too less
  > filters? And Grammatik has no filter at all? * UI/UX elements like why should something be a dropdown
  > vs filter tab? * Visual bugs and improvements * How can one know what are the most useful words - can
  > there be some kind of graph to show most used words? I want you to spin up a panel of experts to
  > validate, research, challenge above ideas, existing content and structure, identify missing aspects
  > and finally provide a thorough and robust report with findings, gap analysis and recommendations to
  > take the app to make it ready for marketplace that would be genuinely useful and extremely intuitive
  > to work with for the users.
- **Response summary:** Analysis-only session (no app code changed). Ran a codebase audit that established
  the ground-truth facts (Branche `sector` 26/642 = 4%, only care+office live; Situation `workSituation`
  14/642 = 2.2%; Redemittel 0/82 with cefr or themeId; Grammar has no level field; Register `diplomatic`
  0 on collocations; `frequency` 0-tagged though `scripts/vendor/german-frequency-subset.json` wordfreq
  data already ships build-time-only; Domain axis exists in `domains.ts` but is surfaced nowhere; the
  theme `meetings` vs situation `meeting` naming collision). Then convened a 7-agent expert panel via a
  Workflow (information architecture, DaF/CEFR pedagogy, UX/interaction, content-data strategy,
  competitive/marketplace) + an adversarial red-team + a synthesis pass. Key conclusions: taxonomy is
  sound but *looks* broken; Thema vs Situation is one axis at two grains (retire `workSituation`, keep
  sub-themes); "Büro" removal is correct (category error); Branche should be hidden until a sector has
  depth (do not author per-industry packs); Redemittel needs CEFR but NOT a single themeId; Grammar needs
  search+group+level-badge not a facet sheet; "most useful words" ships as a generated frequency badge +
  honest composition chart, never a leaderboard; two free high-value axes nobody proposed (surface Domain
  as the spine, add an SRS-state filter). Delivered a full repo doc + a visual Artifact. No PR opened
  (analysis deliverable; P0 quick wins offered to the founder as the next step).
- **Artifacts:** `docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md` (full report + verbatim
  red-team appendix); visual report Artifact (categorization audit). `docs/SESSION_PROMPT_LOG.md`
  (entry 244). Committed to the dev branch; not merged (no code change).

## Entry 245 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > go ahead and scope the implementation of the top priorities from the report
- **Response summary:** Grounded the audit against the real code (found two audit corrections: the
  Kollokationen Thema dropdown already exists; `ui/select` lacked group primitives; verified the enum
  removals have no consumers outside data/types/facets) and wrote
  `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md`: five shippable PRs (1 stop-looking-broken,
  2 Grammar toolbar, 5 polish, 3 frequency, 4 Domain+SRS) with exact files, edge cases, backwards-compat,
  gates and effort, plus the decision-gated Redemittel backfill. Recommended order 1→2→5→3→4; PRs 1/2/5
  decision-independent.
- **Artifacts:** `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md` (commit 903eb9d, pushed to
  the dev branch). `docs/SESSION_PROMPT_LOG.md` (entry 245).

## Entry 246 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > let's lock in more decisions
- **Response summary:** Locked all five audit decisions via AskUserQuestion (founder answers): (1)
  **Branche parked** (after a clarifying founder question "why will be deleted? there is domain which is
  same as Branche isn't it?", answered with the Domain-vs-Branche role rule: Domain = life-sphere of the
  topic, Branche = industry you work in, cutting across topics); (2) **Redemittel CEFR backfill: yes**,
  AI-draft + founder review; (3) **Häufigkeit: badge + chart**; (4) **Domain/Mode: Mode on top**, Mode
  pre-selects domains; (5) **Amtssprache: parked** (default, no objection). Then implemented and
  squash-merged the ENTIRE plan in the same session: PR #379 (coverage floor + Büro deletion +
  workSituation retirement), PR #380 (Grammatik search + Gruppe dropdown + B2-priority order), PR #381
  (polish batch: diplomatic→formal fold, Redemittel restructure with inline register chips, Kollokationen
  counts + sub-theme picker, visible "Stufe: bis X" level chip, a11y), PR #382 (generated Häufigkeit
  signal: `pnpm build:frequency` → `src/data/frequency.ts`, facet + card label + Fortschritt chart with
  mastery overlay; also fixed the pre-existing black-charts bug where all Analytics charts referenced
  non-existent `var(--color-*)` vars), PR #383 (Domain-grouped theme dropdown via `lib/themeGroups.ts` +
  per-learner Lernstand `?srs=` facet), and the final docs+backfill PR (all 72 Redemittel AI-draft-tagged
  with cefr, level badge on each card for founder review). Every PR passed build, lint:content, test:unit
  (97), lint (0 errors), check:bundle (83 kB) and was Chromium-smoke-tested before merge.
- **Artifacts:** PRs #379, #380, #381, #382, #383 + the final docs/backfill PR (all squash-merged to
  `main`, branch realigned each time); `src/data/frequency.ts` (generated), `scripts/build-frequency.mjs`,
  `src/lib/themeGroups.ts` (new); updated `CLAUDE.md`, `docs/strategy/DATA_GOVERNANCE.md`,
  `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md`, `docs/PROJECT_STATUS.md`.
  `docs/SESSION_PROMPT_LOG.md` (entry 246). **Founder review pending: the 72 Redemittel cefr drafts.**

## Entry 247 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > implement p2 and p3 too
- **Response summary:** Shipped the audit's remaining P2 + P3 items as PR #385. P2: `GrammarTopic.cefr`
  added and all 10 topics AI-draft-tagged (B1.1 Nebensätze/Modalverben · B1.2 Relativsätze/Verbstellung/
  Kasus · B2.1 Konnektoren/da-Wörter/Konjunktiv II/Passiv · B2.2 Funktionsverbgefüge; founder verify
  pending), shown as badges on the hub cards + topic view, with a linter COMPLETENESS check; the
  control-choice rule + axis rule codified in the `lib/facets.ts` header and as a locked
  "Bibliothek classification axes" section in `docs/DECISIONS.md`. P3 resolved as CUT (not park): the
  0-tagged `counterpart`/`taskType` forward-declares deleted from types + linter mirrors (zero data
  lost), with a linter error on reintroduction. CLAUDE.md taxonomy/grammar facts refreshed. All gates
  green (build, lint:content, test:unit 97, lint 0 errors, bundle 83 kB) + Chromium smoke of the badges.
  With this, EVERY item from the categorization audit roadmap is shipped or founder-review-pending.
- **Artifacts:** PR #385 → squash-merge → realign; `docs/DECISIONS.md` (new locked section),
  `docs/SESSION_PROMPT_LOG.md` (entry 247).

## Entry 248 — 2026-07-09 (session 84)
- **Branch:** `claude/bibliothek-categorization-analysis-mtqo5o`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** none
- **Prompt (verbatim):**
  > document this session.
- **Response summary:** Session-documentation pass. Most docs were written incrementally during the
  session (prompt-log entries 244–247; the PROJECT_STATUS session-84 handoff; CLAUDE.md taxonomy/grammar
  facts; the locked "Bibliothek classification axes" section in `docs/DECISIONS.md`; the implementation
  plan marked fully shipped). This pass applied the doc-hygiene rotation rule: moved the older
  **session-82 handoff** out of PROJECT_STATUS "Resume here" into
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md` (Resume here now holds only the two most
  recent handoffs, 84 + 83; live doc trimmed 386→348 lines), updated the "Older handoffs" note (1–82 /
  69–82 in W28) and the archive index row, and appended this entry. No app code changed.
- **Artifacts:** `docs/PROJECT_STATUS.md`, `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`,
  `docs/archive/PROJECT_STATUS_ARCHIVE.md`, `docs/SESSION_PROMPT_LOG.md` (entry 248). Doc-only; shipped
  via PR → squash-merge → branch realign.
## Entry 249 — 2026-07-09 (session 85)
- **Branch:** `claude/genauly-start-page-preview-1ih2vi`
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** a hand-drawn notebook photo titled "Start page" (two variants: a Genauly sidebar +
  Willkommen header + a Spielen/Üben toggle over either a "Neuland" carousel with < > arrows or a
  "Last Session" card + "Fortschritt Verlauf" progress rings).
- **Prompt (verbatim):**
  > can you generate a preview of the start page of genauly app based on the attached drawing?
- **Response summary:** Read the app's real tokens/nav and built a faithful interactive HTML Artifact of
  the start page (sidebar + top row + Spielen/Üben toggle: Spielen → Neuland chapter carousel, Üben →
  last-session + Fortschritt rings), light/dark aware, on brand indigo.
- **Prompt (verbatim):**
  > I like it, try to make the spielen part a bit more minimalistic. Also, switch the positions of
  > spielen and uben. Uben should be first and oopened by default.
- **Response summary:** Reordered the toggle (Üben first + default) and stripped the Spielen card to a
  minimal indigo panel (dropped the pixel-scene band, Beta chip, redundant caption); redeployed the same
  Artifact URL.
- **Prompt (verbatim):**
  > I see the left side vertical bar is gone and is on the top now but you can keep the left side bar and
  > the existing elements on the top row intact. Only change the contents within the Heute page. I like
  > the proposed design. Implement it with a robust plan.
- **Response summary:** Implemented the design in-app, scoped to the Dashboard body. New Üben/Spielen
  toggle; Üben reuses `/session` + a store-only four-ring Fortschritt row; Spielen is a new lazy
  `NeulandCarousel` deep-linking into `/welt?mission=<id>`; `Welt.tsx` gained `?mission=` auto-open.
  Kept the sidebar + greeting row. Verified both tabs in Chromium (no page errors); all gates green.
  Via AskUserQuestion the founder confirmed removing the city strip + Situationen chips and merging to
  production.
- **Artifacts:** `src/features/dashboard/Dashboard.tsx`, `src/features/dashboard/NeulandCarousel.tsx`
  (new), `src/features/welt/Welt.tsx` (commit d7e9bb8); updated `CLAUDE.md`, `docs/PROJECT_STATUS.md`;
  `docs/SESSION_PROMPT_LOG.md` (entry 249). PR into `main` (squash) + branch realignment.
