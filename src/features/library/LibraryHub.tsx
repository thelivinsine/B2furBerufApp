import { Suspense, lazy, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DEFAULT_LIBRARY_TAB, LIBRARY_TABS, LibrarySwitcher } from "./LibrarySwitcher";

// The four library surfaces, lazy so each tab only pulls its own chunk. The
// import thunks are named so we can BOTH lazy() them AND preload them on mount
// (see below), which keeps a tab switch from ever hitting the Suspense fallback
// once the hub is open. This is the Phase-5 hard merge that folds /vocabulary,
// /collocations, /redemittel and /grammar into the single /library URL (old
// routes redirect in, params kept).
const loadVocab = () =>
  import("@/features/vocabulary/VocabularyTrainer").then((m) => ({ default: m.VocabularyTrainer }));
const loadColloc = () =>
  import("@/features/collocations/CollocationsBrowser").then((m) => ({ default: m.CollocationsBrowser }));
const loadRedemittel = () =>
  import("@/features/redemittel/RedemittelTrainer").then((m) => ({ default: m.RedemittelTrainer }));
const loadGrammar = () =>
  import("@/features/grammar/GrammarHub").then((m) => ({ default: m.GrammarHub }));

const VocabularyTrainer = lazy(loadVocab);
const CollocationsBrowser = lazy(loadColloc);
const RedemittelTrainer = lazy(loadRedemittel);
const GrammarHub = lazy(loadGrammar);

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  woerter: VocabularyTrainer,
  kollokationen: CollocationsBrowser,
  redemittel: RedemittelTrainer,
  grammatik: GrammarHub,
};

const PRELOADERS = [loadVocab, loadColloc, loadRedemittel, loadGrammar];

// Skeleton for a genuine first load only (the tab bar is hoisted + static above,
// so it is NOT part of this): a toolbar bar + a card grid so the empty and
// loaded states share a rough shape. After the mount-time preload warms every
// chunk, switching tabs never suspends, so this does not flash on toggles.
const fallback = (
  <div className="animate-pulse space-y-4">
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

  // Warm every tab's chunk once the hub opens, so a later switch renders the
  // trainer synchronously instead of dropping to the loading skeleton (the
  // "lazy load" flash the founder saw). Fire-and-forget; failures just mean the
  // normal Suspense path handles that tab.
  useEffect(() => {
    PRELOADERS.forEach((load) => {
      load().catch(() => {});
    });
  }, []);

  // Direction of the tab move (index of the target vs. where we came from) so a
  // tab to the right slides the new panel in from the right and the old one out
  // to the left, and vice-versa, matching the Praktisch (Dashboard) toggle. We
  // read the previous index during render and advance it in an effect, so the
  // change-render computes the right direction while the ref is only WRITTEN in
  // the effect (no ref mutation during render).
  const index = LIBRARY_TABS.indexOf(tab);
  const prevIndex = useRef(index);
  const dir = index >= prevIndex.current ? 1 : -1;
  useEffect(() => {
    prevIndex.current = index;
  }, [index]);

  // Only the CONTENT slides; the tab bar is hoisted here and stays put (true
  // Praktisch parity, where the toggle is static and the panel slides). Because
  // the switcher never unmounts, its shared-layout pill also glides between tabs
  // instead of re-appearing.
  //
  // `mode="popLayout"`, NOT `"wait"`: wait plays the exit fully and only THEN the
  // enter, which is what made the switch feel slow and heavy (a blank fade-out
  // gap between panels). popLayout pops the leaving panel out of flow so the new
  // one is in place immediately and the two cross at once, no empty beat, no
  // vertical jump. Timing is short + snappy and the horizontal slide carries the
  // motion (the entering panel comes from the side you moved toward, the leaving
  // one exits the opposite side); the fade is a light, quick accent, not the main
  // event. At rest the panel settles to `x: 0` (framer resolves to
  // `transform: none`), so the sticky filter rail / Üben bar are not trapped.
  // popLayout absolutely-positions the exiting panel, so the outer wrapper is
  // `relative` to contain it. Distance 0 under reduced motion.
  const shift = reduce ? 0 : 32;
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d >= 0 ? shift : -shift }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -shift : shift }),
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Static page header. On desktop it sits at the content-column width (col
          1 of the same [1fr, 16rem] grid the trainers use for their content +
          filter rail), so the tabs line up with the cards, not the rail. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-8">
        <div className="lg:col-start-1">
          <LibrarySwitcher />
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={tab}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={fallback}>
              <Segment />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
