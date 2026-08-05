import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Pencil, Volume2 } from "lucide-react";
import type { ConversationBrief } from "@/types";
import {
  addLearnerTurn,
  addPartnerTurn,
  canDebrief,
  closeConversation,
  editLastLearnerTurn,
  failTurn,
  startConversation,
  applyHint,
  type ConversationState,
} from "@/engine/conversation";
import { speak, stopSpeaking } from "@/engine/speech";
import { requestDebrief, speakTurn, type DebriefResult } from "@/lib/speaking";
import { useSettingsStore } from "@/store/useSettingsStore";
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

export function ConversationRunner({
  brief,
  onExit,
  onFinished,
  /** Rendered above the stage in exam mode (the RunBar). */
  header,
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
  /** The debrief landed. Practice uses this to mark the scenario done. */
  onFinished?: (score: number | null) => void;
  header?: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [state, setState] = useState<ConversationState>(() => startConversation(brief));
  const [debrief, setDebrief] = useState<DebriefResult | null>(null);
  const [typed, setTyped] = useState("");
  const [briefOpen, setBriefOpen] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const conversationId = useRef<string>(crypto.randomUUID());
  const speech = useSpeechInput();
  const reduce = useReducedMotion();

  const speechEnabled = useSettingsStore((s) => s.speechEnabled);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const voiceVariety = useSettingsStore((s) => s.voiceVariety);
  const speechRate = useSettingsStore((s) => s.speechRate);

  const busy = state.status === "thinking" || phase === "debriefing";

  // A conversation in progress is live work: the PWA must not adopt a new build
  // on top of it. There is nothing to flush (the transcript of record lives
  // server-side, written turn by turn), so the reload is simply deferred.
  useLiveWork(phase === "running", "Sprechen");

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
        setState((s) =>
          failTurn(s, res.message ?? "Deine Gesprächspartnerin ist gerade nicht erreichbar."),
        );
        return;
      }
      setState((s) => addPartnerTurn(s, res.reply!));
      sayAloud(res.reply);
    },
    [brief, sayAloud],
  );

  const start = useCallback(() => {
    setPhase("running");
    void advance(startConversation(brief), "");
  }, [advance, brief]);

  const submit = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      stopSpeaking();
      setTyped("");
      void advance(addLearnerTurn(state, clean), clean);
    },
    [advance, state],
  );

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
    setPhase("debriefing");
    const res = await requestDebrief({ conversationId: conversationId.current, brief });
    setDebrief(res);
    setPhase("debrief");
    if (res.ok) onFinished?.(res.score ?? null);
  }, [brief, onExit, onFinished, speech, state]);

  const askHint = useCallback(() => {
    setState((s) => applyHint(s));
    const pending = brief.goals.find((_, i) => i >= state.hintsUsed) ?? brief.goals[0];
    setHint(pending ?? null);
    window.setTimeout(() => setHint(null), 6000);
  }, [brief.goals, state.hintsUsed]);

  /* ------------------------------- screens ------------------------------- */

  if (phase === "brief") {
    return <ConversationBriefCard brief={brief} onStart={start} />;
  }

  if (phase === "debriefing") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Deine Rückmeldung wird erstellt …</p>
      </div>
    );
  }

  if (phase === "debrief" && debrief) {
    if (!debrief.ok) {
      return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">{debrief.message}</p>
          <Button variant="outline" onClick={() => onExit(null)}>
            Zurück
          </Button>
        </div>
      );
    }
    return (
      <ConversationDebrief
        brief={brief}
        result={debrief}
        onRetry={() => {
          conversationId.current = crypto.randomUUID();
          setDebrief(null);
          setState(startConversation(brief));
          setPhase("brief");
        }}
        onDone={() => onExit(debrief.score ?? null)}
      />
    );
  }

  const lastPartner = [...state.turns].reverse().find((t) => t.role === "partner");
  const lastLearner = [...state.turns].reverse().find((t) => t.role === "learner");
  const caption = state.error
    ? state.error
    : speech.listening
      ? "Ich höre zu … tippe zum Stoppen"
      : busy
        ? `${brief.partner.name} antwortet …`
        : speech.error;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {header}

      {/* The collapsed brief. Every layout carries it, because a learner who
          has lost the thread needs the task back without leaving the run. */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={() => setBriefOpen((v) => !v)}
          aria-expanded={briefOpen}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-left text-[13px] shadow-soft"
        >
          <span className="min-w-0 flex-1 truncate font-semibold">
            {brief.title}
            <span className="font-medium text-muted-foreground"> · {brief.partner.name}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              briefOpen && "rotate-180",
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {briefOpen && (
            <motion.div
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="overflow-hidden"
            >
              <ol className="mt-2 space-y-1.5 rounded-lg border border-accent/20 bg-accent/20 p-3 dark:border-accent/10 dark:bg-accent/10">
                {brief.goals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] leading-snug">
                    <span className="mt-0.5 text-xs font-bold tabular-nums text-accent-ink">
                      {i + 1}.
                    </span>
                    <span>{g}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
        listening={speech.listening}
        supported={speech.supported}
        busy={busy}
        onStart={() => {
          stopSpeaking();
          speech.start();
        }}
        onStop={() => submit(speech.stop())}
        onHint={brief.exam ? undefined : askHint}
        onEnd={finish}
        endLabel={brief.stage === "anruf" ? "Auflegen" : "Beenden"}
        caption={caption}
        typed={typed}
        onTypedChange={setTyped}
        onTypedSubmit={() => submit(typed)}
      />
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
