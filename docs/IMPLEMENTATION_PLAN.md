# Premium B2 Beruf Speaking Prep — Implementation Plan

## Context
The repository `B2furBerufApp` is empty (no commits). We are building, from scratch, a
production-quality, highly interactive web app to prepare learners for the **Goethe/TELC
Deutsch B2 Beruf speaking exam**, focused on the module *„Lösung finden mit einem/einer
Partner/in"*. The goal is a polished, premium SaaS-feeling learning platform (Linear/Notion/
Stripe/Duolingo-grade) covering vocabulary, Redemittel, speaking simulations, daily practice,
and an exam mode — all client-side, no backend.

**Confirmed decisions (from user):**
- **AI partner:** scripted/offline branching dialogues + Web Speech API (TTS + optional speech
  recognition). No backend, no API keys, no cost.
- **Framework:** Vite + React + TypeScript (SPA, localStorage persistence).
- **Content depth:** broad foundation — ~8–10 themes, ~150–250 vocab items, full Redemittel
  categories, several roleplay/simulation scenarios, one full exam simulation.

## Tech Stack
- **Vite + React 18 + TypeScript** (SPA)
- **TailwindCSS** (with a custom design-token theme; dark/light)
- **shadcn/ui** primitives (Radix-based) + **Lucide** icons
- **Framer Motion** for transitions/microinteractions
- **React Router** for screen navigation
- **Zustand** for state (lightweight, with `persist` middleware → localStorage)
- **Web Speech API** (`speechSynthesis` for TTS pronunciation; `SpeechRecognition` where
  supported, with graceful fallback)
- Spaced repetition: lightweight **SM-2** implementation (hand-rolled, no heavy dep)

## Architecture / Folder Structure

```
b2-beruf-app/  (project root = repo root)
  index.html
  vite.config.ts, tsconfig*.json, tailwind.config.ts, postcss.config.js
  package.json
  src/
    main.tsx, App.tsx, router.tsx
    index.css                  # Tailwind layers + design tokens (CSS vars)
    components/
      ui/                      # shadcn primitives (button, card, dialog, progress, tabs, ...)
      layout/                  # AppShell, Sidebar, TopBar, ThemeToggle, PageTransition
      shared/                  # StatCard, ProgressRing, StreakBadge, XPBar, EmptyState, Kbd
    features/
      onboarding/              # multi-step onboarding flow
      dashboard/               # theme dashboard, daily module cards
      vocabulary/              # flashcards, SRS trainer, quiz, mastery
      redemittel/              # category browser + exercise types
      simulation/              # speaking simulation engine + UI
      exam/                    # full exam-mode simulation
      analytics/               # progress visualizations
      revision/                # quick revision mode
      settings/                # profile/settings (theme, voice, reset)
    engine/
      srs.ts                   # SM-2 scheduling
      dialogue.ts              # scripted branching dialogue runner
      speech.ts                # TTS + speech-recognition wrappers (feature-detected)
      scoring.ts               # XP, streaks, mastery math
    store/
      useProgressStore.ts      # XP, streak, SRS state, mastery (persisted)
      useSettingsStore.ts      # theme, voice, recognition prefs (persisted)
      useSessionStore.ts       # transient session/exercise state
    data/                      # authored content datasets (typed)
      themes.ts
      vocabulary.ts
      redemittel.ts
      dialogues.ts             # roleplay/simulation scenarios + branches
      examSets.ts
      grammar.ts
    types/                     # shared TS types (Theme, VocabItem, Redemittel, Dialogue, ...)
    lib/                       # utils (cn, formatters, hooks: useTimer, useLocalStorage)
```

## Design System
- CSS-variable design tokens in `index.css`; Tailwind extends `colors`/`radius`/`shadow` from
  them. Calm neutral base + a single accent gradient. Glassmorphism on overlays/cards.
- Dark + light themes via `class` strategy; toggle persisted in `useSettingsStore`.
- Framer Motion: shared `PageTransition`, list stagger, card hover/press microinteractions,
  flashcard flip, progress-ring spring animations. Respect `prefers-reduced-motion`.
- Typography: Inter (variable) via local/CDN font; tight modern spacing scale.
- Accessibility: Radix primitives, focus-visible rings, ARIA on interactive widgets, keyboard
  nav for flashcards/exercises, reduced-motion support.

## Content (datasets in `src/data`, fully typed)
- **Themes (~8–10):** Meetings & teamwork, Scheduling & planning, Logistics & transport,
  Customer communication, Conflict resolution, Project coordination, Technology/digitalization,
  Sustainability, Work safety/health, Business travel. Each theme links to its vocab clusters,
  Redemittel, roleplay prompts, and simulation scenarios.
- **Vocabulary (~150–250 items):** `{ id, de, en, ipa/pronunciationHint, examples[], context,
  related[], themeId, partOfSpeech, article }`.
- **Redemittel:** categories = suggestions, agreeing/disagreeing, negotiation, compromise,
  clarification, opinions, advantages/disadvantages, professional reactions. Each phrase has
  usage notes + example.
- **Dialogues/Scenarios:** branching scripts for the *„Lösung finden"* module — partner turns,
  examiner follow-ups, candidate prompt options, progressive hints, model answers.
- **Exam sets:** at least one full timed exam simulation (task sheet + partner + scoring rubric
  self-check).
- **Grammar snippets:** concise oral-fluency patterns (Konjunktiv II for politeness/suggestions,
  connectors, modal verbs, etc.).

## Feature Build Order (each feature self-contained, wired into router + AppShell)
1. **Scaffold:** Vite app, Tailwind, shadcn setup, design tokens, AppShell + Sidebar/TopBar,
   theme toggle, router, stores. Verify it boots.
2. **Onboarding:** multi-step (goal, exam date, daily target, level) → seeds settings/progress.
3. **Dashboard:** theme grid, daily-practice module cards, streak/XP/mastery summary widgets.
4. **Vocabulary trainer:** flashcards (flip), SM-2 SRS queue, active-recall quiz, TTS
   pronunciation, mastery indicators, progress.
5. **Redemittel trainer:** category browser + exercise types (sentence completion,
   drag-and-drop construction, quick-response, dialogue continuation, roleplay cards, timed)
   with instant feedback/hints.
6. **Speaking simulation engine:** `dialogue.ts` runner + UI — timed tasks, dynamic prompts,
   progressive hints, examiner follow-ups, branching, TTS partner, optional mic recording via
   SpeechRecognition with fallback.
7. **Daily practice:** streaks, XP, adaptive review queue, daily challenge, 5–10 min quick
   sessions.
8. **Exam mode:** full timed simulation of the partner module + self-scoring rubric.
9. **Analytics:** progress over time, mastery by theme, streak calendar, XP charts (lightweight
   SVG/Framer, or `recharts` if needed).
10. **Quick revision mode** + **Settings/profile** (theme, voice selection, speech toggle,
    reset progress).

## Key Reusable Pieces
- `engine/srs.ts` (SM-2) consumed by vocabulary + daily review.
- `engine/speech.ts` (feature-detected TTS/recognition) reused by vocab, Redemittel, simulation.
- `engine/scoring.ts` (XP/streak/mastery) reused by every practice surface.
- `components/shared/*` (ProgressRing, StatCard, XPBar, StreakBadge) reused across dashboard,
  analytics, daily practice.
- `components/layout/PageTransition` reused on every route.

## Verification
- `npm install` then `npm run dev` — app boots clean, no console errors.
- `npm run build` — production build succeeds (typecheck passes).
- Manual walkthrough of each screen: onboarding → dashboard → vocab flashcard flip + TTS →
  Redemittel exercises with feedback → run a full simulation with branching/hints → complete a
  daily session (XP/streak increments persist after reload) → exam mode → analytics render →
  settings theme toggle persists.
- Verify localStorage persistence survives reload; verify reduced-motion + keyboard nav on
  flashcards; verify graceful fallback when SpeechRecognition is unavailable.
- (If browser-driver tooling is available, screenshot the dashboard + simulation for a final
  visual check.)

## Notes / Constraints
- All work on branch `claude/determined-euler-xUDrh`. Commit in logical chunks; push with
  `git push -u origin claude/determined-euler-xUDrh`. **No PR** unless explicitly requested.
- No backend, no secrets, no external API calls at runtime (fonts/CDN optional).
- Content is authored to be exam-realistic but is original (not copied from copyrighted exam
  materials).
