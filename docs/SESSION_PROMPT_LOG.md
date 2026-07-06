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
