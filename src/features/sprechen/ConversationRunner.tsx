import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Pencil, RotateCcw, Volume2 } from "lucide-react";
import type { ConversationBrief } from "@/types";
import {
  addLearnerTurn,
  addPartnerTurn,
  canDebrief,
  canSpeak,
  closeConversation,
  dropLastLearnerTurn,
  editLastLearnerTurn,
  failTurn,
  startConversation,
  turnsLeft,
  applyHint,
  type ConversationState,
} from "@/engine/conversation";
import { speak, stopSpeaking } from "@/engine/speech";
import {
  requestDebrief,
  speakTurn,
  useSpeakingAuthBlock,
  type DebriefResult,
} from "@/lib/speaking";
import { useDailyAllowance } from "@/lib/aiAllowance";
import { useMediaQuery } from "@/lib/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AuthDialog } from "@/features/auth/AuthDialog";
import { useLiveWork } from "@/lib/liveWork";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConversationBriefCard } from "./ConversationBriefCard";
import { ConversationDebrief } from "./ConversationDebrief";
import { MicCluster } from "./MicCluster";
import { useSpeechInput } from "./useSpeechInput";
import { cn } from "@/lib/utils";

/**
 * The one runner behind all three spoken layouts (s193).
 *
 * The founder picked three layouts, and they are three MIDDLES, not three
 * screens: the brief, the turn-taking, the microphone cluster, the debrief and
 * every guard around them are identical, so they live here once and the stage
 * only decides what the learner looks at while talking.
 *
 *   gespraech  practice — the scrolling transcript ("the learner finds it
 *              useful to keep track", founder s193)
 *   buehne     exam — one turn on a fixed stage, the Aufgabe stays readable
 *   anruf      exam — no text at all; reading would defeat the task
 */

type Phase = "brief" | "running" | "debriefing" | "debrief";

/** The phone drawer's two halves (s202). Desktop shows Aufgabe only. */
const BRIEF_TABS = [
  { id: "aufgabe", label: "Aufgabe" },
  { id: "redemittel", label: "Redemittel" },
] as const;

export function ConversationRunner({
  brief,
  onExit,
  onFinished,
  onBusyChange,
  /** Rendered above the stage: the exam's RunBar, or practice's ModuleHeader. */
  header,
  help,
}: {
  brief: ConversationBrief;
  /**
   * The learner is done with this screen. Carries the score the debrief
   * produced (null when there was none), because the caller that ADVANCES past
   * this screen is the same one that has to record the result: firing on the
   * debrief's arrival instead would unmount the runner before the learner ever
   * read their feedback.
   */
  onExit: (score: number | null) => void;
  /**
   * The conversation is OVER with enough said to count, and the debrief round
   * trip has come back (with a grade, or with a failure). Practice uses this to
   * mark the scenario done and pay for it. Fired at most once per conversation;
   * it deliberately does not wait for a successful grade, because the learner
   * did the speaking either way (s196).
   */
  onFinished?: (score: number | null) => void;
  /**
   * True once the conversation is live, i.e. once leaving would throw a run
   * away. The caller owns the way out (the shell's one exit, s195), so it has
   * to know when that exit needs a confirm.
   */
  onBusyChange?: (talking: boolean) => void;
  header?: React.ReactNode;
  /**
   * The Redemittel help, PRACTICE ONLY (founder s202). Taken as a prop rather
   * than imported: the Modelltest passes nothing, so it neither shows a
   * candidate the phrases it is about to grade them on, nor carries the phrase
   * bank in its chunk.
   *
   * Two layouts, one content (founder's pick): beside the conversation as a
   * rail from `lg` up, and inside the brief drawer's second tab below it, where
   * the conversation has no column to spare.
   */
  help?: (layout: "rail" | "drawer") => React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [state, setState] = useState<ConversationState>(() => startConversation(brief));
  const [debrief, setDebrief] = useState<DebriefResult | null>(null);
  const [typed, setTyped] = useState("");
  const [briefOpen, setBriefOpen] = useState(false);
  /** Which half of the brief drawer is showing on a phone (s202). */
  const [briefTab, setBriefTab] = useState<"aufgabe" | "redemittel">("aufgabe");
  const [subtitles, setSubtitles] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const conversationId = useRef<string>(crypto.randomUUID());
  /** This conversation has already been counted as practice; see `runDebrief`. */
  const counted = useRef(false);
  const speech = useSpeechInput();
  const reduce = useReducedMotion();
  /**
   * Why the AI cannot be called, asked of the SAME function the API client asks
   * (s205), and re-read whenever auth changes so signing in clears the wall on
   * the spot instead of after a reload.
   */
  const authBlock = useSpeakingAuthBlock();
  // The budget this run spends: Prüfungsgespräche are counted apart from
  // Übungsgespräche (s204).
  const allowance = useDailyAllowance(brief.exam ? "sprechenExam" : "sprechen");

  const speechEnabled = useSettingsStore((s) => s.speechEnabled);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const voiceVariety = useSettingsStore((s) => s.voiceVariety);
  const speechRate = useSettingsStore((s) => s.speechRate);

  const busy = state.status === "thinking" || phase === "debriefing";

  /**
   * The founder's s202 split: the Redemittel rail beside the conversation from
   * `lg` up (Option A), the same content inside the brief drawer's second tab
   * below it (Option C). ONE measurement decides, so the two can never be on
   * screen at once, which would print the phrases twice.
   */
  const wide = useMediaQuery("(min-width: 1024px)");
  const sideRail = help && wide ? help("rail") : null;
  const drawerTabs = !!help && !wide;

  // A conversation in progress is live work: the PWA must not adopt a new build
  // on top of it. There is nothing to flush (the transcript of record lives
  // server-side, written turn by turn), so the reload is simply deferred.
  useLiveWork(phase === "running", "Sprechen");

  // The same fact the caller's exit needs (s195): a started conversation cannot
  // be resumed, so leaving it costs the run and has to ask first.
  useEffect(() => {
    onBusyChange?.(phase === "running");
  }, [phase, onBusyChange]);

  // A live microphone or a speaking partner must never outlive the screen.
  useEffect(() => () => stopSpeaking(), []);

  const sayAloud = useCallback(
    (text: string) => {
      if (!speechEnabled) return;
      speak(text, {
        voiceURI: voiceURI ?? undefined,
        variety: voiceVariety,
        rate: speechRate,
      });
    },
    [speechEnabled, voiceURI, voiceVariety, speechRate],
  );

  /** One round trip to the partner. `utterance` empty = the partner opens. */
  const advance = useCallback(
    async (next: ConversationState, utterance: string) => {
      setState(next);
      const res = await speakTurn({
        conversationId: conversationId.current,
        brief,
        utterance,
      });
      if (!res.ok || !res.reply) {
        // The turn never reached the STORED transcript, which is the one the
        // debrief grades, so it must not stay on screen either (audit P4).
        setState((s) => {
          const rolled = utterance ? dropLastLearnerTurn(s) : s;
          return failTurn(
            rolled,
            res.message ?? "Deine Gesprächspartnerin ist gerade nicht erreichbar.",
          );
        });
        // The server refuses every further turn once the stored transcript hits
        // its ceiling. Without this the microphone stayed live and the learner
        // kept speaking into a transcript nobody would read.
        if (res.conversationOver) setOver(true);
        // A session that lapsed mid-conversation is the one failure the learner
        // can actually fix, so it is put in front of them instead of ending up
        // as a caption they will read as silence (s205).
        if (res.needsAuth) setAuthOpen(true);
        return;
      }
      setState((s) => addPartnerTurn(s, res.reply!));
      sayAloud(res.reply);
    },
    [brief, sayAloud],
  );

  const start = useCallback(() => {
    setPhase("running");
    setOver(false);
    void advance(startConversation(brief), "");
  }, [advance, brief]);

  const submit = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      // The ceiling is the server's to enforce (it measures the stored
      // transcript); this is what stops the learner walking into it.
      if (!canSpeak(state)) {
        setOver(true);
        return;
      }
      stopSpeaking();
      setTyped("");
      void advance(addLearnerTurn(state, clean), clean);
    },
    [advance, state],
  );

  /**
   * Ask for the debrief. Separate from `finish` because it is RETRYABLE (s196):
   * the transcript of record lives server-side, written turn by turn, so a
   * grader that was briefly unreachable can simply be asked again. It costs no
   * further daily allowance either, because the allowance counts conversation
   * ROWS and this conversation's row already exists.
   *
   * The conversation is counted as practice exactly ONCE, whether or not a
   * grade came back (`counted`). Tying the credit to the AI meant an
   * unreachable grader also erased the speaking the learner had just done,
   * which is the founder's "it's basically lost" (s196).
   */
  const runDebrief = useCallback(async () => {
    setPhase("debriefing");
    const res = await requestDebrief({ conversationId: conversationId.current, brief });
    setDebrief(res);
    setPhase("debrief");
    if (!counted.current) {
      counted.current = true;
      onFinished?.(res.ok ? res.score ?? null : null);
    }
  }, [brief, onFinished]);

  const finish = useCallback(async () => {
    stopSpeaking();
    speech.reset();
    if (!canDebrief(state)) {
      // Too little was said for a debrief to say anything true, so the run is
      // abandoned rather than graded against two words.
      onExit(null);
      return;
    }
    setState((s) => closeConversation(s));
    await runDebrief();
  }, [onExit, runDebrief, speech, state]);

  const askHint = useCallback(() => {
    setState((s) => applyHint(s));
    const pending = brief.goals.find((_, i) => i >= state.hintsUsed) ?? brief.goals[0];
    setHint(pending ?? null);
    window.setTimeout(() => setHint(null), 6000);
  }, [brief.goals, state.hintsUsed]);

  /* ------------------------------- screens ------------------------------- */

  /**
   * The exam chrome belongs to every screen of the Teil, not just the talking
   * one (s194 audit P25): the RunBar used to vanish on the brief and on the
   * debrief, so "Teil 4 von 4" and the progress dots disappeared for two of the
   * three screens. Practice passes no header and is unaffected.
   */
  const framed = (node: React.ReactNode) => (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {header}
      {node}
      {/* Every screen carries it, because the wall it clears can appear on the
          brief (nobody signed in) or mid-run (a session that lapsed). */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent="signup" />
    </div>
  );

  if (phase === "brief") {
    // The daily allowance is a real gate, so the button has to say so BEFORE
    // the learner commits (audit P8). It used to be fully enabled with nothing
    // left: they started, the partner never spoke, and the failure arrived as a
    // grey caption under the microphone, in the exam at Teil 4 of 4.
    const spent = allowance.known && allowance.remaining <= 0;
    return framed(
      <ConversationBriefCard
        brief={brief}
        onStart={start}
        // The sign-in wall is stated FIRST: it is absolute, while the allowance
        // is only the next wall behind it.
        disabledReason={
          authBlock ??
          (spent
            ? `Du hast heute schon ${allowance.limit} ${allowance.limit === 1 ? "Gespräch" : "Gespräche"} geführt. Komm morgen wieder!`
            : null)
        }
        onSignIn={authBlock ? () => setAuthOpen(true) : undefined}
      />,
    );
  }

  if (phase === "debriefing") {
    return framed(
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Deine Rückmeldung wird erstellt …</p>
      </div>,
    );
  }

  if (phase === "debrief" && debrief) {
    if (!debrief.ok) {
      // The grade failed, the CONVERSATION did not (s196). It is stored
      // server-side turn by turn, so this screen says so, offers the retry that
      // costs nothing, and never presents the run as thrown away. Before this
      // the only control here was "Zurück", and the whole session vanished.
      return framed(
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">Die Rückmeldung hat nicht geklappt</p>
            <p className="text-sm text-muted-foreground">{debrief.message}</p>
            <p className="text-xs text-muted-foreground">
              Dein Gespräch ist gespeichert und steht in deinem Verlauf.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button variant="gradient" onClick={() => void runDebrief()}>
              <RotateCcw className="h-4 w-4" /> Erneut versuchen
            </Button>
            <Button variant="outline" onClick={() => onExit(null)}>
              Zurück
            </Button>
          </div>
        </div>,
      );
    }
    return framed(
      <ConversationDebrief
        brief={brief}
        result={debrief}
        // No re-sit in the Modelltest (audit P5). "Nochmal" restarted the part
        // from its brief and threw the first score away, so a candidate could
        // sit Teil Sprechen until the number looked good, spending one of their
        // two daily conversations on each attempt.
        onRetry={
          brief.exam
            ? undefined
            : () => {
                conversationId.current = crypto.randomUUID();
                setDebrief(null);
                setState(startConversation(brief));
                setOver(false);
                setPhase("brief");
              }
        }
        onDone={() => onExit(debrief.score ?? null)}
      />,
    );
  }

  const lastPartner = [...state.turns].reverse().find((t) => t.role === "partner");
  const lastLearner = [...state.turns].reverse().find((t) => t.role === "learner");
  const left = turnsLeft(state);
  // Out of turns, not merely mid-round-trip: `canSpeak` is also false while the
  // partner is thinking, which is a wait, not an ending.
  const finished = over || left === 0;
  const caption = finished
    ? "Das Gespräch ist zu Ende. Schau dir jetzt deine Rückmeldung an."
    : state.error
      ? state.error
      : speech.listening
        ? "Ich höre zu … tippe zum Stoppen"
        : busy
          ? `${brief.partner.name} antwortet …`
          : // The ceiling exists for cost, but a learner who runs into it
            // without warning reads it as the app breaking (audit P4).
            left <= 3 && state.turns.length > 0
            ? `Noch ${left} ${left === 1 ? "Beitrag" : "Beiträge"}`
            : speech.error;

  const goalList = (
    <ol className="space-y-1.5">
      {brief.goals.map((g, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] leading-snug">
          <span className="mt-0.5 text-xs font-bold tabular-nums text-accent-ink">{i + 1}.</span>
          <span>{g}</span>
        </li>
      ))}
    </ol>
  );

  /**
   * The collapsed brief. Every layout carries it, because a learner who has lost
   * the thread needs the task back without leaving the run.
   *
   * On a phone WITH the Redemittel help it is the founder's Option C: the same
   * disclosure with two tabs, Aufgabe | Redemittel, because a phone has no
   * column to put a rail in and a second control row would be a second thing to
   * find. Everywhere else (desktop, and the whole Modelltest) it stays the one
   * button it has always been, and the phrases live in the rail beside it.
   */
  const titleLine = (
    <>
      {brief.title}
      <span className="font-medium text-muted-foreground"> · {brief.partner.name}</span>
    </>
  );

  const briefBar = (
    <div className="shrink-0">
      <div
        className={cn(
          "w-full rounded-lg border text-left text-[13px] shadow-soft",
          drawerTabs
            ? "border-accent/20 bg-accent/20 px-1.5 py-1.5 dark:border-accent/10 dark:bg-accent/10"
            : "border-border bg-surface px-2.5 py-2",
        )}
      >
        <div className="flex w-full items-center gap-1.5">
          {drawerTabs &&
            BRIEF_TABS.map((t) => {
              const on = briefOpen && briefTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-expanded={on}
                  onClick={() => {
                    if (briefOpen && briefTab === t.id) return setBriefOpen(false);
                    setBriefTab(t.id);
                    setBriefOpen(true);
                  }}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-xs font-bold transition-colors",
                    // The ON state is its own class, never a hover fill (s201).
                    on ? "bg-surface text-primary shadow-soft" : "text-muted-foreground",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          <button
            type="button"
            onClick={() => setBriefOpen((v) => !v)}
            aria-expanded={briefOpen}
            aria-label={briefOpen ? "Aufgabe schließen" : "Aufgabe öffnen"}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            {/* With the tabs beside it the title had a third of the row and was
                cut off after four words (founder). It gets its own full-width
                line below them instead; without tabs the row is the title's, so
                it stays where it always was. */}
            {!drawerTabs && <span className="min-w-0 flex-1 truncate font-semibold">{titleLine}</span>}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                drawerTabs && "ml-auto",
                briefOpen && "rotate-180",
              )}
            />
          </button>
        </div>
        {drawerTabs && (
          <button
            type="button"
            onClick={() => setBriefOpen((v) => !v)}
            aria-hidden
            tabIndex={-1}
            className="mt-1 block w-full truncate px-1 pb-0.5 text-left text-[12.5px] font-semibold"
          >
            {titleLine}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {briefOpen && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden"
          >
            {/* Bounded: opening this must shrink the transcript, never push the
                running screen into a page scroll. Nothing scrolls at THIS level.
                The panel is a flex column so its one elastic part (the goal
                list, or the phrase list inside the help) takes what the cap
                leaves, which is how every other trainer sizes itself. */}
            <div className="mt-2 flex max-h-[50dvh] flex-col overflow-hidden rounded-lg border border-accent/20 bg-accent/20 p-3 dark:border-accent/10 dark:bg-accent/10">
              {drawerTabs && briefTab === "redemittel" ? (
                help?.("drawer")
              ) : (
                <div className="slim-scrollbar min-h-0 overflow-y-auto">{goalList}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const conversation = (
    <>
      {briefBar}

      {brief.stage === "gespraech" && (
        <ThreadStage
          state={state}
          live={speech.text}
          editing={editing}
          onEditStart={(text) => setEditing(text)}
          onEditChange={setEditing}
          onEditCommit={() => {
            if (editing) setState((s) => editLastLearnerTurn(s, editing));
            setEditing(null);
          }}
          onReplay={sayAloud}
        />
      )}

      {brief.stage === "buehne" && (
        <BuehneStage
          partnerName={brief.partner.name}
          line={lastPartner?.text ?? ""}
          mine={speech.text || (busy ? lastLearner?.text ?? "" : "")}
          onReplay={() => lastPartner && sayAloud(lastPartner.text)}
        />
      )}

      {brief.stage === "anruf" && (
        <AnrufStage
          brief={brief}
          speaking={busy}
          listening={speech.listening}
          subtitles={subtitles}
          onSubtitles={() => setSubtitles((v) => !v)}
          line={lastPartner?.text ?? ""}
          mine={speech.text}
        />
      )}

      {hint && (
        <div className="shrink-0 rounded-lg bg-warning/10 px-3 py-2 text-[13px] text-warning">
          Denk daran: {hint}
        </div>
      )}

      <MicCluster
        // A failure is never printed in the status grey (s205).
        captionTone={!finished && state.error ? "error" : "status"}
        listening={speech.listening}
        supported={speech.supported}
        busy={busy || finished}
        onStart={() => {
          stopSpeaking();
          speech.start();
        }}
        onStop={() => submit(speech.stop())}
        onHint={brief.exam || finished ? undefined : askHint}
        onEnd={finish}
        highlightEnd={finished}
        endLabel={brief.stage === "anruf" ? "Auflegen" : "Beenden"}
        caption={caption}
        typed={typed}
        onTypedChange={setTyped}
        onTypedSubmit={() => submit(typed)}
      />
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {header}
      {/* The stage, plus the rail from `lg` up. One row, so the conversation
          column keeps its own height and the rail sits beside it rather than
          above it; `self-start` keeps the tile its content's height instead of
          letting the row stretch it to the stage's. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-3">{conversation}</div>
        {sideRail && <div className="w-64 shrink-0 self-start">{sideRail}</div>}
      </div>
    </div>
  );
}

/* ------------------------- A · the chat thread ---------------------------- */

function ThreadStage({
  state,
  live,
  editing,
  onEditStart,
  onEditChange,
  onEditCommit,
  onReplay,
}: {
  state: ConversationState;
  live: string;
  editing: string | null;
  onEditStart: (text: string) => void;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onReplay: (text: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [state.turns.length, live]);

  const lastLearnerIdx = state.turns.map((t) => t.role).lastIndexOf("learner");

  return (
    <div className="slim-scrollbar mask-fade-y flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {state.turns.map((t, i) =>
        t.role === "partner" ? (
          <div key={i} className="flex max-w-[88%] gap-2">
            <Card className="min-w-0">
              <CardContent className="p-3">
                <p className="text-[15px] leading-snug">{t.text}</p>
                <button
                  type="button"
                  onClick={() => onReplay(t.text)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground"
                >
                  <Volume2 className="h-3 w-3" /> Nochmal hören
                </button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div key={i} className="flex max-w-[88%] self-end">
            <div className="min-w-0 rounded-[10px] border border-accent/20 bg-accent/20 p-3 shadow-soft dark:border-accent/10 dark:bg-accent/10">
              {editing !== null && i === lastLearnerIdx ? (
                <div className="space-y-2">
                  <input
                    value={editing}
                    onChange={(e) => onEditChange(e.target.value)}
                    autoFocus
                    aria-label="Antwort korrigieren"
                    className="w-full rounded-md border border-input bg-surface px-2 py-1 text-[15px] outline-none"
                  />
                  <Button size="sm" variant="accent" onClick={onEditCommit}>
                    Übernehmen
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-[15px] leading-snug">{t.text}</p>
                  {i === lastLearnerIdx && (
                    <button
                      type="button"
                      onClick={() => onEditStart(t.text)}
                      className="mt-1.5 ml-auto flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground"
                    >
                      <Pencil className="h-3 w-3" /> Falsch gehört?
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ),
      )}

      {live && (
        <div className="flex max-w-[88%] self-end">
          <div className="min-w-0 rounded-[10px] border border-accent/20 bg-accent/20 p-3 opacity-70 dark:border-accent/10 dark:bg-accent/10">
            <p className="text-[15px] leading-snug text-muted-foreground">{live}</p>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

/* --------------------------- B · one turn on stage ------------------------ */

function BuehneStage({
  partnerName,
  line,
  mine,
  onReplay,
}: {
  partnerName: string;
  line: string;
  mine: string;
  onReplay: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <p className="text-eyebrow flex-1 text-muted-foreground">{partnerName}</p>
            <button
              type="button"
              onClick={onReplay}
              aria-label="Nochmal hören"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground"
            >
              <Volume2 className="h-[17px] w-[17px]" />
            </button>
          </div>
          <p className="text-[22px] font-semibold leading-snug tracking-tight sm:text-[26px]">
            {line}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <p className="text-eyebrow text-muted-foreground">Du</p>
        <p className="text-[19px] leading-snug">
          {mine || <span className="text-muted-foreground">…</span>}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- C · the call ----------------------------- */

function AnrufStage({
  brief,
  speaking,
  listening,
  subtitles,
  onSubtitles,
  line,
  mine,
}: {
  brief: ConversationBrief;
  speaking: boolean;
  listening: boolean;
  subtitles: boolean;
  onSubtitles: () => void;
  line: string;
  mine: string;
}) {
  const reduce = useReducedMotion();
  const initials = brief.partner.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const active = speaking || listening;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3.5">
      <span className="grid h-[84px] w-[84px] place-items-center rounded-full bg-sky-500/10 text-[28px] font-bold text-sky-700 dark:text-sky-300">
        {initials || "?"}
      </span>
      <div className="text-center">
        <p className="text-[19px] font-semibold">{brief.partner.name}</p>
        <p className="text-sm text-muted-foreground">{brief.partner.role}</p>
      </div>

      {/* A sound level, not a transcript: the whole point of this layout is
          that there is nothing to read. */}
      <div className="flex h-[34px] items-end gap-1" aria-hidden>
        {[9, 19, 30, 14, 24, 34, 11, 20, 28, 12].map((h, i) => (
          <motion.i
            key={i}
            className="block w-[5px] rounded-[3px] bg-primary/85"
            style={{ height: h }}
            animate={reduce || !active ? { scaleY: 0.4 } : { scaleY: [0.35, 1, 0.5, 0.9, 0.35] }}
            transition={
              reduce || !active
                ? { duration: 0 }
                : { duration: 1.1, repeat: Infinity, delay: i * 0.07 }
            }
          />
        ))}
      </div>

      {subtitles && (
        <div className="max-h-24 w-full overflow-y-auto rounded-lg bg-muted/60 p-3 text-center text-sm">
          {mine || line || "…"}
        </div>
      )}

      <button
        type="button"
        onClick={onSubtitles}
        aria-pressed={subtitles}
        className="flex w-full items-center justify-between rounded-[10px] border border-border bg-surface px-4 py-3 shadow-soft"
      >
        <span className="text-[13.5px] font-semibold">Untertitel</span>
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold",
            subtitles ? "bg-accent/30 text-accent-ink" : "bg-muted text-muted-foreground",
          )}
        >
          {subtitles ? "An" : "Aus"}
        </span>
      </button>
    </div>
  );
}
