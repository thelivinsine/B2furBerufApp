# Legal, consent, /sources & admin center — current state

## Legal pages & consent (GDPR)
- `/privacy` and `/terms` are bilingual (DE/EN) via the shared `LegalChrome` + `Section` in
  `src/features/legal/`. **German is the legally binding version** (stated on each page). Every
  legal-copy edit MUST be mirrored in BOTH the `*De` and `*En` bodies, no em dashes.
- **`/impressum` is built but TEMPORARILY HIDDEN** (route commented out in `router.tsx`, all
  links removed) because the founder hasn't filled the real name/address. Do not "fix" by
  re-enabling; a commercial public launch legally needs it live. (Admin Steuerung H3 can gate the
  links remotely; the route stays mounted lazily there.)
- Sign-up (`AuthDialog`) and the final onboarding step require an "I agree to AGB + Datenschutz"
  checkbox; consent recorded via `recordConsent()` (`src/lib/consent.ts`) into the settings
  store (rides `profiles.settings` jsonb via cloudSync). In the dialog the checkbox sits
  **directly above the button it gates** (s174: it used to head the dialog, far from the action,
  and the founder could not tell why sign-up did nothing). It does NOT disable that button, which
  stays live and names the first unmet requirement instead, per the no-dead-controls rule. **Keep `CONSENT_VERSION` in lockstep
  with the `LAST_UPDATED` date on the legal pages**: on material Terms/Privacy changes bump both
  so a future re-consent prompt can detect it.
- GDPR self-service in Settings: data export (`src/lib/dataExport.ts`), account deletion
  (`delete-account` Edge Function + `useAuthStore.deleteAccount`), per-submission delete
  (`WritingHistory` + `writing_delete_own` RLS policy). Founder one-time steps:
  `docs/plans/PHASE2_SETUP.md`.
- **No cookie-consent banner**: storage is functional-only (auth session + `b2beruf.*`
  settings/progress + PWA cache), consent-exempt under GDPR/§25(2) TTDSG. Revisit only if
  analytics/marketing storage is added.
- The Art. 50 AI disclaimers on `/writing` + `/privacy` name all three AI providers
  routing-neutrally (see `docs/areas/SCHREIBEN.md` §AI backend).
- The privacy copy must NOT reintroduce the removed narrow "nur für die Anmeldung" email promise.

## `/sources` = "Quellen & Datenqualität"
- Public page telling the data-quality story visually (stat tiles, five-step pipeline graphic,
  stacked tier bar, per-bank counts, sources/licenses). The "Alle Inhalte und ihre Quellen" item
  browse is behind a collapse toggle (`showAll`, collapsed by default).
- The founder review table **moved into the Control Center** (`/admin/pruefen`, "Alle Inhalte"
  segment; s164). `/sources` shows admins a link card into it instead of the old
  `/sources/werkbank` sub-page (retired). The full-register table + queue now share ONE review
  store, the exported `useWorkbench` hook (`src/features/legal/useWorkbench.ts`); `AdminWorkbench`
  (`src/features/legal/AdminWorkbench.tsx`) renders the table. Decisions store `decision` + a
  decision-time `content_hash` (approve only) + `reviewer_email` (`computeDecisionHash` in
  `src/lib/provenanceReviews.ts`; banks lazy via `src/lib/contentIndex.ts`). Writes are serialised
  per content_id so a note and a decision never clobber each other (`docs/DECISIONS.md`).
- Human verification is reset to zero (2026-07-22): the `human` tier + "menschlich geprüft" tile
  read 0 until the review pass restarts.
- **Admin gate = the two `FOUNDER_EMAILS` in `src/lib/admin.ts`** (client) + the RLS policy from
  migrations 0004/0007 and the `is_founder()`/`assert_founder()` gate in migration 0008 (server);
  keep all in lockstep, `tests/admin.test.ts` pins the email list against both.

## Admin control center (`/admin`)
Plans: `docs/plans/ADMIN_CONTROL_CENTER_PLAN.md` (scope) + `ADMIN_CONTROL_CENTER_BUILD_PLAN.md`
(chunks). **Chunks 1-12 are live** (whole MVP + Phase 2); only Phase 3 (13-16) remains, on demand.
Chunk 11 (Turnstile) was already substantially built (widget + auth `captchaToken` + feedback
burst/hourly caps) and went live once BOTH sides were set: Supabase Auth CAPTCHA (secret key) AND the
`VITE_TURNSTILE_SITE_KEY` GitHub secret (site key, baked in at build). Only one side = sign-in fails.
- **Backend (migration `supabase/migrations/0008_admin_center.sql`):** `provenance_reviews`
  widened to real decisions (`decision approve|reject|needs_fix` + `content_hash`/
  `reviewer_email`/`applied_at`/`applied_sha`), feedback triage columns
  (`status`/`priority`/`note`/`link`), `app_config` (world-readable, founder-writable remote
  config) and `launch_checklist` (founder-only), plus the founder-gated SECURITY DEFINER RPCs
  `admin_overview()`, `admin_daily_series()`, `admin_feedback_recent(n)`,
  `admin_feedback_update(...)`. **Privacy line: RPCs return aggregates only, never individual
  learner rows** (exception: `feedback` rows, operational mail to the founder);
  `profiles`/`progress`/`writing_evaluations` keep owner-only RLS with NO admin SELECT policies.
  Client wrappers: `src/lib/adminApi.ts` (typed, fail-soft, lazy-only).
- **Shell:** founder-only lazy route `/admin/*` (`RequireFounder` in `router.tsx`; standalone
  full-screen shell outside AppShell, like `/sources`). The whole subtree is ONE lazy chunk
  (`src/features/admin/AdminApp.tsx` owns descendant `<Routes>`): `AdminShell` (8-item bilingual
  DE/EN sidebar via `adminI18n.tsx` `t(de,en)`, founder chip, lang toggle; fetches
  `admin_overview` once, shared via Outlet context). Founder entry to `/admin` = a **"Kontrollzentrum"
  row in the desktop `Sidebar` nav panel** (`src/components/layout/Sidebar.tsx`, `isFounder`-gated,
  neutral nav styling) + a **mobile-only** copy in the `AccountMenu` (`lg:hidden`, since the sidebar is
  desktop-only and the bottom bar is locked). Deep links to unbuilt screens resolve to
  `AdminPlaceholder`, never 404.
- **Übersicht:** funnel tiles + all-banks trust ladder from bundled provenance/verification,
  sync-gap + "Übergabe-Prompt kopieren" (`adminFunnel.ts` `pendingApprovals`/
  `buildHandoffPrompt`, pinned by `tests/adminFunnel.test.ts`), AI-budget tile, live-deploy
  widget (`liveWidget.ts` = `__BUILD_SHA__` Vite define vs latest `main` via GitHub API + a
  PWA-cache hint; the `__BUILD_SHA__`/`__BUILD_TIME__` defines are read ONLY in the admin chunk),
  report-staleness strip (`reportStaleness.ts`; sidecars from `scripts/report-sidecar.mjs`).
- **Prüfen (`/admin/pruefen`):** a two-segment sliding-pill switcher (`useSlidingPill`, s164).
  **Warteschlange** = the priority queue + keyboard cockpit: filterable queue from the generated
  `reviewQueue.json` (`pnpm build:review-queue`, scoring `scripts/review-score.mjs`
  defect_signal > traffic_proxy > (1-confidence) > bank_criticality), keyboard review V/X/N/→/←,
  item rendered via `contentIndex`, machine-check panel, 50-approvals rubber-stamp nudge.
  **Alle Inhalte** = the full-register `AdminWorkbench` table (search, Typ/Stufe/Status filters,
  CSV export, "Entscheidungen" decision export, per-row segmented Freigeben/Ablehnen + note with a
  Save button). Both segments write through the one shared `useWorkbench` store, so a decision in
  the cockpit shows in the table and vice versa.
- **Feedback-Inbox** (`AdminFeedback.tsx`): triage via `admin_feedback_update`, optimistic
  writes. **System + Launch** (`AdminSystem.tsx` gate strip/pings/meters via `systemHealth.ts`;
  `AdminLaunch.tsx` checklist in `launch_checklist`). **Inhalte** (`AdminInhalte.tsx`: depth
  matrix, flag triage → Prüfmodus, exercise-coverage residual "Copy ids" work orders).
- **Steuerung (remote config):** `src/lib/appConfig.ts` (typed config, `mergeAppConfig`
  defensively coerces, zustand store loaded once in `App.tsx`). **Empty/unreachable config ==
  today's behavior byte-for-byte, pinned by `tests/appConfig.test.ts` — never break this.**
  Consumers read `config.X ?? current-default`: H1 nav labels, H2 middle-tab hide (nav only,
  routes stay mounted, Home/Einstellungen locked), H3 `impressumEnabled` (links gated + confirm
  dialog), H4 flags (`SHOW_PRACTICE_TABS`/`SHOW_RELATED` → `features.*`), H5 feedback pill, H6
  Beta chip, H7 streak pill, H8 dashboard start tab, H10 landing copy, H12 Demo-Modus preset.
  `AdminSteuerung.tsx` saves only real overrides, with live preview.
- **Compliance pack (chunk 12, on the Launch screen):** §G2 consent-drift check, `consentInSync()`
  compares `CONSENT_VERSION` (`src/lib/consent.ts`) against the ONE canonical legal date
  `PRIVACY_LAST_UPDATED_ISO` (`src/lib/legalMeta.ts`, rendered by PrivacyPolicy). `tests/consent.test.ts`
  fails CI on drift; the Launch panel shows a red warning. **Bump both together on any material legal
  change.** §G3 auditor export (`src/lib/auditExport.ts`, one button): the provenance register as CSV
  plus a Markdown summary (tiers, review status, licences, verification links, sampling guide); reuses
  `csv.ts` `downloadText`; pinned by `tests/auditExport.test.ts`. §G4 GDPR ops evidence (migration
  `0010_gdpr_evidence.sql`): a **content-free** `gdpr_events` table (kind + timestamp, NO user id),
  `log_gdpr_event()` helper, and founder-only `admin_gdpr_evidence()` RPC (counts + last timestamps +
  a defensive `pg_cron` retention probe). `delete-account` logs erasures; `exportUserData` logs exports;
  both best-effort. `fetchGdprEvidence()` fails soft to null (the panel shows "run migration 0010").
  Founder action: run migration 0010 + redeploy `delete-account` (`PHASE2_SETUP.md` §5).
