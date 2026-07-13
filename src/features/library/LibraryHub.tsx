import { Suspense, lazy, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DEFAULT_LIBRARY_TAB, LIBRARY_TABS } from "./LibrarySwitcher";

// The four library surfaces, lazy so each tab only pulls its own chunk. Every
// segment renders its own <LibrarySwitcher/>, so the hub itself is just the
// router: it reads `?tab=` and mounts the matching surface. This is the Phase-5
// hard merge that folds /vocabulary, /collocations, /redemittel and /grammar
// into the single /library URL (old routes redirect in, params kept).
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

// A light silhouette so a cold tab shows a shaped skeleton instead of a blank
// flash while its chunk loads (mirrors the Dashboard fallback). The tab bar +
// toolbar bars keep the top of the page steady, and the card grid stands in for
// the list, so the empty and loaded states share a rough shape.
const fallback = (
  <div className="animate-pulse space-y-4">
    <div className="h-11 rounded-full border border-border bg-surface" />
    <div className="mx-auto h-9 w-40 rounded-full border border-border bg-surface" />
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl border border-border bg-surface" />
      ))}
    </div>
  </div>
);

export function LibraryHub() {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? DEFAULT_LIBRARY_TAB;
  const Segment = TAB_COMPONENTS[tab] ?? TAB_COMPONENTS[DEFAULT_LIBRARY_TAB];
  const reduce = useReducedMotion();

  // Direction of the tab move (index of the target vs. where we came from) so a
  // tab to the right slides the new panel in from the right and the old one out
  // to the left, and vice-versa, matching the Praktisch (Dashboard) toggle. We
  // derive it from the index change during render (the "store the previous prop"
  // pattern) and keep it stable across the transition's re-renders via a ref, so
  // AnimatePresence's exit reads the right direction.
  const index = LIBRARY_TABS.indexOf(tab);
  const prevIndex = useRef(index);
  const dirRef = useRef(1);
  if (index !== prevIndex.current) {
    dirRef.current = index >= prevIndex.current ? 1 : -1;
    prevIndex.current = index;
  }
  const dir = dirRef.current;

  // Horizontal slide (Praktisch parity): the entering panel comes from the side
  // you moved toward, the leaving one exits the opposite side. `mode="wait"`
  // sequences them so it reads as one panel replacing another, not a cross-fade.
  // At rest the panel settles to `x: 0`, which framer resolves to
  // `transform: none` (no lingering transform), so the sticky filter rail / Üben
  // bar inside each trainer are not trapped in a containing block. Distance 0
  // under reduced motion.
  const shift = reduce ? 0 : 24;
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d >= 0 ? shift : -shift }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -shift : shift }),
  };

  return (
    <AnimatePresence mode="wait" custom={dir} initial={false}>
      <motion.div
        key={tab}
        custom={dir}
        variants={slide}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.16, ease: "easeOut" }}
      >
        <Suspense fallback={fallback}>
          <Segment />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
