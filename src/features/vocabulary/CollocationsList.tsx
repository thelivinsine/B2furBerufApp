import { motion } from "framer-motion";
import type { Collocation } from "@/types";
import { collocations, collocationsByTheme } from "@/data/collocations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/shared/SpeakButton";

export function CollocationsList({ theme }: { theme: string }) {
  const items: Collocation[] =
    theme === "all" ? collocations : collocationsByTheme(theme);

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Keine Kollokationen für dieses Thema.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((c, i) => (
        <motion.div
          key={c.id}
          className="min-w-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.02, 0.3) }}
        >
          <Card className="card-hover h-full">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="min-w-0 truncate font-semibold">{c.full}</p>
                    <SpeakButton text={c.full} className="shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground">{c.en}</p>
                </div>
                {c.register === "formal" && (
                  <Badge variant="accent" className="shrink-0">
                    formell
                  </Badge>
                )}
              </div>
              <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
                „{c.example.de}"
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
