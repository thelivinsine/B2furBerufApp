# Project Status

_Last updated: 2026-07-25 (session 167). **Schreiben: the Aufgabe picker stopped lying, plus the
overhaul plan.** Founder report "why are there almost no items in the writing section?" root-caused:
the pool holds **373 tasks**, but the rail counted only sector-TAGGED tasks and greyed out at zero
while the trainer drew with a prefer-tagged-else-untagged fallback. Both now share ONE selector
(`src/lib/writingScope.ts`); Branche never disables, every dropdown count means "tasks this scope
draws from", and every dropdown carries a generic option including the new **Alle Themen** (now the
default landing scope). `docs/plans/SCHREIBEN-OVERHAUL.md` holds the founder-approved scope for the
content rebuild (B1/B2/C1.1 Niveau axis, exam-realistic Aufgaben, Textsorte axis, 800-1200 tasks in
waves). Prior s166: Schreiben mobile floating-cluster collision + panel-toggle contrast.
Wave 1 then added the exam-shaped task schema, 120 new Aufgaben across B1/B2/C1.1, the Niveau and
Textsorte rail axes, and founder-set daily allowances (Fokus 10 / Kurz 4 / Lang 2). P2 followed: the
evaluator now RECEIVES the Aufgabe and grades content first, every task carries a permanent id, and
evaluations record it so Verlauf shows the task again. **All of it is merged and live** (PRs #711 +
#712), and `.github/workflows/supabase.yml` now deploys Edge Functions on merge, so backend changes
no longer need a CLI. Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · Schreiben · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [x] ~~Redeploy `transform-sentence` to activate the "Nochmal" regenerate button (s163).~~
      **DONE 2026-07-24** (founder redeployed via the Supabase dashboard; the capped variant path is
      live).
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

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

**Handoff after session 167 (2026-07-25). Schreiben Aufgabe picker: one selection rule, plus the
overhaul plan, branch `claude/writing-aufgaben-research-faw959`.** Founder (two screenshots of the
Kurz/Lang Branche dropdown): "why are there almost no items in the writing section?"
- **Root cause: the rail and the engine disagreed.** `WritingRail.tsx` counted a Branche option as
  "tasks explicitly TAGGED with this sector" and set `disabled: count === 0`, while
  `GuidedWritingTrainer.tsx` drew with prefer-tagged-else-untagged and is never empty. The rail
  marked a Branche unavailable while the engine would have served the full universal pool behind it.
  The pool was never the problem: **373 tasks** (189 Kurz, 184 Lang) across all 20 Themen. Only
  70 carry a `sectors` tag, and **11 of 20 Themen carry none**, so every Alltag theme showed a
  completely dead Branche dropdown.
- **Fix: `src/lib/writingScope.ts` is now the ONE selection rule.** `eligibleTasks({theme, sub,
  sector, length})` returns `WritingTaskRef[]` (`{theme, ix}`); the trainer draws from it and every
  rail dropdown counts with it, so all counts finally mean the same thing. Branche never disables.
  The sector fallback is applied **per theme**, so a Branche under Alle Themen keeps the broad pool
  instead of collapsing to the tagged handful.
- **"Alle Themen" added** (founder: "add a generic or all themes option for all the dropdowns"), and
  it is now the **default landing scope** (was `themes[0]`, Besprechungen). A drawn task carries its
  own theme, which drives the "Aufgabe: <Thema>" eyebrow, the `evaluateWriting` call, the practice
  deep-link and the saved draft. Unterthema hides under Alle Themen (slugs are theme-scoped).
- **`tests/writingScope.test.ts` (new, 11 cases)** pins the invariants, including the regression:
  every Branche x every Thema x both lengths must yield > 0 tasks.
- **Files:** `src/lib/writingScope.ts` (new), `WritingRail.tsx`, `GuidedWritingTrainer.tsx`,
  `tests/writingScope.test.ts` (new), `docs/areas/SCHREIBEN.md`, `docs/plans/SCHREIBEN-OVERHAUL.md`
  (new). **Gates:** typecheck · lint (0 errors) · test:unit **304/304** · build · check:bundle
  (117.2 kB) · lint:content, all green.
- **The plan doc is the real deliverable of this session.** It carries the founder-approved scope
  (B1/B2/C1.1 Niveau axis · no fifth tab, exam simulation rides Kurz/Lang via a Prüfungsformat tag ·
  add Niveau + Textsorte rail axes · 800-1200 tasks in waves) and three findings that change
  existing assumptions: **Kurz/Lang word targets (40-60 / 120-150) match no real exam** and must
  become task-SHAPE buckets with per-task word targets; **there is no Goethe-Zertifikat B2 Beruf**
  (Goethe-Test PRO has no writing module at all, the Beruf writing exam is telc-only, so CLAUDE.md
  needs correcting); and **`evaluate-writing` never receives the task text**, which makes
  Aufgabenerfüllung structurally uncheckable and is the biggest quality ceiling in the module.
- **Research was half-blocked:** WebFetch returned 403 at the proxy for every external host and the
  session WebSearch budget ran out, so no official Modellsatz PDF was opened and **no verbatim exam
  prompt was obtained**. Findings are confidence-marked; §12 of the plan lists 7 items that must not
  be hard-coded until verified from a primary source.

**Follow-up in session 166: the Schreiben panel toggles now carry the rail's Himmelblau.** Founder:
"increase the contrast of the grammatik and aufgabe wahlen buttons in schreiben section" (preview
round explicitly waived, so implemented directly against the established language). Both toggles used
the shared `outline` variant (`bg-surface/50` + `border-border`), which reads as a ghost on the page
ground in both themes. They now use a new **`accent` Button variant** (Himmelblau tile, the color of
the rail each one opens) when closed, and keep the solid `default` when open, so the open/closed
distinction survives. Light mode borders with **`accent-ink/70`, not `accent`**: the accent is a
77%-light sky, so no alpha of it clears the 3:1 UI floor on the near-white ground (1.31:1 measured);
accent-ink/70 lands at 3.07:1. Dark keeps `accent/45` (3.34:1). Label contrast 4.72:1 light,
7.71:1 dark; `pnpm check:contrast` still green. The variant lives in `src/components/ui/button.tsx`,
so the Bibliothek filter toggles can adopt it later if the founder wants the same treatment there.
Gates: typecheck · lint (0 errors) · test:unit 293/293 · build · check:bundle · check:contrast.

**Handoff after session 166 (2026-07-24). Mobile floating action cluster no longer collides with
the card underneath (Schreiben), branch `claude/button-overlap-fix-s7fl28`.** Founder screenshot of
`/writing` (Lang, dark, mobile): the "Feedback" pill, the "Auswerten" button and the card's
"Noch N Wörter schreiben, dann kannst du auswerten." line all rendered on top of each other.
- **Root cause (two halves).** The mobile cluster is `sticky` with NO bar chrome (founder s159/s160),
  so it floats straight over the content cards. (a) With 0 words the Auswerten button is `disabled`
  → the base `disabled:opacity-50` made it half-transparent, so the card text behind bled *through*
  the button; `variant="outline"` (`bg-surface/50`) has the same problem. (b) The hint line is the
  LAST element of the editor card, i.e. exactly where the pinned cluster sits, so the collision was
  guaranteed whenever the button was inactive. Padding cannot fix this: a bottom-pinned sticky
  element floats over content at every scroll position except the very end.
- **Fix (both writing trainers, shared contract).** New `src/features/writing/floatingCluster.ts`
  exports `floatingSlot` (opaque `bg-background` backing behind each control) and `floatingNote`
  (`bg-background/90` + `backdrop-blur-sm` plate behind the caption, matching the other mobile bars).
  `--background` equals the page stops, so both are invisible against the page ground and only mask
  where they float over a card. The transient "Noch N Wörter …" hint moved from the card tail into
  the cluster's single caption slot (hint while too short, Art. 50 note once evaluating is possible,
  never both); the card keeps it on `lg:` only, where there is no cluster.
- **Files:** `src/features/writing/floatingCluster.ts` (new), `GuidedWritingTrainer.tsx`,
  `fokus/FokusTrainer.tsx`, `docs/areas/SCHREIBEN.md`.
- **Verified in a real mobile viewport** (Playwright, 360×800 @3x, light + dark, cluster parked
  pinned over the editor card): buttons opaque, caption legible, nothing overlapping in any state
  (too short / ready / Fokus). The other four mobile bars (Wörter, Kollokationen, Redemittel,
  Grammatik) already carry `bg-background/90 backdrop-blur` and needed no change.
- **Gates:** typecheck · lint (0 errors) · test:unit **293/293** · build · check:bundle (117.0 kB),
  all green.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
