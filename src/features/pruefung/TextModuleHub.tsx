import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AudioLines, FileText, ListChecks } from "lucide-react";
import { themeById } from "@/data/themes";
import { LISTENING_COUNT, PART_LABEL, READING_COUNT, type MockExamLevel } from "@/engine/exam";
import {
  EMPTY_TEXT_SCOPE,
  MODULE_LEVELS,
  TEXT_KIND_LABEL,
  countDedicatedTexts,
  countTexts,
  kindsInPart,
  levelOfText,
  scopedTexts,
  type ReceptivePart,
  type TextScope,
} from "@/lib/moduleScope";
import { normalizeLevelScope } from "@/lib/writingScope";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { matchesLifeArea, normalizeLifeArea, themeGroupsByArea } from "@/lib/lifeAreas";
import { LifeAreaPills } from "@/features/shared/LifeAreaPills";
import { ScopeLocked, ScopeRail, ScopeSection, ScopeSelect } from "@/features/shared/ScopeRail";
import { useExamStore } from "@/store/useExamStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { MockExamRunner } from "@/features/exam/MockExamRunner";
import { ChooserCard, ChooserGrid } from "./ChooserCard";
import { ModuleTabs } from "./ModuleTabs";
import { ModulePage, ModulePicker, ScopeEmpty } from "./ModulePicker";
import { ModuleVerlaufCard, moduleRuns } from "./verlauf";

/**
 * Lesen and Hören, without a clock (founder s196).
 *
 * Before this the two receptive modules had no Ohne-Zeit shape of their own:
 * tapping the card composed a random three-text (or two-Ansage) drill and threw
 * the learner straight into it, so the only difference from Mit Zeit was the
 * timer pill, and there was no way to practise a particular text. The founder
 * asked for Schreiben's answer, and this is it: the same "Aufgabe wählen" rail,
 * the same frame, over a list of what the scope actually serves.
 *
 * Starting one text runs the SAME `LesenPart` / `HoerenPart` the Modelltest
 * uses, untimed and over the picked id (`MockExamPicks`), so it scores the same
 * way and its result lands in the same Module-üben Verlauf. The exam draw is
 * still one tap away as "Zufällige Auswahl", which is what the card used to do.
 *
 * **The run is rendered HERE** (s200). Starting one only wrote it into
 * `useExamStore`, and the only screen that rendered a run was the Prüfung hub,
 * so on `/lesen` and `/hoeren` every card and the random draw did visibly
 * nothing (founder: "shuffle button has a bug ... it deactivates when tapped on
 * empty spaces", which is a stuck touch-hover on a button whose tap led
 * nowhere). Rendering the runner on this route rather than sending the learner
 * to the hub is also what makes finishing a drill land back on the list they
 * picked it from.
 */

const COUNT_FOR: Record<ReceptivePart, number> = {
  lesen: READING_COUNT,
  hoeren: LISTENING_COUNT,
};

const NOUN: Record<ReceptivePart, { one: string; many: string }> = {
  lesen: { one: "Text", many: "Texte" },
  hoeren: { one: "Ansage", many: "Ansagen" },
};

type Tab = "ueben" | "verlauf";
const TABS: { id: Tab; label: string }[] = [
  { id: "ueben", label: "Üben" },
  { id: "verlauf", label: "Verlauf" },
];

export function TextModuleHub({ part }: { part: ReceptivePart }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const start = useExamStore((s) => s.start);
  const run = useExamStore((s) => s.run);
  const mockExams = useProgressStore((s) => s.mockExams);
  const setZoneExit = useSessionStore((s) => s.setZoneExit);
  const [verlaufOpen, setVerlaufOpen] = useState(false);

  const tab: Tab = params.get("tab") === "verlauf" ? "verlauf" : "ueben";

  // The whole scope lives in the URL, like Schreiben's: a reload, a share and
  // the back button all land on the same list, and the Niveau the hub handed
  // over (`?level=`) is honoured rather than silently dropped.
  const scope: TextScope = useMemo(
    () => ({
      level: normalizeLevelScope(params.get("level") ?? ""),
      sector: params.get("sector") ?? "",
      area: normalizeLifeArea(params.get("area")),
      theme: params.get("theme") ?? "",
      sub: params.get("sub") ?? "",
      kind: params.get("kind") ?? "",
    }),
    [params],
  );

  const patch = useCallback(
    (next: Partial<TextScope> & { tab?: Tab }) => {
      const p = new URLSearchParams(params);
      for (const [k, v] of Object.entries(next)) {
        if (!v || (k === "tab" && v === "ueben")) p.delete(k);
        else p.set(k, v);
      }
      setParams(p, { replace: true });
    },
    [params, setParams],
  );

  /**
   * The zone's ONE exit (founder s195): a list has nothing to lose, so no
   * confirm. While a drill runs the RUNNER owns the exit, so this one steps
   * aside, and the cleanup only clears an exit that is still its own: the
   * runner registers in a layout effect (during the commit) and this passive
   * effect cleans up afterwards, so an unguarded `setZoneExit(null)` would wipe
   * the exit the drill had just installed and leave the screen with no way out.
   */
  useEffect(() => {
    if (run) return;
    const exit = { tone: "quiet" as const, run: () => navigate("/anwenden") };
    setZoneExit(exit);
    return () => {
      if (useSessionStore.getState().zoneExit === exit) setZoneExit(null);
    };
  }, [run, navigate, setZoneExit]);

  const list = useMemo(() => scopedTexts(part, scope), [part, scope]);
  const countWith = useCallback(
    (over: Partial<TextScope>) => countTexts(part, { ...scope, ...over }),
    [part, scope],
  );

  // Branche options carry the DEDICATED count and lock at zero (s199). Built
  // once so the dropdown and the "is everything locked" test read one list.
  const sectorOptions = useMemo(
    () =>
      SECTOR_OPTIONS.map((o) => {
        const count = countDedicatedTexts(part, { ...scope, sector: "" }, o.value);
        // The active Branche never locks: it is the way back out.
        return {
          value: o.value,
          label: o.label,
          count,
          locked: count === 0 && o.value !== scope.sector,
        };
      }),
    [part, scope],
  );

  const kinds = useMemo(() => kindsInPart(part), [part]);
  const theme = themeById(scope.theme);
  const subThemes = theme?.subThemes ?? [];

  // This module's own sittings, newest first. Bank-free (`moduleRuns` reads the
  // progress store), and a Modelltest is excluded there by the app's one rule.
  const history = moduleRuns(mockExams, part);

  const tabs = (
    <ModuleTabs
      tabs={TABS}
      value={tab}
      onSelect={(t) => {
        patch({ tab: t });
        setVerlaufOpen(false);
      }}
      ariaLabel={PART_LABEL[part]}
    />
  );

  // A drill takes the route over, exactly as it does on the Prüfung hub, so a
  // reload lands back inside it and leaving it lands back on this list. Below
  // every hook, like the hub's own early return.
  if (run) return <MockExamRunner />;

  const resetScope = () => {
    const p = new URLSearchParams(params);
    for (const key of Object.keys(EMPTY_TEXT_SCOPE)) p.delete(key);
    setParams(p, { replace: true });
  };

  /** Open one text as an untimed single-text drill. */
  const openText = (id: string, level: MockExamLevel) => {
    start(level, [part], { untimed: true, picks: { [part]: [id] } });
  };

  /** The classic draw: the module's full exam-shaped set, still without a clock. */
  const openRandom = () => {
    const pool = list.length ? list : scopedTexts(part, EMPTY_TEXT_SCOPE);
    if (!pool.length) return;
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, COUNT_FOR[part]);
    // The scope's Niveau wins when the learner set one, so the result is filed
    // under the level they were practising rather than under whichever text the
    // shuffle happened to put first.
    const level = (MODULE_LEVELS.some((l) => l.value === scope.level)
      ? scope.level
      : levelOfText(picked[0])) as MockExamLevel;
    start(level, [part], {
      untimed: true,
      picks: { [part]: picked.map((t) => t.id) },
    });
  };

  // The narrowest active filter, so an empty scope can name what to drop
  // (founder rule: an empty scope gets an empty state naming ONE filter).
  const blame = scope.sub
    ? "das Unterthema"
    : scope.theme
      ? "das Thema"
      : scope.kind
        ? "die Textsorte"
        : scope.area
          ? "den Lebensbereich"
          : scope.level
            ? "das Niveau"
            : null;

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
      {/* Niveau -> Branche -> Lebensbereich -> Thema -> Unterthema -> Textsorte:
          the ONE Bibliothek hierarchy, in the order the Schreiben rail uses. */}



      {/* Lebensbereich -> Thema -> Unterthema -> Branche -> Niveau -> Textsorte
          (founder s199), the ONE app-wide hierarchy, same order as every other
          rail. It used to lead with Niveau and put Branche second. */}
      <ScopeSection label="Lebensbereich">
        <LifeAreaPills
          value={scope.area}
          onChange={(area) => patch({ area, theme: "", sub: "" })}
          counts={{
            professional: countWith({ area: "professional", theme: "", sub: "" }),
            personal: countWith({ area: "personal", theme: "", sub: "" }),
          }}
        />
      </ScopeSection>

      <ScopeSection label="Thema">
        <ScopeSelect
          ariaLabel="Thema"
          triggerLabel={scope.theme ? theme?.titleDe ?? scope.theme : "Alle Themen"}
          value={scope.theme}
          onChange={(id) => patch({ theme: id, sub: "" })}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Themen", count: countWith({ theme: "", sub: "" }) },
              ],
            },
            // TWO groups, never more: the one app-wide Berufsleben/Alltag fold.
            ...themeGroupsByArea((id) => countWith({ theme: id, sub: "" }), {
              include: (id) => matchesLifeArea(id, scope.area) || id === scope.theme,
              disableZero: true,
            }),
          ]}
        />
      </ScopeSection>

      {subThemes.length > 0 && (
        <ScopeSection label="Unterthema">
          <ScopeSelect
            ariaLabel="Unterthema"
            triggerLabel={
              scope.sub
                ? subThemes.find((s) => s.id === scope.sub)?.titleDe ?? scope.sub
                : "Gesamtes Thema"
            }
            value={scope.sub}
            onChange={(sub) => patch({ sub })}
            groups={[
              {
                label: "",
                options: [
                  { value: "", label: "Gesamtes Thema", count: countWith({ sub: "" }) },
                  ...subThemes.map((s) => {
                    const count = countWith({ sub: s.id });
                    return { value: s.id, label: s.titleDe, count, disabled: count === 0 };
                  }),
                ],
              },
            ]}
          />
        </ScopeSection>
      )}

      <ScopeSection label="Branche">
        {/* LOCKED, not greyed (founder s199): the count is the DEDICATED one, so
            a zero means no text is written for that industry on this Thema.
            Only 4 of 52 texts carry a Branche tag, so here the whole control is
            usually the one-line locked state, which is the honest picture. */}
        {sectorOptions.every((o) => o.locked) ? (
          <ScopeLocked>
            Für dieses Thema gibt es keine Texte nach Branche. Du übst hier alle.
          </ScopeLocked>
        ) : (
          <ScopeSelect
            ariaLabel="Branche"
            triggerLabel={
              scope.sector
                ? SECTOR_OPTIONS.find((o) => o.value === scope.sector)?.label ?? scope.sector
                : "Alle Branchen"
            }
            value={scope.sector}
            onChange={(sector) => patch({ sector })}
            groups={[
              {
                label: "",
                options: [
                  { value: "", label: "Alle Branchen", count: countWith({ sector: "" }) },
                  ...sectorOptions,
                ],
              },
            ]}
          />
        )}
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

      {kinds.length > 1 && (
        <ScopeSection label="Textsorte">
          <ScopeSelect
            ariaLabel="Textsorte"
            triggerLabel={
              scope.kind ? TEXT_KIND_LABEL[scope.kind as keyof typeof TEXT_KIND_LABEL] : "Alle Textsorten"
            }
            value={scope.kind}
            onChange={(kind) => patch({ kind })}
            groups={[
              {
                label: "",
                options: [
                  { value: "", label: "Alle Textsorten", count: countWith({ kind: "" }) },
                  ...kinds.map((k) => {
                    const count = countWith({ kind: k });
                    return {
                      value: k,
                      label: TEXT_KIND_LABEL[k],
                      count,
                      disabled: count === 0,
                    };
                  }),
                ],
              },
            ]}
          />
        </ScopeSection>
      )}
    </ScopeRail>
  );

  const noun = NOUN[part];

  if (tab === "verlauf") {
    return (
      // The SAME frame as the Üben tab, minus the rail: module row, switcher,
      // content, in the same columns, so a tab switch moves nothing sideways.
      <ModulePage part={part} head={tabs}>
        <ModuleVerlaufCard
          runs={history}
          open={verlaufOpen}
          onToggle={() => setVerlaufOpen((v) => !v)}
          noun={{ one: "Übung", many: "Übungen" }}
        />
      </ModulePage>
    );
  }

  return (
    <ModulePicker
      part={part}
      head={tabs}
      rail={rail}
      toolbar={{
        eyebrow: `${PART_LABEL[part]} üben`,
        count: `${list.length} ${list.length === 1 ? noun.one : noun.many}`,
        // The exam-shaped draw the module card used to perform on its own. It
        // is hidden rather than disabled while the scope serves nothing: a dead
        // control reads as a broken one, and the empty state below already
        // carries the way out.
        onShuffle: openRandom,
        canShuffle: list.length > 0,
      }}
    >
      {list.length === 0 ? (
        <ScopeEmpty what={noun.many} blame={blame} onReset={resetScope} />
      ) : (
        <ChooserGrid>
          {list.map((text, i) => {
            const themeOf = themeById(text.themeId);
            const level = levelOfText(text);
            const hasNotes = (text.notes?.length ?? 0) > 0;
            return (
              <ChooserCard
                key={text.id}
                part={part}
                index={i}
                title={text.title}
                subtitle={`${TEXT_KIND_LABEL[text.kind]}${themeOf ? ` · ${themeOf.titleDe}` : ""}`}
                level={text.cefr}
                facts={[
                  {
                    icon: ListChecks,
                    label: `${text.checks.length} ${text.checks.length === 1 ? "Aufgabe" : "Aufgaben"}`,
                  },
                  ...(hasNotes
                    ? [{ icon: part === "hoeren" ? AudioLines : FileText, label: "Notizen" }]
                    : []),
                ]}
                onClick={() => openText(text.id, level)}
              />
            );
          })}
        </ChooserGrid>
      )}
    </ModulePicker>
  );
}

export function LesenHub() {
  return <TextModuleHub part="lesen" />;
}

export function HoerenHub() {
  return <TextModuleHub part="hoeren" />;
}
