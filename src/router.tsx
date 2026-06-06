import React, { Suspense } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LandingPage } from "@/features/landing/LandingPage";
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
const VocabularyTrainer = lazyWithReload(() =>
  import("@/features/vocabulary/VocabularyTrainer").then((m) => ({
    default: m.VocabularyTrainer,
  })),
);
const RedemittelTrainer = lazyWithReload(() =>
  import("@/features/redemittel/RedemittelTrainer").then((m) => ({
    default: m.RedemittelTrainer,
  })),
);
const GrammarHub = lazyWithReload(() =>
  import("@/features/grammar/GrammarHub").then((m) => ({ default: m.GrammarHub })),
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
const Analytics = lazyWithReload(() =>
  import("@/features/analytics/Analytics").then((m) => ({ default: m.Analytics })),
);
const Settings = lazyWithReload(() =>
  import("@/features/settings/Settings").then((m) => ({ default: m.Settings })),
);
const CollocationsBrowser = lazyWithReload(() =>
  import("@/features/collocations/CollocationsBrowser").then((m) => ({
    default: m.CollocationsBrowser,
  })),
);

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboarded = useSettingsStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

// Onboarding has its own Suspense boundary since it renders outside AppShell.
const OnboardingRoute = (
  <Suspense fallback={null}>
    <Onboarding />
  </Suspense>
);

export const router = createHashRouter([
  {
    path: "/welcome",
    element: <LandingPage />,
  },
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
        path: "/vocabulary",
        element: (
          <RequireOnboarding>
            <VocabularyTrainer />
          </RequireOnboarding>
        ),
      },
      {
        path: "/redemittel",
        element: (
          <RequireOnboarding>
            <RedemittelTrainer />
          </RequireOnboarding>
        ),
      },
      {
        path: "/grammar",
        element: (
          <RequireOnboarding>
            <GrammarHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/collocations",
        element: (
          <RequireOnboarding>
            <CollocationsBrowser />
          </RequireOnboarding>
        ),
      },
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
