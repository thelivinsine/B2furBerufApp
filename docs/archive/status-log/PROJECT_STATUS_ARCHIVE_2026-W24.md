# Project Status Archive — 2026-W24 (Jun 8–14)

_Detailed session logs, sessions 20–22. Split from `PROJECT_STATUS_ARCHIVE.md` by ISO week in s70._

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


