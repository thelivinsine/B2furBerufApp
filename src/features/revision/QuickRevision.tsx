import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Check, X, RotateCw, Trophy, ChevronRight } from "lucide-react";
import type { LearningMode, SrsCard } from "@/types";
import { vocabulary } from "@/data/vocabulary";
import { themeById } from "@/data/themes";
import { redemittel } from "@/data/redemittel";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSessionStore } from "@/store/useSessionStore";
import { isDue, mastery, reviewWeight } from "@/engine/srs";
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

/** The CEFR band with the lowest mean mastery among started cards (the learner's
 *  current weak spot), or null when nothing has been studied yet. */
function weakestBand(srs: Record<string, SrsCard>): string | null {
  const sum: Record<string, number> = {};
  const count: Record<string, number> = {};
  for (const v of vocabulary) {
    if (!v.cefr || !srs[v.id]) continue; // only started cards inform the weak band
    sum[v.cefr] = (sum[v.cefr] ?? 0) + mastery(srs[v.id]);
    count[v.cefr] = (count[v.cefr] ?? 0) + 1;
  }
  let weak: string | null = null;
  let lowest = Infinity;
  for (const band in count) {
    const mean = sum[band] / count[band];
    if (mean < lowest) {
      lowest = mean;
      weak = band;
    }
  }
  return weak;
}

/**
 * Build the review deck, weighted for the active Mode lens and the learner's
 * weak CEFR band (Taxonomy Phase 4 adaptive review). Selection is weighted, not
 * walled: every due card can still appear, but mode-relevant + weaker + weak-band
 * cards are far likelier to be picked. `mode === "both"` falls back to pure
 * mastery weighting (no lens boost).
 */
function buildDeck(srs: Record<string, SrsCard>, mode: LearningMode): CardItem[] {
  const weakBand = weakestBand(srs);

  const dueVocab = vocabulary
    .filter((v) => isDue(srs[v.id]))
    .map((v) => {
      const ctx = themeById(v.themeId)?.context ?? "both";
      const modeMatch = mode !== "both" && (ctx === mode || ctx === "both");
      const levelMatch = !!weakBand && v.cefr === weakBand;
      const w = reviewWeight(srs[v.id], { modeMatch, levelMatch, jitter: Math.random() * 0.5 });
      return { v, w };
    })
    .sort((a, b) => b.w - a.w)
    .slice(0, 12)
    .map(({ v }): CardItem => ({ kind: "vocab", de: v.de, en: v.en, id: v.id }));

  const redemittelItems = sample(redemittel, 3).map(
    (r): CardItem => ({ kind: "redemittel", de: r.de, en: r.en, id: r.id })
  );

  // Light shuffle for presentation variety; the weighting already chose *which*
  // cards make the cut, so order no longer needs to be strictly by priority.
  return shuffle([...dueVocab, ...redemittelItems]).slice(0, 15);
}

export function QuickRevision() {
  const srs = useProgressStore((s) => s.srs);
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);
  const mode = useSettingsStore((s) => s.mode);

  const [deck] = useState(() => buildDeck(srs, mode));
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
        title="Schnelle Runde"
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

        <div
          className="[perspective:1200px]"
          role="button"
          tabIndex={0}
          aria-label="Karte umdrehen"
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
        >
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
