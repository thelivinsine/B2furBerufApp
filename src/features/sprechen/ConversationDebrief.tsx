import { useState } from "react";
import { Check, RotateCw } from "lucide-react";
import type { ConversationBrief } from "@/types";
import type { DebriefResult } from "@/lib/speaking";
import {
  CorrectionToggle,
  FixTiles,
  MarkedParagraphs,
  MAX_FIX_TILES,
  useCorrectionDiff,
  type CorrectionViewMode,
} from "@/features/writing/correction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { redemittelCategories } from "@/data/redemittel";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL_DE = new Map(redemittelCategories.map((c) => [c.id, c.labelDe]));

/**
 * What the learner gets after speaking (s191), and the reason the whole feature
 * is worth building.
 *
 * Three things, in this order: did you get the job done (the brief's
 * Leitpunkte, which is what the exam calls Aufgabenerfüllung), what you
 * actually said with its correction, and which target Redemittel you reached
 * for. Nothing else. There is deliberately no score on this screen even in exam
 * mode: a result is shown in ONE place per page (founder s188), and that place
 * is the Verlauf.
 *
 * The correction is NOT a fourth copy of the correction card. It is literally
 * `features/writing/correction.tsx` — the same toggle, the same coral/green
 * marks, the same Himmelblau fix tiles — because a correction must look
 * identical whichever trainer produced it (s172). Speaking is now its fourth
 * caller.
 */
export function ConversationDebrief({
  brief,
  result,
  onRetry,
  onDone,
}: {
  brief: ConversationBrief;
  result: DebriefResult;
  onRetry: () => void;
  onDone: () => void;
}) {
  const [view, setView] = useState<CorrectionViewMode>("orig");
  const { paragraphs, changes } = useCorrectionDiff(
    result.original ?? "",
    result.corrected ?? result.original ?? "",
  );

  const goalsMet = result.goalsMet ?? brief.goals.map(() => false);
  const redemittelUsed = result.redemittelUsed ?? brief.targetRedemittel.map(() => false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div>
        <p className="text-eyebrow text-primary">Rückmeldung</p>
        <p className="text-[17px] font-semibold leading-tight">{brief.title}</p>
      </div>

      {/* ONE inner region scrolls; the header above and the actions below are
          pinned, which is the exam's stage treatment. */}
      <div className="slim-scrollbar mask-fade-y flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <Card>
          <CardContent className="space-y-2.5 p-4">
            <p className="text-eyebrow text-muted-foreground">Deine Ziele</p>
            {brief.goals.map((g, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 text-sm leading-snug",
                  !goalsMet[i] && "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                    goalsMet[i]
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {goalsMet[i] ? <Check className="h-3 w-3" strokeWidth={3.5} /> : i + 1}
                </span>
                <span>{g}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {result.insight && (
          <Card>
            <CardContent className="p-4">
              <p className="text-eyebrow text-muted-foreground">Tipp</p>
              <p className="mt-1.5 text-sm leading-relaxed">{result.insight}</p>
            </CardContent>
          </Card>
        )}

        {(result.original ?? "").trim() && (
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-eyebrow text-muted-foreground">Deine Worte</p>
                <CorrectionToggle view={view} onChange={setView} />
              </div>
              <MarkedParagraphs paragraphs={paragraphs} view={view} />
              {changes.length > 0 ? (
                <FixTiles changes={changes} max={MAX_FIX_TILES} />
              ) : (
                <p className="text-sm font-medium text-success">
                  Sprachlich fehlerfrei. Stark!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {brief.targetRedemittel.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-eyebrow text-muted-foreground">Redemittel</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {brief.targetRedemittel.map((r, i) => (
                  <span
                    key={r}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs",
                      redemittelUsed[i]
                        ? "bg-surface font-semibold text-success"
                        : "bg-muted font-medium text-muted-foreground",
                    )}
                  >
                    {redemittelUsed[i] && <Check className="h-3 w-3" strokeWidth={3} />}
                    {CATEGORY_LABEL_DE.get(r) ?? r}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            <RotateCw className="h-4 w-4" /> Nochmal
          </Button>
          <Button variant="gradient" className="flex-1" onClick={onDone}>
            Weiter
          </Button>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
          KI-Rückmeldung kann Fehler enthalten.
        </p>
      </div>
    </div>
  );
}
