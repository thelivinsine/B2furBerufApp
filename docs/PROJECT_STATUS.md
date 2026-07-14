# Project Status

_Last updated: 2026-07-14 (session 121). **Merged the `arbeitswelt` domain into `beruf` (Opus 4.8), on
branch `claude/berufsleben-arbeitsumfeld-overlap-itmpeg`, shipped to `main` (PR #535).** The founder
noticed the `beruf` ("Berufsleben") and `arbeitswelt` ("Arbeitswelt & Umfeld") domains read as
redundant near-synonyms and their graph node colors (indigo vs adjacent violet) were nearly
indistinguishable. Collapsed the two work domains into a single `beruf`: the 10 workplace themes now all
carry `domain: "beruf"`, so the taxonomy is **5 domains** (was 6). Six code sites + CLAUDE.md; the
library primary dropdown re-groups with no code change (`themeGroupsForMode` is data-driven). All gates
green. Product name: **Genauly** (`genauly.de`)._

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
- **`../CLAUDE.md`** — developer/agent operating instructions, content conventions, and locked designs.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Heute · Bibliothek · Anwenden · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1 complete),
Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `../CLAUDE.md`.

**Content banks (as of 2026-07-14, session 120 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,246** · collocations **797** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,452 rows** · themes **15** ·
exam sets **15** · dialogues **20**. Taxonomy is **5 top-level domains** (the `beruf`/`arbeitswelt`
work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: ~98% of provenance rows are AI-drafted, not yet human-verified (see
`strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
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

**Handoff after session 121 (2026-07-14). Merged the `arbeitswelt` domain into `beruf` (Opus 4.8), on
branch `claude/berufsleben-arbeitsumfeld-overlap-itmpeg`, shipped to `main` (PR #535, squash-merged).**
The founder asked, looking at a Bibliothek graph, what the difference between the "Berufsleben" and
"Arbeitswelt" categories was, since they had near-identical colors and read as redundant to a learner,
then said "merge".
- **The two domains:** `beruf` ("Berufsleben") grouped the 6 communication-heavy workplace themes
  (meetings, scheduling, logistics, customer, conflict, project); `arbeitswelt` ("Arbeitswelt & Umfeld")
  grouped 4 topical ones (technology, sustainability, safety, travel). Both were `context: "work"`. The
  split was a taxonomist's cut (comms vs. topics), invisible to learners, and their graph colors
  (`#5b5be6` indigo vs `#8b5cf6` violet, ~30° apart) read as one color on the dense force-directed canvas.
- **The merge (6 code sites + CLAUDE.md):** dropped the `arbeitswelt` entry from `src/data/domains.ts`;
  retagged technology/sustainability/safety/travel to `domain: "beruf"` in `src/data/themes.ts` (all 10
  workplace themes now in `beruf`); removed the `arbeitswelt` color from `src/lib/graphPalette.ts`;
  removed `"arbeitswelt"` from the `DomainId` union (`src/types/index.ts`) and from `DOMAIN_IDS`
  (`scripts/lint-content.mjs`); set the Büro building rollup to `domains: ["beruf"]`
  (`src/components/city/domain-buildings.tsx`). `themeGroupsForMode` (`lib/themeGroups.ts`) is
  data-driven, so the library primary dropdown now shows one "Berufsleben" group covering all 10
  workplace themes with no code change.
- **Gates:** `lint:content` OK, `typecheck` OK, `build` OK, `test:unit` 142/142. Content counts
  unchanged (this was a taxonomy edit, not a content edit).
- **Note for next session:** the domain count is now 5, but `pruefung` still has no themes mapped to it
  (exam prep lives separately), so 4 domains actually carry the 15 themes. Pre-existing, unrelated to
  this merge.

**Handoff after session 120 (2026-07-14). Content-library coverage review + deepening (Opus 4.8), on
branch `claude/content-library-coverage-lih2fp`. Shipped to `main`.** The founder asked for a thorough
review of the content library to find themes/sub-themes/Branchen with too few words or collocations,
then to add genuinely useful, commonly-used items for those fields.
- **What the review found (quantified via a throwaway coverage script):** the industrial Branchen
  (production 80 / engineering 71 / construction 65 / it 55 / chemicals 49 vocab) are well-covered from
  the s94/s95/s102 packs; the imbalance was the **service/consumer world** where most B1-B2 immigrant
  learners actually work — sports 17, beauty 19, hospitality 19, retail 21 vocab. Thin daily-life
  themes: bank 29 (lowest), behoerde 33, bildung 34, wohnen 47. Starved sub-themes: `behoerde.bescheid`
  3, `behoerde.aufenthalt` 4, `arzt.versicherung` 4, all `bank`/`bildung` subs 6-8.
- **Wave 1 (service Branchen, +76 vocab / +48 colloc):** hospitality (Kellner, Vorspeise, Getränkekarte,
  abräumen, zapfen…), retail (Wechselgeld, Umtausch, Rückgaberecht, Warenkorb, Anprobe…), beauty (Frisur,
  Spülung, Tönung, Wimpernverlängerung, zupfen…), plus cleaning/security/sports top-ups (they were less
  thin, so fewer). Each rides `sectors:[…]` on the natural theme (mostly `customer`/`safety`/`arzt`).
- **Wave 2 (daily-life themes, +57 vocab / +8 colloc):** bank (Überweisen, Einzahlung, Buchung, Mahnung,
  Zahlungsverzug…), behoerde (Wohnsitz, an/abmelden, Niederlassungserlaubnis, Einbürgerung, Widerspruch,
  Rechtsmittel…), bildung (Wortschatz, Aussprache, mündlich/schriftlich, durchfallen, Praktikum,
  Bildungsgutschein…), wohnen (Betriebskosten, Nachzahlung, Zählerstand, Wasserschaden, Rohrbruch…),
  arzt.versicherung (Zuzahlung, Überweisungsschein, Attest, Zusatzversicherung…). Sub-theme-tagged so the
  starved slices fill.
- **Mechanics:** appended to `vocabularyPart2` / the collocations array; provenance rows added (DWDS
  refs, `review_status:"draft"` for the next founder review pass); `content_type` is `"vocabulary"` (not
  `"vocab"` — TS enum, caught at build). Regenerated `frequency.ts` after `pip install wordfreq` +
  `build:frequency-subset` (unbinned dropped 342 to 86). Refreshed the morphology oracle subsets.
- **Gates:** `lint:content` OK, `typecheck` OK, `build` OK, `test:unit` 142/142, `check:bundle` 79.6 kB,
  `verify:facts` OK (0 two-oracle-confirmed errors; the one new signal, `die Betriebskosten`, is a correct
  plurale tantum). Everything AI-drafted, founder-verify pending like the rest of the bank.

_(Session 119's account-dropdown z-index-fix handoff, session 118's Kollokationen-nodal-graph handoff,
session 117's Üben-navigation + Üben-button-copy handoff, session 116's branding-redesign-support
handoff (Cobalt & Butter previews + the AI mockup guide) and session 115's demo-readiness-sweep handoff
are now in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
