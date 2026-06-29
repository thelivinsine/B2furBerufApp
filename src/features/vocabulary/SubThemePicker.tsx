import { motion } from "framer-motion";
import { ChevronRight, LayoutGrid } from "lucide-react";
import type { ExamTheme } from "@/types";
import { Card } from "@/components/ui/card";
import { vocabByTheme, vocabBySubTheme } from "@/data/vocabulary";
import { collocationsBySubTheme } from "@/data/collocations";
import { CEFR_ORDER } from "@/lib/cefr";

/** Compact CEFR span for a sub-theme, e.g. "B1–B2" or "B2". */
function cefrRange(subId: string): string | null {
  const idxs = vocabBySubTheme(subId)
    .map((v) => (v.cefr ? CEFR_ORDER.indexOf(v.cefr) : -1))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  if (!idxs.length) return null;
  const short = (s: string) => s.split(".")[0];
  const lo = short(CEFR_ORDER[idxs[0]]);
  const hi = short(CEFR_ORDER[idxs[idxs.length - 1]]);
  return lo === hi ? lo : `${lo}–${hi}`;
}

function countLine(subId: string): string {
  const words = vocabBySubTheme(subId).length;
  const cols = collocationsBySubTheme(subId).length;
  const range = cefrRange(subId);
  const parts = [`${words} Wörter`];
  if (cols) parts.push(`${cols} Kollokationen`);
  if (range) parts.push(range);
  return parts.join(" · ");
}

export function SubThemePicker({
  theme,
  onPick,
  onPickAll,
}: {
  theme: ExamTheme;
  onPick: (subId: string) => void;
  onPickAll: () => void;
}) {
  const subs = theme.subThemes ?? [];
  const totalWords = vocabByTheme(theme.id).length;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Wähle einen Bereich</h2>
        <p className="text-sm text-muted-foreground">
          Statt eines großen Stapels: klare Unterthemen, jedes einzeln übbar.
        </p>
      </div>

      <div className="space-y-2.5">
        {subs.map((st, i) => (
          <motion.button
            key={st.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onPick(st.id)}
            className="w-full text-left"
          >
            <Card className="card-hover flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.accent} text-sm font-bold text-white shadow-soft`}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{st.titleDe}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {st.title} · {countLine(st.id)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Card>
          </motion.button>
        ))}

        {/* Escape hatch: browse the whole theme as one pile (incl. untagged items). */}
        <button onClick={onPickAll} className="w-full text-left">
          <Card className="card-hover flex items-center gap-3 border-dashed p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">Gesamtes Thema</p>
              <p className="truncate text-xs text-muted-foreground">
                Alle {totalWords} Wörter auf einmal
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Card>
        </button>
      </div>
    </div>
  );
}
