# Project Status & Decision Log

_Last updated: 2026-07-05 (Bibliothek Grammatik tile bounce-to-Wörter fix, session 59). The working branch is
reassigned every session, so **`main` is always the source of truth**. Product name: **Genauly**
(domain `genauly.de`)._

This file is the single place to re-orient when resuming work. **The one authoritative "what to do next"
pointer is the `## Resume here (next session)` section near the end of this file** — start there. Older
detailed session logs (sessions 4–46) are archived in `docs/archive/PROJECT_STATUS_ARCHIVE.md`. The "why"
behind locked decisions is in `docs/DECISIONS.md`. For the full design, see `docs/archive/EXPANSION_PLAN.md`;
for the original build plan, `docs/archive/IMPLEMENTATION_PLAN.md`.

## Who I'm working with
- **Founder is non-technical.** Operate as a seasoned CTO: be decisive and opinionated, minimize
  the founder's operational burden, protect them from surprise costs, and aim for an award-worthy,
  genuinely useful product — not just feature parity.

## Where things stand

### Original SPA — live (on `main`)
- Full client-side SPA: onboarding, dashboard, vocabulary (flashcards/quiz/list), redemittel
  (browse + practice), branching simulations, timed exam mode, analytics, settings.
- Engines: SRS (`engine/srs.ts`; SM-2 originally, swapped to FSRS-6 in s53 / PR #275), XP/levels/tiers
  (`engine/scoring.ts`), Web Speech TTS/STT (`engine/speech.ts`), branching dialogue runner
  (`engine/dialogue.ts`).
- State: zustand stores persisted to localStorage (`b2beruf.progress.v1`, `b2beruf.settings.v1`).

### Phase 1 — SHIPPED & LIVE ✅ (on `main` via `pages.yml`, founder-verified 2026-05-30)
- **Types (1A):** `GrammarTopic`/`GrammarDrill`/`GrammarGroup`, `Collocation`, leveled
  `QuizQuestion` union (`MCQQuestion`/`WordOrderQuestion`/`MatchingQuestion`), `PracticeArea`
  + `WeaknessCategory` — all in `src/types/index.ts`.
- **Engine (1B):** `src/engine/quiz.ts` `buildThemeQuiz(themeId, difficulty, count)` generates
  mixed sets from vocab/collocations/grammar banks; reuses SRS (`reviewVocab`) + scoring.
  Added `XP.quizEasy/quizMedium/quizHard/grammarDrill`.
- **Content (1C):** `src/data/collocations.ts` (**396** Nomen-Verb pairs, ~36/theme);
  `src/data/grammar.ts` rewritten to **11 `GrammarTopic`s** w/ drills (Konnektoren, Relativsätze,
  da-/wo-Wörter, Verbstellung/TeKaMoLo, Nebensätze, Kasus, Nomen-Verb, K-II, Modal, Passiv);
  `redemittel.ts` grown to **72**; **10 connectors** added to vocab (**304** words);
  `src/data/practiceAreas.ts` weakness→deep-link registry.
- **UI (1D):** `/grammar` (`features/grammar/GrammarHub` + `GrammarDrillCard`) and `/quiz`
  (`features/quiz/QuizHub` + `QuizRunner`), both query-param driven (`?topic=`, `?theme=&level=`).
  Wired into Sidebar, router (guarded), and Dashboard daily-module tiles.
- **Verified live:** Grammar topics + drills and the leveled theme quizzes work on the deployed
  Pages site; `npm run build` green; no duplicate ids.

### Branding — DONE (live)
- App named **Genauly**, tagline **"German for real life"** (header, sidebar, onboarding,
  `<title>`/meta, `package.json` description, PWA manifest). Custom domain **genauly.de** (CNAME shipped).
  Tagline was updated from the old "German that clicks" across all six surfaces in session 22 (PR #145).
- **Default logo (locked 2026-06-08):** the **rounded gradient "G" with transparent corners**.
  The canonical file is **`public/genauly-default-logo-transparent-corners.png`** and it is the
  default logo in every in-app spot (sign-in dialog, mobile header, desktop sidebar, landing,
  onboarding, `/privacy`). Favicon uses PNG files (`public/favicon-32.png`, `public/favicon-16.png`)
  generated from the real logo (replacing the old `favicon.svg` which rendered a plain system-font "G").
  `public/pwa-*.png` and `apple-touch-icon.png` are **full-bleed opaque** (no transparent corners)
  so iOS home-screen icons don't show dark corners on the OS rounding mask.
  - **Do NOT make the in-app logo full-bleed.** A full-bleed square variant exists **only** for
    Google's OAuth consent screen (its circular crop shows white through transparent corners). It
    is not committed to the repo and must not replace the app logo. (Full-bleed-everywhere was
    shipped then reverted in PRs #120/#121 — keep the app on the rounded transparent logo.)

### Phase 2 — SHIPPED & LIVE ✅ (squash-merged to `main` 2026-05-31, founder-verified)
- Supabase auth + cloud sync + AI writing eval fully deployed and smoke-tested by founder.
- **Supabase project:** `stkfdavpjflpqoxjunnj`. Publishable key committed in
  `src/lib/supabaseConfig.ts` (safe — all tables owner-only RLS). Service-role key and Anthropic
  key live only in Supabase Edge Function secrets (never in the repo or browser).
- **2A schema:** applied via Supabase dashboard SQL editor — `profiles`, `progress`,
  `writing_evaluations`, `ai_usage`, owner-only RLS, auto-provision trigger on auth.users,
  `bump_ai_usage` atomic RPC. `profiles.tier` flag present (monetization-ready).
- **2B auth + sync:** `useAuthStore` (guest anon sign-in + email magic-link); `cloudSync.ts`
  (offline-first: localStorage stays cache, pull+MERGE on login, debounced write-through).
  `AccountPanel` shown in Settings. **Guest sign-in works and is the primary path.**
  Email sign-in works when clicked through but has rate-limit issues on Supabase's free SMTP
  (fix: add Resend SMTP in Auth settings — deferred).
- **2C writing UI:** `/writing` route live; short/long tasks per theme; one insight card + "Üben"
  deep-link via `practiceAreas` registry. Added to Sidebar + Dashboard daily modules.
- **2D edge function:** `evaluate-writing` deployed via Supabase dashboard code editor (NOT CLI —
  sandbox network blocks `api.supabase.com`). Daily limit (5/day) + monthly auto-shutoff ($5 cap)
  + input-hash cache + LanguageTool pre-check (templated spelling path = no LLM cost) + one Haiku
  call fallback chain. **Verified working end-to-end** — founder test returned correct spelling
  insight with "Rechtschreibung üben" deep-link.
- **Known deployment quirk:** the Supabase dashboard pre-fills a "Hello [name]!" boilerplate when
  creating a function. Must select-all-delete before pasting the real code. Caught and fixed.
- **Anthropic key:** ✅ rotated by the founder (the original, once pasted in chat, is dead). The
  live secret lives only in Supabase Edge Functions → Secrets → `ANTHROPIC_API_KEY`.
- Bundle is now ~1.41 MB (supabase-js); code-splitting still deferred.

## Decisions locked
1. **Sequencing:** phase it, **content first**. Phase 1 = content + grammar + leveled quizzes
   (100% client-side, ships alone). Phase 2 = Supabase auth + cloud sync + AI writing eval.
2. **Business model:** free, guest-first, **monetize later**. Build a `tier` flag + usage counters
   + feature flags now so a paid tier drops in with no rewrite. No B2B/multi-tenant yet.
3. **AI cost posture:** shoestring. Claude **Haiku only** in production; Gemini Flash / gpt-4o-mini
   are fallbacks **only on hard failure**. Aggressive caching by input hash. ~3–5 reviews/user/day.
   Monthly spend cap with **auto-shutoff**. Target: low single-digit $/month at hundreds of users.
4. **Writing engine:** hybrid — hosted **LanguageTool** categorizes errors (often no LLM call
   needed); one LLM call only to prioritise/phrase the single biggest weakness.
5. **Auth/data:** **full cloud sync** — anonymous guest + email/OAuth; progress moves to Supabase
   Postgres; guest→account upgrade preserves data.
6. **Vocabulary architecture:** **NO RAG / no vector DB.** Curated static dataset, expanded only
   from open-licensed sources (Tatoeba CC-BY, Wiktionary/Wikidata CC-BY-SA, DWDS/Leipzig freq).
   Goethe Wortlisten, Routledge, and Klett textbooks are copyrighted → excluded.
7. **Infra ownership:** founder provides the Supabase project + Anthropic key (optional Gemini/
   OpenAI fallback keys) + hosted LanguageTool key + a monthly spend ceiling. Keys live in Supabase
   Edge Function secrets, never in the browser.

## Research findings to reuse (don't re-research)

### Licensing guardrails for commercial use
Only use content under these licenses — anything else blocks monetization:
- **CC0** — public domain, no restrictions whatsoever.
- **CC BY** — free commercially; must credit the source.
- **CC BY-SA** — free commercially; modified versions must carry the same license.
- **CC BY 2.0 Fr** (Tatoeba's licence) — commercial-friendly; attribute the platform.
- ⚠️ **Never use CC BY-NC or CC BY-ND** — NC = non-commercial, ND = no derivatives; both block a paid app.

### Approved open-licensed sources (commercial-safe)
| Source | What it provides | Licence | Notes |
|---|---|---|---|
| **Tatoeba** | Hundreds of thousands of DE↔EN sentence pairs; community audio | CC BY 2.0 Fr | Best source for authentic example sentences; bulk download available |
| **Wiktionary / Wikidata** | Genders, plurals, inflections, definitions | CC BY-SA 4.0 | Good for vocab schema fields (article, plural) |
| **DWDS / Leipzig Wortschatz** | Word frequency, collocations, usage examples | Various (check per dataset) | APIs available; great for B2-level frequency filtering |
| **Wikibooks: German** | Structured grammar tables, vocabulary modules, A1→advanced | CC BY-SA 4.0 | Can integrate text into app; must keep project open-source under same licence if distributing modified version |
| **Wikimedia Commons** | Isolated German audio pronunciations by native speakers, illustrations | Mostly CC0 / CC BY / CC BY-SA (filter on-site) | Filter search to commercial-only before downloading any asset |
| **Project Gutenberg** | Original German texts (Kafka, Goethe, Brothers Grimm) | Public Domain | Copyright expired; freely slice, remix, sell as reading modules |
| **LibriVox** | Audiobook recordings of public-domain German texts | Public Domain | Volunteer-recorded; pairs with Gutenberg texts |

### Sources to avoid / handle with care
- **Goethe Wortlisten, Routledge Frequency Dictionary, all Klett books** (Netzwerk, Aspekte, Sicher!, Linie 1 Beruf) — fully copyrighted, no commercial reuse.
- **Deutsche Welle (DW)** — free for personal/educational use only; *not* universally CC-licensed for commercial redistribution. Check specific file metadata before using any DW asset; contact their distribution team if in doubt.

### Open-source infrastructure worth evaluating
- **AnkiDroid / AnkiCore ecosystem** — underlying SRS algorithm and app variants are open-source. Could inform future SRS improvements (the current `engine/srs.ts` implements SM-2 independently).
- **LARA (Learning and Reading Assistant)** — open-source platform for building interactive reading materials with audio + translation. Relevant if we add a reading-comprehension module later.

### Writing eval infrastructure
- LanguageTool (LGPL, hosted API w/ free tier) for error categories; RAG is overkill for a single-insight output.
- Supabase supports anonymous sign-in, pgvector (unused), Edge Functions for secret-safe LLM calls from a static GitHub Pages SPA.

## Founder action items
- [x] Create a Supabase project; share URL + publishable key. (`stkfdavpjflpqoxjunnj`, committed)
- [x] Provide Anthropic (Claude) API key. (set in Supabase secrets as `ANTHROPIC_API_KEY`)
- [x] Decide the monthly AI spend ceiling. (**$5/month**, enforced in the function)
- [x] Apply schema via SQL editor. (done 2026-05-31)
- [x] Enable Anonymous sign-in. (done; email also enabled — **must stay ON**: guest flow, AI
      writing coach `lib/writing.ts`, and guest→account upgrade all depend on it.)
- [x] **Disable "Confirm email"** so sign-up logs in instantly. (done 2026-06-01 — banner now clears
      on sign-up, founder-verified.)
- [x] Set Site URL in Auth settings. (done)
- [x] Deploy `evaluate-writing` function via dashboard code editor. (done 2026-05-31)
- [x] Smoke-test end-to-end. (✅ working — spelling insight returned correctly)
- [x] **Rotate the Anthropic key** (the one pasted in chat) — done; new key set in Supabase Edge
      Functions → Secrets → `ANTHROPIC_API_KEY`.
- [ ] (Optional) Add Resend SMTP to fix email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      The cached dialog still shows the old failure (that is the previous attempt's result, not a new
      evaluation). Google's async re-review takes hours to days; the founder should wait for an email
      from Google's Trust and Safety team. **Do NOT re-click "I have fixed the issues" again while
      waiting.** If the email says issues remain, escalate via the Google Developer forums or reply
      to the Trust and Safety email with the raw-HTML evidence (the static text is visible in
      `view-source:https://genauly.de`).

## Deploy / workflow reminders
- `main` is production; merging to it triggers `pages.yml` (the **only** workflow now — the old
  `deploy.yml`/`gh-pages` fallback is gone). Develop on the automation branch assigned for the session
  (reassigned each session; `main` is always the source of truth); ship via
  squash-merge PR. **Always verify `pnpm build` is green on the exact commit before merging**
  (a skipped check shipped two broken builds in session 2).
- **Feature-branch pushes are NOT live.** Only `main` deploys. In session 3 the founder reported
  "I don't see any change" because the dark-mode commits were pushed to the branch but never merged.
  **Auto-ship preference (founder approved 2026-06-01): when a change is done and the build is green,
  open + squash-merge the PR yourself without asking** — see CLAUDE.md.
- **REQUIRED post-deploy housekeeping (after every squash-merge):** realign the dev branch so it
  doesn't drift and conflict on the next PR — `git fetch origin main` → `git reset --hard origin/main`
  → `git push --force-with-lease origin claude/vibrant-meitner-mfl9xk`. (Forgetting this caused the
  PR #23 merge conflict.) Full checklist in CLAUDE.md → "Post-deploy GitHub housekeeping".
- Sandbox can't reach the live site or run Docker (so no local Supabase / no live verification
  here) — those steps are handed to the founder, same as the Pages deploy.

## Deploy / ops notes (accumulated)
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

## Backlog — founder ideas (not yet scoped, added 2026-06-07)
Raw list from the founder, for future planning sessions to scope, sequence, and break into
phases. None of these are started; treat as candidates for the next `EXPANSION_PLAN.md` revision.

1. **Redesign the Dashboard** (the home/progress screen).
2. **Gate Schreibtraining behind sign-in:** show the login/sign-up popup (`AuthDialog`) when a
   signed-out guest tries to use Schreibtraining, instead of letting them in freely.
3. **Animated-character scenario simulations:** visual, contextual practice — simulate real
   workplace scenarios with animated characters (beyond today's text-based branching dialogues).
4. **Visual mnemonics for vocabulary:** icons/illustrations per noun gender — e.g. man, woman,
   baby/neutral or non-living-thing — to aid visual memory of `der`/`die`/`das`.
5. **Domain-based filtering for Vocabulary, Collocations, and scenario-based learning:**
   split content into "Bürokratie / bureaucratic work" vs. "office work," and within office
   work, further filter by industry/sector.
   - **SCOPED 2026-06-26 (session 41).** This is now designed in `docs/archive/TAXONOMY_REDESIGN.md`
     (+ `.pptx`) and planned in `docs/archive/TAXONOMY_IMPLEMENTATION_PLAN.md`: a faceted Domain → Theme →
     Sub-theme model with a Work/Personal/Both **Mode** lens and work-only **sector** facet (the
     industry/sector split the founder asked for). Not built yet; Phase 0–1 is the next build step.
6. **Redesign the Schreibtraining section.**
7. **Sourcing/audit infrastructure for content data:** build a data structure + pipeline to
   scrape from reliable open-licensed sources (see "Approved open-licensed sources" above), with
   a clear, audit-ready human-verification workflow. Every data point in the app should carry
   a clear source, verified status, and other metadata, tracked in an Excel/CSV in the project
   folder (not just inline in the TS files) so it's reviewable independent of the code.
   - **Now elaborated in `docs/strategy/DATA_GOVERNANCE.md` (v0.2, added 2026-06-14, revised 2026-06-15):** the
     full governance roadmap, provenance-register schema, commercial-safe license allowlist (SPDX) +
     planned machine gate, four-eyes workflow, and a phased path mapping to ISO/IEC 42001 + EU AI Act
     Article 10. **Founder policy (v0.2): traceability over ownership** — every item traces to an
     authoritative reference (Wiktionary / DWDS for word facts) or a commercial-safe source (Tatoeba
     CC-BY for example sentences); AI-assisted drafting must be verified and cited, not claimed as
     `OWNED`. Phase 1 (provenance register + reference/license gate in the linter + back-fill existing
     content) is the recommended next build step.
8. **Pricing page + plan design:** create a pricing page and design the various paid plans/tiers
   to offer (ties into the "monetize later" decision and the planned `tier` flag).
9. **Payment gateway integration:** add a payment provider so the plans in #8 can actually be
   purchased/billed.
10. **FAQ section on the landing page.**
11. **Expand landing page copy:** the landing page's body copy needs more substance/depth overall
    (beyond just adding an FAQ).
12. **SEO:** make the whole app + landing page SEO-friendly and take concrete measures so it
    surfaces in Google search results (meta tags, structured data, sitemap, performance, etc.).
13. **Marketing campaign:** plan and run a marketing campaign to drive signups/awareness.
14. **GDPR compliance (IN PROGRESS, s20 2026-06-08):** audit done + first robust pass shipped.
    Delivered: sign-up/onboarding consent checkbox with recorded consent (`CONSENT_VERSION`),
    in-app data export, in-app account deletion (`delete-account` Edge Function), per-submission
    writing delete (+ `writing_delete_own` RLS policy), honest reset that also clears cloud, a
    bilingual `/impressum` page, and privacy/terms copy updates (email usage, language-precedence,
    data-location, self-service rights). Decision: **no cookie banner** (functional-only storage is
    consent-exempt). Founder one-time steps in `docs/plans/PHASE2_SETUP.md` (deploy function, run
    migration 0003, optionally enable pg_cron retention, fill Impressum + region placeholders).
    Still open: lawyer review (#15), real Impressum details, optional auto-retention, marketing
    opt-in UI once a campaign (#13) is built.
    - **Impressum TEMPORARILY HIDDEN (founder, 2026-06-08):** the founder prefers not to put a home
      name/address in the public Impressum yet (an Impressum is public by law; a GitHub secret can't
      hide it since the page renders it to everyone). So `/impressum` is built but unrouted and all
      links removed; `Impressum.tsx` stays in the repo. Re-enable with a business/service address
      (a "ladungsfähige Anschrift", not a P.O. box) during the lawyer/launch pass: uncomment the
      import + route in `router.tsx` and restore the footer/Settings/privacy/terms links.
    - **Email-usage note (2026-06-07):** when doing this, make the privacy policy explicitly
      cover *every* way email is used — auth/login, password reset + account recovery, and any
      future transactional mail (payment receipts/billing) and marketing mail — and add proper
      opt-in consent for anything marketing-related. Context: we removed the "Wir nutzen deine
      E-Mail nur für die Anmeldung" line from the sign-in dialog (PR #114) because that promise
      was already a stretch (reset/recovery) and would be broken outright once the marketing
      campaign (#13) and payment gateway (#9) ship. So the policy must not repeat that narrow
      "only for sign-in" claim.
16. **Business plan + case study (added 2026-06-11, v1.1 shipped 2026-06-12):** produce a
    well-researched business plan and case study for Genauly — covering market sizing, competitive
    landscape, product-led growth model, unit economics, and traction narrative. Delivered in
    `docs/strategy/BUSINESS_PLAN.md`. Updated in v1.1 to reflect the broader positioning (see #18).
    Intended as a foundation for investor conversations and pre-seed fundraising (#17). Recommended
    model: **Fable** (research-heavy strategy work).
17. **Pre-seed funding (added 2026-06-11):** plan and execute a pre-seed fundraising round.
    Scope includes identifying suitable investors (edtech / language-learning / EU-focused), preparing
    pitch materials (deck, one-pager, data room), and deciding on instrument (SAFE, convertible note,
    or priced round). Depends on #16 (business plan) being substantially complete. Recommended
    model: **Fable** for strategy/pitch drafting.
18. **Reposition and redesign for the broader B1-B2 real-life purpose (added 2026-06-12):**
    The founder confirmed that Genauly's purpose is broader than exam prep. The primary audience is
    anyone who has learned basic German (around B1) and is stuck at the intermediate plateau: they
    can manage simple exchanges but lack confidence in real-life situations. The app should help them
    practise the situations that actually matter — presentations at work, visits to the Behörde,
    doctor appointments, job interviews, difficult conversations with colleagues — not just the
    ten current workplace/meeting themes.

    **What this backlog item covers (to be scoped and phased):**
    - Content expansion: add new scenario themes beyond the current workplace focus.
      Priority candidates: Behörde/bureaucracy, healthcare/doctor, job-hunting/interviews,
      social/housing, and public-transport/daily-life. Each theme needs dialogues, vocabulary,
      collocations, Redemittel, grammar drills, and quizzes at three levels.
    - Navigation and UI redesign: the current topic structure ("Meetings", "Logistics", etc.)
      maps to the old workplace-only framing. Redesign the topic browser, Dashboard, and
      onboarding flow to present the app as a situation-based real-life German tool, with
      workplace as one of several life domains.
    - Branding and copy alignment: update app shell labels, onboarding copy, and in-app
      descriptions to match the "German for real life, B1-B2" positioning (not "B2 Beruf exam
      prep"). Public-facing copy (landing, /about) was updated in the 2026-06-12 session;
      in-app copy still reflects the old framing.
    - Exam prep preserved but repositioned: the telc B2 Beruf and Goethe B2 exam-prep value is
      real and should remain, positioned as one benefit of the broader real-life practice, not
      the primary hook.
    - Do NOT hard-code specific content counts (word counts, scenario counts) in UI copy or
      marketing; the library is growing and numbers will be outdated quickly.
    - Recommended model for the design/planning phase: **Fable** (creative + strategic).
      Implementation: **Opus** for cross-section rework, **Sonnet** for mechanical content work.
    - **PROGRESS (2026-06-20):** the **first daily-life content pack shipped**, theme `behoerde`
      (Behörden & Ämter): ~25 vocab, 12 collocations, 2 branching scenarios (levels 1–2), 1 writing
      prompt, provenance rows. It auto-surfaces in Quiz/Vocabulary/Collocations/Simulation (those
      map over `themes` / group scenarios by level), so no UI redesign was needed. Counts now: 515
      vocab, 396 collocations, 12 dialogues, 11 themes. This is the reference template for the
      remaining packs (banking, healthcare, housing). Still open under #18: the nav/Dashboard
      "situation-based" redesign and the Bürokratie-vs-Office domain grouping (backlog #5).
      Scoping doc: `docs/strategy/AI_PRODUCT_STRATEGY.md`.
15. **Legal review with a lawyer (founder, 2026-06-08):** the live `/privacy` and `/terms` (AGB)
    pages were written in plain language by the team, not a lawyer. Before any paid plans (#8/#9)
    or a marketing campaign (#13) launch, have a qualified lawyer review both for German/EU
    enforceability. Likely additions a lawyer will want: a proper **Impressum (§5 TMG)** with the
    operator's real name + address, a clause on **which language version prevails** if DE and EN
    differ, withdrawal/cancellation rights for paid plans (Widerrufsrecht), and tightened
    liability wording. Ties into the GDPR-compliance item (#14).
    - **Disclaimer-banner question (2026-06-08):** founder asked whether the live pages should say
      the terms are "in development / under review." Recommendation: **no.** Calling your own terms
      provisional weakens their enforceability and looks unfinished; the "Zuletzt aktualisiert" date
      already signals they evolve. Keep the internal "needs lawyer review" caveat in this backlog,
      not user-facing. **Founder confirmed 2026-06-08: no banner.** (Revisit only the
      language-precedence line + Impressum during the lawyer pass.)
19. **Certification landscape deep-research — DONE (2026-06-15).** Completed via the deep-research
    harness (5 parallel cited passes). Output: **`docs/strategy/CERTIFICATION_RESEARCH.md`** (full findings +
    sources), with conclusions folded into `DATA_GOVERNANCE.md` v0.3. Headlines: we are **most likely
    NOT high-risk** under the EU AI Act (Annex III(3) is institution-tied; formative feedback + the Art.
    6(3) carve-out likely keep us out), with **profiling** and **institutional gating** as the two flip
    risks; **Article 50 transparency** (tell users they're interacting with AI / mark AI output) is a
    real obligation by **2 Aug 2026**; when we certify, sequence **ISO 27001 then ISO 42001** via TÜV
    NORD/SÜD (~$15K to $60K per standard); SOC 2 is US-centric, defer. Cheap trust signals exist (MISSION
    KI, Art. 95 code, Comenius EduMedia, Fraunhofer KI-Prüfkatalog). **Still needs a lawyer's sign-off**
    on the risk class (ties into #15). Spawned a new action #21 (ship Art. 50 transparency).
20. **Redo the logo — too close to Canva (added 2026-06-15):** the founder noticed the current
    Genauly mark (rounded gradient square with a white "G") looks very close to the Canva logo and
    wants it redesigned into something distinctive. Scope when picked up:
    - Design a new brand mark that is clearly differentiated from Canva (and other rounded-gradient-
      square app icons). Keep it legible at favicon size and recognisable on a home screen.
    - Once approved, regenerate **every** asset that currently uses the mark, matching the existing
      treatment rules in `CLAUDE.md` → "Brand logo": the canonical in-app file
      `public/genauly-default-logo-transparent-corners.png` (rounded transparent corners, used in all
      in-app spots), the favicons (`favicon-32.png`/`favicon-16.png`, rounded transparent corners),
      and the **full-bleed opaque** OS icons (`apple-touch-icon.png`, `pwa-192x192.png`,
      `pwa-512x512.png`, `pwa-maskable-512x512.png`). Also refresh the full-bleed square variant used
      for Google's OAuth consent crop (not in the repo).
    - Recommended model: **Fable** for the design direction, then **Sonnet** for the mechanical
      asset regeneration + wiring.
21. **EU AI Act Article 50 transparency (added 2026-06-15, from the #19 research):** before **2 Aug
    2026**, add a clear disclosure wherever the app gives AI feedback that the feedback is AI-generated
    and that the user is interacting with an AI. Small UI/copy change (likely a one-line note on the
    Schreibtraining/feedback surfaces + a line in the privacy policy). Also write the documented
    **Article 6(3) risk assessment** (are we high-risk? answer the profiling question) so it exists on
    file. Detail and sources in `docs/strategy/CERTIFICATION_RESEARCH.md`. Confirm scope with the lawyer (#15).
    Recommended model: **Sonnet** (mechanical), legal nuance to **Opus**.
22. **Comprehensive end-to-end data strategy (added 2026-06-23):** produce a single coherent strategy
    document (e.g. `docs/DATA_STRATEGY.md`) covering the **full lifecycle of every kind of data in the
    app**, unifying threads currently spread across `DATA_GOVERNANCE.md`, `EXPANSION_PLAN.md`, and
    `PHASE2_SETUP.md`. Scope when picked up:
    - **Inventory by data class:** learning content (`src/data/*`), the provenance register, user
      progress + SRS state, writing submissions + AI feedback, settings + consent, and any analytics.
    - **Where each lives and how it flows:** localStorage (`b2beruf.*`), Supabase `profiles.settings`
      jsonb via `cloudSync`, the writing/delete-account Edge Functions, and AI-provider round-trips.
    - **Lifecycle:** acquisition/sourcing, validation (`lint:content`, `check:refs`), the four-eyes
      verification roadmap (draft → verified), Tatoeba example-sentence sourcing, retention/deletion
      (GDPR export + delete), and backup/migration.
    - **Governance & compliance:** how it satisfies EU AI Act Art. 10 / ISO 42001, the licence
      allowlist, and the audit-ready posture already built.
    - **A data model / ERD** and a roadmap of the gaps. This is the strategic umbrella over the
      audit-ready stream (#7). Recommended model: **Fable** (strategy; **Opus** while Fable is
      restricted).
23. **Detailed visualization plan for all learning components (added 2026-06-23):** produce a thorough
    design + data-viz plan (e.g. `docs/VISUALIZATION_PLAN.md`) for how **every learning component is
    visually presented** and how progress/data is visualized, consistent with the locked design system
    (bottom nav, dialog overlays, brand, two-tone icons). Scope when picked up:
    - **Component by component:** Vocabulary (flashcards, der/die/das gender colour-coding, visual
      mnemonics — ties #4), Collocations, Grammar drills, Redemittel, Dialogues/Simulations (ties #3),
      Exam mode, Quiz, and the Writing coach.
    - **Progress & data visualization:** the Dashboard (ties #1) and Analytics — SRS due/mastery
      views, XP/levels/streaks, per-theme and per-weakness breakdowns, using the existing `recharts`
      dependency. Define a consistent chart language.
    - **Cross-cutting:** a shared visual vocabulary, empty/loading/error states, motion
      (`framer-motion`) guidelines, dark-mode, and accessibility (contrast, reduced-motion).
    - Deliver mockups/specs per component and a build order. Ties into #1 (Dashboard redesign) and #6
      (Schreibtraining redesign). Recommended model: **Fable** (design direction; **Opus** for now),
      **Sonnet/Opus** for the build.
24. **Deep-dive source review + source strategy (added 2026-06-25):** properly review **every external
    source the content relies on**, confirm each one's **licence and commercial-use terms**, and write a
    coherent **source strategy** as a strand of the data strategy (#22). This is the qualitative "are
    these the right sources, and are we allowed to use them?" pass that complements the mechanical
    `check:refs` link-liveness gate. Scope when picked up:
    - **Audit the sources actually in use:** start from `SOURCE_META` in `src/features/legal/Sources.tsx`
      and the host breakdown the `/sources` page computes from `src/data/provenance.ts` (currently
      Wiktionary, DWDS, Wikipedia, Europarat/CEFR). For each: confirm the real licence + version, whether
      commercial use and our specific use (citing word facts vs. copying lists/sentences) is permitted,
      what attribution it requires, and stability/accessibility of the URL.
    - **Fix problem sources:** e.g. the founder flagged a **dwds.de** item whose reference "asks me to
      login" — find a freely-viewable, citable alternative (or a stable deep link). Generally prefer
      sources that are open without login and unambiguously commercial-safe.
    - **License hygiene:** reconcile what `SOURCE_META` claims against the commercial-safe SPDX allowlist
      the linter enforces and the `provenance.ts` `license` field; flag any mismatch (e.g. CC BY-SA
      share-alike implications for any adapted text, DWDS "reference" status).
    - **Define the strategy:** a ranked list of approved sources per content type (word facts, example
      sentences, grammar, level descriptors), the rule for when each may be used, the attribution
      pattern, and a fallback order. Capture it in `docs/strategy/DATA_GOVERNANCE.md` (or the planned
      `docs/DATA_STRATEGY.md` from #22) so future content authoring follows it.
    - Ties into **#7** (audit infrastructure) and **#22** (end-to-end data strategy); this is the
      "sources" chapter of that umbrella. Recommended model: **Fable** (research/strategy; **Opus** for
      now while Fable is restricted).
25. **"EN" peek/translate button (added 2026-07-02, founder idea, NEEDS BRAINSTORMING):** a button at
    the top of the app that translates the whole current screen to English at once, temporarily; the
    founder's sketch is "show EN for a few seconds, then it locks/reverts" so a learner gets a quick
    comprehension check without abandoning German immersion. **Deliberately parked**: the founder wants
    to brainstorm the interaction before anything is built. Notes for when picked up:
    - Pedagogically a "comprehension safety net" on top of the German-first copy policy (see
      `docs/archive/UX_OVERHAUL_PLAN.md` Part H, decision 3). The playbook favours desirable difficulty, so a
      deliberate-friction reveal (e.g. press-and-hold to peek) may beat a free toggle.
    - **Prerequisite already planned:** the UX-overhaul Phase-0 German copy pass keeps every EN string
      as data (blurbs, purposes, etc.), which is exactly what a whole-screen EN layer needs. No conflict.
    - Open questions to brainstorm: what does "the whole screen" cover (UI chrome, learning content, or
      both)? Reveal per screen or per element? What does "locked" mean afterwards (cooldown, daily peek
      budget, nothing)? Accessibility (reduced motion, screen readers).
    - Recommended model: **Fable** for the interaction-design brainstorm, **Sonnet** for the build.

### Product-evaluation findings (added 2026-07-03, from `docs/strategy/PRODUCT_EVALUATION.md`)

The five items below (#26–#30) are the recommendations from scoring Genauly against the learning-science
playbook (`docs/reference/LANGUAGE_LEARNING_SUCCESS_FACTORS.md`, Section 11). Each carries a **priority** on a
value·evidence ÷ effort basis (P1 = do first, P3 = nice-to-have) and names the evaluation dimension /
failure mode it closes. Suggested sequence: land the cheap wins that ride alongside other work (#26a
latency logging, #28, #30), then the two big rocks (#27 then #26b), with #29 paired to the AI roadmap.

> **SCOPED 2026-07-03 → `docs/plans/LEARNING_ENGINE_PLAN.md`; ALL FIVE ITEMS SHIPPED ✅ (Phase 0 =
> 26a + #28 + #30 in s51/PR #271, Phase 3 = #29 in s52/PR #273, Phase 1 = 26b FSRS in s53/PR #275,
> Phase 2 = #27 speaking block in s56/PR #284).** Only the optional Phase 1.5 latency plug-in
> remains. The summaries below are the original scoping record; the as-shipped notes live in the
> plan doc and the "Resume here" handoffs.

26. **FSRS scheduler + response-latency capture — Priority P1 (High).** _Fixes eval dim 1; failure mode
    #1._ The playbook's single most-cited upgrade: replace the SM-2 scheduler (`src/engine/srs.ts`) with
    **FSRS** (stability / difficulty / retrievability), which the source reports cuts review volume ~23%
    at equal retention, and score reviews on **latency, not just correctness**. Split into two sub-steps:
    - **26a (quick win, do now):** start *recording* per-review response latency in the review flow and
      SRS card state, even before changing the algorithm, so the training data exists when FSRS lands.
      Small, low-risk, unblocks 26b. Effort: **S**.
    - **26b:** swap SM-2 → FSRS behind the existing `engine/srs.ts` interface (a drop-in the UX plan
      appendix already anticipates), keeping "mastered" cards in long-term rotation. Effort: **M–L**.
    - Recommended model: **Opus** (algorithm + engine correctness).
27. **Speech-first, latency-tracked production drill — Priority P1 (High).** _Fixes eval dim 5 (the
    lowest score, 3/5); failure mode #2._ The blueprint's top exercise recommendation: hands-free,
    time-pressured speech-recognition drills that build spoken fluency, which today's scripted
    option-selection speaking does not. **MVP:** a new `SessionPlayer` block that prompts the learner to
    *say* the target under a soft timer, captures it via the existing Web Speech STT (`src/engine/
    speech.ts`, already feature-detected), and scores accuracy + latency; graceful text fallback when STT
    is unavailable. Upgrade path to Azure/SpeechAce phoneme scoring behind a paid tier later. Effort:
    **M–L.** Recommended model: **Opus** (new session block + speech integration).
28. **Guess-before-reveal (errorful learning) — Priority P2 (Medium, quick win).** _Fixes eval dim 1;
    failure mode #3._ Prompt a quick guess before showing a translation/answer (anticipatory prediction
    error), a cheap, high-evidence technique the playbook calls out. **MVP:** an optional "guess first"
    step in the existing flashcard/quiz components; measure repeat-error rate. Effort: **S.** Recommended
    model: **Sonnet**.
29. **Hook "investment" surface: custom decks / word capture — Priority P2 (Medium).** _Fixes eval dim 3;
    failure mode #4._ Today users build little "stored value", so switching cost stays low. **MVP:** a
    "Zu meiner Liste" / save-word action and a personal list that feeds the SRS with the learner's own
    context; later, import a word/sentence from anywhere. Pairs naturally with the AI sentence-mining idea
    in `docs/strategy/AI_PRODUCT_STRATEGY.md` (idea 11). Effort: **M** (touches store + cloudSync + a new surface).
    Recommended model: **Opus** (store/sync wiring), **Sonnet** for the UI.
30. **Talker variability: multi-voice TTS + speed toggle — Priority P3 (Low, quick win).** _Fixes eval
    dim 1/2 (phonological transfer); failure mode #5._ A single TTS voice ties schemas to one sanitized
    speaker; the playbook flags multi-voice/speed exposure as a productive desirable difficulty. **MVP:**
    let `engine/speech.ts` rotate among available `speechSynthesis` voices per session block, plus a
    speed toggle in settings. Effort: **S.** Recommended model: **Sonnet**.

## Model guidance — which Claude model to set per session (added 2026-06-11)

> **Fable available again (2026-07-02):** the earlier restriction (noted 2026-06-15) is lifted; Fable
> is selectable and session 46's app review + UX overhaul plan ran on it. The "Opus for now"
> workaround no longer applies; "Recommended: Fable" rows mean Fable again.

We now have **Fable 5** as the frontier model alongside the Claude 4/5 families. Claude Code does
**not** auto-pick a model per task: whatever you set in `/model` runs the whole session, and the
assistant can't reassign itself mid-task. So set the model at the **start of each session** based
on the dominant work. (Subagents the assistant spawns can run on a cheaper model on their own, but
that's separate from the main session model.)

Rule of thumb: **design/decide with Fable, build with Opus/Sonnet, fill-in with Haiku.** Step up a
tier for ambiguous or high-stakes work (legal, payments). `opusplan` is a useful hybrid: Opus while
planning, then auto-switches to Sonnet for execution.

| Model | Best for | Cost |
| --- | --- | --- |
| **Fable 5** (frontier) | Architecture/system design, legal nuance, pricing/monetization strategy, persuasive marketing copy, research-heavy planning | Highest |
| **Opus 4.8** | Heavy cross-cutting implementation: multi-file features, careful refactors, security-sensitive integrations | High |
| **Sonnet 5** | Standard build work: well-specified features, UI from an approved plan, structured content authoring, doc-following integrations | Medium |
| **Haiku 4.5** | Mechanical, well-bounded edits: placeholder fills, config flips, single-file copy tweaks | Low |

Backlog items mapped to a recommended model (see "Backlog — founder ideas" and "Resume here"):

| Task | Recommended | Why |
| --- | --- | --- |
| Fill data-location placeholder (privacy DE/EN) | **Haiku** | One mirrored line, no judgment |
| Fill Impressum address + re-enable route/links | **Sonnet** | Mechanical but multi-file; must not break build |
| Enable pg_cron writing-text retention | **Sonnet** | Apply provided SQL with light care |
| Draft legal enforceability additions (Widerrufsrecht, liability, language-precedence) | **Fable** | German/EU legal reasoning, binding DE version |
| Content QC pipeline — CI lint (dup IDs, broken nodes) | **Sonnet** | Bounded script + CI wiring |
| Content QC — pedagogical / German accuracy review | **Fable** | B2-level correctness judgment |
| Grammar drills 47 → 80 | **Sonnet** | Follows established schema; Fable for a final accuracy pass |
| Vocabulary 504 → 600+ | **Sonnet** | Bulk schema-following content |
| FAQ section (landing) | **Sonnet** | Straightforward copy + UI |
| Expand landing copy | **Fable** | Persuasive, on-voice copy; Sonnet if budget-conscious |
| Visual mnemonics for vocab (der/die/das) | **Sonnet** | Asset wiring against existing schema |
| Dashboard redesign | **Opus** | Superseded by UX overhaul Phase 1 (see the phase table below) |
| Schreibtraining redesign | **Opus** | Cross-section rework |
| Animated-character scenarios | **Fable → Opus** | Design with Fable, implement with Opus |
| Legal review with a lawyer (#15) | **Fable** | Engage/brief a lawyer; German/EU legal judgment, not code |
| Resend SMTP / LanguageTool key | **Haiku** | Config-level, follow docs |
| Turnstile CAPTCHA on guest sign-in | **Sonnet** | Follows provider docs, some care |
| Google sign-in branding completion | **Sonnet** | Mostly console steps + guidance, little code |
| Gate Schreibtraining behind sign-in | **Sonnet** | Reuse existing `AuthDialog` |
| Pricing page + plan/tier design | **Fable → Sonnet** | Strategy with Fable, build page with Sonnet |
| End-to-end data strategy (#22) | **Fable** (Opus for now) | Cross-cutting strategy + data modelling, not code |
| Visualization plan for learning components (#23) | **Fable → Opus/Sonnet** | Design direction with Fable, build the views with Opus/Sonnet |
| Monetization tier + paywall feature flags | **Opus** | Backend + UI + careful gating logic |
| Payment gateway integration | **Opus** | Money-handling; Fable for architecture/security design |
| Domain-based content filtering (by sector) | **Fable → Opus** | Data-model design with Fable, implement with Opus |
| Content sourcing/audit pipeline | **Fable** | Research-heavy design + verification workflow |
| SEO optimization (meta, sitemap, structured data) | **Sonnet** | Largely mechanical |
| Marketing campaign | **Fable** | Planning + creative |
| Business plan + case study (#16) | **Fable** | Market sizing, competitive research, unit economics, traction narrative |
| Pre-seed fundraising (#17) | **Fable** | Investor targeting, pitch deck, data room, instrument strategy |
| Routine bugfixes (e.g. UI tweaks) | **Sonnet** | Step up to Opus only when a fix turns gnarly or spans many files |

### UX overhaul plan phases mapped to models (added s46; see `docs/archive/UX_OVERHAUL_PLAN.md`)

The design/strategy work is already done (Fable, s46), so the phases below are **implementation**:
do not burn Fable on them. Fable reappears only where new pedagogical content gets authored.

| Phase | Scope | Recommended | Why |
| --- | --- | --- | --- |
| 0. Quick wins | Banner demotion, header slimming, German copy pass, cold-start state | **Sonnet 5** | Well-specified multi-file edits; founder reviews the German copy on the live site |
| 1. Session engine + Heute | `engine/session.ts`, SessionPlayer, end screen, Heute redesign | **Opus 4.8** | The big cross-cutting build: new engine + player + dashboard rework, regression-sensitive |
| 2. Global search + Tier-0 defaults | `searchAll()`, result sheet, band-default lists | **Sonnet 5** | Bounded: one pure function + one UI surface + list defaults |
| 3. Bibliothek + travelling scope | `/library` hub, segments, redirects, scope as app state | **Opus 4.8** | Routing/redirect/app-state work across four pages; easy to regress deep links |
| 4. Fortschritt + Can-Do | `canDo.ts` data + linter, milestone UI, diagnose card | **Fable → Sonnet 5** | Can-Do statements are pedagogical German content (Fable authors/reviews); UI build is standard |
| 5. Anwenden + nav re-map + facet registry | Anwenden hub, `DEFAULT_PINNED_TABS`, `lib/facets.ts` | **Opus 4.8** | Touches the locked nav store + pinned-tab migration; careful, not big |

## Resume here (next session)

**Handoff after session 59 (2026-07-05). Bibliothek Grammatik bug FIXED ✅ and merged to `main`.**
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
needed beyond the PR #297 fix. **Next candidates** carry over from
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

**Content counts (verified from `src/data/*` on 2026-07-03):**
- Vocabulary: **528 words**
- Collocations: **396 Nomen-Verb pairs** (~36/theme; tripled from 132 in s40)
- Grammar: **47 drills** · **10 topics**
- Dialogues (branching scenarios): **12** (incl. behoerde)
- Exam sets: **10** (1 per theme · 6–7 min · sharedRubric)
- Redemittel: **72** entries
- Can-Do milestones: **25** (all 11 themes; founder-verified provenance)
- Provenance rows: **1,111** (all with a `reference`; 1,086 `draft` / 25 `verified`)

**Dev branch:** reassigned each session; realign to `origin/main` after each squash-merge (`main` is
always the source of truth).

