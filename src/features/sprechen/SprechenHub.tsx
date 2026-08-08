import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import { scenarioById } from "@/data/dialogues";
import { themeById } from "@/data/themes";
import { speakingBrief } from "@/engine/speaking";
import { XP } from "@/engine/scoring";
import {
  EMPTY_SCENARIO_SCOPE,
  MODULE_LEVELS,
  countScenarios,
  scenarioBandOf,
  scopedScenarios,
  type ScenarioScope,
} from "@/lib/moduleScope";
import { normalizeLevelScope } from "@/lib/writingScope";
import { matchesLifeArea, normalizeLifeArea, themeGroupsByArea } from "@/lib/lifeAreas";
import { LifeAreaPills } from "@/features/shared/LifeAreaPills";
import { ScopeRail, ScopeSection, ScopeSelect } from "@/features/shared/ScopeRail";
import type { Scenario } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModuleHeader } from "@/features/pruefung/ModuleHeader";
import { ModuleTabs } from "@/features/pruefung/ModuleTabs";
import { ChooserCard, ChooserGrid } from "@/features/pruefung/ChooserCard";
import { ModulePage, ModulePicker, ScopeEmpty } from "@/features/pruefung/ModulePicker";
import { ConversationRunner } from "./ConversationRunner";

/**
 * The free Sprechtrainer (s193), rebuilt as a chooser in s196.
 *
 * Founder s196: "the Sprechen ohne Zeit page tiles are all a bunch of tiles as
 * a list, but it should somehow look like Schreiben with a filter rail like
 * Schreiben's Aufgabe wählen tile." So this page is now Schreiben's frame: the
 * "Aufgabe wählen" rail beside a list of exactly what the scope serves, plus
 * the Verlauf tab Schreiben has always had and this trainer never did (which is
 * why a finished conversation left no trace anywhere in the app).
 *
 * What stays: practice always runs as the chat thread (founder s193), so this
 * hub hands the runner a brief whose stage is "gespraech" and never asks the
 * learner to pick a layout; which layout a task uses is a property of the task.
 * It reads the `?level=` the hub hands it (P11) and carries no HubHero, because
 * this zone's header is its switcher (P22).
 */

const SprechenHistory = lazy(() =>
  import("./SprechenHistory").then((m) => ({ default: m.SprechenHistory })),
);

type Tab = "ueben" | "verlauf";
const TABS: { id: Tab; label: string }[] = [
  { id: "ueben", label: "Üben" },
  { id: "verlauf", label: "Verlauf" },
];

export function SprechenHub() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const scenariosDone = useProgressStore((s) => s.scenariosDone);
  const completeScenario = useProgressStore((s) => s.completeScenario);
  const registerSession = useProgressStore((s) => s.registerSession);
  const addXp = useProgressStore((s) => s.addXp);
  const setZoneExit = useSessionStore((s) => s.setZoneExit);
  /** True once the learner is actually talking, so leaving would lose the run. */
  const [talking, setTalking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Both the running scenario and the scope live in the URL, so a reload, a
  // share and the browser's back button all land where the learner was.
  const activeId = params.get("sz");
  const active = useMemo(() => (activeId ? scenarioById(activeId) ?? null : null), [activeId]);
  const tab: Tab = params.get("tab") === "verlauf" ? "verlauf" : "ueben";

  const scope: ScenarioScope = useMemo(
    () => ({
      // A2 shares the Einsteiger set, so the hub's A2 lands on the band that
      // actually serves it rather than on an empty list.
      level: normalizeLevelScope(params.get("level") === "A2" ? "B1" : params.get("level") ?? ""),
      area: normalizeLifeArea(params.get("area")),
      theme: params.get("theme") ?? "",
    }),
    [params],
  );

  const setActive = useCallback(
    (sc: Scenario | null) => {
      const p = new URLSearchParams(params);
      if (sc) p.set("sz", sc.id);
      else p.delete("sz");
      setParams(p, { replace: !sc });
    },
    [params, setParams],
  );

  const patch = (next: Partial<ScenarioScope> & { tab?: Tab }) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (!v || (k === "tab" && v === "ueben")) p.delete(k);
      else p.set(k, v as string);
    }
    setParams(p, { replace: true });
  };

  const resetScope = () => {
    const p = new URLSearchParams(params);
    for (const key of Object.keys(EMPTY_SCENARIO_SCOPE)) p.delete(key);
    setParams(p, { replace: true });
  };

  /**
   * The zone's one exit, in the shell's top-right corner like every other
   * Prüfung screen (founder s195). From the list it leaves for the hub; from a
   * conversation it steps back to the list, because that is the screen the
   * learner came from. A conversation that has started asks first: unlike a
   * writing draft it is not autosaved and cannot be resumed, so leaving really
   * does throw the run away.
   */
  useEffect(() => {
    setZoneExit({
      tone: "quiet",
      run: () => {
        if (!activeId) return navigate("/anwenden");
        if (talking) return setConfirmOpen(true);
        setActive(null);
      },
    });
    return () => setZoneExit(null);
  }, [activeId, talking, navigate, setActive, setZoneExit]);

  const list = useMemo(() => scopedScenarios(scope), [scope]);
  const countWith = useCallback(
    (over: Partial<ScenarioScope>) => countScenarios({ ...scope, ...over }),
    [scope],
  );

  /**
   * Asked before a started conversation is thrown away. The exam's own confirm
   * lives with the runner; this one belongs here because this screen owns the
   * decision to leave (the runner is also the exam's, where leaving means
   * something else).
   */
  const leaveDialog = (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="gap-3">
        <DialogHeader>
          <DialogTitle className="pr-8 text-base">Gespräch verlassen?</DialogTitle>
          <DialogDescription>
            Dein Fortschritt wird nicht gespeichert. Möchtest du wirklich zurück?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
            Weiter sprechen
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setConfirmOpen(false);
              setActive(null);
            }}
          >
            Verlassen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (active) {
    return (
      <div className="mx-auto flex h-page-stage w-full max-w-2xl flex-col gap-3">
        {leaveDialog}
        <ConversationRunner
          brief={speakingBrief(active)}
          // Mobile carries the module row on every screen of the zone (founder
          // s195); in the exam this same slot is the RunBar.
          header={<ModuleHeader part="sprechen" />}
          onBusyChange={setTalking}
          onExit={() => setActive(null)}
          onFinished={() => {
            // Marked done when the conversation ENDS with enough material to
            // count, not when a grade arrives (s196): the learner did the
            // speaking either way, and tying the credit to the AI meant an
            // unreachable grader also erased the practice. It pays too, since
            // s194 (audit P19): a graded conversation used to award nothing
            // while a single flashcard awarded 6.
            completeScenario(active.id);
            addXp(XP.scenarioComplete);
            registerSession();
          }}
        />
      </div>
    );
  }

  const recommendedId = list.find((s) => !scenariosDone.includes(s.id))?.id;
  const theme = themeById(scope.theme);

  // The narrowest active filter, so an empty scope can name what to drop.
  const blame = scope.theme
    ? "das Thema"
    : scope.area
      ? "den Lebensbereich"
      : scope.level
        ? "das Niveau"
        : null;

  const tabs = (
    <ModuleTabs tabs={TABS} value={tab} onSelect={(t) => patch({ tab: t })} ariaLabel="Sprechen" />
  );

  const rail = ({
    layout,
    onClose,
    className,
  }: {
    layout: "rail" | "panel";
    onClose?: () => void;
    className?: string;
  }) => (
    <ScopeRail
      layout={layout}
      onClose={onClose}
      className={className}
      onReset={resetScope}
      resetLabel="Auswahl zurücksetzen"
    >
      {/* Lebensbereich -> Thema -> Niveau (founder s199), the ONE app-wide
          hierarchy, minus the two axes a Scenario carries no tags for (Branche,
          Unterthema): a dropdown that could only ever read 0 is dead chrome, not
          a filter. It used to lead with Niveau. */}

      <ScopeSection label="Lebensbereich">
        <LifeAreaPills
          value={scope.area}
          onChange={(area) => patch({ area, theme: "" })}
          counts={{
            professional: countWith({ area: "professional", theme: "" }),
            personal: countWith({ area: "personal", theme: "" }),
          }}
        />
      </ScopeSection>

      <ScopeSection label="Thema">
        <ScopeSelect
          ariaLabel="Thema"
          triggerLabel={scope.theme ? theme?.titleDe ?? scope.theme : "Alle Themen"}
          value={scope.theme}
          onChange={(id) => patch({ theme: id })}
          groups={[
            {
              label: "",
              options: [{ value: "", label: "Alle Themen", count: countWith({ theme: "" }) }],
            },
            // TWO groups, never more: the one app-wide Berufsleben/Alltag fold.
            ...themeGroupsByArea((id) => countWith({ theme: id }), {
              include: (id) => matchesLifeArea(id, scope.area) || id === scope.theme,
              disableZero: true,
            }),
          ]}
        />
      </ScopeSection>

      <ScopeSection label="Niveau">
        <ScopeSelect
          ariaLabel="Niveau"
          triggerLabel={scope.level || "Alle Niveaus"}
          value={scope.level}
          onChange={(level) => patch({ level })}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Niveaus", count: countWith({ level: "" }) },
                ...MODULE_LEVELS.map((l) => {
                  const count = countWith({ level: l.value });
                  return { value: l.value, label: l.label, count, disabled: count === 0 };
                }),
              ],
            },
          ]}
        />
      </ScopeSection>
    </ScopeRail>
  );

  if (tab === "verlauf") {
    return (
      // Module row first, switcher second, content in the content column: the
      // same frame as the Üben tab and the same order Schreiben uses (s201).
      <ModulePage part="sprechen" head={tabs}>
        <Suspense fallback={<div className="py-16" />}>
          <SprechenHistory onPractice={() => patch({ tab: "ueben" })} />
        </Suspense>
      </ModulePage>
    );
  }

  return (
    <ModulePicker
      part="sprechen"
      head={tabs}
      rail={rail}
      toolbar={{
        eyebrow: "Sprechen üben",
        count: `${list.length} ${list.length === 1 ? "Situation" : "Situationen"}`,
        // The draw Lesen and Hören always had and this chooser never did: one
        // situation out of the current scope, for a learner who does not want
        // to choose. Same control, same place, same wording.
        onShuffle: () => setActive(list[Math.floor(Math.random() * list.length)]),
        shuffleLabel: "Zufällige Situation",
        canShuffle: list.length > 0,
      }}
    >
      {list.length === 0 ? (
        <ScopeEmpty what="Situationen" blame={blame} onReset={resetScope} />
      ) : (
        <ChooserGrid>
          {list.map((sc, i) => {
            const done = scenariosDone.includes(sc.id);
            const recommended = sc.id === recommendedId;
            const themeOf = themeById(sc.themeId);
            return (
              <ChooserCard
                key={sc.id}
                part="sprechen"
                index={i}
                title={sc.title}
                subtitle={themeOf?.titleDe}
                description={sc.task}
                level={scenarioBandOf(sc)}
                facts={[
                  { icon: Clock, label: `${sc.minutes} Min` },
                  { icon: Star, label: `${sc.targetRedemittel.length} Redemittel` },
                ]}
                status={
                  done
                    ? { label: "Erledigt", tone: "success" }
                    : recommended
                      ? { label: "Empfohlen", tone: "accent" }
                      : undefined
                }
                highlight={recommended && !done}
                onClick={() => setActive(sc)}
              />
            );
          })}
        </ChooserGrid>
      )}
    </ModulePicker>
  );
}
