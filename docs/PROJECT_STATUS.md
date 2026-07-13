# Project Status

_Last updated: 2026-07-13 (session 112 ran as two parallel branches). **Demo-readiness Chunks 2+3
(Opus 4.8):** regression review of the s102–110 demo-prep rounds + abuse hardening for the shared demo
link (stale "(Heute)" copy fixed, returning-user migration verified, two migration-free rate-limit
guards on `submit-feedback`, RLS re-check). **Demo-readiness P2 content-accuracy pass (Fable → Opus
4.8):** proofread the demo-visible German (6 Kapitel-1 missions, top-spine grammar lessons, help
articles), fixed the real `verify:grammar` findings, retagged the 6 `verify:cefr` FLAG items, grew the
AI-jury sidecar +39 ids, and **regenerated the stale `src/data/verification.ts`** (was missing the s102
Branche packs; now 2,263 records, jury tier 149→188). All 9 gates green. Product name: **Genauly**
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

**Content banks (as of 2026-07-12, session 102 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,113** · collocations **741** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,263 rows** · themes **15** ·
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

**Handoff after session 112 (2026-07-13). Demo-readiness Chunks 2 + 3 shipped (Opus 4.8), on branch
`claude/predemo-opus-tasks-ek5qhz`.** The two Opus "Tonight A" chunks of `DEMO_READINESS_PLAN.md`:
regression review of the s102–110 demo-prep rounds + abuse hardening of the public feedback path.
- **Chunk 2 (regression review) — findings:** fixed the two stale "(Heute)" strings the rename left
  behind (`Session.tsx` session-empty-state eyebrow → "Praktisch"; the `hilfe/erste-schritte` help
  article DE+EN → "(Praktisch)", reprerendered). Verified SAFE with no change needed: (a) the
  returning-user `pinnedTabs`/`ROUTE_SUCCESSOR` migration — `BottomTabBar` filters pins to
  `CONTENT=["/library","/analytics"]` and `BarTab` returns null for unknown paths, and `Sidebar`
  renders `navItems` directly, so a stale `/anwenden` pin from a pre-s105 device can't break either
  bar; (b) the feedback surfaces (pill desktop-only + off `/` + off focus/missions, dialog mounted
  app-wide, graceful failure); (c) `/session` junk-param handling (`mission`/`grammar`/`theme`/`cefr`/
  `sector`/`cat`/`sub`/`min` all fall back, never crash).
- **Chunk 3 (abuse hardening) — shipped:** `submit-feedback` (`supabase/functions/submit-feedback/`)
  now has two **migration-free** guards: a per-IP burst limit (≤5 / 10 min, in-memory, hashed IP) and
  a DB-backed global hourly email ceiling (≤60/hr stops the email but still stores the row). Friendly
  German error preserved. RLS re-checked across 0001–0006 (all owner-scoped to `auth.uid()` or the
  founder-email gate; `feedback` + `ai_usage` service-role-only; no public SELECT). `delete-account` +
  `evaluate-writing` re-confirmed JWT-gated + CORS-allowlisted; evaluate-writing keeps its daily/
  monthly/per-user caps. Founder console steps added to `docs/plans/PHASE2_SETUP.md`.
- **⚠️ Founder action:** run `supabase functions deploy submit-feedback` for the rate limit to go live
  (no new migration or secret needed; optional `FEEDBACK_IP_SALT`).
- **Gates:** all green — typecheck ✔, lint 0 errors/44 warnings, lint:content ✔, test:unit 134/134,
  test:srs 323, test:pronounce 26, build+prerender ✔, check:bundle 79.5 kB/400.
- **Remaining plan chunks:** 1 Playwright smoke test (Sonnet 5), 4 UI polish (Sonnet 5), 5 demo runbook
  `docs/DEMO_RUNBOOK.md` (Sonnet 5), 6 perf sanity (Sonnet 5, P1). See `DEMO_READINESS_PLAN.md`.

**Handoff after session 112 (2026-07-13). Demo-readiness P2 content-accuracy pass shipped (Fable →
Opus 4.8), on branch `claude/predemo-plan-fable-tasks-gdray4`.** The task was the plan's P2 "content
accuracy pass" (proofread demo-visible German beyond the automated checkers). This is content-only; no
app logic changed. **The other DEMO_READINESS_PLAN chunks (P0 1–5, P1 6) are still open** for the
recommended models (Opus 4.8 / Sonnet 5); start there next by reading
`docs/plans/DEMO_READINESS_PLAN.md`.
- **verify:grammar fixes (real findings only, the rest are LanguageTool noise on proper nouns):**
  `r_neg7` `auf einander`→`aufeinander`; `r_cla6` straight→curly closing quote; dialogue `k3a`
  `Dieses`→`dieses` after a colon; dialogue `s4b` `du`→`Du` after a colon; 4 texts `den`→`dem`
  ("am Dienstag, dem 14. Juli"); `tx_wohnen_email_besichtigung` `gern`→`gerne` clash + "Die Kaution
  beträgt"→"Als Kaution verlangen wir" (three-sentence-start repeat).
- **verify:cefr FLAG retags (common word carrying an advanced B2.2 label):** `v_umwelt`→B1.1,
  `v_vermeiden`→B1.2, `v_muell_vermeiden`→B1.2, `v_energie_sparen`→B1.1, `v_bewusst`→B2.1,
  `v_zudem`→B2.1. (The 77 WATCH/B2.1 items are info-only, left as-is.)
- **Proofread clean (no edits needed):** all 6 Kapitel-1 mission scripts (`missions.ts`), the 6
  top-spine grammar lessons (Konnektoren/Relativsätze/Konjunktiv II/Modalverben/Passiv/Nebensätze),
  and the 7 help articles (`features/help/content.ts`) all read correct, no em dashes.
- **Jury sidecar + verification map:** appended +39 reviewed ids to `docs/reports/jury-review.json`
  (6 top-spine grammar topics + their drills, the 6 mission ids) and ran `pnpm build:verification`.
  **That regen also fixed a stale generated file:** the committed `verification.ts` had only 2,110
  records and was missing the s102 Branche collocation packs; it now has 2,263 (jury 149→188, and the
  Branche packs get proper provenance/facts tiers). A prior session added s102 content without
  regenerating it, so this was overdue.
- **Gates:** all 9 green — typecheck; lint 0 errors/44 deliberate warnings; lint:content; test:unit
  134/134; test:srs 323; test:pronounce 26; audit 0 vulns; build + prerender; bundle 79.5 kB/400.
- **NOT done (deliberate):** deeper LanguageTool triage and jury waves beyond the spine (optional
  polish); all P0/P1 plan chunks (run on the recommended models). No `review_status` flips (that is a
  human-only action; the jury tier is an honest machine tier).

_(Session 111's handoff (demo-readiness plan authored + baseline verified) and sessions 85-110's
handoffs, plus the s104 Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
