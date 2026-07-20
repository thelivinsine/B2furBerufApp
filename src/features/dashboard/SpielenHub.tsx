import { useNavigate } from "react-router-dom";
import { NeulandHub } from "@/features/welt/NeulandHub";

/**
 * Heute → "Spielen": the Neuland world hub (the same chapter/mission list as
 * the /welt route), the entry point into the game world. Lazy by design (it
 * imports the mission bank via NeulandHub), mounted only when the Spielen tab
 * is selected so the Dashboard keeps NO content bank on its eager path (bundle
 * budget, CLAUDE.md). Playing a mission deep-links into /welt?mission=<id>,
 * which auto-opens that mission on the route where the full-screen player and
 * focus mode are wired.
 */
export default function SpielenHub() {
  const navigate = useNavigate();
  // `from=heute` lets the mission player return here (Heute → Spielen, with the
  // Lernen/Spielen toggle) on exit instead of stranding the learner on the
  // toggle-less standalone /welt hub.
  return <NeulandHub compact onPlay={(mission) => navigate(`/welt?mission=${mission.id}&from=heute`)} />;
}
