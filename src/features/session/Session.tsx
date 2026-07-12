import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "@/store/useSettingsStore";
import { themeById } from "@/data/themes";
import { missions } from "@/data/missions";
import { missionContentIds } from "@/engine/mission";
import { libraryFocus } from "@/engine/session";
import type { ThemeId } from "@/types";
import { SessionPlayer } from "./SessionPlayer";

/**
 * Route wrapper for the composed session (`/session`). Reads where in the app
 * the learner launched Üben and tailors the session to it: `?mission=` (Heute →
 * Üben: the exact items a Neuland mission exercises, scoped to its theme),
 * `?grammar=` (a Grammatik lesson: pin the studied topic), `?cat=` (a Redemittel
 * category), the Bibliothek facets `?sub=`/`?cefr=`/`?sector=` (lead with the
 * narrowed word slice), a bare `?theme=` scope, and a `?min=` length override.
 * Otherwise it sizes the session from the learner's daily goal.
 * Schnellwiederholung (`/revision`) renders the same player with a short preset.
 */
export function Session() {
  const [params] = useSearchParams();
  const dailyGoalXp = useSettingsStore((s) => s.dailyGoalXp);

  const minParam = Number(params.get("min"));
  const minutes =
    Number.isFinite(minParam) && minParam > 0 ? minParam : Math.max(5, Math.round(dailyGoalXp / 8));

  // Mission focus takes priority: it scopes the session to the mission's theme
  // AND surfaces the mission's own vocab + Redemittel. A pinned grammar topic
  // and a Bibliothek facet focus are the other tailored entry points; grammar
  // and library focus are mutually exclusive (a lesson carries no facets).
  const missionParam = params.get("mission");
  const mission = missionParam ? missions.find((m) => m.id === missionParam) : undefined;
  const grammarTopicId = mission ? undefined : (params.get("grammar") ?? undefined);
  const focus = mission
    ? missionContentIds(mission)
    : grammarTopicId
      ? undefined
      : libraryFocus({
          theme: params.get("theme") ?? undefined,
          sub: params.get("sub") ?? undefined,
          cefr: params.get("cefr")?.split(","),
          sector: params.get("sector")?.split(","),
          category: params.get("cat") ?? undefined,
        });

  const themeParam = params.get("theme");
  const scope = mission
    ? mission.themeId
    : themeParam && themeById(themeParam)
      ? (themeParam as ThemeId)
      : undefined;

  // Key by every tailoring param + length: the player builds its plan once on
  // mount, so an in-app navigation to a different scope must remount it or the
  // learner keeps the old deck under the new URL.
  const focusKey = `${grammarTopicId ?? ""}-${params.get("cat") ?? ""}-${params.get("sub") ?? ""}-${params.get("cefr") ?? ""}-${params.get("sector") ?? ""}`;
  return (
    <SessionPlayer
      key={`${mission?.id ?? scope ?? "all"}-${focusKey}-${minutes}`}
      minutes={minutes}
      scope={scope}
      focus={focus}
      grammarTopicId={grammarTopicId}
      eyebrow="Heute"
      title="Deine Session"
    />
  );
}
