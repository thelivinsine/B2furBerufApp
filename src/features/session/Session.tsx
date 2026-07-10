import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "@/store/useSettingsStore";
import { themeById } from "@/data/themes";
import { missions } from "@/data/missions";
import { missionContentIds } from "@/engine/mission";
import type { ThemeId } from "@/types";
import { SessionPlayer } from "./SessionPlayer";

/**
 * Route wrapper for the composed session (`/session`). Reads an optional
 * `?mission=` focus (Heute → Üben "Als Nächstes": practise the exact items a
 * Neuland mission exercises, scoped to its theme), an optional `?theme=` scope
 * (a Situationen chip), and a `?min=` length override, otherwise sizes the
 * session from the learner's daily goal. Schnellwiederholung (`/revision`)
 * renders the same player with a fixed short preset.
 */
export function Session() {
  const [params] = useSearchParams();
  const dailyGoalXp = useSettingsStore((s) => s.dailyGoalXp);

  const minParam = Number(params.get("min"));
  const minutes =
    Number.isFinite(minParam) && minParam > 0 ? minParam : Math.max(5, Math.round(dailyGoalXp / 8));

  // Mission focus takes priority over a bare theme scope: it scopes the session
  // to the mission's theme AND surfaces the mission's own vocab + Redemittel.
  const missionParam = params.get("mission");
  const mission = missionParam ? missions.find((m) => m.id === missionParam) : undefined;
  const focus = mission ? missionContentIds(mission) : undefined;

  const themeParam = params.get("theme");
  const scope = mission
    ? mission.themeId
    : themeParam && themeById(themeParam)
      ? (themeParam as ThemeId)
      : undefined;

  // Key by focus + scope + length: the player builds its plan once on mount, so
  // an in-app navigation to a different ?mission=/?theme=/?min= must remount it
  // or the learner keeps the old deck under the new URL.
  return (
    <SessionPlayer
      key={`${mission?.id ?? scope ?? "all"}-${minutes}`}
      minutes={minutes}
      scope={scope}
      focus={focus}
      eyebrow="Heute"
      title="Deine Session"
    />
  );
}
