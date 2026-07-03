# Project Status — Archived Session Logs

_Split out of `docs/PROJECT_STATUS.md` on 2026-07-03 to keep the live status file navigable._
_These are the detailed logs for **sessions 4–40** and **session 24**. For current status, the
backlog, model guidance, and the “Resume here” handoff, see `docs/PROJECT_STATUS.md`. The
authoritative full authorship record remains git history + `docs/SESSION_PROMPT_LOG.md`._

---

## Sessions 40 → 4 (detailed logs)

### Session 40 (2026-06-26) — Triple collocations bank + hide example translations + Select dropdown overlay
- **Collocations bank tripled** from 132 to **396** Nomen-Verb pairs (264 new entries, +24 per theme
  across all 11 themes). High-frequency, exam-relevant B1-B2 pairs sourced from standard telc/Goethe
  word fields. `behoerde` theme leans on formal Amt/Antrag/Behörde register. PR #226.
- **English example translations hidden** on the dedicated `/collocations` cards. The phrase-level
  English gloss (`c.en`) remains visible; only the example sentence English (`c.example.en`) is hidden
  in the UI. Data and linter unchanged (field still required and populated).
- **Kollokationen tab hidden** inside Wortschatz (`/vocabulary`). Collocations are now only reachable
  via the dedicated `/collocations` menu item. Implemented as commented-out code (reversible).
- **264 provenance rows** added to `src/data/provenance.ts` (total: 1073). Each new collocation has a
  matching DWDS-referenced provenance entry.
- **Select dropdown scrim overlay** (PRs #227–#229): founder reported poor contrast between the
  dropdown menu and the page content behind it. Added a `bg-dialog-overlay` scrim (the same
  brand-tinted radial spotlight used by the login dialog, per the locked overlay convention) behind
  the Select dropdown via `createPortal`. The dropdown card uses `shadow-elevated-soft` + `rounded-xl`
  matching the dialog card styling. Open state is tracked via React context (`SelectOpenCtx`) so the
  scrim only renders while the dropdown is actually open and is removed when it closes.
- `pnpm lint:content` and `pnpm build` both pass clean.

### Session 39 (2026-06-25) — Mobile card grids overflowing off the right edge (SHIPPED ✅)
Founder reported (mobile screenshots) that the Kollokationen tiles were cut off on the **right**, with
the `formell` badge clipped to "for". This is a different bug from the s38 "cut off by the bottom bar"
check (that one was vertical and was a non-bug); this is real **horizontal overflow**.
- **Root cause:** the card grids declared responsive `sm:`/`md:`/`lg:grid-cols-N` but **no base
  `grid-cols-1`**. Below the smallest breakpoint, CSS grid falls back to an implicit `auto`
  (max-content) single column, which stretches to the widest card's longest unwrapped line and pushes
  the cards past the right edge of the viewport. The Kollokationen example sentence (italic German in a
  flex row) made the max-content wide enough to trigger it first.
- **Fix:** added an explicit `grid-cols-1` base to every affected grid so the mobile column is
  constrained to `1fr` (container width) and content wraps. Swept the whole app:
  `CollocationsBrowser`, `ExamHub` (×2), `VocabList`, `GrammarDrillCard`, `GrammarHub` (×2),
  `LandingPage`, `QuizHub` (×2), `RedemittelTrainer`, `Settings`, `Dashboard` (hero + cards),
  `SimulationHub`, `WritingHub`, `Analytics`. Grids that already had a base count (`CollocationsList`,
  `Flashcards`) were left as-is.
- `pnpm build` green. Shipped via **PR #219** (squash-merged to `main`). Branch:
  `claude/bug-attached-picture-fxgv5j`.
- **Also this session:**
  - **Quote-mark finding (no fix requested):** the founder first asked what the bug in a screenshot
    was. Diagnosed the collocation example sentences using **mismatched German quotes**, opening with
    `„` (U+201E) but closing with a straight ASCII `"` instead of `"` (U+201C), at
    `CollocationsBrowser.tsx:58`. Left as-is (founder only asked to identify it); the same `„…"`
    pattern likely recurs in other card components if a future sweep is wanted.
  - **Removed the prompt-logging hook (PR #221):** deleted `.claude/hooks/log-prompt.sh`, set
    `.claude/settings.json` to `{}`, and updated the stale references in `CLAUDE.md` and
    `docs/SESSION_PROMPT_LOG.md`. The existing `docs/prompt-log-raw.jsonl` is **kept** as a historical
    record (no longer appended to); the founder confirmed there's no reason to delete it.
  - **Explicit Save button on the `/sources` admin overlay (PR #223):** the founder-only source-review
    controls (s37) auto-saved silently (verified on toggle, note on blur) with only a small global
    indicator, so it felt like there was "no option to save". Added a per-row **Save** button that
    commits the `verified` flag and the note **together**, disabled until there are unsaved changes,
    showing `Speichern` → `Speichern…` → `Gespeichert ✓` and a red `Nicht gespeichert` on failure
    (Enter in the note also saves). The local cache now updates **only on a successful write**, so a
    failed save no longer looks saved. Bilingual DE/EN. `src/features/legal/Sources.tsx` +
    `src/lib/provenanceReviews.ts` flow (the parent `onChange` now returns `Promise<boolean>`).
    **Founder then ran Supabase migration 0004 and confirmed saving works** (it had shown "Nicht
    gespeichert" beforehand precisely because the `provenance_reviews` table did not exist yet).
  - **Added backlog #24 (PR #224):** "Deep-dive source review + source strategy" — review every external
    source, confirm licences/commercial-use terms, fix problem sources (the founder flagged a **dwds.de**
    item that requires login), reconcile claims against the SPDX allowlist, and define a ranked source
    strategy per content type. Cross-linked to #7 (audit infra) and #22 (data strategy). The actual
    dwds.de source swap was intentionally **deferred** under this item at the founder's request.
- **Preferences recorded this session:**
  - The prompt log (`docs/SESSION_PROMPT_LOG.md`) is now updated **manually, only when the founder
    asks** — never automatically. The `UserPromptSubmit` auto-logging hook was removed accordingly.

### Session 38 (2026-06-25) — Sign-up button stuck disabled on autofill + collocations tile-cutoff check (SHIPPED ✅)
Founder reported two things from mobile screenshots:
1. **Account-creation button never activated** even with email + password filled, captcha solved
   ("Success!"), and the consent box checked. Root cause: **iOS Safari / password-manager autofill
   does not fire React's `onChange`**, so the controlled `email`/`password` state stayed empty and
   `canSubmit` never became true (the rendered Turnstile widget proved the captcha was already
   solved, and consent was visibly checked, so the email/password state was the only remaining gate).
   Fix: a WebKit autofill hook. A no-op `@keyframes onAutoFillStart` is attached to
   `input:-webkit-autofill` in `index.css`; `AuthDialog` listens via `onAnimationStart` on the email
   and password inputs and copies the autofilled `ref.value` into state, so the button enables. Plain
   typing is unaffected. `pnpm build` green.
2. **Collocations tiles "cut off"** by the bottom tab bar. Investigated: no clipping bug. The shared
   `<main>` already carries `.pb-nav` (`63px bar + safe-area + 24px`), so the last row clears the bar
   by 24px. The screenshot showed the first two collocations with no filter (132 results), i.e. the
   top of the list mid-scroll, where the translucent fixed bar naturally overlaps a passing tile. No
   code change; flagged for founder confirmation at the true bottom of the list.

### Session 37 (2026-06-24) — Founder-only source-verification overlay on /sources (SHIPPED ✅)
Founder asked for a way to mark data sources as verified and add comments, restricted to one user.
Confirmed via AskUserQuestion: **Supabase persistence** (cross-device) and **everything private**
(admin-only, comments never public). Built:
- **Migration `0004_provenance_reviews.sql`** — new `provenance_reviews` table (`content_id` PK,
  `verified`, `comment`, `reviewed_by`, `updated_at`) with an RLS policy `provenance_reviews_founder_all`
  that only allows a session whose JWT email is the founder's to read/write. Server-side lock.
- **`src/lib/admin.ts`** — `FOUNDER_EMAIL` + `isFounder(user)` client gate (mirrors the RLS email).
- **`src/lib/provenanceReviews.ts`** — best-effort `fetchProvenanceReviews()` + `saveProvenanceReview()`.
- **`Sources.tsx`** — when the founder is signed in, a "Quellenprüfung" banner (live verified count +
  save status) renders at the top, and every item row in "Alle Inhalte und ihre Quellen" gets a
  "geprüft" checkbox + a "Notiz" field, saving automatically (optimistic, debounced via onBlur for
  notes). Group summaries show `verified/total ✓` in admin mode. Public page is unchanged for everyone
  else. Bilingual DE/EN.
- **Founder one-time step:** run migration 0004 in the Supabase SQL editor (documented in
  `docs/PHASE2_SETUP.md` → "Admin source review"). Until then saves silently no-op (offline-first).
`pnpm build` + `pnpm lint:content` green.

### Session 36 (2026-06-24) — Align dedicated Kollokationen cards to the Wortschatz tile design (SHIPPED ✅)
Founder asked to apply the Wortschatz → Kollokationen tile design to the standalone `/collocations`
(`CollocationsBrowser`) cards too. Confirmed via AskUserQuestion to **keep the extra content** the
browser carries (the example's English translation + its own audio button). Restyled `CollocationCard`
to match `CollocationsList`: truncating `font-semibold` phrase, muted (non-italic) English meaning, a
**`formell` badge** top-right (replacing the old indigo formal-card background tint), and a top-border
divider with the italic German example in „…" quotes. Kept the example EN line and the example audio
button (now always visible). Removed the hover-reveal speaker machinery (`hoverHalf` state +
`onMouseMove/onMouseLeave`) so the speakers are always visible like the Wortschatz tiles. `pnpm build`
green.

### Session 35 (2026-06-23) — Wortschatz tab overflow fix (SHIPPED ✅)
The Wortschatz (`VocabularyTrainer`) tab row has 4 tabs (Karteikarten, Quiz, Übersicht, Kollokationen);
the shared `TabsList` uses `overflow-x-auto` + `no-scrollbar`, so on narrow screens the rightmost tab
(**Kollokationen**) was clipped off the right edge with no visible scroll affordance. Fixed by adding
`flex-wrap` to that `TabsList` instance so the tabs wrap to a second row instead of clipping (all four
always visible). Local override only; the shared Tabs primitive is unchanged. `pnpm build` green.

### Session 34 (2026-06-23) — check:refs green confirmed + two strategy backlog items added
- **check:refs run #3 is GREEN.** After the two correction passes (143 dead refs re-pointed), all 491
  status-checkable references resolve. The "links are live and traceable" half of provenance
  verification is machine-confirmed. (Run history: #1 183 flagged → mostly false alarms + 117 real;
  #2 26 stragglers; #3 clean.)
- **Two new backlog items added** at the founder's request: **#22 comprehensive end-to-end data
  strategy** (a single `DATA_STRATEGY.md` umbrella over content + user + AI + analytics data,
  unifying `DATA_GOVERNANCE.md`/`EXPANSION_PLAN.md`/`PHASE2_SETUP.md`) and **#23 detailed
  visualization plan for all learning components** (`VISUALIZATION_PLAN.md`: per-component visual
  specs + progress/data-viz with `recharts`, consistent with the locked design system; ties into the
  Dashboard #1, mnemonics #4, simulations #3, Schreibtraining #6 backlog items). Both mapped in the
  model-guidance table. Neither scoped/started yet.
- Docs only this session (no code). `DATA_GOVERNANCE.md` already reflected the checker; PROJECT_STATUS
  session 33 updated with the run #3 green result.

### Session 33 (2026-06-23) — First check:refs run + reference corrections (audit-ready stream cont.) (SHIPPED ✅)
Founder ran the `check:refs` workflow; it reported 183 failures. Triaged from the Actions log: the
checker was too harsh, not 183 dead links. Causes: ~70 HTTP 429 (Wikimedia rate-limiting at
concurrency 5, valid pages), 33 HTTP 403 (Council of Europe blocks bots, page fine), and **117 genuine
404s** (B2-Beruf compound nouns with no Wiktionary entry, reflexive/particle verbs like "sich
abstimmen", headword bugs like gender pairs "X / die Y" and "(Pl.)"/"(PSA)", 2 collocation DWDS
prepositional-phrase lemmas, 1 wrong Wikipedia title). Two fixes:
- **Checker hardened** (`scripts/check-provenance-refs.mjs`): concurrency 5→2, `Retry-After` honoured,
  more retries; CEFR/coe.int treated as not-status-checkable; **429/403 now bucketed as "could not
  verify" and do NOT fail the run** (only true 404/dead links do). Removes the false-negative flood.
- **117 dead references re-pointed** (`scripts/fix-provenance-refs.mjs`): the verified-404 vocab/
  collocation ids → DWDS corpus search (`/r?q=`, resolves for any attested term, honest usage
  evidence); the Konnektoren grammar topic+drills → de.wikipedia "Konjunktion (Wortart)". Touches only
  the listed ids; review_status stays "draft".
Status-checkable set now 517 (was 629); 184 not-status-checkable (DWDS corpus + CEFR). `pnpm build` +
`pnpm lint:content` green.

**Second pass (same day):** run #2 came back with 26 genuine 404s (the stragglers that were masked as
429 in run #1, now caught because the gentler checker reported zero rate-limits). All vocab compounds/
verbs; re-pointed to DWDS corpus search via the same fix script. Total dead refs corrected across the
two passes: **143**. Status-checkable set now 491; 210 not-status-checkable.

**Run #3 (2026-06-23): GREEN ✅.** All 491 status-checkable references resolve; the "links are live and
traceable" half of verification is now machine-confirmed. The remaining open work in the audit-ready
stream is the human accuracy sign-off (draft → verified), Tatoeba example-sentence sourcing, and the
Article 6(3) profiling risk assessment.

### Session 32 (2026-06-23) — In-app "Sources & Licenses" page (audit-ready stream cont.) (SHIPPED ✅)
Founder asked where they (and the public) can see the data and its source links. Built the
auto-generated **"Sources & Licenses" page at `/sources`** (`src/features/legal/Sources.tsx`), the
Phase 2 attribution-surfacing item from `DATA_GOVERNANCE.md`. It renders entirely from the provenance
register (so it never drifts from the content): an "our approach" intro, the upstream references we
rely on (Wiktionary, DWDS, Wikipedia, CEFR) with licences + per-source counts, the licence breakdown of
our own content, and the **full itemised list of all 809 items with a link to each source**, grouped by
content type in collapsible sections (children render only when expanded, to stay light). Bilingual
DE/EN via the shared `LegalChrome`; linked from Settings and the landing footer. Already surfaces any
`attribution_required`/`attribution_text` rows, so Tatoeba CC-BY credit will appear automatically once
ingested. **Lazy-loaded** so the ~800-row register stays out of the main bundle (main chunk unchanged at
124 KB gzip; the register is a separate 24 KB-gzip chunk loaded only on `/sources`). `pnpm build` +
typecheck green. This is the human-readable answer to "where can I see the data and sources" the founder
wanted (the raw register also lives in `src/data/provenance.ts`).

### Session 31 (2026-06-23) — Reference URL checker (audit-ready stream cont.) (SHIPPED ✅)
Built the automated reference-URL validator the founder asked for, the highest-leverage first step of
the still-open verification work. `scripts/check-provenance-refs.mjs` (`pnpm check:refs`) fetches every
provenance `reference` and reports dead links, wrong Wiktionary headwords (404), missing Wikipedia
articles, and unknown DWDS entries. It dedups 809 rows → **701 unique URLs** (629 status-checkable;
72 DWDS corpus-search links flagged "not auto-checkable" rather than faked; 0 malformed) and exits
non-zero on any failure. Because this sandbox blocks outbound HTTPS (`host_not_allowed`), it ships with
a manual `workflow_dispatch` GitHub Action (`.github/workflows/check-refs.yml`) so the non-technical
founder can run it from the Actions tab where egress is open; also runnable locally via `pnpm check:refs`
(`--dry` parses without network). Verified the parse/dedup path here with `--dry`. **This attests to the
"link is live" half of verification only; content accuracy (correct sense, B2 quality) still needs human
sign-off.** Docs updated (DATA_GOVERNANCE.md automated-controls list).

### Session 30 (2026-06-20) — Data audit-ready stream: reference back-fill + EU AI Act Art. 50 (SHIPPED ✅)
Advanced the data-governance / audit-ready stream (backlog #7) on two fronts the founder approved together:
- **Provenance reference back-fill complete.** The bootstrap generator had only auto-filled references
  for vocabulary (Wiktionary) and collocations (DWDS), leaving ~162 authored rows (grammar, redemittel,
  dialogues, exam sets, writing prompts) with an empty `reference` (the linter back-fill queue). Added
  `scripts/backfill-provenance-refs.mjs`, which fills **only** empty references with a genuine,
  type-appropriate source: grammar topics/drills → the German Wikipedia article for the topic
  (grammar = facts), redemittel → DWDS corpus search for the phrase, dialogues/exam sets/writing
  prompts → the Council of Europe CEFR B2 descriptors. All **809 rows now carry a reference; the linter
  warning queue is empty.** References are machine-assigned starting points, not verified: every row
  stays `review_status: "draft"`. The four-eyes verification pass (draft → verified) is the next open
  governance step.
- **EU AI Act Article 50 transparency shipped** (ahead of the 2 Aug 2026 date). Confirmed the writing
  coach is the only generative-AI surface (speech = Web Speech API; simulations = scripted dialogue
  trees). It already marked output as "KI-generierte Rückmeldung" in the live result and history; added
  an explicit point-of-use disclosure on the writing editor ("Dein Text wird zur Auswertung an eine KI
  (Anthropic Claude) gesendet. Die Rückmeldung ist KI-generiert und kann Fehler enthalten.") linking to
  the privacy page.
- Verified: `pnpm lint:content` passes with **zero warnings** (was ~162), `pnpm build` + typecheck
  green. Docs updated (`DATA_GOVERNANCE.md` v0.4). **Still open in this stream:** human verification
  of the references, the Tatoeba example-sentence sourcing for vocab sentences, and the Article 6(3)
  profiling risk assessment.

### Session 28 (2026-06-17) — Selection "cloud" refinement: compact squircle + selected-only menu (SHIPPED ✅)
Founder feedback: the grey backdrop behind the active icon (the "cloud") was too big and the gradient
looked convex/protruding. Iterated via HTML mockups (raw.githack preview links, the same flow as the
icon previews) before touching live code:
- **Mockup 1 (`preview/nav-cloud-refined.html`):** current full-slot pill vs tighter options. Founder
  picked the **compact squircle**.
- **Mockup 2 (`preview/nav-cloud-gradients.html`):** six gradient studies of the squircle. Founder
  picked **G1 "flat & even"** (plain `from-muted to-border`, no highlight/shadow dome).
- **Implemented (PR #202, merge `69eee0c`):**
  - Bar active pill + Mehr pill → compact `h-11 w-11 rounded-2xl` squircle hugging the icon (was a
    slot-filling `rounded-xl` pill); underline moved to `bottom-[6px]` (`BottomTabBar`).
  - More sheet → compact `h-12 w-12` squircle tiles; the grey cloud now appears **only behind the
    selected section** in browse mode (every other tile is a bare icon on white). Edit mode keeps the
    squircle on all tiles as the draggable-tile affordance (`MoreSheet`).
  - Note: founder initially saw clouds on every browse tile after the deploy — that was the PWA
    service-worker serving the cached pre-#202 build; a full app close/reopen picked up the fix.
- Docs: CLAUDE.md gained the s28 rules (compact-squircle backdrop, flat & even gradient, More-sheet
  cloud only on the selected tile). `pnpm build` + `pnpm lint:content` green.

### Session 3 (2026-06-01) — auth polish + dark-mode readability (SHIPPED & LIVE)
- **Sign-up honesty fix (PR #19, merged):** sign-up no longer falsely reports success when email
  confirmation is pending. Paired with the founder disabling **"Confirm email"** in Supabase, so
  sign-up now logs in instantly and the SaveProgressBanner clears. Founder-verified.
- **Anonymous sign-ins confirmed ON and required** — guest flow, AI writing coach, and the
  progress-preserving guest→account upgrade all depend on it. Documented for the founder.
- **Dark-mode readability rework (PR #20, merged & live):** founder reported dark mode was
  effectively black and unreadable at night. Changes, all in `src/index.css` + `Sidebar.tsx`:
  - Background lifted from near-black (`240 16% 6%`) to a **deep navy/midnight blue** (`223 38% 11%`);
    `--surface`/`--elevated`/`--muted`/`--border`/`--input` stepped up in lightness on hue ~223 so
    cards separate from the background instead of merging into one black void.
  - `--muted-foreground` brightened (→ `220 20% 76%`) for legible secondary text.
  - Sidebar inactive nav labels: dim `text-muted-foreground` → near-white `text-foreground/80`.
  - Selected nav item: was low-contrast indigo-on-indigo (`text-primary` on `bg-primary/10`) →
    now bright semibold `text-foreground` on `bg-primary/20`. Light mode untouched.
- **Process lesson:** founder "saw no change" because the work was on the feature branch, not `main`.
  Going forward, **auto-ship**: open + squash-merge the PR once the build is green (see CLAUDE.md).
- **Flashcard rating colors (PR #22, merged & live):** the SRS rating buttons in
  `features/vocabulary/Flashcards.tsx` had the two middle options ("Schwer", "Gut") in grey, which
  read as disabled next to red "Nochmal" / green "Einfach". Added reusable **`warning` (amber)** and
  **`info` (teal)** variants to the shared `Button` (`components/ui/button.tsx`), using the existing
  `--warning` / `--accent` tokens (auto light/dark). Buttons now form a difficulty ramp:
  Nochmal=red → Schwer=amber → Gut=teal → Einfach=green. (QuickRevision's 2-button red/green scale
  was already fine.)

### Session 23 (2026-06-15) — Boot-splash flash fix + logo-redo backlog SHIPPED ✅
Branch `claude/app-refresh-text-flash-r6k69u`. Squash-merged to `main` (PRs #150–#151).

**Problem:** on every refresh the static `#root` fallback in `index.html` (the full plain-language
description, added in s22/PR #143 so Google's no-JS OAuth crawler can read the app's purpose) flashed
on screen before React mounted. It read like a glitch because it was a wall of marketing copy, not a
loading screen.

**Fix (CSP-safe, no inline JS):**
- First attempt (PR #150) added an inline `<script>` to set a `.js` class and hide the text via CSS.
  **It silently failed** because the page CSP is `script-src 'self'` with no `'unsafe-inline'` and no
  nonce/hash, so the inline script was blocked and the class never applied. Lesson for future work:
  **`index.html` cannot run inline scripts**; only external `/self` scripts (like `spa-redirect.js`)
  or `<style>`/`<noscript>` overlays (style-src allows `'unsafe-inline'`).
- Correct fix (PR #151): default the boot fallback to a minimal **branded splash** (`#boot-splash`:
  logo + tagline + spinner) for everyone, and use a `<noscript><style>` override to reveal the full
  description (`#boot-seo`) only when scripting is disabled. JS browsers now see an intentional-looking
  loading splash; no-JS crawlers / Google's OAuth reviewer still get the full description in the raw
  HTML. The spinner has a `prefers-reduced-motion` fallback. **Founder-verified: the flash is gone.**

**Also:** added **backlog #20** — redo the Genauly logo (founder noticed it looks too close to Canva).

### Session 23 cont. (2026-06-15) — Data governance v0.2/v0.3 + certification research SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. Docs only, squash-merged to `main` (PR #153 for v0.2; the
v0.3 + research bundle in a follow-up PR).

**1. Content strategy decision (v0.2): traceability over ownership.** Founder rejected leaning on "we
wrote it in-house, so we own it." New policy: every item traces to an authoritative reference or a
commercial-safe source. Much of today's library is AI-assisted drafting (legally safe, since AI text
has no rights holder, but a weak provenance answer), so AI drafting is now a *first step only* that
must be verified-and-cited or rewritten/discarded. Added the facts-vs-creative-text distinction (words/
genders/plurals are facts, not copyrightable: verify vs Wiktionary/DWDS rather than copying a protected
list), an approved open-source table (**Tatoeba CC-BY** for sentences), and a required `reference` field
on the register. Founder chose **re-verify + backfill existing content**, not a hard rebuild.

**2. Certification deep-research (#19) DONE → `docs/CERTIFICATION_RESEARCH.md` + governance v0.3.** Ran
the deep-research harness (5 cited passes). Conclusions: we are **most likely NOT high-risk** under the
EU AI Act (profiling + institutional-gating are the two flip risks); **Article 50 transparency** (tell
users they're interacting with AI / mark AI output) is a real obligation by **2 Aug 2026** → new
backlog **#21**; when certifying, sequence **ISO 27001 then ISO 42001** via TÜV NORD/SÜD (~$15K to
$60K/standard); SOC 2 is US-centric, defer. Still needs a lawyer's sign-off on the risk class (#15).

**Also:** documented that **Fable is temporarily unavailable** (US government restriction); use **Opus**
for Fable-recommended tasks until it returns (note in the Model-guidance section).

### Session 22 cont. (2026-06-14) — Data governance roadmap drafted 📋
Founder brainstormed making content ingestion **audit-ready** for eventual certification (TÜV
Rheinland / EY-style) and guaranteeing all content is under commercial-safe Creative Commons
licenses. Drivers: enterprise/gov edtech sales, legal/copyright safety, investor credibility, brand.

Key framing established: certification bodies certify the **process/management system**, not the data;
TÜV certifies against standards (**ISO/IEC 42001** for AI, ISO 27001), EY does **assurance** (SOC 2 /
ISAE 3000), and the concrete near-term legal driver is the **EU AI Act Article 10** (data governance +
provenance). The certificate is downstream of having the right system in place.

Shipped: **`docs/DATA_GOVERNANCE.md`** covering the provenance-register schema, a commercial-safe
license allowlist (SPDX, with the CC-BY-SA share-alike trap flagged), the four-eyes workflow, a planned
machine **license gate** (extend the new content linter so every content id must declare an allowlisted
license or the build fails), a risk register, a standards-mapping table, and a phased roadmap. **CTO
call: build Phases 1-3 now (cheap, mechanical, satisfies EU AI Act); defer paid certification (Phase 4)
until revenue or a customer demands it.** Backlog #7 cross-referenced to the doc; **new backlog #19**
added for a certification deep-research pass to validate the assumptions (cost, body, EU AI Act risk
class). No app code changed.

**Update (v0.2, 2026-06-15, founder decision): traceability over ownership.** The founder rejected
leaning on "we wrote it in-house, so we own it." New policy: every item must trace to an authoritative
reference or a commercial-safe source. Much of today's library is **AI-assisted drafting** (legally
safe to ship, since AI text has no rights holder, but a weak provenance answer), so AI drafting is now
a *first step only* that must be **verified against a free reference and cited** (or rewritten /
discarded). Added: a facts-vs-creative-text distinction (German words / genders / plurals are facts,
not copyrightable, so we verify them against Wiktionary / DWDS rather than copying a protected list);
an approved open-source table (**Tatoeba CC-BY** for example sentences, Wiktionary / DWDS as
references); a required `reference` field on the register; and a linter requirement that authored items
carry a reference. Existing content is **re-verified and provenance-tagged, not rebuilt from scratch**
(founder chose "re-verify + backfill" over a hard replace).

### Session 22 cont. (2026-06-14) — Content QC linter + CI gate SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. Backlog "Content QC pipeline" (mechanical half).

**New content linter `scripts/lint-content.mjs` (`pnpm lint:content`):** validates every `src/data/*`
bank. It loads the real `.ts` modules through Vite's `ssrLoadModule` (zero new dependencies, exact
project transform + `@/` alias) and checks:
- **Duplicate ids** within every dataset (vocab, collocations, grammar topics + drills globally,
  dialogues, exam sets, redemittel, practice areas, themes).
- **Dialogue node integrity:** `start` resolves, each node's `id` matches its Record key, every
  option `next` / node `next` points to a real node, option ids unique per node, no dead-end nodes
  (must have options, a `next`, or `end: true`), and no orphan/unreachable nodes (BFS from `start`).
- **Missing/empty required fields** per schema (e.g. vocab de/en/pron/examples, collocation
  full/en/example, grammar drill prompt/answer, exam rubric criteria).
- **Cross-references:** `themeId`, exam `scenarioId`, Redemittel categories, grammar groups,
  weakness categories, and `option.uses` all resolve to known values.
- **Em-dash sweep** (CLAUDE.md writing rule) recursively over all copy strings.
Errors fail the process; a small advisory warning channel exists but is currently empty.

**Wired as a CI gate (`.github/workflows/validate.yml`):** runs `pnpm lint:content` on every PR and
on pushes to `main`, actions SHA-pinned to match `pages.yml`. Blocks broken content from merging.

**Real bugs the linter caught and fixed (PR #148):**
- **8 duplicate vocabulary ids** (`v_nachhaltig`, `v_schutzausruestung`, `v_unterkunft`,
  `v_dienstreise`, `v_engpass`, `v_missverstaendnis`, `v_einigung`, `v_abnahme`) introduced by the
  session-16 bulk append. React silently rendered only the first of each, so 8 cards were dead data.
  Removed the redundant later copies (498 → **490** real entries).
- **4 plural-only nouns missing their article** (`v_stakeholder`, `v_zugriffsrechte`,
  `v_erneuerbare_energie`, `v_treibhausgasemissionen`); added `article: "die"`.
After fixes: linter green (0 errors, 0 warnings), `pnpm build` green. Documented in CLAUDE.md
(Commands + Content conventions). **The pedagogical/German-accuracy review half remains backlogged.**

### Session 22 (2026-06-14) — Google OAuth branding fix, tagline unification, icon/favicon overhaul SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. All items squash-merged to `main` (PRs #142–#146).

**PROJECT_STATUS.md updated for session 21 (PR #142):** standard end-of-session doc update covering
all session 21 work.

**Google OAuth branding: static pre-render fallback added to `index.html` (PR #143):**
Google's OAuth branding reviewer fetches raw HTML without executing JavaScript, so all React-rendered
content is invisible to it. The reviewer was seeing an empty `<div id="root"></div>`, triggering
"Your home page does not explain the purpose of your app." Fixed by embedding a full static pre-render
of the purpose text directly inside `#root` in `index.html`. `createRoot().render()` clears it on boot,
so real users never see it. The static fallback contains a plain-language description of what Genauly
is, who it is for, how Google sign-in data is used, links to About/Privacy/Terms, and the
"Die App wird geladen" loading notice. Also updated `<title>` to "Genauly: German for real life" and
`<meta name="description">` to match the B1-B2 real-life positioning.

**Tagline unified: "German for real life" across all surfaces (PR #145):**
The old tagline "German that clicks" was still present on several surfaces post-session-21. Updated all
remaining occurrences:
- `src/features/onboarding/Onboarding.tsx` (onboarding header)
- `src/features/landing/LandingPage.tsx` (footer)
- `package.json` (description)
- `vite.config.ts` (PWA manifest `name` and `description`)

**PWA manifest description also updated** from "Interactive prep platform for the Goethe / telc Deutsch
B2 Beruf speaking exam." to reflect the broader B1-B2 real-life positioning.

**Home-screen icons regenerated as full-bleed opaque (PR #146):**
The existing `apple-touch-icon.png` and `pwa-*.png` had transparent corners (alpha = 0 at corners)
inherited from the rounded-logo source. iOS fills transparent areas with black when applying the OS
rounding mask, producing dark corners on the home-screen icon. Fixed by regenerating all four files
using a Python/Pillow BFS flood-fill approach that extends the gradient from opaque edge pixels into
the transparent corners:
- `public/apple-touch-icon.png` (180x180, full-bleed opaque)
- `public/pwa-192x192.png` (192x192, full-bleed opaque)
- `public/pwa-512x512.png` (512x512, full-bleed opaque)
- `public/pwa-maskable-512x512.png` (512x512, full-bleed bg + logo centered in 80% safe zone)

**Favicon replaced with real logo PNGs (PR #146):**
`public/favicon.svg` rendered a plain system-font "G" via SVG `<text>`, not the actual styled logo.
Generated `public/favicon-32.png` and `public/favicon-16.png` from the canonical logo (with rounded
transparent corners, appropriate for the browser tab where transparency looks good). `public/favicon-48.png`
also generated. Updated `index.html` favicon links from SVG to the new PNGs:
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
```
The filename change also busts browser favicon cache (no hard-refresh needed on next visit).

**Google OAuth branding re-submission status:** the founder re-submitted verification via Google Cloud
Console → OAuth consent screen → "I have fixed the issues." The cached result still showed the old
failure ("issues found from previous verification attempt") but that is normal: Google caches the prior
result and the new review is asynchronous. Confirmed that the static pre-render fix is technically
correct and complete. The founder should wait for an email from Google's Trust and Safety team
(hours to days) rather than re-clicking, which may reset the queue.

**GitHub repo safety confirmed:** public repo confirmed clean. Supabase anon (publishable) key is
intentionally public per Supabase's design (RLS is the security layer). No other secrets in tracked
files or git history. Only exposure is business IP (code/content). Founder enabled GitHub secret
scanning + push protection.

**Hosting migration decision: Cloudflare Pages (deferred):**
Founder chose to migrate from GitHub Pages to Cloudflare Pages after OAuth branding is resolved.
Cloudflare Pages advantages over GitHub Pages: free private-repo deploys, native SPA routing (no
404.html hack needed), real HTTP headers (CSP via header rather than meta tag, `frame-ancestors`
works), superior cache purge control, and zero extra cost. Migration prep will happen in a future
session once Google OAuth verification clears.

### Session 21 (2026-06-12) — Broader B1-B2 positioning, About page, business plan, consent gating SHIPPED ✅
Branch `claude/vibrant-meitner-mfl9xk`. All items squash-merged to `main` (PRs #140–#141).

**Broader app purpose repositioned (PR #140):** The founder confirmed Genauly's purpose is not
exam-prep-only: it is for anyone stuck at the intermediate plateau (roughly B1-B2), not just people
preparing for one specific exam. Two deliverables:

1. **Landing page re-copy** (`src/features/landing/LandingPage.tsx`): hero, badge, sub-label, feature
   cards, footer, and CTAs all updated to reflect the broader B1-B2 real-life framing. Highlights:
   badge = "German for real life · B1-B2"; hero = "Break through the plateau. German for the
   situations that actually matter."; feature cards describe real situations (Behörde, Arztbesuch,
   job interview); content counts removed from public copy. "Über uns" footer link added.

2. **New `/about` page** (`src/features/about/About.tsx`): bilingual (DE/EN) purpose page reusing
   `LegalChrome` + `Section`. Explains in plain language what Genauly is, who it is for, what you
   can do with it, and — critically for Google's OAuth branding review — exactly how Google sign-in
   data is used (account creation + cross-device progress sync only, no ads, no selling). Routed at
   `/about` (`src/router.tsx`). Both landing and /about were updated to correct exam naming:
   "telc Deutsch B2 Beruf" and "Goethe-Zertifikat B2" (no "Goethe-Zertifikat B2 Beruf" exists).

3. **Business plan `docs/BUSINESS_PLAN.md`** (v1.1): investor-grade plan covering market sizing
   (TAM/SAM/SOM from BAMF, Destatis, Goethe-Institut, Duolingo shareholder letters), competitive
   landscape, product differentiation, business model, unit economics, GTM, risks, pre-seed framing.
   Includes PURPOSE STATEMENTS section (EN + DE) for Google OAuth verification. v1.1 reflects the
   broader B1-B2 plateau positioning.

4. **Backlog #18 added**: "Reposition and redesign for the broader B1-B2 real-life purpose" —
   new scenario themes (Behörde, healthcare, job-hunting, social), nav/UI redesign, in-app copy
   alignment. Documented scope + recommended model guidance.

**Consent gating for sign-up (PR #141):** The "Weiter mit Google" button was available immediately
on sign-up, even before accepting the AGB + Datenschutz — defeating the consent requirement.
Moreover, `hasConsented()` was pre-checking the checkbox for anyone who had previously consented
(e.g. during onboarding), bypassing the requirement entirely. Two fixes in `AuthDialog.tsx`:
- `setConsent(hasConsented())` → `setConsent(false)`: sign-up ALWAYS starts unchecked,
  regardless of prior consent history.
- Consent checkbox moved from below the form to ABOVE the Google button so the "agree first"
  dependency is visually obvious to users.
- Login tab unchanged: no checkbox shown, Google button available immediately.
- `hasConsented` import removed (unused).

**Also corrected this session:** `CLAUDE.md` still uses the INCORRECT exam name "Goethe-Zertifikat
B2 Beruf" in the header. The existing telc exam names in the file body were already correct.
Note: in-app copy (authenticated app shell) still reflects the old "B2 Beruf exam prep" framing;
only public-facing copy (landing, /about) was updated. In-app copy alignment is part of backlog #18.

### Session 20 (2026-06-08) — Logo lock, Terms page, GDPR pass, writing-history record SHIPPED ✅
Branch `claude/admiring-galileo-9E0Fi`. All items squash-merged to `main` (PRs #120–#129).

**Logo (PRs #120–#122):** brief detour where the app logo was made full-bleed (#120) then reverted
(#121) because the founder prefers the rounded mark with transparent corners. Settled: the canonical
default logo is **`public/genauly-default-logo-transparent-corners.png`**, used in all 6 in-app spots;
`favicon.svg` + `pwa-*.png` keep their conventional names and render the same mark (#122). The
full-bleed square variant exists ONLY for Google's circular OAuth consent crop, NOT for the app. Rule
documented in `CLAUDE.md` → "Brand logo" so future sessions don't flip it again.

**Terms of Service + bilingual legal toggle (PR #123):** new `/terms` (AGB) page; both `/privacy` and
`/terms` now share `LegalChrome` with a **Deutsch/English toggle** (default German, German is binding).
Fixed em dashes in the privacy copy. Footer + Settings link to both.

**Legal review backlog (#15, PRs #124–#125):** recorded the need for a lawyer pass before paid
plans/marketing; decided (founder-confirmed) **no "under review" banner** on the live legal pages.

**GDPR pass (PR #126, the big one):** audit done (3-agent), then a robust first implementation.
Shipped: consent checkbox at sign-up (`AuthDialog`, incl. Google) + final onboarding step, recorded via
`recordConsent()`/`CONSENT_VERSION` (`src/lib/consent.ts`) into `profiles.settings` jsonb; in-app data
export (`src/lib/dataExport.ts`); in-app account deletion (`supabase/functions/delete-account` +
`useAuthStore.deleteAccount`, two-step + type-LÖSCHEN confirm); per-submission writing delete
(`deleteWritingEvaluation` + `writing_delete_own` RLS policy, migration `0003`); honest reset that also
clears cloud progress when signed in (`cloudSync.pushProgressNow`). **Decision: no cookie banner**
(functional-only storage is consent-exempt under GDPR/§25(2) TTDSG). **Founder did the two Supabase
steps live** (ran migration 0003, deployed delete-account), so deletion + per-item delete are active.

**Impressum (PRs created in #126, hidden in #127):** built a bilingual `/impressum`, then **temporarily
hid it** (route commented out, all links removed; file kept) because the founder doesn't want to publish
a home name/address yet. An Impressum is public by law (a GitHub secret can't hide it). Re-enable with a
business/service address ("ladungsfähige Anschrift", not a P.O. box) during the lawyer/launch pass.

**Writing history record + redesign (PRs #128–#129):** the Verlauf only showed the AI tip, with no record
of the task or the user's own text. Now each entry has an expandable section showing the **Aufgabe**
(from `writingPrompts[theme][length]`) and **Dein Text** (the submitted text, already stored in
`writing_evaluations.text`, now fetched). Then redesigned the entry for clear hierarchy: tip in a
highlighted box (Lightbulb + label + weakness badge), Aufgabe/Dein Text in labeled bordered boxes, a
proper "üben" button.

**Also confirmed live:** the Google OAuth consent screen branding (app name "Genauly" + logo, domain
verified via Namecheap DNS, app published) was completed by the founder this session.

### Session 19 (2026-06-07) — Sign-in dialog UX overhaul + brand identity unification SHIPPED ✅

**Dialog overlay redesign, iterated and locked (PRs #106–#109):** The founder felt the sign-in
dialog's backdrop blur looked stale/cached, and didn't like the flat black overlay underneath it.
Iterated through several rounds with rendered mockups approved before merging:
- PR #106 dropped the `backdrop-blur` entirely.
- PR #107 toned down the card's `shadow-elevated` halo by ~50% (new `shadow-elevated-soft` token
  in `tailwind.config.ts`, ~half the opacity/spread of the original).
- PR #108 replaced the flat `bg-black/50` overlay with a brand-tinted radial spotlight
  (`bg-dialog-overlay`, a `radial-gradient` using the `--shadow` HSL token, lighter behind the
  card and deepening toward the edges, dark-mode-aware). Generated a 5-variant comparison mockup,
  the founder picked this one ("looks perfect").
- PR #109 **locked this as the standard convention** for all popups/dialogs/sheets going forward
  ("remember this design choice... for future reference") — documented in `CLAUDE.md` as a new
  "UI conventions — modal / popup overlays" section and in "Decisions locked" below. Both tokens
  are already wired into the shared `DialogContent`/`DialogPrimitive.Overlay` in
  `src/components/ui/dialog.tsx`, so any dialog built on that primitive inherits this for free.

**Sign-in dialog UX fixes (PRs #113–#114):**
- PR #113 added a top **segmented toggle** ("Konto erstellen" / "Anmelden", `role="tablist"`)
  right under the dialog header. The founder pointed out that the "Anmelden" link for existing
  users was buried at the bottom and easy to miss; now both modes sit side by side at the top,
  with "Konto erstellen" as the default and "Anmelden" equally prominent. The old buried bottom
  toggle link was removed.
- PR #114 removed the "Wir nutzen deine E-Mail nur für die Anmeldung" microcopy line. The founder
  asked whether that was actually true; it wasn't (password reset/recovery already uses it, and
  future billing/marketing mail would break the promise outright) — so the line was deleted along
  with its now-unused `ShieldCheck` import rather than rewritten into something narrower.

**Brand identity unified: G-logo wordmark replaces the Sparkles brand mark everywhere (PRs
#116–#118):** The founder liked the gradient "Sparkles" icon used as the app's brand mark, but
asked to swap it for the actual "G" wordmark logo (`/favicon.svg` — gradient rounded square with
a white "G", already the favicon and PWA app icon) so the brand mark is consistent with the icon
users see on their home screen. Swapped in **all five** places the Sparkles-in-a-gradient-box
brand mark appeared:
- `AuthDialog.tsx` (sign-in dialog header, PR #116)
- `AppShell.tsx` (mobile header logo)
- `Sidebar.tsx` (desktop sidebar logo)
- `LandingPage.tsx` (landing page header logo)
- `Onboarding.tsx` (onboarding top brand mark)
- `PrivacyPolicy.tsx` (the **/privacy** page's back-to-home header logo, PR #118 — the one
  initially missed; caught on a careful final re-sweep after the founder asked "why isn't the
  logo changed here?" about the in-app header following the first round of swaps)

Each spot now renders `<img src="/favicon.svg" alt="" className="h-{n} w-{n} rounded-{lg|xl}
shadow-glow" />` at its existing size, keeping the `shadow-glow` halo. Sparkles remains as a
**content/decorative icon** (onboarding step headers, guest-progress notes) per the founder's
explicit "keep it for something else for later" — it was only removed from brand-mark usage, not
from the codebase or from non-brand UI. Verified with Playwright screenshots at every location
(desktop + mobile viewports, light + dark mode): the G mark renders crisply at every size with no
cropping/stretching and the `shadow-glow` halo intact.

**Founder backlog captured (PRs #110–#112, #115):** Recorded a Google sign-in branding to-do that
the founder attempted but couldn't finish in one sitting (PR #110, see "Founder action items"),
and a 14-item raw feature-idea backlog spanning product, monetization, growth, and GDPR
compliance (PRs #111–#112, #115) — see "Backlog — founder ideas" below for the full list.

### Session 18 (2026-06-06) — Security complete + streak bug fix SHIPPED ✅

**Streak display bug fixed (PR #90):** The streak counter was showing a stale persisted value
after missed days (e.g. showing "5 Tage Serie" after 2 missed days, then dropping to 1 on the
next activity — looked like a reset). Added `useEffectiveStreak()` hook that returns the stored
streak only when `lastActiveDay` is today or yesterday (still alive), and 0 when the streak has
actually been broken. Dashboard and Analytics both updated.

**Cloudflare Turnstile CAPTCHA — fully live (PRs #91–#92):**
- `TurnstileWidget` component: lazy-loads Cloudflare Turnstile script, auto-solves in <1 s for
  real users, no-op when `VITE_TURNSTILE_SITE_KEY` is unset (dev/CI unchanged).
- `useAuthStore`: all four auth calls (`signInAsGuest`, `signUp`, `signIn`, `signInWithGoogle`)
  now accept and pass `captchaToken` to Supabase.
- `AuthDialog` and `AccountPanel` render the widget and gate submission on a valid token.
- `pages.yml`: `VITE_TURNSTILE_SITE_KEY` secret piped into the build step.
- CSP extended for `challenges.cloudflare.com` (script + frame + connect).
- **Founder steps done:** Cloudflare widget created for `genauly.de` → site key added as GitHub
  Actions secret → Supabase Authentication → Attack Protection → Turnstile enabled with secret
  key. All sign-in flows (guest, sign-up, email login, Google OAuth) are now CAPTCHA-protected.

**CSP switched from report-only to enforcing (PR #93):**
- Discovered that `Content-Security-Policy-Report-Only` via `<meta>` tag is **rejected by all
  browsers** (HTTP-header-only; GitHub Pages cannot set headers). The policy was silently ignored
  since it was added. Switched to enforcing `Content-Security-Policy` which does work in meta
  tags. Founder confirmed the console is now clean — no CSP errors.

**Full security checklist is now 100% complete.** See `docs/SECURITY.md`.

**Stale SW chunk-fetch crash fixed, two rounds (PRs #95, #97):** Intermittent "Failed to fetch
dynamically imported module" errors on Windows desktop and Android. Round 1 (`lazyWithReload()`,
PR #95) just reloaded once on failure, insufficient: the Service Worker kept re-serving the same
stale cached `index.html`, so the reload hit the identical error with a new chunk hash. Round 2
(PR #97) added `src/lib/recover.ts` → `recoverFromStaleAssets()`, which explicitly clears all
`caches` and unregisters the service worker *before* reloading (rate-limited via `sessionStorage`
timestamp so genuine outages don't loop). Wired into `lazyWithReload()`, the global
`error`/`unhandledrejection` handlers, and the `RootErrorBoundary` in `main.tsx`. This is the
architecturally correct fix: a plain reload can't out-run a Service Worker that intercepts the
fetch and hands back the same cached HTML.

**Onboarding "Zurück" button fixed (PR #98):** On Step 1 ("Willkommen!") the back button was
`disabled={step === 0}`, a dead button that read as broken. Now it navigates to `/welcome`
(landing page) when there's no previous onboarding step.

**Em dashes removed app-wide + style rule documented (PR #99):** Founder dislikes `—` as an
overused "AI tell". Rewrote ~30 user-facing strings across `index.html`, `LandingPage`,
`Onboarding`, `QuickRevision`, `CollocationsBrowser`, `dashboard/recommend.ts`, `SimulationHub`,
`Analytics`, `redemittel.ts`, `grammar.ts`, and `package.json`'s tagline, replacing `—` with a
period, comma, colon, or "and"/"so" as natural. Code comments were left untouched (not
user-visible). **New "Writing style" section added to `CLAUDE.md`** so future AI sessions follow
this rule by default; the en dash `–` and bullet `·` remain fine.

**Real `/privacy` page shipped (PR #100):** Founder asked about the Google sign-in consent screen
showing the raw Supabase project domain instead of "Genauly", which requires Google brand
verification, which requires a Privacy Policy URL. Wrote `src/features/legal/PrivacyPolicy.tsx`,
a plain-language Datenschutzerklärung grounded in the actual schema/Edge Function/CSP (account
data, profile, learning progress sync, AI writing submissions and where they go, Turnstile,
hosting providers, retention, GDPR rights). Routed at `/privacy` (top-level, outside `AppShell`,
reachable signed-out), linked from the landing footer and Settings. Live at
`https://genauly.de/privacy` — ready to paste into the Google Cloud Console verification form.

**Clean URLs: migrated off hash routing (`/#/...` → `/...`):** The founder asked why URLs had a
`#` and whether "normal" clean URLs were possible. They are, via the well-known GitHub Pages SPA
redirect trick (https://github.com/rafgraph/spa-github-pages):
- `router.tsx`: `createHashRouter` → `createBrowserRouter`.
- `vite.config.ts`: `base: "./"` → `base: "/"` (required so asset URLs resolve correctly from any
  path, not just `/`; safe because the custom domain `genauly.de` serves from the root). PWA
  manifest `start_url`/`scope` updated to `"/"` to match. `index.html` icon `href`s made absolute.
- **New `public/404.html`**: GitHub Pages serves this for any unknown path (e.g. a direct visit to
  `/privacy`). It encodes the requested path/query/hash into `/?/privacy&...` and redirects to the
  app root.
- **New `public/spa-redirect.js`**: loaded as a classic (blocking, pre-module) `<script>` in
  `index.html`. Decodes that `/?/...` shape and calls `history.replaceState` to restore the exact
  original URL *before* React Router mounts, so the correct route renders on first load. Loaded
  via `<script src>` (not inline) to satisfy the `script-src 'self'` CSP.
- **`useAuthStore.signInWithGoogle`**: `redirectTo` simplified from
  `window.location.origin + window.location.pathname` to `window.location.origin + "/"` — always
  return to the root after OAuth regardless of where sign-in was opened, matching Supabase's
  redirect allowlist exactly and sidestepping the 404 dance mid-auth-flow. (Behaviorally identical
  to the old hash-router setup, where `pathname` was always `/` anyway.)
- **Verified locally** with a custom Python static server that mimics GitHub Pages' exact
  behavior (serves `404.html` with a 404 status for unknown paths) plus Playwright: confirmed the
  full chain — fresh visit to `/privacy?ref=test#section` → 404 → redirect → `history.replaceState`
  restore → React Router renders the right page — preserves query strings and hash fragments
  byte-for-byte, for both gated and ungated routes; confirmed reloads on deep routes are instant
  once the Service Worker's `navigateFallback` takes over; confirmed in-app `<Link>` clicks update
  the URL cleanly with no page reload. **Cannot test the live Google OAuth round-trip from the
  sandbox** — founder should verify "Sign in with Google" still works right after this deploys.

### Session 17 (2026-06-05) — Security audit + full hardening SHIPPED ✅ + sourcing research

**Security audit completed (no critical findings).** Full architectural review of all security
surfaces. The app is fundamentally well-built: secrets stay server-side, all tables have
owner-only RLS, no client-side secret exposure, no `dangerouslySetInnerHTML` or `eval`. The
service worker precaches only static build assets.

**Gaps found and a remediation plan created & approved:**
- 2 moderate npm vulns (react-router open redirect, fixed by bumping to `^6.30.4`).
- Edge Function CORS wide-open (`Access-Control-Allow-Origin: *`) — needs allowlist.
- No Content-Security-Policy header/meta anywhere.
- Third-party font from `rsms.me` (privacy + supply-chain risk) — needs self-hosting.
- AI function has no input *maximum* size cap — denial-of-wallet risk.
- No per-user monthly AI call cap — one account can exhaust the global budget.
- CI actions pinned to floating tags (`@v4`) rather than commit SHAs.
- npm → pnpm migration planned (supply-chain: content-addressable store + release-age cooldown).

**Plan document:** `docs/SECURITY_AUDIT_PLAN.pdf` (4-page PDF, on `main`).

**Implementation — all 4 PRs SHIPPED this session (PRs #85–#88, on `main`):**
- PR #85: npm → pnpm migration + react-router vuln fix + `.npmrc` supply-chain guardrails.
  `pnpm audit` 2 moderate → **0**. CI build verified green on `main` (pnpm + cache all pass).
- PR #86: Edge Function hardening — CORS allowlist, `MAX_TEXT_LEN`=3000, `USER_MONTHLY_LIMIT`=50,
  plus `docs/SECURITY.md`. **Founder redeployed the function (2026-06-05) → now live.**
- PR #87: report-only CSP meta + self-hosted Inter (`@fontsource-variable/inter`); removed rsms.me.
- PR #88: all 6 GitHub Actions pinned to commit SHAs (resolved via `git ls-remote`); CI verified.
- **Remaining:** (a) Turnstile **frontend** integration is required before CAPTCHA can be enabled
  (turning it on now would break sign-in — the app sends no captcha token); (b) flip CSP
  report-only → enforcing after the founder confirms a clean live console. See `docs/SECURITY.md`.

**Documentation updates (PRs #82–#83, live on `main`):**
- Added content QC & technical validation planning to-do.
- Expanded "Research findings" section with full open-licensed sourcing guide: licensing
  guardrails (CC0/BY/BY-SA = ok; NC/ND = blocked), table of 7 approved commercial-safe sources
  (Tatoeba, Wikibooks, Wikimedia Commons, Project Gutenberg, LibriVox, DWDS/Leipzig), and
  sources to avoid (DW, Goethe/Klett/Routledge). Also noted Anki/LARA open-source infra.

### Session 16 (2026-06-05) — Content expansion SHIPPED ✅ (10 scenarios · 10 exam sets · ~504 words)

Added 7 new branching scenarios (all remaining themes: meetings, logistics, travel, project,
homeoffice, conflict, safety) bringing the total to **10 scenarios across all 10 themes**.
Added 8 matching exam sets (total **10**, one per theme, 6–7 min, sharedRubric). Appended
~150 new vocabulary words across all themes (**354 → ~504**). Fixed 6 TypeScript errors where
dual-gender `article` values (`"der/die"`, `"die/der"`, `"das/die"`) violated the strict union
type — resolved by using the primary form's article. `npm run build` green; PR #80 squash-merged;
branch realigned to `origin/main`.

### Session 15 (2026-06-05) — Mobile bottom tab bar SHIPPED ✅ (Layer 2)

Replaced the hamburger drawer on mobile with a native-feeling bottom tab bar + "Mehr" sheet.
Files: `nav-items.ts` (shared nav), `BottomTabBar.tsx` (fixed bar, `lg:hidden`, safe-area aware),
`MoreSheet.tsx` (Radix bottom sheet, grab handle, 8 non-primary nav items), `AppShell.tsx`
(removes hamburger/drawer, mounts bar + sheet, `pb-nav` on main), `Toaster.tsx` (lifted above
bar on mobile), `index.css` (`.pb-safe` + `.pb-nav` utilities). Desktop sidebar untouched.
`npm run build` green, PR #76 squash-merged to `main`. Active branch: `claude/todo-inventory-BUHq0`.

### Session 14 (2026-06-05) — Mobile-app redesign plan expanded (Layer 2 + Point 3) 📋

Founder confirmed the home-screen app launches full-screen now (Layer 1 ✅) but still feels
desktop-sized with loose dimensions. Expanded **`docs/MOBILE_APP_PLAN.md`** into the full approved
plan: **Layer 2** (bottom tab bar + "Mehr" sheet) and **Point 3** (mobile density & fit — a
`sm:`-gated tightening of shared components `HubHero`/`SectionHeading`/`EmptyState`/`StatCard` +
page rhythm, plus targeted fixes to flashcard buttons, the Dashboard stat strip, the progress ring,
and exam/simulation timer headers). Plan was pressure-tested: found & documented a real Toaster vs
bottom-bar collision fix, guaranteed ≥44px touch targets, a `card.tsx` de-risk (leave it untouched —
all callers override padding), a multi-branch-hub scope guard, and a collision audit. Desktop stays
pixel-identical throughout. Also reconciled stale branch references for handoff: the active
automation branch has been `claude/genauly-blank-page-9biDi` since session 9
(`claude/loving-cray-lMLj3` was used through session 8); updated the forward-looking references in
`CLAUDE.md` + this doc's deploy reminders (historical session entries left as-is) and noted
**`main` is the source of truth** (branch may be reassigned per session). **No app code shipped
this session — documentation only.** Resume from Layer 2.

### Session 13 (2026-06-04) — iOS standalone fix: no more address bar ✅

Shipped **Step 1** of the mobile-app plan (`docs/MOBILE_APP_PLAN.md`) independently: added the iOS/
Android standalone meta tags to `index.html` so the home-screen icon launches **full-screen with no
Safari address bar**. iOS Safari ignores the manifest's `display: standalone` for home-screen
launch and requires `apple-mobile-web-app-capable` — that was the missing piece causing the "shows
browser version" symptom. Tags added: `apple-mobile-web-app-capable=yes`, `mobile-web-app-capable=yes`,
`apple-mobile-web-app-status-bar-style=black-translucent` (matches dark theme + viewport-fit=cover;
`.pt-safe` already compensates), `apple-mobile-web-app-title=Genauly`, `theme-color=#0f1729`.
`npm run build` green, no circular warning, all five tags verified in `dist/index.html`. The
bottom-tab-bar redesign (Steps 2–6) remains planned/deferred. **Founder must re-add the app to the
home screen** (iOS caches the old web-clip — delete the existing icon and Add-to-Home-Screen again
after the deploy) to pick up the change.

### Session 12 (2026-06-04) — Mobile-app redesign planned (deferred) 📋

Founder installed the PWA to their iPhone home screen — it works, but still shows Safari's
address bar and the UI feels like the website (desktop sidebar + hamburger drawer). Researched and
wrote a full, approved implementation plan to make it feel native: **`docs/MOBILE_APP_PLAN.md`**.
Scope = app chrome + navigation only (bottom tab bar Start · Wortschatz · Quiz · Fortschritt ·
Mehr; iOS standalone meta tags to launch full-screen; desktop stays pixel-identical). **Founder
chose to defer the build to a later session — no code shipped this session.** Resume from the plan
doc. Note: Step 1 (iOS meta tags) is an independent quick win that fixes the address bar on its own.

### Session 11 (2026-06-04) — Installable PWA ✅

Added full Progressive Web App support so Genauly can be installed to the home screen on any
device and launches app-like (full-screen, no browser chrome, offline-first).

**What was shipped:**
- `vite-plugin-pwa` (v1.3.0) added as a devDependency — generates a service worker via Workbox
  and injects the manifest automatically at build time; no hand-written SW code needed.
- **Web App Manifest** (`dist/manifest.webmanifest`): name, short_name, description, `display:
  standalone`, `theme_color: #6366f1`, `background_color: #0f1729`, `lang: de`,
  `orientation: portrait-primary`, `start_url: ./`, three icon sizes.
- **Service worker** (`dist/sw.js` + `dist/workbox-*.js`): precaches all 40 build artifacts
  (~1.57 MB); `navigateFallback: index.html` so hash-routes survive offline reload; `autoUpdate`
  strategy so returning users silently get the latest version in the background.
- **Icons** generated from `public/favicon.svg`:
  - `pwa-192x192.png` — standard PWA icon (Android Chrome)
  - `pwa-512x512.png` — full-res PWA icon / splash screen
  - `pwa-maskable-512x512.png` — maskable icon (safe zone = inner 80%) for adaptive icon shapes
  - `apple-touch-icon.png` (180×180) — iOS Safari "Add to Home Screen"
- `index.html` — added `<link rel="apple-touch-icon">` for iOS.
- **Works with the session-10 safe-area insets:** in standalone mode, `env(safe-area-inset-*)`
  is now non-zero, so the header and content bottom clearance are correct.

`npm run build` green · no circular-chunk warning · `npm run typecheck` green · 40 entries
precached. Founder to test "Add to Home Screen" on their phone once the Pages deploy completes.

### Session 10 (2026-06-04) — Mobile UX audit ✅

Code-level audit of every layout + interactive surface for mobile hazards (horizontal overflow,
sub-16px form fields → iOS zoom, fixed widths, tap targets, notch/home-indicator). **Verdict: the
app is already mobile-solid** — responsive grids throughout, `100dvh` dialogs, `overflow-x: clip`
on body, and the iOS input-zoom fix (form controls forced to 16px ≤640px) was already in place.

**One real gap found & fixed — safe-area insets.** `index.html` opts into `viewport-fit=cover`
(content extends under the notch / home indicator / side cutouts) but nothing consumed
`env(safe-area-inset-*)`, so on notched iPhones — especially landscape and home-screen/standalone —
the sticky header could sit under the status bar and the last controls could hide behind the home
indicator. Added `.pt-safe` / `.pb-safe-8` utilities (`src/index.css`) and applied them to the
`AppShell` header (top inset) and `<main>` (bottom inset). **Zero desktop risk:** `env()` insets
resolve to 0 on desktop and normal portrait Safari, so it's a no-op everywhere except notched/
standalone contexts. `npm run build` + `npm run typecheck` green.

**Natural follow-on (not done):** make the app an installable PWA (manifest + service worker) —
that's where safe-area insets fully pay off and where mobile users get an app-like, offline launch.

### Session 9 (2026-06-04) — Blank page bug ROOT-CAUSED & FIXED ✅

**Root cause (proven, not speculative): a circular ESM *chunk* dependency introduced by the
session-6 `manualChunks` config.**

- `react-router` / `react-router-dom` matched the `node_modules/react-router` rule → `vendor-react`.
- Their dependency **`@remix-run/router`** matched **no** rule → fell through to the catch-all
  `vendor-misc`.
- Result: `vendor-react` imported `@remix-run/router` **from** `vendor-misc`, while `vendor-misc`
  imported React **from** `vendor-react` → **`Circular chunk: vendor-misc -> vendor-react ->
  vendor-misc`** (this warning was printed on *every* build since session 6 but was ignored).
- With circular ES modules the browser can evaluate a binding while it is still in its **temporal
  dead zone**, throwing `ReferenceError: Cannot access 'X' before initialization` **synchronously
  during module evaluation — before `createRoot()` runs**. Because it's a `type="module"` script
  throwing *pre-React*, the `RootErrorBoundary` can't catch it and nothing renders → blank dark
  page. Worked in `vite dev` because dev serves unbundled modules in correct order. This matches
  every symptom and every previously ruled-out item.

**The fix (`vite.config.ts`):** add `node_modules/@remix-run/router` to the `vendor-react` rule so
the entire React + router graph lives in one chunk. After rebuild: the circular-chunk warning is
gone, `vendor-react` imports from **no** other chunk, and a pairwise scan of all emitted chunks
shows **zero** cycles. `npm run build` + `npm run typecheck` both green.

**Permanent safety net (`src/main.tsx`):** added a framework-free `paintFatal()` that writes the
error straight into `#root` via the DOM, plus `window.onerror` / `unhandledrejection` listeners and
a `try/catch` around `createRoot()`. Any *future* pre-React/module-level crash (TDZ, chunk 404,
unsupported browser API) is now visible on screen instead of a silent blank page — important since
the founder is usually on mobile and can't open a console. Kept as a permanent net.

**Verification done in sandbox:** built fresh, confirmed every chunk hash referenced by
`dist/index.html` exists on disk, confirmed no cross-chunk import cycle remains, typecheck clean.
The sandbox can't reach the live `*.github.io` site — founder confirms the live result.

### Session 8 (2026-06-04) — Blank page bug investigation (root cause was the circular chunk above)

**Symptom:** Site shows a completely black blank page (dark background from CSS, no React content). Reported by founder on mobile. Persists across multiple deploys.

**What was shipped in this session (PRs #64–#66, all merged to main):**
- PR #64: Analytics page enhancement (30-day XP chart, per-theme mastery, writing weaknesses panel)
- PR #65: Added `RootErrorBoundary` in `main.tsx` to catch and display render errors
- PR #66: Reverted `LandingPage` and `Dashboard` to static imports (removed `React.lazy` + `fallback={null}` which caused a blank-page window during chunk loading on slow mobile connections)

**Diagnosis so far:**
- Dark background shows HTML + CSS load correctly; only JavaScript fails to render
- `RootErrorBoundary` is deployed and would show an error message if React mounts — but page remains blank, suggesting React never mounts at all
- All CI builds pass; `npm run build` and `npm run typecheck` are both green
- No obvious crash-inducing code found via static analysis
- The issue may be: browser/CDN cache serving old `index.html` (referencing old chunk hashes that no longer exist) → JS fails to load → blank page. GitHub Pages CDN caches HTML for ~10 min.
- Founder was on mobile and couldn't check browser console (F12)

**Most likely next steps for the new session:**
1. **First thing:** Ask founder to open genauly.de on a desktop browser and check the Console tab (F12 → Console). The error message will be there even if React didn't mount.
2. **If blank on desktop too:** The issue is in the production JS. Console will show either a 404 for a chunk file, or a JS runtime error.
3. **If works on desktop:** It's a mobile-specific browser cache issue. Ask founder to clear site data in their mobile browser settings for genauly.de, or try incognito/private tab.
4. **Fallback:** If a specific error is found in the console, fix it directly. If it's a chunk 404, consider adding a version query string to force cache-busting or investigate if GitHub Pages is serving stale files.

**What NOT to try again:** Blind deploys without knowing the specific error. The error boundary is in place — the next session MUST get the actual console error first.

### Session 7 (2026-06-04) — Analytics screen enhancement (SHIPPED & LIVE)

- **Analytics page rewrite (`src/features/analytics/Analytics.tsx`):**
  - **30-day XP chart:** extended from 7 to 30 days; X-axis uses `interval={4}` to avoid label crowding.
  - **Per-theme mastery breakdown:** all 10 themes displayed in a card, sorted least-mastered first (most gaps at top). Each row shows theme name, mastered/total word count, percentage, and a progress bar.
  - **Writing weaknesses panel:** async-loads the last 60 writing evaluations via `getWritingHistory(60)`. Shows top 5 weakness categories with frequency bars (widths relative to most-frequent), and a "Jetzt üben" button linking to the relevant practice area for the top weakness. Skeleton loader shown while data is loading.
  - No new dependencies — reuses existing recharts, practiceAreas, writing lib, and shared components.

### Session 6 (2026-06-04) — Performance: vendor code-splitting (SHIPPED & LIVE, PR #62)

- **Bundle split (`vite.config.ts`):** added `manualChunks` separating all `node_modules` into
  six independently-cached vendor chunks: `vendor-react` (161 KB), `vendor-supabase` (204 KB),
  `vendor-motion` (109 KB), `vendor-ui` (68 KB), `vendor-charts` (303 KB), `vendor-misc` (237 KB).
- **Lazy-loaded `LandingPage` and `Dashboard`** in `router.tsx` to keep the bootstrap chunk lean.
- **Results:** main bundle 836 KB → **34 KB** (96% reduction); Analytics chunk 392 KB → **6 KB**;
  no chunk exceeds 500 KB; build warnings gone. Vendor chunks are cached separately — deploys
  only force re-download of changed app chunks, not the full vendor stack.

### Session 5 (2026-06-03) — Content expansion + Collocation card UX (SHIPPED & LIVE)

- **Collocation card spacing (PRs #57–#59, live):** iteratively fixed spacing hierarchy so
  lines 1→2 (phrase → translation) and 3→4 (example German → example English) are equally tight,
  with a clearly larger section break between them (final values: no added margin for 1→2, `mt-5`
  for 2→3, `space-y-0.5` for 3→4).
- **Hover-reveal speak buttons (PR #58, live):** on mouse/pointer devices (`@media(hover:hover)`)
  both speak buttons are hidden by default. Moving into the card's top half reveals the phrase
  button; bottom half reveals the example button. Always visible on touch devices. Implemented by
  extracting a `CollocationCard` component with per-card `hoverHalf` state and `onMouseMove`.
- **Content expansion — Collocations (PR #60, live):** added 22 new Nomen-Verb pairs, bringing
  all 10 themes from 9–11 entries to exactly 12 each. Total: **120 collocations**.
  New entries span all themes: tagesordnung festlegen, kapazitäten prüfen, urlaub beantragen,
  ware prüfen, versand vorbereiten, erwartungen erfüllen, feedback einholen, mediation einleiten,
  fehler eingestehen, meilenstein erreichen, budget einhalten, update einspielen,
  sicherheitslücke schließen, abrechnung einreichen, anschluss verpassen, aufenthalt verlängern,
  abfall trennen, nachhaltigkeit verankern, zertifizierung anstreben, schutzausrüstung tragen,
  sicherheitsbegehung durchführen, notfallplan erstellen.
- **Content expansion — Grammar drills (PR #60, live):** added 2 new drills per grammar topic
  across all 10 topics (27 → **47 total**). Topics previously with only 2 drills (Konjunktiv II,
  Modalverben, Passiv) now have 4; the rest have 5. New drills cover: dennoch/indem connectors,
  genitive relatives (dessen), dative plural (denen), da-/wo-words in context (daran, darauf),
  full TeKaMoLo word order, obwohl/wenn subordinate clauses, two-way preposition pairs
  (wohin/wo), Konjunktiv II direct forms (hätte/wäre), darf-nicht vs muss-nicht distinction,
  and Passiv Präteritum (wurde).
- **Vocabulary:** already at **354 words** (34–39 per theme, well-balanced) — no expansion needed.

### Session 4 (2026-06-03) — Writing History + Collocations Browser + UX polish (SHIPPED & LIVE)

- **Writing History (PRs #52–#53, live):** `src/features/writing/WritingHistory.tsx` — loads past
  AI evaluations from `writing_evaluations` Supabase table; shows weakness-frequency bar chart (top 5
  weaknesses, horizontal progress bars, "Jetzt üben" CTA for the top weakness) + chronological list of
  past entries with badges, insight text, and deep-link to practice. Wired into `WritingHub` as a
  tab-switched "Verlauf" view alongside the existing "Neuer Text" prompt picker. `src/lib/writing.ts`
  got `WritingHistoryEntry` type + `getWritingHistory(limit)` async query.
- **Collocations Browser (PR #51→#56, live):** dedicated `/collocations` route — `CollocationsBrowser`
  browsing all 98 Nomen-Verb pairs. Features: theme Select dropdown, text search with clear button,
  scrollable verb-chip row with ChevronLeft/Right + ChevronDown expand-all, "Alle Verben" default chip,
  register color-coding (indigo pastel for formal), neutral/formal legend, result count, quiz CTA when
  theme active. Linked from Sidebar (Combine icon) and from a GrammarHub banner.
- **Content fix:** `src/data/collocations.ts` had two duplicate IDs (`c_beschwerde_bearbeiten` ×2 and
  `c_daten_sichern` ×2) that caused React to silently drop cards. Renamed second occurrences `_2`.
  Total unique collocations: 98.
- **App-wide card polish:** removed `h-1.5` top-border accent stripe from ALL card styles across
  Dashboard, QuizHub, GrammarHub, WritingHub — it served no semantic purpose. Collocation cards refined
  iteratively: English translation closer to German (`-mt-2`), divider line removed, German example
  sentence bolded (`font-semibold`).
- **Stuck-card animation bug fixed (PR #54):** per-card `motion.div` with `delay: i * 0.025` caused
  cards to freeze at `opacity:0` when verb filters changed their list position. Fixed by removing per-
  card animation and keying a single grid-level `motion.div` on `${themeParam}__${verbFilter}` —
  forces a full grid remount + quick fade-in on every filter change.
- **TypeScript 6 compatibility fix:** environment had TS 6.0.2 vs expected 5.7. Added
  `"ignoreDeprecations": "5.0"` to both `tsconfig.app.json` + `tsconfig.node.json`, and installed
  `@types/node` as a dev dependency. Build now green.
- **Dev branch note:** session 4 work was developed on `claude/loving-cray-lMLj3` (previous branch
  `claude/loving-cray-lMLj3` became stale after PR history rewrite).

### Sessions 1–2 (initial build — dates not recorded)
The initial from-scratch build predates this session-logging convention, so there are no dedicated
entries and no reliable dates to backfill. Only trace: session 2 shipped two broken builds because a
build check was skipped (see the Deploy/workflow reminders above). Kept here so the numbering is
visibly complete.


---

## Session 24 (stranded entry, relocated here)

### Session 24 (2026-06-16) — Mobile nav bar complete redesign + bug fixes (PRs #175–#176) ✅

This session completed a multi-iteration redesign of the mobile bottom tab bar and More sheet
that the founder drove across sessions 23–24. All changes are live on `main`.

**Feature set delivered (full list):**

- **Always-colored icons:** icons show their accent color at all times. Inactive = 38% opacity,
  active = 100%. Never grey/monochrome. The four hero icons (Dashboard, Vocabulary, Quiz,
  Analytics) use custom SVGs with the brand palette; all other routes use their lucide icon at
  the same opacity rule.

- **Larger, intentional nav bar:** icons 20% bigger (29px), taller context strip with a colored
  dot + semibold label, 62px icon rail. Spacing is even and deliberately sized.

- **More sheet grid:** additional routes shown in a 3-column icon grid with names below each tile,
  matching the visual language of the bar. No section headers.

- **iOS home-screen edit mode:**
  - Long-press anywhere on the bar OR the More sheet (600ms + haptic vibrate) opens edit mode.
  - Icons jiggle (framer-motion infinite rotate animation) and show a red X badge.
  - Drag icons left/right in the bar to reorder.
  - Tap X to remove an icon (hidden when at minimum 2 icons in bar).
  - No "Fertig" button. Tapping outside auto-saves and exits edit mode.
  - Home and Mehr are fixed; everything else is moveable between bar and sheet.

- **Adding icons to the bar (two gestures):**
  - Tap the green + badge on a sheet icon.
  - Drag the sheet icon downward ~72px (it scales to 1.18× near the threshold as visual feedback,
    then snaps back and the icon appears in the bar).
  - Both show a green checkmark flash as confirmation.

- **Max/min constraints:** max 4 icons + Mehr in bar; min 2 icons (X button hidden at minimum).

- **iOS context menu suppressed:** long-pressing `<a>` tags on iOS shows a "Copy link / Share"
  native popup. Fixed with `.no-callout` CSS class (in `index.css`) applying
  `-webkit-touch-callout: none !important` to the container AND its `*` children. Inline style
  does NOT cascade to NavLink's rendered `<a>` tags; only the CSS class selector does.

- **Bar stays interactive while sheet is open:** `modal={false}` on `DialogPrimitive.Root` in
  `MoreSheet.tsx`. Radix Dialog's default modal mode sets `pointer-events: none` on everything
  outside the sheet, which made the bar inert. `modal={false}` with a custom
  `onInteractOutside` guard (allows clicks on `#bottom-tab-bar`) is the correct fix.

- **GPU compositing fix for iOS Safari:** `transform: translateZ(0)` + `willChange: transform`
  on the `<nav>` element prevents iOS Safari from collapsing the bar under a `backdrop-filter`
  sibling.

**Bugs fixed in final PR #175:**

1. **Sync bug (icons added from sheet didn't appear in bar):** `BottomTabBar` had a `localOrder`
   buffer state with a `useEffect` that only synced from the store when `!editMode`, silently
   ignoring `setPinnedTabs` calls while the sheet was open. Fixed by removing `localOrder`
   entirely; the bar reads `pinnedTabs` from the zustand store directly — store is the single
   source of truth.

2. **Drag-to-reorder in bar not working:** `Reorder.Group` now writes every reorder back to the
   store. `flexGrow: moveablePaths.length` keeps all icon slots the same width regardless of count
   (previously `flex-1` caused all moveable icons to bunch into one slot).

3. **X button not firing:** action was in `onPointerDown` which framer-motion's drag consumed
   first. Fixed: action in `onClick`, guarded by `onPointerDownCapture` + `onPointerDown`
   stopPropagation so the drag gesture never sees the pointer.

**Founder preferences captured:**
- Edit mode must feel exactly like iOS/Android home screen app rearrangement.
- No extra buttons/chrome in edit mode; gestures drive everything.
- Icon colors must always be visible (never greyed out).
- More sheet is purely a navigation/edit surface — no section labels, no hierarchy.
- Feedback (checkmark flash, scale animation) is essential so the user knows their tap/drag worked.
- No native browser popup interrupting long-press on mobile links.

All changes shipped as PR #175 + docs PR #176, both squash-merged to `main`.

**Next (priority order):**
1. **Cloudflare Pages migration (decided s22, deferred until OAuth clears):** after Google confirms
   OAuth branding approval via email, migrate from GitHub Pages. Steps for the migration session:
   - Add a `_redirects` file for Cloudflare Pages SPA routing (replaces `public/404.html` + `spa-redirect.js`).
   - Connect GitHub repo to Cloudflare Pages (build: `pnpm build`, output: `dist`).
   - Move `genauly.de` DNS from Namecheap to Cloudflare nameservers.
   - Verify Google OAuth redirect URI still works post-DNS change.
   - Update `pages.yml` or remove it if GitHub Pages deploy is retired.
   - **Privacy bonus (decided s26):** making the repo private here is also how the founder wants the
     prompt/session logs (`docs/SESSION_PROMPT_LOG.md` + `docs/prompt-log-raw.jsonl`) and `CLAUDE.md`
     made private. The founder chose this over a separate private repo for the logs, so until this
     migration lands the repo (and new log entries) stay public. Switch the repo to **private** as
     part of this migration.
2. **GDPR follow-ups (from s20 pass):** fill the **Impressum** name/address (then re-enable the page
   per `CLAUDE.md`/`PHASE2_SETUP.md`) and the **data-location region** placeholder in the privacy
   policy; optionally enable the **pg_cron auto-retention** for writing text (SQL in `PHASE2_SETUP.md`).
3. **Lawyer review of `/privacy` + `/terms` (backlog #15)** before paid plans / marketing. Likely adds
   the real Impressum, Widerrufsrecht for paid plans, tighter liability.
4. **Content QC pipeline** — mechanical half **DONE (s22)**: `pnpm lint:content` + CI gate
   (`validate.yml`) for duplicate ids, broken dialogue nodes, missing fields, dangling cross-refs,
   em dashes. Remaining: the **pedagogical review process** for German accuracy and B2
   level-appropriateness (process/LLM-judgment, not code; recommended model **Fable**).
5. (Optional) Add Resend SMTP to fix email magic-link rate-limit.
6. (Optional) Monetization tier + paywall feature flags (the `tier` column already exists).
7. (Optional) More grammar drills (47 → ~80 target).
8. (Optional) More vocabulary content expansion (504 → ~600+ target).
9. **Founder ideas backlog (added 2026-06-07)** — 14 raw feature ideas spanning product (Dashboard
   redesign, gating Schreibtraining behind sign-in, animated scenario simulations, vocabulary
   visual mnemonics, domain/sector content filtering, Schreibtraining redesign, sourced/audit-ready
   content pipeline), monetization (pricing page + plans, payment gateway), growth (FAQ + landing
   copy expansion, SEO, marketing campaign), and compliance (full GDPR compliance beyond the
   `/privacy` page). None scoped yet — see "Backlog — founder ideas" above for the full list; a
   future session should help prioritize and break these into phases.

_(Layer 1 ✅ · Layer 2 ✅ · Layer 3 ✅ · Content: all 10 themes ✅ · Security: 100% complete ✅)_
