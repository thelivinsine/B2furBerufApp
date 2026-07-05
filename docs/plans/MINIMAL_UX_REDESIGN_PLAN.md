# Minimal, game-ready front-end redesign — plan

_Status: **PROPOSED**, awaiting founder go-ahead (session 61, 2026-07-05). Nothing here is
implemented yet. This is the engineering companion to the visual strategy report delivered to the
founder in session 61; it builds directly on `docs/reference/GENAULY_UX_UI_ANALYSIS.md` (the 7-dimension
UX audit) and `docs/strategy/GAME_CONCEPT.md` (the unified-world RPG vision). Read both before
executing._

## The brief (founder, session 61)

The app has too much info, text and detail for someone new, and too much German interface text.
Target: minimal, extremely user friendly, highly intuitive, engaging and interactive. The user base
is (a) busy working professionals and students with short, reels-trained attention spans and
(b) hardcore exam-prep users who actively want all the detail. One standing vision: exercise
progress feeds into the game so app and game form a unified world.

## Diagnosis (why it feels like "a lot")

1. **Text-first surfaces.** Almost every screen is stacked text cards (eyebrow + title +
   description + meta, 4 to 6 times per screen). Heute alone renders ~120+ words of interface
   chrome before any learning starts.
2. **German chrome before German content.** Interface copy and section descriptions are
   German-first (onboarding mixes Denglish), with no instant gloss. A B1 learner decodes German
   just to navigate.
3. **Asking before giving.** Onboarding is 5 form steps (name, goal, mode, level, exam date, XP
   goal, consent) before the first exercise. Time-to-first-exercise is minutes, not seconds.
4. **Expert density is the default for everyone.** Facets, CEFR bands, charts are ideal for the
   exam prepper and overwhelming as a first impression.

## Strategy: lean surface, deep drawer

Design the default surface for the skimmer; keep every bit of the diver's depth exactly one tap
deeper. Nothing is deleted, density is re-layered. The five principles every screen must pass:

1. **One job per screen.** Exactly one visually dominant primary action.
2. **Show state, don't describe it.** Ring instead of XP sentence, lit building instead of mastery
   table, chip instead of paragraph.
3. **German is the content, not the chrome.** Display-size German inside exercises; short
   interface microcopy; a D/E tap-gloss on every German content line (game convention, shipped
   early).
4. **Reward with the world, not with text.** Loot cards, city buildings, quest claims; XP and
   streak stay but stop being the only feedback.
5. **Depth on demand.** Compact by default, expandable on tap, remembered per user.

## Visual language changes

- **Color.** Existing tokens stay. New rule: the indigo→violet gradient appears ONLY on the
  primary Start action and on reward moments (today it is wallpaper). Add one token pair:
  **reward gold** (light `#d98a06` on `#fdf3e0` / dark `#e8a33d` on `#302512`, as HSL tokens in
  `index.css` + `tailwind.config.ts`), used exclusively for loot, combos, lit buildings.
- **Type.** Keep Inter. Raise contrast: the one message per screen at 28–32px/700+; body 15px;
  eyebrows 11px uppercase. Inside sessions the German target is always the largest element.
- **Microcopy budget (enforce in review, note in CLAUDE.md when shipped):** eyebrow ≤ 2 words,
  title ≤ 5 words, **section description sentences are deleted, not shortened**.
- **Motion.** framer-motion only, concentrated on feedback: answer tick + ring advance, combo
  pulse at 3 in a row, spring loot drop. Remove ambient browse animations. `MotionConfig`
  reduced-motion support already exists (s58), keep honoring it.
- **Illustration.** Extend the two-tone route-mark style to six flat SVG **domain buildings**
  (Bürgeramt, Bank, Arztpraxis, Büro, Wohnhaus, Prüfungshalle). Deliberately the seed of the
  game's world map (same city metaphor, later walkable). No pixel art yet (awaits founder
  blessing per GAME_CONCEPT.md).

## Screen-by-screen spec

### Onboarding (`features/onboarding/Onboarding.tsx`)
5 steps → **1 setup screen + taster session**:
- Screen 1: „Wofür lernst du Deutsch?" (Beruf / Alltag / Prüfung / Beides as big visual tiles,
  maps to `LearningGoal`+`mode`), one CEFR chip row (A2–C1), the existing consent checkbox.
  Consent stays BEFORE any progress is stored (legal flow unchanged).
- Then straight into a ~90-second taster session (5 blocks via the existing composer, defaults:
  level band, 80 XP goal).
- Name, exam date, daily rhythm are collected contextually: name + rhythm on the first session
  end screen, exam date in Einstellungen and on the Prüfung surface. `completeOnboarding` keeps
  its signature; missing fields use current defaults.

### Heute (`features/dashboard/Dashboard.tsx`)
Six blocks → **three elements** (+ city strip in Phase 3):
- **Streak ring**: fuses greeting, streak flame, and daily-goal progress into one conic-gradient
  ring (pure CSS/SVG, no recharts on the eager path).
- **Start button**: the one gradient element; subtitle line "~N Min · X fällig".
- **Situationen chips**: icon-first horizontal scroll row, no section header, no description
  sentences (edit `intentCards.ts` rendering only; the card data stays).
- Remove from Heute: the section heading block, the stats strip card (ring covers it), the
  Bibliothek link card (its zone tab already exists in the locked bottom bar).

### Session (`features/session/SessionPlayer.tsx`, `AppShell`)
**Full-screen focus mode**:
- Hide header + bottom bar for the `/session` route (CSS-level in `AppShell`; do NOT touch the
  locked bar mechanics, it is simply not rendered during a run, and returns on the end screen).
- One block per screen, thin top progress bar, ✕ to exit, display-size German, large tap
  targets, slide transitions between blocks.
- **Combo counter**: consecutive-correct count with a gold pulse at 3+; resets on miss. Purely
  visual, no XP multiplier initially (keeps `engine/scoring.ts` untouched).
- **D/E gloss**: new shared `<Gloss>` component (tap toggles German explanation / English
  translation on any content line). Content banks are already bilingual; this is rendering only.
- **End screen = loot drop**: "+XP · Tagesziel" with ring fill animation, then the reviewed words
  as collectible cards with levels derived from live FSRS state (map stability/interval bands to
  Lv 1–5 in a small pure helper, e.g. `engine/collection.ts`), "Lv n ↑" when a card leveled this
  session. Keep the existing "Morgen: X festigen" forward hook.

### Bibliothek + Fortschritt (`features/library/*`, `features/analytics/Analytics.tsx`)
- Bibliothek structure, facets, search: **unchanged** (the diver's home). Presentation only:
  German word leads each row at higher weight, meta demoted to one quiet line.
- Fortschritt leads with the **city view** + the next Can-Do milestone as a **quest card**
  ("Ich kann …", progress, claim moment via `canDo.ts` thresholds). Charts/calendar/mastery grid
  collapse under an expandable "Details" section (persist the expanded flag in
  `useSettingsStore`).

## The unified-world bridge (game contract)

The app UI and the future RPG are **two renderers over the same progression state**, which already
lives in `useProgressStore` (+ cloudSync). Mapping to keep stable:

| Progression data (exists) | App renders as | Game will render as |
|---|---|---|
| FSRS card state per word | Collection card Lv 1–5 | Bag item, upgradeable loot |
| Theme/domain mastery | City buildings lighting up | Districts unlocking |
| Can-Do milestones | Quest cards | Mission badges |
| XP + streak | Daily ring | Character level |
| `savedWords` | „Meine Sammlung" | Starting inventory |

Deliberately NOT built yet: game engine, Phaser, pixel-art pipeline, walkable map. Phase 3 ships
flat SVG buildings + collection UI inside the React stack only.

## Phases

**Phase 1 — the diet (S, ~1 session).** Heute to 3 elements; onboarding to 1 choice + taster;
microcopy budget applied app-wide; `<Gloss>` component wired into session blocks; flip the two
research-backed defaults from the UX analysis (`voiceVariety: true`; speaking on by default where
STT is supported, typed fallback stays). Gates: build, lint, test:unit, check:bundle.

**Phase 2 — the stage (M, 1–2 sessions).** Focus-mode session route, combo counter, ring
animation, loot-drop end screen + FSRS level mapping helper (unit-test the band mapping).

**Phase 3 — the world seed (M, ~2 sessions).** Six SVG domain buildings; city strip on Heute;
Fortschritt led by city + quest cards, charts behind "Details"; „Meine Sammlung" bag view
(upgrades `savedWords` + mastered items). Lazy-load anything heavy; respect the 400 kB budget.

**Phase 4 — the depth (M–L, 2–3 sessions).** From the UX analysis: typed forward-recall step for
vocab (tolerant matching like grammar drills), authentic Lesen/Hören block in the daily loop.
Retention core; sequenced after the surface is calm.

Each phase ships independently via the normal PR → `main` → Pages flow so the founder verifies
live per phase.

## Constraints (locked, do not violate)

- Four-zone bottom bar and its icon/edit mechanics (CLAUDE.md, locked s26–29). Focus mode hides
  chrome on `/session` only; zero changes to bar structure or store.
- Modal/overlay standard (`bg-dialog-overlay` + `shadow-elevated-soft`).
- Brand logo rules; legal/consent flow (consent stays in shortened onboarding, `CONSENT_VERSION`
  untouched unless legal copy changes).
- 400 kB main-chunk budget; keep the Dashboard eager path light (no `engine/session.ts` import).
- No em dashes in any user-facing copy.
- No new dependencies; no analytics/tracking (success metrics computed from on-device data only).

## Success measures

| Measure | Today | Target |
|---|---|---|
| Install → first exercise | ~3–5 min | < 60 s |
| Interface words on Heute | ~120+ | < 40 |
| Session completion rate | unmeasured | locally visible, > 80% |
| Next-day return | unmeasured | trend visible in `activeDays` |
