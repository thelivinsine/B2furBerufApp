import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCw, Check, Sparkles, ChevronRight } from "lucide-react";
import type { Grade, VocabItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EmptyState } from "@/components/shared/misc";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { isDue, masteryLabel, mastery } from "@/engine/srs";
import { XP } from "@/engine/scoring";
import { shuffle } from "@/lib/utils";

const grades: { grade: Grade; label: string; variant: "danger" | "warning" | "info" | "success" }[] = [
  { grade: 0, label: "Nochmal", variant: "danger" },
  { grade: 3, label: "Schwer", variant: "warning" },
  { grade: 4, label: "Gut", variant: "info" },
  { grade: 5, label: "Einfach", variant: "success" },
];

export function Flashcards({ items }: { items: VocabItem[] }) {
  const srs = useProgressStore((s) => s.srs);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const addXp = useProgressStore((s) => s.addXp);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  // Build a study queue: due cards first, then the rest, shuffled.
  const queue = useMemo(() => {
    const due = items.filter((v) => isDue(srs[v.id]));
    const rest = items.filter((v) => !isDue(srs[v.id]));
    return [...shuffle(due), ...shuffle(rest)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);

  if (items.length === 0) {
    return <EmptyState icon={Sparkles} title="Keine Vokabeln" description="Für dieses Thema gibt es noch keine Einträge." />;
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <EmptyState
          icon={Check}
          title="Runde geschafft! 🎉"
          description={`Du hast ${reviewed} Karten wiederholt und XP gesammelt.`}
          action={
            <Button
              variant="gradient"
              onClick={() => {
                setIndex(0);
                setFlipped(false);
                setReviewed(0);
                setDone(false);
              }}
            >
              <RotateCw className="h-4 w-4" /> Neue Runde
            </Button>
          }
        />
      </motion.div>
    );
  }

  const card = queue[index];
  const m = masteryLabel(mastery(srs[card.id]));

  const grade = (g: Grade) => {
    reviewVocab(card.id, g);
    // A lapse ("Again", grade < 3) earns no XP: failing a card shouldn't grant
    // more than getting it "Easy". Successful recalls reward effort (Good > Easy).
    addXp(g < 3 ? 0 : g >= 5 ? XP.flashcardEasy : XP.flashcard);
    const nextReviewed = reviewed + 1;
    setReviewed(nextReviewed);
    if (index + 1 >= queue.length) {
      registerSession();
      showToast("Runde abgeschlossen – stark!", "success");
      setDone(true);
    } else {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Karte {index + 1} von {queue.length}</span>
          <span className="tabular-nums">{Math.round(((index) / queue.length) * 100)}%</span>
        </div>
        <Progress value={(index / queue.length) * 100} />
      </div>

      <div className="[perspective:1600px]">
        <AnimatePresence mode="wait">
          <motion.button
            key={card.id}
            onClick={() => setFlipped((f) => !f)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative block w-full text-left focus-visible:outline-none"
            aria-label="Karte umdrehen"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              // Grid-stack both faces in one cell so the card grows to fit the
              // taller (back) side instead of clipping long content. min-h keeps
              // a card-like minimum when content is short.
              className="grid min-h-[16rem] w-full sm:min-h-[18rem] [transform-style:preserve-3d]"
            >
              {/* Front */}
              <div className="relative [grid-area:1/1] flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 shadow-soft [backface-visibility:hidden]">
                <Badge variant={m === "mastered" ? "success" : m === "new" ? "muted" : "default"}>
                  {m === "new" ? "neu" : m === "learning" ? "lernen" : m === "review" ? "wiederholen" : "gemeistert"}
                </Badge>
                <div className="flex items-center gap-2">
                  <p className="text-center text-3xl font-semibold tracking-tight">
                    {card.article && <span className="text-muted-foreground">{card.article} </span>}
                    {card.de.replace(/^(der|die|das)\s/, "")}
                  </p>
                  <SpeakButton text={card.de} size="icon" variant="ghost" />
                </div>
                <p className="text-sm text-muted-foreground">{card.pron}</p>
                <p className="absolute bottom-4 text-xs text-muted-foreground">Tippen zum Umdrehen</p>
              </div>
              {/* Back */}
              <div className="[grid-area:1/1] flex flex-col justify-center gap-3 rounded-2xl border border-primary/30 bg-surface p-7 shadow-glow [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-xl font-semibold">{card.en}</p>
                <p className="text-xs text-muted-foreground">{card.context}</p>
                <div className="space-y-2 border-t border-border pt-3">
                  {card.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <SpeakButton text={ex.de} />
                      <div>
                        <p className="text-sm font-medium">{ex.de}</p>
                        <p className="text-xs text-muted-foreground">{ex.en}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.button>
        </AnimatePresence>
      </div>

      {!flipped ? (
        <Button variant="outline" className="w-full" onClick={() => setFlipped(true)}>
          Antwort zeigen <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {grades.map((g) => (
            <Button key={g.grade} variant={g.variant} onClick={() => grade(g.grade)} className="flex-col gap-0 py-2 min-h-[44px] h-auto sm:min-h-0 sm:h-10 sm:flex-row">
              {g.label}
            </Button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
