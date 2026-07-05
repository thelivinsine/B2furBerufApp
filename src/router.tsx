import React, { Suspense } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LandingPage } from "@/features/landing/LandingPage";
// Impressum is built but TEMPORARILY HIDDEN until the founder fills the real
// name/address placeholders (deferred to the lawyer/launch pass). To re-enable:
// restore this import, the /impressum route below, and the footer/Settings +
// privacy/terms links. See docs/PROJECT_STATUS.md.
// import { Impressum } from "@/features/legal/Impressum";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { recoverFromStaleAssets, isChunkLoadError } from "@/lib/recover";

// When a dynamic import fails (stale SW cached an old index.html that points at
// chunk hashes which no longer exist after a deploy), clear the SW caches and
// reload to pick up the fresh asset manifest. recoverFromStaleAssets() guards
// against reload loops; we re-reject so the error boundary shows if it can't.
function lazyWithReload<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    factory().catch((err: unknown) => {
      if (isChunkLoadError(err)) void recoverFromStaleAssets();
      return Promise.reject(err) as never;
    }),
  );
}

const Onboarding = lazyWithReload(() =>
  import("@/features/onboarding/Onboarding").then((m) => ({ default: m.Onboarding })),
);
const LibraryHub = lazyWithReload(() =>
  import("@/features/library/LibraryHub").then((m) => ({ default: m.LibraryHub })),
);
const AnwendenHub = lazyWithReload(() =>
  import("@/features/anwenden/AnwendenHub").then((m) => ({ default: m.AnwendenHub })),
);
const QuizHub = lazyWithReload(() =>
  import("@/features/quiz/QuizHub").then((m) => ({ default: m.QuizHub })),
);
const WritingHub = lazyWithReload(() =>
  import("@/features/writing/WritingHub").then((m) => ({ default: m.WritingHub })),
);
const SimulationHub = lazyWithReload(() =>
  import("@/features/simulation/SimulationHub").then((m) => ({ default: m.SimulationHub })),
);
const ExamHub = lazyWithReload(() =>
  import("@/features/exam/ExamHub").then((m) => ({ default: m.ExamHub })),
);
const QuickRevision = lazyWithReload(() =>
  import("@/features/revision/QuickRevision").then((m) => ({ default: m.QuickRevision })),
);
const Session = lazyWithReload(() =>
  import("@/features/session/Session").then((m) => ({ default: m.Session })),
);
const Analytics = lazyWithReload(() =>
  import("@/features/analytics/Analytics").then((m) => ({ default: m.Analytics })),
);
const Settings = lazyWithReload(() =>
  import("@/features/settings/Settings").then((m) => ({ default: m.Settings })),
);
// Lazy: the Sources page pulls in the full provenance register (~800 rows), so
// keep it out of the main bundle and load it only when /sources is visited.
const Sources = lazyWithReload(() =>
  import("@/features/legal/Sources").then((m) => ({ default: m.Sources })),
);
// Lazy: the bilingual legal bodies + About are long text components that are
// rarely visited from inside the app; no reason to ship them eagerly.
const PrivacyPolicy = lazyWithReload(() =>
  import("@/features/legal/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsOfService = lazyWithReload(() =>
  import("@/features/legal/TermsOfService").then((m) => ({ default: m.TermsOfService })),
);
const About = lazyWithReload(() =>
  import("@/features/about/About").then((m) => ({ default: m.About })),
);

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboarded = useSettingsStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

// Phase 5 hard merge: the standalone library routes now redirect into the
// unified /library hub, forwarding to the matching segment tab and preserving
// every existing query param (theme, sub, cefr, q, cat, …) so deep links and
// cross-module "Verbunden" jumps keep working.
function LibraryRedirect({ tab }: { tab: string }) {
  const { search } = useLocation();
  const p = new URLSearchParams(search);
  p.set("tab", tab);
  return <Navigate to={`/library?${p.toString()}`} replace />;
}

// Onboarding has its own Suspense boundary since it renders outside AppShell.
const OnboardingRoute = (
  <Suspense fallback={null}>
    <Onboarding />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/welcome",
    element: <LandingPage />,
  },
  {
    path: "/about",
    element: (
      <Suspense fallback={null}>
        <About />
      </Suspense>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Suspense fallback={null}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: "/terms",
    element: (
      <Suspense fallback={null}>
        <TermsOfService />
      </Suspense>
    ),
  },
  {
    path: "/sources",
    element: (
      <Suspense fallback={null}>
        <Sources />
      </Suspense>
    ),
  },
  // Impressum route temporarily disabled (see import note above). /impressum
  // falls through to the catch-all redirect until re-enabled.
  {
    path: "/start",
    element: OnboardingRoute,
  },
  {
    element: <AppShell />,
    children: [
      {
        path: "/",
        element: (
          <RequireOnboarding>
            <Dashboard />
          </RequireOnboarding>
        ),
      },
      {
        path: "/library",
        element: (
          <RequireOnboarding>
            <LibraryHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/anwenden",
        element: (
          <RequireOnboarding>
            <AnwendenHub />
          </RequireOnboarding>
        ),
      },
      // Old library routes → unified /library hub (params preserved).
      { path: "/vocabulary", element: <LibraryRedirect tab="woerter" /> },
      { path: "/collocations", element: <LibraryRedirect tab="kollokationen" /> },
      { path: "/redemittel", element: <LibraryRedirect tab="redemittel" /> },
      { path: "/grammar", element: <LibraryRedirect tab="grammatik" /> },
      {
        path: "/quiz",
        element: (
          <RequireOnboarding>
            <QuizHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/writing",
        element: (
          <RequireOnboarding>
            <WritingHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/simulation",
        element: (
          <RequireOnboarding>
            <SimulationHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/exam",
        element: (
          <RequireOnboarding>
            <ExamHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/session",
        element: (
          <RequireOnboarding>
            <Session />
          </RequireOnboarding>
        ),
      },
      {
        path: "/revision",
        element: (
          <RequireOnboarding>
            <QuickRevision />
          </RequireOnboarding>
        ),
      },
      {
        path: "/analytics",
        element: (
          <RequireOnboarding>
            <Analytics />
          </RequireOnboarding>
        ),
      },
      {
        path: "/settings",
        element: (
          <RequireOnboarding>
            <Settings />
          </RequireOnboarding>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
