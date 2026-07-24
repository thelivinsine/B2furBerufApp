# Project Status

_Last updated: 2026-07-24 (session 161). **Control-center note/approve save race fixed:** in the
`/sources/werkbank` workbench, typing a Notiz then ticking approve used to clobber the note (two
whole-row upserts off the same stale snapshot); `useWorkbench` now merges from an always-latest ref
and serialises per-id writes, so notes and approvals persist together. `pnpm apply:reviews` (the 14
approvals) is BLOCKED on the founder's browser decision-export (no key / file in this env). Prior
s160: Schreiben KI-Hinweis relocated + "Feedback" label shortened app-wide. Product name: **Genauly**
(`genauly.de`)._

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
- **`../CLAUDE.md`** — the lean always-on operating rules (restructured s155, ~180 lines); deep
  per-area detail lives in **`docs/areas/`** (COMMANDS, CONTENT, BIBLIOTHEK, SESSION, SCHREIBEN,
  PRAKTISCH-NAV, GAME, BRAND, LEGAL-ADMIN, COMPONENTS) + the `/design` and `/content` skills.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Praktisch · Bibliothek · Schreiben · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1
complete), Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `docs/areas/` (index
in `../CLAUDE.md`).

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **3,107
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: **all** provenance rows are AI-drafted and `draft`, none human-verified
(human verification was reset to zero on 2026-07-22 at founder request, to restart the review pass;
see `strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. The s147 Satzlabor redeploy is
done (s150: all three AI functions deployed on the Gemini-primary cascade, `GEMINI_API_KEY` set). Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
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

**Handoff after session 161 (2026-07-24). Control-center (`/sources/werkbank`) note/approve save
race fixed, branch `claude/apply-review-decisions-lw5azm`.** The founder asked whether a comment
typed before approving/rejecting in the control center is saved. Investigation found it was NOT
reliable: the workbench row has only a verified **checkbox** (= `approve`) + a **Notiz** field (no
reject/needs_fix control in the UI at all). The note commits on blur/Enter and the checkbox saves
separately, but both `onChange` calls in `useWorkbench` (`Sources.tsx`) read the SAME stale `reviews`
snapshot and each `upsert`s the whole row, so typing a note then ticking approve wrote the row twice
off the same base and the approve write (carrying the pre-note empty comment) clobbered the note,
locally and in Supabase.
- **Fix (`src/features/legal/Sources.tsx`, `useWorkbench`):** `reviewsRef` (always-latest map) feeds
  the merge base instead of the memo closure, and a per-`content_id` promise chain (`writeChains`)
  serialises back-to-back edits so the approve write merges on top of the committed note. Call sites
  in `AdminWorkbench.tsx` unchanged (the `onChange(id, { verified: true })` test contract holds).
- **Gates:** typecheck · lint (0 errors) · adminWorkbench/reviewExport/applyReviews tests **20/20** ·
  build · check:bundle **116.8 kB**, all green. Decision recorded in `docs/DECISIONS.md`.
- **BLOCKED — `pnpm apply:reviews` (the 14 approvals) not run this session.** The keyless flow needs
  the founder's browser export (`/sources` → "Entscheidungen" download); the direct-DB flow needs
  `SUPABASE_SERVICE_ROLE_KEY`, which must NOT live in this environment. Neither the export file nor
  the key is present, and the decision-time content fingerprints cannot be fabricated (that IS the
  integrity check). **Next:** founder ticks the 14 items, clicks "Entscheidungen", provides the JSON;
  then `pnpm apply:reviews --from <file>` flips them + stamps + lints in one commit. Fixing the save
  race first means those approvals (and any notes) now persist correctly before the export.

**Handoff after session 160 (2026-07-24). Schreiben KI-Hinweis relocated (Fokus + Kurz/Lang) +
"Feedback" label shortened app-wide, branch `claude/disclaimer-text-layout-5zq5g0`.** A small
preview-first Schreiben tweak. The founder wanted the combined Art. 50 disclaimer off its
centered-in-flow spot and onto the same line as the floating Feedback affordance. First round put
both in a bordered bottom bar; the founder corrected: keep the floating pill exactly as-is, just
drop the text to its level. A follow-up prompt extended it to Kurz/Lang and shortened the pill label.
- **Desktop (`FokusTrainer.tsx` `aiNoteDesktop`):** the `FeedbackPill` (`fixed bottom-4`, AppShell) is
  untouched; the note is now a `fixed inset-x-0 bottom-4 z-20 hidden lg:block lg:pl-64` element that
  mirrors the pill's `max-w-6xl` + `sm:px-6` container, capped `max-w-[calc(100%-18rem)]` so its right
  edge clears the pill. Wrapper is `pointer-events-none`, only the `/privacy` link is clickable, so it
  never blocks the cards it floats over. Full sentence kept (founder pick).
- **Mobile:** the action bar lost its `border-t`/`bg-background/90`/`backdrop-blur` chrome; the
  `FeedbackIconButton` (imported from `components/layout/FeedbackButton`) floats beside the flex-1
  Korrigieren button, with a condensed "KI-geprüft, kann Fehler enthalten. Mehr" line centered below.
  Both the buttons and the mobile note are pre-correction only (shared `m.status !== "corrected"`
  guard); the desktop fixed note always shows on the Fokus tab.
- **Kurz/Lang parity (follow-up prompt, same session):** `GuidedWritingTrainer.tsx` got the SAME
  treatment. Its inline disclaimer `<p>` was removed from `content`; it now has its own copy of the
  fixed `aiNoteDesktop` (Kurz/Lang wording) and a reworked chrome-less mobile action bar where the
  `FeedbackIconButton` floats beside Auswerten (and Neu schreiben after a result) with the condensed
  note beneath. Only one trainer renders per `/writing` tab, so the two fixed notes never coexist.
- **Feedback label shortened app-wide (same follow-up):** "Mit KI gebaut · Feedback" → **"Feedback"**
  in `FeedbackButton.tsx` (`FeedbackPill` default label, `FeedbackFullButton` text, `FeedbackIconButton`
  aria/title) and the `AdminSteuerung` label placeholder. Remote-config `feedback.label` still
  overrides the pill. `MessageSquareText`/`Sparkles` icons unchanged.
- **Preview:** `preview/fokus-disclaimer-inline.html` (real tokens, r3 shows the "Feedback" label +
  the Fokus/Kurz-Lang note), screenshot-verified in headless Chromium. Could NOT live-verify (unauth
  `/writing` redirects to the landing page); founder verifies live. Docs: `docs/areas/SCHREIBEN.md`
  + `docs/areas/PRAKTISCH-NAV.md` updated.
- **Gates:** typecheck · build · lint (0 errors) · check:bundle **116.8 kB**, all green.
- **Shipped:** PR #688 squash-merged to `main` (merge commit `4cbf0fe`), Pages deploy triggered.
  Decision recorded in `docs/DECISIONS.md`; the `design` skill §2.6 now carries the Schreiben
  disclaimer-placement exception so a future session doesn't re-center it.
- **Next:** nothing pending. Founder verifies the live result (PWA: hard-refresh past a stale SW).

_(Older session handoffs are archived by ISO week under `docs/archive/status-log/`; the index
mapping every session to its week file is `docs/archive/PROJECT_STATUS_ARCHIVE.md`.)_
