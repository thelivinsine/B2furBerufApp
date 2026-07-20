# Session & Prompt Log

**Purpose.** A chronological, append-only record of every instruction the founder gives and the
assistant's response to it. This exists to create a clear, timestamped **paper trail of authorship
and creative direction** for the elements of this app, in case we register or defend copyright in
them. It complements (does not replace) the primary record, which is **git history** (timestamped,
authored commits) and the **merged pull requests**.

> Not legal advice. For an actual filing, a lawyer should advise on what evidence matters in the
> relevant jurisdiction (the product targets Germany/EU, where copyright protects human-authored
> creative expression; a log showing substantial human creative direction strengthens that claim).

## How this log is maintained (the rule)
- **Every founder prompt gets one entry**, appended in order, newest at the bottom. Entries are
  never edited or deleted after the fact (append-only); corrections go in a new entry.
- Each entry records the meta info below. Prompts are stored **verbatim** (they are the creative
  direction). If a prompt included an attachment (image, file), that is noted.
- The assistant writes the entry as part of handling the prompt. Keep the **response summary**
  concise but specific, and always tie it to the resulting **artifacts** (files, commit SHAs, PRs)
  so each instruction is traceable to the code that realized it.
- **Do not paste secrets** (keys, tokens, personal data) into this file; it is committed to the repo.
- This file is the detailed trail. `CLAUDE.md` only carries the short rule and points here, and
  `docs/PROJECT_STATUS.md` keeps the higher-level session narrative. Keep those lean; put the
  blow-by-blow here.
- **Append to the tail, don't re-read the whole log.** To add an entry you only need the last entry's
  number and the template above. Read the final ~30 lines, not the entire file, so logging stays cheap
  as history grows.

### Rotation policy (keep the live file bounded, added 2026-07-05)
This live file must not grow without limit. **Budget: keep the current session plus roughly the last 5
sessions here, and rotate whenever the live file passes ~1,200 lines.** To rotate, move the oldest
entries out of this file into the **ISO-week** archive under `docs/archive/prompt-log/` (one file per
week, `SESSION_PROMPT_LOG_YYYY-Www.md`; see that folder's `README.md` index). Append each moved entry to
the week file matching **its own date** (create the week file if it does not exist yet, with the same
short header the others use). Keep this header, the rule, and the entry template in the live file. The
week archives themselves are append-only history: never rewrite entries when moving them, and loading a
single week stays cheap because each week file is small.

### Automated raw capture (removed 2026-06-25)
There used to be a `UserPromptSubmit` hook (`.claude/hooks/log-prompt.sh`) that appended one JSON
line per prompt to **`docs/prompt-log-raw.jsonl`**. The founder asked for it to be removed on
2026-06-25, so the hook and its script are gone and `.claude/settings.json` no longer wires it. The
existing `docs/prompt-log-raw.jsonl` is kept as a historical record but is no longer appended to.
This curated Markdown file remains the prompt log, and entries are now added **manually**. The founder
directed (s42) that **any "update the documentation"-type request implies updating this log too**, even
when the prompt log is not named explicitly. So whenever you update `docs/PROJECT_STATUS.md` for a
session, append that session's prompts here as well and ship them together.

### Entry template
```
## Entry N — <YYYY-MM-DD HH:MM UTC>
- **Branch:** <git branch>
- **Assistant:** Claude Code (Anthropic)
- **Attachments:** <none | description>
- **Prompt (verbatim):**
  > <the founder's message>
- **Response summary:** <what the assistant did / answered>
- **Artifacts:** <files changed · commit SHAs · PR #s · merge SHAs>
```

---

## Archived entries

Entries **1–391 (through 2026-07-14, session 119)** are archived by ISO week under
**`docs/archive/prompt-log/`** (`SESSION_PROMPT_LOG_2026-W25/W26/W27/W28/W29.md`; see that folder's
`README.md` index). This file holds **session 120 / 2026-07-14 onward**. Keep appending here, newest at
the bottom, and rotate per the policy above.

## Session 120 — 2026-07-14 — Content-library coverage review + deepening

**Branch:** `claude/content-library-coverage-lih2fp` · **Model:** Opus 4.8 · **Attachments:** none

- **Prompt (verbatim):**
  > in the current content library, there's sometimes clearly way too less numbers of words or
  > collocations for some themes or sub themes or branches. can you do a thorough review of the library
  > and see what can be improved? also the potential new ones to add should be genuinely useful and
  > commonly used for the users interested in those fields ir branches.
- **Clarifying question (AskUserQuestion):** asked where to focus the expansion. Founder selected all
  three: **Service Branchen + Daily-life themes + Both, in waves.**
- **Response summary:** Wrote a throwaway coverage script (loads the banks via Vite `ssrLoadModule`,
  same as the linter) to quantify vocab/collocation counts per theme, sub-theme and Branche. Finding:
  the industrial Branchen are well-covered (s94/s95/s102 packs); the gap is the **service/consumer
  world** (sports 17 / beauty 19 / hospitality 19 / retail 21 vocab) and the **daily-life themes**
  (bank 29 / behoerde 33 / bildung 34 / wohnen 47) with several near-empty sub-themes. Deepened them in
  two waves of genuinely common, high-frequency words. **Wave 1 (service Branchen):** +76 vocab / +48
  collocations across hospitality/retail/beauty/cleaning/security/sports (each `sectors`-tagged on the
  natural theme, mostly `customer`/`safety`/`arzt`; fewer for cleaning/security which were less thin).
  **Wave 2 (daily-life):** +57 vocab / +8 collocations across bank/behoerde/bildung/wohnen +
  arzt.versicherung, sub-theme-tagged to fill `behoerde.aufenthalt`/`bescheid`, all `bank`/`bildung`
  subs, `wohnen.nebenkosten`/`probleme`. Added all 189 provenance rows (DWDS refs, draft status;
  `content_type: "vocabulary"`). Regenerated `frequency.ts` after `pip install wordfreq` +
  `build:frequency-subset` (unbinned 342→86). Refreshed morphology oracle subsets; fact gate passes
  with **0 two-oracle-confirmed errors**. Totals now vocab **1,246** · collocations **797** ·
  provenance **2,452**. Gates: lint:content, typecheck, build, test:unit 142/142, check:bundle 79.6 kB,
  verify:facts all green. (Rebased twice onto main across parallel sessions 118/119; data files merged
  cleanly, docs re-applied, renumbered to session 120.)
- **Artifacts:** `src/data/vocabulary.ts` · `src/data/collocations.ts` · `src/data/provenance.ts` ·
  `src/data/frequency.ts` · `scripts/vendor/*subset.json` · `docs/reports/verify-facts-report.md` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · PR #530.

---

## Session 121 — 2026-07-14 — Merge the `arbeitswelt` domain into `beruf`

**Branch:** `claude/berufsleben-arbeitsumfeld-overlap-itmpeg` · **Model:** Opus 4.8 · **Attachments:** none

- **Prompt 1 (verbatim):**
  > what's the difference between berufsleben and arbeitsumfeld categories in the graph? they both seem
  > like they hve same color and are also redundant to a learner.
- **Response 1 (question, no code change):** Explained that these are two of the taxonomy **domains**
  (`src/data/domains.ts`), which the Bibliothek graph views color nodes by. `beruf` ("Berufsleben",
  indigo `#5b5be6`) grouped the 6 communication-heavy workplace themes (meetings, scheduling, logistics,
  customer, conflict, project); `arbeitswelt` ("Arbeitswelt & Umfeld", violet `#8b5cf6`) grouped the 4
  topical ones (technology, sustainability, safety, travel). Confirmed both founder observations: the
  two colors are ~30° apart and read as one on the dense graph, and the comms-vs-topics split is a
  taxonomist's cut invisible to learners (the German labels are near-synonyms). Offered merge vs.
  keep-but-differentiate; recommended merge given the branch name.
- **Prompt 2 (verbatim):**
  > merge
- **Response 2:** Merged `arbeitswelt` into `beruf` across 6 code sites + CLAUDE.md. Dropped the
  `arbeitswelt` entry from `domains.ts`; retagged technology/sustainability/safety/travel to
  `domain: "beruf"` in `themes.ts` (all 10 workplace themes now in `beruf`); removed the `arbeitswelt`
  color from `graphPalette.ts`; removed `"arbeitswelt"` from the `DomainId` union (`types/index.ts`) and
  `DOMAIN_IDS` (`lint-content.mjs`); set the Büro building rollup to `domains: ["beruf"]`
  (`domain-buildings.tsx`). `themeGroupsForMode` is data-driven, so the library primary dropdown
  re-groups with no code change. Gates: `lint:content` OK, `typecheck` OK, `build` OK, `test:unit`
  142/142. Opened PR #535, squash-merged to `main`, ran the post-merge branch realignment.
- **Artifacts:** `src/data/domains.ts` · `src/data/themes.ts` · `src/lib/graphPalette.ts` ·
  `src/types/index.ts` · `scripts/lint-content.mjs` · `src/components/city/domain-buildings.tsx` ·
  `CLAUDE.md` · PR #535 (`d4393da`).
- **Follow-up prompt (verbatim):**
  > document the session
- **Follow-up response:** Updated `docs/PROJECT_STATUS.md` (`_Last updated_` block + the content-banks
  domain count + a new session-121 handoff; aged session 119's z-index-fix handoff into the W29 archive
  per the doc-hygiene rule) and appended this prompt-log entry.
- **Artifacts:** `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md`.

---

## Session 122 — 2026-07-16 — Theorie graph-view quality audit + P0/P1 fixes

**Branch:** `claude/bibliothek-theorie-graphs-sk0dr3` · **Model:** Fable 5 · **Attachments:** none

- **Prompt 1 (verbatim):**
  > check the graphs in bibliothek/theorie. I think they have a lot of bugs and quality issues. Do a
  > comprehensive analysis and provide me a report with priority actions p0 to p3
- **Response 1 (analysis, no code change):** Read both graph views (`WordGraph.tsx`,
  `CollocationGraph.tsx`), both pure builders, palette, tests and the trainer mounting; ran the real
  builders + a d3-force benchmark against the live banks. Delivered a P0–P3 report in chat. P0: the
  synchronous sim warmup (`tick(120)`/`tick(160)`) freezes the main thread 951ms/1019ms (desktop-class
  CPU) per open and per filter change; a pinch starting on a node leaves `alphaTarget` hot forever
  (permanent jitter + battery drain, plus a permanently pinned node in Wörter). P1: a filtered-out
  selection ghosts the whole canvas (dead focus id dims everything, no card); the Kollokationen
  zoomed-out view renders zero labels below k=0.7 (fit-to-all is k≈0.21 phone / 0.55 laptop, the
  authored `hubBoost` was dead code); only 118/797 collocations resolve into Wörter-graph edges and
  494/2,514 `related` refs drop unresolved (content-authoring follow-up). P2: no label collision
  culling in Wörter, card covers the selected node in Wörter, wheel hijacks page scroll, legend count
  ignores filters, no resize refit, fit-button quirks, `konferenzraum` duplicate + 6 pair-form labels.
  P3: unused `register` plumbing, setState-in-updater in `toggleLayout`, `posRef` growth, stale palette
  comment, a11y, node seeding. Also noted what is healthy (tested pure builders, memoized items, lazy
  d3 chunks).
- **Prompt 2 (verbatim):**
  > add in the report, which actions should be done by which claude llm models
- **Response 2:** Added a per-action model map aligned with `docs/PROJECT_REFERENCE.md` routing: Opus
  4.8 for the warmup rework + pinch fix (and P1-3/P1-4 riding along, same files) and the P1-5 curation
  list; Sonnet 5 for the P2 ports/lifecycle fixes and content authoring; Haiku 4.5 for the mechanical
  batch. Suggested session batching (one session per tier) since Claude Code runs one model per session.
- **Prompt 3 (verbatim):**
  > can you explain why is Fable left out and what tasks are fable suitable for in simpler words?
- **Response 3 (explanation only):** Fable is the design/judgment tier; the fix list is already
  diagnosed and specified, so build tiers execute it better per euro. Fable earns its cost on
  "figure out what to build" work (e.g. rethinking the graphs as a learning surface), research-heavy or
  high-stakes judgment calls. Gave the rule of thumb: unknown-answer → Fable, tricky build → Opus,
  spec'd build → Sonnet, trivial → Haiku.
- **Prompt 4 (verbatim):**
  > alright go ahead with opus tasks
- **Response 4:** Implemented the four fixes in the two view components (pure builders + unit tests
  untouched): rAF-chunked sim warmup with a 10ms/frame budget and a 20-tick warm-restart fast path
  (>50% cached positions → draw immediately; cold start settles blank then reveals); pinch branch
  releases a half-started drag and `alphaTarget(0)` runs whenever the last pointer lifts; draw ignores
  focus ids absent from the current graph (dormant selection revives when the node returns; `fitView`
  ignores a dormant card); Kollokationen hub labels (degree ≥ 5) stay readable at any zoom with alpha
  ramping 0.4→0.9 by degree. Verified end-to-end with Playwright against the dev server (both views
  paint post-warmup with zero >200ms long tasks; tap opens card; no ghosting after filter change; hub
  labels screenshot-verified at fit-to-all; no page errors). Gates: typecheck clean, lint at the exact
  pre-change warning baseline, test:unit 147/147, build + check:bundle 79.6 kB. Opened PR #539,
  squash-merged to `main`, ran the post-merge branch realignment, and updated the docs (status handoff
  s122; s120 handoff aged into the W29 archive).
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md` · PR #539.
- **Follow-up prompt (verbatim):**
  > document the session and merge the changes to main
- **Follow-up response:** Both were already done in the prior turn (the s122 docs shipped inside
  PR #539 itself, squash-merged as `6486a32`; branch realigned). Verified main contains the code fixes
  + `PROJECT_STATUS.md` + this log, then appended this follow-up entry and merged it (PR #540).
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` · PR #540.

## Session 123 — 2026-07-16 — Theorie graph-view P2/P3 batch (the rest of the session-122 audit)

**Branch:** `claude/graphs-troubleshooting-plan-2f6p4s` · **Model:** Sonnet 5 · **Attachments:** none

- **Prompt 1 (verbatim):**
  > finish off the remaining tasks in graphs troubleshooting plan
- **Response 1:** No plan file exists under this name; the actual "remaining tasks" pointer is the
  `docs/PROJECT_STATUS.md` s122 handoff's "Remaining P2/P3 batch... is scoped in the session-122
  prompt-log entry" line (Entry — session 122 above), so read that report's P2/P3 list (label-culling +
  card-refit ports to Wörter, wheel scroll-trap, count-vs-filter mismatch, resize refit, fit-button
  quirks, data nits, hygiene) and implemented it. Data nits (`konferenzraum` duplicate + pair-form
  labels) were already fixed by the intervening PR #538, so skipped. Implemented, in
  `src/features/vocabulary/WordGraph.tsx` + `src/features/collocations/CollocationGraph.tsx` (+
  `collocationGraph.ts`, `graphPalette.ts`, `tests/collocationGraph.test.ts`): (1) collision-culled
  label placement ported into the Wörter draw loop; (2) a card-covers-node pan-into-view effect for
  Wörter (Kollokationen already had this via its card-aware `focusNode`); (3) wheel now only zooms with
  ctrl/cmd held on both graphs (was hijacking page scroll on every tick); (4) the legend connection count
  now reflects the active domain/kind filter on both graphs instead of the raw total; (5) a resize
  handler that keeps the visual center anchored on both graphs instead of leaving the view off-center;
  (6) the fit button's random-word/hub-jump now only picks among filter-passing nodes on both graphs.
  P3 hygiene: dropped the dead `register` field from the Kollokationen graph link plumbing (builder,
  component, and the now-pointless test); moved `toggleLayout`'s side effects out of the `setCardLayout`
  functional updater (must stay pure); capped `posRef` position-cache growth at 4000 entries; fixed a
  stale "6-domain" palette comment (5 since the s121 merge); added `role="img"` + `aria-label` to both
  canvases. Left "node seeding" alone (Kollokationen's centroid seeding is deliberate island-forming
  behavior; porting it to Wörter would fight that graph's intentionally different "cloud" layout).
  Left the P1-5 content-curation item (494/2,514 unresolved `related` refs) as an explicitly separate,
  still-open follow-up, not a graph-code bug.
  Verified end-to-end with Playwright against `pnpm dev` (onboarding seeded via localStorage): plain
  wheel scrolls the page instead of zooming (`scrollY` 0→95/0→131), ctrl+wheel still zooms with
  non-overlapping culled labels; a tap near the bottom edge of the Wörter canvas pans the selected node
  clear of the card; the Kollokationen legend count went 786→0 under a Nomen-only filter (correct
  bipartite math) and the Wörter count went 1712→1281 under a Berufsleben-only filter; the fit button's
  hub-jump under a Verben-only filter landed on a verb ("beantragen"); the Kollokationen layout toggle
  still refits correctly after the purity fix; zero console errors. Gates: `typecheck` clean, `lint` at
  the exact pre-change 53-warning baseline, `test:unit` 146/146 (147 minus the deleted dead test),
  `lint:content` clean, `build` + `check:bundle` 79.6 kB. Updated `docs/PROJECT_STATUS.md` (new s123
  handoff, s121's handoff aged into the W29 archive) and this log.
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx` ·
  `src/features/collocations/collocationGraph.ts` · `src/lib/graphPalette.ts` ·
  `tests/collocationGraph.test.ts` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`.

## Session 124 — 2026-07-16 — Kollokationen Karten card text-cutoff + speak-button alignment fix

**Branch:** `claude/card-text-alignment-fixes-cc3k0r` · **Model:** Sonnet 5 · **Attachments:** 1
screenshot (Bibliothek/Theorie Kollokationen Karten grid, titles cut off mid-word with a trailing
ellipsis, e.g. "die Aufgaben vertei...")

- **Prompt 1 (verbatim, with the attached screenshot):**
  > sometimes the words are being cut-off due to spacing issue. Adjust the cards' dimensons or the
  > space within the cards so that no text is cut-off. Also, the speak out loud buttons are not
  > algined properly in some cards. Fix that such that they are perfeclty aligned to the right.
- **Response 1:** Identified the exact view from the screenshot's Nomen-Verb phrases (e.g. "eine
  Frist einhalten", "einen Termin absagen") as the Bibliothek → Theorie → Kollokationen tab's
  "Karten" grid, `CollocationCard` in `src/features/collocations/CollocationsBrowser.tsx`. Root
  cause: the title row was `flex items-center` with the title `<p>` carrying `truncate` and no
  `flex-1`, so a long title filled the row via flex-shrink and got ellipsis-truncated, while a short
  title (e.g. "Zeit sparen") left the `SpeakButton` sitting immediately after the text instead of
  anchored to the card's right edge. The example-sentence row directly below already used the correct
  pattern (`min-w-0 flex-1`, no truncate) and never had this bug. Fix: changed the title row to
  `flex items-start gap-1.5` and the title `<p>` to `min-w-0 flex-1 ... leading-snug` (dropped
  `truncate`/`items-center`), mirroring the example row, so titles wrap instead of truncating and the
  speak icon always sits flush right. Verified `pnpm typecheck` clean, `pnpm lint` clean, `pnpm build`
  + `pnpm check:bundle` green (79.6 kB), then built + served `pnpm preview`, seeded
  `b2beruf.settings.v1` in localStorage to skip onboarding, and took a Playwright screenshot of
  `/library?tab=kollokationen&view=karten` confirming every previously-truncated title (e.g. "etwas
  zur Sprache bringen") now renders in full and every speak button (including on "Zeit sparen") sits
  flush right. Committed and pushed to the branch.
- **Prompt 2 (verbatim):**
  > go ahead and open a pr then merge
- **Response 2:** Opened PR #545 into `main`. Interrupted mid-turn by a follow-up "document the
  session" prompt, so wrote this log entry plus the `docs/PROJECT_STATUS.md` handoff (aging session
  122's handoff out to the W29 archive) before merging, so both land in the same squash-merge.
- **Artifacts:** `src/features/collocations/CollocationsBrowser.tsx` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md` · PR #545.

## Session 125 — 2026-07-16 — Theorie graph word-selection distribution + focus polish

**Branch:** `claude/graph-word-selection-distribution-5av8xk` · **Model:** Opus 4.8 · **Attachments:**
7 phone screenshots across the thread (Kollokationen/Wörter graph selections). A long single-branch
thread iterating on how the Wörter (`WordGraph.tsx`) and Kollokationen (`CollocationGraph.tsx`) graph
views behave when a word is selected. Nine squash-merges to `main` (PRs #542, #543, #544, #546, #547,
#548, #549, #550).

- **Prompt 1 (verbatim):**
  > can you make sure that whenever a word is selected on the graph, all the other selections are also
  > equally distributed in the open space in the graph no matter their initial position. Do it with
  > satisfying animations. And when they are unselected by clicking or tapping in background space, they
  > should go back to their original positions. Also, check that sometimes, in different selecctions, the
  > words are too zoomed out - fix it
- **Response 1:** Built the focus layout in `WordGraph.tsx`: on select, a word's neighbors animate into
  an arrangement and the view frames at a readable zoom (clamped, fixing "too zoomed out"); on deselect
  they animate back to stored home positions. `homePosRef` + `focusRafRef` easeOut tween pinning `fx/fy`;
  prefers-reduced-motion respected. Verified with a Playwright smoke test on the built preview. Shipped
  PR #542 and merged.
- **Prompt 2 (verbatim):** `> merge it to main`
- **Response 2:** Confirmed PR #542 was already squash-merged; showed the merged state.
- **Prompt 3 (verbatim, with a `beantragen` Kollokationen screenshot):**
  > when I click on the fit to screen button, this is what I see. doesn't look like what I asked was done
  > here
- **Response 3:** Identified the screenshot as the **Kollokationen** graph (separate component), which
  didn't have the behavior yet. Ported the focus fan-out + restore + readable framing to
  `CollocationGraph.tsx`. PR #543, merged.
- **Prompt 4 (verbatim, with before/after `die Cloud` Wörter screenshots; plus a mid-turn follow-up):**
  > Here's another example of a word in Worter graph. Attached are the before and after clicking
  > screenshots. I feel like too much of rearranging is happening when clicked which isn't necessary. the
  > position from which each connecting word come need not be altered too much. I just want all of them to
  > be visible on the screen by pulling the connecting words closer when clicked on a word and still seem
  > like the words are part of a bigger nodal graph.
  > the space between the pop up winow and graph wondow borders in kollokations graph should be same as in
  > the worter graph.
- **Response 4:** Replaced the even-ring rebuild with a **direction-preserving pull-in** (keep each
  connection's angle, only contract over-long spokes) in both graphs; also floated the Kollokationen
  selected-node card off the canvas edges by the same `bottom-3/left-3/right-3` gap the Wörter card uses.
  PR #544, merged.
- **Prompt 5 (verbatim; plus a mid-turn follow-up):**
  > make sure to use the 70-80% of the space of the window so that there's not too much background space
  > left out and doesn't invoke the need for suer to zoom in again.
  > when the dimesnipns of the pop up window is toggled, the graph has to adapt in such a way that again
  > all of the selected nodes are all visible.
- **Response 5:** Changed the placement to scale the arrangement to fill ~82% of the free area at the
  target zoom (per-axis) so small selections aren't left in empty space; card-shape toggle re-fits since
  the sizing keys off the free area. PR #546, merged.
- **Prompt 6 (verbatim, with a self-correction):**
  > * the fit to screen button should work the same way in kollokation as in worter.
  > * make sure when the views are switching when pressing the fit to screen button, there's always
  > animations.
- **Response 6:** Made the Kollokationen fit button pick a **random well-connected node** (like Wörter,
  not the fixed biggest hub) and made every fit-button view switch animate (fit-all tweens the camera;
  word-jump animates via the focus effect). `fitToNodes`/`fitToRect` refactored to return the transform.
  Verified different words on repeated presses + a mid-animation frame differing from the settled frame.
  PR #547, merged.
- **Prompt 7 (verbatim):**
  > be sure that the distribution of the nodes are such that the words are clearly legible, if not move
  > them around a little until they're readable.
- **Response 7:** Root cause: the layout only separated the node dots, not the wider text labels, so
  overlapping labels got culled by the draw pass. Added label-box-aware spacing (`relaxLabels` AABB pass
  with the selected word immovable), expanded `frameFocus` bounds by label extents, and disabled label
  culling while focused so no connection word can vanish. Verified 1-, 2-, 8-, 13-connection selections.
  PR #548, merged.
- **Prompt 8 (verbatim, with 4 dark-mode phone screenshots):**
  > some of the words are still not appearing. also, for the smaller connections with 2-3 words, they are
  > not enough spread out to occupy the space around and instead looking cramped to the center
- **Response 8:** Reworked placement to put each connection on an **ellipse sized to fill the space**
  (direction preserved, radial factor floored at 0.72) so even a single connection spreads out. Verified
  the missing labels were already fixed in code (`der Termin`'s 9 all render) — the screenshots were a
  cached PWA build. PR #549, merged. Flagged the service-worker caching caveat to the founder.
- **Prompt 9 (verbatim, with a `beantragen` screenshot):**
  > in this case for example, why isn't the space to the left snd right not being used properly? it's
  > still cramped
- **Response 9:** Cause: preserving original angles kept a hub whose connections all pointed one way
  bunched in a central column. Added `spreadAngles()` (blend each angle toward an even slot, preserving
  circular order) so clustered connections fan across the whole ellipse and use the left/right space.
  Verified numerically (16 angles in ~80° → ~260° arc) and visually (`stellen` × 5 reaches all
  directions). PR #550, merged.
- **Prompt 10 (verbatim):** `> document the session`
- **Response 10:** Wrote this log entry, added the session-125 handoff to `docs/PROJECT_STATUS.md`
  (aging session 123's handoff out to the W29 archive), and refreshed the Wörter/Kollokationen graph
  descriptions in `CLAUDE.md` with the selection/focus model.
- **Artifacts:** `src/features/vocabulary/WordGraph.tsx` · `src/features/collocations/CollocationGraph.tsx`
  · `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md` · `../CLAUDE.md` · PRs #542, #543, #544, #546, #547, #548, #549, #550.
- **Maintenance note:** this live prompt-log file has passed the ~1,200-line rotation budget; a future
  session should rotate the oldest entries into `docs/archive/prompt-log/` per the rotation policy.

## Session 125 (cont.) — 2026-07-16 — Documentation + prompt-log rotation

**Branch:** `claude/graph-word-selection-distribution-5av8xk` · **Model:** Opus 4.8 · **Attachments:**
none. Same conversation as session 125; a follow-up maintenance instruction (append-only, so recorded
as a continuation entry rather than editing the session-125 entry above).

- **Prompt (verbatim):**
  > document the session. fix the prompt log rotation.
- **Response:** Session 125 was already documented in the prior turn (status handoff + prompt-log entry
  + `CLAUDE.md` graph-model update). This turn performed the overdue **prompt-log rotation** flagged in
  the session-125 maintenance note: the live `docs/SESSION_PROMPT_LOG.md` had passed the ~1,200-line
  budget (1,317 lines). Moved **entries 365–391 (sessions 104–119, all dated 2026-07-13/14 → ISO week
  W29)** out of the live file into a new week archive
  `docs/archive/prompt-log/SESSION_PROMPT_LOG_2026-W29.md` (created with the standard weekly header),
  keeping the current session plus the last five (**sessions 120–125**) in the live file per the
  rotation policy. Updated the live file's "Archived entries" note (now "entries 1–391 / session 120
  onward") and added the W29 row to `docs/archive/prompt-log/README.md` (plus a note that session 120+
  uses `## Session N` headers vs the older `## Entry N`-per-prompt style). Verified continuity (archive
  ends at entry 391 / session 119, live starts at session 120) and no lost content; live file down to
  368 lines.
- **Artifacts:** `docs/SESSION_PROMPT_LOG.md` · `docs/archive/prompt-log/SESSION_PROMPT_LOG_2026-W29.md`
  (new) · `docs/archive/prompt-log/README.md`.

## Session 126 — 2026-07-17 — Daily-life content scale-up (Phase A)

**Branch:** `claude/scale-words-domains-qjv9x4` · **Model:** Opus 4.8 · **Attachments:** none.

- **Prompt 1 (verbatim):**
  > currently the app has mainly berufsleben words. Can you scope a task to scale up words from other domains?
- **Prompt 2 (verbatim, answering a direction question):**
  > i chose both phase a and b
- **Prompt 3 (verbatim):**
  > go ahead with the plan
- **Prompt 4 (verbatim):**
  > yes go ahead with phase b
- **Response:** Analysed the content distribution (workplace = ~78% of the then-1,246-word bank; the five
  daily-life themes were ~half the depth of workplace themes, and the `alltag` domain covered only
  bureaucracy). Scoped a two-phase plan `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md` and executed the whole
  thing. **Phase A** (PR #553) deepened the five original daily-life themes in four theme commits: bank
  (43→81 vocab, +12 colloc), bildung (46→80, +11), behoerde (49→80, +8), wohnen (57→80, +5) and a 6-word
  arzt top-up to 80 (+132 vocab / +36 collocations total). **Phase B** added five NEW everyday-life
  `alltag` themes, one PR each: `einkaufen` (#554), `essen` (#555), `mobilitaet` (#556), `freizeit`
  (#557), `digitales` (#558) — each a full `behoerde`-shape pack (49 vocab / 40 collocations / 2 dialogues
  / 2 texts / 3 Can-Do / 1 writing prompt / ~97 provenance rows, plus `ThemeId` + `THEME_IDS` + a new
  lucide icon + `themes.ts` record + `writingPrompts` entry). New alltag themes fold into the Wohnhaus city
  building via an added `alltag` domain rollup (`domain-buildings.tsx`), with `tests/city-mastery.test.ts`
  updated for the full-coverage invariant. **New bank totals: 1,623 vocabulary / 1,011 collocations /
  3,105 provenance rows / 20 themes.** Every theme/PR passed lint:content, verify:facts (0
  two-oracle-confirmed errors), build, test:unit 146/146, check:bundle 79.6 kB, eslint 0 errors, and was
  squash-merged to `main` with the branch realigned after each.
- **Artifacts:** `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md` (new) · `src/data/{vocabulary,collocations,
  provenance,themes,canDo,writingPrompts,dialogues,texts,frequency}.ts` · `src/types/index.ts` ·
  `scripts/lint-content.mjs` · `src/lib/icons.ts` · `src/components/city/domain-buildings.tsx` ·
  `tests/city-mastery.test.ts` · `docs/reports/verify-facts-report.md` (generated) · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`. PRs #553–#558 (all squash-merged to `main`).

## Session 127 — 2026-07-17 — Brand kit catalogue Vol. IV

**Branch:** `claude/epic-ramanujan-p049i8` · **Attachments:** none.

- **Prompt 1 (verbatim):**
  > previously I asked opus to generate a few mock ups for logo and brand kit, but I didn't like any of them. Can you as Fable give it a go and provide me with 5-10 brand kits ideas? Remember my preferences from previous sessions for this task.
- **Prompt 2 (verbatim, mid-work):**
  > are you done? you seem to be working for a while now
- **Prompt 3 (verbatim, after an accidental tool rejection):**
  > I didn;t decline
- **Response:** Researched the recorded branding history first: session 113's 20-direction catalogue
  (Vol. I–III, none chosen) and session 116's rejected Cobalt & Butter previews with the founder's
  verbatim constraints ("don't use gradient so much - not in logo. not on buttons!", "use variety of
  colors ... fun looking variations with colorful accents", plus "I put a lot of time into designing
  various pages, menus and icons"). Authored `preview/branding/genauly-identity-vol4.html`: **eight new
  kits** (Textmarker, Haken dran, Sticker-Klub, Linie B2, Zwei Stimmen, Bauhaus Pause, Neonschild,
  Der Dachs), each a live SVG mark + wordmark + 64/40/20 px app icon + hex palette + free Google-Fonts
  type pairing + flat UI probe + a "Passt zum Bestand" mapping note. Deliberately no retreads of the 20
  rejected directions; every kit flat, multi-accent, and compatible with the existing app design.
  Verified visually via headless-Chromium screenshots. Delivered as a file + a private Claude artifact
  (`b4bd024b`); updated `preview/branding/README.md` with a Vol. IV index. Docs + preview only, no
  `src/` change, no gates run.
- **Artifacts:** `preview/branding/genauly-identity-vol4.html` (new) · `preview/branding/README.md` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 4 (verbatim):**
  > can you generate a preview of some screenshots of the app using kit 1 and 6? Can you create more mockups with similar philosophy of kit 6, and also previews of those with app's screenshots?
- **Response:** Reused the s116-proven method (real app headless via Playwright + `pnpm dev`, seeded
  onboarding, `:root` token-override style tag, flattened gradients, header logo swapped to a data-URI
  mark; NO hand-drawn mockups, layouts untouched). Shot Praktisch/Theorie/Fortschritt at 390x844 light
  for Kit 1, Kit 6, and four NEW Bauhaus-family kits designed for this round: **6A Bauklötze** (Fröbel
  blocks), **6B Ulm** (HfG-Ulm systematic), **6C Plakat** (Sachplakat red), **6D Neubau** (contemporary
  violet/rosé/grass), plus an unmodified "Aktuell" reference. Composited seven labeled strips to
  `preview/branding/vol5-screens/` and authored `preview/branding/genauly-identity-vol5.html` (full kit
  specs + embedded strips + per-kit "Gegenüber Kit 6" notes). Sent all strips to the founder; updated
  the branding README with the Vol. V index + the reusable preview method.
- **Artifacts (prompt 4):** `preview/branding/genauly-identity-vol5.html` (new) ·
  `preview/branding/vol5-screens/*.png` (7 strips, new) · `preview/branding/README.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 5 (verbatim):**
  > can you publish the html as an artifact so that I can view it here?
- **Prompt 6 (verbatim):**
  > why does 6a, 6b, and 6c logos looking like random pieces of grometric blocks without any alphabet G?
- **Response:** (5) Published Vol. V as a Claude artifact (`c34244cd`); artifacts are self-contained, so
  the strips were inlined as 1400px JPEG data URIs (canvas re-encode, ~1.5 MB page). (6) Valid critique:
  the 6A/6B/6D marks were G-less abstract compositions and 6C's G was a typed font glyph. Redesigned all
  four as geometric G letterforms (iterated via test renders at 150px + 32px): 6A = one continuous blue
  toy-track G with a gable + block resting on it, 6B = modular right-angled G with the signal-orange
  crossbar, 6C = heavy poster "G." drawn as paths (no font), 6D = open violet ring-G with a rosé wedge
  crossbar + acid dot. Updated the vol5 symbols + copy, the header-logo data URIs, re-shot the 12 app
  screenshots, rebuilt the strips, republished the artifact at the same URL.
- **Artifacts (prompts 5-6):** `preview/branding/genauly-identity-vol5.html` ·
  `preview/branding/vol5-screens/kit6[a-d]-*.png` (re-rendered) · artifact `c34244cd` ·
  `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 7 (verbatim):**
  > let's lean more into kit 1 and 6. Provide more variations by being creative and playing around with the things like colors but keeping the core idea intact.
- **Prompt 8 (verbatim, sharpening the brief):**
  > The idea is to hve a visually stunning and beautiful looking app that should build trust and should feel highly premium
- **Response (model switched to Opus 4.8 for this round):** Built **Vol. VI**, eight premium color
  variations of the two favorites with the core marks intact, all previewed on the real app. Kit 1
  family: Kobalt & Butter (refined), Tinte & Messing (ink + brass), Aubergine & Aprikose, Marine &
  Koralle. Kit 6 family: Bauhaus (refined), Graphit & Messing (Braun/Vitra), Bordeaux & Marine, and
  **Mitternacht** (a dark-mode variant driving the app's real `.dark` class, sapphire + gold on
  midnight). Refactored the preview harness to define each kit once as hex-per-token-role with a
  hex→HSL helper (`vol6-kits.mjs`) and to toggle dark mode headlessly. Authored
  `preview/branding/genauly-identity-vol6.html` (Fraunces/Inter premium spec sheet, grouped by family,
  palette swatches + embedded strips), composited nine strips to `preview/branding/vol6-screens/`, sent
  the eight kit strips, and published a self-contained artifact (`dfcad5f6`). Updated the branding
  README. No `src/` change.
- **Artifacts (prompts 7-8):** `preview/branding/genauly-identity-vol6.html` (new) ·
  `preview/branding/vol6-screens/*.png` (9 strips, new) · `preview/branding/README.md` · artifact
  `dfcad5f6` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 9 (verbatim):**
  > For the 1 - Kobalt & Butter, can you replace Kobalt with the dark blue color in the bottom navigation icons? Also, add another color to the palette - the light blue in the bottom navigation panel and replace the butter yellow in the logo with this light blue. Now provide a preview
- **Response:** Pulled the exact nav colors from source (`route-icons.tsx` / `nav-items.ts`): dark blue
  `#2563EB` (Praktisch/Theorie base), and two candidate light blues (sky `#38BDF8` = gear-center dot;
  cyan `#22D3EE` = compass needle + chart). Built **Vol. VII**: Kit 1 with `#2563EB` as primary, the
  light blue added to the palette AND used as the logo highlighter swipe (replacing butter) AND mapped
  to `--accent` so app chips/badges show it. Rendered two readings on the real app (Himmelblau
  recommended, Cyan alternate) + the original for reference. Authored
  `preview/branding/genauly-identity-vol7.html`, 3 strips in `preview/branding/vol7-screens/`, sent the
  two option strips, published artifact `a4b80dcf`. Asked the founder to confirm which light blue. No
  `src/` change.
- **Artifacts (prompt 9):** `preview/branding/genauly-identity-vol7.html` (new) ·
  `preview/branding/vol7-screens/*.png` (3 strips, new) · `preview/branding/README.md` · artifact
  `a4b80dcf` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 10 (verbatim):**
  > I like your recommendation but I want both the suggested blues to be a little lighter.. loke 10-15%. Also add an additional color coral to the palette and generate a preview with this setup
- **Prompt 11 (verbatim, same turn):**
  > also, for the logo, the highlight seems to be slightly short and doesn't filly cover the closed circle part of the g. maybe extend the blue highlight by 1-2 pixels on the bottom and tht should fix it.
- **Response:** Built **Vol. VIII**, a single refined Kit 1: both blues lightened ~10–15% (Nachtblau
  `#2563EB→#3D74ED`, Himmelblau `#38BDF8→#52C6F9`), coral `#F0603F` added to the palette and mapped to
  the `--reward` token so it shows in-app (streak/reward), and the logo swipe path extended at the bottom
  (`L 54 40 L 13 44 Q 9 40 10 32` → `L 54 45 L 13 49 Q 9 45 10 34`) so it fully covers the g's closed
  bowl (tested at 200px + 44px, before/after in the sheet). Authored
  `preview/branding/genauly-identity-vol8.html` (logo before/after + palette + coral component demo +
  real-app strip), strip in `preview/branding/vol8-screens/`, sent it, published artifact `0b98120a`.
  Flagged this as the likely spec to wire for real next.
- **Artifacts (prompts 10-11):** `preview/branding/genauly-identity-vol8.html` (new) ·
  `preview/branding/vol8-screens/k1-final.png` (new) · `preview/branding/README.md` · artifact
  `0b98120a` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`.
- **Prompt 12 (verbatim):**
  > provide the artifact again here in the chat
- **Response:** Republished the Vol. VIII artifact at the same URL (`0b98120a`) to re-surface it.
- **Prompt 13 (verbatim):**
  > finalize this version but don't implement the changes yet. Document the session along with saving all the artifacts to the repo.
- **Response:** Finalized Vol. VIII as the chosen brand **without any `src/` change**. Wrote the
  implementation-ready spec `docs/branding/BRAND_SPEC.md` (exact token→HSL map for all 14 tokens,
  dark-mode starting point, the logo swipe path + "outline the g" production note, and a step-by-step
  implementation checklist), saved the canonical logo reference `preview/branding/genauly-logo-final.svg`,
  and saved every published artifact self-contained under `preview/branding/artifacts/`
  (`genauly-vol[5-8]-artifact.html`; Vol. IV already self-contained). Updated the branding README (a
  FINALIZED banner), the `PROJECT_STATUS.md` `_Last updated_` block + the aged-out session-127 reference,
  the W29 archive branding handoff (finalization + Next-on-go), and this log. Shipped the docs to `main`.
- **Artifacts (prompts 12-13):** `docs/branding/BRAND_SPEC.md` (new) ·
  `preview/branding/genauly-logo-final.svg` (new) · `preview/branding/artifacts/genauly-vol[5-8]-artifact.html`
  (new) · `preview/branding/README.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · `docs/SESSION_PROMPT_LOG.md` · `CLAUDE.md`.

## Session 128 — 2026-07-18 — Gender-visuals research panel + Artikel-Visuals implementation plan

**Branch:** `claude/visual-gender-indicators-gsox24` · **Model:** Opus 4.8 (switched to Fable 5 for
the final planning turns) · **Attachments:** none. Docs/preview-only session; nothing shipped to the
app. Two design-preview pages were published as private claude.ai artifacts during the session and
are committed to the repo under `preview/artikel-visuals/`. (Numbering note: this session started
before the parallel sessions 126/127 merged; its docs were rebased onto their `main` and renumbered
from 126 to 128.)

- **Prompt 1 (verbatim):**
  > how best can we add visuals to words to show the gender of a word and some more context so that the user can also learn visually. generate a few ideas
- **Response 1:** Surveyed the current rendering (article is plain text on flashcards, part of the
  bold string in the Bibliothek views, zero gender encoding anywhere) and proposed 7 ideas:
  ArticleBadge color chips, shape triple-encoding, plural-morphology highlighting, graph gender
  rings, suffix-rule hints ("-ung ist immer die"), a gender-sort Neuland scene, and sub-theme icon
  watermarks, with a recommended ship order.
- **Prompt 2 (verbatim):**
  > can you show previews of all these ideas in a html?
- **Response 2:** Built a preview page of all 7 ideas mocked in the app's real design tokens (light +
  dark) with real bank words; the artifact publish was initially rejected in the tool UI.
- **Prompt 3 (verbatim):** `> are you done?`
- **Response 3:** Confirmed done; sent the HTML file directly instead.
- **Prompt 4 (verbatim):** `> i didn't decline it. I approved ot`
- **Response 4:** Re-published the page as an artifact (UI hiccup on the first attempt).
- **Prompt 5 (verbatim):**
  > I like some of the above ideas but before fina,ising them, I want to explore if it is possible to add minimalistic icons/doodles which should be easy to create but would leave an impact on the learners like male sticky figure with a huge moustache to represent masculine words? It's just an idea. Brainstorm with a panel of experts on what kind of illustrations are the best and would leave a lasting impact on users based on actual evidence, and based on their report generate preview of some of those ideas as a html artifact.
- **Response 5:** Ran a three-expert research panel as parallel agents (SLA literature, memory
  science, competitor/illustration practice; key sources: Santos 2015, Arzt & Kost 2016, Desrochers
  1989/1991, Bertsch 2007, Sundararajan & Adesope 2020, McDaniel & Einstein, Watkins, Boroditsky).
  Synthesized the verdict (imagery for gender: yes; repeated bizarre human personas: no, false rule
  on Mädchen/Person/Gast + contrast collapse) and built a second artifact: findings, evidence
  scoreboard, the moustache tested honestly, and previews A–E (Artikel-Marken, Artikel-Wesen
  mascots, fused doodles, answer-reveal effects, Eselsbrücke + Artikel-Sprint).
- **Prompt 6 (verbatim):**
  > I didn't understand how does the 8th point work in the report, can you clarify it?
- **Response 6:** Explained Preview E's two halves: the "Meine Eselsbrücke" self-made association
  slot (generation effect) and the Artikel-Sprint retrieval drill, and why they are grouped.
- **Prompt 7 (verbatim):**
  > what do you mean by this?: Optional and off to the side. Most learners skip it; the keen ones who use it get the biggest durable gain in the whole system.
- **Response 7:** Clarified the reach-vs-effect-per-use distinction: optional by design, low
  adoption expected, outsized benefit for motivated learners; don't force it or measure by usage %.
- **Prompt 8 (verbatim):**
  > the self-made memory hook is a great exercise for quiz. Add it along with all the research findings in the already available variety of exercies for quiz in the docs.
- **Response 8:** Recorded the full panel findings + the two proposed quiz exercises (Eselsbrücke,
  Artikel-Sprint) under backlog #4 in `docs/PROJECT_REFERENCE.md` with a cross-reference in
  "Research findings to reuse"; committed and pushed.
- **Prompt 9 (verbatim):**
  > I like preivew B, C and D from the above html report. How best can we implement it to the theorie cards?
- **Response 9:** Mapped the three picks onto the actual Theorie card code (`VocabCard` FlipCard in
  `VocabList.tsx`): Wesen as the gender mark on the card front, the gender effect on card flip
  (the browse-side answer-reveal moment), fused doodles on the card back for registered words only;
  proposed 3 phased PRs and two defaults (mark beside the full article text; effect on every flip).
- **Prompt 10 (verbatim, interrupted mid-response and completed by Prompt 11):**
  > write a robust implementation plan to implement these features along with model recommendations and save it to the repo. Also document the session - Then I'll implement the plan in a new session.
- **Prompt 11 (verbatim):**
  > When selecting the first 20 words for fused doodles, take the words which are of high frequency and also highly useful for kapital 1 in the game.
- **Response 10/11:** Authored **`docs/plans/ARTIKEL_VISUALS_PLAN.md`** (3 phased PRs, per-phase
  model recommendations, acceptance criteria, guardrails, risks) with the founder's batch-1
  selection rule encoded: the 10 nouns Kapitel-1 missions directly reference (verified against
  `src/data/missions.ts`: 6 die / 4 der / 0 das) + 10 top-Zipf nouns from the Kapitel-1 mission
  themes with a das-balance override (>= 4 das-words), selection snippet included. Committed both
  preview pages to `preview/artikel-visuals/`, added the SCOPED pointer to backlog #4. First PR
  attempt (#564) conflicted: `main` had moved (parallel sessions 126/127, PRs #551–#563), so the
  branch was rebuilt on the new `main`, the session renumbered 126 → 128, and the docs re-applied:
  session-128 handoff in `docs/PROJECT_STATUS.md` (aging the s126 daily-life handoff into the W29
  archive, repairing the missing s124 archive entry, refreshing the stale content-bank counts to the
  post-scale-up totals), and this log entry appended after the parallel sessions' entries.
- **Artifacts:** `docs/plans/ARTIKEL_VISUALS_PLAN.md` (new) ·
  `preview/artikel-visuals/gender-visuals-preview.html` + `gender-doodles-panel.html` (new) ·
  `docs/PROJECT_REFERENCE.md` (backlog #4 research + SCOPED note, cross-reference section) ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  `docs/SESSION_PROMPT_LOG.md` · PR #564.

---

## Session 129 — 2026-07-18 — Artikel-Visuals PR 1: Wesen marks + flip effects (Opus wiring + Fable art)

- **Branch:** `claude/article-visuals-opus-tasks-rxurot`
- **Prompt 1 (verbatim):**
  > I want to implement article visuals plan's opus tasks. Which effort should I set it to? read the plan and let me knpw
- **Response 1:** Read `docs/plans/ARTIKEL_VISUALS_PLAN.md` §6: the only Opus 4.8 task is the PR 1
  tokens + card wiring at **medium** effort; the Wesen/effect art is assigned Fable 5 high and the
  registry/reuse work Sonnet 5. Flagged the split and asked whether to keep the art on Fable.
- **Prompt 2 (verbatim):**
  > for now, start working on opus tasks, let me know once done, I'll switch to fable and then it can proceed.
- **Response 2 (Opus 4.8):** Implemented the PR 1 wiring half: `--der/--die/--das` (+`-bg`) tokens in
  `src/index.css` light + dark, exposed in `tailwind.config.ts`; new `src/components/artikel/`
  (`gender.ts` pure `genderOf`, `Wesen.tsx`, `ArtikelEffect.tsx`, `ArtikelLegend.tsx`, the latter
  three with deliberately placeholder art behind locked prop/class interfaces); `FlipCard` `onFlip`
  callback; marks wired into `VocabList` (card front + back-face effect), `VocabViews`
  Tabelle/Liste (16px tier), the one-time legend on the Wörter tab
  (`artikelLegendDismissed` in `useSettingsStore`); `tests/gender.test.ts`. All gates green;
  committed and pushed with a boxed handoff comment marking exactly what the art pass replaces.
- **Prompt 3 (verbatim, after switching the session model to Fable 5):**
  > I implemented part of the articles visuals plan by opus. Review it and make any necessary corrections/improvements and then continue with all fable related tasks in pr1
- **Response 3 (Fable 5):** Review found the wiring sound plus one real timing bug: the effect
  fired at flip START but the back face is only visible ~225ms into the 450ms rotation, so half the
  animation played hidden (fixed with a 200ms animation delay + base opacity 0). Then authored the
  real art from the founder-picked Preview B/D in
  `preview/artikel-visuals/gender-doodles-panel.html`: the three Wesen redrawn at the 24-unit
  viewBox (tinted bodies, dot eyes, one imperfection each: der sprout / die unclosed outline +
  eyelash / das stray hairs; solid small tier under 24px) and the per-element reveal effects
  (der 8-ray burst, die 3 staggered bloom rings, das 6 spinning shards; reduced motion = fading
  tint, opacity only). Verified visually with headless-Chromium screenshots (creatures at
  56/28/24/16px light + dark; effects freeze-framed at 120/300/450ms via paused negative
  animation-delay). Gates green (typecheck, lint 0 errors, test:unit 149, build, bundle 79.6 kB);
  shipped PR 1 into `main` per the auto-ship rule and updated the docs (this entry,
  `PROJECT_STATUS.md` s129 handoff, plan status header).
- **Prompt 4 (verbatim):**
  > okay, proceed with phase 2
- **Response 4 (Fable 5):** Shipped plan Phase 2 (PR 2). Ran the plan §4 selection snippet verbatim
  against the real banks (10 fixed mission nouns + das-override picks programm/hotel/verfahren/
  geraet + top-Zipf it_sicherheit/daten/verbindung/version/funktion/anschluss; tally 5 der / 11 die
  / 4 das, recorded in the plan). Built `src/features/vocabulary/doodles/` (eager `index.ts`
  registry + lazy `art.tsx` with all 20 fused scenes; referents in the new `--ink` token, creature
  via the newly exported `WesenBody`), wired `VocabCard` to load the art chunk on a registered
  card's first flip and show the doodle above the English, and added `tests/doodles.test.ts`
  (registry/bank/gender integrity + a rendered-markup check that each scene uses only its own
  gender tokens). Reviewed all 20 scenes via SSR screenshot sheets in light + dark and fixed three
  compositions (Vollmacht hand, Hotel overlap, Beratung bubble tail). Gates green (test:unit 174,
  bundle 79.6 kB unchanged, art chunk ~11.8 kB lazy); squash-merged into `main` per the auto-ship
  rule with the doc updates.
- **Artifacts:** `src/components/artikel/` (new: `gender.ts` · `Wesen.tsx` · `ArtikelEffect.tsx` ·
  `ArtikelLegend.tsx`) · `src/features/vocabulary/doodles/` (new: `index.ts` · `art.tsx`) ·
  `src/index.css` · `tailwind.config.ts` · `src/features/shared/FlipCard.tsx` ·
  `src/features/vocabulary/VocabList.tsx` + `VocabViews.tsx` + `VocabularyTrainer.tsx` ·
  `src/store/useSettingsStore.ts` · `tests/gender.test.ts` · `tests/doodles.test.ts` ·
  `docs/plans/ARTIKEL_VISUALS_PLAN.md` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · `docs/SESSION_PROMPT_LOG.md` ·
  PR #566 (Phase 1) · PR #567 (Phase 2)
- **Prompt 5 (verbatim, after switching the session model back to Opus 4.8):**
  > alright, finish the plan
- **Response 5 (Opus 4.8):** Shipped plan Phase 3 (PR 3), the reuse pass. In `SessionPlayer` the
  gender reveal effect now fires on a CORRECT noun answer in the flashcard/typing/speaking grade
  paths (`fireGenderEffect` looks the article up via `vocabById(sourceId)`, no-ops for non-nouns +
  Redemittel/collocation cards, never blocks Weiter); the effect overlays the stage with the block
  content pinned `z-10` above it (a screenshot review showed a bloom ring crossing the card text, so
  the content sits above and the burst radiates from behind the opaque card). Added the Wesen mark to
  the Wörter-graph selected-node card (`WordGraph.tsx`) and the legacy `Flashcards.tsx` front. Gates
  green (test:unit 174, bundle 79.6 kB); squash-merged into `main` per the auto-ship rule with the
  doc updates (plan status -> all 3 phases shipped, status handoff, CLAUDE.md).
- **Artifacts (PR 3):** `src/features/session/SessionPlayer.tsx` · `src/features/vocabulary/WordGraph.tsx` ·
  `src/features/vocabulary/Flashcards.tsx` · `docs/plans/ARTIKEL_VISUALS_PLAN.md` ·
  `docs/PROJECT_STATUS.md` · `CLAUDE.md` · `docs/SESSION_PROMPT_LOG.md` · PR #568
- **Prompt 6 (verbatim):**
  > is everything merged to main? if not do it, and also document the session
- **Response 6 (Opus 4.8):** Verified all three Artikel-Visuals PRs (#566/#567/#568) are squash-merged
  into `main` (HEAD == origin/main, every new file present); nothing was left unmerged, so no extra
  merge was needed. Appended this prompt to close out the session's paper trail and pushed the
  docs-only update to `main`.
- **Artifacts (Prompt 6):** `docs/SESSION_PROMPT_LOG.md` (+ this entry)
## Session 130 — 2026-07-18 — Data-architecture review + P0/P1 integrity fixes

- **Branch:** `claude/app-data-management-guide-tcmz3j` · **Model:** Fable 5
- **Prompt 1 (verbatim):**
  > I had been trying to understand how the data/content of the app is managed but I still am not fully sure how it works. If I don't understand how can I present it to a crowd or audience? I want you to explain it me clearly, and I want to access the data in the repository direclty - so tell me which files to look at and where they are located at. I'm a non tech founder so be as clear as possible but don't dumb it down too much - I understand a few things about tech as I worked as a consultant and analyst, but not as much as a softweare engineer.
- **Response 1:** Explained the content-as-code architecture end to end: the `src/data/` banks (with
  live line/size numbers and a real `vocabulary.ts` entry), the domain→theme→sub-theme hierarchy,
  the five-layer quality pipeline (structural linter, two-oracle fact check, grammar/CEFR checks,
  trust tiers, human review loop), the ship path, how to browse the files on GitHub, and a
  three-sentence version for presenting to an audience.
- **Prompt 2 (verbatim):** `> Yes, create the visual diagram of the content pipeline`
- **Response 2:** Published a private Claude artifact "Genauly Content Pipeline": a one-page
  five-stage diagram (content banks → structural gate → linguistic verification → trust tiers →
  ship) in brand indigo with a stats strip, light + dark themed.
- **Prompt 3 (verbatim):**
  > what's your expert opinion on the data architecture? should there be any improvements/corrections? are there any loop-holes or missed opportunities to improve it? Do a detailed analysis and provide p0-p3 recommendations
- **Response 3:** Inspected the linter, types, sync layer, and generated-file wiring, then delivered
  a prioritized review. P0: verified items are not fingerprinted, so a post-review edit silently
  keeps "verified" status. P1: id renames orphan learner FSRS history; global id uniqueness across
  banks unenforced (prefixes only warnings); unresolvable `related` terms rot invisibly. P2:
  authoring-workflow scaling (TS2590 splits), the ~2 MB `/sources` chunk, hand-rolled linter vs
  schema library, game-state sync. P3: oracle-coverage warning for new nouns, learner-performance
  feedback loop, unused review-status rungs.
- **Prompt 4 (verbatim):** `> go ahead with the fixes/improvements`
- **Response 4:** Implemented P0 + P1: (1) `pnpm stamp:verified` + `scripts/content-hash.mjs` +
  the `docs/reports/verified-hashes.json` sidecar (25 Can-Do rows stamped) with a lint gate that
  fails on post-verification edits (tamper-tested); (2) `src/lib/idRenames.ts` (`ID_RENAMES` +
  remap helpers) applied in the progress store's persist v1 migrate and on cloudSync remote rows,
  pinned by `tests/idRenames.test.ts`; (3) global id uniqueness + per-bank prefixes as lint errors;
  (4) the related-terms drop audit (`docs/reports/related-terms-report.md`, 495/3,268 unresolved).
  Gates: lint:content 0 errors, test:unit 184/184 after rebasing onto the parallel s129 Artikel-Visuals PRs, build green, bundle 80.7 kB. Docs updated
  (CLAUDE.md commands + conventions, PROJECT_STATUS.md s130 handoff, collocation count 1,011→1,033).
- **Artifacts:** `scripts/content-hash.mjs`, `scripts/stamp-verified-hashes.mjs`,
  `src/lib/idRenames.ts`, `tests/idRenames.test.ts`, `docs/reports/verified-hashes.json`,
  `docs/reports/related-terms-report.md` (all new) · `scripts/lint-content.mjs`,
  `src/store/useProgressStore.ts`, `src/lib/cloudSync.ts`, `package.json`, `CLAUDE.md`,
  `docs/PROJECT_STATUS.md`, `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` (edited) ·
  private artifact "Genauly Content Pipeline".
- **Prompt 5 (verbatim):**
  > I need you to redesign the sources page so that it's easily understandable for anyone looking to understand the data architechture and the sources used. Keep it visual where needed. Also for the admin inputs, make it as user firendly as possible to work with the data/content table - add all necessary views, export as csv button, and other functionalities that are useful and necessary but I may have forgotten. Needless to say, these additional features should only be available for admin/founder - thesuhaspala@gmail.com and thelivinsine@gmail.com.
- **Response 5:** Redesigned `/sources` ("Quellen & Datenqualität"): public visitors get the visual
  data-architecture story (stat tiles, five-step pipeline graphic, stacked tier-distribution bar
  with legend, per-bank count tiles; sources/licenses/browse kept). Built the founder-only
  `AdminWorkbench` (`features/legal/AdminWorkbench.tsx`): full register as a sortable DataTable
  with fuzzy search, Typ/Stufe/Status filters, CSV export of the filtered view (`src/lib/csv.ts`),
  copy-id chips, per-row verified checkbox + note (immediate Supabase save), progress bar. Admin
  gate widened to BOTH founder emails (`FOUNDER_EMAILS` in `src/lib/admin.ts`) with matching RLS
  migration `0007_provenance_reviews_admins.sql` (founder must run it once; step added to
  `PHASE2_SETUP.md` + an open action item). Verified with headless-Chromium screenshots (public
  light/dark/mobile + workbench desktop incl. live search). 14 new tests; 198/198, build green,
  bundle 80.8 kB.
- **Artifacts (prompt 5):** `src/features/legal/Sources.tsx` (redesigned) ·
  `src/features/legal/AdminWorkbench.tsx`, `src/lib/csv.ts`,
  `supabase/migrations/0007_provenance_reviews_admins.sql`, `tests/csv.test.ts`,
  `tests/admin.test.ts`, `tests/adminWorkbench.test.tsx` (new) · `src/lib/admin.ts`,
  `docs/plans/PHASE2_SETUP.md`, `docs/PROJECT_STATUS.md` (edited).

## Session 131 — 2026-07-18 — Üben exercise-variety options + plan

- **Branch:** `claude/ueben-exercise-variety-i59ry0` · **Model:** Fable 5
- **Prompt 1 (verbatim):**
  > I'd like to make the ueben not just a bunch of anki cards where the learner just keeps flipping them but also add a variety of exercises for each custom ueben set. But I also understand it would be an immense amount of data to create custom ueben exercieses for each set combination. So, I'd like you to provide which options do we have to make this happen?
- **Response 1:** Analysis of the current engine showed the "immense data" problem mostly does not
  exist: `engine/quiz.ts` already auto-generates 10 exercise types from the existing banks (zero
  authoring) and `SessionPlayer` renders all of them, but the generator is theme-keyed while
  `buildScopedSession` (the Bibliothek Üben path) maps vocab/collocations/Redemittel to flashcards
  only. Laid out five options: (A) wire the existing generator into custom sets via an item-pool
  refactor, recommended; (B) more template exercise kinds from existing fields (article sorting,
  noun-verb match grid, typed cloze, TTS listening, odd-one-out), zero authoring; (C) bounded
  authored micro-exercises keyed per theme, never per set; (D) build-time AI-generated items pushed
  through the existing verification pipeline; (E) runtime LLM generation, advised against (cost,
  latency, unverifiable German, breaks offline). Core principle: sets are filters, exercises are
  per-item templates, so authoring scales with exercise kinds, not set combinations.
- **Prompt 2 (verbatim):**
  > alright, create a robust plan for this
- **Response 2:** Authored `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md`: Phase 0 (pool-based
  `buildPoolQuiz` refactor, distractor fallback for small sets, generic mini-banks kept out of
  scoped sessions per the content-pure rule), Phase 1 (a ~50/50 card/exercise mix in
  `buildScopedSession`, 2-appearances cap, difficulty plumbing, and an FSRS guard because quiz
  `sourceId`s currently write SRS under collocation ids), Phase 2 (five independent new template
  kinds: match grid, typed cloze, listening word, Redemittel cloze, odd-one-out), Phase 3
  (variety guarantees + gates), Phase 4 deferred (authored per-theme packs, build-time AI bank;
  runtime generation rejected), plus the eligibility matrix, risk register, PR slicing, and
  success criteria. Docs-only session: plan + status handoff + this log; no engine code touched.
- **Artifacts:** `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` (new) · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 3 (verbatim):**
  > did you specify the claude model recommendations for the tasks in the plan? if not, do it and document the session and merge everything to main
- **Response 3:** The plan had no model map, so §6 became "PR slicing, effort & model
  recommendations": PR 1 (engine surgery + FSRS guard) = Opus 4.8, PR 2 (match grid + Redemittel
  cloze, mechanical builders) = Sonnet 5, PR 3 (typed cloze, grading edge cases) = Opus 4.8, PR 4
  (listening word, new interaction + gating) = Opus 4.8, PR 5 (odd-one-out + assertions) = Sonnet 5
  with an escalate-to-Opus note, Phase 4 content drafting = Fable 5, Haiku not recommended for any
  rung. Same risk-based routing logic as the Artikel-Visuals / Game G2 plans, with a per-PR
  rationale. Updated the s131 status handoff to point at the map, merged to `main`, realigned the
  branch.
- **Artifacts (Prompt 3):** `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` §6 · `docs/PROJECT_STATUS.md`
  · `docs/SESSION_PROMPT_LOG.md` (+ this entry)
- **Prompt 4 (verbatim, after switching the session model to Opus 4.8):**
  > make sure to also capture the ueben analysis done in the session earlier and the recommendations. Then proceed with implementation of the plan with opus tasks of phase 1
- **Response 4 (Opus 4.8):** (1) Captured the earlier five-option analysis + recommendation durably
  in the plan as Appendix A (it had only lived in this log). (2) Implemented PR 1 = Phase 0 + Phase 1.
  Phase 0: generalized `engine/quiz.ts`'s `buildThemeQuiz` into a pool-based `buildPoolQuiz(pool,
  difficulty, count, opts)` with `buildThemeQuiz` as a behavior-identical wrapper; new opts
  `includeGeneric` (theme-agnostic banks off for scoped sessions), `vocabDistractors`/
  `collocationDistractors` (pool if ≥ 4 else full bank), `themeId`, + a shared `anyContent()`
  fallback. Phase 1: `buildScopedSession` (`engine/session.ts`) now interleaves recall cards with
  generated exercises for the Wörter + Kollokationen scopes, capped at 2 appearances/item
  (`capBySource`), with vocab sets also pulling collocation fill/word-order via `headword`
  resolution; `difficulty` flows from the learner's level. FSRS guard: `SessionPlayer.onQuizResult`
  only grades FSRS/loot when the question sourceId resolves in the vocab bank, so collocation
  questions (`c_*`) award XP + combo only (also fixes the latent Pool 2 bug). Added
  `tests/scopedSession.test.ts`. Gates: typecheck, test:unit 209, lint 0 errors, build,
  check:bundle 80.8 kB, lint:content all green. Squash-merged to `main` per the auto-ship rule with
  the plan status + PROJECT_STATUS handoff updates.
- **Artifacts (Prompt 4):** `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/session/SessionPlayer.tsx` · `tests/scopedSession.test.ts` (new) ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` (Appendix A + Phase 0/1 shipped markers) ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 5 (verbatim):**
  > go ahead with pr2 tasks
- **Response 5 (Opus 4.8; plan recommended Sonnet 5, founder chose to continue on Opus):** Shipped
  PR 2 = Phase 2a + 2e. **2a noun→verb match grid:** `collocationMatchQ` in `engine/quiz.ts` reuses
  the `MatchingQuestion` renderer (kind stays `"matching"`), with a `distinctCols` dedupe on both
  noun and verb (MatchingView keys left by `pair.left`, right buttons by `pair.right`, so a repeat
  either side is ambiguous + a duplicate React key); wired into `buildPoolQuiz` difficulty 1 + 2
  (reaches the Kollokationen scope, composed Pool 2, and `/quiz`); the MatchingView sub-line now
  falls back through `q.hint` so the grid reads "Wähle links ein Nomen …". **2e Redemittel cloze:**
  new MCQ kind `redemittelCloze` (added to `QuizKind` + `MCQQuestion.kind` + `kindLabel`);
  `redemittelClozeQ` blanks the longest content word via an umlaut-safe whole-word regex (small
  function-word stoplist, modal/Konjunktiv verbs kept as targets), distractors from the full
  Redemittel bank; `buildRedemittelQuiz` drives the Redemittel scope, now interleaving cloze (~0.35)
  with cards; the FSRS guard already skips the `r_*` sourceId so it awards XP + combo only. Extended
  `tests/scopedSession.test.ts` (grid shape/distinctness, cloze shape, redemittel scope mixes quiz).
  Spot-checked the generated German (clozes + grids) for correctness before shipping. Gates:
  typecheck, test:unit 211, lint 0 errors, build, check:bundle 80.8 kB, lint:content all green.
  Squash-merged to `main` per the auto-ship rule with the plan + status doc updates.
- **Artifacts (Prompt 5):** `src/types/index.ts` · `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/quiz/QuestionViews.tsx` · `tests/scopedSession.test.ts` ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 6 (verbatim):**
  > what is the model recommendations for pr3?
- **Response 6 (Opus 4.8):** Answered from the plan §6 map: PR 3 (Phase 2b typed cloze) is
  recommended on **Opus 4.8**, because it extends the typing block UI + the tolerant-matcher grading
  path (umlauts, article prefixes, give-up) and must respect the graduation gate, more judgment than
  the mechanical Sonnet-5 rungs.
- **Prompt 7 (verbatim):**
  > yes
- **Response 7 (Opus 4.8):** Shipped PR 3 = Phase 2b typed cloze. The `typing` SessionBlock gained an
  optional `cloze: { prompt; answers }`; `TypingBlock` renders the blanked example sentence
  ("Ergänze das fehlende Wort", "Lücke" badge) and grades the typed answer via the new
  `gradeTypedAny` (`engine/typing.ts`, best verdict across targets so the blank accepts the exact
  surface form OR the base headword). `typedClozeData`/`clozeTypingBlock` (`engine/session.ts`) build
  the cloze from an example containing the headword; it is gated to `graduatedToTyping` words (in the
  Wörter scope a graduated word has ~50% chance of the cloze variant vs plain forward recall, never
  both), so a new word is never typed cold. Grades FSRS via the vocab sourceId (fires the gender
  reveal on correct nouns). Extended `tests/typing.test.ts` (gradeTypedAny) +
  `tests/scopedSession.test.ts` (graduated-only gate, cloze shape). Spot-checked the generated German
  before shipping. Gates: typecheck, test:unit 215, lint 0 errors, build, check:bundle 80.8 kB,
  lint:content all green. Squash-merged to `main` per the auto-ship rule with the plan + status
  updates.
- **Artifacts (Prompts 6–7):** `src/types/index.ts` · `src/engine/typing.ts` · `src/engine/session.ts`
  · `src/features/session/SessionPlayer.tsx` · `tests/typing.test.ts` · `tests/scopedSession.test.ts`
  · `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 8 (verbatim):**
  > go ahead with pr4
- **Response 8 (Opus 4.8):** Shipped PR 4 = Phase 2c listening word. New MCQ kind `listeningCloze` +
  an `audioPrompt` field on `QuizQuestionBase` (added to `QuizKind`/`MCQQuestion.kind`/`kindLabel` →
  "Hören"). `listeningClozeQ` (`engine/quiz.ts`) reuses the cloze blank + distractors, carries NO
  hint (an EN gloss would reveal the heard word), and stores the full sentence in `audioPrompt`;
  `buildListeningQuiz` drives it. The Wörter scope emits listening blocks (~0.25 ratio) only when
  `buildScopedSession` receives `listening: true`, which `SessionPlayer` sets to
  `ttsSupported() && speechEnabled`. `MCQView` gained an audio branch: an "Anhören" play button that
  autoplays once per question (useEffect on q.id; the session is opened by a tap, so the gesture
  requirement is satisfied) plus the gapped frame as supporting text. Grades FSRS via the vocab
  sourceId. NOT wired into `/quiz` or the composed session (that keeps its own reading-voicemail
  listening). Extended `tests/scopedSession.test.ts` (shape, no-gloss, the TTS gate). Spot-checked the
  generated data before shipping. Gates: typecheck, test:unit 217, lint 0 errors, build,
  check:bundle 80.8 kB, lint:content all green. Squash-merged to `main` per the auto-ship rule with the
  plan + status updates.
- **Artifacts (Prompt 8):** `src/types/index.ts` · `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/session/SessionPlayer.tsx` · `src/features/quiz/QuestionViews.tsx` ·
  `tests/scopedSession.test.ts` · `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md`
  · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 9 (verbatim):**
  > continue with opus now for pr5
- **Response 9 (Opus 4.8; plan recommended Sonnet 5, founder chose to continue on Opus):** Shipped
  PR 5 = Phase 2d odd-one-out + Phase 3 variety guarantee, completing Phases 0–3. **2d:** new MCQ
  kind `oddOneOut` ("Ausreißer" badge); `oddOneOutQ` (`engine/quiz.ts`) anchors on a set word,
  resolves 2 of its authored `related` terms to bank entries via a replicated `normalizeForm` +
  once-built `vocabResolver` (so engine/ does not import features/), and adds an outsider from a
  DIFFERENT theme as the answer; NO sourceId, so XP + combo only, never FSRS. `buildOddOneOutQuiz`
  drives it in the Wörter scope (~0.2 ratio). **Phase 3:** `avoidRuns` (`engine/session.ts`) greedily
  reorders the final block list so no block kind runs 3-in-a-row when avoidable (kills the
  wall-of-flip-cards feel), applied to every scope; `kindLabel` now covers every new kind. Extended
  `tests/scopedSession.test.ts` (odd-one-out shape + no-sourceId, the no-3-in-a-row assertion).
  Spot-checked the generated clusters before shipping. Gates: typecheck, test:unit 219, lint 0 errors,
  build, check:bundle 80.8 kB, lint:content all green. Squash-merged to `main` per the auto-ship rule
  with the plan + status updates. Plan Phases 0–3 now COMPLETE; only Phase 4 (deferred) remains.
- **Artifacts (Prompt 9):** `src/types/index.ts` · `src/engine/quiz.ts` · `src/engine/session.ts` ·
  `src/features/quiz/QuestionViews.tsx` · `tests/scopedSession.test.ts` ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 10 (verbatim):**
  > how do we identify the current variety is exhausted?
- **Response 10 (Opus 4.8):** Explained (no code) that "exhausted" is per-axis, not global, and laid
  out the signals: coverage/eligibility gaps (measurable from the banks today), repetition/determinism
  (the real template ceiling), skill gaps (not templatable → Phase 4), and learner signal (needs
  telemetry). Gave a two-part decision rule and proposed a cheap offline "exercise-coverage report" as
  the concrete instrument.
- **Prompt 11 (verbatim):**
  > where will that report live and who should read it and how is it useful? explain it briefly in plain language
- **Response 11 (Opus 4.8):** Plain-language answer: lives at `docs/reports/exercise-coverage-report.md`,
  generated on demand by a `pnpm` command (a repo document, not an in-app dashboard); read by the
  founder (where to spend content effort) and whoever builds next; useful because it turns "does this
  feel samey?" into a named list of topics with a cheap-or-expensive tag.
- **Prompt 12 (verbatim):**
  > yes build it, but it should be easily understandable without too much jargon and should be visual with clear explanations wherever needed
- **Response 12 (Opus 4.8):** Built `scripts/report-exercise-coverage.mjs` + `pnpm
  report:exercise-coverage`. It runs the REAL session builder (no drift) across every theme, unioned
  over all CEFR levels (difficulty 1/2/3) and new+mature decks, with a seeded RNG so output is
  deterministic (verified identical across runs). Writes a visual German report to
  `docs/reports/exercise-coverage-report.md`: a plain "what is this" intro, a 🟢/🟡/🔴 legend, a
  per-type glossary, a per-theme variety bar chart, a folded full topic×type matrix, a Kollokationen/
  Redemittel/Grammatik section, and a "when is variety exhausted?" footer. Caught + fixed two
  methodology flaws during review (all-graduated deck hid the flip-card → union fresh+mature;
  collocationMatch mislabeled as vocab-matching → distinguish by prompt) and reframed the residual as
  word-level once theme-level came out fully 🟢 (20/20). Result: theme-level variety is exhausted; the
  report ranks the cheap word-level residual (85 words without a self-example, 74 without resolvable
  related). Wired the command into CLAUDE.md commands + the plan's new "Deciding when to start Phase 4"
  section. Squash-merged to `main` with the doc updates.
- **Artifacts (Prompts 10–12):** `scripts/report-exercise-coverage.mjs` (new) ·
  `docs/reports/exercise-coverage-report.md` (new, generated) · `package.json` · `CLAUDE.md` ·
  `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 13 (verbatim):**
  > document the session
- **Response 13 (Opus 4.8):** Session-close documentation pass. Verified both `PROJECT_STATUS.md` and
  this log are complete/consistent (all 12 prior prompts captured with responses + artifacts; two
  handoffs held per the doc-hygiene rule, s129 already archived to W29). Fixed the one stale spot the
  variety work left: added a concise "Bibliothek Üben sets are auto-varied (s131)" note to the
  `CLAUDE.md` session-engine section (the new builders, the FSRS guard, the 2-appearance cap,
  `avoidRuns`, and the `pnpm report:exercise-coverage` gauge) so future sessions discover it. Condensed
  the s131 status handoff (it had grown to the 250-line ceiling from live per-PR appends) into a tight
  summary pointing at the plan + this log for detail, bringing the file to 165 lines. No code touched.
- **Artifacts (Prompt 13):** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`

## Session 132 — 2026-07-19 — Bibliothek mobile-filter fixes + graph two-area color & layout

Branch `claude/filter-scroll-badge-bugs-y75thb`. All work squash-merged to `main` (PRs #581, #582, #583).

- **Prompt 1 (verbatim, + 1 screenshot of the Wörter tab with a large empty gap above the cards):**
  > when filter is opened and being scrolled, there seems to be a bug - see the screenshot. Also, when things from dropdowns in the filter are selected, the filter badges doesn't appear with filter count - which is wrong, the filter count with badges should apply to dropdown items as well. fix these two issues
- **Response 1 (Opus 4.8):** Two fixes. (1) Empty-gap: the sticky/collapsing browse header contained the
  open filter panel; collapsing the tall block on scroll left its reserved flow space as a blank gap.
  Interim fix: stop the header collapsing while `filtersOpen` (`headerHidden && !filtersOpen`) in all
  four browse tabs. (2) Badge: the mobile Filter-button badge counted only `activeFacetCount(selection)`;
  added `scopeActiveCount` (sectors + themes + subs) on Wörter + Kollokationen (Redemittel/Grammatik use
  facets only). typecheck + build green; committed + pushed.
- **Prompt 2 (verbatim, + 1 screenshot of the Kollokationen graph, dense grey tangle):**
  > the lines are too noisy here. can you make them thinner so that the graph looks better?
- **Response 2 (Opus 4.8):** Thinned the Kollokationen graph edges: non-lit stroke width `1 → 0.55`,
  lit `1.8 → 1.6`, resting opacity `0.14 → 0.10` (light) / `0.16 → 0.13` (dark). Built, committed, pushed.
- **Prompt 3 (verbatim):**
  > yes merge to main
- **Response 3 (Opus 4.8):** Opened PR #581 (empty-gap + badge + thin edges), squash-merged to `main`,
  ran the post-merge realign (reset dev branch to `origin/main`, force-with-lease).
- **Prompt 4 (verbatim):**
  > what's the purpose of splitting the non-arbeitswelt categories as three in the graphs? also, the island clusters are not very clearly visible in kollokations graph.
- **Response 4 (Opus 4.8):** Explained (no code) that the graph colors by the app's 5-domain taxonomy, so
  the non-work content shows as three real domains (Alltag/Gesundheit/Bildung); the imbalance is because
  s121 merged the two work domains into one `beruf`. Root-caused the blurry islands: clustering is
  per-theme (20) but color is per-domain (4), so 10 blue work-islands fuse; plus weak centroid pull and
  hub-verb bridges. Ranked betterments (cluster by domain, tighter pull, tame hubs, two-level layout).
- **Prompt 5 (verbatim, two quick messages):**
  > suggest betterments and reasoning
  > don't make any changes yet
- **Response 5 (Opus 4.8):** Gave the ranked recommendations with reasoning, grounded in the real force
  params (`forceX/Y 0.13`, ring `140+N*30`, charge `-42`, link `0.18`). Recommended domain-clustering +
  firmer pull; asked the founder to pick clustering by domain vs theme before implementing.
- **Prompt 6 (verbatim):**
  > can you generate some previews with various degrees of the above recommendations applied?
- **Response 6 (Opus 4.8):** Built a self-contained interactive comparison artifact on the REAL graph
  (extracted 1,243 nodes / 1,014 links via the actual builder; inlined d3-force + its 3 UMD deps,
  verified the bundle exposes the force API in a browser-like vm). Five animated force presets
  (Current, By life area, By life area + tighter [recommended], Two levels, By topic + tighter) with a
  live parameter panel. Published as a claude.ai artifact. Confirmed the data: beruf 733 vs alltag 389 /
  gesundheit 62 / bildung 59.
- **Prompt 7 (verbatim, + 3 screenshots of the open filter panel filling the screen):**
  > here's the filter.. when opened it stays open even after scrolling.. it's stuck! fix the bug
- **Response 7 (Opus 4.8):** Diagnosed this as a side effect of the Prompt-1 interim guard: freezing the
  header kept the tall panel pinned. Proper fix: moved the mobile filter panel into normal document flow
  OUTSIDE the sticky header (only the compact toolbar stays sticky and collapses), and reverted the
  `&& !filtersOpen` guard, across all four tabs. typecheck + build + PR #582 → merged → realigned.
- **Prompt 8 (verbatim, mid-turn during Response 7):**
  > can you translate the stuff in the html artifact for the previw in English?
- **Response 8 (Opus 4.8):** Regenerated the comparison artifact fully in English (also swapped in the
  real German word labels, dropping the earlier id-guessing), republished to the same URL.
- **Prompt 9 (verbatim):**
  > for the artifact, include enough non tech summary so that I understand what is what
- **Response 9 (Opus 4.8):** Added a plain-language "How to read this graph" explainer (dot = noun, ring
  = verb, line = collocation, color = life area, islands = clumps) and de-jargoned the settings panel
  (e.g. "Pull to center: firm" with the raw number secondary). Republished to the same URL.
- **Prompt 10 (verbatim):**
  > keep the color coding to only two main areas - professional and personal life - if needed reword the Arbeitswelt to something like Professional or suitable german word. and the graph I like it by topic + tighter.
- **Response 10 (Opus 4.8):** Implemented both. Added `lifeAreaOf`/`lifeAreaColor`/`LIFE_AREAS`/
  `LIFE_AREA_COLORS` to `graphPalette.ts` (professional = `beruf` = brand indigo; personal = every other
  domain = teal; labels Berufsleben / Privatleben). Switched BOTH graphs' node color, glow, lit edges,
  legend chips and the legend domain-filter to the two areas (clustering unchanged). Applied the
  founder-picked "by topic + tighter" force recipe to the Kollokationen graph: forceX/Y `0.13→0.28`,
  link `0.18→0.11`, collide `r+3→r+5`, ring `N*30→N*35`. Removed now-unused imports. Gates: typecheck,
  test:unit 219, lint 0 errors, build all green.
- **Prompt 11 (verbatim, mid-turn during Response 10):**
  > once done, document the session and push everything to main
- **Response 11 (Opus 4.8):** This documentation pass (PROJECT_STATUS.md handoff + _Last updated_,
  this log, and the CLAUDE.md graph-color/layout facts), then PR #583 → squash-merge to `main` → realign.
- **Artifacts (session 132):** `src/features/vocabulary/VocabularyTrainer.tsx` ·
  `src/features/collocations/CollocationsBrowser.tsx` · `src/features/redemittel/RedemittelTrainer.tsx` ·
  `src/features/grammar/GrammarHub.tsx` · `src/lib/graphPalette.ts` ·
  `src/features/collocations/CollocationGraph.tsx` · `src/features/vocabulary/WordGraph.tsx` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · PRs #581 / #582 / #583 ·
  comparison-preview artifact (scratchpad HTML, not committed)
- **Prompt 12 (verbatim):**
  > is everything live?
- **Response 12 (Opus 4.8):** Checked the actual GitHub Pages deploy runs (not just the merges). PRs
  #581/#582 confirmed live (green); #583 had merged but its Pages run hadn't appeared yet, reported it as
  still deploying.
- **Prompt 13 (verbatim, + 1 screenshot of the GitHub mobile commits list showing no check on the latest
  commit):**
  > the latest commit isn't live
- **Response 13 (Opus 4.8):** Diagnosed the real cause: GitHub never fired the `push` event for the #583
  squash-merge (`32dcb50`), so NEITHER the deploy nor the validate workflow ran (a one-off GitHub webhook
  miss; the earlier merges fired fine). Manually dispatched `pages.yml` against `main` (it has
  `workflow_dispatch`), watched run #590 build `32dcb50` and finish `success`, confirming the graph change
  is live. Noted the validate gate also didn't run but its checks already passed pre-merge on the branch.
- **Prompt 14 (verbatim, + 1 screenshot of the live two-color Kollokationen graph):**
  > can you increase the tension of the lines so that the clusters are more tighter together?
- **Response 14 (Opus 4.8):** Tightened the Kollokationen force layout: link tension `0.11 → 0.22` (the
  lever the founder named), centroid pull `forceX/Y 0.28 → 0.38`, collision `r+5 → r+3`. typecheck +
  build green; PR #584 → squash-merge → realign. This time the push webhook fired on its own (verified the
  `7c9182f` Pages run went `success`); the late #583 webhook also finally fired but was harmless (already
  deployed via the manual run). Updated the CLAUDE.md graph-layout values to match.
- **Prompt 15 (verbatim):**
  > document the session and merge everything to main
- **Response 15 (Opus 4.8):** This documentation pass (appended prompts 12–15 here, refreshed the
  PROJECT_STATUS.md s132 handoff with the cluster-tightening + the deploy-webhook-miss learning), then
  shipped the doc update to `main`.
- **Artifacts (Prompts 12–15):** `src/features/collocations/CollocationGraph.tsx` · `CLAUDE.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · PR #584 · manual Pages deploy run #590

## Session 130 (cont.) — 2026-07-19 — Migration 0007 confirmed

- **Prompt 6 (verbatim):** `> give me clear instructions on what's my action point`
- **Response 6:** Step-by-step Supabase instructions for running migration 0007 (SQL editor, the
  exact SQL pasted inline, expected "Success. No rows returned", in-app verification steps, and the
  fallback if migration 0004 were missing).
- **Prompt 7 (verbatim):** `> it says success`
- **Response 7:** Confirmed the migration applied; both admin accounts can now save review marks in
  the /sources Daten-Werkbank. Moved the action item from `PROJECT_STATUS.md` open items to
  `PROJECT_FOUNDATION.md` completed founder items and shipped the doc update.
- **Prompt 8 (verbatim):** `> document the session `
- **Response 8:** Final documentation sweep. The session was documented incrementally throughout
  (s130 handoff with both tasks in `PROJECT_STATUS.md`, CLAUDE.md command/convention updates,
  `PHASE2_SETUP.md` migration steps, prompt-log entries 1-7), so the close-out applied the
  doc-hygiene rule: aged the session-130 handoff (with a migration-0007 closure note) out of
  `PROJECT_STATUS.md` into the W29 archive, restoring the two-most-recent-handoffs shape
  (s132 + s131 remain), and appended this entry. Session totals: PRs #570 (P0/P1 data-integrity
  fixes), #572 (/sources redesign + Daten-Werkbank), #586 (migration-0007 close-out), all
  squash-merged to `main`; three rebases over the parallel sessions 129/131/132.
- **Prompt 16 (verbatim):**
  > there's one more suggestion to the filter rail when expanded on the mobile view. It should occupy only 40-60% of the screen space and internal sroll should be enabled. in addition to that, the go to top button is not center aligned.. check the screenshots and fix it.
- **Response 16 (Opus 4.8):** Two mobile fixes (no screenshots actually arrived this turn; diagnosed both
  from code). (1) Capped the `layout="panel"` FilterRail at `max-h-[55dvh]` as a flex column with a fixed
  header and one internal `overflow-y-auto` scroll region, so the expanded panel stays ~55% of the screen
  and the filters scroll inside it. (2) Fixed the off-center `ScrollTopButton`: it is a `motion.button`,
  and framer-motion's inline `transform` (driving the `y` slide) overrode the Tailwind `-translate-x-1/2`
  centering class; animated `x: "-50%"` across the keyframes and dropped the class. Both live on all four
  browse tabs via the shared `FilterRail` + `browseScroll`. typecheck + build green; PR #589 → squash-merge
  → realign; deploy fired on push.
- **Prompt 17 (verbatim):**
  > do the documentation drill and maintenance if needed and merge everything to main
- **Response 17 (Opus 4.8):** This documentation pass. Folded PR #589 into the session 132 handoff (new
  bullet + PR list), refreshed the `_Last updated_` block, appended prompts 16–17 here, and added a
  one-line note to the CLAUDE.md FilterRail mobile-panel description (55dvh cap + internal scroll). Doc
  hygiene checked: `PROJECT_STATUS.md` holds the two most recent handoffs (s132 + s131) and is well under
  the 250-line cap; nothing to archive. Shipped to `main`.
- **Artifacts (Prompts 16–17):** `src/features/shared/FilterRail.tsx` · `src/features/shared/browseScroll.tsx` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` · PR #589

## Session 133 — 2026-07-19 — Brand-kit modernization plan

- **Branch:** `claude/brand-kit-modernization-igqlnm`
- **Prompt 1 (verbatim):** `> check the brand spec document, scope the work with a robust plan with clear model recommendations for each chunk of work. Except for the logo, feel free to deviate subtly wherever needed to make the brand kit of app look modern and top billion dollar successful edutech app. Aim for the highest quality and excellent output. Save the plan to repo.`
- **Response 1 (Fable 5):** Read `docs/branding/BRAND_SPEC.md` and surveyed every brand touchpoint in
  the code (tokens in `src/index.css`/`tailwind.config.ts`, hardcoded hexes in `nav-items.ts`,
  `route-icons.tsx`, `graphPalette.ts`, `UebenPath.tsx`, the four `features/welt` chrome files,
  `domain-buildings.tsx`, `index.html`, `vite.config.ts` manifest, `prerender-help.mjs`, the
  `public/` icon set, and the landing page). Authored
  **`docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md`**: a four-PR implementation sequence (A atomic
  token flip + accent-role audit + chrome/meta, Fable 5 · B logo outline + full icon/og pipeline
  with zero deviation, Opus 4.8 · C deep surface sweep of game/map/buildings/landing, Opus 4.8 or
  Sonnet 5 · D dark-mode design pass + typography/motion/reward polish, Fable 5), a
  sanctioned-deviations register (logo locked; primary darkening for AA, `--accent-ink`,
  ink-on-Koralle, gradient demotion, der-token nudge, dual theme-color metas, typography
  micro-polish), computationally verified WCAG contrast findings (white on Nachtblau 4.27:1,
  Nachtblau on Papier 3.96:1, Himmelblau on white 1.94:1, white on Koralle 3.26:1), a proposed
  permanent `check:contrast` gate, and a risk register (accent-foreground white→ink semantic flip,
  PWA stale cache, locked palettes re-hued only, OAuth consent-logo re-upload). Docs-only session:
  no `src/` change. Also aged the s131 handoff into the W29 archive per the doc-hygiene rule.
- **Artifacts (Prompt 1):** `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · PR #592
- **Prompt 2 (verbatim):** `> go ahead with a`
- **Response 2 (Fable 5):** Built and shipped plan PR A, the atomic brand flip. Token systems for
  both themes in `src/index.css` (Papier ground, Nachtblau primary at `221 83% 54%`, Himmelblau
  accent with ink pairing + new `--accent-ink`, Koralle reward at `11 82% 54%`, warm `--shadow`
  `#22304F`; all deviations WCAG-driven and documented in the BRAND_SPEC status header),
  `tailwind.config.ts` accent.ink + re-stopped accent-gradient + quieted mesh, the
  `text-accent`→`text-accent-ink` sweep across 7 files, chrome alignment (`nav-items.ts`,
  `route-icons.tsx` BRAND, `graphPalette.ts` beruf/professional → Nachtblau), shell/meta
  (dual theme-color metas + no-JS shell in `index.html`, manifest `#3D74ED`/`#151320`,
  `prerender-help.mjs`, `src/main.tsx` boot-error gradient), and the permanent
  `scripts/check-contrast.mjs` gate wired into `validate.yml` (42/42 pairings pass). Gates all
  green (typecheck, lint 0 errors, test:unit 219, build, bundle 80.8 kB). Playwright screenshots
  light+dark × mobile+desktop verified Praktisch, Theorie (Karten + Graph), Fortschritt, Landing.
  Marked PR A shipped in the plan + BRAND_SPEC. Squash-merged to `main`.
- **Artifacts (Prompt 2):** `src/index.css` · `tailwind.config.ts` · `scripts/check-contrast.mjs` ·
  `package.json` · `.github/workflows/validate.yml` · `src/components/layout/nav-items.ts` ·
  `src/components/layout/route-icons.tsx` · `src/lib/graphPalette.ts` · `index.html` ·
  `vite.config.ts` · `scripts/prerender-help.mjs` · `src/main.tsx` · 7 `text-accent` call-site
  files · `docs/branding/BRAND_SPEC.md` · `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · PR (see
  merge commit on `main`)
- **Prompt 3 (verbatim):** `> go ahead with b and c`
- **Response 3 (Opus 4.8):** Shipped brand plan PRs B and C as two PRs.
  **PR B (#594) — logo + icon pipeline:** outlined the lowercase g from **Inter 800** (chosen from a
  5-candidate panel rendered on the locked swipe — Inter 800/900, Manrope 800, Figtree 900, Nunito
  900 — for wordmark cohesion with the app's Inter UI type + favicon-scale legibility) into a real
  `<path>` via opentype.js. Wrote `scripts/branding/build-logo-assets.mjs` (dev tooling, not in the
  app build): one source of truth for the swipe + outlined-g, rasterizing every `public/` asset with
  Playwright Chromium (no sharp) — default logo + favicon-16/32/48 (transparent corners),
  apple-touch/pwa-192/512 (full-bleed opaque), maskable (inner 80%), a new Papier og-image (mark +
  Inter-800 wordmark + tagline + genauly.de plate), and the canonical
  `preview/branding/genauly-logo-final.svg`. Verified on white/dark + iOS/circle mask sims and in the
  app header/landing/sidebar.
  **PR C (#595) — deep surface sweep:** Neuland game chrome `#5b5be6`→Nachtblau `#3D74ED` across all
  four welt files (`GAME_INDIGO`→`GAME_BLUE`; leather-backpack amber art + `GAME_OUT` outline kept as
  game props; victory loot already Koralle via PR A); Üben map route/Bahnhof→Nachtblau, MAP_LIGHT
  scenery tints hue-shifted 245→221 at identical (founder-locked) lightness, MAP_DARK route→`#8AB0F9`;
  Büro building→Nachtblau; landing step-chips + closing CTA band flattened to flat `bg-primary` (hero
  CTAs + "plateau." headline keep the gradient per the discipline); der token deepened to a cooler
  cobalt (light `226 74% 48%` / dark `226 88% 76%`) so a der Wesen never reads as the brand.
  Gates green (typecheck, lint 0 errors, test:unit 219, build, bundle 80.8 kB, contrast 42/42).
  Verified in-mission battle chrome, Spielen hub, Theorie der/die/das marks, flattened landing CTA.
  Both squash-merged to `main`; docs (BRAND_SPEC, plan, PROJECT_STATUS, this log) updated.
- **Artifacts (Prompt 3):** `scripts/branding/build-logo-assets.mjs` · `preview/branding/genauly-logo-final.svg` ·
  `public/` (9 icon/og assets) · `src/features/welt/{stage,BattleView,MissionPlayer,scenes}.tsx` ·
  `src/features/dashboard/UebenPath.tsx` · `src/components/city/domain-buildings.tsx` ·
  `src/features/landing/LandingPage.tsx` · `src/index.css` · `CLAUDE.md` ·
  `docs/branding/BRAND_SPEC.md` · `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · PRs #594, #595
- **Prompt 4 (verbatim):** `> go ahead `
- **Response 4 (Fable 5):** Shipped brand plan PR D (#596), completing the rebrand. The PR A dark
  theme survived its design review nearly intact; judged changes: dark `--muted-foreground` 76%→72%
  (hierarchy: secondary text now reads secondary, still ~8:1 on the ground), streak surfaces moved
  from warning/Butter to **Koralle** (header streak pill `bg-reward-bg`/`text-reward`/`fill-reward`,
  Fortschritt "Aktuelle Serie" StatCard via a new `reward` accent), `tabular-nums` on the StatCard
  value (the one numeric surface missing it), and the CLAUDE.md color-language sweep (brand
  indigo→Nachtblau, reward-gold→Koralle; DECISIONS.md deliberately kept as history). Found already
  done and left alone: button pressed states (`active:scale-[0.98]`), display `tracking-tight`,
  Analytics/session tabular-nums. Gates green (typecheck, lint 0 errors, test:unit 219, build,
  bundle 80.8 kB, contrast 42/42 incl. the retuned dark muted pairs). Verified the Koralle streak
  pill light+dark and the dark Fortschritt hierarchy by screenshot. BRAND_SPEC flipped to FULLY
  IMPLEMENTED; the plan doc records all four PRs (#593 Fable 5 · #594/#595 Opus 4.8 · #596 Fable 5).
  Squash-merged to `main`.
- **Artifacts (Prompt 4):** `src/components/layout/AppShell.tsx` · `src/components/shared/StatCard.tsx` ·
  `src/features/analytics/Analytics.tsx` · `src/index.css` · `CLAUDE.md` · `docs/branding/BRAND_SPEC.md` ·
  `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · `docs/PROJECT_STATUS.md` · PR #596
- **Prompt 5 (verbatim):** `> document the session. ` _(switched session model to Opus 4.8)_
- **Response 5 (Opus 4.8):** Started the documentation close-out (the session had been documented
  incrementally after each PR, so this was the hygiene sweep: refreshed the s133 handoff header in
  `PROJECT_STATUS.md` from "PLAN authored" to "plan authored AND fully shipped"). Interrupted by
  prompt 6 before finishing; folded the remaining doc work into the prompt-7 pass below.
- **Prompt 6 (verbatim):** `> store all the brand kit items in a dedicated repo. generate proper brand kit if any of them isn't available. `
- **Response 6 (Opus 4.8):** Asked (AskUserQuestion) whether the kit should be a standalone GitHub
  repo or a folder in this repo; founder chose **folder in this repo** (recommended: one source of
  truth, no drift). Built **`brand-kit/`** + the generator **`scripts/branding/build-brand-kit.mjs`**,
  which reads the mark constants + the live tokens from `src/index.css` so the kit cannot drift from
  what ships. **Generated the missing pieces** a proper kit needs: the "Genauly" **wordmark** (outlined
  from Inter 800 glyph-by-glyph with kerning, bypassing an unsupported opentype GSUB feature →
  `scripts/branding/wordmark-data.mjs`), horizontal + stacked **lockups** (ink + white), a **mono
  knockout** mark (swipe filled, g cut out as negative space, verified legible on white/Papier/blue/
  ink grounds), a **clear-space** guide, the **palette.svg** swatch sheet + `tokens.css`/`tokens.json`,
  an **Inter type specimen**, copied **app icons**, a **square social avatar** + og-image, PNG
  **preview** contact sheets, and a **README** with full usage rules. ~592 kB, 27 files. Verified the
  logo-overview, palette, typography, and mono sheets by screenshot.
- **Prompt 7 (verbatim):** `> then document the session once done with the current task`
- **Response 7 (Opus 4.8):** This close-out. Folded the brand-kit deliverable into the s133
  `PROJECT_STATUS.md` handoff, noted it in the plan doc + a new CLAUDE.md Brand-logo bullet (where the
  kit lives + how to regenerate), refreshed the handoff header, and logged prompts 5–7 here. Doc
  hygiene checked: `PROJECT_STATUS.md` holds the two most recent handoffs (s133 + s132), under the
  250-line cap. Shipped with the brand-kit PR.
- **Artifacts (Prompts 5–7):** `brand-kit/` (27 files) · `scripts/branding/build-brand-kit.mjs` ·
  `scripts/branding/wordmark-data.mjs` · `CLAUDE.md` · `docs/PROJECT_STATUS.md` ·
  `docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 8 (verbatim):** `> for the dark mode logo, why can't you use the same blue for the highlight but white for the letter g?`
- **Response 8 (Opus 4.8):** Rendered the option rather than asserting: white-g + Himmelblau swipe on
  dark actually works (the descender reads on the dark ground; the bowl-on-swipe contrast is modest
  but legible at logo size). Explained the app was using ONE universal Papier-tile mark, not a
  theme variant. Offered A (tile-less white g) vs B (dark sticker tile + white g); founder picked B.
- **Prompt 9 (verbatim):** `> the white g looks too white.m can you look for a lighter shade and provide some previews?`
- **Response 9 (Opus 4.8):** Rendered 6 g shades on the dark tile (pure white → Papier cream →
  off-whites → grey-lavender → steel blue) and sent the comparison; asked which to use, recommending
  Papier `#FAF6EC`. Founder replied "[No preference]", so I took the recommendation.
- **Prompt 10 (verbatim):** `> also, the logo should just be the letter with the blue highlight.. the background shouldn't be part of the logo and should always be transparent. all the previews you provided look the samem generate an html artifact`
- **Response 10 (Opus 4.8, artifact-design skill):** Two changes: the logo becomes **tile-less**
  (transparent always, just swipe + g), and I built a proper interactive **HTML artifact**
  (`brand-kit/previews/logo-preview.html`, theme-aware, Papier/Tinte + Nachtblau, marks at full size)
  showing the tile-less mark on transparent/light/dark grounds + the dark-mode g-shade chooser so the
  differences actually read. Published via the Artifact tool.
- **Prompt 11 (verbatim):** `> provide the artifact here`
- **Response 11 (Opus 4.8):** Rendered the artifact inline via SendUserFile (display:render) and
  re-shared the published URL.
- **Prompt 12 (verbatim):** `> go ahead with the recommendation` (+ mid-turn: `once done with the current task, check if the branding is applied to the app well and make any improvements or corrections if needed, then document the session and push everything to main`)
- **Response 12 (Fable 5 → Opus 4.8):** Implemented the tile-less logo end-to-end with Papier g on
  dark. `build-logo-assets.mjs` now emits `genauly-logo.png` (ink g) + `genauly-logo-dark.png`
  (Papier g), both transparent/tile-less; favicons/PWA keep their tile. New shared
  `src/components/shared/Logo.tsx` swaps them on `.dark` (no JS); all 7 in-app logo spots switched to
  `<Logo>` with no tile/rounded/glow box; the dark no-JS shells (`index.html`, `prerender-help.mjs`)
  hard-code the dark logo; the old `genauly-default-logo-transparent-corners.png` removed. Brand kit +
  its generator + README updated to tile-less (mark/mark-dark/app-icon-tile, lockups, overview).
  Branding QA: verified the logo swap in header/landing/sign-in light+dark; the wider app was already
  verified across PRs A–D. Gates green (typecheck, lint 0 errors, test:unit, build, bundle 80.8 kB,
  check:contrast). Docs (PROJECT_STATUS, BRAND_SPEC, CLAUDE.md, this log) updated; pushed to `main`.
- **Artifacts (Prompts 8–12):** `src/components/shared/Logo.tsx` · `public/genauly-logo.png` ·
  `public/genauly-logo-dark.png` · `scripts/branding/build-logo-assets.mjs` ·
  `scripts/branding/build-brand-kit.mjs` · `brand-kit/` (logo/README/previews incl.
  `logo-preview.html`) · 7 in-app logo components · `index.html` · `scripts/prerender-help.mjs` ·
  `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/branding/BRAND_SPEC.md` · `docs/SESSION_PROMPT_LOG.md`

## Session 134 — 2026-07-19 — Mobile filter rail height, park Verbunden, Option B word cards

- **Branch:** `claude/filter-rail-mobile-height-n8ktd6`
- **Model:** Opus 4.8 (founder switched to it via `/model` mid-way through prompt 1).
- **Prompt 1 (verbatim):** `> the filter rail occupies a bit too much space on mobile view when opened. reduce its height by 3-4 lines worth of space for mobile. `
- **Response 1 (Opus 4.8):** Reduced the `FilterRail` mobile `panel` cap from `max-h-[55dvh]` to
  `max-h-[45dvh]` (`src/features/shared/FilterRail.tsx`), ~10 dvh / roughly 3-4 text lines on a phone,
  leaving more of the card list visible; the fixed header + internal scroll region keep the filters
  reachable. Typecheck green. Committed + pushed; not yet shipped at this point.
- **Prompt 2 (verbatim):** `> the verbunden drop-down and links to other parts of the app can be parked for now as I need to brainstorm on it and think how it's useful and what are the dependencies for it. for now keep it hidden. Then provide a few previews of rearranging items on the cards for best looks. `
- **Response 2 (Opus 4.8):** Traced "Verbunden" to the vocab-card cross-module panel (`RelatedPanel`
  → Kollokation/Schreibtraining/Dialog, toggled in `VocabList.tsx`). Parked it behind a reversible
  `const SHOW_RELATED = false` (gates `hasRelated`); `RelatedPanel.tsx` + `relatedRows` kept untouched
  so re-enabling is one line. Built `preview/vocab-card-layouts.html` (real design tokens, light/dark
  toggle, 2-up grid) with four card-rearrangement options — A baseline · B actions-to-the-foot ·
  C example bottom-anchored + plural pill · D genus color rail — and sent it via SendUserFile.
- **Prompt 3 (verbatim):** `> provide the artifact here again `
- **Response 3 (Opus 4.8):** Re-sent the same `preview/vocab-card-layouts.html` render.
- **Prompt 4 (verbatim):** `> i like option b. ` _(mid-turn follow-up: `> for the animation on the backside of the card, move it to the right of the card as for most of the cards the right side is empty. Also, the female animation seems too slow and not as snappy as for the others, so fix it.`)_
- **Response 4 (Opus 4.8):** Implemented Option B in `VocabList.tsx` (quiet headline = creature + word
  left / bookmark right; example gets room; foot row pins plural pill left + speak button right via
  `mt-auto`). For the mid-turn asks: gave `ArtikelEffect` a new `align` prop and passed `align="right"`
  from the card back (origin → `--fx-x: 78%`, the empty right side; `SessionPlayer` stays centered),
  and made the "die" bloom snappier — `470ms` fast-out cubic-bezier (was `650ms` ease-out) with a
  tighter `200/280/360ms` ring stagger (was `200/310/420`). The three `.artikel-fx-*` origins now read
  `var(--fx-x, 50%)`. Gates: typecheck clean, lint 0 errors, build green, `test:unit` 219/219.
- **Prompt 5 (verbatim):** `> give me a png preview here ` _(also `> provide the artifact here again` earlier; and a bare `> continue`)_
- **Response 5 (Opus 4.8):** Rendered a PNG of Option B (three front cards die/der/das + one back face
  showing the right-shifted reveal), light + dark side by side, by driving the pre-installed headless
  Chromium (`/opt/pw-browsers/chromium-1194`) against a scratchpad HTML built from the real tokens
  (no Playwright package available). Sent it via SendUserFile.
- **Prompt 6 (verbatim):** `> yes ` _(to opening + merging a PR for the batch)_
- **Response 6 (Opus 4.8):** Opened **PR #598** into `main` (no PR template in repo) and squash-merged
  it (`796fb01`): filter-rail height, parked Verbunden + preview, Option B cards, reveal-effect move +
  die timing. Ran the required post-merge realignment (`fetch origin main` → `reset --hard` →
  `push --force-with-lease`) so the dev branch is level with `main`.
- **Prompt 7 (verbatim):** `> document the session `
- **Response 7 (Opus 4.8):** This close-out. Added the s134 handoff to `PROJECT_STATUS.md`, aged the
  s132 handoff into the W29 archive per the two-handoff hygiene rule, refreshed the `_Last updated_`
  header to s134, and logged prompts 1-7 here.
- **Artifacts:** `src/features/shared/FilterRail.tsx` · `src/features/vocabulary/VocabList.tsx` ·
  `src/components/artikel/ArtikelEffect.tsx` · `src/index.css` · `preview/vocab-card-layouts.html` ·
  `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` · commits `2f1c7d4` / `1c48a33` /
  `df0c9bd` · PR #598 (squash `796fb01`)

## Session 135 — 2026-07-20 — Game demo-readiness review + P0 batch (Fable 5)

- **Branch:** `claude/game-review-demo-readiness-8fdpid`
- **Prompt 1 (verbatim):** `do a comprehensive review and analysis of the current game and provide priority actions and recommendations so that the game can also be presented in the demo this week.`
- **Response 1:** Reviewed the Neuland layer end-to-end: re-ran gates (typecheck, test:unit 219,
  lint:content), then a scripted Playwright playthrough (390x844) of the hub (light+dark), mission
  1.1 incl. the battle + bag ask flow, the boss opening, and the Heute → Spielen embed — zero console
  errors. Authored `docs/plans/GAME_DEMO_READINESS_REVIEW.md`: verdict "demo-ready with one must-fix
  bug" (the Spielen compact tile opens scrolled to max, hiding the next mission; offsetParent bug in
  `NeulandHub.tsx`), a Nachtblau asset-regen P1 (assets still carried pre-rebrand `#5b5be6`), founder
  prep tasks, and a 3–4-minute game demo script. Started committing doc updates.
- **Prompt 2 (verbatim):** `why are you editing the documentation.. you haven't yet delivered what I asked for`
- **Response 2:** Fair correction; delivered the full review in chat (verdict, evidence, prioritized
  P0/P1/P2, demo script, by-design caveats). Doc edits committed to the session branch only after the
  stop-hook required it; no merge to `main`.
- **Prompt 3 (verbatim):** `some of the game screenshots literally doesn't have a character sometimes.. why isn't that captured in the analysis?`
- **Response 3:** Verified the founder was right and the review had misfiled it as "placeholder art
  by design": `NPC_SPRITES` contained ONLY Frau Schmidt, so 4 of 5 dialogue battles ran against an
  invisible opponent, and only the hotspot renderer places the player. Re-ranked the priorities:
  battle-NPC sprites became P0.2, cutscene character placement P1.
- **Prompt 4 (verbatim):** `which model you recommend for p0 and p1?`
- **Response 4:** Sonnet 5 for the scroll fix, Fable 5 for the sprite design (character art in the
  blessed style), Haiku-grade for the recolor riding along, Sonnet 5 for the cutscene pass; offered
  to run the whole P0 batch in the current Fable session.
- **Prompt 5 (verbatim):** `go ahead with the whole P0 batch in this session`
- **Response 5:** Shipped the batch: (1) `NeulandHub.tsx` compact tile made `relative` (auto-center
  fixed; verified fresh profile → 1.1–1.3, mid-chapter → 1.4 centered); (2) four new 26x32 battle-NPC
  sprites authored in `welt_assets.py` (Grenzbeamte cap+badge, Milo lanyard, Kassiererin apron,
  Herr Brandt balding+mustache), registered in `stage.tsx` `NPC_SPRITES` + `sprite:` fields in
  `missions.ts` + the linter `GAME_SPRITES` mirror; (3) `INDIGO`→`(61,116,237)` Nachtblau, all assets
  regenerated. Verified via sprite sheets, per-backdrop anchor composites, and a Playwright run
  (Beamter renders in the 1.1 battle, zero errors). Gates: typecheck ✓, lint 0 errors ✓,
  lint:content ✓, test:unit 219 ✓, build ✓, bundle 80.7 kB ✓. Updated the review doc with the
  implementation record + the founder-caught finding, refreshed `PROJECT_STATUS.md`, logged here.
- **Artifacts:** `docs/plans/GAME_DEMO_READINESS_REVIEW.md` · `src/features/welt/NeulandHub.tsx` ·
  `preview/game-pixel-mockups/welt_assets.py` · `src/features/welt/assets/*` (4 new sprites + 6
  recolored) · `src/features/welt/stage.tsx` · `src/data/missions.ts` · `scripts/lint-content.mjs` ·
  `docs/PROJECT_STATUS.md` · `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md` ·
  commit `46e22eb` + the P0-batch commit/PR
- **Prompt 6 (verbatim):** `go ahead with p1 tasks` _(model switched to Opus 4.8 via /model for this turn)_
- **Response 6 (Opus 4.8):** Shipped the P1 cutscene-character pass. Root gap: all 19 cutscenes
  rendered empty rooms (only hotspot placed the player), and the dominant cutscene speaker Jonas
  (22 lines) had no sprite. Authored a **Jonas sprite** in `welt_assets.py` (messy brown hair, rust
  hoodie, denim; validated 26x32, distinct from the cast), registered in `stage.tsx` `NPC_SPRITES` +
  `sprite:` on `npc_jonas` in `missions.ts` + the linter `GAME_SPRITES` mirror. Added `CutsceneCast`
  to `scenes.tsx`: the player stands bottom-left on every backdropped cutscene (the `website` prop
  scene stays character-free), the speaking NPC stands right (current line's speaker if sprited, else
  the scene's primary sprited NPC via useMemo, so it doesn't flicker on narrator/player lines).
  Placement composite-checked on all five cutscene backdrops; verified in-app that the player renders
  on the 1.1 arrivals cutscene (zero console errors). Listening/automat/form/loadout deliberately keep
  their prop/device focus (no person). Gates: typecheck ✓, lint 0 errors ✓, lint:content ✓,
  test:unit 219 ✓, build ✓, bundle 80.7 kB ✓. Updated the review doc (P1 item + implementation
  record), `PROJECT_STATUS.md`, and this log.
- **Artifacts (P1):** `preview/game-pixel-mockups/welt_assets.py` (Jonas) ·
  `src/features/welt/assets/jonas.png` (new) · `src/features/welt/stage.tsx` ·
  `src/features/welt/scenes.tsx` (`CutsceneCast`) · `src/data/missions.ts` · `scripts/lint-content.mjs` ·
  `docs/plans/GAME_DEMO_READINESS_REVIEW.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 7 (verbatim):** `document the session`
- **Response 7 (Opus 4.8):** Session close-out. Most doc updates already landed inline during the P0
  and P1 work; this pass verified and completed them: confirmed the s135 `PROJECT_STATUS.md` handoff
  reflects both the P0 batch and the P1 cutscene pass (P0.1 scroll fix, P0.2 battle-NPC sprites, P1
  Nachtblau regen, P1 cutscene `CutsceneCast` + Jonas), refreshed the `_Last updated_` header, added
  a **game-layer sprite/cutscene convention note to `CLAUDE.md`** (every scene shows people;
  `NPC_SPRITES` is linter-mirrored by `GAME_SPRITES`; new NPCs must ship a sprite; `CutsceneCast`
  placement rules) so a future session doesn't regress it, and logged prompts 6–7 here. No app code
  changed in this turn.
- **Artifacts (doc pass):** `CLAUDE.md` · `docs/PROJECT_STATUS.md` · `docs/SESSION_PROMPT_LOG.md` ·
  `docs/plans/GAME_DEMO_READINESS_REVIEW.md`

## Session 136 — 2026-07-20 — Landing-page redesign (analysis → previews → ship)

- **Branch:** `claude/landing-page-redesign-iqxlja`
- **Prompt 1 (verbatim):** `> do an analysis of the landing page and improve it such that it provides the highest value to the learner and has highest conversion rate. The visuals and quality should resemble a billion dollar edutech app with excellent finesse which also includes creative elements, doodles, artistic elements and visual coherence wherever applicable. Go ahead and provide a couple of previews of the homepage for such highest standards. `
- **Response 1:** Audited `src/features/landing/LandingPage.tsx` against conversion best practice
  (biggest gaps: no product visual anywhere, no honest proof/trust signals, flat card grids, competing
  hero CTAs, the OAuth prose block killing momentum) and built two self-contained on-brand previews in
  `preview/landing-redesign/`, both reusing the shipped logo geometry and the real Wesen creature paths:
  **A "Der Textmarker"** (warm Papier editorial; the Himmelblau highlighter swipe as the page-wide
  device, doodle annotations, flashcard collage hero, scenario marquee, "Du bist hier" plateau chart,
  bento feature grid, honest content-count band) and **B "Die Nachtstadt"** (cinematic night-city hero
  with the six lit domain buildings + phone mockup of the Heute screen, trust bar, three product splits
  incl. Neuland and the word constellation, data-quality tier band, "Die Stadt wird hell, wenn du übst"
  closer). Verified both at 1280/390 px via headless Chromium, fixed badge overlap / mobile nav wrap /
  floating-chip collisions, wrote the analysis into `preview/landing-redesign/README.md`, pushed, and
  sent the founder the two HTMLs plus full-page desktop/mobile screenshots. Nothing shipped to the app
  yet; awaiting the founder's pick before implementing in `LandingPage.tsx`.
- **Artifacts:** `preview/landing-redesign/landing-a-textmarker.html` ·
  `preview/landing-redesign/landing-b-nachtstadt.html` · `preview/landing-redesign/README.md` ·
  commit `253534e`
- **Prompt 2 (verbatim):** `> provide the artifacts now here by publishing them `
- **Response 2:** Published both previews as claude.ai artifacts (adapted copies: document
  wrapper stripped, CDN font link removed since the artifact CSP blocks external hosts; the
  system-font fallback matches the shipped app, which does not self-host Inter).
- **Prompt 3 (verbatim):** `> I like preview a very much. Just make sure the logo as a whole should be horizontally aligned with the text Genauly beside it. Currently it seems as if the logo is somewhat lower compared to the Genauly text. for the landing page, add some menu items on the top like About, Sources, Help, etc. Make use of existing pages. Additionally, Stress on the landing page somewhere about the fact that the learner can specifically filter the words by various criteria and practice by custom ueben session. Finally, the page should predominantly be in English with German used only for the no-brainer or obvious stuff - the german words should be only 10-20% of the total words. ` _(mid-turn follow-up: `> in addition to the above comments and tasks, also provide an option to switch to German on the homepage just like other pages in the app`)_
- **Response 3:** Preview A revised: logo viewBox cropped to the artwork bounds (`7 12 52 52`)
  so the mark centers optically on the wordmark; nav + footer link the real pages (/about,
  /hilfe, /sources, /privacy, /terms); new "Filter what you need. Practice exactly that."
  section with a filter-rail mockup (Thema/Stufe/Wortart/Branche + Üben footer) selling the
  faceted library and custom scoped Üben sessions; all copy rewritten English-first with
  German only for obvious/brand terms; and a working EN/DE nav toggle (JS dictionary swaps
  the whole page's copy, mirroring the bilingual public pages). Verified via headless
  Chromium (EN/DE roundtrip clean, DE nav fits one line), artifact A republished at the
  same URL.
- **Artifacts (rev 2):** `preview/landing-redesign/landing-a-textmarker.html` ·
  `preview/landing-redesign/README.md`
- **Prompt 4 (verbatim):** `> if the user already logged in, the landing page cta should be go to app, not go to dashboard. also, regarding the claim "no textbook" - replace it with something else. This app is never a direct replacement for traditional learning but a smart and modern companion for learning. `
- **Response 4:** Steps headline replaced: "Three steps. No textbook." became "Three steps.
  Your smart companion." (DE "Dein smarter Begleiter."); the companion-not-replacement
  positioning rule is recorded in the preview README for all future landing copy. The
  logged-in CTA spec ("Go to app" / "Zur App" routing to `/`, replacing the live page's
  "Zum Dashboard") is recorded there too since the preview shows only the logged-out
  state. Fixed the two mobile fallouts the longer headline exposed (h2 down to 1.55rem
  below 480px; nav drops the wordmark below 520px, matching the shipped app header) and
  verified zero horizontal overflow at 390px in both languages. Artifact republished at
  the same URL.
- **Prompt 5 (verbatim):** `> looks good. the caption says "German for real life B1-B2" remove the B1-B2 there. implement the design, document the session and merge everything to main `
- **Response 5:** Removed "· B1–B2" from the hero eyebrow (both languages; footer tagline kept).
  Then implemented the approved Preview A as the real landing: `src/features/landing/LandingPage.tsx`
  rebuilt from scratch (token-based colors so dark mode works; sticky nav with anchors +
  About/Help/Sources + EN/DE LangToggle + auth-aware CTA; swiped hero + Wesen flashcard collage;
  scenario marquee; PlateauChart; bento features; filter-rail mock + custom-Üben section; dark
  numbers band; "Your smart companion." steps; the OAuth "What is Genauly?" purpose card preserved
  bilingually; FAQ; closing CTA; footer), with all copy as inline `t(en, de)` pairs and logged-in
  visitors getting "Go to app"/"Zur App". New `.landing-*` CSS (swipe/float/marquee,
  reduced-motion-safe) in `src/index.css`; fixed a transform-override bug (CSS float animation vs
  Tailwind translate/rotate) found via rendered-output verification (pnpm preview + headless
  Chromium: light/dark, EN/DE, 390/1280, logged-in). Gates: typecheck ✓, lint 0 errors, build ✓,
  test:unit 219/219, bundle 111 kB / 400 kB. Documented (PROJECT_STATUS s136 handoff; s133 handoff
  aged into the new W30 archive chunk; this log), opened a PR into main and squash-merged, then ran
  the post-merge realignment.
- **Artifacts (implementation):** `src/features/landing/LandingPage.tsx` · `src/index.css` ·
  `preview/landing-redesign/*` · `docs/PROJECT_STATUS.md` ·
  `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md` ·
  `docs/archive/PROJECT_STATUS_ARCHIVE.md` · `docs/SESSION_PROMPT_LOG.md`
- **Prompt 6 (verbatim):** `> [2 live-site screenshots] this looks different from the artifact. Make the button normal without the glow. Also, for the example card - Bewerbung, the card doesn't float as shown in the preview artifact - fix it. Save the artifact also to the repo. ` _(mid-turn follow-up: `> don't edit all the buttons' glow. Only the blue card's white button has too much glow which needs fixing.`)_
- **Response 6:** Removed the shadow from ONLY the closing blue card's white CTA (the halo the
  founder flagged); per the mid-turn correction the nav/hero/Üben-mock buttons keep their original
  `shadow-glow`. The hero "Bewerbung" collage float was converted from the CSS keyframe (present in
  the built CSS but not running on the founder's iPhone) to framer-motion (`float()` helper,
  `y: [0,-9,0]`, 7s loop, staggered delays), the same animation engine the rest of the app
  demonstrably runs on that device; the dead `.landing-float` CSS was removed. The published
  artifact's single-file copy was saved to the repo as
  `preview/landing-redesign/landing-a-artifact.html`. Verified in the production build (float
  transform sampled moving; closing-button screenshot halo-free). Gates: typecheck ✓, lint 0
  errors, build ✓, test:unit 219/219, bundle 110.8 kB. Squash-merged to main.
