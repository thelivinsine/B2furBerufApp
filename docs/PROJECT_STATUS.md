# Project Status

_Last updated: 2026-07-14 (session 120). **Content-library coverage review + deepening (Opus 4.8), on
branch `claude/content-library-coverage-lih2fp`.** Reviewed vocab/collocation coverage across every
theme, sub-theme and Branche and found the imbalance was the everyday consumer/service world (the
plateau-learner audience), not the industrial sectors. Deepened the thinnest slices with genuinely
common, high-frequency words: **+133 vocab and +56 collocations** across the thin service Branchen
(hospitality/retail/beauty/cleaning/security/sports) and the thin daily-life themes
(bank/behoerde/bildung/wohnen + arzt.versicherung), filling starved sub-themes like
`behoerde.aufenthalt`/`bescheid` and every `bank`/`bildung` sub-theme. Provenance rows added, frequency
map regenerated, fact gate passes (0 two-oracle errors). Product name: **Genauly** (`genauly.de`)._

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
exam sets **15** · dialogues **20**. All six top-level domains are populated. **Branche is a scope
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

**Handoff after session 119 (2026-07-14). Account-dropdown z-index bug fix (Opus 4.8), on branch
`claude/account-settings-dropdown-icons-b8feg6`, shipped to `main` (PR #529, squash-merged).** A
one-line founder bug fix.
- **Symptom (founder screenshot):** on a Bibliothek browse page (e.g. Kollokationen), opening the
  account menu showed the page's toolbar (the `ViewSwitcher` icons + the search magnifier) painting on
  top of the dropdown's **DESIGN** theme-toggle row. The dropdown background is opaque, so it was not a
  transparency issue.
- **Root cause:** the app header (`AppShell.tsx`, `sticky top-0 z-20`, a stacking context via its
  `backdrop-blur`) and the sticky Bibliothek browse toolbar (`browseHeaderClass` in
  `src/features/shared/browseScroll.tsx`, `sticky ... z-20`) were **both `z-20`**. Equal z-index →
  paint order decides, and the toolbar comes later in DOM order, so it painted over the account
  dropdown wherever the dropdown overflows below the header. The dropdown's own `z-50` only applies
  inside the header's stacking context, so it could not beat the sibling toolbar.
- **Fix:** header `z-20` → `z-30` (`src/components/layout/AppShell.tsx`). Layer order stays correct:
  header/dropdown now above the browse toolbar (`z-20`) but still below FeedbackPill (`z-40`), Toaster
  (`z-50`), and the mobile bottom nav (`z-[55]`/`z-[60]`); the desktop sidebar (also `z-30`) never
  overlaps the header spatially (header lives inside `lg:pl-64`). Bonus: makes the intended "toolbar
  slides under the header on scroll" behavior a real z-order instead of a DOM-order coincidence.
- **Gates:** `pnpm build` green (only gate relevant to a className change; no content/engine/type
  impact). Live verification (Actions tab + `*.github.io`) is the founder's, per the usual note.

_(Session 118's Kollokationen-nodal-graph handoff, session 117's Üben-navigation + Üben-button-copy handoff, session 116's branding-redesign-support
handoff (Cobalt & Butter previews + the AI mockup guide) and session 115's demo-readiness-sweep handoff
are now in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
