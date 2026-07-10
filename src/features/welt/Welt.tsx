import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Mission } from "@/types/game";
import { missionUnlocked } from "@/engine/mission";
import { missions } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { MissionPlayer } from "@/features/welt/MissionPlayer";
import { NeulandHub } from "@/features/welt/NeulandHub";

/**
 * /welt: the Neuland world route (game G1, Beta). Renders the shared
 * `NeulandHub` (chapter sections + mission lists + Schlüssel-Dokumente shelf),
 * and owns the inline full-screen mission player. The hub is also reused in
 * Heute → Spielen, which deep-links back here to play. Game scenes are
 * light-theme-only by design (docs/DECISIONS.md); the hub uses app tokens so it
 * sits naturally in the shell.
 */
export function Welt() {
  const [params, setParams] = useSearchParams();

  // Deep link from Heute → Spielen: /welt?mission=<id> auto-opens that mission
  // when it exists and is unlocked. Read once on mount; absent or invalid param
  // leaves the hub untouched.
  const [active, setActive] = useState<Mission | null>(() => {
    const id = params.get("mission");
    if (!id) return null;
    const m = missions.find((mm) => mm.id === id);
    if (!m) return null;
    const { missionsDone: done, keyItems } = useProgressStore.getState();
    return missionUnlocked(m, done, keyItems) ? m : null;
  });

  const exitMission = () => {
    setActive(null);
    if (params.has("mission")) {
      params.delete("mission");
      setParams(params, { replace: true });
    }
  };

  if (active) {
    return <MissionPlayer key={active.id} mission={active} onExit={exitMission} />;
  }

  return <NeulandHub onPlay={setActive} />;
}
