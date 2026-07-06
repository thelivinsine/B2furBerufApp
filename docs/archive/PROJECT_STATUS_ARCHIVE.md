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

---

## Detailed session logs 25–46 (relocated 2026-07-05)

_Moved out of `docs/PROJECT_STATUS.md` to keep it lean. Locked design rules from these
sessions live in `CLAUDE.md` and `docs/DECISIONS.md`; this is the narrative record._

### Session 25 (2026-06-16) — Unique per-section icon colours + custom branded icons everywhere
- **Unique colour per route:** each navigation route now owns ONE unique accent colour (no more
  duplicates: Wortschatz, Quiz, Prüfungsmodus, Schnellwiederholung, Fortschritt, Einstellungen all
  had shared hues before). Defined once in `src/components/layout/nav-items.ts` (`color` + `bg`).
- **One icon per route, used everywhere (new):** custom branded SVG marks now live in
  `src/components/layout/route-icons.tsx` (`RouteIcon` + `MoreIcon`) — one hand-drawn mark per
  route on a 20×20 grid, in the route's accent colour with lighter layers from its own opacity.
  This single registry is the source for the bottom tab bar, the More sheet, AND the desktop
  `Sidebar`, so a section shows the same icon AND colour on every surface. Replaced the old setup
  where the bottom bar had custom SVGs for only 4 "hero" routes while everything else used lucide.
- Dashboard + the "Mehr" menu keep the brand indigo `#5b5be6` as the app/chrome anchor.
- `nav-items.ts` still carries a lucide `icon` per route; `RouteIcon` falls back to it for any
  route without a custom mark. Reference sheet: `preview/route-icons-preview.svg`.
- **Home/Mehr icon swap + richer context strip:** Home is now a house glyph (was the 2×2 grid),
  and the "Mehr" menu took over the 2×2 grid (the classic apps/more glyph). The bottom-bar context
  strip now shows the section name PLUS a short German subtitle (`desc` per `NavItem`) for context
  instead of just the name. The strip is one line taller, so the More sheet overlay/padding were
  nudged to keep clearance.
- **More sheet overlap fix:** the sheet's bottom padding equalled the bar height, so the last icon
  row's labels overlapped the bar's context strip. Bumped padding so the grid lifts clear.
- **Uniform icon optical size:** each mark was drawn freehand on the 20×20 grid with a different
  inked area (filled Quiz disc ~17px vs speech bubble ~13px), so they looked like different sizes.
  Added a `NORM` map + `normTransform` in `route-icons.tsx` that scales each mark's bounding box to
  a centred 16-unit target with a per-mark weight (so heavy filled shapes don't read larger). Tune
  sizes via that map. CLAUDE.md "Icon color rule" updated to match the new all-custom-SVG setup.
- `pnpm build` + `pnpm typecheck` + `pnpm lint:content` green. Shipped via PRs #178–#182.

### Session 26 (2026-06-16) — Bottom-bar context strip removed + More-sheet reorder & animations
- **Context strip removed:** the label/subtitle row above the bottom-bar icons was redundant (every
  section already shows its own title at the top of the page), so the bar is now a single 62px icon
  rail. The More sheet overlay `bottom` (→ `3.875rem`), its bottom padding (→ `5.75rem`), and the
  `.pb-nav` utility were all resized for the shorter bar. `NavItem.desc` is kept for reuse but no
  longer rendered in the bar. `getContextMeta` deleted from `BottomTabBar.tsx`.
- **Mehr selection fixed:** the Mehr tab now shows its selected pill + underline while the More sheet
  is open, and the pinned tabs drop their highlight so the selection clearly sits on Mehr.
  `AppShell` passes a new `moreOpen` prop into `BottomTabBar`.
- **Reorder inside the More sheet (new):** the sheet's edit-mode grid is now drag-sortable via a
  custom 2D grid sort in `MoreSheet.tsx` (`reorderDuringDrag` finds the tile under the pointer and
  splices the dragged path into its slot; `layout` animates the rest). Order persists in a new
  `useSettingsStore.moreOrder: string[]` (full route ordering; empty = `nav-items` order), kept in
  sync so pinned routes hold their slots.
- **Add/remove movement animation (new):** bar and sheet icons use framer `layout` +
  `AnimatePresence` (spring) so adding/removing an icon slides the rest into place instead of
  snapping.
- **Gesture change:** the old "drag a sheet icon down ~72px to add it to the bar" gesture was
  removed (free drag now reorders the grid); the green **+ badge** is the single add affordance.
- **Follow-up fixes (same session):** (1) the More sheet stayed open when tapping a bar tab (e.g.
  Home) because the bar sits below the sheet overlay (`modal={false}`); `AppShell` now closes the
  sheet + exits edit mode on any `location.pathname` change. (2) Bar rail height 62px → 70px and
  icons 29px → 32px (matched to the More sheet, also bumped 28px → 32px); overlay `bottom`, sheet
  padding, and `.pb-nav` re-tuned for the taller bar.
- **Follow-up fixes round 2 (same session):** (1) removed the edit-mode "Ziehen zum Sortieren …"
  instruction sentence. (2) Enter/exit on bar + sheet edit tiles is now opacity-only (no `scale`):
  animating a transform on a `layout`/Reorder element fought framer's projection and was freezing
  the jiggle until the next re-render (the "icons only jiggle after an add/remove" bug), and the
  scale pop was also shifting icons on long-press. Positions now stay put and the jiggle starts
  immediately. (3) The Mehr tab now toggles: tapping it while the sheet is open closes it (and exits
  edit mode) via `toggleMore` in `AppShell`.
- **Follow-up fixes round 3 (same session):** (1) scaled the whole mobile bottom nav down ~10% after
  it felt too big: rail 70px → **63px**, icons 32px → **29px** in both the bar and the More sheet,
  with overlay `bottom`, sheet padding, and `.pb-nav` re-tuned to match (PR #191). (2) Fixed an
  intermittent "design glitch" where the whole mobile view got stuck **scrolled sideways** (header
  logo gone, "Vokabeltrainer" clipped to "kabeltrainer", card text cut off on the left). The guard
  against horizontal scroll only lived on `<body>`, but the real scroll container is `<html>`, and
  Radix portals (Select/Dialog) mount at the end of `<body>` and can momentarily push the document
  sideways before Floating UI positions them, which iOS leaves stuck. Added `overflow-x: clip` +
  `overscroll-behavior-x: none` to `html` in `src/index.css` (`clip`, not `hidden`, so no scroll
  container is created and the sticky header is untouched) (PR #192).
- `pnpm build` + `pnpm lint:content` green. Branch `claude/context-bar-menu-animations-g9gfd3`.

### Session 27 (2026-06-16) — Full app audit + targeted fixes
- **Audit headline: the app is healthy.** `pnpm build`, `pnpm typecheck`, and `pnpm lint:content`
  all pass with zero errors (only the known ~159 provenance back-fill warnings). No crashes, broken
  routes, duplicate IDs, broken dialogue branches, missing content, or em dashes in user copy.
  Content counts all match (490 vocab, 396 collocations, 10 grammar topics/47 drills, 1073 provenance
  rows); consent version matches the legal `LAST_UPDATED` date.
- **Fixes applied:**
  - `dataExport.ts`: added the missing `.eq("user_id", user.id)` to the `writing_evaluations` query
    so it matches its sibling queries (RLS already enforced it; this is consistency + defense-in-depth).
  - Both Edge Functions (`evaluate-writing`, `delete-account`): added `Access-Control-Max-Age: 86400`
    so browsers cache the CORS preflight (fewer OPTIONS round-trips).
  - `ExamRunner.tsx`: gave the free-text answer input an `aria-label`.
  - `QuickRevision.tsx`: made the flip card keyboard-accessible (`role="button"`, `tabIndex`, Enter/Space).
  - `Flashcards.tsx`: a lapsed card ("Again", grade < 3) no longer earns the full review XP (it earned
    more than an "Easy" recall before). Successful recalls still reward effort (Good 6 > Easy 4).
  - `srs.ts`: the SM-2 ease factor now decreases on a lapse (it was only updated on success), so a
    repeatedly failed card loses ease and resurfaces sooner.
  - Guest sign-in is now gated behind a captcha token **when Turnstile is configured**
    (`VITE_TURNSTILE_SITE_KEY`): `useAuthStore.signInAsGuest` refuses without a token, and the writing
    flow (`writing.ts`) routes signed-out users through the captcha-gated auth UI instead of a silent
    guest creation. Dormant (no behavior change) until a site key is set, then closes the
    anonymous-signup AI-budget abuse vector.
- **Verified non-issues (not changed):** the MoreSheet `5.75rem` padding is intentional; the
  flashcard Easy(4) < Good(6) ordering is correct (effort-based). Dropped a planned "scoring 70%
  baseline" change after confirming `examSets.ts` has zero quality-scored options: that 70% is the
  intended exam participation credit, and real dialogues always carry quality options, so the default
  is never hit for them. Changing it would have wrongly dropped every exam score by ~28 points.
- `pnpm build` + `pnpm typecheck` + `pnpm lint:content` green. Branch `claude/app-audit-testing-bqrdkj`.

### Session 27 cont. — Navigation icon polish (SHIPPED)
A run of founder-driven nav-icon refinements, all in `route-icons.tsx` / `nav-items.ts` plus the
three icon surfaces (`BottomTabBar`, `MoreSheet`, `Sidebar`):
- **Audit fixes** also included an a11y pass and the SRS/XP/captcha/CORS fixes above (PR #194).
- **Removed the "Leiste voll" helper line** from the More sheet edit mode (PR #195).
- **More sheet closes on re-tapping the active tab:** it only closed via the `location.pathname`
  effect, but re-tapping the active tab doesn't change the route. Added `onNavigate`/`closeMore` so
  any bar tap closes the sheet (PR #196).
- **Full opacity everywhere:** removed the 38% inactive dimming so icons no longer read as blurred;
  active is shown by the backdrop/underline, not opacity (PR #197).
- **Optical-size re-tune (~5%):** bumped most `NORM` weights to reduce empty space, boosted the small
  marks (grammar/exam/analytics), kept large ones restrained, left the pencil unchanged; later bumped
  the home icon another +5% (PRs #198, #200).
- **Two-tone book → two-tone + neon for all icons:** the Wortschatz book first became two-tone indigo
  `#5b5be6` + cyan `#10b7cf` to match the F2 "Per-section Color" preview (PR #199). The founder then
  approved extending the two-tone treatment to **every** icon, each with a brighter **neon** second
  tone (proposal sheet `preview/route-icons-two-tone-neon.svg`).
- **Grey-gradient icon boxes:** the rounded pill/tile behind icons now uses a neutral grey gradient
  (`from-muted to-border`) instead of the section colour at low opacity, across the bar, Mehr pill,
  More-sheet tiles, and the sidebar active row. The `nav-items.ts` `bg` tint field is no longer used
  for backdrops. CLAUDE.md "Icon color rule" updated to capture the two-tone+neon + grey-box design.
- `pnpm build` + `pnpm typecheck` green throughout.

### Session 44 (2026-06-28) — Session-43 review, app-wide dark-mode fix, filter-harmonization plan ✅
A review + bugfix + planning session on branch `claude/review-previous-session-69pxat`. Three PRs
squash-merged to `main` (#250–#252).
- **Reviewed session 43** end to end (taxonomy Phases 3–4): build/typecheck/`lint:content` green,
  every new view implemented as documented and responsive. Fixed one latent mobile bug, the
  `FacetSheet` bottom sheet inherited `overflow-y-auto` on the whole container, so on a short viewport
  the "Apply" button could scroll away. Constrained the grid (`grid-rows-[auto_auto_minmax(0,1fr)_auto]`)
  so only the facet list scrolls and the footer stays pinned (**PR #250**).
- **App-wide dark-mode fix (#251).** Founder reported the Kollokationen filter pills rendering bright
  white in dark mode. Root cause: **Tailwind's opacity scale only contains multiples of 5, so any
  color utility using `/8` or `/12` silently failed to compile** (verified in the production CSS, zero
  rules emitted). Effects: `bg-white dark:bg-white/8` pills lost their dark override and fell back to
  white; every `/12` tint (badges, stat cards, header streak/level pills, exam/simulation/onboarding
  icon boxes, RelatedPanel chips) rendered with no background at all. Bumped all `/8` and `/12`
  color-opacity utilities to `/10` (34 utilities across 16 files); audited the whole `src` tree, those
  were the only non-multiple-of-5 steps in use, and no hardcoded light-only colors lack a dark variant.
  **Lesson for future work: only use opacity steps that are multiples of 5** (e.g. `/10`, `/15`), the
  build does not warn on invalid ones.
- **Filter-harmonization plan (#252, docs-only).** Founder flagged the search bar / filter button /
  filter options / theme + branche controls as chaotic and inconsistent across Wortschatz,
  Kollokationen, Redemittel, etc. Researched the codebase + `docs/plans/TAXONOMY_REDESIGN.md` + the uploaded
  learning-app playbook (`docs/reference/Language Learning App Success Factors.docx`) and wrote
  **`docs/plans/FILTER_HARMONIZATION_PLAN.md`**: one shared `Search + Theme + Filter` toolbar
  (`BrowseToolbar`) + the existing `FacetSheet` on every page, a single responsive panel for
  mobile+desktop, branded `HubHero` header everywhere, a shared `src/lib/cefr.ts` for consistent CEFR
  labels, and the verb-rail/legend decluttered into the sheet. Phased: Phase 1 = the 3 filtering pages,
  Phase 2 = the simpler hubs. **Implemented in session 45 (below).**
- **Historical pointer (as of session 46; superseded by the `## Resume here` section below) →** the
  **UX overhaul plan was fully approved and became the roadmap.** Start with Phase 0 (quick wins, Sonnet 5), then Phase 1 (session engine, Opus 4.8); see
  the phase/model table under "Model guidance". The older follow-ups (human-verify `cefr` tags, new
  life-domain themes) slot in after or alongside; new themes land best after Phase 3 (Bibliothek).

### Session 46 (2026-07-02) — Full app review + UX overhaul plan, APPROVED ✅ (docs-only)
Fable session. The founder asked for a critical review of the app and of the s44/s45 filter
harmonization, then a substantially better plan. **No app code changed; strategy + docs only.**
- **Full-app review:** all 13 routes screenshotted (mobile 390px + desktop 1280px) and read. Five
  headline problems: no composed session loop (the pieces exist but the learner must sequence them);
  home leads with a wall of choices instead of "continue"; redundant practice surfaces (3 flashcard/
  quiz experiences, 4 library nav slots); German UI carrying English content in load-bearing spots
  (all 11 theme blurbs, grammar purposes, "Quick Review"); progress reads as bookkeeping (four zero
  tiles on a new account, no Can-Do milestones). Sign-in banner sits on every screen.
- **Filter-plan critique (self-critical):** s45 harmonized the *reference* layer but polished the
  wrong layer; search stayed siloed per bank; scope (theme) resets per page; the relocated Verb facet
  became a 100+ pill soup; per-page facet wiring does not scale to the coming content packs.
- **`docs/plans/UX_OVERHAUL_PLAN.md` (new, the roadmap):** session-first redesign. Four-tier filter
  architecture (Tier 0 personalized defaults / Tier 1 global search across all banks / Tier 2
  travelling Scope (Domain → Theme → Sub-theme) as app state / Tier 3 refinement facets from a
  central registry, ≤12-option rule, Verb facet dropped). Four-zone IA: Heute (session hero) ·
  Bibliothek (4 libraries merged, s45 toolbars reused) · Anwenden (Simulation/Schreiben/Prüfung) ·
  Fortschritt (Can-Do milestones + diagnosis). New `engine/session.ts` composer + SessionPlayer
  reusing the existing SRS/quiz/drill machinery. Six phases with a prioritization framework.
- **All four Part-H decisions recorded (founder):** (1) IA direction approved; (2) tab-bar default
  pins approved after a plain-language walkthrough, mechanics stay locked; (3) German-first copy
  confirmed, the founder's "EN peek button" idea parked as **backlog #25** (needs brainstorming;
  Phase 0 keeps EN as data, so it stays possible); (4) Can-Do statements AI-drafted + founder-
  reviewed, provenance recipe checked against `DATA_GOVERNANCE.md` (origin `authored`, license
  `OWNED`, `draft` → `verified`, reference = CoE CEFR descriptors, same as writing prompts).
- **Model guidance refreshed:** Fable available again (restriction lifted), Sonnet bumped to 5, and
  a per-phase model table added for the overhaul plan (Phase 0 Sonnet → Phase 1 Opus → …).

### Session 45 (2026-06-29) — Filter harmonization IMPLEMENTED (Phase 1 + Phase 2) ✅
Implemented the full `docs/plans/FILTER_HARMONIZATION_PLAN.md` across both phases.
- **New shared pieces:**
  - **`src/lib/cefr.ts`** — single source of truth for the CEFR scale (`CEFR_ORDER`, `cefrLabel`,
    `difficultyToBand`). Replaced 4 duplicated `CEFR_ORDER` arrays (VocabularyTrainer,
    CollocationsBrowser, SubThemePicker, intentCards).
  - **`src/features/shared/BrowseToolbar.tsx`** — thin layout wrapper that fixes the position and
    styling of `[Search] [Primary Select] [FacetSheet trigger]` + active-chips row. Reuses the
    existing `FacetSheet` and `ActiveFilterChip`.
- **Phase 1 — three filtering pages:**
  - **VocabularyTrainer:** `SectionHeading` → `HubHero`, added free-text search (over de/en/related),
    theme dropdown + filter sheet via `BrowseToolbar`. SubThemePicker + tabs preserved below.
  - **CollocationsBrowser:** removed the verb-chip scroll/expand rail + the Neutral/Formal colour
    legend. **Verb filter moved into the FacetSheet** as a third facet (CEFR + Register + Verb), so it
    gains live counts, greyed dead-ends, and removable chips. Search persisted to URL (`?q=`). Quiz CTA
    moved to `BrowseToolbar` trailing slot.
  - **RedemittelTrainer:** `SectionHeading` → `HubHero`, added free-text search (over de/en), added
    **Kategorie primary dropdown** (`?cat=`) as the primary axis. Filter sheet kept (Register facet).
    Wendungen/Üben tabs preserved.
- **Phase 2 — non-filtering hubs:** QuizHub level labels now use `difficultyToBand()` from the shared
  module, producing consistent `B1 / B2.1 / B2.2·C1` labels. GrammarHub, ExamHub, SimulationHub already
  used `HubHero` and needed no changes.
- **Verification:** all three pages tested on mobile (390px) and desktop (1280px). Search narrows
  results and composes with facets. Filter sheets open with live counts. URL params round-trip. Dark mode
  correct (no new `bg-white` pills). `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green.

### Session 43 (2026-06-27) — Taxonomy redesign Phases 3–4 SHIPPED + dashboard restructure ✅
Completed the taxonomy redesign. All of Phase 3 and Phase 4 are live on `main` across nine squash-merged
PRs (#240–#248). The untagged-rolls-up invariant held throughout. Highlights (full detail in the taxonomy
section above):
- **Phase 3 — faceted browser, Work-mode facets, intent cards.** Mode-aware **intent cards** on the
  dashboard (#240); **register unification** + reusable **`FacetSheet`** (live counts, greyed dead-ends)
  wired into Kollokationen (#241); **care/Pflege sector back-fill** + first `office` tags, vocab 515→528
  (#242); FacetSheet in the Vokabeltrainer with CEFR + Wortart + Work-only **Branche** facet (#243);
  Redemittel **Register filter** (#245); **workSituation** tags + Work-only **Situation** facet (#246).
  `mode` now has a real content effect (filters intent cards, gates the Work facets).
- **Dashboard restructure (#244):** leads with the "Was möchtest du üben?" tiles; the big progress block
  collapsed to a compact strip (full stats already live on Fortschritt).
- **Phase 4 — cross-module linking + adaptive review.** Cross-module **"Verbunden" panel** on vocab words
  (#247); **mode/level-aware** Schnellwiederholung deck via pure `reviewWeight()` + weakest-CEFR-band
  detection, plus **filtered writing-coach deep-links** via `practiceRoute()` (#248).
- **Deliberate non-actions (documented):** `counterpart` left 0-tagged and Redemittel left without a
  `themeId` (both are general-purpose, so tags would be low-signal). `cefr` tags remain AI-draft pending
  human verification.
- `pnpm lint:content` + `pnpm build` green on every PR; branch realigned to `main` after each squash-merge.

### Session 42 (2026-06-27) — Taxonomy redesign Phases 0–2 IMPLEMENTED & SHIPPED ✅
First build session on the approved `docs/plans/TAXONOMY_IMPLEMENTATION_PLAN.md`. Phases 0, 1 and 2 are now
live on `main` across three squash-merged PRs. Untagged-rolls-up invariant held throughout, so nothing
regressed.
- **Phase 0 — foundations (PR #233, then completed in #234):** new faceted types in
  `src/types/index.ts` (`DomainId`, `LearningMode`, `ContextTag`, `ContentCefr`, `Frequency`,
  `WorkSector`, `Counterpart`, `WorkSituation`, `TaskType`, `SubThemeId`, `SubTheme`); `domains.ts`
  registry (6 domains) + `domainById`; all 11 themes given `domain` + `context`; `mode: LearningMode`
  (default `"both"`) added to `useSettingsStore` (rides cloudSync automatically). Optional facet fields
  added to `ExamTheme`/`VocabItem`/`Collocation`/`RedemittelPhrase` (all optional → existing content
  stays valid). Linter got mirror arrays + validate-when-present checks for every new enum. #234 closed
  the Phase-0 checklist tail: `ExamTheme.subThemes?`, `SubThemeId` alias, and wired
  `workSituation?`/`taskType?` as real validated facets (peers of `sector`/`counterpart`).
- **Phase 1 — levels + Mode picker (PR #233):** all **515 vocab + 396 collocations tagged with `cefr`**
  (AI-drafted; **human-verify still pending** via provenance `draft→verified`). Onboarding gained a
  **Mode step** (Beruf/Alltag/Beides, 4→5 steps). New **`ModeSwitcher`** pill in the app header
  (persists `mode`; currently a saved setting with no content effect yet — re-weighting is Phase 3).
  **CEFR Level filter** added to `VocabularyTrainer` (`?cefr=`, shareable). Quiz `Difficulty 1|2|3`
  relabelled to CEFR bands (B1 / B2.1 / B2.2·C1) in `QuizHub`/`QuizRunner` (numeric kept internally for
  question-type selection).
- **Phase 2 — sub-themes (PR #235, SHA `59b9e62`):** `behoerde` (4), `customer` (3) and `meetings` (3)
  split into sub-topics derived from their `situations[]`. **122 vocab + 105 collocations tagged with
  `subThemeId`**; cross-cutting items (soft-skill adjectives, connectors, generic "Behörde") left
  untagged on purpose. New **`SubThemePicker`** drill-down (per-sub count + CEFR span, plus a dashed
  "Gesamtes Thema" escape hatch that includes untagged items). `VocabularyTrainer` gained `?sub=` +
  breadcrumb + sub-aware filtering/counts; helpers `vocabBySubTheme`/`collocationsBySubTheme` and a `sub`
  option on `filterVocab`. Linter now cross-validates every `subThemeId` is declared on its theme. Counts
  reconcile: behoerde 24+1, customer 45+5, meetings 53+1.
- **Phase 3a — mode-aware intent cards (session 43):** the dashboard now opens with a **"Was möchtest
  du üben?" row of starting-point cards** (`src/features/dashboard/intentCards.ts` + `Dashboard.tsx`).
  Each card carries a pre-built filter bundle and deep-links into the matching browser view (e.g.
  `behoerde.meldewesen`, `meetings.beitrag`, `customer.beratung`, `/redemittel`, `/writing`).
  `intentCardsForMode(mode)` filters by the active lens (a `both` card or `both` mode always shows, so
  the screen never empties); word counts + CEFR ranges are computed live from `filterVocab`. **This is
  the first place `mode` actually changes what the learner sees.**
- **Phase 3b — register unification + faceted filter (session 43):** `Collocation.register` widened to
  `neutral|formal|diplomatic` (linter `COLLOCATION_REGISTERS` + card badge updated). New reusable
  **`src/features/shared/FacetSheet.tsx`**: a "Filter" chip opens a slide-up sheet (reusing `dialog.tsx`,
  overridden to a bottom sheet) whose multi-select option pills show **live counts** and **grey out
  zero-yield values**, so you can't tap into an empty screen (AND-across-facets / OR-within-facet;
  `matchesFacets`/`applyFacets`/`activeFacetCount` exported). Generic over item type. **Wired into the
  CollocationsBrowser first** (CEFR + Register facets, state in `?cefr=`/`?register=`, removable
  active-filter chips in the bar). Collocations had no level/register filtering before, so this is pure
  new capability and the lowest-risk proving ground.
- **Sector back-fill (session 43, PR #242):** authored a **13-word care/Pflege pack** (`die Schicht`,
  `die Übergabe`, `die Hygiene`, `der Angehörige`, `die Fallbesprechung`, `die Pflegedokumentation`, …)
  spread across existing themes (scheduling/safety/customer/conflict/meetings/technology) so the
  orthogonal `sector` facet genuinely cuts across topics, plus a curated set of `office` tags
  (Besprechung/Protokoll/Sitzung/Beschluss/Frist/Deadline/…). Vocab 515→528; matching provenance rows.
  This unblocked the Work-mode facets. Honest first pass, not exhaustive (sector rolls up).
- **Phase 3c — vocab faceted filter + Work-mode sector facet (session 43):** `FacetSheet` wired into the
  **VocabularyTrainer**, replacing the old standalone CEFR `Select`. Facets: **CEFR + Wortart** always,
  plus the **`sector` ("Branche") facet shown only when the Mode lens is `work`** (`facets` is derived
  from `learningMode`). State in `?cefr=`/`?pos=`/`?sector=` (multi-select), removable active-filter
  chips in the bar. The theme `Select` + sub-theme drill-down are untouched; facets apply on top of the
  theme/sub scope. So **switching to Work mode now reveals the Pflege/Büro sector filter** — the
  Work-mode facets are functional end to end.
- **Verification each phase:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green. Sandbox
  can't reach the live `*.github.io` site; founder confirms the deployed result.
- **Redemittel Register filter (session 43):** the Redemittel browse view gained a `FacetSheet` **Register
  filter** (neutral/formell/diplomatisch, present 38/29/5); categories with no matches are hidden. State
  in `?register=`.
- **Dashboard restructure (session 43, PR #244):** the dashboard now **leads with the "Was möchtest du
  üben?" intent tiles**. Removed the big focal hero + four-stat status strip + level bar (all already on
  the Fortschritt page) and replaced them with **one compact summary strip** below the tiles (streak ·
  today XP/goal · days-to-exam · recommended action · "Fortschritt" link). Mode pill untouched.
- **workSituation facet (session 43):** tagged a cross-cutting set of vocab (`shift-handover` for the
  care shift words, `instructions` for safety/hygiene, `meeting`, `customer-call`) and exposed it as a
  **2nd Work-mode facet "Situation"** in the Vokabeltrainer (next to "Branche"); both appear only in Work
  mode. `counterpart` left 0-tagged on purpose (redemittel are general-purpose → low-signal).
- **Phase 4 step 1 — cross-module "Verbunden" panel (session 43):** `src/features/vocabulary/RelatedPanel.tsx`.
  In the Vokabeltrainer **Übersicht** list, each word now expands ("Verbunden") to show matching content
  from the other banks via the shared `themeId`/`subThemeId` join key: a **Kollokation** (same sub-theme
  if available → `/collocations?theme=`), the theme's **Schreibtraining** prompt (→ `/writing?theme=`),
  and a **Dialog** (→ `/simulation`). No hand-kept id lists. Redemittel aren't linked (no `themeId`).
- **Phase 4 steps 2 + 3 (session 43):** **(2) mode/level-aware review** — `reviewWeight()` in
  `src/engine/srs.ts` (pure) + `QuickRevision` now build the Schnellwiederholung deck weighted by the Mode
  lens (theme `context`), card weakness, and the learner's weakest CEFR band (weighted selection, never a
  wall). **(3) writing-coach deep-links** — `practiceRoute()` in `practiceAreas.ts` folds the writing
  prompt's `theme` into the "Üben" deep-link so it opens a filtered drill set (theme-aware `/vocabulary`/
  `/collocations`/`/quiz`; formal Redemittel for the register weakness). **Phase 4 is complete.**
- **Historical pointer (as of session 43; see the `## Resume here` section below for current next steps) →**
  the **taxonomy redesign (Phases 0–4) is fully shipped.** Optional follow-ups: human-verify
  the AI-drafted `cefr` tags (provenance `draft→verified`), broaden `sector`/`workSituation` tagging, extend
  sub-themes past 3 of 11, and (if wanted) give Redemittel a `themeId`/`counterpart` pass to unlock more
  cross-links. Otherwise the next big rock is a **new life-domain theme** (banking / healthcare / housing)
  per the product scope.

### Session 41 (2026-06-26) — Taxonomy & filtering redesign: research deck + Mode layer + implementation plan (docs-only, MERGED ✅)
A research + strategy + planning session. **No app code changed; documentation/artifacts only.** Scopes
backlog **#5** (domain/sector-based filtering) plus the founder's new Work/Personal/Both idea.
- **Strategy deck authored** in two forms: `docs/plans/TAXONOMY_REDESIGN.md` (detailed technical version) and
  `docs/reference/TAXONOMY_REDESIGN.pptx` (**37-slide** plain-language deck for the non-technical founder, built
  programmatically with python-pptx). Recommends a **faceted model** (mix-and-match labels) over the
  current flat single-axis list, with a shallow **Domain → Theme → Sub-theme** hierarchy and orthogonal
  facets (cefr, register, pos, frequency, exam tag).
- **Diagnosis grounded in the codebase:** the app today runs three incompatible taxonomies (themes for
  vocab/collocations, communicative function for Redemittel, grammar groups for grammar), has **no
  CEFR/level field on any content** (only quiz `difficulty: 1|2|3`, unsurfaced), and filters via a
  single theme `Select` in `VocabularyTrainer.tsx`.
- **Work/Personal/Both "Mode" layer added** (founder's idea, session iteration): a top-level lens set at
  onboarding that scopes the tree and unlocks work-only facets (**sector, workplace situation,
  counterpart, task type**). Designed as a **lens, not a wall** (never hides content). Grounded in real
  web research: telc/BAMF *Rahmencurriculum für den Beruf* (fields of action + counterpart), **DeuFöV**
  state courses splitting job German by sector (care/technical/commercial), telc *Deutsch Pflege* exam,
  and Babbel/Duolingo goal-based onboarding. Sources listed on the deck's References slides.
- **8 UI mockups** built in `preview/taxonomy/` (HTML matching the app's brand tokens, screenshotted with
  the bundled Chromium): before/after vocab browser, sub-topic drill-down, goal-first home,
  connected-word detail, advanced filter sheet, **Mode picker**, **Work-mode browser**.
- **Approved implementation plan** written to `docs/plans/TAXONOMY_IMPLEMENTATION_PLAN.md`: Phases 0–4
  (0 = types + store `mode` + linter foundations, invisible; 1 = CEFR levels + onboarding Mode picker +
  header switch + Level filter = first shippable milestone; 2 = sub-themes; 3 = faceted browser +
  work-mode facets + goal cards; 4 = cross-module links + adaptive review). Reuses the existing settings
  store (`goal`/`level` already there, cloudSync auto-syncs new keys), the linter's mirror-array pattern,
  the onboarding `SelectRow`, and the provenance draft→verify workflow. **Decisions locked:** full
  5-phase plan; `mode` is a NEW axis separate from the existing `goal` (exam/work/fluency).
- **Shipped via PR #231** (squash-merged to `main`, merge SHA `6fe25c7`): all of the above docs +
  mockups. Post-merge realignment done (branch reset to `origin/main`, force-with-lease). **Nothing is
  implemented yet** — Phase 0–1 is the recommended next build step.

---

## Appended in session 70 (2026-07-06): older handoffs + accumulated ops notes

_Moved out of `docs/PROJECT_STATUS.md` when it was split for token efficiency. Contains the
accumulated deploy/ops notes and every session handoff older than the two most recent (sessions
9 through 67). The two newest handoffs stay in the living status doc._

### Deploy / ops notes (accumulated)

- `main` is production; merging triggers `pages.yml`. Develop on the automation branch assigned for
  the session (reassigned each session; `main` is always the source of truth); ship via squash-merge
  PR. **Always verify `pnpm build` green before merging.**
- Sandbox cannot reach `api.supabase.com` or `db.*.supabase.co:5432` — CLI migrations and function
  deploys must be done by the founder (dashboard SQL editor + dashboard function code editor work
  fine as alternatives).
- Edge Function deployment via dashboard: create function → dashboard pre-fills boilerplate →
  **select-all-delete first**, then paste code → Deploy.
- Email magic-links on Supabase free plan are rate-limited (~2/hour). Fix: add Resend (free tier)
  as custom SMTP in Auth → SMTP settings. Guest sign-in has no such limit and is the primary path.

### Email+password / Google auth (branch `claude/loving-cray-lMLj3`)
See the "REQUIRES two Supabase dashboard settings" note below — sign-up needs **"Confirm email"
OFF** to be instant, and the Google button needs the **Google provider** configured.

### Landing page + visible auth (branch `claude/loving-cray-lMLj3`)
- **Why:** auth was fully built but invisible (Settings-only, no login UI), so it "seemed not in
  place." Founder asked for a real marketing landing page with top-right Login / Sign-up, guest
  use still allowed, and an active nudge to save progress.
- **What shipped (all client-side, passwordless magic-link backend already live):**
  - `features/landing/LandingPage.tsx` — hero + feature grid + closing CTA; top-right
    `Anmelden` (login) and `Kostenlos starten`. Redirects onboarded users to `/`.
  - **Routing:** `/welcome` now = LandingPage; onboarding moved to `/start`. `RequireOnboarding`
    still redirects un-onboarded users to `/welcome`.
  - `features/auth/AuthDialog.tsx` — reusable sign-up/login modal (email magic-link; links email
    to an existing guest uid to preserve progress). Used by landing + nudge.
  - `features/auth/SaveProgressBanner.tsx` — dismissible in-app nudge (shown to guests /
    signed-out) inviting sign-in; wired into `AppShell` above the page outlet.
  - Existing `AccountPanel` in Settings reworked to reuse `AuthDialog` (email+password / Google).
  - **Auth method = classic email + password** (`signUp`/`signInWithPassword`) plus **Google OAuth**
    — chosen over magic-link because the founder disliked the email round-trip and the generic
    Supabase email. `AuthDialog` has email+password fields, a sign-up/login toggle, friendly German
    error copy, and a "Weiter mit Google" button. Guest→account upgrade uses `updateUser` to attach
    email+password to the same uid (progress preserved).
  - `npm run build` green.
  - **⚠️ REQUIRES two Supabase dashboard settings (founder, non-technical click-paths):**
    1. **Disable "Confirm email"** so sign-up logs in instantly with no email round-trip:
       Supabase dashboard → Authentication → Providers → **Email** → turn **"Confirm email" OFF** → Save.
       (Trade-off: users can sign up with an unverified email — fine for a free progress-sync app.)
    2. **(Optional, for the Google button) enable Google provider:** Authentication → Providers →
       **Google** → ON, paste a Google OAuth Client ID + Secret from Google Cloud Console
       (APIs & Services → Credentials → OAuth client → Web), with the Supabase callback URL as the
       authorized redirect. Until this is done the "Weiter mit Google" button will error.

### UX polish — Quiz answer-reflect flow (PR #14, pending merge)
- **Problem:** `VocabQuiz` and `RedemittelPractice` auto-advanced to the next question after
  selecting an answer (900ms / 700–1100ms timeouts), giving no time to reflect.
- **Fix (branch `claude/loving-cray-lMLj3`, PR #14):**
  - Removed all `setTimeout` auto-advances from both components.
  - After selecting an answer the question stays on screen with instant colour feedback.
  - A `Weiter` / `Quiz beenden` button appears, plus a "tap anywhere" affordance (taps on
    interactive controls are ignored to avoid double-advance).
  - `VocabQuiz` feedback panel also shows the word's translation and an example sentence.
  - `RedemittelPractice`: split `advance()` into `recordResult()` + `next()`; the parent
    now owns the single `Weiter` button for all three task types (choose / construct / respond);
    the `RespondTask` inner advance button was removed.
  - All other quiz surfaces (`QuizRunner`, grammar drills, flashcards, quick revision)
    already required explicit action — so the whole app is now consistent.
  - `npm run build` passes. Deploy pending founder squash-merge of PR #14.



### Older session logs (archived)

Detailed session-by-session logs for **sessions 4–46** now live in
`docs/archive/PROJECT_STATUS_ARCHIVE.md`, to keep this file navigable. The condensed handoff history is
still in the “Resume here” section below; git history and `docs/SESSION_PROMPT_LOG.md` remain the
authoritative full record.


### Older "Resume here" handoffs (sessions 9–67)

**Handoff after session 67 (2026-07-05). UX redesign Phase 4 "The Depth" is SCOPED and task 4.1 is
SHIPPED ✅ (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What happened:
- **Phase 4 task table drafted** at Phase-3 granularity (6 tasks): 4.1 typed-recall grading engine
  (Fable), 4.2 typing block wired into the composer + SessionPlayer (Opus), 4.3 Lesen/Hören content
  bank `src/data/texts.ts` (Fable), 4.4 reading/listening composer block + renderer (Opus), 4.5
  per-theme progression chip (Sonnet), 4.6 gates/ship (Haiku). Suggested split: **Session A = 4.1+4.2**
  (ships standalone; the audit's "if only one thing ships" item and reused by game-plan G1), **Session
  B = 4.3+4.4**, **short Session C = 4.5+4.6**.
- **Task 4.1 executed and merged (PR #316, `8bbe1d6`).** New pure `src/engine/typing.ts`:
  `gradeTyped(typed, expected)` → `{ verdict: "correct"|"almost"|"wrong", reason? }`. Design (all in the
  module header): three tiers map onto the FSRS `Grade` scale for 4.2 (correct→Good, almost→Hard,
  wrong→Again, so near-misses stop feeding the scheduler false evidence); alternate umlaut/ß spellings
  fold to digraphs on BOTH sides (fully correct, but Bär/Bar stay distinct); spacing + hyphenation
  interchangeable; article and reflexive "sich" graded **separately** from the head word (wrong/missing
  lead with a correct head is "almost", carrying `reason: "article"|"reflexive"`, never a pass or a
  fail); typo tolerance tighter than the spoken matcher (0 edits ≤3 letters, 1 to 9, 2 from 10) and a
  within-tolerance slip is "almost" not "correct"; **no containment credit** (unlike `matchesSpoken`).
  `engine/pronounce.ts` exports `levenshtein` for reuse (behavior unchanged). 18 new cases in
  `tests/typing.test.ts` including a contrast test vs `matchesSpoken` containment.
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings), `lint:content`,
  `test:unit` **56**, `test:pronounce` 26, `check:bundle` main chunk **78.9 kB** (`typing.ts` has NO
  consumer yet, so it is not on any import path; wiring is task 4.2).

**Next step (founder decision pending):** continue **Phase 4 Session A** by executing **task 4.2**
(new `kind: "typing"` composer block + SessionPlayer renderer, graduation rule so only stable cards get
typed recall, latency + verdict into `reviewVocab`), OR pivot to **game plan G1** (`GAME_IMPLEMENTATION_PLAN.md`,
still PROPOSED; its G0 prerequisite — redesign Phases 1–3 — is now fully shipped, and 4.1's tolerant
grading is exactly what G1's formCloze / dialogue-battle scenes need). The recommendation stands: finish
4.2 first so typed recall reaches the default loop and de-risks G1.

---

**Handoff after session 66 (2026-07-05). UX redesign Phase 3 "The World Seed" is COMPLETE ✅
(tasks 3.3–3.6, plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **3.3 Fortschritt quest board (`src/features/analytics/Analytics.tsx`).** New headline order:
  `<CityStrip/>` (reused directly, no re-lazy-loading — Analytics is already a lazy route per the
  CLAUDE.md exception), a **next-quest card** (the not-yet-achieved `canDo.ts` milestone with the
  smallest `threshold - ratio` gap, so it always points at the nearest win; a progress bar + "Quest
  üben" CTA into `/session?theme=<theme>`; an all-done state once every milestone is achieved), and a
  **"Meine Sammlung" entry card** (collected-word count, navigates to `/sammlung`). The full Can-Do
  checklist, the weakest-spot diagnose card, top stats, XP/level bar, writing weaknesses and exam
  history stay visible below. The XP 30-day chart, per-theme mastery grid, vocab-mastery distribution
  chart and the activity calendar are collapsed into a single "Details" disclosure (plain button +
  `ChevronDown`, no new dependency) gated on a new **`useSettingsStore.progressDetailsExpanded`**
  boolean (default `false`, persisted, no version bump needed since it's an additive key).
- **3.4 „Meine Sammlung" (`src/features/collection/Sammlung.tsx`, new; route `/sammlung`).** The bag
  view of the stored-value loop: every vocabulary word that is either bookmarked (`savedWords`) or has
  `cardLevel(srs[id]) >= 1` (`engine/collection.ts`, unchanged) shows as a card with a `Lv n` badge
  (levels 1–5) and the existing bookmark toggle; a level filter (Alle/Lv5…Lv1) plus `usePagedList`
  windowing reused from the Vokabeltrainer pattern. Off the nav — reached only via the Fortschritt
  entry card, the same "deep link only" pattern as the retired `/quiz` — so the locked bottom-bar
  nav (`nav-items.ts`, pinned tabs, More sheet) was **not touched**. Lazy route (walks the vocabulary
  bank, matching every other content-bank consumer).
- **3.5 Bibliothek presentation pass (styling only).** In `VocabList.tsx`, `CollocationsBrowser.tsx`
  and `RedemittelTrainer.tsx`'s row cards: the lead German word/phrase (`v.de`/`c.full`/`p.de`) bumped
  from a bare `font-semibold` to `text-base font-semibold sm:text-lg`; the English gloss (plus plural,
  or plus the Redemittel `note`) demoted from two separate lines to one quiet `text-xs
  text-muted-foreground` line. Structure, facets, search and the toolbar are byte-for-byte unchanged.
- **Gates.** All green: `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings, unchanged),
  `lint:content`, `test:unit` (38, unchanged — no new engine logic to pin), `test:srs` (323),
  `check:bundle` (main chunk **78.9 kB**; `Sammlung` and `Analytics` both land in their own lazy
  chunks, ~3.2 kB and ~22 kB respectively).

**Next step: Phase 4 "The Depth"** (typed forward-recall, authentic Lesen/Hören) is not yet scoped
into tasks — the next planning session should turn `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`'s Phase 4
sketch into a task table like Phase 3's, or re-check with the founder on priority against the
`docs/plans/GAME_IMPLEMENTATION_PLAN.md` (still PROPOSED, sequenced after redesign Phases 1–3, now all
shipped).

---

**Earlier handoff after session 65 (2026-07-05). UX redesign Phase 3 task 3.1 is EXECUTED ✅ (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **3.1 Domain buildings (`src/components/city/domain-buildings.tsx`, new).** Six flat SVG buildings in
  the established two-tone + neon mark style (base accent + hard-coded neon second tone, 20×20 grid):
  Büro (indigo tower, cyan annex), Bürgeramt (slate colonnade, amber pediment), Bank (sky block, cyan
  cornice, coin-ring emblem), Arztpraxis (rose clinic, glowing cross sign), Wohnhaus (teal house, neon
  roof), Prüfungshalle (fuchsia dome hall, neon entablature). Each mark has a **lit** state (bright
  white windows/emblems) and an **unlit** state (the same openings as dark shades, "lights off").
  The founder tried and REJECTED gold windows, so **no reward-gold in these marks**; the reward tokens
  stay reserved for loot/combo moments. Marks are
  normalised like route icons but to a **common ground line** (`groundTransform`), so a city strip gets
  a shared street level with a varied skyline (deliberate). After founder review, a **soft-corner pass**
  landed: every rect carries an `rx` and the pointed shapes (pediment, roofs, dome base) are rounded via
  a same-color stroke with `strokeLinejoin="round"`; don't add sharp-cornered shapes to these marks.
- **Registry for 3.2.** `DOMAIN_BUILDINGS` carries per building: German `label`, base `color`, and the
  mastery sources that will light it: `domains` (buero → beruf+arbeitswelt, arztpraxis → gesundheit,
  pruefungshalle → pruefung+bildung) and/or `themeIds` (buergeramt → behoerde, more precise than the
  whole alltag domain). **bank and wohnhaus are intentionally empty**: they are the future banking and
  housing packs and stay unlit until that content exists. A unit test pins that no domain or theme
  lights two buildings.
- **Tests + review sheet.** `tests/domain-buildings.test.tsx` (registry integrity, 20-unit grid render,
  reward gold appears only when lit; test:unit now 33). Founder review sheet:
  `preview/domain-buildings-preview.svg` (light/dark × unlit/lit), regenerate via
  `node preview/gen-domain-buildings-preview.mjs`; the TSX is the geometry source of truth.
- **Gates.** All green: `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings), `lint:content`,
  `test:unit` (33), `check:bundle` (78.2 kB, module not yet on the eager path since nothing imports it
  until 3.2).

**Update (same session, part 2): task 3.2 city strip is EXECUTED ✅ and the 3.1 marks were
founder-tuned twice.** What changed on top of the part-1 handoff below:
- **Founder round 1 (soft corners):** every rect in the building marks carries an `rx`; pointed shapes
  (pediment, roofs, dome base) are rounded via same-color strokes with `strokeLinejoin="round"`;
  bodies tuck under wider bands so rounded corners leave no seam notches. Rule in the module header:
  soft corners only, no new sharp shapes.
- **Founder round 2 (NO gold windows):** the gold-window lit state was REJECTED. Lit = the bright
  white-window look; unlit = the same openings as dark shades (`#0c1222`, "lights off"). Reward-gold
  is fully out of the building marks; the token reservation comments in `index.css`,
  `tailwind.config.ts` and CLAUDE.md now read "loot / combo moments" and note the rejection. The unit
  test pins: dark openings only when unlit, no reward token in either state.
- **3.2 City strip on Heute.** New `src/components/city/mastery.ts`: pure `cityProgress(srs)` resolves
  each building's themes (explicit `themeIds` claim first, then domain rollup, no double counting),
  counts mastered words (same ≥0.8 bar as Analytics/composer), and lights a building at
  `LIT_THRESHOLD = 0.4` mastered share. `weakestTheme` per building = its least-mastered theme. New
  `CityStrip.tsx` renders the six buildings ground-aligned on a street line (border-b) in a `bg-surface`
  card as Heute element 4 (no header, no copy; aria-labels only); tapping a building with content starts
  `/session?theme=<weakestTheme>`; the future packs (bank, wohnhaus) stay unlit and inert.
  **Bundle lesson:** a static import chain Dashboard → mastery → vocabulary ballooned the main chunk
  78 → 330 kB (Phase 1 had removed vocabulary from the eager path). Fix: `CityStrip` is `React.lazy`
  behind a fixed-height Suspense fallback; main chunk back to **78.6 kB**, strip in its own ~7 kB chunk.
  CLAUDE.md's eager-path rule was rewritten to match reality (Dashboard imports NO content bank; new
  bank-dependent Dashboard elements go in lazy chunks). 5 new Vitest cases in `tests/city-mastery.test.ts`
  (fresh profile unlit, no double counting, future packs inert, behoerde lights Bürgeramt at threshold
  without leaking, weakest-theme pick); test:unit **38**. Verified on the dev server (seeded profile,
  headless Chromium screenshots at mobile width).

**Next step: redesign Phase 3 tasks 3.3–3.6** (Sonnet/Haiku tier): Fortschritt led by the city view +
Can-Do quest card with charts behind "Details" (3.3), „Meine Sammlung" bag view on
`engine/collection.ts` (3.4), Bibliothek presentation pass (3.5), gates + ship watching `check:bundle`
(3.6).

---

**Earlier handoff after session 64 (2026-07-05, part 2). UX redesign Phase 2 "The Stage" is EXECUTED ✅ on the
session branch (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **2.1 Focus mode (`AppShell.tsx` + `useSessionStore`).** New transient `focusMode` flag: the
  SessionPlayer sets it true while a block is on screen (via `useLayoutEffect`, so no chrome flash) and
  false on the end/empty screen and on unmount. AppShell hides the header, bottom bar and sidebar when
  `focusMode && pathname ∈ {/session, /revision}`, so the session plays full-screen. The locked bottom-bar
  internals (s26-29, iOS `translateZ`/`no-callout` fixes) are untouched, just not mounted in focus mode.
- **2.2 SessionPlayer focus refactor.** One block per screen on a min-h-screen stage: a top rail (✕ exit
  with a confirm overlay using the locked `bg-dialog-overlay` token, thin progress bar, combo/XP),
  centered block with horizontal slide transitions, display-size German (flashcard/speaking bumped to
  `text-3xl sm:text-4xl`). The 26a latency signal is preserved: `captureLoot` still threads `latencyMs`
  into `reviewVocab` for flashcard/quiz/speaking.
- **2.3 Combo counter + reward-gold tokens.** Consecutive-correct `combo` (resets on a miss); a gold pulse
  pill appears at ≥3 (framer `key={combo}` spring). New `--reward`/`--reward-bg` HSL tokens (index.css,
  both themes) + Tailwind `reward`/`reward-bg`, reserved for loot / combo / lit buildings.
- **2.4 `engine/collection.ts` + unit test.** Pure `cardLevel(card)` maps FSRS stability (legacy interval
  fallback) to Lv 0-5 via fixed day bands [1,7,21,60]; `leveledUp(before, after)` compares. 5 new Vitest
  cases in `tests/collection.test.ts` pin the boundaries. This is the **stable game contract**; do not drift
  the bands.
- **2.5 Loot-drop end screen.** A `RewardRing` (animated gold conic-equivalent SVG ring filling to the daily
  goal %), reviewed words as `LootCard`s showing `Lv n` and an ↑ on cards that leveled this session
  (captured via before/after `cardLevel` around each synchronous `reviewVocab`), and the kept "Morgen: X
  festigen" forward hook. Chrome returns here (focus flag cleared).
- **Gates.** All green: `build`, `typecheck`, `lint` (0 errors / 31 baseline warnings), `lint:content`,
  `test:unit` (**28**, +5 collection), `check:bundle` (main chunk **78.2 kB**), `test:srs` (323). Self-review
  clean; no locked files' internals touched.

**Next step: redesign Phase 3 "The World Seed"** (six Fable-designed SVG domain buildings, city strip on
Heute, Fortschritt quest cards, „Meine Sammlung" bag view reusing `engine/collection.ts`). Task 3.1 (the SVG
buildings) is the Fable-tier illustration task; the rest is Sonnet-tier presentational wiring. Watch
`check:bundle` as SVGs + new views land.

---

**Earlier handoff after session 64 (2026-07-05, part 1). UX redesign Phase 1 "The Diet" is EXECUTED ✅ and
merged to `main` (PR #305, squash `3a044a5`; plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **1.1 Pedagogy defaults ON (`src/store/useSettingsStore.ts`).** `voiceVariety` and
  `recognitionEnabled` now default `true`. Persist config bumped **v1 → v2** with a migrate that flips
  a persisted `false → true` for existing users (both switches were default-off and effectively inert,
  so `false` was the old default, not an opt-out; a value already `true` is never touched). STT support
  stays enforced downstream by `recognitionEnabled && recognitionSupported()` with a typed fallback, so
  the store default is safe on unsupported browsers.
- **1.2 Heute slimmed to 3 elements (`src/features/dashboard/Dashboard.tsx`).** A pure CSS conic
  **goal ring** (streak flame + count in the center, greeting + XP/% beside it), one **gradient Start
  button** ("~N Min · X fällig", the only gradient on the screen), and an **icon-first Situationen chip
  row** (no header, no description). The old stats-strip card and Bibliothek link card are gone; the
  eager path is lighter (dropped the `sessionPreview` import). `/revision` lost its only UI link but
  stays a live route.
- **1.3 Onboarding → one screen + taster (`src/features/onboarding/Onboarding.tsx`).** Five steps
  collapsed to a single setup card: a 2×2 "Wofür lernst du Deutsch?" tile (Beruf/Alltag/Prüfung/Beides,
  each sets goal **and** mode), a CEFR chip row, the consent checkbox (recorded via `recordConsent()`
  **before** `completeOnboarding`, `CONSENT_VERSION` untouched), then a straight `navigate("/session?min=1")`
  into a ~90s composed taster (the composer clamps to a 6-block minimum). Name/exam-date/rhythm are
  dropped from onboarding and default in the store, to be collected contextually later.
- **1.4 `<Gloss>` component (`src/features/shared/Gloss.tsx`).** Tap toggles DE↔EN per tap (no
  persistence), dotted-underline affordance, `stopPropagation` so it works inside the tappable
  flashcard. Wired into the two SessionPlayer renderers with a real DE/EN pair: the flashcard reveal
  (`initial="en"`) and the speaking answer. Quiz/grammar prompts are deliberately NOT glossed (that
  would defeat the exercise).
- **1.5 Microcopy sweep + CLAUDE.md rule.** Deleted the section-description sentence on 11 hub/page
  headers (Analytics, Writing, Simulation, Settings, Redemittel, Quiz, Kollokationen, Grammatik,
  Anwenden, Vokabeltrainer, Prüfung); `EmptyState`/form/session-preview strings kept. Added the
  **microcopy budget** rule to `CLAUDE.md` (eyebrow ≤ 2 words, title ≤ 5 words, no header subtitle).
- **1.6 Gates.** All green: `pnpm build`, `typecheck`, `lint:content`, `test:unit` (23), `check:bundle`
  (main chunk **77.9 kB**, budget 400), `lint` (0 errors, 31 baseline warnings). Self-review found no
  correctness bugs; no locked files touched (bottom bar, dialog tokens, consent flow all intact).

**Next step: redesign Phase 2 "The Stage"** (focus-mode `/session`, combo counter + reward-gold
tokens, loot-drop end screen + `engine/collection.ts` Lv mapping with a unit test). Opus-tier for the
AppShell chrome-hiding (adjacent to the locked bottom bar) and the SessionPlayer refactor.

---

**Earlier handoff after session 63 (2026-07-05). Phase-wise implementation plan for the UX redesign
WRITTEN and shipped: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`.** The founder asked for a
robust phase-wise plan built from the two latest redesign reports
(`docs/reference/GENAULY_UX_UI_ANALYSIS.md`, PR #300, and
`docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`, PR #301), with a Claude model recommendation for each
task and a brief non-technical summary per phase. The new doc is the execution layer on top of the
session-61 design spec: a 5-point design north star, a model legend (Haiku 4.5 for mechanical
sweeps, Sonnet 5 as the workhorse, Opus 4.8 near locked constraints / persisted-store migrations /
engine helpers, Fable 5 for illustration and grading-design work), and four phases with per-task
tables (task, files, model, rationale), acceptance criteria and risks: **Phase 1 diet** (defaults
flip incl. settings-store persist migration, 3-element Heute, 1-screen onboarding + taster, Gloss
component, microcopy budget), **Phase 2 stage** (focus-mode `/session`, combo counter +
reward-gold tokens, loot end screen + `engine/collection.ts` Lv mapping with unit test), **Phase 3
world seed** (six Fable-designed SVG domain buildings, city strip, quest cards, Meine Sammlung),
**Phase 4 depth** (typed forward-recall block, authentic Lesen/Hören block, visible progression),
plus a Phase 5 backlog (grammar Übersicht visuals, variable rewards, rephrase ladder). This dovetails
with session 62's game plan: its G0 phase IS redesign Phases 1–3. No app code changed. **Next
step: execute redesign Phase 1 on the session branch, starting with task 1.1 (the
`useSettingsStore` defaults flip + persist migration, Opus-tier care).**

**Earlier handoff after session 62 (2026-07-05). Game implementation strategy PROPOSED, not yet
implemented.** The founder asked how to implement the game idea (approach, tools, strategy).
Deliverable: **`docs/plans/GAME_IMPLEMENTATION_PLAN.md`**, the engineering companion to
`docs/strategy/GAME_CONCEPT.md`, closing the tech-approach question that the concept doc had
left open. Four decisions recommended: (1) build inside Genauly as a lazy-loaded `/welt` route,
not a separate app (one progression state, one deploy, extractable later); (2) React renders
all mission scenes (battles are conversations, missions are forms/websites, all UI-shaped);
a game engine (Phaser, MIT, lazy chunk) arrives ONLY for the later walkable pixel city, and
Godot/Unity are rejected for web-export weight and a foreign codebase; (3) missions are a data
bank (`data/missions.ts` + `engine/mission.ts` runner, closed scene-type union, lint:content
graph checks) so hundreds of missions become a content routine, with "mission #2 touches only
data files" as the pipeline metric; (4) FSRS stays the single memory model and acts as the
dungeon master for mission recurrence (game grades flow through `reviewVocab`). Tooling/cost
map: itch.io modern-city pixel packs (~10–40 EUR), Aseprite, kenney.nl CC0 audio, Tiled + Phaser
free, everything else already in the repo. Phases: G0 = execute the session-61 redesign Phases
1–3 first (they seed the game world), G1 = mission engine + Anmeldung vertical slice in React,
G2 = Chapter 1 "Ankommen" + a real-user playtest gate, G3 = Phaser walkable world, G4 = content
scale. Risks named: engine-first trap, content-scale trap, forked-progress trap, pending
pixel-art blessing (no asset purchases before mockup approval). **Next step: founder picks the
order (recommended: redesign Phase 1 next, then G1) and approves producing 2–3 pixel mockup
scenes for the art blessing.**

**Earlier handoff after session 61 (2026-07-05). Minimal, game-ready redesign strategy PROPOSED, not yet
implemented.** The founder asked how to redesign the front end to be minimal, extremely user
friendly, intuitive and engaging for two audiences (short-attention busy professionals/students
AND hardcore exam preppers), with less German interface text, and with exercise progress feeding
the future game as a unified world. Deliverables: a visual strategy report (Artifact, with
before/after mockups of Heute, focus-mode session, loot-drop end screen and the city strip) plus
the engineering plan **`docs/plans/MINIMAL_UX_REDESIGN_PLAN.md`**. Core strategy: "lean surface,
deep drawer" (skimmer gets a 3-element Heute, 1-screen onboarding + 90-second taster, full-screen
focus-mode sessions; the diver keeps Bibliothek/Prüfung/Fortschritt depth one tap deeper),
a microcopy budget (no section-description sentences; German is content, not chrome; D/E gloss
component shipped early from the game concept), gradients restricted to Start + reward moments,
one new reward-gold token, and a game-contract layer: FSRS state renders as collection-card
levels (loot), theme mastery as six SVG domain buildings (the city strip, seed of the RPG world
map), Can-Do milestones as quest cards. Four phases (1 diet · 2 stage · 3 world seed · 4 depth,
detail in the plan doc); Phase 1 also flips the two research-backed defaults from
`docs/reference/GENAULY_UX_UI_ANALYSIS.md` (voiceVariety on, speaking on where supported). Locked
constraints restated in the plan (bottom bar, overlays, bundle budget, consent flow, no em
dashes, no new deps, no tracking). **Next step: founder reviews the report; on go-ahead, execute
Phase 1 on the session branch.**

**Earlier handoff after session 59 (2026-07-05). Bibliothek Grammatik bug FIXED ✅ and merged to `main`.**
The founder reported that tapping any Grammatik tile in the Bibliothek (Konnektoren etc.) bounced
them to the Wörter tab. Root cause: `GrammarHub` opened a topic with `setParams({ topic: id })`,
which replaces the whole query string and drops `tab=grammatik`; `LibraryHub` then saw no `tab` and
fell back to `DEFAULT_LIBRARY_TAB` ("woerter"). A Phase-5 regression: harmless when GrammarHub lived
at standalone `/grammar`, breaking once it became a `?tab=` segment of `/library`. The back button
(`setParams({})`) had the same flaw. Fix in `src/features/grammar/GrammarHub.tsx`: both `open` and
the new `close` clone the current params (`new URLSearchParams(params)`) and only set/delete
`topic`, the same idiom the other three library surfaces already use. Verified with a Playwright
check against the production preview (tile click keeps `tab=grammatik&topic=...`, topic view
renders, back returns to the grammar grid) plus `pnpm build`. A follow-up **app-wide sweep for the
same bug class found no other instances**: all nine `useSearchParams` writers audited (the other
three library surfaces clone params; WritingHub/QuizHub replace them on standalone routes where
that is the intended reset), every deep link into library content routes through `LibraryRedirect`
(params preserved, correct tab added), and `LibrarySwitcher` rebuilds params deliberately (it
carries the travelling scope). Confirmed at runtime with a 7-check Playwright smoke: saved-toggle /
search / facet params keep their tab, the switcher carries theme scope, old `/grammar?topic=` deep
links land on the topic, and browser Back from a topic returns to the grammar grid. No code change
needed beyond the PR #297 fix.

**Follow-up in the same session: PWA auto-update watcher (`src/lib/swUpdate.ts`).** The founder
reported the grammar fix "isn't solved yet" after it was already deployed (Pages runs 304–305
green). Root cause was the update path, not the fix: the service worker (`registerType:
"autoUpdate"`) serves the OLD precached app on launch and only swaps in a new deploy on the *next*
relaunch, so an installed home-screen app needs two full relaunches to show any deploy. New
`watchSwUpdates()` (called from `main.tsx`): reloads once when the new worker takes control within
30s of load (the update-on-launch case); if a deploy lands mid-session it defers the reload to the
next app resume so an in-progress exercise is never interrupted; on every resume it also asks the
browser to re-check `sw.js` (throttled to 1/min) because iOS PWAs are resumed, not relaunched.
First-install `clientsClaim` is guarded (no spurious reload). Complements the existing reactive
`lib/recover.ts` (which only heals after a chunk-load crash). Verified with a Playwright
end-to-end SW test against the production preview: no reload on first install, auto-reload after a
simulated deploy (bumped `sw.js` revision), grammar tiles still work after the reload; `pnpm
build`/`lint`/`test:unit`/`check:bundle` green. Note: the founder's device adopts THIS change only
after one more manual close-and-reopen cycle (the old code without the watcher is what's cached);
every deploy after that self-adopts. **Next candidates** carry over from
session 58: founder live-verification of app feel on a real phone; burn down the ~31 lint warnings;
`useDeferredValue` on the Vokabeltrainer filter memos if old devices still stutter.

**Earlier handoff after session 58 (2026-07-05). Full performance/bug/robustness audit EXECUTED ✅, six PRs
merged to `main`** (#289–#294 + the Phase-6 polish PR, see below). The founder reported the app
"buggy, laggy and unresponsive"; the audit report + fix plan lives in
**`docs/plans/APP_AUDIT_2026-07-05.md`** (committed with PR #289) and every phase in it is now
shipped. What changed, by phase: **(1, #289)** header streak uses `useEffectiveStreak` (no more
stale flame after a missed day); `/session` remounts on `?theme=`/`?min=` change and "Neue Runde"
rebuilds in place instead of `window.location.reload()`; the Settings "Animationen reduzieren"
toggle is real now (`MotionConfig` in `App.tsx`, also honours OS `prefers-reduced-motion`);
`.card-hover` transitions only transform+shadow. **(2, #290)** `BrowseToolbar` debounces search
(180 ms; also keeps `history.replaceState` off the keystroke path, which Safari rate-limits);
`VocabList` cards are memoized with per-card store selectors and stream in 60-at-a-time via the new
**`src/lib/usePagedList.ts`** (IntersectionObserver sentinel + "Mehr anzeigen" fallback);
Kollokationen got the same treatment (plus: search term removed from the grid remount key);
Redemittel dropped per-card stagger wrappers; `lib/search.ts` builds a pre-normalised lazy index
and `GlobalSearch` defers the query. **(3, #291)** main bundle **606 kB → ~322 kB** (174 → 96 kB
gzip): `GlobalSearch` imports `lib/search` dynamically (dialogues/collocations leave the eager
path); new **`src/engine/sessionPreview.ts`** carries the light preview half for the eager
Dashboard (`engine/session.ts` re-exports it; import sessionPreview from the light module in eager
code, NEVER from engine/session); `/privacy`, `/terms`, `/about` are lazy routes. **(4, #292)**
new `flushCloudSync()` pushes debounce-pending progress on `visibilitychange=hidden` and is awaited
in `signOut` (closing the PWA right after a session no longer strands the last reviews). **(5a,
#293)** per-route `errorElement` (`RouteError`) so a page crash keeps the shell alive; progress
store persist now has an explicit `version: 0` + migrate hook. **(5b, #294)** CI guardrails in
`validate.yml`: **`pnpm lint`** (new ESLint flat config; rules-of-hooks etc. block, compiler-era
react-hooks rules are warnings = visible debt, ~31 currently), **`pnpm test:unit`** (new Vitest
suite, 23 tests in `tests/`), **`pnpm build`** (PRs previously merged without a build!), and
**`pnpm check:bundle`** (`scripts/check-bundle-size.mjs`, main-chunk budget 400 kB). The linter
caught real bugs, fixed in #294: dead else-if in `engine/quiz.ts` (tiny-pool fallback never ran),
stray `\"` in the plural prompt, `engine/dialogue.ts` `useHint` renamed **`applyHint`**. **(6)**
mobile-only blur reduction on the sticky header + bottom bar (`backdrop-blur-md`, more opaque
surface; desktop unchanged) — this is the one **visual** change of the series; founder can veto
after seeing it live. Verified throughout with an 11-check Playwright smoke against the production
preview + all seven gates green. **Next candidates:** founder live-verification of feel on a real
phone; burn down the 31 lint warnings; consider `useDeferredValue` on the Vokabeltrainer filter
memos if very old devices still stutter; the B3 full option (solid mobile surfaces) if jank
persists.

**Earlier handoff after session 57 (2026-07-05). The optional Learning Engine Phase 1.5 latency plug-in is
COMPLETE ✅ and merged to `main`** as PR #287 (squash SHA `8835b52`). This closes the
`docs/plans/LEARNING_ENGINE_PLAN.md` roadmap entirely: nothing in it remains. What shipped: a
**"correct but slow" demotion** in `src/engine/srs.ts`. When enabled, a Good rating (grade 4) whose
clamped response latency exceeds **1.5×** the card's own `emaMs` is graded as **Hard** instead, so a
laboured recall schedules sooner. It is deliberately conservative and self-relative: gated on **≥3
prior latency samples** (new optional `SrsCard.msCount`) so the per-card EMA is trustworthy, keyed
purely to the card's own EMA (never an absolute cross-format threshold, since flashcard-flip and
MCQ-select latencies share one card's EMA), and a **2000ms floor** that only *blocks* demotion of a
sub-2s confident recall (never causes one). The demotion is scheduling-only: `lastGrade` still
records the learner's honest button press and the latency sample is still captured. Wiring:
`review()` gained an `opts.latencyGrading` flag (engine default **off**, so `test:srs` golden
sequences and any other pure caller never demote); `useProgressStore.reviewVocab` reads the new
`latencyGrading` setting (default **on**, opt-out toggle in the Settings "Lernen" card) via
`useSettingsStore.getState()` and passes it through. No persist/Supabase migration (both new fields
ride inside the existing `srs` jsonb blob and the settings jsonb sweep). Verified: all four gates
green (**`pnpm test:srs` now 323 checks**, +13 new Phase-1.5 assertions that prove a demoted Good
equals a real Hard on the same card state, and that fast / flag-off / <3-samples / floor-guarded
cases all skip the demotion), plus `typecheck` + `lint:content` + `build`. Post-merge housekeeping
done (branch reset to `origin/main`, force-with-lease). Prompt-log entries 138–139.

**Earlier handoff after session 56 (2026-07-05). Learning Engine Phase 2, the #27 speech-first production
block, is COMPLETE ✅ and merged to `main`** as PR #284 (squash SHA `6d1d8b4`). That was the LAST
Learning Engine phase: all five items (26a, 26b, #27, #28, #29, #30) are now shipped. What shipped:
a new **`"speaking"` session block**, the first consumer of the `listen()` STT wrapper in
`engine/speech.ts`. Behind the `recognitionEnabled` opt-in (now no longer inert; Settings copy
updated) plus `recognitionSupported()`, the composer (`engine/session.ts`, new `speaking?: boolean`
on `BuildSessionOpts`, engine stays pure) adds up to 2 production blocks per session from the
top-weighted due vocab, showing the EN meaning + EN example (the DE sentence would reveal the
answer). The learner taps the mic (user gesture required by webkit STT), an 8s soft countdown caps
the window, partials stream, and the final transcript is matched by the new pure
**`src/engine/pronounce.ts`** (strip punctuation + leading der/die/das/ein/eine/`sich`, ß→ss;
exact / word-boundary containment / length-scaled Levenshtein). Grades 4/0 → `reviewVocab` with 26a
latency spanning the think stage; +12 XP (`XP.speakingDrill`). **Fallback ladder:** hard STT error
or no ctor flips the block to a typed input graded by the same matcher (after 2 hard errors the
remaining speaking blocks start typed); `no-speech` returns to the prompt; a voluntary "Lieber
tippen" path always exists. **New CI gate `pnpm test:pronounce`** (26 checks, `validate.yml` next to
`test:srs`) pins the matcher contract. Verified: all five gates green plus a 21-check Playwright
smoke against a live dev server with a mocked SpeechRecognition (STT happy path with exactly +12 XP
and persisted `lastMs`, voluntary typed path, mic-error fallback, recognition-off full session never
shows the block), zero console errors. Two real-browser guards worth knowing: STT `onerror` is
always followed by `onend` (the end handler checks the live handle so it can't drag the UI back to
the prompt), and StrictMode's dev double-invoke re-arms the unmount evaluation guard. Post-merge
housekeeping done (branch reset to `origin/main`, force-with-lease). Prompt-log entry 136.

**Earlier handoff (session 55, 2026-07-05, docs only, nothing built).** Token-efficiency housekeeping in
response to a founder review of a Perplexity "agent tax" analysis. Trimmed the context that loads every
session: rotated the append-only prompt log (entries 1–109 archived, live file now session 50+),
relocated the PROJECT_STATUS session-25–46 detail into
`docs/archive/PROJECT_STATUS_ARCHIVE.md`, and split the "why" behind locked decisions out of `CLAUDE.md`
into the new **`docs/DECISIONS.md`** (UX-overhaul phase history + mobile-bar mechanism/mockup detail).
Added a "Working efficiently (token/context discipline)" rule to `CLAUDE.md`. **Every operative
do/don't rule was preserved; only narrative/rationale moved.** Net effect: the files normally read per
session dropped ~4110 → ~1973 lines (~52%). Then a **thorough docs audit** (founder request): moved the
four fully-completed plans (`UX_OVERHAUL_PLAN`, `FILTER_HARMONIZATION_PLAN`, `TAXONOMY_IMPLEMENTATION_PLAN`,
`TAXONOMY_REDESIGN`) from `docs/plans/` into `docs/archive/` and rewired every live reference; fixed the
stale `LEARNING_ENGINE_PLAN` status in the index (Phases 0/1/3 shipped, not "not yet implemented"); removed
the stale hardcoded session-branch name from `CLAUDE.md` (docs best-practice #5); refreshed `docs/README.md`
(new `DECISIONS.md` + prompt-log-archive rows). Content counts spot-checked against `src/data` (provenance
1,111 + Can-Do 25 match, not stale). `plans/` now holds only active work (`LEARNING_ENGINE_PLAN`,
`PHASE2_SETUP`). No app code touched, no build needed. Finally, **codified a prompt-log rotation policy
and split the prompt-log archive by ISO week** (founder request): the archived entries now live in
`docs/archive/prompt-log/SESSION_PROMPT_LOG_YYYY-Www.md` (one file per week + a `README.md` index) so a
lookup loads only one week; the live log's header now carries the standing rule (append to the tail;
rotate at ~1,200 lines into the matching week file). Prompt-log entries 133–135.

**Earlier handoff (session 54, 2026-07-05, docs only, nothing built).** The founder brought a rough
idea for a **story-driven 2D German life RPG** (hero's journey, Pokémon-like; items = language;
missions = real-life scenarios like the Anmeldung; battles = conversations; real-world photo/
voice side quests; D/E translation buttons on every line) and we brainstormed it into a concept.
The full concept, including the founder's verbatim core philosophy (personal involvement, cultural
insight + visuals + emotion, incremental scene-on-scene learning, ambition of hundreds of missions
and thousands of scenes), the failure-is-content design, the chapter skeleton, and the **Anmeldung
vertical slice** chosen as the first prototype target, is captured in
**`docs/strategy/GAME_CONCEPT.md`**. **Scope guardrail (founder correction, do not regress):** the
game targets a BROAD audience; exam prep is at most one optional side path, never the spine or
default endgame. Open questions for the founder: own brand vs. Genauly name, and final blessing on
the retro pixel-art direction. No build work is scoped yet; treat the concept doc as the reference
when the founder wants to take the next step. Prompt-log entry 132.

**Earlier handoff (session 53, 2026-07-04). Learning Engine Phase 1, the FSRS scheduler (26b), is
COMPLETE ✅ and merged to `main`** as PR #275 (squash SHA `c1dada8`). `src/engine/srs.ts` now runs a
compact hand-rolled **FSRS-6** scheduler (21 default weights, desired retention 0.9, no fuzzing,
day-granular with no sub-day learning steps) behind the **unchanged** export surface, so no call
sites changed. `SrsCard` gained optional `stability`/`difficulty` (they ride inside the `srs` jsonb
blob; no persist or Supabase migration). Legacy SM-2 cards seed lazily on their next review
(stability from `interval`, difficulty inversely from `ease`); untouched cards keep identical
`mastery()` scores, so the theme grid and Can-Do milestones don't shift. `reps` is now a
total-review counter that never resets (keeps cloudSync's higher-reps-wins merge valid), and `ease`
keeps updating by the SM-2 rule, so reverting the one engine file would restore the old scheduling
with no data repair. **New CI gate: `pnpm test:srs`** (`scripts/test-srs.mjs`, added to
`validate.yml` next to `lint:content`): 310 assertions against golden vectors generated from
**py-fsrs 6.3.1**, the open-spaced-repetition FSRS-6 reference (grade sequences, same-day/late/
early reviews, legacy seeding, the 26a latency regression, contract invariants). Verified per plan
§7: all four gates green, a fresh-context verification subagent independently re-derived the
formulas and golden vectors (verdict PASS), and a Playwright smoke against a live dev server showed
a composed-session flashcard review persisting exactly the FSRS first-rating reference values
(`stability 2.3065, difficulty 2.1181, interval 2`) with zero console errors. The "correct but
slow" latency grading stays deferred (plan Phase 1.5; needs 3+ samples per card). Post-merge
housekeeping done (branch `claude/26b-task-n3tl75` reset to `origin/main`, force-with-lease).
**Also shipped this session (PR #277, squash SHA `c00341a`):** the long-standing `pages.yml` deploy
flake is now **auto-retried** (up to 3 in-job attempts of `actions/deploy-pages`; see the "Deploy note"
lower down). This came up because the flake hit both session-53 merges and a manual re-run failed until
the Pages service recovered (a genuine short GitHub Pages incident, not the code). The incident ran long
enough that deploy runs #282/#283/#284 all failed (#284 exhausted all 3 retry attempts while Pages was
still degraded); the next merge's deploy, **run #285 (`ab6278e`, tip of `main`), went green after the
retry rescued a later attempt** (2m 20s vs a clean ~22s, so the retry visibly engaged). Because each
Pages deploy publishes the whole site from the current commit, #285's success means the FSRS change and
all prior work are live. Takeaway confirmed: the retry self-heals a single-blip flake but cannot beat a
multi-minute outage. Prompt-log entries 130–131.

**Earlier handoff (session 52, 2026-07-04). Learning Engine #29 (custom deck / "save word") is
COMPLETE ✅ and merged to `main`** as PR #273 (squash SHA `c730e76`). What shipped: a per-learner **saved-words deck** on the progress
store (`savedWords: string[]` + `toggleSavedWord(id)`, cleared by `resetProgress`), wired into
cloudSync (`progressRow` writes `saved_words`, `mergeRemoteProgress` unions across devices) with a new
**`supabase/migrations/0005_saved_words.sql`** that the founder must run once in the SQL editor (adds
the `progress.saved_words` jsonb column, default `'[]'`, no backfill). UI: a **bookmark toggle on each
Vokabeltrainer word card** (`VocabList.tsx`, stopPropagation like SpeakButton) and a **"Gespeichert"
toolbar filter** (`?saved=1`; kept a per-learner toggle rather than a content facet, since "saved"
isn't a static content field) with an empty state, plus a saved-count row in the Settings "Lernen"
card. Engine: `reviewWeight` gained a **`saved` boost (+1)** threaded through session Pool 1
(`buildSession` takes `savedWords`), so bookmarked words surface sooner in composed sessions. Verified:
`pnpm typecheck`/`lint:content`/`build` green + a Playwright smoke test (toggle, persistence, filter
narrowing, empty state) with zero console errors. **Migration 0005 was run by the founder in the
Supabase SQL editor 2026-07-04**, so `progress.saved_words` exists and saved words sync across devices.
Post-merge housekeeping done (branch reset to `origin/main`, force-with-lease). Prompt-log entries
127–129.

**Earlier handoff (session 51, 2026-07-04). Learning Engine Phase 0 (quick wins) is COMPLETE ✅ and
merged to `main`** as PR #271 (squash SHA `92ab08b`): **26a response-latency capture** (`SrsCard`
gained optional `lastMs`/`emaMs`, write-only training data for the coming FSRS scheduler, no scheduling
behavior change), **#28 guess-before-reveal** (`guessFirst` setting, default on; MCQ questions hide
their options behind a "think first" gate in both `MCQView` and `VocabQuiz`), and **#30 voice variety**
(`voiceVariety` setting, default off; `nextGermanVoiceURI()` round-robins the German voice list, wired
into `SpeakButton`/`SimulationRunner`/`ExamRunner` with mutual exclusion against a pinned voice). Shipped
as three independently-revertable commits, each verified in isolation (`pnpm typecheck`/`lint:content`/
`build` plus targeted unit tests and Playwright smoke against a live dev server). No persist/Supabase
migrations needed, all new fields are optional and ride inside existing jsonb blobs. Branch
`claude/whats-next-esga9u` (reassigned per session; `main` is the source of truth), realigned to `main`
post-merge per the standard housekeeping.

**Next up: the Learning Engine plan is fully shipped, including the optional Phase 1.5 tail
(26a/#28/#30 s51, #29 s52, 26b s53, #27 s56, Phase 1.5 latency plug-in s57).** Open candidates, in
rough order of product value:
- A new **life-domain theme** (banking / healthcare/Arzt / housing) per the product scope; the
  `behoerde` pack is the reference template. Content-heavy, founder may want to pick the domain.
- The optional taxonomy follow-ups (human-verify the AI-drafted `cefr` tags via provenance
  `draft→verified`; broaden `sector`/`workSituation` tagging; extend sub-themes past 3 of 11).
- The **game concept** (`docs/strategy/GAME_CONCEPT.md`, s54): waiting on founder decisions (brand,
  pixel-art direction) before any build work is scoped.
- Backlog #25 (the "EN peek" whole-screen translate button) is still parked pending a brainstorm.

**Most recent work (session 51, 2026-07-04, shipped as PR #271):**
- **26a response-latency capture:** `SrsCard` gained optional `lastMs` (clamped to 60s) and `emaMs`
  (EMA, α=0.3); `review()`/`reviewVocab()` take an optional `latencyMs`, carrying prior samples forward
  unchanged when it's absent so nothing wipes history. New `useAnswerTimer(key)` hook (`lib/hooks.ts`):
  a sub-second `performance.now()` timer that resets in the render phase when the per-prompt key
  changes. Captured at 4 sites: `Flashcards` + `SessionPlayer`'s flashcard block (front render to first
  flip), `VocabQuiz` + `MCQView` (prompt render to option tap, shared by `QuizRunner` + `SessionPlayer`).
  Word-order/matching stay unmeasured (not retrieval-latency signals); the Redemittel recall branch has
  no SRS card so its sample is dropped. Write-only: no scheduling behavior changed. Verified with 14
  hand-written assertions against the real `engine/srs.ts` (EMA math, clamping, carry-forward,
  invalid-input rejection, old-format tolerance, rounding).
- **#28 guess-before-reveal:** new `guessFirst` setting (default **true**). `MCQView` and `VocabQuiz`
  hide the options grid behind a "think first" gate ("Überlege zuerst: Wie heißt die Antwort? Dann
  vergleiche." → "Optionen zeigen") until tapped. `MCQView` resets for free via its existing per-question
  remount key; `VocabQuiz` isn't remount-keyed, so it gets explicit reset points in `next()`/`restart()`
  (re-reading the live flag, so a mid-quiz settings change applies from the next question). Latency
  (26a) is deliberately NOT reset on reveal, so it spans the think stage, the retrieval-latency signal
  wanted. New "Lernen" settings card (between Profil and Darstellung). WordOrder/Matching untouched
  (already constructive).
- **#30 voice variety:** new `voiceVariety` setting (default **false**, opt-in). `nextGermanVoiceURI()`
  in `engine/speech.ts` round-robins the German voice list (not random, so consecutive utterances always
  differ), degrading to `undefined` under 2 voices; precedence resolved inside `speak()` (pinned
  `voiceURI` wins, else variety rotation, else `voices[0]`). Wired into `SpeakButton` (~11 surfaces),
  `SimulationRunner`, `ExamRunner`. Settings UI: a "Stimmen abwechseln" switch under the voice picker,
  shown only with 2+ German voices, with **mutual exclusion** (enabling variety unpins the voice; picking
  a voice in the Select turns variety back off).
- **Process:** the three items shipped as three independently-revertable commits (split cleanly even
  though `useSettingsStore.ts` and `Settings.tsx` are shared between #28 and #30, by temporarily
  stripping/restoring the #30 additions before each commit). `pnpm typecheck`/`lint:content`/`build`
  green on every commit in isolation and on the final tree; Playwright smoke tests against a live dev
  server covered the MCQ gate reveal flow, `guessFirst=false` bypass, and the voice-variety mutual
  exclusion in both directions. Shipped via PR #271, squash-merged as `92ab08b`; no persist/Supabase
  migrations needed (all new fields optional, ride inside existing jsonb blobs). Prompt log entries
  119–124. **Session fully documented.**

**Earlier handoff (session 49, 2026-07-02): Phase 5 of the UX overhaul is COMPLETE ✅** — the whole
UX overhaul roadmap (Phases 0–5) shipped. The IA restructure (PR #262, `c317047`) is founder-verified
live; the Tier-3 tail then shipped in two more PRs: the **facet registry + Verb-facet drop** (PR #264,
`1141cde`) and the **Vokabeltrainer tab removal** (PR #265, `ae67862`). Recap of the four-zone nav: new
**Anwenden hub** (`/anwenden`), new **Bibliothek hub** (`/library?tab=…`) with the four old library
routes redirecting in, the founder-unlocked `DEFAULT_PINNED_TABS` four-zone default, and a settings-store
persist migration (`version: 1`) remapping existing users' pins/More-order. The s26–28 bottom-bar
mechanics stayed locked throughout.

**✅ Deploy note (recurring flake, now auto-retried since s53):** the `pages.yml` **deploy** job
intermittently failed with GitHub's transient `##[error]Deployment failed, try again later` on the
`actions/deploy-pages` step (the build + artifact upload succeed; it is a Pages-platform flake, not a
code issue). It hit `c317047`, `74ccd7c`, and both session-53 merges (`c1dada8`/`9ba8be4`), where the
Pages service was briefly degraded and even a **manual re-run failed** until it recovered. **Fixed in
session 53 (PR #277, squash SHA `c00341a`):** the deploy job now runs up to **three attempts** of the
same pinned `actions/deploy-pages` action in-job (attempts 1–2 fail soft with 15s/60s pauses; attempt 3
fails hard so a genuine outage still surfaces), with the `environment.url` falling back across the
attempts. First real-world test was rough but instructive: run #284 (PR #277's own merge) exhausted all
3 attempts because the Pages incident was still active, then the next merge's run **#285 went green in
2m 20s** (vs a clean ~22s), showing the retry engaged and rescued a later attempt once the service
recovered. So a single-blip flake now self-heals; only a multi-minute GitHub Pages outage (like the one
on 2026-07-04) would still fail all attempts and need re-running after the service recovers. **Old
manual remedy (if all three attempts ever fail):** GitHub Actions → the failed "Deploy site to GitHub
Pages" run → "Re-run failed jobs".

**Phase-5 tail (session 49 cont.):**
1. **Facet registry** `src/lib/facets.ts` (PR #264, `1141cde`): facet defs declared once per content type
   (`vocabFacets`/`collocationFacets`/`redemittelFacets` + `*_FACET_IDS`), derived from the taxonomy
   enums; the three browse pages now consume it instead of hand-wiring. **Dropped the 100-option Verb
   facet** from Kollokationen (search covers verb lookup) and codified the **≤12-option rule**
   (`MAX_FACET_OPTIONS` + a dev-time warning in the `facet()` builder). No UI change (same `FacetDef` →
   same `FacetSheet`).
2. **Vokabeltrainer tab removal** (session 49's final PR): the in-page Karteikarten + Quiz tabs are
   retired behind a reversible `SHOW_PRACTICE_TABS = false` flag in `VocabularyTrainer.tsx`, so the
   Vokabeltrainer is now the browse/inspect surface (word list) and focused practice flows through the
   toolbar's **Üben → composed session**. Hero copy updated to match. `Flashcards`/`VocabQuiz` stay in the
   repo (used by the session engine).
   - **`/quiz` decision:** the standalone hub is off the nav (its "retired" state) but kept as a live
     route, reachable via deep links (GrammarHub "Wissen im Quiz testen" + `practiceAreas`). A hard
     redirect was deliberately NOT added, so those deep-link intents keep working. Flip
     `SHOW_PRACTICE_TABS` back to `true` to restore the vocab tabs if the founder prefers them.

**Phase 3 scope decision (founder, 2026-07-02):** Phase 3 shipped as a **soft merge** (founder chose
this over full consolidation). The four library pages got the single-hub feel (segmented switcher +
travelling scope + Üben) *without* a route merge or nav change, so nothing the founder uses was
removed and the locked bottom bar was untouched. The **hard merge** deferred to **Phase 5** (the nav
re-map phase): the single `/library` URL + old-route redirects + retiring the standalone Quiz
section + removing the Vokabeltrainer's in-page Karteikarten/Quiz tabs (superseded by Üben →
session). Fold these into the Phase 5 work.

**Earlier work (session 50, 2026-07-03, docs-focused, shipped across PRs #267–#269):** full docs audit
(stale counts reconciled to 1,111 provenance rows; five shipped-plan headers flipped; PROJECT_STATUS
slimmed with sessions 4–40 + 24 archived to `docs/archive/PROJECT_STATUS_ARCHIVE.md`; new
`docs/README.md` index + best-practices section); readable transcription of the learning-app playbook
(`docs/reference/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`); Genauly scored against it
(`docs/strategy/PRODUCT_EVALUATION.md`, seven dimensions); the five recommendations scoped as backlog
**#26–#30**; and the founder-approved **`docs/plans/LEARNING_ENGINE_PLAN.md`** (Phase 0 quick wins =
next build; then FSRS, speaking block, custom deck). Then the docs folder was reorganized into
`strategy/`, `plans/`, `archive/`, and `reference/` subfolders (see `docs/README.md`), the only change
touching `src/` (three code comments repointed at moved docs; CI `lint-content` green). All merged to
`main` (PRs #267, #268, #269). Prompt log entries 110–118. **Session fully documented.**

**Earlier work (session 49):**
- **s49 — UX overhaul Phase 5 IA restructure SHIPPED ✅ (Anwenden hub + Bibliothek hub + four-zone
  nav re-map):** the visible heart of Phase 5, delivered as a mostly-additive PR so no deep link or
  founder-used surface broke.
  - **Anwenden hub** (`src/features/anwenden/AnwendenHub.tsx`, route `/anwenden`): one hub with three
    big cards (Sprechen → `/simulation`, Schreiben → `/writing`, Prüfung → `/exam`), giving the transfer
    layer equal visual rank. `SimulationHub`'s title renamed **"Lösung finden" → "Sprechsimulation"**
    (the telc module name kept only in the description).
  - **Bibliothek hub** (`src/features/library/LibraryHub.tsx`, route `/library`): the deferred Phase-3
    **hard merge**. `/library?tab=woerter|kollokationen|redemittel|grammatik` lazy-mounts the existing
    Vokabeltrainer / Kollokationen / Redemittel / Grammatik surfaces (each still renders its own HubHero
    + `LibrarySwitcher`). `LibrarySwitcher` is now **tab-based** (switches `?tab=` under `/library`,
    carrying the travelling scope). The four old routes redirect in via a `LibraryRedirect` component
    that **preserves every query param** (theme/sub/cefr/q/cat…), so cross-module "Verbunden" jumps,
    `searchAll` deep links, intent cards and `practiceAreas` routes keep working untouched.
  - **Four-zone nav re-map** (`nav-items.ts`): navItems collapsed from 12 to **Heute · Bibliothek ·
    Anwenden · Fortschritt · Einstellungen**; `DEFAULT_PINNED_TABS = ["/", "/library", "/anwenden",
    "/analytics"]` (founder-unlocked, Part-H decision 2). Custom two-tone route marks added for
    `/library` (stacked books, blue + neon-cyan) and `/anwenden` (target, orange + neon-amber) in
    `route-icons.tsx` + `NORM`. **The s26–28 bar mechanics (edit mode, jiggle, drag-reorder, More sheet,
    icon rules/sizes) were NOT touched** — only the item list + default pins, exactly the approved scope.
  - **Settings-store migration** (`useSettingsStore`, now `persist` `version: 1`): a `migrate` +
    `ROUTE_SUCCESSOR` map remaps a pre-Phase-5 learner's saved `pinnedTabs`/`moreOrder` onto the new
    zones (`/vocabulary`,`/collocations`,`/redemittel`,`/grammar`,`/quiz` → `/library`;
    `/writing`,`/simulation`,`/exam` → `/anwenden`; `/revision` → `/`), de-duping and keeping Home first,
    so nobody's custom bar silently loses icons.
  - **Deliberately deferred** (documented in "Resume here"): the facet registry / Verb-facet drop and the
    plan's in-page removals (quiz retirement + Vokabeltrainer tab removal). Kept `/quiz` a working route
    (off the nav) and left the vocab Karteikarten/Quiz tabs in place to avoid a surprising feature
    removal inside the nav PR.
  - **Verified:** `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green. Headless-Chromium
    mobile smoke (390px) confirmed: the four-zone bottom bar renders (Heute · Bibliothek · Anwenden ·
    Fortschritt · Mehr); `/library` + all four `?tab=` segments render; `/anwenden` shows the three
    cards; `/vocabulary?theme=behoerde` redirects to `/library?theme=behoerde&tab=woerter`; the
    Simulation title reads "Sprechsimulation"; **and** a seeded pre-Phase-5 profile (`version: 0`, old
    pins `["/","/vocabulary","/quiz","/analytics"]`) migrates to `["/","/library","/analytics"]` with
    zero console errors.

**Most recent work (session 48):**
- **s48 — UX overhaul Phase 4 UI half (Fortschritt redesign) SHIPPED ✅:** built the three pieces
  from plan E5 on top of the session-47 Can-Do content. **Can-Do milestone section** in
  `Analytics.tsx`, now the page's lead: for each theme (sorted least-mastered-first, same order as
  the mastery grid) lists its `canDoByTheme(themeId)` statements, checked off when the theme's
  mastery ratio (already computed as `themeStats`) crosses the statement's `threshold`; a header
  badge shows the overall `achieved/total` count. **Diagnose card**: shows the current weakest CEFR
  band (`weakestBand`) or, for a fresh learner with no started cards, the weakest theme
  (`weakestTheme`, mode-aware, both pure exports of `engine/session.ts`), with a one-tap "Session
  dazu starten" button that navigates to `/session?theme=<weakTheme>`. **Relocated the theme mastery
  grid**: removed the "Deine Themen" browse grid from `Dashboard.tsx` (Heute) — it already lived on
  Fortschritt as "Beherrschung nach Thema" — and replaced it with a quiet "Alle Themen" card linking
  to `/vocabulary`; Heute is now hero + Situationen + status strip + that link. No new engine or data,
  UI assembly only. `pnpm typecheck` + `pnpm lint:content` + `pnpm build` all green; headless-Chromium
  mobile smoke pass confirmed the Can-Do section renders checked/unchecked milestones correctly against
  seeded `srs` progress, the diagnose button navigates to `/session?theme=...`, and the Heute theme grid
  is gone with "Alle Themen" in its place. Shipped in PR #260 (bundling the session-47 content
  commits), squash-merged to `main` as `74ccd7c` after `lint-content` CI passed.

**Most recent work (session 47):**
- **s47 — UX overhaul Phase 4 CONTENT half (Can-Do bank + linter) committed (merged in session 48
  via PR #260, together with the UI half):** new
  `src/data/canDo.ts` — **25 `CanDoStatement` Can-Do milestones**, 2–3 per theme across all 11 themes,
  pitched at ascending CEFR bands (B1.2 → B2.1 → B2.2) with ascending mastery `threshold`s. Each is a
  German "Ich kann …" statement written in our own words, **aligned to the Council of Europe CEFR
  self-assessment descriptors** (cited in provenance, never reproduced; Goethe "Kann-Beschreibungen"
  stay on the avoid list) — the exact Part-H-decision-4 recipe. New `CanDoStatement` type + `can_do`
  provenance content type (with the `/sources` page label + `TYPE_ORDER` entry); **25 provenance rows**
  (`origin: authored`, `license: OWNED`, reference = CoE self-assessment grid; **founder-reviewed and
  approved 2026-07-02 → all now `review_status: "verified"`**). New `lint:content` rules (`lintCanDo`): unique ids, valid
  `themeId`/`cefr`, "Ich kann" prefix, `threshold` in `(0,1]`, and every theme covered; the bank is
  loaded + counted (25 milestones · 1111 provenance rows). Helper `canDoByTheme`. `pnpm typecheck` +
  `pnpm lint:content` + `pnpm build` green. Committed as `93eb4b7`. This is the Fable-authored content
  step; the founder verifies the German. (The UI half followed in session 48, see above.)
- **s47 — UX overhaul Phase 3 (library soft-merge + travelling scope) shipped:** new
  `src/store/useLibraryScope.ts` (in-memory zustand) holds the **Tier-2 travelling scope** — the
  active library `{theme, sub}` as app state, so picking a theme once follows the learner across the
  theme-scoped segments until changed. New `src/features/library/LibrarySwitcher.tsx` renders a
  segmented control (Wörter | Kollokationen | Redemittel | Grammatik) on all four library pages, each
  link carrying the shared scope, plus a dismissible `ScopeChip` on the theme-scoped surfaces.
  Vokabeltrainer + Kollokationen **hydrate** their theme from the shared scope when arriving without
  an explicit `?theme=` (e.g. via the bottom bar) and **sync** their effective theme back into it
  (dropdown or deep link) via a `useEffect` on the effective theme — so scope travels both directions
  while URL params still override for shareable deep links. An **"Üben"** button on the Vokabeltrainer
  and Kollokationen toolbars launches a scoped composed session (`/session?theme=`), folding the
  quiz-launch entry point into the Phase 1 engine (Kollokationen's old "Quiz: theme" button was
  repointed). The redundant "durchsuchen" collocations shortcut on the Grammar hub was removed (the
  switcher supersedes it). **Nothing else was removed; the locked bottom bar + nav registry +
  `DEFAULT_PINNED_TABS` are untouched** (that consolidation is Phase 5). `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` green; verified in headless mobile + desktop smoke passes (scope
  travels Wörter→Kollokationen carrying `?theme=behoerde`; Üben → `/session?theme=behoerde` whose
  first card was a Behörde word; the switcher renders on all four pages; the chip dismiss returns to
  the unscoped list). **Bug caught + fixed mid-build:** a deep-link `?theme=` didn't populate the
  scope store (only the dropdown did), so scope didn't travel; fixed by syncing the effective theme
  into the store via effect rather than only on the dropdown handler.
- **s47 — UX overhaul Phase 2 (global search + Tier-0 defaults) shipped:** new `src/lib/search.ts`
  `searchAll(query)` — one query over vocabulary, collocations, Redemittel, grammar topics and
  dialogue scenarios together (linear scan, no index needed at ~1,000 items), returning grouped
  results that deep-link into each bank's home surface (`/vocabulary?theme=&sub=`,
  `/collocations?theme=&q=`, `/redemittel?cat=`, `/grammar?topic=`, `/simulation`). New
  `GlobalSearch.tsx` dialog (reuses the locked `Dialog`/`bg-dialog-overlay` primitive): a header
  icon on mobile, a Sidebar entry + ⌘K/Ctrl+K global shortcut on desktop, both wired through one
  controlled `open` state in `AppShell.tsx`. This replaces the three siloed per-page search boxes
  as the *primary* discovery path; the per-page boxes remain as scoped refiners (unchanged). New
  Tier-0 personalized defaults in `src/lib/cefr.ts` (`defaultVisibleBands`/`hiddenBandsLabel`,
  mapping the learner's stored coarse `CefrLevel` to the fine-grained `ContentCefr` band + one step
  up): Vokabeltrainer, Kollokationen and Redemittel now default their list to that band instead of
  an unfiltered pile, with a quiet "Auch B2.2 · C1 zeigen (n)" escape link (not a facet chip).
  **Found and fixed during verification:** the vocabulary bank is tagged only B1.2/B2.1/B2.2 (no
  A2/B1.1/C1 items exist), so the naive "level + 1 band" default rendered a **fully empty list** for
  an A2-level learner. Fixed with a non-empty guard (`bandNonEmpty` check) on all three pages: the
  default only activates when it would leave at least one result for the current scope, otherwise
  it's skipped entirely (no filtering, no escape pill) — the same "never let the learner tap into an
  empty screen" invariant the s45 FacetSheet already guarantees. `pnpm typecheck` + `pnpm
  lint:content` + `pnpm build` green; verified in headless mobile + desktop smoke passes (global
  search open via icon tap, text query, result click-through; ⌘K open on desktop; CEFR band default
  at B1 showing 477/528 with the escape pill, at A2 correctly falling back to the full list, at B2
  showing everything unfiltered since B2 is the app's target level).
- **s47 — UX overhaul Phase 1 (session engine + Heute) shipped (earlier in the session):** the core "one tap, one composed
  session" loop. New pure composer `src/engine/session.ts` (`buildSession` + deterministic
  `sessionPreview` + `weakestBand`/`weakestTheme`/`difficultyForLevel`) turns SRS state + Mode lens +
  a target length into an ordered, **interleaved** `SessionPlan` (new `SessionBlock`/`SessionPlan`
  types): due vocab flashcards (weighted via `reviewWeight`/`isDue`), leveled quiz questions from the
  weakest or scoped theme (via `buildThemeQuiz`), a grammar micro-drill, and a Redemittel recall,
  mixed not blocked. New `src/features/session/SessionPlayer.tsx` renders every block kind behind one
  progress bar + XP tally and an **end screen** (XP earned, "Stärker geworden" list, "Morgen: …
  festigen" forward hook); `Session.tsx` route wrapper reads `?theme=`/`?min=`. New `/session` route.
  **Heute** (`Dashboard.tsx`) now leads with a primary session CTA hero (composition preview from
  `sessionPreview`) + compact Situationen chips that launch scoped sessions (`/session?theme=`),
  replacing the browse-card wall; status strip keeps a "Schnelle Runde" secondary + Fortschritt link.
  **Schnellwiederholung** (`/revision`) is now the short (~5 min) preset of the same engine
  (`QuickRevision.tsx` is a thin wrapper). Reuse, not rewrite: the three quiz-question views were
  extracted to shared `src/features/quiz/QuestionViews.tsx` (used by both `QuizRunner` and
  `SessionPlayer`), and `GrammarDrillCard` gained optional `onResult`/`suppressXp` props (backwards
  compatible). `pnpm typecheck` + `pnpm lint:content` + `pnpm build` green; verified in a headless
  mobile smoke pass (Heute hero, a full 16-step session driven to the XP/stärker end screen, and the
  8-step `/revision` preset), no console errors.
- **s47 — UX overhaul Phase 0 (quick wins) shipped (earlier in the session):** sign-in banner now shows only on Heute
  (dashboard) and its dismissal persists (`signInBannerDismissed` in `useSettingsStore`, was
  session-only local state before); header slimmed from 5 to 4 mobile widgets (removed the
  redundant Level pill + XP ring, both already visible on Fortschritt; added an `aria-label` to
  the streak pill); added German `blurbDe` to all 11 theme cards and `purposeDe` to all 10 grammar
  topics (English `blurb`/`purpose` kept as a secondary field per the plan, for a future EN-UI
  mode), wired into `Dashboard.tsx`/`GrammarHub.tsx`; renamed the dashboard heading
  "Prüfungsthemen" → "Deine Themen" (matches the broader post-s21 scope, not exam-only) and
  "Quick Review" → "Schnelle Runde" in `QuickRevision.tsx`; Fortschritt (`Analytics.tsx`) now shows
  a "Dein Ziel" goal card (level + goal + minutes/day, sourced from existing onboarding settings,
  reusing `recommendedNext()` for the CTA) instead of four zero-value stat tiles when the learner
  has no XP/sessions yet. `types/index.ts` + `scripts/lint-content.mjs` updated for the two new
  required content fields (`blurbDe`, `purposeDe`). `pnpm typecheck` + `pnpm lint:content` +
  `pnpm build` green; verified live in a headless-Chromium mobile-viewport smoke pass (dashboard,
  grammar, revision, analytics screens).

**Most recent work (sessions 45–46):**
- **s46 — UX overhaul plan (docs-only, approved):** full app review, filter-plan critique, four-tier
  filter architecture + four-zone IA + session engine design, all Part-H decisions recorded, backlog
  #25 added (EN peek button, needs brainstorming). See the session 46 entry above.
- **s45 — Filter harmonization (Phase 1 + 2) implemented:** shared `BrowseToolbar` + `src/lib/cefr.ts`;
  identical `[Search] [Theme/Kategorie ▾] [Filter]` toolbar on the three browse pages; verb filter moved
  into the FacetSheet; QuizHub CEFR labels via `difficultyToBand`. See the session 45 entry above.

**Most recent work (sessions 35–40):**
- **s40** — **tripled the collocations bank** from 132 to 396 entries (+24/theme across all 11 themes).
  **Hid the English example translation** on `/collocations` cards (phrase gloss stays). **Hid the
  Kollokationen tab** inside Wortschatz (reversible, commented out). 264 provenance rows added (total
  1073). Added **Select dropdown scrim overlay** using the locked `bg-dialog-overlay` convention
  (PRs #227–#229); tracks open state via context so the scrim only shows while the dropdown is open.
  `pnpm lint:content` and `pnpm build` green.
- **s39** — fixed mobile **card grids overflowing off the right edge** (Kollokationen `formell` badge
  clipped). Root cause: responsive `grid-cols-N` with no base `grid-cols-1` falls back to an implicit
  max-content column on mobile. Added `grid-cols-1` across every affected grid (PR #219). Also
  **removed the `UserPromptSubmit` prompt-logging hook** (PR #221) at the founder's request; the prompt
  log is now **manual-only** (founder will ask when to log). `docs/reference/prompt-log-raw.jsonl` kept as
  history, no longer written to. Noted but did not fix a **mismatched German quote** (`„…"` vs `„…"`)
  in the collocation example sentences. Added an **explicit Save button to the `/sources` admin
  overlay** (PR #223); founder ran **Supabase migration 0004** and confirmed source-review saving now
  works. Added **backlog #24** (deep-dive source review + source strategy, PR #224); the **dwds.de
  source swap is deferred** under that item.
- **s35** — Wortschatz tab overflow fix.
- **s36** — aligned the dedicated `/collocations` (Kollokationen menu) cards to the Wortschatz
  Kollokationen tile design (truncating semibold phrase, muted meaning, `formell` badge instead of an
  indigo background, divider + italic German example), keeping the browser's extra content (example
  English line + its audio button).
- **s37** — founder-only **source-verification overlay** on `/sources`: a Supabase-backed,
  admin-only (gated to `thelivinsine@gmail.com`) layer to mark provenance entries verified and add
  private comments. **Action still pending on the founder:** run `supabase/migrations/0004_provenance_reviews.sql`
  in the Supabase SQL Editor so the saves persist (see `docs/plans/PHASE2_SETUP.md` → "Admin source review").
- **s38** — fixed the **sign-up button staying disabled when email/password are autofilled** (iOS
  Safari / password managers don't fire React's `onChange`; added a `:-webkit-autofill` animation hook
  in `index.css` that `AuthDialog` reads into state). Also investigated a "collocations tiles cut off"
  report and found **no bug** (the shared `.pb-nav` already clears the bottom bar by 24px; the
  screenshot was the top of the list mid-scroll). Awaiting founder confirmation at the true bottom of
  the list before any further change.

**Older nav handoff (sessions 26–28):** the bottom tab bar + More sheet are locked, see the
CLAUDE.md "Mobile bottom tab bar" section for the full rules. Highlights: removed context strip, 63px
rail, drag-reorderable bar + sheet, two-tone neon route marks, compact-squircle grey selection
backdrops, opacity-only enter/exit.

**Earlier nav work (sessions 23–26):** data-governance v0.2/v0.3 + boot-splash fix (s23), unique
per-route icon colours + all-custom branded SVG marks (s25), and the **mobile nav overhaul (s26)**:
removed the bottom-bar context strip, a 63px rail with 29px icons (matched in the More sheet),
Mehr tab shows selected state + toggles the sheet closed, the sheet closes on navigation, the More
sheet is now drag-reorderable (persisted in `useSettingsStore.moreOrder`), and add/remove use
`layout` + `AnimatePresence` movement animations (opacity-only enter/exit so the jiggle never
freezes). A late fix also stopped an intermittent horizontal-shift glitch by clipping `overflow-x`
on `<html>` (not just `<body>`) so a briefly-mispositioned Radix portal can't leave the page stuck
scrolled sideways. See the Session 26 log above for details and the CLAUDE.md "Mobile bottom tab
bar" section for the locked behavior.

**Earlier handoff (sessions 9–22, 2026-06-04 → 06-14):**

**Shipped & live (all on `main`):**
- **Blank-page bug FIXED (s9):** circular ESM chunk → pre-React TDZ crash + permanent crash painter.
- **Mobile UX safe-area insets (s10):** `.pt-safe`/`.pb-safe-8` for notched iPhones.
- **Installable PWA (s11):** service worker, web manifest, icons, offline-first.
- **iOS standalone / no address bar (s13):** `apple-mobile-web-app-capable` meta tags.
- **Mobile bottom tab bar (s15, PR #76):** native bottom nav. Desktop sidebar untouched.
- **Mobile density & fit (s15, PRs #77–#78):** `sm:`-gated tightening across all components/pages.
- **Content expansion (s16, PR #80):** 10 scenarios · 10 exam sets · ~504 vocabulary words.
- **Security hardening — ALL COMPLETE ✅ (s17–18, PRs #85–#93):**
  - pnpm migration + react-router vuln fix · Edge Function CORS/caps · self-hosted fonts ·
    CI SHA-pinning · Turnstile CAPTCHA (frontend + Cloudflare + Supabase) · CSP enforcing.
  - See `docs/strategy/SECURITY.md` for full details. No open security items remain.
- **Streak display bug fixed (s18, PR #90):** `useEffectiveStreak()` — no more stale values
  after missed days.
- **Stale SW chunk crash fixed for real (s18, PRs #95, #97):** `recoverFromStaleAssets()` in
  `src/lib/recover.ts` clears caches + unregisters the SW before reloading (round 1's
  reload-only fix wasn't enough, the SW kept re-serving stale `index.html`).
- **Onboarding Zurück button fixed (s18, PR #98):** navigates to `/welcome` on step 1 instead
  of being a dead disabled button.
- **Em dashes removed app-wide (s18, PR #99):** ~30 strings rewritten; rule documented in
  `CLAUDE.md` "Writing style" section for future AI sessions.
- **Real `/privacy` page shipped (s18, PR #100):** `https://genauly.de/privacy` — plain-language
  Datenschutzerklärung, linked from landing footer + Settings; gives the founder a URL for the
  Google OAuth brand-verification form.
- **Clean URLs shipped (s18 cont.):** migrated `/#/...` hash routing to real `/...` paths via
  `createBrowserRouter` + the GitHub Pages SPA redirect trick (`public/404.html` +
  `public/spa-redirect.js`). Verified locally end-to-end with a GitHub-Pages-accurate static
  server + Playwright. **Founder must verify Google sign-in still works live** (the one part
  that can't be tested from the sandbox — see Session 18 log for why).
- **Dialog overlay redesign locked (s19, PRs #106–#109):** dropped backdrop-blur, toned the card
  shadow down ~50% (`shadow-elevated-soft`), replaced the flat black overlay with a brand-tinted
  radial spotlight (`bg-dialog-overlay`) — now the **standard convention for all popups/dialogs**
  going forward (see "Decisions locked" and `CLAUDE.md` → "UI conventions — modal / popup overlays").
- **Sign-in dialog UX fixes (s19, PRs #113–#114):** added a top segmented "Konto erstellen /
  Anmelden" toggle (the old bottom link was easy to miss); removed the inaccurate "we only use
  your email for sign-in" microcopy line.
- **Brand identity unified (s19, PRs #116–#118):** the gradient-Sparkles brand mark was replaced
  app-wide with the actual G-wordmark logo (`/favicon.svg`, also the favicon/PWA icon) in all 6
  spots it appeared — sign-in dialog, mobile header, desktop sidebar, landing page, onboarding,
  and the `/privacy` page header. Sparkles remains as a content/decorative icon elsewhere
  (onboarding step headers, guest-progress notes) per the founder's "keep it for later".

- **Legal pages — bilingual + Terms added (s20, PR #123):** `/privacy` and a new `/terms`
  (Terms of Service / AGB) share a `LegalChrome` shell with a **Deutsch / English toggle** (default
  German, German is binding). Full DE + EN content; em dashes fixed. Footer + Settings link to both.
- **Default logo locked (s20, PRs #120–#122):** rounded gradient "G" with transparent corners,
  canonical file `public/genauly-default-logo-transparent-corners.png`, used in all 6 in-app spots.
  Full-bleed square is for Google's OAuth consent crop only, never the app. (`CLAUDE.md` → "Brand logo".)
- **GDPR pass shipped (s20, PR #126):** consent capture at sign-up + onboarding (`CONSENT_VERSION`),
  in-app data export, in-app account deletion (`delete-account` Edge Function), per-submission writing
  delete (`writing_delete_own` policy, migration 0003), honest reset (also clears cloud when signed in).
  Founder ran the migration + deployed the function live, so all are active. No cookie banner needed.
- **Impressum built but HIDDEN (s20, PR #127):** `/impressum` exists but is unrouted with all links
  removed until the founder provides a business/service address (it is public by law). Re-enable steps
  in `CLAUDE.md`, `docs/plans/PHASE2_SETUP.md`.
- **Writing history records task + text (s20, PRs #128–#129):** the Verlauf now shows the Aufgabe and
  the learner's own submitted text in an expandable, well-structured entry (tip box + labeled sections).
- **Google OAuth consent branding DONE (s20):** founder completed the Google Cloud Console steps
  (app name "Genauly" + logo, domain `genauly.de` verified via Namecheap DNS TXT, app published).

- **Broader B1-B2 positioning (s21, PR #140):** landing page re-copied for "German for real life,
  B1-B2 plateau" framing (exam prep repositioned as secondary); new `/about` page with plain-language
  purpose + Google sign-in data explanation; business plan `docs/strategy/BUSINESS_PLAN.md` v1.1; backlog
  #18 documented. Exam naming corrected throughout public copy.
- **Consent gating fix (s21, PR #141):** sign-up always starts with consent unchecked (previous
  `hasConsented()` pre-check removed); checkbox moved above the Google button so the dependency
  is visually clear. Login tab unchanged.

- **Static pre-render fallback in `index.html` (s22, PR #143):** full purpose text embedded
  directly in `#root` so Google's OAuth branding reviewer (a no-JS HTML crawler) sees the app
  description. React clears it on boot; real users never see it.
- **Tagline unified: "German for real life" (s22, PR #145):** updated all six surfaces that still
  showed the old "German that clicks" tagline (onboarding, landing footer, `package.json`,
  `vite.config.ts` PWA manifest name + description).
- **Home-screen icons full-bleed opaque (s22, PR #146):** `apple-touch-icon.png` + `pwa-*.png`
  regenerated without transparent corners so iOS home-screen icon has no dark corner artifacts.
- **Favicon replaced with real logo PNGs (s22, PR #146):** `favicon-32.png` + `favicon-16.png`
  generated from the actual logo (replacing `favicon.svg` which used a plain system-font "G").
  `index.html` updated to link to the new PNGs; filename change busts browser favicon cache.
- **Google OAuth branding verification re-submitted (s22):** static pre-render fix is technically
  complete. Founder re-submitted via Google Cloud Console. Async review pending (email from Google
  expected; hours to days). Do NOT re-click "I have fixed the issues" again while waiting.
- **Cloudflare Pages migration decided (s22):** founder confirmed migration from GitHub Pages to
  Cloudflare Pages after OAuth branding clears. Migration prep will be done in a future session.

**Security — 100% complete. No open items.**

**Decisions locked:**
- Bottom tab bar = **Start · Wortschatz · Quiz · Fortschritt · Mehr** (Mehr-sheet = other 8).
- Mobile redesign = **Layer 2 ✅ · Layer 3 ✅ — DONE**.
- Keep `src/components/ui/card.tsx` **untouched**.
- Pre-React crash painter is a **permanent** safety net (do not remove).
- **Mobile bottom tab bar design (locked 2026-06-16, PRs #76–#175):** iOS home-screen style
  edit mode, always-colored icons (38% inactive / 100% active), no Fertig button, auto-save on
  outside tap, Home + Mehr fixed. Full spec in `CLAUDE.md` → "Mobile bottom tab bar".
- **Modal/popup overlay design (locked 2026-06-07, PR #108):** brand-tinted radial spotlight
  via `bg-dialog-overlay` + `shadow-elevated-soft` (no flat black, no backdrop-blur) — the
  standard for ALL popups/dialogs/sheets going forward. Already wired into the shared
  `DialogContent`/`DialogPrimitive.Overlay` in `src/components/ui/dialog.tsx`. Full spec in
  `CLAUDE.md` → "UI conventions — modal / popup overlays".
- **Default logo (locked 2026-06-08):** rounded "G" with transparent corners
  (`public/genauly-default-logo-transparent-corners.png`); never full-bleed in the app. `CLAUDE.md` → "Brand logo".
- **Legal/GDPR (locked 2026-06-08):** German is the binding legal-language version; **no cookie
  banner** (functional-only storage is consent-exempt); GDPR rights are in-app self-service. Keep
  `CONSENT_VERSION` (`src/lib/consent.ts`) in lockstep with the legal `LAST_UPDATED`. `CLAUDE.md` → "Legal pages & consent".

---

**Handoff after session 69 (2026-07-06). UX redesign Phase 4 task 4.3 is SHIPPED ✅ (PR #320,
squash SHA `f09da8e`): the Lesen/Hören content bank, the first half of Session B (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **`src/data/texts.ts` (new):** 10 authored authentic-style B1–B2 texts across 9 themes, in the five
  genres the plan names: Behörden letters (`tx_behoerde_anmeldung_brief` B1.2 meldewesen,
  `tx_behoerde_unterlagen_brief` B2.1 antrag), workplace emails (scheduling B1.2, customer/reklamation
  B2.1), memos (meetings/entscheidung B2.1, project B2.2), announcements (technology B1.2, safety B2.1),
  voicemail scripts (travel B1.2, logistics B2.1; these double as TTS listening input in 4.4). Each item:
  `id`/`kind`/`themeId`/`cefr`/`title`/`titleEn`/`de`/`en` + 2–3 MCQ `checks` (30 total, German
  questions, `explain` in English). All names/numbers/offices fictitious; no em dashes.
- **Types (`src/types/index.ts`):** `TextKind` (letter/email/memo/announcement/voicemail), `TextCheck`,
  `ReadingText`; `"text"` added to `ProvenanceContentType`.
- **Linter (`scripts/lint-content.mjs`):** `TEXT_KINDS` closed-enum mirror + `lintTexts` (kind/themeId/
  cefr enums, required fields, **checks length ≥ 2 is an error** (the 4.4 renderer contract), answer
  among options, globally unique check ids via a `texts/checks` sweep, `subThemeId` declared on the
  parent theme, `tx_` prefix warning). Bank loaded, counted (`texts`, `text checks`) and included in
  the provenance cross-check (one row per text; embedded checks ride on the text's row).
- **Provenance:** 10 authored/OWNED rows, `review_status: "draft"` for the founder pass; register now
  **1,121 rows** (1,096 draft / 25 verified). `/sources` (`features/legal/Sources.tsx`) got the required
  label + ordering entry for the new type.
- **Gates:** all green — `build`, `lint` (0 errors), `lint:content` (0 errors/warnings), `test:unit` 59,
  `check:bundle` main chunk **78.9 kB** (bank has no eager consumer; 4.4 must keep it in a lazy chunk).

**Next step:** **task 4.4** (Opus per the plan): `kind: "reading"` composer block (+ listening variant
via `engine/speech.ts` TTS), full-screen text card with tap-gloss + comprehension MCQ in `SessionPlayer`,
results feeding XP/theme progress (NOT vocab FSRS), ~1 block per composed session. Then short Session C
= 4.5 (progression chip) + 4.6 (docs/ship). The founder's pending priority call vs game-plan G1 stands.

---

**Handoff after session 68 (2026-07-05). UX redesign Phase 4 Session A is COMPLETE ✅: task 4.2
(typed-recall block in the loop) shipped, so 4.1 + 4.2 together put tolerant typed forward recall into
the default session and feeding FSRS (plan: `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What shipped:
- **New `kind: "typing"` `SessionBlock`** (`src/types/index.ts`): vocab-only forward recall (EN → typed DE),
  same shape as `speaking` (sourceId/de/en/example).
- **Composer graduation rule** (`src/engine/session.ts`): `graduatedToTyping(card)` returns true when a
  due card is `reps >= 2` AND `(stability ?? interval) >= TYPING_STABILITY_FLOOR` (8 days). Pool 1 maps
  graduated due cards to `typing` blocks (`ty_` key), new/young cards stay recognition `flashcard`s. A
  single lucky first answer never jumps a brand-new word to typing.
- **`TypingBlock` renderer** (`SessionPlayer.tsx`): EN prompt display-size, a typed DE input graded by
  4.1's `gradeTyped`, an "Anzeigen" give-up that grades as a miss, three-tier feedback (success/warning/
  danger tones) with the correct answer + `SpeakButton` + example, latency captured mount→answer. The
  verdict maps onto the SRS `Grade` scale (correct → 4 Good, almost → 3 Hard, wrong → 0 Again); combo/XP
  reward only a clean "correct". `captureLoot` refactored to take an explicit `Grade` (all callers updated).
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit` **59**
  (56 → 59: +3 composer cases for the graduation rule), `check:bundle` main chunk **78.9 kB**.

**Next step:** Phase 4 **Session B = 4.3 + 4.4** (Lesen/Hören content bank `src/data/texts.ts` + the
`reading`/`listening` composer block + renderer), then short Session C = 4.5 (progression chip) + 4.6
(docs/ship). OR pivot to game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`), whose formCloze / dialogue-battle
scenes now have both the tolerant grading (4.1) and a typed-input block pattern (4.2) to build on.


---

**Handoff after session 69 (2026-07-06). UX redesign Phase 4 Session B is COMPLETE ✅: tasks 4.3
(Lesen/Hören text bank, PR #320 `f09da8e`) AND 4.4 (reading/listening composer block + renderer, PR #322
`98c4688`) shipped, so authentic reading/listening input is now live in the composed session (plan:
`docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`).** What 4.4 shipped:
- **New `kind: "reading"` `SessionBlock`** (`src/types/index.ts`): `textId` + a `listening` flag.
- **Composer** (`src/engine/session.ts`): Pool 6 emits **exactly one** reading block per session; prefers a
  text on the scoped/weak theme, else one in the active Mode lens, else any. A voicemail text plays as a
  **listening** variant when the caller reports TTS (new pure `listening` opt, player passes
  `ttsSupported()`); every other genre renders as readable text. `test:unit` gained 3 composer cases.
- **`ReadingBlock` renderer** (`src/features/session/ReadingBlock.tsx`, new — extracted so `SessionPlayer`
  stays under the ~1000-line line the plan flagged): a two-stage full-screen focus block. Read/listen stage
  (genre + CEFR badges, tap-gloss title, `Übersetzung` toggle; listening = TTS play/replay with a
  `Text anzeigen` reveal fallback), then the 2–3 comprehension MCQs one at a time (reuses the quiz MCQ
  styling + `explain`). `XP.readingCheck` (8) per correct check; the block registers ONE aggregate tally
  result (majority-correct) at completion, so it never inflates correct/total, and it **never touches vocab
  FSRS** (comprehension practice, not a graded SRS card — keeps 4.5's "no new state" invariant intact).
- **Gates:** all green — `build`, `typecheck`, `lint` (0 errors), `lint:content`, `test:unit` **62**,
  `check:bundle` main chunk **78.9 kB** (bank + renderer ride the lazy session-route chunk).

**Next step:** short Session C = **4.5** (visible per-theme progression chip on the Fortschritt theme grid
+ city-building tap, derived from existing FSRS/theme-mastery state, **no new state** — Sonnet) + **4.6**
(gates/docs wrap). OR the standing alternative: pivot to game plan G1 (`GAME_IMPLEMENTATION_PLAN.md`, still
PROPOSED), whose formCloze / dialogue-battle scenes now have the tolerant typed grading (4.1), the typed
block pattern (4.2), and the authentic-input block pattern (4.4) to build on.
