

**Handoff after session 167 (2026-07-25), part 2: P2 + no-CLI deploys, MERGED AND LIVE.**
Branch `claude/writing-aufgaben-research-faw959`, PRs **#711** (the overhaul) and **#712** (a CI fix).

- **P2: the evaluator receives the Aufgabe.** `evaluate-writing` previously got `{theme, length,
  text}` and the task text never reached a prompt, so Aufgabenerfüllung was structurally
  uncheckable. It now receives `taskId · task · points[] · level · format · addressee · register ·
  words`, all bounded server-side (learner-supplied input on the wire, not trusted content).
  `buildSystemPrompt(level, hasTask)` replaced the fixed "Prüfer:in für Deutsch B2 Beruf" string: it
  grades at the TASK's level and checks content FIRST, mirroring Goethe Erfüllung / telc Leitpunkte.
  New `taskCompletion` WeaknessCategory (mirrored in `practiceAreas`, deep-linking back into Kurz,
  and in the linter). The Aufgabe travels with every provider call so a cascade fallback cannot
  downgrade to language-only grading.
- **Cache correctness:** `hashText` now folds in the task id, the level and `PROMPT_REV`. Text-only
  keying would have returned a verdict produced for a DIFFERENT Aufgabe the moment the task shaped
  the prompt. Bump `PROMPT_REV` on any rubric change.
- **Permanent task ids:** all **493** tasks carry `wt_<themeId>_<s|l><nn>`, required by the schema
  and enforced unique + pattern-matched by `lintWritingPrompts` (negative-tested). Migration **0011**
  adds `writing_evaluations.task_id`; `writingTaskById()` resolves it and **Verlauf shows the Aufgabe
  again** with its Inhaltspunkte. Old rows have no id and still render text-only.
- **No-CLI deploys (the founder has no CLI).** New `.github/workflows/supabase.yml` verifies the
  access token, applies migrations, then deploys every Edge Function on merge to `main`.
  `SUPABASE_ACCESS_TOKEN` is set; **`SUPABASE_DB_PASSWORD` is deliberately NOT**, so CI skips
  migrations and each new migration is pasted into the Dashboard SQL editor (which is how 0011 was
  applied). **Keep migrations idempotent** for that reason.
- **Token expiry:** the access token carries a 30-day expiry (~24 Aug 2026). A "Verify access token"
  step runs first and, on rejection, fails with an explicit regenerate-it error having deployed
  nothing.
- **My mistake, for the record:** the first deploy run FAILED because I pinned `supabase/setup-cli`
  to a commit SHA I invented (this sandbox has no network to verify one). It failed at action
  resolution, so nothing deployed and nothing was half-applied. Fixed in #712 by pinning to the `v1`
  TAG, a documented deviation from this repo's SHA-pinning convention. **Re-pin it to a verified SHA
  when someone with network can look one up.**
- **Verified:** run `30165587804` green (token verified, migrations skipped by design, all five
  functions deployed in 31s), alongside Pages and Validate on `6b9b6a8`.
- **NOT verified:** the Edge Functions are syntax-checked only. No Deno in the sandbox and they
  import from `esm.sh` URLs `tsc` cannot resolve, and the new grading prompt was never exercised
  end-to-end (needs live credentials + a real model call). The first Kurz submission after deploy is
  its first real test; failure modes fail safe (`parseInsight` falls back to `vocabularyRange`).
- **Next:** content waves 2 to 4 in `docs/plans/SCHREIBEN-OVERHAUL.md` §11 P3 (Branche variants
  written to the four-way-difference test, the Alltag rewrite of the ~373 legacy tasks so they carry
  Inhaltspunkte, then breadth), plus the §12 items that must not be hard-coded until verified from a
  primary source.

**Follow-up in session 167: Wave 1 content + per-module daily limits.**
- **Schema + content.** `WritingTask` gained the exam-shaped fields (`points[]` = the Inhaltspunkte an
  examiner grades, `addressee`, `register`, `level`, `format`, `exam`, `words`, `source`), all optional
  so the bank upgrades in waves. New `WritingFormat`/`WritingExam`/`WritingRegister` unions mirrored in
  `scripts/lint-content.mjs` (points bounded 2..5, words 30..300, register requires an addressee).
  **120 new Aufgaben**: every Thema x Niveau (B1/B2/C1.1) x Länge, modelled on the Goethe B1/B2/C1 and
  telc B2 Beruf task SHAPES. Founder was explicit that these are **reference, not mock exams**: no exam
  wording is copied. Alltag tasks now carry the formal apparatus (Betreff, Aktenzeichen, Bezugsdatum,
  Frist, Grußformel) as Inhaltspunkte and **assert no statutory deadline or euro amount**.
- **Rail** gained Niveau + Textsorte; the Aufgabe card renders the Inhaltspunkte and takes its word
  target from the task (real exam targets run 40 to 200 and share no single number).
- **Filter-rule correction, caught by screenshotting the real app.** untagged-=-universal is right for
  Branche but WRONG for Niveau/Textsorte: legacy tasks outnumber tagged ones ~10:1, so
  "C1.1 + Widerspruch" was serving a B1 address-change mail. Those two axes now prefer their tagged
  tasks and count with `countExact` (no fallback), greying out at zero, so a Lang-only Textsorte
  (Forumsbeitrag) reads as unavailable under Kurz instead of quietly serving a Notiz.
- **Daily allowances set by the founder:** Fokus **10**/day (`DAILY_CHECK_LIMIT`; one round = one
  Korrektur, the Umformung never consumes a second unit), Kurz **4** (`DAILY_LIMIT_SHORT`), Lang **2**
  (`DAILY_LIMIT_LONG`), the last two counted separately against `writing_evaluations.length`.
  `TRANSFORM_DAILY_LIMIT` dropped to 30 as a pure runaway guard. **The three Edge Functions must be
  redeployed for these to take effect.**
- **Gates:** typecheck · lint (0 errors) · lint:content · test:unit **313/313** · build ·
  check:bundle (117.2 kB). Verified in a real viewport, desktop + mobile 390px.
- **P2 SHIPPED later the same session** (see the handoff above): the evaluator receives the Aufgabe,
  every task has a permanent id, and evaluations record it.
