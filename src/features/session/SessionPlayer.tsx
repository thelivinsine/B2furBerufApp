import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Trophy,
  Sparkles,
  RotateCw,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SessionBlock } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSessionStore } from "@/store/useSessionStore";
import { buildSession, difficultyForLevel } from "@/engine/session";
import { quizXp } from "@/engine/quiz";
import { XP } from "@/engine/scoring";
import { QuestionView, kindLabel } from "@/features/quiz/QuestionViews";
import { GrammarDrillCard } from "@/features/grammar/GrammarDrillCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHeading, EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import type { ThemeId } from "@/types";

interface Reinforced {
  de: string;
  en: string;
}

/**
 * The one player for a composed session (UX overhaul Phase 1). It renders any
 * block kind the composer produced (vocab/Redemittel flashcard, leveled quiz
 * question, grammar micro-drill) behind a single progress bar + XP tally, then
 * shows an end screen: XP earned, what got stronger, and one forward hook.
 * Schnellwiederholung is just this player with a short `minutes` preset.
 */
export function SessionPlayer({
  minutes,
  eyebrow = "Session",
  title = "Deine Session",
  scope,
}: {
  minutes: number;
  eyebrow?: string;
  title?: string;
  scope?: ThemeId;
}) {
  const navigate = useNavigate();
  const srs = useProgressStore((s) => s.srs);
  const mode = useSettingsStore((s) => s.mode);
  const level = useSettingsStore((s) => s.level);
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  // Build once on mount: the composer samples, so re-building each render would
  // reshuffle the deck under the learner.
  const [plan] = useState(() =>
    buildSession({ srs, mode, minutes, difficulty: difficultyForLevel(level), scope }),
  );

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [stronger, setStronger] = useState<Reinforced[]>([]);
  const [done, setDone] = useState(false);

  const total = plan.blocks.length;
  const block = plan.blocks[index];

  const pushStronger = (r: Reinforced) =>
    setStronger((list) => (list.some((x) => x.de === r.de) ? list : [...list, r]));

  const award = (xp: number) => {
    addXp(xp);
    setXpEarned((v) => v + xp);
  };

  const finish = () => {
    registerSession();
    showToast("Session abgeschlossen!", "success");
    setDone(true);
  };

  const advance = () => {
    if (index + 1 >= total) finish();
    else {
      setIndex((i) => i + 1);
      setAnswered(false);
    }
  };

  /* ---- Result handlers per block kind ---- */

  const onQuizResult = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    const q = (block as Extract<SessionBlock, { kind: "quiz" }>).question;
    if (q.sourceId && q.kind !== "matching") reviewVocab(q.sourceId, correct ? 4 : 0);
    if (correct) {
      award(quizXp(q.difficulty));
      setCorrectCount((c) => c + 1);
      if (q.kind !== "matching") pushStronger({ de: q.prompt, en: q.answer });
    }
  };

  const onGrammarResult = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    const b = block as Extract<SessionBlock, { kind: "grammar" }>;
    if (correct) {
      award(XP.grammarDrill);
      setCorrectCount((c) => c + 1);
      pushStronger({ de: b.groupLabel, en: b.drill.answer });
    }
  };

  const onFlashcardGrade = (correct: boolean) => {
    const b = block as Extract<SessionBlock, { kind: "flashcard" }>;
    if (b.source === "vocab") reviewVocab(b.sourceId, correct ? 4 : 0);
    else practiceRedemittel(b.sourceId);
    if (correct) {
      award(XP.flashcard);
      setCorrectCount((c) => c + 1);
      pushStronger({ de: b.de, en: b.en });
    }
    advance();
  };

  /* ---- Empty + end states ---- */

  if (total === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SectionHeading eyebrow={eyebrow} title="Alles erledigt" />
        <EmptyState
          icon={Sparkles}
          title="Keine fälligen Übungen"
          description="Du bist für heute durch. Komm später wieder für eine neue Runde."
          action={
            <Button variant="gradient" onClick={() => navigate("/")}>
              Zur Übersicht
            </Button>
          }
        />
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100);
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <EmptyState
          icon={Trophy}
          title={`+${xpEarned} XP · ${correctCount}/${total} richtig`}
          description={
            pct >= 70 ? "Starke Runde! Das sitzt immer besser." : "Gut gemacht. Wiederholung festigt es."
          }
        />

        {stronger.length > 0 && (
          <div className="rounded-2xl border border-success/25 bg-success/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <TrendingUp className="h-4 w-4" /> Stärker geworden
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {stronger.slice(0, 6).map((r) => (
                <Badge key={r.de} variant="success" className="max-w-full truncate">
                  {r.de}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-muted-foreground">
            Morgen: <span className="font-medium text-foreground">{plan.focus}</span> festigen.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="gradient" onClick={() => window.location.reload()}>
            <RotateCw className="h-4 w-4" /> Neue Runde
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Active block ---- */

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeading eyebrow={eyebrow} title={title} description={plan.preview} />

      <div className="mx-auto max-w-2xl space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Schritt {index + 1} von {total}
            </span>
            <span className="flex items-center gap-1 font-medium text-primary">
              <Zap className="h-3.5 w-3.5" /> {xpEarned} XP
            </span>
          </div>
          <Progress value={(index / total) * 100} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={block.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {block.kind === "flashcard" && (
              <FlashcardBlock block={block} onGrade={onFlashcardGrade} />
            )}
            {block.kind === "quiz" && (
              <>
                <div className="mb-3 flex justify-end">
                  <Badge variant="muted">{kindLabel(block.question.kind)}</Badge>
                </div>
                <QuestionView q={block.question} answered={answered} onResult={onQuizResult} />
              </>
            )}
            {block.kind === "grammar" && (
              <>
                <div className="mb-3 flex justify-end">
                  <Badge variant="muted">Grammatik · {block.groupLabel}</Badge>
                </div>
                <GrammarDrillCard drill={block.drill} onResult={onGrammarResult} suppressXp />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {block.kind !== "flashcard" && answered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="gradient" className="w-full" onClick={advance}>
              {index + 1 >= total ? "Session beenden" : "Weiter"} <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Flashcard (vocab / Redemittel recall) ---------------- */
function FlashcardBlock({
  block,
  onGrade,
}: {
  block: Extract<SessionBlock, { kind: "flashcard" }>;
  onGrade: (correct: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Badge variant="muted">{block.source === "vocab" ? "Vokabel" : "Redemittel"}</Badge>
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
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid min-h-[13rem] w-full cursor-pointer [transform-style:preserve-3d]"
        >
          {/* Front */}
          <div className="[grid-area:1/1] flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-soft [backface-visibility:hidden]">
            <p className="text-center text-2xl font-semibold">{block.de}</p>
            <SpeakButton text={block.de} />
            <p className="text-xs text-muted-foreground">Tippen zum Umdrehen</p>
          </div>
          {/* Back */}
          <div className="[grid-area:1/1] flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-surface p-6 shadow-glow [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-center text-xl font-semibold text-primary">{block.en}</p>
            {block.example && (
              <p className="text-center text-sm italic text-muted-foreground">„{block.example}"</p>
            )}
          </div>
        </motion.div>
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
          <Button variant="danger" className="h-12 gap-2" onClick={() => onGrade(false)}>
            <X className="h-4 w-4" /> Nochmal
          </Button>
          <Button variant="success" className="h-12 gap-2" onClick={() => onGrade(true)}>
            <Check className="h-4 w-4" /> Gewusst
          </Button>
        </motion.div>
      )}
    </div>
  );
}
