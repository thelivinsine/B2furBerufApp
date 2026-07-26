# Project Status

_Last updated: 2026-07-26 (session 160). **Verlauf + Fortschritt redesign (founder-picked C and 3):**
Schreiben's Verlauf now leads with a weakness-trend card over a compact row list; Fortschritt leads with
a Kompetenz curve (mastered words / Can-Dos over time) and pairs a Prüfung countdown with a
writing-aware Diagnose. Competence is now SAMPLED daily (`masteryHistory`), since FSRS history cannot be
backfilled. Prior s158: nav-icon family harmonization + Fortschritt pinned left of Einstellungen.
Product name: **Genauly** (`genauly.de`)._

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
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 160 (2026-07-26). Verlauf + Fortschritt redesign (founder picks C and 3),
branch `claude/selection-color-contrast-3upqkz`.** Started with a one-line fix (the sidebar active-row
grey was too dark: `bg-border` -> `bg-muted`, PR #685), then a four-agent analysis of Schreiben's
Verlauf and the Fortschritt page (purpose, current state, docs/founder record, learner value), then
preview-first design (`preview/verlauf-fortschritt-redesign.html`, artifact c3df428e, 3 variants per
surface). Founder picked **C "Entwicklung zuerst"** for Verlauf and **3 "Kompetenzkurve"** for
Fortschritt; both implemented in this session.
- **Verlauf (`WritingHistory.tsx`, rewritten):** a "Deine Entwicklung" card leads (top-3 weakness
  categories as 3-month mini bar groups, trend arrows, "X % weniger" success badge, "Jetzt üben"
  footer), then a COMPACT row list whose disclosure holds the tip, the learner's text, delete and the
  practice CTA. Kurz/Lang `ModeSwitcher` only when both kinds exist. **Honesty guards:** a month
  needs >=2 texts to count as a comparison point (`MIN_TEXTS_PER_MONTH`), a month with no texts
  prints "-" not 0, and under two comparable months the card falls back to totals + "Der Trend
  erscheint ab dem zweiten Monat."
- **Fortschritt (`Analytics.tsx`):** new **Kompetenz** curve directly under the unchanged Überblick
  (mastered words / Can-Dos over time, green dots on days a Can-Do was reached, "Zuletzt erreicht"
  line, direction-only footer "+16 Wörter diese Woche"); XP chart stays in Details. **Dranbleiben**
  is now Prüfung (days-remaining ring over a 90-day run-up + last simulation + `/exam` CTA, only
  while `examDate` is ahead) + a **writing-aware Diagnose** (most-flagged weakness from the last 60
  evaluations, falling back to the weakest band/theme) + Nächste Quest (spans both columns when the
  Prüfung card shows). The duplicated writing-weakness panel was DELETED from Details (it disagreed
  with the Verlauf panel: 60 vs 30 entries).
- **New competence sampling:** `useProgressStore.masteryHistory` + `canDoAchievedAt` +
  `recordCompetence`, sampled from Analytics on view and from `lib/competence.ts` at session end
  (SessionPlayer `finish`). FSRS keeps current state only, so this history CANNOT be backfilled;
  pre-existing achievements are stamped `SEEDED_MILESTONE` so they never plot as "reached today".
  Both fields are local-only (the `progress` row has a fixed column set), same caveat as
  `missionsDone`/`keyItems`. `lib/competence.ts` imports banks: never import it from eager code.
- **`getWritingHistory` now returns `null` on failure** (was `[]`), so the Verlauf error card with
  "Erneut versuchen" is finally reachable and an empty history is never faked.
- **Verified in the real app**, not just the mockup: seeded a demo state and screenshotted
  `/analytics` + `/writing?mode=verlauf` in light AND dark, incl. the expanded row. Two defects found
  and fixed that way (the trend arrow was comparing against a 1-text month, so an improving category
  read as worsening; a two-line weakness label pushed its arrow out of place).
- **Gates:** typecheck · lint 0 errors (72 warnings = baseline) · test:unit **289/289** · build ·
  check:bundle **117.3 kB** (banks stayed out of the eager chunk).
- **Next:** the two high-value follow-ups both need a `writing_evaluations` migration and are NOT
  done: (1) store the corrected text + the Aufgabe so Verlauf can show the actual correction in the
  Fokus mark language, (2) give Fokus a history (the Fokus filter segment is deliberately absent
  until then). Optional: "In die Wiederholung" (turn a correction into an FSRS card).

**Handoff after session 159 (2026-07-24). Fokus "Satzlabor" Wave 2 (Konjunktiv II + Zustandspassiv),
branch `claude/grammar-dimensions-transformations-l3ib3m`, PR #678 merged.** Started as a
grammar-dimensions brainstorm (four research agents) -> `docs/plans/GRAMMAR_DIMENSIONS_BRAINSTORM.md`
(dimension catalog, feasibility tiers, B2-marker ranking, guardrails, Now/Next/Later/Skip roadmap) +
two previews (`preview/grammar-dimensions-satzlabor.html`, `-catalog.html`) + a combined claude.ai
artifact (daa4dbb6). Then built the "easy half":
- **Konjunktiv II** as a new **Modus** rail axis: `mood` promoted from the pinned `DEFAULT_MOOD` to a
  real, combinable axis across `grammarDimensions.ts` / `useFokusMachine.ts` / `GrammarRail.tsx` /
  `FokusTrainer.tsx` (rail is data-driven, so the Modus section renders itself).
- **Zustandspassiv** as a third Genus-Verbi pill (data-only value add): a detected `passiv_zustand`
  now maps to its own pill instead of null; also fixed a phantom "Aktiv looks selected" quirk on a
  real Zustandspassiv sentence. The copula safeguard (misread "Ich bin krank" -> aktiv) stays in the
  check-sentence prompt.
- **Edge function:** `transform-sentence` prompt gained K-II (synthetic-vs-wuerde) + Vorgang-vs-Zustand
  rules + examples; `PROMPT_VERSION` 2 -> 4. **Founder must redeploy `transform-sentence`** for the
  better output; the pills already work against the live function (its enums already accept
  konjunktiv2 / passiv_zustand as targets).
- **Copy:** rail legend simplified to "Gruener Punkt = dein Satz." / "Tippe eine andere Form, um ihn
  umzuwandeln."
- **Held (operation-style, need a NEW edge-function contract, not the tuple):** Register (Sie<->du),
  Satzbau (HS<->NS), Nominalstil, Relativ<->Partizip. Plusquamperfekt deferred (needs a temporal
  anchor). Roadmap: brainstorm-doc section 6.1.
- **Merge note:** `main` force-advanced 10 commits (CLAUDE.md restructure #671, prompt-log rotation,
  sessions 155-158) while this branch was open; merged it in - code auto-merged (mood/copy edits +
  main's cosmetic tweaks both intact), the 4 doc conflicts resolved to main's new structure and the
  docs re-applied against it (this handoff, `docs/areas/SCHREIBEN.md` Wave-2 axes, prompt-log s159).
- **Gates:** typecheck / test:unit **289/289** / lint 0 errors / build / check:bundle **112 kB** /
  lint:content. Edge function is Deno (not deployed from the sandbox).

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
