# Project Status

_Last updated: 2026-07-27 (session 172). **The correction now appears in the Kurz/Lang trainer**
(founder pick A): once an evaluation lands, the editor card becomes the correction card with the
Original/Korrigiert toggle and the Himmelblau fix tiles, Fokus-style, and the result card stays short.
Fokus, Kurz/Lang and Verlauf render corrections from ONE shared module
(`src/features/writing/correction.tsx`), so the tile language cannot drift; `classifyChange` gained
"Kasus & Artikel". **Merged (PR #739).** Prior s171: Verlauf leads with a
weakness-trend card over a compact row list, Fortschritt with a Kompetenz curve, and Verlauf covers
both trainers. `docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
`.github/workflows/supabase.yml` deploys Edge Functions on merge, so backend changes no longer need
a CLI. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 172 (2026-07-27). The correction in Kurz/Lang (founder pick A), merged as
PR #739.**
Prompt 13/14 built and re-shared `preview/kurz-lang-korrektur.html` (three places for the correction:
A im Schreibfeld · B alles im Ergebnis · C zum Aufklappen, bottom cluster + Aufgabe card held identical
across all three). The founder picked **A** and asked to "make sure both the tiles are harmonious with
Fokus design", which was literal: the round-1 tiles lacked Fokus's `→`, and the Verlauf copies had
drifted too (em dash where Fokus prints `∅`).
- **ONE correction language:** the Fokus pieces now live in `src/features/writing/correction.tsx`
  (`useCorrectionDiff`, `CorrectionToggle`, `MarkedTokens`, `MarkedParagraphs`, `FixTiles` with optional
  `max` + `action`), and Fokus desktop, Kurz/Lang and Verlauf all render from it, so a fourth copy
  cannot drift. `tests/correction.test.tsx` pins the tile anatomy. Fokus MOBILE keeps its own
  two-column list (measured height, founder r4 amendment); Kurz/Lang shows tiles at both breakpoints
  because its result page scrolls anyway.
- **Kurz/Lang variant A:** the editor card becomes the correction card once a result lands. "Neu
  schreiben" rides the tile row at `lg` (the Fokus "Neuer Satz" spot) and Auswerten drops out there
  while a correction is up (it would only re-serve the cached verdict); the mobile cluster is
  untouched. Any result WITHOUT a correction (error-free, templated spelling verdict, failure, limit)
  keeps the plain field, so fixing and resubmitting still works. `useFillEditor` measures the bottom
  clearance FIRST, so the field-less state still reserves the fixed chrome, and releases the Aufgabe cap
  there. **No backend change:** `corrected` has been in the evaluate-writing response, cache included,
  since s171.
- **`classifyChange` gained "Kasus & Artikel"**: "in meine Wohnung → in meiner Wohnung" was labelled
  Rechtschreibung, i.e. the tile taught the wrong rule on the most common B1/B2 mistake. Both sides must
  be in a closed article/possessive/determiner set, so "das → dass" stays Rechtschreibung and a
  case-only change stays Groß-/Kleinschreibung.
- **Verification pattern worth reusing:** `preview/gen-kurz-lang-korrektur-r2.mjs` SSR-renders the REAL
  components (via Vite `ssrLoadModule` + `react-dom/server`) beside the Fokus card and inlines the app's
  built CSS, so a preview sheet cannot flatter the implementation. Emits light, dark and an
  artifact-body variant (artifact `575786f8`). Note this sandbox has the Chromium binary at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` but NO playwright module, so screenshots go
  through `chrome --headless --screenshot`.
- **Gates:** typecheck · lint 0 errors · test:unit **327/327** · build · check:bundle 118.4 kB.
- **Next:** the founder verifies the live result (Pages deploy from the squash-merge of #739). Open
  question they may raise: the round-1 mock drew "Kasus üben" in the phone's bottom row, which the
  shipped cluster does not do (the practice CTA stays inside the result card); changing that touches the
  locked cluster and needs an explicit ask.

**Handoff after session 171 (2026-07-26). Verlauf + Fortschritt redesign (founder picks C and 3),
branch `claude/selection-color-contrast-3upqkz`, PRs #685 + #733.** Opened with a one-line contrast fix
(the desktop Sidebar's active row was too dark: `bg-border` -> `bg-muted`, lighter than the old
selection but still darker than the hover, PR #685, merged). Then a four-agent analysis of Schreiben's
Verlauf and the Fortschritt page, preview-first design
(`preview/verlauf-fortschritt-redesign.html`, artifact c3df428e, 3 named variants per surface), and
implementation of the two picks.
- **Verlauf = C "Entwicklung zuerst"** (`WritingHistory.tsx`, rewritten): a "Deine Entwicklung" card
  leads (top-3 weaknesses as 3-month bar groups, trend arrows, "X % weniger" badge, "Jetzt üben"),
  over a COMPACT row list. The disclosure now reads in event order: **Aufgabe** (from s167's
  `task_id`) -> **Dein Text** -> **Tipp** next to the practice CTA, with delete + the standalone AI
  line at the foot. Kurz/Lang `ModeSwitcher` only when both kinds exist.
- **Honesty guards (do not weaken):** a month needs >=2 texts to be a comparison point
  (`MIN_TEXTS_PER_MONTH`), a month with no texts prints "-" not 0, and under two comparable months
  the card falls back to totals. The live check caught the bug this prevents: compared against a
  one-text month, an improving category rendered as WORSENING.
- **Fortschritt = 3 "Kompetenzkurve"** (`Analytics.tsx`): a competence curve sits directly under the
  unchanged Überblick (mastered words / Can-Dos over time, green dots on days a Can-Do was reached,
  "Zuletzt erreicht" line); the XP chart moved into Details, because XP measures effort and dips in a
  quiet week, which reads as regression. The card states DIRECTION only ("+16 Wörter diese Woche");
  the absolute count stays on the Vokabeln tile. **Dranbleiben** = Prüfung (days-remaining ring over
  a 90-day run-up + last simulation + `/exam`, only while `examDate` is ahead) + a **writing-aware
  Diagnose** (most-flagged weakness of the last 60 evaluations, falling back to the weakest
  band/theme) + Nächste Quest (spans both columns when Prüfung shows). The duplicated
  writing-weakness panel was DELETED from Details: fed 60 entries against Verlauf's 30, the two
  surfaces could name different top weaknesses.
- **Competence is SAMPLED, never reconstructed:** `useProgressStore.masteryHistory` +
  `canDoAchievedAt` + `recordCompetence`, written from Analytics on view and from
  `lib/competence.ts` at session end. FSRS keeps current card state only, so this history cannot be
  backfilled; dating cards by `lastReview` was rejected (a word mastered in May but reviewed
  yesterday would fake a hockey stick). Pre-existing milestones carry `SEEDED_MILESTONE` so they
  never plot as "reached today". Both fields are local-only, same caveat as `missionsDone`/`keyItems`.
  **`lib/competence.ts` imports content banks: never import it from eager code.**
- **`getWritingHistory` returns `null` on failure** (was `[]`), so the Verlauf error card is
  reachable and an empty history is never faked. `Analytics` treats null as "no data" and keeps its
  vocabulary fallback.
- **Verified in the real app, not the mockup:** seeded a demo state and screenshotted `/analytics`
  and `/writing?mode=verlauf` in light AND dark plus the expanded row, which is what surfaced the
  trend-arrow bug above and a two-line label pushing its arrow out of place.
- **Merge note:** `main` advanced 47 commits (sessions 161-170) while this branch was open. Merged
  in; `lib/writing.ts` auto-merged (our null return + s167's `task_id` select), `WritingHistory.tsx`
  resolved by hand (our variant-C structure + main's Aufgabe tile), docs re-applied against main's
  newer text. s167 had already shipped the "store the Aufgabe" follow-up, so only the CORRECTION and
  Fokus history remain open.
- **Gates:** typecheck · lint 0 errors · test:unit · build · check:bundle **117.3 kB** · lint:content.
- **Then, same session: the correction itself now ships** (founder asked why the backend follow-up
  needed them at all, given `supabase.yml`). Verified from the run history: the workflow DOES deploy
  every Edge Function on merge (last run's "Deploy Edge Functions" = success), and only "Apply
  migrations" is gated, skipped when `SUPABASE_DB_PASSWORD` is absent. So:
  - **Migration 0012** adds `writing_evaluations.corrected_text` (idempotent, so a hand-paste and a
    later CI `db push` cannot collide).
  - **`evaluate-writing`** now asks for `corrected` too: a MINIMAL repair of the learner's own text,
    never a rewrite. `max_tokens` 400 -> 2000 for Anthropic (the corrected text is ~750 tokens on a
    MAX_TEXT_LEN submission); a CEILING, not a spend, and every existing fuse is untouched.
    `PROMPT_REV` -> `s171.0` so cached verdicts without a correction are not served.
  - **Nothing regresses if the migration lags the code**, which is the normal order here: `parseInsight`
    salvages weakness + insight from a truncated payload and drops the correction; `sanitizeCorrected`
    rejects a rewrite, a stump, an Aufgabe echo or an unchanged copy; the cache read and the client
    select fall back to the legacy column list; and the insert steps DOWN through the optional columns
    (full -> without corrected_text -> base) so a row always lands, which matters because the daily
    limit counts rows.
  - **Verlauf renders it** with the Fokus language (Original/Korrigiert toggle, coral on the original,
    green on the corrected, Himmelblau category tiles, capped at 6 with "+N weitere"). Marks are
    computed client-side by `wordDiff`, so no AI cost per view. Two fixes found by screenshotting the
    real page: the diff now runs PER PARAGRAPH (one whole-text diff collapsed a letter into a block)
    and `classifyChange` gained **Zeichensetzung** (a bare comma fix read as "Groß-/Kleinschreibung").
- **Next (both done since):** (1) Fokus history, shipped later the same session; (2) the correction
  right after submitting, shipped in s172 above. Still optional: "In die Wiederholung" (turn a
  correction into an FSRS card).
- **What actually happened on merge:** the Supabase workflow run for #734 shows "Deploy Edge
  Functions: success" and "Apply migrations: **skipped**" — `SUPABASE_DB_PASSWORD` is still unset, so
  the founder applied **0012 by hand** in the Dashboard SQL editor. Like 0011 it is therefore absent
  from `supabase_migrations.schema_migrations`; both are idempotent, so a later CI `db push` is a
  no-op (recorded in `docs/plans/PHASE2_SETUP.md`). The founder will look at the DB-password secret
  later; until it exists every migration needs one paste. Note Supabase never re-displays the
  database password after project creation, so obtaining a usable value means resetting it — safe
  here, since the password appears nowhere in this project except that workflow (the app uses the
  anon and service-role keys).
- **Founder review round on the live mobile Verlauf** (screenshot): the Entwicklung card was showing
  the totals-only FALLBACK, because all four of their texts sit in one month (June) and July has none,
  so no trend was provable. Working as designed, but it read as "not the preview". Both fixes
  founder-picked: (1) the **monthly layout is now always the card's shape** (empty months print "–");
  only the arrows and the "% weniger" badge still wait for two qualifying months, with one muted line
  explaining their absence. (2) The row is **one line at every width**: below `sm` the date shortens
  and the Thema badge drops (a long Thema was pushing the weakness chip onto a second line), and the
  Thema reappears at the top of the expanded area, since an older entry has no stored Aufgabe to name
  the topic. Bar area is `h-12 sm:h-16` on `grid-cols-2 sm:grid-cols-3`.
- **Fokus history (founder-approved follow-up, same session):** Verlauf is now ONE chronological list
  across both trainers. It needed **no migration**: `sentence_checks` (0009) has stored every check's
  correction and detected grammar since s147, with owner-read/delete RLS, so the founder's existing
  sentences appeared immediately. A Fokus row carries a correction-COUNT chip (or a green
  "fehlerfrei"), expands into the same `CorrectionView` plus one "Erkannt: …" line, and the filter now
  offers only the kinds on record (`Alle` + Fokus/Kurz/Lang). The trend card stays Kurz/Lang-only, since
  Fokus's diff categories are a different taxonomy from the evaluator's `WeaknessCategory`. A partial
  load failure is reported with a retry rather than shown as a shorter history.
- **`wordDiff` now collapses a swapped run into ONE "Wortstellung" fix.** "weil ich war krank." ->
  "weil ich krank war." used to surface as "war → krank" + "krank. → war.", both labelled
  Rechtschreibung, which taught the wrong rule. This fixes Fokus's own correction card too
  (`tests/wordDiff.test.ts` pins it).
- **Screenshot lesson worth keeping:** headless Chromium clamps its viewport to a 500px MINIMUM, so
  `--window-size=390` silently lays out at 500 and crops, which looks exactly like horizontal
  overflow. Verify true phone widths by loading the app in an IFRAME of that width inside a wider
  window (`public/__frame.html` pattern, deleted after use).
- **Not verifiable from the sandbox:** the network policy blocks `*.supabase.co` (403 on CONNECT), so
  whether the column is live has to be confirmed in the app: write a Kurz text, open it in Verlauf,
  and the Original/Korrigiert toggle should appear.

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
