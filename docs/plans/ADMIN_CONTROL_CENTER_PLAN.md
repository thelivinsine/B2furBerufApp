# Admin Control Center ("Kontrollzentrum") · Scoping Report & Plan

_Session 143 (2026-07-21). Produced by a four-expert agent panel (product strategy, infrastructure
audit, content operations, analytics/ops) plus synthesis. Status: **proposal, not yet built.**
Visual direction: `preview/admin-control-center-mockups.html` (3 mockup screens)._

---

## 1. Executive summary

Genauly needs an admin center, but not a generic SaaS admin panel. The product is pre-launch, has a
git-compiled content model, one non-technical operator, and three real operational loops:

1. **The content-review loop** (the declared bottleneck: ~3,105 provenance rows, 25 human-verified,
   review decisions currently rot in Supabase because nothing applies them back to the repo).
2. **The feedback/demo loop** (the `feedback` table + Resend email already flow, but there is no
   inbox, no status, no triage).
3. **The "is anything on fire or costing money" loop** (deploy status, content gates, Supabase
   health, the $5/month AI cap, abuse signals).

The recommendation is one lazy `/admin` route inside the existing SPA, gated by the proven
`isFounder` + founder-email RLS/RPC pattern, composed of seven modules. The flagship is the
**Review Cockpit (Prüfmodus)**: a keyboard-driven, priority-scored review flow whose decisions are
applied back to the repo by a new `pnpm apply:reviews` script. Everything reads either the bundle
(content banks, generated verification/frequency maps, report JSON sidecars), founder-gated
aggregate RPCs (never raw user rows), or public GitHub APIs. Nothing writes content from the
browser, ever.

**The single most important build item is the loop-closer.** Without `apply:reviews`, the existing
Daten-Werkbank checkboxes are a diary; with it, every founder decision becomes a committed,
stamped, CI-gated `verified` flip.

---

## 2. What exists today (audit)

- **Founder gate:** `src/lib/admin.ts` (`FOUNDER_EMAILS`, 2 emails, pinned by `tests/admin.test.ts`),
  used in exactly one place: `Sources.tsx`. Client gating is cosmetic; the real boundary is the
  founder-email RLS policy on `provenance_reviews` (migrations 0004/0007).
- **Daten-Werkbank** (`features/legal/AdminWorkbench.tsx` on `/sources`): sortable provenance table,
  fuzzy search, Typ/Stufe/Status filters, CSV export, per-row verified-checkbox + note writing to
  Supabase `provenance_reviews`. This is the entire current admin surface. It manages content QC
  only; no learner data, no feedback, no cost, no health.
- **Supabase:** `profiles` / `progress` / `writing_evaluations` are strictly owner-only RLS (a
  founder cannot read cross-user data from the browser at all). `ai_usage` (the monthly AI-spend
  counter with the $5 auto-shutoff) and `feedback` have **zero client policies**: service-role only,
  invisible except via the Supabase dashboard.
- **Stranded report artifacts:** ~12 rich reports in `docs/reports/` (verify-facts/grammar/cefr,
  review-queue, exercise-coverage, verified-hashes, jury-review, sector-audit) that no UI reads.
  Some are already stale (review-queue.md reflects 2,132 rows vs ~3,105 live), which is itself a
  problem the admin center must make visible.
- **No telemetry of any kind** (deliberate: the no-cookie-banner legal position is locked).
- **Constraints:** static SPA (GitHub Pages), 400 kB main-chunk budget (admin must be a lazy chunk),
  Edge Functions/RPCs are the only server compute, CORS allowlist pattern, offline-first fail-soft
  Supabase calls, and the founder-email list already duplicated in three places (`admin.ts`, RLS
  0007, submit-feedback default) that must stay in lockstep.

---

## 3. Design principles (panel verdicts)

1. **A cockpit, not a CMS.** The admin center reads content and hands changes to AI sessions; it
   never writes content from the browser. The git-compiled bank model (lint gates, id permanence,
   verified-hash fingerprints) is an asset; a second write path would break every guarantee.
2. **Aggregates only for people data.** Learner tables keep owner-only RLS. Cross-user numbers come
   from founder-gated **security-definer Postgres RPCs returning aggregates** (counts, histograms,
   top content ids), mirroring the 0004/0007 email-gate pattern in the function body. No admin
   SELECT policies on `profiles`/`progress`/`writing_evaluations` (GDPR data minimization; per-user
   lookups for support/GDPR stay in the Supabase dashboard). Exception: `feedback` rows are
   operational data addressed to the founder; per-row display in-app is fine via a founder-gated RPC.
3. **Design around the real workflow: founder marks → AI session commits.** The founder cannot run
   `pnpm stamp:verified`. Every module ends in either a glance, a decision saved to Supabase, or a
   **copy-paste handoff prompt** for the next Claude session.
4. **Visibility, not levers.** Show deploy state, gate results, spend, and health; deep-link to the
   Supabase/GitHub/Resend dashboards for anything deeper. No deploy/rollback buttons, no re-running
   verify pipelines from the browser.
5. **Honest metrics.** Two quality numbers, never blended: machine floor (% at tier ≥ jury, target
   100%, costs the founder nothing) and human audit (% `verified`, target = exceptions + stratified
   samples, NOT 100%). Three visually distinct item states: KI-Jury (machine), Entscheidung erfasst
   (Supabase, not yet in repo), Menschlich geprüft (in repo, stamped).
6. **Same bundle, lazy chunk, brand chrome.** `/admin` as a `lazyWithReload` route behind a
   `RequireFounder` wrapper (mirror `RequireOnboarding`), reusing `DataTable`, `SearchField`,
   `csv.ts`, `fuzzy.ts`, recharts (already an isolated vendor chunk). Main chunk stays ~75-80 kB.

---

## 4. Module blueprint

### A · Review Cockpit ("Prüfen") · the flagship
- **A1 Verification funnel headline:** verified % + jury-coverage % + tier distribution per bank,
  with deltas. Data: bundled `provenance.ts` + generated `verification.ts`, zero backend.
- **A2 Priority-scored queue:** "next 25 items worth reviewing", scored at build time:
  `defect_signal` (any verify-facts/grammar/cefr flag, single-oracle disagreements included, plus
  reviewer rejections) → `traffic_proxy` (mission content, core frequency bin, low CEFR, exam
  sets/dialogues) → `1 − confidence` → `bank_criticality` (grammar/texts > redemittel >
  collocations > vocab).
- **A3 Prüfmodus review card:** one item per screen, rendered as the learner sees it, with its
  machine-check results, jury status, and reference link inline. Keyboard: `V` verify, `X` reject
  (focus note), `N` note, `→` skip, `←` back. Autosaves to `provenance_reviews`. Progress header
  ("31/84 in dieser Sitzung · Warteschlange: 412"), resumable slices.
- **A4 Sync-gap indicator + handoff:** count of approved decisions not yet applied to the repo, with
  a one-click **"Übergabe-Prompt kopieren"** (a ready-to-paste instruction for the next AI session:
  run `pnpm apply:reviews`, ids included). This is the loop-closer's UI half.
- **A5 Sampling protocol (later):** stratified per-wave samples (n = 20 or 10%); a clean sample
  marks the cell "stichprobengeprüft" in a new `sample-audits.json` sidecar (a confidence bump,
  never a `review_status` flip on unread items); a defect escalates the whole generator batch.

### B · Feedback-Inbox
Rows from the `feedback` table via founder-gated RPC: message, page, timestamp, user (if signed in),
`emailed` flag; status triage (neu / erledigt / verworfen) + free-text note + optional PR link.
Requires migration work (status columns + RPC); the table already has the right indexes.

### C · Versand & Systemzustand ("System")
- **C1 "Ist meine Änderung live?":** deployed build id (stamped via Vite `define`) vs latest `main`
  commit (public GitHub API), with plain-language verdicts: live and current / merged, deploying /
  on a branch, not merged / live but your device may be showing a cached version (hard refresh).
  Kills the most recurring founder confusion, including the PWA-cache one.
- **C2 Gate strip:** last `validate.yml` + `pages.yml` runs green/red in words (with the "red
  attempt 1 can be normal" caveat).
- **C3 Service pings:** Supabase reachability probe, Edge Function CORS-preflight check, Resend key
  presence; deep-link tiles to the Supabase/GitHub/Resend dashboards for logs and billing.

### D · Kosten & Missbrauch
- **D1 AI budget meter:** month-to-date `ai_usage.calls`/`cost_estimate` vs the $5 cap and daily
  caps, cache-hit rate from `writing_evaluations.cached`. The cap currently trips silently; this
  makes it a glance.
- **D2 Abuse signals:** anonymous-account creation rate (Turnstile is still off), feedback email
  count today vs Resend's 100/day limit (the function's 60/hour cap can exceed it; consider a daily
  cap), Supabase free-tier notes incl. the **7-day inactivity pause** (the most likely real
  "demo link is dead" outage).

### E · Publikum ("Nutzer") · skeleton now, real at launch
Aggregate tiles from one `admin_overview()` RPC: accounts total (guests vs email vs Google), new
this week, active today/7d (`progress.updated_at` / `last_active_day`), sessions, XP, SRS card
totals; later a signups/actives time series (`active_days` gives full retention curves
retroactively) and top-content lists (most-reviewed/most-saved ids: a content-strategy signal, not
personal data). Cohorts/funnels are explicitly deferred until sustained triple-digit WAU.

### F · Inhalts-Intelligenz ("Inhalte")
- **F1 Theme depth matrix:** 20 themes × (vocab / collocations / dialogues / texts / exam sets /
  Can-Do / prompts) against the reference-template floor; exam sets are the known thin axis.
- **F2 Machine-check triage:** open fact/grammar/CEFR flag counts, drill-down → the A2 queue, so
  reports become work queues instead of reading material.
- **F3 Exercise-coverage residuals:** the word-level gaps per theme with a "copy id list" button
  (an exact work order for an AI session).
- **Staleness panel (early, cheap, high value):** every report artifact's generatedAt + the register
  row count it was generated against vs live, so the dashboard can never silently mislead.
  Prerequisite: every verify/queue/coverage script emits a JSON sidecar with
  `{generatedAt, registerRows}` next to its markdown.

### G · Launch & Compliance
- **G1 Launch checklist:** the literal open list (Impressum = legally blocking, lawyer pass, Google
  OAuth review with the "do NOT re-click 'I have fixed the issues'" memo, Turnstile, Resend SMTP,
  consent-version currency), checkable, persisted in Supabase or localStorage.
- **G2 Consent-drift check:** runtime assert `CONSENT_VERSION` == legal `LAST_UPDATED` lockstep.
- **G3 Auditor export:** one button producing the backlog #34 package (register CSV + tier
  distribution + report links + sampling guide). Converts the provenance discipline into a B2B
  sales asset (BAMF/healthcare procurement will ask exactly these questions).
- **G4 GDPR ops evidence:** counters (not content) of executed deletions/exports, and whether the
  pg_cron retention job is actually scheduled.

---

## 5. The loop-closer: `pnpm apply:reviews` (P0, build first)

New dev-tooling script (service-role key from env, same pattern as `build:oracles`; never runs in
the SPA):

1. Fetch `provenance_reviews` where `decision='approve'` and `applied_at is null`.
2. Per id: map through `ID_RENAMES`, resolve in the live banks, recompute the content hash
   (`scripts/content-hash.mjs`) and compare with the **hash stored at decision time**. Mismatch =
   content changed after the human looked → skip, list under "re-review needed".
3. Codemod `src/data/provenance.ts`: `review_status: "draft"` → `"verified"`, set `verified_by` from
   `reviewer_email` + date.
4. Run `pnpm stamp:verified` then `pnpm lint:content` (flip + stamp land in the SAME commit).
5. Write `applied_at`/`applied_sha` back; print a PR-body summary. Reject/needs_fix rows export to a
   fix queue (`docs/reports/review-defects.md` + json) for an AI repair session.

Supporting migration (0008): widen `provenance_reviews` from boolean to
`decision approve|reject|needs_fix`, add `content_hash`, `reviewer_email`, `applied_at`,
`applied_sha`. The workbench computes the hash at decision time (share the canonicalization from
`scripts/content-hash.mjs` via `src/lib/`; browser SubtleCrypto sha256).

## 6. Backend work summary

- **Migration 0008:** `provenance_reviews` widening (above) + `assert_founder()` +
  founder-gated security-definer RPCs: `admin_overview()` (one jsonb of headline aggregates),
  `admin_daily_series()`, `admin_top_content(n)`, `admin_feedback_recent(n)` + feedback status
  update RPC. Gate = in-body email check (the 0004/0007 pattern); revoke from public/anon.
- **No new Edge Functions needed for the MVP** (RPCs cover it; `auth.users` is reachable from
  security-definer SQL for the anonymous split).
- **Consolidate the founder-email list story:** a new RPC would be the 4th copy; document the
  lockstep rule in one place (admin.ts header already starts this) and pin with the existing test.
- **CI addition (cheap):** append the main-chunk kB to a committed JSON per build for a bundle-size
  trend tile.

## 7. What NOT to build (explicit, from the panel)

1. A live content CMS or any in-browser content editing (fights lint/stamp/id-permanence; backlog
   #35 defines the real DB-migration trigger at ~100x library size).
2. Roles/permissions/teams beyond the two hardcoded founder emails.
3. Analytics SDKs, session replay, client-side identifiers, or anything reopening the settled
   no-cookie-banner posture. (A later aggregate-counter telemetry design exists if ever needed:
   day/event/count rows, no user key, §25 TTDSG not triggered.)
4. Admin SELECT policies or per-user browsing of `profiles`/`progress`/`writing_evaluations`.
5. In-admin deploy/rollback levers or browser-run verify pipelines.
6. A separate admin app/subdomain (the /sources overlay pattern is correct: same bundle, lazy chunk).
7. Notification/alerting infra beyond the existing Resend email (pull-on-glance; optionally a free
   external uptime pinger as founder setup).
8. A/B testing, feature flags, cohort tooling: pre-PMF theater for a team of one.

## 8. Phasing

**MVP (highest leverage, ~2 sessions):**
1. `pnpm apply:reviews` + migration 0008 + decision-time hashes (the loop-closer).
2. `/admin` route (RequireFounder, lazy) with: Review Cockpit (A1 funnel, A2 queue, A3 Prüfmodus,
   A4 sync-gap + handoff prompt), Feedback-Inbox (B), System (C1 live-widget + C2 gates), Launch
   checklist (G1), AI budget tile (D1 via `admin_overview`).
3. JSON sidecars + staleness metadata for the report scripts (prerequisite for dashboards).

**v2 (pre-launch):** D2 abuse meters (pair with enabling Turnstile), F1-F3 content intelligence,
G2 consent drift, G3 auditor export, A5 sampling protocol, feedback context/PR links, review
streaks.

**Later (post-launch, gated on real users):** E audience tiles the week the link goes public;
retention curves at sustained 3-digit WAU; native-reviewer lane (3rd email + RLS update + reviewer
filter); any telemetry counters only when a concrete product question demands them (with the
privacy-policy sentence + CONSENT_VERSION bump).

## 9. Risks

1. **Hash-gate race:** decision-time hash → apply compares → flip + stamp in one commit. The apply
   script is the only thing that stamps in normal operation; a stamp mismatch means re-review,
   never re-stamp-to-silence.
2. **Jury vs human confusion:** if jury items ever render with the human badge, the /sources trust
   story collapses. Keep the three states distinct everywhere.
3. **Review fatigue / rubber-stamping:** nudge after ~50 consecutive approves without a note;
   interleave defect-signal items; make sampling the sanctioned shortcut.
4. **Stale artifacts presented as live:** already happening; the staleness panel is the fix.
5. **Client gate is cosmetic:** every privileged read must be RLS/RPC-enforced; anyone can force
   the UI.
6. **Bundle discipline:** everything rides lazy admin chunks; zero eager imports of banks/reports.

## 10. Open decisions for the founder

1. **Route naming/entry:** `/admin` as its own route (recommended) vs growing inside `/sources`.
   Proposal: `/admin`, linked only from the AccountMenu for founder accounts.
2. **MVP order:** panel consensus is loop-closer first, then Prüfmodus, then inbox. Confirm.
3. **Feedback triage fields:** is status + note + optional PR link enough?
4. **Launch checklist storage:** Supabase (syncs across devices) vs localStorage (zero backend).
   Proposal: Supabase, it is 10 lines on an existing pattern.
5. **German-only or bilingual admin UI?** Proposal: German-first like the app, no EN peek needed.
