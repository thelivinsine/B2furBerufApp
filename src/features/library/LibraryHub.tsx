import { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_LIBRARY_TAB } from "./LibrarySwitcher";

// The four library surfaces, lazy so each tab only pulls its own chunk. Every
// segment renders its own <HubHero/> + <LibrarySwitcher/>, so the hub itself is
// just the router: it reads `?tab=` and mounts the matching surface. This is the
// Phase-5 hard merge that folds /vocabulary, /collocations, /redemittel and
// /grammar into the single /library URL (old routes redirect in, params kept).
const VocabularyTrainer = lazy(() =>
  import("@/features/vocabulary/VocabularyTrainer").then((m) => ({ default: m.VocabularyTrainer })),
);
const CollocationsBrowser = lazy(() =>
  import("@/features/collocations/CollocationsBrowser").then((m) => ({ default: m.CollocationsBrowser })),
);
const RedemittelTrainer = lazy(() =>
  import("@/features/redemittel/RedemittelTrainer").then((m) => ({ default: m.RedemittelTrainer })),
);
const GrammarHub = lazy(() =>
  import("@/features/grammar/GrammarHub").then((m) => ({ default: m.GrammarHub })),
);

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  woerter: VocabularyTrainer,
  kollokationen: CollocationsBrowser,
  redemittel: RedemittelTrainer,
  grammatik: GrammarHub,
};

export function LibraryHub() {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? DEFAULT_LIBRARY_TAB;
  const Segment = TAB_COMPONENTS[tab] ?? TAB_COMPONENTS[DEFAULT_LIBRARY_TAB];

  return (
    <Suspense fallback={null}>
      <Segment />
    </Suspense>
  );
}
