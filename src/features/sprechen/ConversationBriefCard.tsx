import { ArrowRight, Mic } from "lucide-react";
import type { ConversationBrief } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AllowanceNote } from "@/features/writing/AllowanceNote";
import { useDailyAllowance } from "@/lib/aiAllowance";
import { redemittelCategories } from "@/data/redemittel";
import { cn } from "@/lib/utils";

/** German label per Redemittel category. The old runner printed the raw enum
 *  value ("suggestions") straight into a badge; the bank has always carried a
 *  `labelDe` for exactly this. */
const CATEGORY_LABEL_DE = new Map(redemittelCategories.map((c) => [c.id, c.labelDe]));

/**
 * The screen before a spoken conversation (s193).
 *
 * This is the thing that makes it an exercise rather than small talk. An LLM
 * will happily chat with a B1 learner forever: it adapts down to their level,
 * never corrects unless asked and produces no assessment. The brief is what
 * gives the conversation a task, and the Leitpunkte here are literally what the
 * debrief grades as Aufgabenerfüllung.
 *
 * Same law Schreiben already lives by (CLAUDE.md): only a task carrying a full
 * brief is served, because the AI grades against that brief.
 */
export function ConversationBriefCard({
  brief,
  onStart,
  starting,
  disabledReason,
}: {
  brief: ConversationBrief;
  onStart: () => void;
  starting?: boolean;
  /** Set when the conversation cannot start (no allowance left, offline). */
  disabledReason?: string | null;
}) {
  const allowance = useDailyAllowance("sprechen");
  const initials = brief.partner.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <Mic className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-eyebrow text-primary">Situation</p>
          <p className="truncate text-[17px] font-semibold leading-tight">{brief.title}</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sm font-bold text-sky-700 dark:text-sky-300">
              {initials || "?"}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{brief.partner.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {brief.partner.role} · {brief.partner.register === "du" ? "duzt dich" : "siezt dich"}
              </p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div>
            <p className="text-eyebrow text-muted-foreground">Das musst du schaffen</p>
            <ol className="mt-2 space-y-1.5">
              {brief.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-snug">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {brief.targetRedemittel.length > 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/20 p-4 shadow-soft dark:border-accent/10 dark:bg-accent/10">
          <p className="text-eyebrow text-accent-ink">Nützliche Redemittel</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {brief.targetRedemittel.map((r) => (
              <span
                key={r}
                className="rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-foreground"
              >
                {CATEGORY_LABEL_DE.get(r) ?? r}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="muted">{brief.level}</Badge>
        <Badge variant="muted">{brief.partner.register === "du" ? "Du-Form" : "Sie-Form"}</Badge>
        {allowance.known && (
          <AllowanceNote
            className="ml-auto"
            remaining={allowance.remaining}
            limit={allowance.limit}
            what="Gespräche"
          />
        )}
      </div>

      <div className={cn("mt-auto")}>
        <Button
          variant="gradient"
          className="w-full"
          onClick={onStart}
          disabled={starting || !!disabledReason}
        >
          {starting ? "Gespräch wird gestartet …" : "Gespräch starten"}
          {!starting && <ArrowRight className="h-4 w-4" />}
        </Button>
        <p className="mt-2.5 text-center text-[11px] leading-snug text-muted-foreground">
          {disabledReason ??
            "Dein Mikrofon wird nur während des Gesprächs benutzt. KI-Rückmeldung kann Fehler enthalten."}
        </p>
      </div>
    </div>
  );
}
