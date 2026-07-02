import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LandingPage } from "@/features/landing/LandingPage";
import { PrivacyPolicy } from "@/features/legal/PrivacyPolicy";
import { TermsOfService } from "@/features/legal/TermsOfService";
import { About } from "@/features/about/About";
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
const Session = lazyWithReload(() =>
  import("@/features/session/Session").then((m) => ({ default: m.Session })),
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
// Lazy: the Sources page pulls in the full provenance register (~800 rows), so
// keep it out of the main bundle and load it only when /sources is visited.
const Sources = lazyWithReload(() =>
  import("@/features/legal/Sources").then((m) => ({ default: m.Sources })),
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

export const router = createBrowserRouter([
  {
    path: "/welcome",
    element: <LandingPage />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
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
