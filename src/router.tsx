import React, { Suspense } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useSettingsStore } from "@/store/useSettingsStore";

const LandingPage = React.lazy(() =>
  import("@/features/landing/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const Dashboard = React.lazy(() =>
  import("@/features/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
);

const Onboarding = React.lazy(() =>
  import("@/features/onboarding/Onboarding").then((m) => ({ default: m.Onboarding })),
);
const VocabularyTrainer = React.lazy(() =>
  import("@/features/vocabulary/VocabularyTrainer").then((m) => ({
    default: m.VocabularyTrainer,
  })),
);
const RedemittelTrainer = React.lazy(() =>
  import("@/features/redemittel/RedemittelTrainer").then((m) => ({
    default: m.RedemittelTrainer,
  })),
);
const GrammarHub = React.lazy(() =>
  import("@/features/grammar/GrammarHub").then((m) => ({ default: m.GrammarHub })),
);
const QuizHub = React.lazy(() =>
  import("@/features/quiz/QuizHub").then((m) => ({ default: m.QuizHub })),
);
const WritingHub = React.lazy(() =>
  import("@/features/writing/WritingHub").then((m) => ({ default: m.WritingHub })),
);
const SimulationHub = React.lazy(() =>
  import("@/features/simulation/SimulationHub").then((m) => ({ default: m.SimulationHub })),
);
const ExamHub = React.lazy(() =>
  import("@/features/exam/ExamHub").then((m) => ({ default: m.ExamHub })),
);
const QuickRevision = React.lazy(() =>
  import("@/features/revision/QuickRevision").then((m) => ({ default: m.QuickRevision })),
);
const Analytics = React.lazy(() =>
  import("@/features/analytics/Analytics").then((m) => ({ default: m.Analytics })),
);
const Settings = React.lazy(() =>
  import("@/features/settings/Settings").then((m) => ({ default: m.Settings })),
);
const CollocationsBrowser = React.lazy(() =>
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
    element: (
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    ),
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
