import { User, Users } from "lucide-react";
import type { Speaker } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SPEAKER_LABEL: Record<Speaker, string> = {
  partner: "Partner:in",
  examiner: "Prüfer:in",
  narrator: "Erzähler",
};

interface SpeakerLineProps {
  speaker: Speaker;
  line: string;
  gloss?: string;
}

export function SpeakerLine({ speaker, line, gloss }: SpeakerLineProps) {
  const isExaminer = speaker === "examiner";
  return (
    <Card className={cn(
      "border",
      isExaminer && "border-accent/40 bg-accent/5",
      speaker === "narrator" && "border-dashed border-border bg-surface/40",
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-2.5">
          <div className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isExaminer ? "bg-accent/12 text-accent" : "bg-primary/12 text-primary",
          )}>
            {isExaminer ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {SPEAKER_LABEL[speaker]}
            </p>
            <p className="mt-0.5 font-medium">{line}</p>
            {gloss && <p className="mt-1 text-xs italic text-muted-foreground">{gloss}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
