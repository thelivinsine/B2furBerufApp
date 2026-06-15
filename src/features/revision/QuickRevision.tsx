import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Check, X, RotateCw, Trophy, ChevronRight } from "lucide-react";
import { vocabulary } from "@/data/vocabulary";
import { redemittel } from "@/data/redemittel";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { isDue, mastery } from "@/engine/srs";
import { XP } from "@/engine/scoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHeading, EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { sample, shuffle } from "@/lib/utils";

type CardItem =
  | { kind: "vocab"; de: string; en: string; id: string }
  | { kind: "redemittel"; de: string; en: string; id: string };

function buildDeck(srs: Record<string, ReturnType<typeof mastery>>): CardItem[] {
  const dueVocab = vocabulary
    .filter((v) => isDue(srs[v.id] as never))
    .map((v): CardItem => ({ kind: "vocab", de: v.de, en: v.en, id: v.id }));

  const redemittelItems = sample(redemittel, 5).map(
    (r): CardItem => ({ kind: "redemittel", de: r.de, en: r.en, id: r.id })
  );

  const combined = [...dueVocab, ...redemittelItems];
  return shuffle(combined).slice(0, 15);
}

export function QuickRevision() {
  const srs = useProgressStore((s) => s.srs);
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  const [deck] = useState(() => buildDeck(srs as never));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const card = deck[index];
  const total = deck.length;

  const grade = (isCorrect: boolean) => {
    if (card.kind === "vocab") {
      reviewVocab(card.id, isCorrect ? 4 : 0);
    } else {
      practiceRedemittel(card.id);
    }
    if (isCorrect) {
      setCorrect((c) => c + 1);
      addXp(XP.flashcard);
    }
    const next = index + 1;
    if (next >= total) {
      registerSession();
      showToast("Schnellwiederholung abgeschlossen!", "success");
      setDone(true);
    } else {
      setIndex(next);
      setFlipped(false);
    }
  };

  if (deck.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SectionHeading eyebrow="Schnellwiederholung" title="Alles auf dem neuesten Stand" />
        <EmptyState
          icon={Zap}
          title="Keine fälligen Karten"
          description="Du hast alle Vokabeln und Redemittel für heute abgehakt. Komm morgen wieder!"
        />
      </div>
    );
  }

  if (done) {
    const pctScore = Math.round((correct / total) * 100);
    return (
      <div className="space-y-4 sm:space-y-6">
        <SectionHeading eyebrow="Schnellwiederholung" title="Erledigt!" />
        <EmptyState
          icon={Trophy}
          title={`${correct} von ${total} · ${pctScore}%`}
          description={pctScore >= 70 ? "Super! Du erinnerst dich gut." : "Gut gemacht. Wiederhole morgen nochmal."}
          action={
            <Button variant="gradient" onClick={() => window.location.reload()}>
              <RotateCw className="h-4 w-4" /> Neue Runde
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeading
        eyebrow="Schnellwiederholung"
        title="Quick Review"
        description="Fällige Vokabeln und Redemittel in einer kompakten Sitzung – ideal für 5-Minuten-Pausen."
      />

      <div className="mx-auto max-w-xl space-y-5">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Karte {index + 1} von {total}</span>
            <Badge variant="muted">{card.kind === "vocab" ? "Vokabel" : "Redemittel"}</Badge>
          </div>
          <Progress value={(index / total) * 100} />
        </div>

        <div className="[perspective:1200px]" onClick={() => setFlipped((f) => !f)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                // Grid-stack both faces so the card grows to fit content rather
                // than clipping a long word/translation. min-h keeps the size.
                className="grid min-h-[13rem] w-full cursor-pointer [transform-style:preserve-3d]"
              >
                {/* Front */}
                <div className="[grid-area:1/1] flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-soft [backface-visibility:hidden]">
                  <p className="text-center text-2xl font-semibold">{card.de}</p>
                  <SpeakButton text={card.de} />
                  <p className="text-xs text-muted-foreground">Tippen zum Umdrehen</p>
                </div>
                {/* Back */}
                <div className="[grid-area:1/1] flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-surface p-6 shadow-glow [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-center text-xl font-semibold text-primary">{card.en}</p>
                  <p className="text-sm text-muted-foreground">{card.de}</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {!flipped ? (
          <Button variant="outline" className="w-full" onClick={() => setFlipped(true)}>
            Antwort zeigen <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <Button
              variant="danger"
              className="h-12 gap-2"
              onClick={() => grade(false)}
            >
              <X className="h-4 w-4" /> Nochmal
            </Button>
            <Button
              variant="success"
              className="h-12 gap-2"
              onClick={() => grade(true)}
            >
              <Check className="h-4 w-4" /> Gewusst
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
