import { useEffect, useMemo } from "react";
import { examSets } from "@/data/examSets";
import { scenarioById } from "@/data/dialogues";
import { EXAM_BAND } from "@/engine/exam";
import { examBrief } from "@/engine/speaking";
import { useExamStore, type MockExamRun } from "@/store/useExamStore";
import { RunBar } from "./MockExamRunner";
import { ConversationRunner } from "@/features/sprechen/ConversationRunner";

/**
 * Teil Sprechen of the Modelltest (rebuilt s193).
 *
 * What this replaces: the part embedded the branching-script runner and then
 * asked the learner to TICK THEIR OWN RUBRIC CHECKBOXES, so the speaking grade
 * in a mock exam was a self-assessment of a conversation nobody had held. It
 * now runs a real spoken conversation and is graded by the same debrief the
 * trainer uses, in exam mode (a 0-100 score weighted like the oral rubric).
 *
 * The layout is a property of the TASK, not the learner (founder s193):
 * `examBrief` reads `ExamSet.stage`, so a task that works from a written
 * Aufgabe keeps it on screen ("buehne") and a task that reading would defeat
 * runs blind ("anruf"). The learner never picks.
 *
 * A conversation is not resumable mid-flight, so a reload restarts this part
 * with its full time, exactly as before.
 *
 * The RunBar is handed to the runner, which frames EVERY screen of the Teil
 * with it (s194 audit P25), not just the talking one.
 */
export function SprechenPart({ run }: { run: MockExamRun }) {
  const completePart = useExamStore((s) => s.completePart);

  const examSet = examSets.find((e) => e.id === run.plan.sprechen);
  const scenario = examSet ? scenarioById(examSet.scenarioId) : undefined;
  // The run's Niveau reaches the brief (s194 audit P6). It used to be hardcoded
  // to B2.1 inside `examBrief`, so the partner spoke and the debrief graded at
  // B2.1 in every Modelltest while the other three Teile honoured the level.
  const brief = useMemo(
    () => (examSet ? examBrief(examSet, scenario, EXAM_BAND[run.plan.level]) : null),
    [examSet, scenario, run.plan.level],
  );

  // A plan without a servable speaking set (should not happen for B1-C1, but
  // never strand the run): finish the part unscored and move on.
  const missing = !examSet || !brief;
  useEffect(() => {
    if (missing) completePart({ pct: null });
  }, [missing, completePart]);
  if (!brief) return null;

  return (
    <ConversationRunner
      brief={brief}
      header={
        <div className="shrink-0">
          {/* The conversation keeps its own pace; the shell's timer pill would
              imply a per-turn clock that does not exist. */}
          <RunBar run={run} showTimer={false} />
        </div>
      }
      // The part completes when the learner leaves the debrief, carrying
      // whatever it scored: advancing the exam the moment the score arrived
      // would unmount this screen before they had read a word of it.
      onExit={(score) => completePart({ pct: score })}
    />
  );
}
