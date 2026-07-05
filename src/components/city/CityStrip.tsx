import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProgressStore } from "@/store/useProgressStore";
import { DomainBuildingIcon } from "./domain-buildings";
import { cityProgress } from "./mastery";

/**
 * The Heute city strip (redesign Phase 3.2): six domain buildings on one
 * street line, lit by mastery; tapping a building starts a session in its
 * least-mastered theme. Loaded lazily (React.lazy in Dashboard.tsx) because
 * the mastery resolution walks the vocabulary bank, which must stay off the
 * eager path (bundle budget; see CLAUDE.md).
 */
export default function CityStrip() {
  const srs = useProgressStore((s) => s.srs);
  const city = useMemo(() => cityProgress(srs), [srs]);

  return (
    <div className="rounded-2xl border border-border bg-surface px-3 pt-3 sm:px-5">
      <div className="flex items-end justify-between border-b-2 border-border">
        {city.map((p) =>
          p.weakestTheme ? (
            <Link
              key={p.building.id}
              to={`/session?theme=${p.weakestTheme}`}
              aria-label={`${p.building.label}: ${Math.round(p.ratio * 100)}% gemeistert`}
              title={p.building.label}
              className="rounded-lg transition-transform hover:scale-105 active:scale-95"
            >
              <DomainBuildingIcon id={p.building.id} lit={p.lit} size={46} />
            </Link>
          ) : (
            <div key={p.building.id} aria-label={p.building.label} title={p.building.label}>
              <DomainBuildingIcon id={p.building.id} size={46} />
            </div>
          )
        )}
      </div>
      <div className="h-2" />
    </div>
  );
}
