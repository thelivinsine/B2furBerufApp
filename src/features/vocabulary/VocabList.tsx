import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { VocabItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useProgressStore } from "@/store/useProgressStore";
import { mastery, masteryLabel } from "@/engine/srs";
import { cn } from "@/lib/utils";
import { RelatedPanel, relatedRows } from "./RelatedPanel";

const labelMap = {
  new: { text: "neu", variant: "muted" as const },
  learning: { text: "lernen", variant: "warning" as const },
  review: { text: "wiederholen", variant: "default" as const },
  mastered: { text: "gemeistert", variant: "success" as const },
};

export function VocabList({ items }: { items: VocabItem[] }) {
  const srs = useProgressStore((s) => s.srs);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((v, i) => {
        const label = labelMap[masteryLabel(mastery(srs[v.id]))];
        const open = openId === v.id;
        const hasRelated = relatedRows(v).length > 0;
        return (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
          >
            <Card className="card-hover h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold">{v.de}</p>
                      <SpeakButton text={v.de} />
                    </div>
                    <p className="text-sm text-muted-foreground">{v.en}</p>
                    {v.plural && <p className="text-xs text-muted-foreground">Pl.: {v.plural}</p>}
                  </div>
                  <Badge variant={label.variant}>{label.text}</Badge>
                </div>
                <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
                  „{v.examples[0].de}"
                </p>

                {hasRelated && (
                  <button
                    onClick={() => setOpenId(open ? null : v.id)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    aria-expanded={open}
                  >
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
                    {open ? "Weniger" : "Verbunden"}
                  </button>
                )}
                {open && <RelatedPanel item={v} />}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
