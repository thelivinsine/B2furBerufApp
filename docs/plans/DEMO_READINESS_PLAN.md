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

### - [ ] Chunk 1: Runtime smoke test of the demo path — **Sonnet 5**

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

### - [ ] Chunk 2: Regression review of the last demo-prep rounds — **Opus 4.8**

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

### - [ ] Chunk 3: Abuse hardening for the shared link — **Opus 4.8** (same session as Chunk 2)

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

### - [ ] Chunk 4: Demo-visible UI polish — **Sonnet 5**

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

### - [ ] Chunk 5: Demo runbook + both demo states — **Sonnet 5** (same session as Chunk 4)

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

### - [ ] Chunk 6: Performance sanity on the preview build — **Sonnet 5**

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

- **Content accuracy pass (Fable when quota resets):** proofread demo-visible German (Kapitel-1
  mission scripts, top grammar lessons, help articles) beyond the automated checkers; triage the
  warn-only `verify:grammar`/`verify:cefr` reports; grow the jury sidecar. The linter +
  two-oracle fact gate already ran green, so this is refinement, not risk.
- **Full security review session (Opus 4.8):** run the repo `/security-review` skill over the
  whole app (not just a diff), Turnstile enablement, Resend SMTP, and the standing `pnpm audit`
  + `.npmrc` supply-chain posture re-check.
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
