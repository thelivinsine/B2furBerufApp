import { useEffect, useRef, useState } from "react";
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
  Mic,
  Keyboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SessionBlock } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSessionStore } from "@/store/useSessionStore";
import { buildSession, difficultyForLevel } from "@/engine/session";
import { quizXp } from "@/engine/quiz";
import { XP } from "@/engine/scoring";
import { listen, recognitionSupported, type RecognitionHandle } from "@/engine/speech";
import { matchesSpoken } from "@/engine/pronounce";
import { useCountdown } from "@/lib/hooks";
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

interface SessionPlayerProps {
  minutes: number;
  eyebrow?: string;
  title?: string;
  scope?: ThemeId;
}

/**
 * The one player for a composed session (UX overhaul Phase 1). It renders any
 * block kind the composer produced (vocab/Redemittel flashcard, leveled quiz
 * question, grammar micro-drill) behind a single progress bar + XP tally, then
 * shows an end screen: XP earned, what got stronger, and one forward hook.
 * Schnellwiederholung is just this player with a short `minutes` preset.
 *
 * The wrapper only holds a run counter: "Neue Runde" bumps it, remounting the
 * run below with a fresh plan (previously a full window.location.reload(),
 * which re-booted the whole app just to reshuffle).
 */
export function SessionPlayer(props: SessionPlayerProps) {
  const [runId, setRunId] = useState(0);
  return <SessionRun key={runId} {...props} onRestart={() => setRunId((i) => i + 1)} />;
}

function SessionRun({
  minutes,
  eyebrow = "Session",
  title = "Deine Session",
  scope,
  onRestart,
}: SessionPlayerProps & { onRestart: () => void }) {
  const navigate = useNavigate();
  const srs = useProgressStore((s) => s.srs);
  const savedWords = useProgressStore((s) => s.savedWords);
  const mode = useSettingsStore((s) => s.mode);
  const level = useSettingsStore((s) => s.level);
  const recognitionEnabled = useSettingsStore((s) => s.recognitionEnabled);
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  // Build once on mount: the composer samples, so re-building each render would
  // reshuffle the deck under the learner.
  const [plan] = useState(() =>
    buildSession({
      srs,
      savedWords,
      mode,
      minutes,
      difficulty: difficultyForLevel(level),
      scope,
      speaking: recognitionEnabled && recognitionSupported(),
    }),
  );

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  // Fallback ladder (#27): after repeated STT failures the remaining speaking
  // blocks skip the mic entirely and start in the typed-input fallback.
  const sttErrorsRef = useRef(0);
  const [sttDisabled, setSttDisabled] = useState(false);
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

  const onQuizResult = (correct: boolean, latencyMs?: number) => {
    if (answered) return;
    setAnswered(true);
    const q = (block as Extract<SessionBlock, { kind: "quiz" }>).question;
    if (q.sourceId && q.kind !== "matching") reviewVocab(q.sourceId, correct ? 4 : 0, latencyMs);
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

  const onSpeakingResult = (correct: boolean, latencyMs?: number) => {
    if (answered) return;
    setAnswered(true);
    const b = block as Extract<SessionBlock, { kind: "speaking" }>;
    reviewVocab(b.sourceId, correct ? 4 : 0, latencyMs);
    if (correct) {
      award(XP.speakingDrill);
      setCorrectCount((c) => c + 1);
      pushStronger({ de: b.de, en: b.en });
    }
  };

  const onSttError = () => {
    sttErrorsRef.current += 1;
    if (sttErrorsRef.current >= 2) setSttDisabled(true);
  };

  const onFlashcardGrade = (correct: boolean, latencyMs?: number) => {
    const b = block as Extract<SessionBlock, { kind: "flashcard" }>;
    // Latency only attributes to a real SRS card (the vocab branch); the
    // Redemittel branch has no card, so the sample is dropped.
    if (b.source === "vocab") reviewVocab(b.sourceId, correct ? 4 : 0, latencyMs);
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
          <Button variant="gradient" onClick={onRestart}>
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
          {/* key={block.key} is load-bearing: it remounts the block per step, which
              resets FlashcardBlock's mount-time timer and MCQView's per-prompt timer
              (26a latency capture). */}
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
            {block.kind === "speaking" && (
              <SpeakingBlock
                block={block}
                sttDisabled={sttDisabled}
                onSttError={onSttError}
                onResult={onSpeakingResult}
              />
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

/* ---------------- Speaking production block (#27) ---------------- */

/** Max seconds the mic stays open before we grade whatever was heard. */
const LISTEN_SECONDS = 8;

/**
 * The first consumer of `listen()` (Web Speech STT). Loop: show the EN meaning,
 * learner taps the mic (STT needs a user gesture on several browsers), a soft
 * countdown caps the listening window, partials stream in, the final transcript
 * is matched tolerantly against the German target, instant feedback, grade.
 * Fallback ladder: no ctor / permission denied / hard error flips this block to
 * a typed input; `sttDisabled` (repeated failures) starts there directly.
 */
function SpeakingBlock({
  block,
  sttDisabled,
  onSttError,
  onResult,
}: {
  block: Extract<SessionBlock, { kind: "speaking" }>;
  sttDisabled: boolean;
  onSttError: () => void;
  onResult: (correct: boolean, latencyMs?: number) => void;
}) {
  const [stage, setStage] = useState<"prompt" | "listening" | "typed">(
    sttDisabled ? "typed" : "prompt",
  );
  const [micFailed, setMicFailed] = useState(sttDisabled);
  const [noSpeech, setNoSpeech] = useState(false);
  const [partial, setPartial] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [outcome, setOutcome] = useState<{ correct: boolean; heard: string } | null>(null);

  // Latency = block mount (prompt render) to the graded answer, spanning the
  // think stage like the 26a MCQ semantics. The block remounts per block.key.
  const startRef = useRef(performance.now());
  const handleRef = useRef<RecognitionHandle | null>(null);
  const partialRef = useRef("");
  const evaluatedRef = useRef(false);

  const countdown = useCountdown(LISTEN_SECONDS, {
    onExpire: () => handleRef.current?.stop(),
  });

  // Unmount: never let a late recognition event grade a stale block. The
  // effect body re-arms the flag because StrictMode's dev double-invoke runs
  // this cleanup once on a component that stays mounted.
  useEffect(() => {
    evaluatedRef.current = false;
    return () => {
      evaluatedRef.current = true;
      handleRef.current?.stop();
    };
  }, []);

  const evaluate = (transcript: string) => {
    if (evaluatedRef.current) return;
    evaluatedRef.current = true;
    handleRef.current?.stop();
    handleRef.current = null;
    countdown.pause();
    const correct = matchesSpoken(transcript, block.de);
    setOutcome({ correct, heard: transcript.trim() });
    onResult(correct, Math.round(performance.now() - startRef.current));
  };

  const flipToTyped = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    countdown.pause();
    setStage("typed");
  };

  const startListening = () => {
    setNoSpeech(false);
    setPartial("");
    partialRef.current = "";
    const handle = listen({
      onPartial: (text) => {
        partialRef.current = text;
        setPartial(text);
      },
      onFinal: (text) => evaluate(text),
      onError: (err) => {
        if (evaluatedRef.current) return;
        handleRef.current = null;
        countdown.pause();
        if (err === "aborted") return; // our own stop; onEnd handles the rest
        if (err === "no-speech") {
          setStage("prompt");
          setNoSpeech(true);
          return;
        }
        // Hard failure (not-allowed, network, audio-capture, ...): typed fallback.
        setMicFailed(true);
        onSttError();
        setStage("typed");
      },
      onEnd: () => {
        // A cleared handle means an error handler (or a voluntary flip to
        // typing) already routed this attempt; onError is always followed by
        // onEnd, which must not drag the stage back.
        if (evaluatedRef.current || !handleRef.current) return;
        // Window closed without a final result: grade the best partial, or
        // return to the prompt when nothing was heard at all.
        if (partialRef.current.trim()) evaluate(partialRef.current);
        else {
          handleRef.current = null;
          countdown.pause();
          setStage("prompt");
          setNoSpeech(true);
        }
      },
    });
    if (!handle) {
      setMicFailed(true);
      onSttError();
      setStage("typed");
      return;
    }
    handleRef.current = handle;
    setStage("listening");
    countdown.reset(LISTEN_SECONDS);
    countdown.start();
  };

  const submitTyped = () => {
    if (typedAnswer.trim()) evaluate(typedAnswer);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Badge variant="muted">Sprechen</Badge>
      </div>

      <div className="flex min-h-[13rem] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sag es auf Deutsch:
        </p>
        <p className="text-center text-2xl font-semibold">{block.en}</p>
        {block.example && (
          <p className="text-center text-sm italic text-muted-foreground">„{block.example}"</p>
        )}
        {stage === "listening" && (
          <div className="flex flex-col items-center gap-1 pt-1">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <Mic className="h-4 w-4 animate-pulse" /> Ich höre zu … ({countdown.remaining}s)
            </p>
            {partial && <p className="text-sm text-muted-foreground">„{partial}"</p>}
          </div>
        )}
      </div>

      {outcome ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 ${
            outcome.correct ? "border-success/25 bg-success/5" : "border-danger/25 bg-danger/5"
          }`}
        >
          <p
            className={`flex items-center gap-2 text-sm font-semibold ${
              outcome.correct ? "text-success" : "text-danger"
            }`}
          >
            {outcome.correct ? (
              <>
                <Check className="h-4 w-4" /> Gut gesagt!
              </>
            ) : (
              <>
                <X className="h-4 w-4" /> Nicht ganz.
              </>
            )}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-semibold">{block.de}</span>
            <SpeakButton text={block.de} />
          </div>
          {!outcome.correct && outcome.heard && (
            <p className="mt-1 text-sm text-muted-foreground">Deine Antwort: „{outcome.heard}"</p>
          )}
        </motion.div>
      ) : stage === "prompt" ? (
        <div className="space-y-2">
          {noSpeech && (
            <p className="text-center text-sm text-muted-foreground">
              Nichts gehört. Versuch es nochmal oder tippe deine Antwort.
            </p>
          )}
          <Button variant="gradient" className="h-12 w-full gap-2" onClick={startListening}>
            <Mic className="h-4 w-4" /> Jetzt sprechen
          </Button>
          <Button variant="ghost" size="sm" className="w-full gap-2" onClick={flipToTyped}>
            <Keyboard className="h-4 w-4" /> Lieber tippen
          </Button>
        </div>
      ) : stage === "listening" ? (
        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={() => handleRef.current?.stop()}
        >
          Fertig
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            {micFailed
              ? "Mikrofon nicht verfügbar. Tippe deine Antwort."
              : "Tippe, was du sagen wolltest."}
          </p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTyped()}
              placeholder="Deine Antwort auf Deutsch …"
              className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
            />
            <Button variant="gradient" className="h-11" onClick={submitTyped}>
              Prüfen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Flashcard (vocab / Redemittel recall) ---------------- */
function FlashcardBlock({
  block,
  onGrade,
}: {
  block: Extract<SessionBlock, { kind: "flashcard" }>;
  onGrade: (correct: boolean, latencyMs?: number) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  // Latency = mount (front render) to first flip (reveal). The block remounts
  // per block.key, so a mount-time ref is the render start; capture once and
  // don't overwrite on flip-back.
  const startRef = useRef(performance.now());
  const latencyRef = useRef<number | null>(null);
  const captureFlipLatency = () => {
    if (latencyRef.current == null) {
      latencyRef.current = Math.round(performance.now() - startRef.current);
    }
  };

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
        onClick={() => {
          captureFlipLatency();
          setFlipped((f) => !f);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            captureFlipLatency();
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
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            captureFlipLatency();
            setFlipped(true);
          }}
        >
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
            onClick={() => onGrade(false, latencyRef.current ?? undefined)}
          >
            <X className="h-4 w-4" /> Nochmal
          </Button>
          <Button
            variant="success"
            className="h-12 gap-2"
            onClick={() => onGrade(true, latencyRef.current ?? undefined)}
          >
            <Check className="h-4 w-4" /> Gewusst
          </Button>
        </motion.div>
      )}
    </div>
  );
}
