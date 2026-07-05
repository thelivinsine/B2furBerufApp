import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "@/store/useSettingsStore";
import { themeById } from "@/data/themes";
import type { ThemeId } from "@/types";
import { SessionPlayer } from "./SessionPlayer";

/**
 * Route wrapper for the composed session (`/session`). Reads an optional
 * `?theme=` scope (from a Situationen chip) and `?min=` length override,
 * otherwise sizes the session from the learner's daily goal. Schnellwiederholung
 * (`/revision`) renders the same player with a fixed short preset.
 */
export function Session() {
  const [params] = useSearchParams();
  const dailyGoalXp = useSettingsStore((s) => s.dailyGoalXp);

  const minParam = Number(params.get("min"));
  const minutes =
    Number.isFinite(minParam) && minParam > 0 ? minParam : Math.max(5, Math.round(dailyGoalXp / 8));

  const themeParam = params.get("theme");
  const scope = themeParam && themeById(themeParam) ? (themeParam as ThemeId) : undefined;

  // Key by scope + length: the player builds its plan once on mount, so an
  // in-app navigation to a different ?theme= or ?min= must remount it or the
  // learner keeps the old deck under the new URL.
  return (
    <SessionPlayer
      key={`${scope ?? "all"}-${minutes}`}
      minutes={minutes}
      scope={scope}
      eyebrow="Heute"
      title="Deine Session"
    />
  );
}
