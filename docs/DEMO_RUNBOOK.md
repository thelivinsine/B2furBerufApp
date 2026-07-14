# Demo Runbook — Genauly (genauly.de)

_Authored s115 (2026-07-14) for the founder demo. One-page cheat sheet: how to prep the demo
device, which two account states to use, the exact tour order, and what to do if something
misbehaves on stage. Companion: `docs/plans/DEMO_READINESS_PLAN.md` (the sweep this came out of)
and `docs/plans/PHASE2_SETUP.md` (Supabase console steps)._

## 0. Pre-flight checklist (do the evening before)

- [ ] The final change is **merged to `main`** and the Pages deploy is green (Actions tab).
      Only merges to `main` update the live site.
- [x] **Feedback function is already deployed and live** (done in the s112 follow-up via the
      Supabase dashboard: `public.feedback` table + `submit-feedback` Edge Function with Verify JWT
      OFF + `RESEND_API_KEY` set), **including the abuse rate-limit**. Nothing to deploy for the demo.
      Just confirm it works: submit one test message from the live site and check the email arrives.
      _(Only if you later change `submit-feedback`'s code: redeploy with `supabase functions deploy
      submit-feedback` — no migration/secret needed.)_
- [ ] (Optional, not required for tomorrow) Enable Turnstile on guest sign-in and set
      `FEEDBACK_IP_SALT` — steps in `docs/plans/PHASE2_SETUP.md`.

## 1. Device prep (do this on EVERY demo device, AFTER the final merge)

The PWA is `registerType: "autoUpdate"`, so a device that visited before shows the OLD version
for one load after a deploy. To force the new version onto the device:

1. Open **genauly.de**.
2. **Hard-refresh** (or, if running as an installed PWA, fully close and reopen it **twice**).
3. Verify you are on the new build by checking a visible recent change (the nav labels read
   **Praktisch · Theorie · Fortschritt · Einstellungen**; the Dashboard shows the **Lernen /
   Spielen** toggle over a **Lernpfad** city map).

The sandbox cannot reach genauly.de, so this verification is yours to do on the real device.

## 2. The two demo states

You need one lived-in account and one brand-new one. Use **two separate browser profiles**
(or one normal + one incognito) so nothing bleeds between them. Account switching on a single
device is safe since the s108 data-isolation fix, but separate profiles are cleaner on stage.

### Seeded (lived-in) state — recommended manual path, zero code risk
On the demo device, the **evening before**, sign in and by hand:
- Complete **2–3 composed sessions** (Dashboard → Lernen → "Jetzt üben", answer the blocks).
- Play **missions 1.1 and 1.2** (Dashboard → Spielen → play "Willkommen in Neuland", then the
  Automat mission).
This produces a real streak, XP, Fortschritt stats, and a partly-lit Lernpfad map. Because you
are signed in, cloud sync makes this state portable to any device you sign in on.

_(Fallback only if you cannot pre-seed: a localStorage snippet writing the `b2beruf.progress.v1`
and `b2beruf.settings.v1` keys. Verify the exact shape against `useProgressStore` /
`useSettingsStore` persist config first. The manual path is safer; prefer it.)_

### Clean state — for the onboarding segment
A second browser profile / incognito window with nothing stored. This shows the landing page
and the full onboarding flow exactly as a first-time audience member sees it.

## 3. Suggested tour order (happy path only)

1. **Clean profile** → open genauly.de → **landing page** → walk **onboarding** to the dashboard.
2. Switch to the **seeded profile**.
3. **Dashboard → Lernen**: the Lernpfad city map + module card → tap **"Jetzt üben"** → play
   **2–3 blocks** of a composed session (flashcard, quiz, typing), then close.
4. **Dashboard → Spielen**: the Neuland hub → play a **mission** full-screen a few scenes (the
   pixel game, bag in the HUD, the dialogue battle).
5. **Theorie** (`/library`): switch tabs, open the **Wörter Graph** view (the word web), open the
   **filter tile**, pick a facet, then reset. Optionally open a **Grammatik** lesson.
6. **Fortschritt**: the daily-goal ring, streak, Can-Do milestones, theme mastery.
7. **Closer — feedback button**: "tell me what you think right now." Tap the **Feedback** pill,
   type a line, submit. It emails you live. A nice demo beat, and it seeds your post-demo backlog.

## 4. Failure fallbacks (if something misbehaves on stage)

- **Backend/Supabase down:** the app runs **local-only when already loaded** (PWA cache). So
  **do not sign out during the demo** on the seeded device. If sign-in fails, keep going on the
  already-loaded session; the content, sessions, missions, and Theorie all work offline.
- **Conference wifi slow:** keep a **phone hotspot** as network backup. First paint on a throttled
  connection is ~3–4s (verified), then it is instant from cache.
- **Feedback email does not arrive:** the message is still **stored** in the `public.feedback`
  table even if the email send fails, so nothing is lost. Read it later in the Supabase table
  editor.
- **A device shows the old version:** repeat the Device-prep hard-refresh / close-reopen-twice.

## 5. Known rough edges (steer-around list)

The s115 pre-demo sweep (Playwright across mobile + desktop, light + dark, 28 routes + core
interactions) found **no console errors, no error boundaries, no dead routes, no blank pages, and
no horizontal overflow**. All 9 CI gates are green. There is no known-broken screen to avoid.

Two things that are **by design**, not bugs, in case they come up:
- In-mission game scenes are **light-theme only** (the hub and the rest of the app are
  theme-aware). This is intentional; dark missions are deferred.
- **Anwenden** is hidden from the nav for the demo. Its screens still exist at `/anwenden` and
  `/welt` but are reached from within the app, not the tab bar.

## 6. After the demo

Whatever the audience submits through the **Feedback** button becomes the next backlog: the
`public.feedback` table + the email trail is the source. Triage it into `docs/PROJECT_REFERENCE.md`.
