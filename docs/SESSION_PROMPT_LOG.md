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
