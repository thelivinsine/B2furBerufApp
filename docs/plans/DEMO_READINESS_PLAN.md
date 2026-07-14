# Demo-Readiness Plan — pre-demo sweep (authored s111, 2026-07-13)

## Context

The founder demos Genauly **tomorrow (2026-07-14)**: first presenting live, then sharing the link
so the audience uses the app on their own devices. Both demo states are needed (a seeded account
with realistic progress + a clean profile to show onboarding). This plan was authored on Fable 5;
the founder is nearly out of Fable for the week, so **every implementation chunk below runs on
Opus 4.8, Sonnet 5, or Haiku 4.5** (recommendation per chunk, consistent with the model-guidance
table in `docs/PROJECT_REFERENCE.md`). Deep work that genuinely wants Fable is explicitly
deferred to next week.

**How to use this file:** each implementing session picks its chunk(s), sets the model via
`/model` at session start, checks the chunk off here when it lands, and ships via the normal
PR → squash-merge → branch-realign flow (auto-ship is pre-approved; only merges to `main`
update the live site). Every session also does the standard doc updates
(`docs/PROJECT_STATUS.md` + `docs/SESSION_PROMPT_LOG.md`).

## Verified baseline (s111, 2026-07-13, on `main` = ae0c2fc — do NOT redo)

All 9 CI gates green: `pnpm typecheck` ✔ · `pnpm lint` 0 errors (44 deliberate react-hooks
warnings) ✔ · `pnpm lint:content` ✔ (2,263 provenance rows, all banks pass) · `pnpm test:unit`
134/134 ✔ · `pnpm test:srs` 323 ✔ · `pnpm test:pronounce` 26 ✔ · `pnpm audit` 0 vulnerabilities ✔
· `pnpm build` ✔ (prerender + sitemap OK) · `pnpm check:bundle` 79.5 kB / 400 kB budget ✔.

Security greps clean: no secrets in the repo; no `dangerouslySetInnerHTML`/`eval` sinks (the one
`innerHTML = ""` in `src/main.tsx` just clears prerendered content); every `target="_blank"`
carries `rel="noreferrer"`; only the public Supabase anon key + optional Turnstile site key reach
the client (`src/lib/supabaseConfig.ts`).

Confirmed infra facts: `public/404.html` SPA fallback exists; the PWA is
`registerType: "autoUpdate"` (`vite.config.ts`) so a previously-visited device shows the OLD
version for one load after a deploy; the `evaluate-writing` Edge Function already enforces auth +
a per-user daily limit + a global monthly spend auto-shutoff; the s108 account data-isolation fix
(`lib/cloudSync.ts` + `b2beruf.syncUid`) makes account switching on one device safe; the s109 fix
stops the offline service-worker update check from painting a false "App failed to load" screen.
**`submit-feedback` has input caps + a CORS allowlist but NO rate limit** (anyone with the link
can spam the founder's inbox via Resend).

---

## P0 — must land before the demo

### - [x] Chunk 1: Runtime smoke test of the demo path — **Opus 4.8** ✅ s115

Done. Playwright over `pnpm preview` of the production build, **4 combos** (390×844 mobile +
1440×900 desktop) × (light + dark), **28 routes each** plus a cold-start onboarding pass and a
core-interaction pass (played session blocks, played mission scenes, toggled filter-rail facets +
reset, opened the Graph view, opened a Grammatik lesson). **Result: a completely clean sweep** —
zero uncaught console errors, zero error boundaries, zero blank pages, zero dead routes, zero
horizontal overflow. Cold start correctly gates fresh storage `/` → `/welcome` → `/start`. All
old-route redirects land with params preserved (`/vocabulary`, `/collocations`, `/redemittel`,
`/grammar`), `/anwenden` + `/welt` still resolve, and junk `?`-params (`mission`/`grammar`/`cefr`/
`sector`) all fall back gracefully. Scripts in the session scratchpad (`smoke.mjs`/`interact.mjs`),
not the repo. **No punch list produced** (nothing broke), so Chunk 4 had no fixes to apply.

Playwright (pre-installed Chromium at `/opt/pw-browsers/chromium`, do not `playwright install`)
against `pnpm preview` of the production build. Script it in the session scratchpad, not the
repo. Two viewports (390×844 mobile, 1440×900 desktop) × light + dark theme:

- Cold start (fresh localStorage) → landing → onboarding to completion → dashboard.
- Dashboard Praktisch: Lernen tab (map, module pager, "Jetzt üben" → `/session?mission=…`,
  complete 2–3 blocks), Spielen tab (Neuland hub → play mission 1.1 a few scenes, check the boss
  1.6 is reachable ungated).
- Theorie `/library`: all 4 tabs (incl. the s110 tab-switch slide), each view-switcher option
  (incl. the Wörter Graph and its s109 zoom), filter rail open/filter/reset on both breakpoints,
  transient search, the content-scoped Üben from each tab, the s107 collapse-on-scroll mobile
  toolbar.
- Fortschritt, Einstellungen, `/sammlung`, `/hilfe` + one article, `/privacy`, `/terms`, `/about`.
- Old-route redirects still land: `/vocabulary`, `/collocations`, `/redemittel`, `/grammar`
  (params preserved), plus `/anwenden` and `/welt` still resolve (Anwenden is off the nav but
  must stay mounted).
- Fail the sweep on any uncaught console error, error boundary, blank page, or dead route.
  Fix what's found (small fixes inline; anything gnarly goes on Chunk 2's list).

*In plain terms: a robot clicks through the app exactly like an audience member will, on a phone
and a laptop, in light and dark mode, and reports anything broken so no one discovers it on
stage.*

### - [x] Chunk 2: Regression review of the last demo-prep rounds — **Opus 4.8** ✅ s112

Findings: stale "(Heute)" copy fixed in `Session.tsx` (session eyebrow) + the
`hilfe/erste-schritte` help article (DE+EN, reprerendered). Returning-user
migration verified SAFE: `BottomTabBar` filters `pinnedTabs` down to
`CONTENT=["/library","/analytics"]` and `BarTab` returns null for unknown paths,
and the desktop `Sidebar` renders `navItems` directly, so a stale `/anwenden`
pin from a pre-s105 device can never break either bar. Feedback surfaces
verified correct (pill desktop-only + hidden on `/` + hidden in focus/missions;
dialog mounted app-wide; `submitFeedback` degrades gracefully when the function
is unreachable/unconfigured). `?`-param junk handling on `/session` verified
robust: unknown `mission`/`grammar`/`theme`/`cefr`/`sector`/`cat`/`sub` all fall
back (undefined focus / random grammar topic / default scope), `min` clamps.

Sessions 102–110 changed a lot fast (nav rename Praktisch/Theorie, Anwenden hidden, the feedback
dialog rework, Fortschritt redesign, Bibliothek multi-select filters/tiles/scoped Üben,
collapse-on-scroll toolbar, Üben map recolor + pin polish, cloudSync data-isolation fix,
SW-update crash fix, graph zoom, tab slide). Review the diffs of PRs #477–#500 for:

- Stale user-facing copy still saying "Heute"/"Bibliothek"/"Anwenden" (grep `src/` for the old
  labels; check help articles `src/features/help/content.ts`, landing, onboarding, tooltips,
  `aria-label`s, and the prerendered help HTML).
- Returning-user migration: `ROUTE_SUCCESSOR` + the `pinnedTabs` persist migration in
  `src/components/layout/nav-items.ts` — simulate an old persisted `b2beruf.*` settings blob
  (pre-s105 pins including `/anwenden`) and confirm the bar renders correctly. This matters
  because the founder's own demo device has old persisted state. Also sanity-check the s108
  `b2beruf.syncUid` flow once with a simulated stale cache.
- The feedback surfaces after the s107 rework (store-controlled dialog; desktop pill, mobile
  action-bar icon, in-session "Feedback geben"): render on the right pages, hidden in missions,
  submit + error gracefully when the Edge Function is unreachable.
- `?`-param handling on `/session` (`mission`, `grammar`, `cat`, `sub`, `cefr`, `sector`) with
  junk values: must fall back gracefully, never crash.

*In plain terms: the app was changed heavily in the last few days to get demo-ready. This
double-checks those fresh changes for side effects, especially for a device that has used the
app before and still carries old saved settings, like the founder's own phone.*

### - [x] Chunk 3: Abuse hardening for the shared link — **Opus 4.8** (same session as Chunk 2) ✅ s112

Done: `submit-feedback` now has two migration-free abuse guards — a per-IP burst
limit (≤5 / 10 min, in-memory, hashed IP) and a DB-backed global hourly email
ceiling (≤60/hr stops the email but still stores the row, so nothing is lost and
the inbox is hard-capped across all sources). Returns the existing friendly
German error. RLS re-checked across migrations 0001–0006: every policy is
owner-scoped to `auth.uid()` (or the founder-email gate on `provenance_reviews`);
`feedback` + `ai_usage` are service-role-only with no client policies; no public
SELECT anywhere; `bump_ai_usage` revoked from public/anon/authenticated.
`delete-account` + `evaluate-writing` re-confirmed: JWT-gated (401 when
unauthenticated) + CORS allowlist; evaluate-writing keeps daily(5)/monthly($5)/
per-user(50) caps. Founder console steps (redeploy command, optional
`FEEDBACK_IP_SALT`, optional Turnstile + Resend SMTP) documented in
`docs/plans/PHASE2_SETUP.md` for the Chunk 5 runbook. **Founder must run
`supabase functions deploy submit-feedback`** for the rate limit to go live (no
migration/secret needed).

The audience gets the URL, so the public write-paths need minimal abuse protection:

- **Rate-limit `submit-feedback`** (`supabase/functions/submit-feedback/index.ts`): before
  insert, count recent `public.feedback` rows in a time window (e.g. ≤5 per 10 min per IP hash
  from `x-forwarded-for`, plus a global cap ≤60/hour that stops the email send but still stores
  rows). The table already exists (migration 0006); prefer a query-based check over a new
  migration since the founder must run migrations manually. Return the existing friendly German
  error shape.
- Re-check RLS on all tables in migrations 0001–0006: every policy scoped to `auth.uid()`, the
  feedback table insert-only for anon, no public SELECT.
- `delete-account` + `evaluate-writing`: confirm JWT verification + CORS allowlist match the
  documented policy (evaluate-writing quota already confirmed working; just re-read the auth
  gate).
- Document (not implement) the two founder console options in the runbook: enable Turnstile on
  guest sign-in (site key env + console step, `docs/plans/PHASE2_SETUP.md`) and Resend SMTP for
  the magic-link rate limit. Both are optional for tomorrow; the in-code rate limit is the real
  fix.
- Note: the founder must `supabase functions deploy submit-feedback` after the change — put the
  exact command in the runbook (Chunk 5).

*In plain terms: once the link is public, someone could spam the feedback form and flood the
founder's inbox, or hammer the sign-in. This adds a speed limit to the feedback form and
re-verifies that each user's data is only accessible to that user. Total cost stays capped: the
AI writing coach already has daily and monthly spending limits.*

### - [x] Chunk 4: Demo-visible UI polish — **Opus 4.8** ✅ s115

Done. Reviewed Chunk 1's screenshots of every demo-visible screen in **light + dark, mobile +
desktop**: Dashboard (Lernen map + Spielen), Theorie all tabs incl. Graph + Grammatik lesson,
filter rail open/facet/reset, Fortschritt (fresh account), Sammlung (fresh), a mission scene, a
composed-session block, and the mobile filter tile + sticky Üben bar. **No blemishes found:** nav
labels consistent post-rename (Praktisch/Theorie/Fortschritt/Einstellungen), no em dashes in any
visible string, dark mode solid on every non-game surface (missions correctly light-only, hub
theme-aware, both left as designed), empty states clean, no horizontal scroll anywhere. The
in-session "Feedback geben" pill and the hidden Anwenden nav row are both by-design, not defects.
Nothing structural touched the night before the demo. **No code changes required.**

Only screens the audience will actually see; use Chunk 1's screenshots as the punch list.
Checks, per the locked rules in `CLAUDE.md`:

- German copy consistency after the rename (nav labels, page titles, empty states); no em dashes
  in any visible string; microcopy budget respected on new headers.
- Dark mode on every non-game surface the demo touches (missions are light-only by design, the
  hub is theme-aware — don't "fix" that).
- Empty states with a fresh account (Fortschritt, Sammlung, streak) — this is exactly what the
  clean-profile half of the demo shows.
- Mobile: safe-area, sticky filter tile + Üben bar, bottom bar; no horizontal scroll anywhere.
- Fix only blemishes; no redesigns the night before a demo. Anything structural goes to the
  post-demo list.

*In plain terms: a fresh-eyes walk of every screen in the presentation, fixing small visual
flaws (wrong label, awkward wording, a dark-mode glitch, a misaligned card) so nothing looks
unfinished on the projector. No redesigns, only touch-ups.*

### - [x] Chunk 5: Demo runbook + both demo states — **Opus 4.8** ✅ s115

Done. Wrote **`docs/DEMO_RUNBOOK.md`**: pre-flight checklist (merge to `main` + deploy
`submit-feedback` + confirm `RESEND_API_KEY`), device prep (hard-refresh / close-reopen-twice to
beat the auto-update SW), the two demo states (recommended manual seed = 2–3 sessions + missions
1.1–1.2 the evening before, cloud-sync-portable; clean incognito profile for onboarding), the
happy-path tour order (landing/onboarding → seeded Dashboard Lernen → Spielen mission → Theorie
filters + Graph → Fortschritt → feedback-button closer), failure fallbacks (local-only PWA cache,
hotspot backup, feedback still stored if email fails), a known-rough-edges steer-around list
(none broken; only the two by-design items), and the founder console checklist. Reflects the
Chunk 1/4/6 findings (all clean).

Write `docs/DEMO_RUNBOOK.md`:

- **Device prep:** open genauly.de and hard-refresh (or close/reopen the PWA twice) AFTER the
  final merge, so the auto-updating service worker has swapped in the new version; verify the
  version by checking a visible change. Do this on every demo device.
- **Seeded state:** a signed-in account with realistic progress. Cheapest robust path: on the
  demo device, complete 2–3 sessions + missions 1.1–1.2 by hand the evening before (cloud sync
  makes it portable); alternatively script a localStorage seed (a small paste-in-console snippet
  that writes `b2beruf.*` progress keys — verify the key shape from `useProgressStore`'s persist
  config first). Recommend the manual path: zero code risk. Account switching between the seeded
  and clean profiles on one device is safe since the s108 data-isolation fix, but prefer separate
  browser profiles anyway.
- **Clean state:** a second browser profile / incognito with nothing stored, for the onboarding
  segment.
- **Suggested tour order** (happy path only): landing → onboarding (clean profile) → switch to
  seeded profile → Dashboard Lernen map → one composed session (2–3 blocks) → Spielen mission →
  Theorie filters + graph view → Fortschritt → feedback button as the closer ("tell me what you
  think", it emails the founder live, a nice demo beat).
- **Failure fallbacks:** if Supabase is down, the app runs local-only when already loaded (PWA
  cache) — do not sign out during the demo; keep a phone hotspot as network backup; a
  steer-around list of known rough edges from Chunks 1–4 findings.
- **Founder console checklist:** deploy `submit-feedback` (exact command), confirm
  `RESEND_API_KEY` secret set, optionally enable Turnstile.

*In plain terms: a one-page cheat sheet for demo day: how to prepare the device so it shows the
newest version, one account that looks lived-in and one that is brand new, the exact order of
screens to show, and what to do if the network or backend misbehaves mid-presentation.*

---

## P1 — do if time remains before the demo

### - [x] Chunk 6: Performance sanity on the preview build — **Opus 4.8** ✅ s115

Done. `pnpm check:bundle` = **79.5 kB / 400 kB** main chunk (no content bank leaked eager). The
big banks are correctly in lazy chunks (vocabulary 540 kB, collocations 232 kB, Sources 1.46 MB
all separate). Throttled-load pass (Playwright CDP, ~1.6 Mbps + 4× CPU) on `/`, `/library`,
`/library?view=graph`, `/welt`, `/sammlung`: **first meaningful paint ~3.3–3.5s** on every route,
acceptable for conference wifi, then instant from the ~5.4 MB background precache. Lazy-chunk spot
check (Graph, SpielenHub/`/welt`, Sammlung, session) all loaded on demand with **no error flash**
(the Chunk 1 interaction pass exercised each and logged zero errors).

- Confirm no content bank leaked into the eager path (build output: the main chunk must stay
  ~80 kB; the check is automated but eyeball the chunk graph once).
- Throttled-load pass (Playwright CPU/network throttling) on `/`, `/library`, `/welt`: first
  paint acceptable on conference wifi; the ~5.4 MB precache warms in the background, fine.
- Lazy-chunk spot check: Graph view, SpielenHub, UebenPath, Sammlung each load their chunk on
  demand without a visible error flash.

*In plain terms: conference wifi is slow; this simulates a bad connection and confirms the app
still opens fast and every section loads when tapped.*

---

## P2 — post-demo, next week (needs Fable or is not demo-blocking)

- **Content accuracy pass — DONE (s112, started Fable, finished Opus 4.8):** proofread demo-visible
  German (Kapitel-1 mission scripts, top grammar lessons, help articles) beyond the automated
  checkers; triaged the warn-only `verify:grammar`/`verify:cefr` reports and grew the jury sidecar.
  Fixed the real `verify:grammar` findings (`aufeinander`, "am Dienstag, dem 14. Juli", the two
  closing-quote/`Dieses`→`dieses` cases, `gern`/`gerne` clash, `Kaution beträgt`→`verlangen wir`);
  retagged the 6 `verify:cefr` FLAG items down from B2.2 (Umwelt/vermeiden→B1, bewusst/zudem→B2.1,
  Müll/Energie sparen→B1). Missions, top grammar lessons and help articles read clean (no German
  errors). Grew `docs/reports/jury-review.json` +39 ids (6 top-spine grammar topics + drills, 6
  Kapitel-1 missions) and regenerated `src/data/verification.ts` (which was **stale**: it was missing
  the s102 Branche packs, now 2,263 records; jury tier 149→188). All 9 gates green. Remaining P2
  refinement (deeper LanguageTool triage, jury waves beyond the spine) is optional polish, not risk.
- **Full security review session — DONE (s115, Opus 4.8):** whole-app pass (the repo
  `/security-review` skill is diff-based and the branch was clean, so this was a manual audit of the
  full surface). **No critical/high findings.** Verified: RLS owner-scoped on every user table +
  service-role-only `ai_usage`/`feedback` (no public SELECT) + founder-email-gated `provenance_reviews`
  + `search_path`-pinned SECURITY DEFINER funcs; all 3 Edge Functions CORS-allowlisted, `evaluate-writing`
  /`delete-account` JWT-gated with ids from the token (never the body), `submit-feedback` anon-OK but
  per-IP + global-hourly rate-limited with an HTML-escaped email body; only the publishable anon key
  reaches the browser (no secrets in `src/`, `.env*` gitignored); no XSS sinks + a strong enforcing CSP
  (`script-src` has no `unsafe-inline`/`unsafe-eval`, `object-src 'none'`); s108 cloudSync account
  isolation correct; `.npmrc` 24h cooldown + `pnpm audit` 0 vulns. A few low-severity/defense-in-depth
  notes (feedback DB growth under distributed abuse, optional Turnstile, unvalidated reply-to email
  format) are documented but not demo/launch-blocking. Full report:
  `docs/reports/security-review-2026-07-14.md`. **Turnstile enablement + Resend SMTP stay as the
  standing pre-public-launch founder items** (still open, not done here).
- **Founder feedback triage:** whatever the audience submits through the feedback button becomes
  the next backlog; the `public.feedback` table + email trail is the source.
- Anything Chunks 1–5 found but deferred as "structural".

---

## Session packaging (model per session — set via `/model` at session start)

| Session | Model | Chunks | Why this model |
| --- | --- | --- | --- |
| Tonight A | **Opus 4.8** | 2 + 3 (+ fixes from 1's findings that turn gnarly) | Cross-cutting regression review + a security-sensitive Edge Function change: exactly Opus's lane per the model-guidance table |
| Tonight B | **Sonnet 5** | 1, then 4 + 5 | Scripted smoke testing, UI touch-ups from an explicit punch list, and runbook writing are well-specified build work |
| If time | **Sonnet 5** | 6 | Bounded checks |
| Next week | **Fable 5** / **Opus 4.8** | P2 list | German pedagogical judgment (Fable), full security audit (Opus) |

Order within tonight: run Chunk 1 FIRST (it produces the punch list the others consume). Chunks
2+3 (Opus) and 4+5 (Sonnet) can run as separate sessions in either order after that.

## Verification

- After each chunk: the full gate set (`pnpm typecheck && pnpm lint && pnpm lint:content &&
  pnpm test:unit && pnpm test:srs && pnpm test:pronounce && pnpm build && pnpm check:bundle`).
- After the final merge: re-run the Chunk 1 Playwright sweep against `pnpm preview` of the
  merged build as the demo dress rehearsal; zero console errors on the tour path = ready.
- The founder verifies on the live site (the sandbox cannot reach `*.github.io`/genauly.de):
  hard-refresh, walk the runbook tour once end-to-end on the actual demo device, submit one test
  feedback and confirm the email arrives.
