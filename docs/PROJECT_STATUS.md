# Project Status

_Last updated: 2026-07-26 (session 171). **Verlauf + Fortschritt redesign (founder-picked C and 3):**
Schreiben's Verlauf leads with a weakness-trend card over a compact row list (Aufgabe -> Dein Text ->
Tipp inside the row disclosure); Fortschritt leads with a Kompetenz curve (mastered words / Can-Dos
over time) and pairs a Prüfung countdown with a writing-aware Diagnose, XP demoted to Details.
Competence is now SAMPLED daily (`masteryHistory`), since FSRS history cannot be backfilled. Also: the
desktop Sidebar's active row is a lighter grey. Prior s170 (PR #730): the Praktisch toggle joined the
squircle language, Bibliothek reverted to the book stack and Fortschritt became the Pokal.
`docs/plans/SCHREIBEN-OVERHAUL.md` carries the writing-content roadmap.
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
- **Next:** the two remaining follow-ups both need a `writing_evaluations` migration: (1) persist the
  corrected text so Verlauf can show the real correction in the Fokus mark language, (2) give Fokus a
  history (which also unlocks the Fokus filter segment). Optional: "In die Wiederholung" (turn a
  correction into an FSRS card).

**Handoff after session 170 (2026-07-26): Praktisch toggle joins the squircle language;
Bibliothek + Fortschritt icon swaps. MERGED AND LIVE** (PR **#730**). Founder: adapt the
reduced-rounding toggle design from Bibliothek/Schreiben to Praktisch, restore the previous
Bibliothek icon, and give Fortschritt the leaderboard-cup icon from an earlier preview batch. All
three were direct, unambiguous ports of already-approved designs (no new preview round needed).
- **Trainieren/Spielen toggle** (`Dashboard.tsx`) now shares `LibrarySwitcher`/
  `WritingModeSwitcher`'s exact language: `rounded-lg` track, `rounded-md` sliding pill measured by
  `useSlidingPill`, instead of the older `rounded-full` track with two independently-flagged
  buttons. Kept content-sized (`w-fit`, centered) since it's a two-segment toggle, not a full-width
  one; the section-tinted active icon/label (blue Dumbbell / orange Play) is untouched.
- **Bibliothek's route icon reverts to the "stack of three books"** shipped before session 158,
  restored verbatim (mark + `NORM` box) from git history (`997e8a0`), replacing the "closed book +
  bookmark ribbon" mark that had been in place since.
- **Fortschritt's route icon becomes the "Pokal" (trophy/cup)**, option T from the session-158
  icon-preview batch (`preview/fortschritt-icon-vorschlaege.html`) that lost to the Ring at the
  time. Ported verbatim (`#0ea5e9`, own `NORM` box) in place of the progress ring.
- **Verified in headless Chromium** at 390×844 (bottom tab bar, both icons active/inactive, the
  toggle sliding between Trainieren/Spielen) and 1280×900 (desktop Sidebar + toggle).
- **Files:** `src/features/dashboard/Dashboard.tsx` · `src/components/layout/route-icons.tsx` ·
  `docs/areas/PRAKTISCH-NAV.md` · `.claude/skills/design/SKILL.md` · `docs/DECISIONS.md`.
  **Gates:** typecheck · lint (0 errors, pre-existing warnings only) · test:unit **317/317** ·
  build · check:bundle (118.1 kB).

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
