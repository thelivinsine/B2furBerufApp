import { useEffect } from "react";
import { examSets } from "@/data/examSets";
import { scenarioById } from "@/data/dialogues";
import { useExamStore, type MockExamRun } from "@/store/useExamStore";
import { RunBar } from "./MockExamRunner";
import { ExamRunner } from "./ExamRunner";

/**
 * Teil Sprechen: the existing dialogue exam runner, embedded. It keeps its
 * own clock and self-scoring debrief (that rubric IS the speaking grade); the
 * shell chrome therefore hides its timer pill. A dialogue is not resumable
 * mid-conversation, so a reload restarts this part with its full time.
 */
export function SprechenPart({ run }: { run: MockExamRun }) {
  const completePart = useExamStore((s) => s.completePart);

  const examSet = examSets.find((e) => e.id === run.plan.sprechen);
  const scenario = examSet ? scenarioById(examSet.scenarioId) : undefined;

  // A plan without a servable speaking set (should not happen for B1-C1, but
  // never strand the run): finish the part unscored and move on.
  const missing = !examSet || !scenario;
  useEffect(() => {
    if (missing) completePart({ pct: null });
  }, [missing, completePart]);
  if (!examSet || !scenario) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <RunBar run={run} showTimer={false} />
      <ExamRunner
        examSet={examSet}
        scenario={scenario}
        onBack={() => completePart({ pct: null })}
        embedded
        onFinish={(pct) => completePart({ pct })}
      />
    </div>
  );
}
