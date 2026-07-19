import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  ArrowUp,
  Trophy,
  Sparkles,
  RotateCw,
  Flame,
  Mic,
  Keyboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Grade, SessionBlock } from "@/types";
import { useProgressStore, useTodayXp } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSessionStore } from "@/store/useSessionStore";
import { buildSession, buildScopedSession, difficultyForLevel, type ContentScope } from "@/engine/session";
import { cardLevel, leveledUp } from "@/engine/collection";
import { quizXp } from "@/engine/quiz";
import { XP } from "@/engine/scoring";
import { listen, recognitionSupported, ttsSupported, type RecognitionHandle } from "@/engine/speech";
import { matchesSpoken } from "@/engine/pronounce";
import { gradeTyped, gradeTypedAny, type TypedGrade } from "@/engine/typing";
import { ReadingBlock } from "@/features/session/ReadingBlock";
import { useCountdown } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { QuestionView, kindLabel } from "@/features/quiz/QuestionViews";
import { GrammarDrillCard } from "@/features/grammar/GrammarDrillCard";
import { vocabById } from "@/data/vocabulary";
import { genderOf, type Gender } from "@/components/artikel/gender";
import { ArtikelEffect } from "@/components/artikel/ArtikelEffect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHeading, EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { Gloss } from "@/features/shared/Gloss";
import { FeedbackFullButton } from "@/components/layout/FeedbackButton";
import type { ThemeId } from "@/types";

/** A word practiced this session, rendered as a collectible card on the end
 *  screen. `up` marks a collection-level increase (Phase 2.4 game contract). */
interface LootItem {
  de: string;
  en: string;
  level: number;
  up: boolean;
}

interface SessionPlayerProps {
  minutes: number;
  eyebrow?: string;
  title?: string;
  scope?: ThemeId;
  /** Mission focus: the exact vocab + Redemittel a Neuland mission exercises. */
  focus?: { vocabIds: string[]; redemittelIds: string[] };
  /** Grammatik lesson Üben (`?grammar=`): pin the studied grammar topic. */
  grammarTopicId?: string;
  /**
   * Bibliothek Üben (`?src=lib`): practise ONLY this content type, drawn from
   * `libraryIds` (the tab's exact filtered items). Takes over the whole session
   * when set, so Redemittel Üben is Redemittel-only, a Grammatik group is its
   * drills only, etc. (founder 2026-07-13).
   */
  contentScope?: ContentScope;
  libraryIds?: string[];
}

/**
 * The one player for a composed session (UX overhaul Phase 1). It renders any
 * block kind the composer produced (vocab/Redemittel flashcard, leveled quiz
 * question, grammar micro-drill) as a full-screen focus stage (Phase 2): one
 * block per screen, a thin progress bar, a combo counter, then a loot-drop end
 * screen (ring fill, collected words as leveled cards, one forward hook).
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
  scope,
  focus,
  grammarTopicId,
  contentScope,
  libraryIds,
  onRestart,
}: SessionPlayerProps & { onRestart: () => void }) {
  const navigate = useNavigate();
  // Exit returns the learner to wherever they launched Üben from (Bibliothek,
  // Heute, a Grammatik lesson, Fortschritt, …), not always the dashboard. Every
  // in-app entry point pushes a history entry, so React Router's history index
  // is > 0 when there is a previous route to go back to; a deep link or fresh
  // load (index 0, no app history) falls back to the overview.
  const exit = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate("/");
  };
  const srs = useProgressStore((s) => s.srs);
  const savedWords = useProgressStore((s) => s.savedWords);
  const mode = useSettingsStore((s) => s.mode);
  const level = useSettingsStore((s) => s.level);
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const recognitionEnabled = useSettingsStore((s) => s.recognitionEnabled);
  const addXp = useProgressStore((s) => s.addXp);
  const todayXp = useTodayXp();
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);
  const setFocusMode = useSessionStore((s) => s.setFocusMode);

  // Build once on mount: the composer samples, so re-building each render would
  // reshuffle the deck under the learner.
  const [plan] = useState(() =>
    contentScope
      ? buildScopedSession(contentScope, libraryIds ?? [], {
          srs,
          minutes,
          difficulty: difficultyForLevel(level),
        })
      : buildSession({
          srs,
          savedWords,
          mode,
          minutes,
          difficulty: difficultyForLevel(level),
          scope,
          focus,
          grammarTopicId,
          speaking: recognitionEnabled && recognitionSupported(),
          listening: ttsSupported(),
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
  const [combo, setCombo] = useState(0);
  const [loot, setLoot] = useState<LootItem[]>([]);
  const [done, setDone] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);
  // Gender reveal effect (Artikel-Visuals Phase 3): plays over the stage on a
  // CORRECT noun answer. Retrieval is where the evidence says the moment lands.
  const [genderFx, setGenderFx] = useState<{ gender: Gender; play: number }>({
    gender: "die",
    play: 0,
  });

  const total = plan.blocks.length;
  const block = plan.blocks[index];

  // Focus mode (Phase 2.1): a full-screen stage while a block is on screen; the
  // chrome returns on the end/empty screen (and when this run unmounts).
  useLayoutEffect(() => {
    setFocusMode(!done && total > 0);
    return () => setFocusMode(false);
  }, [done, total, setFocusMode]);

  const award = (xp: number) => {
    addXp(xp);
    setXpEarned((v) => v + xp);
  };

  // Combo (Phase 2.3): consecutive-correct counter, resets on a miss. Also owns
  // the correct tally so every block kind funnels through one place.
  const registerResult = (correct: boolean) => {
    if (correct) setCorrectCount((c) => c + 1);
    setCombo((c) => (correct ? c + 1 : 0));
  };

  // Fire the gender reveal effect for a correct answer, but only when the SRS
  // source is a noun with an article (looked up in the bank). Non-nouns and
  // Redemittel/collocation cards have no gender, so nothing plays. Never blocks
  // the Weiter flow: it is a fire-and-forget overlay.
  const fireGenderEffect = (sourceId: string) => {
    const gender = genderOf(vocabById(sourceId) ?? {});
    if (gender) setGenderFx((f) => ({ gender, play: f.play + 1 }));
  };

  // Collect a practiced word as loot (Phase 2.4/2.5): read the card level before
  // and after the review so the end screen can mark level-ups. reviewVocab writes
  // synchronously, so getState() straddles the update.
  const captureLoot = (
    sourceId: string,
    de: string,
    en: string,
    grade: Grade,
    latencyMs?: number,
  ) => {
    const before = useProgressStore.getState().srs[sourceId];
    reviewVocab(sourceId, grade, latencyMs);
    const after = useProgressStore.getState().srs[sourceId];
    setLoot((list) =>
      list.some((x) => x.de === de)
        ? list
        : [...list, { de, en, level: cardLevel(after), up: leveledUp(before, after) }],
    );
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
    registerResult(correct);
    // Only grade FSRS / capture loot when the answer is a real vocab card. Some
    // generated questions (collocation fill, word order) carry a collocation
    // (`c_*`) sourceId; writing an SRS card under that id would create spaced-
    // repetition state the Sammlung/collection code never expects. Those award
    // XP + combo only, like a collocation recognition card.
    if (q.sourceId && q.kind !== "matching" && vocabById(q.sourceId)) {
      captureLoot(q.sourceId, q.prompt, q.answer, correct ? 4 : 0, latencyMs);
    }
    if (correct) award(quizXp(q.difficulty));
  };

  const onGrammarResult = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    registerResult(correct);
    if (correct) award(XP.grammarDrill);
  };

  const onSpeakingResult = (correct: boolean, latencyMs?: number) => {
    if (answered) return;
    setAnswered(true);
    const b = block as Extract<SessionBlock, { kind: "speaking" }>;
    registerResult(correct);
    captureLoot(b.sourceId, b.de, b.en, correct ? 4 : 0, latencyMs);
    if (correct) {
      fireGenderEffect(b.sourceId);
      award(XP.speakingDrill);
    }
  };

  // Typed forward recall (4.2): the three-tier verdict maps onto the SRS Grade
  // scale so near-misses feed FSRS as "Hard" (3), not a clean pass or an Again.
  // Combo/XP only reward a full "correct"; "almost" still schedules gently.
  const onTypingResult = (grade: TypedGrade, latencyMs?: number) => {
    if (answered) return;
    setAnswered(true);
    const b = block as Extract<SessionBlock, { kind: "typing" }>;
    const srsGrade: Grade =
      grade.verdict === "correct" ? 4 : grade.verdict === "almost" ? 3 : 0;
    registerResult(grade.verdict === "correct");
    captureLoot(b.sourceId, b.de, b.en, srsGrade, latencyMs);
    if (grade.verdict === "correct") {
      fireGenderEffect(b.sourceId);
      award(XP.flashcard);
    }
  };

  const onSttError = () => {
    sttErrorsRef.current += 1;
    if (sttErrorsRef.current >= 2) setSttDisabled(true);
  };

  // Lesen/Hören (4.4): authentic-input comprehension. XP per correct check;
  // the whole block registers ONE aggregate tally result at completion (so a
  // multi-check block never inflates the correct/total ratio). It never touches
  // vocab FSRS: reading is comprehension practice, not a graded SRS card.
  const onReadingCorrectCheck = () => award(XP.readingCheck);
  const onReadingComplete = (passed: boolean) => {
    if (answered) return;
    setAnswered(true);
    registerResult(passed);
  };

  const onFlashcardGrade = (correct: boolean, latencyMs?: number) => {
    const b = block as Extract<SessionBlock, { kind: "flashcard" }>;
    registerResult(correct);
    // Latency + loot only attribute to a real SRS card (the vocab branch); the
    // Redemittel branch records a "seen"; collocation cards are recognition-only
    // (Bibliothek Üben) and write no progress state, just XP.
    if (b.source === "vocab") captureLoot(b.sourceId, b.de, b.en, correct ? 4 : 0, latencyMs);
    else if (b.source === "redemittel") practiceRedemittel(b.sourceId);
    if (correct) {
      // Only vocab cards carry an article; the helper no-ops for the rest.
      if (b.source === "vocab") fireGenderEffect(b.sourceId);
      award(XP.flashcard);
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
            <Button variant="gradient" onClick={exit}>
              Zurück
            </Button>
          }
        />
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100);
    const goalPercent = Math.round(Math.min(todayXp / Math.max(goal, 1), 1) * 100);
    return (
      <div className="mx-auto max-w-xl space-y-6 py-4">
        {/* Loot drop: the daily ring fills, then the XP tally lands. */}
        <div className="flex flex-col items-center gap-3 text-center">
          <RewardRing percent={goalPercent} />
          <div>
            <p className="text-2xl font-bold tabular-nums">+{xpEarned} XP</p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {correctCount}/{total} richtig · {pct >= 70 ? "starke Runde" : "gut gemacht"}
            </p>
          </div>
        </div>

        {loot.length > 0 && (
          <div>
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-reward">
              Gesammelt
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {loot.map((item, i) => (
                <LootCard key={item.de} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Morgen: <span className="font-medium text-foreground">{plan.focus}</span> festigen.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="gradient" onClick={onRestart}>
            <RotateCw className="h-4 w-4" /> Neue Runde
          </Button>
          <Button variant="outline" onClick={exit}>
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Active block (full-screen focus stage, Phase 2.2) ---- */

  return (
    <div className="flex min-h-screen flex-col py-3">
      {/* Top rail: exit, thin progress, combo / XP. */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExitConfirm(true)}
          aria-label="Session verlassen"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <Progress value={(index / total) * 100} className="flex-1" />
        {combo >= 3 ? (
          <motion.span
            key={combo}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex shrink-0 items-center gap-1 rounded-full bg-reward-bg px-2.5 py-1 text-xs font-bold text-reward"
          >
            <Flame className="h-3.5 w-3.5" /> ×{combo}
          </motion.span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" /> {xpEarned}
          </span>
        )}
      </div>

      {/* Center stage: one block per screen, slide transitions. The gender
          reveal effect overlays this stage on a correct noun answer (Artikel-
          Visuals Phase 3); pointer-events-none, so it never blocks the block. */}
      <div className="relative flex flex-1 flex-col justify-center py-4">
        <ArtikelEffect gender={genderFx.gender} play={genderFx.play} />
        <AnimatePresence mode="wait">
          {/* key={block.key} is load-bearing: it remounts the block per step, which
              resets FlashcardBlock's mount-time timer and MCQView's per-prompt timer
              (26a latency capture). */}
          <motion.div
            key={block.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            // Above the reveal effect, so the burst/bloom/shatter radiates from
            // BEHIND the opaque block card instead of crossing its text.
            className="relative z-10"
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
            {block.kind === "typing" && (
              <TypingBlock block={block} onResult={onTypingResult} />
            )}
            {block.kind === "reading" && (
              <ReadingBlock
                block={block}
                onCorrectCheck={onReadingCorrectCheck}
                onComplete={onReadingComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action: advance after a non-flashcard answer. */}
      <div className="min-h-[3.5rem]">
        {block.kind !== "flashcard" && answered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="gradient" className="h-12 w-full" onClick={advance}>
              {index + 1 >= total ? "Session beenden" : "Weiter"} <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Feedback stays reachable inside a practice session (founder 2026-07-13):
          there is room here, so it shows the full labelled button. */}
      <div className="flex justify-center pb-safe pt-1">
        <FeedbackFullButton />
      </div>

      {/* Exit confirm overlay (uses the locked dialog-overlay token). */}
      <AnimatePresence>
        {exitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-dialog-overlay p-6"
            onClick={() => setExitConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-2xl border border-border bg-surface p-5 text-center shadow-elevated-soft"
            >
              <p className="font-semibold">Session beenden?</p>
              <p className="mt-1 text-sm text-muted-foreground">Dein Fortschritt bleibt gespeichert.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setExitConfirm(false)}>
                  Weiter üben
                </Button>
                <Button variant="gradient" onClick={exit}>
                  Beenden
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- End-screen loot (Phase 2.5) ---------------- */

/** The daily-goal ring, animated fill in reward-gold, with a trophy center. */
function RewardRing({ percent }: { percent: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="hsl(var(--reward))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - percent / 100) }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Trophy className="h-8 w-8 text-reward" />
      </div>
    </div>
  );
}

/** A practiced word as a collectible card; leveled-up cards glow reward-gold. */
function LootCard({ item, index }: { item: LootItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.05, type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "rounded-xl border p-3",
        item.up ? "border-reward/40 bg-reward-bg" : "border-border bg-surface",
      )}
    >
      <p className="truncate text-sm font-semibold">{item.de}</p>
      <p className="truncate text-xs text-muted-foreground">{item.en}</p>
      <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-reward">
        Lv {item.level}
        {item.up && <ArrowUp className="h-3 w-3" />}
      </div>
    </motion.div>
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
 * "Anzeigen" reveals the answer and grades it as a miss (evaluate("")), so a
 * learner who does not know the word can always move on; a give-up must not feed
 * the scheduler a pass, mirroring the typed block's reveal.
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
        <p className="w-full break-words text-center text-3xl font-semibold sm:text-4xl">{block.en}</p>
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
            <Gloss de={block.de} en={block.en} className="text-base font-semibold" />
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
          <Button variant="ghost" size="sm" className="w-full" onClick={() => evaluate("")}>
            Anzeigen
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
          <Button variant="ghost" size="sm" className="w-full" onClick={() => evaluate("")}>
            Anzeigen
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Typed forward recall (4.2) ---------------- */

/** German feedback line for an "almost" verdict, keyed by the miss reason. */
const TYPED_ALMOST_NOTE: Record<NonNullable<TypedGrade["reason"]>, string> = {
  article: "Fast. Achte auf den Artikel.",
  reflexive: "Fast. Das Reflexivpronomen „sich“ fehlt.",
  spelling: "Fast. Kleiner Tippfehler.",
};

/**
 * Typed forward recall: the EN meaning is shown display-size, the learner types
 * the German from memory, and `gradeTyped` returns a three-tier verdict that the
 * player maps onto the SRS grade scale. "Anzeigen" reveals the answer and grades
 * it as a miss (a give-up must not feed the scheduler a pass). Latency spans the
 * think stage (mount to the graded answer), matching the other block kinds; the
 * block remounts per block.key so the refs reset each step.
 */
function TypingBlock({
  block,
  onResult,
}: {
  block: Extract<SessionBlock, { kind: "typing" }>;
  onResult: (grade: TypedGrade, latencyMs?: number) => void;
}) {
  const [value, setValue] = useState("");
  const [outcome, setOutcome] = useState<TypedGrade | null>(null);
  const startRef = useRef(performance.now());
  const evaluatedRef = useRef(false);

  const grade = (result: TypedGrade) => {
    if (evaluatedRef.current) return;
    evaluatedRef.current = true;
    setOutcome(result);
    onResult(result, Math.round(performance.now() - startRef.current));
  };

  const submit = () => {
    if (evaluatedRef.current || !value.trim()) return;
    grade(block.cloze ? gradeTypedAny(value, block.cloze.answers) : gradeTyped(value, block.de));
  };

  const correct = outcome?.verdict === "correct";
  const almost = outcome?.verdict === "almost";
  const tone = correct
    ? "border-success/25 bg-success/5 text-success"
    : almost
      ? "border-warning/25 bg-warning/5 text-warning"
      : "border-danger/25 bg-danger/5 text-danger";

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Badge variant="muted">{block.cloze ? "Lücke" : "Tippen"}</Badge>
      </div>

      <div className="flex min-h-[13rem] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {block.cloze ? "Ergänze das fehlende Wort:" : "Schreib es auf Deutsch:"}
        </p>
        {block.cloze ? (
          <p className="w-full break-words text-center text-xl font-medium leading-relaxed sm:text-2xl">
            {block.cloze.prompt}
          </p>
        ) : (
          <p className="w-full break-words text-center text-3xl font-semibold sm:text-4xl">{block.en}</p>
        )}
      </div>

      {outcome ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 ${tone}`}
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            {correct ? (
              <>
                <Check className="h-4 w-4" /> Richtig!
              </>
            ) : almost ? (
              <>
                <ArrowRight className="h-4 w-4" />{" "}
                {outcome.reason ? TYPED_ALMOST_NOTE[outcome.reason] : "Fast."}
              </>
            ) : (
              <>
                <X className="h-4 w-4" /> Nicht ganz.
              </>
            )}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Gloss de={block.de} en={block.en} className="text-base font-semibold text-foreground" />
            <SpeakButton text={block.de} />
          </div>
          {block.example && (
            <p className="mt-1 text-sm italic text-muted-foreground">„{block.example}"</p>
          )}
          {!correct && value.trim() && (
            <p className="mt-1 text-sm text-muted-foreground">Deine Antwort: „{value.trim()}"</p>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Deutsches Wort tippen …"
              className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
            />
            <Button variant="gradient" className="h-11" onClick={submit}>
              Prüfen
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => grade({ verdict: "wrong" })}
          >
            Anzeigen
          </Button>
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
        <Badge variant="muted">
          {block.source === "vocab" ? "Vokabel" : block.source === "redemittel" ? "Redemittel" : "Kollokation"}
        </Badge>
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
          className="grid min-h-[13rem] w-full cursor-pointer grid-cols-1 [transform-style:preserve-3d]"
        >
          {/* Front */}
          <div className="[grid-area:1/1] flex min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-soft [backface-visibility:hidden]">
            {/* break-words so a long compound (e.g. Wohnungsgeberbestätigung)
                wraps inside the card instead of overflowing to the right. */}
            <p className="w-full break-words text-center text-3xl font-semibold sm:text-4xl">{block.de}</p>
            <SpeakButton text={block.de} />
            <p className="text-xs text-muted-foreground">Tippen zum Umdrehen</p>
          </div>
          {/* Back */}
          <div className="[grid-area:1/1] flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-surface p-6 shadow-glow [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Gloss de={block.de} en={block.en} initial="en" className="w-full break-words text-center text-xl font-semibold text-primary" />
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
