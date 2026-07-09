# Neuland brainstorm toolkit — how to research story + missions with any AI tool

_A reusable method + copy-paste prompt pack for strengthening the Neuland storyline and its
missions using ChatGPT, Gemini, NotebookLM, or Claude. Companion to `NEULAND_PRIMER.md` (the
context you paste first). Written for the founder, 2026-07-08._

---

## The method (four rules that make LLM brainstorming actually work)

Most people paste "make my game story better" and get mush. These four rules fix that:

1. **Prime with real context.** Never ask cold. Paste `NEULAND_PRIMER.md` first, every time. A
   model can only be as good as the world you hand it.
2. **Ask for a named artifact, not "ideas."** Demand a *beat sheet*, a *character bible*, a
   *mission spec that matches my scene kinds*. Named deliverables force structure and are
   comparable across tools.
3. **Force a critique loop.** After the first draft, make it attack its own work from two hostile
   seats (a language teacher and a game designer). The second pass is where quality appears.
4. **Cross-examine tools, then synthesize.** Give the same primed prompt to ChatGPT and Gemini,
   paste both answers into a third chat, and ask it to merge the best and flag the disagreements.

## Which tool for what

| Tool | Best at | How to use it here |
|---|---|---|
| **ChatGPT** (reasoning / Deep Research mode) | Broad sourced survey, long reasoning | Prompt R1 below: how shipped language-RPGs build story + variety. Turn on Deep Research. |
| **Gemini 2.5 Pro** | Huge context, Google grounding, German cultural authenticity | Paste the FULL `GAME_DESIGN.md` (not just the primer) and ask for a whole-chapter rewrite; ask it to cite live German sources for authenticity. |
| **NotebookLM** | Answers grounded ONLY in your uploaded docs; zero hallucination | Upload `GAME_CONCEPT.md`, `GAME_DESIGN.md`, `MISSION_ACTIVITY_RESEARCH.md`. Ask "what have I already decided about X?" and generate a briefing before you brainstorm. |
| **Claude (in this repo)** | Grounded in the actual schema; turns ideas into shippable missions | Paste the winning output back; I pressure-test it against the scene kinds and author it as data. |

Run the same story prompt in ChatGPT AND Gemini, then synthesize. Their blind spots differ.

---

## The prompt pack (paste `NEULAND_PRIMER.md` first, then one of these)

### S1 — The missing want (do this FIRST; everything hangs off it)
> Chapter 1 is a to-do list with no emotional pull. Give me three candidate *wants* for the
> player, each a single sentence, that a whole 6-chapter arc could pay off (e.g. a specific
> person to reunite with, a fear to overcome, a version of themselves to become). For each,
> show how it would re-color the six existing chapters WITHOUT changing their tasks, and how it
> pays off in the Chapter-6 chosen ending. Rank them by emotional power for an adult immigrant
> audience. No fantasy; ground it in real immigration truth.

### S2 — Chapter-1 story spine (Dan Harmon story circle)
> Using the Dan Harmon story circle (You, Need, Go, Search, Find, Take, Return, Change), map
> Chapter 1's six missions onto the eight beats so the chapter is a real arc, not a checklist.
> Keep every existing mission task. Tell me which mission is the "Find" (false victory) and
> which is the "Take" (the real cost). Give the chapter one line of emotional throughline the
> player feels from mission 1.1 to the Anmeldung boss.

### S3 — Character bible (make the cast matter)
> For Jonas, Frau Schmidt, Ayşe, Herr Krause, Herr Nguyen: give each a one-line WANT, a one-line
> FLAW, a running gag, a signature speech tic (real German register: what words/constructions
> they overuse), and a single scene beat in Chapter 1 where their flaw creates a small conflict
> or laugh. Then propose one two-line exchange that plants a future arc (e.g. Frau Schmidt's
> Ch.4 "greets you by name" payoff).

### S4 — Turn one weak mission into a strong one
> Here is mission 1.3 "Die SIM-Karte" [paste the mission or describe it]. Rewrite it so it has:
> (1) exactly ONE meaningful choice with a consequence that pays off two beats later; (2) a
> reason the player emotionally cares beyond "get a SIM"; (3) at least two DIFFERENT scene kinds
> from the allowed set. Output as a scene-by-scene spec (scene kind + what happens + what the
> player DOES + what they learn). Stay inside the locked design rules.

### S5 — Exercise variety audit (kill the repetition)
> Here are my 8 scene kinds [list them] and my Chapter-1 missions. For each mission, name the
> ONE signature activity it should own so no two missions feel the same, drawing on the
> transfer-appropriate-processing principle (practice the situation the way it really happens).
> Flag any mission that currently leans on the same mechanic as its neighbor and propose the
> swap. One new mechanic per mission max; the boss introduces none.

### S6 — Adversarial critique (run AFTER S1–S5)
> Attack this draft from two seats. As a telc/Goethe B2 examiner: where is the language check a
> quiz in a costume, where is the German inauthentic or wrong register, where is the difficulty
> mis-pitched for B1.1? As a veteran RPG designer: where is a choice fake (no bar, resource, or
> relationship moves), where is an NPC a cardboard cutout, where does the scene drown in text?
> List every problem, then give the single highest-impact fix.

### S7 — Cross-tool synthesis (paste two answers in)
> Below are two designs for the same Chapter-1 spine, from two different assistants. Merge them
> into one stronger version: take the best want, the best character beats, the best mission
> upgrades. Explicitly list where they DISAGREED and pick a side with a one-line reason.
> [paste answer A] --- [paste answer B]

### R1 — Research brief for ChatGPT Deep Research / Gemini
> Research how successful narrative language-learning games build (a) emotional pull and (b)
> exercise variety, and what the second-language-acquisition literature says about narrative and
> "intrinsic integration" (mechanic = learning content). Cover at least: Wagotabi, Influent,
> Duolingo Adventures/Stories, Terra Alia, and the "narrative in serious games" research. For
> each game: what the gameplay actually is, what reviews praise, what they pan. End with 10
> concrete, prioritized recommendations for a German life-sim RPG for adult immigrants. Cite
> sources.

---

## The loop, end to end
1. Paste primer → run **S1** (the want). This is the keystone; do not skip it.
2. Run **S2** and **S3** to build the arc and cast around that want.
3. Run **S4/S5** per weak mission.
4. Run **S6** to tear it apart, then revise.
5. Optionally run the same in a second tool and **S7** to synthesize.
6. Bring the result to the Genauly repo. New missions are pure data, so authoring is cheap and
   reversible.

## A caution
LLMs will happily invent charming German that is subtly wrong (register, article, idiom). Treat
every German line as a DRAFT to verify against the app's lint/provenance discipline (or a native
check). The `verify:grammar` gate exists for exactly this. Great story ideas, unverified German.
