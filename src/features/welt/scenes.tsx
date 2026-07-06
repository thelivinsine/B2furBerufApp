import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Globe, SkipForward } from "lucide-react";
import type {
  CutsceneScene,
  FormClozeScene,
  ListeningScene,
  LoadoutScene,
  SceneChoice,
  WebsiteParodyScene,
} from "@/types/game";
import { chooseChoice, completeScene, attemptSlot, finishLoadout, recordCheck, recordField, type MissionRun } from "@/engine/mission";
import { gradeTyped, type TypedVerdict } from "@/engine/typing";
import { ttsSupported } from "@/engine/speech";
import { vocabById } from "@/data/vocabulary";
import { npcById } from "@/data/missions";
import { shuffle, sample, cn } from "@/lib/utils";
import { Gloss } from "@/features/shared/Gloss";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { PixelStage, GameCard, SheetCard, Pill, Chip } from "@/features/welt/stage";

/**
 * Scene renderers for the mission player (game G1), one per scene kind
 * (dialogue battle lives in BattleView.tsx). Each receives the current run
 * and an `act` callback that applies a pure runner transition and its
 * effects. Local UI state resets per scene because the player keys each
 * view by scene id.
 */

export interface SceneViewProps {
  act: (fn: (run: MissionRun) => MissionRun) => void;
}

export function speakerName(speaker: string): string {
  if (speaker === "du") return "Du";
  if (speaker === "erzaehler") return "";
  return npcById.get(speaker)?.name ?? speaker;
}

/** Shared choice flow: an optional feedback beat before the route is taken. */
function useChoiceFlow(act: SceneViewProps["act"]) {
  const [pending, setPending] = useState<SceneChoice | null>(null);
  return {
    pending,
    choose: (c: SceneChoice) => {
      if (c.feedback) setPending(c);
      else act((r) => chooseChoice(r, c.id));
    },
    confirm: () => {
      if (!pending) return;
      const id = pending.id;
      setPending(null);
      act((r) => chooseChoice(r, id));
    },
  };
}

/**
 * The "E" chip: toggles an English line under every option in a choice list.
 * Choices/moves are themselves buttons, so the tap-to-toggle Gloss (a button)
 * cannot nest inside them; one list-level toggle keeps the D/E promise.
 */
export function TranslateToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label="Englische Übersetzung umschalten"
      className={cn(
        "rounded-lg px-2 py-0.5 text-xs font-bold transition-colors",
        on ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-600",
      )}
    >
      E
    </button>
  );
}

function FeedbackCard({ feedback, onNext }: { feedback: { de: string; en: string }; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <GameCard className="space-y-3 p-4">
        <p className="text-sm italic text-slate-600">
          <Gloss de={feedback.de} en={feedback.en} />
        </p>
        <div className="flex justify-end">
          <Pill primary onClick={onNext}>
            Weiter <ChevronRight className="ml-1 inline h-4 w-4" />
          </Pill>
        </div>
      </GameCard>
    </motion.div>
  );
}

/* ---------------- cutscene ---------------- */

export function CutsceneView({ scene, act }: SceneViewProps & { scene: CutsceneScene }) {
  const [index, setIndex] = useState(0);
  const flow = useChoiceFlow(act);
  const line = scene.lines[index];
  const isLast = index === scene.lines.length - 1;
  const name = speakerName(line.speaker);

  return (
    <div className="space-y-3">
      <PixelStage setting={scene.setting} />
      {flow.pending?.feedback ? (
        <FeedbackCard feedback={flow.pending.feedback} onNext={flow.confirm} />
      ) : (
        <SheetCard className="space-y-3 p-4">
          {name ? (
            <p className="text-xs font-bold uppercase tracking-wide text-[#5b5be6]">{name}</p>
          ) : null}
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("text-base leading-relaxed", !name && "italic text-slate-500")}
          >
            <Gloss de={line.de} en={line.en} />
          </motion.p>
          {!isLast ? (
            <div className="flex justify-end">
              <Pill primary onClick={() => setIndex((i) => i + 1)}>
                Weiter <ChevronRight className="ml-1 inline h-4 w-4" />
              </Pill>
            </div>
          ) : scene.choices?.length ? (
            <ChoiceList choices={scene.choices} onChoose={flow.choose} />
          ) : (
            <div className="flex justify-end">
              <Pill primary onClick={() => act(completeScene)}>
                Weiter <ChevronRight className="ml-1 inline h-4 w-4" />
              </Pill>
            </div>
          )}
        </SheetCard>
      )}
    </div>
  );
}

/* ---------------- website parody ---------------- */

export function WebsiteView({ scene, act }: SceneViewProps & { scene: WebsiteParodyScene }) {
  const flow = useChoiceFlow(act);
  return (
    <div className="space-y-3">
      <GameCard className="overflow-hidden">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{scene.url}</span>
          </span>
        </div>
        <div className="space-y-3 p-4">
          <h2 className="text-lg font-bold leading-snug">
            <Gloss de={scene.heading} en={scene.headingEn} />
          </h2>
          {scene.lines.map((l, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-600">
              <Gloss de={l.de} en={l.en} />
            </p>
          ))}
          {scene.notice && (
            <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700">
              <Gloss de={scene.notice.de} en={scene.notice.en} />
            </div>
          )}
        </div>
      </GameCard>
      {flow.pending?.feedback ? (
        <FeedbackCard feedback={flow.pending.feedback} onNext={flow.confirm} />
      ) : (
        <GameCard className="p-3">
          <ChoiceList choices={scene.choices} onChoose={flow.choose} />
        </GameCard>
      )}
    </div>
  );
}

/** Choice buttons with the list-level E toggle. */
function ChoiceList({ choices, onChoose }: { choices: SceneChoice[]; onChoose: (c: SceneChoice) => void }) {
  const [showEn, setShowEn] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-400">Was tust du?</p>
        <TranslateToggle on={showEn} onToggle={() => setShowEn((v) => !v)} />
      </div>
      {choices.map((c, i) => (
        <Pill key={c.id} primary={i === 0} onClick={() => onChoose(c)} className="w-full py-2.5">
          <span className="block">{c.de}</span>
          {showEn && <span className="block text-xs font-normal opacity-80">{c.en}</span>}
        </Pill>
      ))}
    </div>
  );
}

/* ---------------- loadout ---------------- */

export function LoadoutView({
  scene,
  run,
  act,
}: SceneViewProps & { scene: LoadoutScene; run: MissionRun }) {
  const [skipped, setSkipped] = useState<string[]>([]);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);

  const active = scene.slots.find((s) => !run.packed[s.id] && !skipped.includes(s.id));
  const activeVocab = active ? vocabById(active.vocabId) : undefined;

  // Four German options: the target + three distractors from the other slots
  // and the scene's distractor pool. Reshuffled per slot, stable per render.
  const options = useMemo(() => {
    if (!active || !activeVocab) return [];
    const pool = [
      ...scene.slots.filter((s) => s.id !== active.id).map((s) => s.vocabId),
      ...(scene.distractorVocabIds ?? []),
    ]
      .map((id) => vocabById(id)?.de)
      .filter((de): de is string => !!de && de !== activeVocab.de);
    return shuffle([activeVocab.de, ...sample(pool, 3)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const pick = (de: string) => {
    if (!active || !activeVocab) return;
    const correct = de === activeVocab.de;
    if (!correct) setWrongPicks((w) => [...w, de]);
    else setWrongPicks([]);
    act((r) => attemptSlot(r, active.id, correct));
  };

  const packedCount = scene.slots.filter((s) => run.packed[s.id]).length;

  return (
    <div className="space-y-3">
      <PixelStage setting={scene.setting} />
      <SheetCard className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">
            <Gloss de={scene.intro.de} en={scene.intro.en} />
          </p>
          <Chip tone="slate">
            {packedCount}/{scene.slots.length}
          </Chip>
        </div>

        {/* bag checklist */}
        <ul className="space-y-1.5">
          {scene.slots.map((s) => {
            const v = vocabById(s.vocabId);
            const packed = !!run.packed[s.id];
            const isActive = active?.id === s.id;
            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                  packed
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : isActive
                      ? "border-[#5b5be6]/40 bg-indigo-50/50 text-slate-700"
                      : "border-slate-200 text-slate-400",
                )}
              >
                {packed ? <Check className="h-4 w-4 shrink-0" /> : <span className="h-4 w-4 shrink-0 rounded-full border border-current opacity-40" />}
                {packed && v ? <Gloss de={v.de} en={v.en} /> : v?.en}
              </li>
            );
          })}
        </ul>

        {active && activeVocab ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Pack ein: <span className="font-semibold text-slate-700">{activeVocab.en}</span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {options.map((de) => {
                const wrong = wrongPicks.includes(de);
                return (
                  <Pill
                    key={de}
                    onClick={() => pick(de)}
                    disabled={wrong}
                    className={cn("w-full py-2.5", wrong && "border-rose-300 bg-rose-50 text-rose-500")}
                  >
                    {de}
                  </Pill>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSkipped((sk) => [...sk, active.id]);
                  setWrongPicks([]);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                <SkipForward className="h-3.5 w-3.5" /> Ohne dieses Dokument weitergehen
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              {packedCount === scene.slots.length
                ? "Alles eingepackt."
                : "Die Tasche bleibt dünn. Mutig."}
            </p>
            <Pill primary onClick={() => act(finishLoadout)}>
              {scene.cta?.de ?? "Weiter"} <ChevronRight className="ml-1 inline h-4 w-4" />
            </Pill>
          </div>
        )}
      </SheetCard>
    </div>
  );
}

/* ---------------- listening (waiting room) ---------------- */

export function ListeningView({ scene, act }: SceneViewProps & { scene: ListeningScene }) {
  const tts = ttsSupported();
  const [revealed, setRevealed] = useState(!tts);
  const [checkIndex, setCheckIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const check = scene.checks[checkIndex];
  const checksDone = checkIndex >= scene.checks.length;

  return (
    <div className="space-y-3">
      <PixelStage setting={scene.setting}>
        {scene.ticker && (
          <GameCard className="absolute left-3 top-3 flex items-center gap-3 px-3 py-2">
            <span className="text-xs font-medium text-slate-500">{scene.ticker.label}</span>
            <span className="font-mono text-lg font-bold text-amber-500">{scene.ticker.current}</span>
            <span className="text-xs text-slate-400">
              Du: <span className="font-mono font-semibold text-[#5b5be6]">{scene.ticker.yours}</span>
            </span>
          </GameCard>
        )}
      </PixelStage>

      <SheetCard className="space-y-4 p-4">
        {scene.intro && (
          <p className="text-sm text-slate-500">
            <Gloss de={scene.intro.de} en={scene.intro.en} />
          </p>
        )}

        {/* announcements: listen first, read along on demand */}
        <ul className="space-y-2">
          {scene.audio.map((l, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <SpeakButton text={l.de} className="mt-0.5 shrink-0" />
              <span className="text-sm leading-relaxed text-slate-600">
                {revealed ? <Gloss de={l.de} en={l.en} /> : <span className="italic text-slate-400">Durchsage {i + 1}</span>}
              </span>
            </li>
          ))}
        </ul>
        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="text-xs font-medium text-[#5b5be6] hover:underline"
          >
            Text anzeigen
          </button>
        )}

        {!checksDone && check ? (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <p className="text-sm font-semibold text-slate-700">{check.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {check.options.map((opt) => {
                const state =
                  chosen === null ? "idle" : opt === check.answer ? "right" : opt === chosen ? "wrong" : "idle";
                return (
                  <Pill
                    key={opt}
                    disabled={chosen !== null}
                    onClick={() => {
                      setChosen(opt);
                      act((r) => recordCheck(r, opt === check.answer));
                    }}
                    className={cn(
                      "w-full py-2.5",
                      state === "right" && "border-teal-300 bg-teal-50 text-teal-700",
                      state === "wrong" && "border-rose-300 bg-rose-50 text-rose-600",
                    )}
                  >
                    {opt}
                  </Pill>
                );
              })}
            </div>
            {chosen !== null && (
              <div className="flex items-center justify-between gap-2">
                <p className="flex-1 text-xs text-slate-500">{check.explain}</p>
                <Pill
                  primary
                  onClick={() => {
                    setChosen(null);
                    setCheckIndex((i) => i + 1);
                  }}
                >
                  Weiter
                </Pill>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end border-t border-slate-100 pt-3">
            <Pill primary onClick={() => act(completeScene)}>
              {scene.ticker ? `Nummer ${scene.ticker.yours}: Du bist dran!` : "Weiter"}
            </Pill>
          </div>
        )}
      </SheetCard>
    </div>
  );
}

/* ---------------- form cloze ---------------- */

type FieldResult = { verdict: TypedVerdict; given: string };

export function FormView({ scene, act }: SceneViewProps & { scene: FormClozeScene }) {
  const [results, setResults] = useState<Record<string, FieldResult>>({});
  const [input, setInput] = useState("");
  const activeIndex = scene.fields.findIndex((f) => !results[f.id]);
  const active = activeIndex >= 0 ? scene.fields[activeIndex] : undefined;
  const allDone = !active;

  const submit = (given: string, verdict: TypedVerdict) => {
    if (!active) return;
    setResults((r) => ({ ...r, [active.id]: { verdict, given } }));
    setInput("");
    act((r) => recordField(r, verdict));
  };

  return (
    <div className="space-y-3">
      <GameCard className="space-y-4 p-4">
        <div className="border-b border-slate-200 pb-3">
          {scene.issuer && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {scene.issuer.de}
            </p>
          )}
          <h2 className="text-lg font-bold leading-snug">
            <Gloss de={scene.title} en={scene.titleEn} />
          </h2>
          {scene.intro && (
            <p className="mt-1 text-xs italic text-slate-500">
              <Gloss de={scene.intro.de} en={scene.intro.en} />
            </p>
          )}
        </div>

        <ol className="space-y-3">
          {scene.fields.map((f, i) => {
            const res = results[f.id];
            const isActive = active?.id === f.id;
            if (!res && !isActive)
              return (
                <li key={f.id} className="text-sm text-slate-300">
                  {i + 1}. {f.label.de.replace("___", "____")}
                </li>
              );
            return (
              <li key={f.id} className="space-y-2">
                <p className={cn("text-sm", res ? "text-slate-500" : "font-semibold text-slate-700")}>
                  {i + 1}. <Gloss de={f.label.de} en={f.label.en} />
                </p>
                {res ? (
                  <p
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium",
                      res.verdict === "correct" && "bg-teal-50 text-teal-700",
                      res.verdict === "almost" && "bg-amber-50 text-amber-700",
                      res.verdict === "wrong" && "bg-rose-50 text-rose-600",
                    )}
                  >
                    {res.given || "(leer)"}
                    {res.verdict !== "correct" && (
                      <span className="ml-2 font-normal text-slate-500">richtig: {f.answer}</span>
                    )}
                  </p>
                ) : f.options ? (
                  <div className="flex flex-wrap gap-2">
                    {f.options.map((opt) => (
                      <Pill key={opt} onClick={() => submit(opt, opt === f.answer ? "correct" : "wrong")}>
                        {opt}
                      </Pill>
                    ))}
                  </div>
                ) : (
                  (() => {
                    const trySubmit = () => {
                      if (input.trim()) submit(input.trim(), gradeTyped(input, f.answer).verdict);
                    };
                    return (
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          trySubmit();
                        }}
                      >
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          autoFocus
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#5b5be6]"
                          placeholder="Antwort eintragen"
                        />
                        <Pill primary disabled={!input.trim()} onClick={trySubmit}>
                          Prüfen
                        </Pill>
                      </form>
                    );
                  })()
                )}
                {isActive && f.hint && !res && (
                  <p className="text-xs text-slate-400">
                    <Gloss de={f.hint.de} en={f.hint.en} />
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {allDone && (
          <div className="flex justify-end border-t border-slate-200 pt-3">
            <Pill primary onClick={() => act(completeScene)}>
              Formular abgeben <ChevronRight className="ml-1 inline h-4 w-4" />
            </Pill>
          </div>
        )}
      </GameCard>
    </div>
  );
}
