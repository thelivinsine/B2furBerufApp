import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Onboarding } from "@/features/onboarding/Onboarding";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { VocabularyTrainer } from "@/features/vocabulary/VocabularyTrainer";
import { RedemittelTrainer } from "@/features/redemittel/RedemittelTrainer";
import { SimulationHub } from "@/features/simulation/SimulationHub";
import { ExamHub } from "@/features/exam/ExamHub";
import { QuickRevision } from "@/features/revision/QuickRevision";
import { Analytics } from "@/features/analytics/Analytics";
import { Settings } from "@/features/settings/Settings";
import { useSettingsStore } from "@/store/useSettingsStore";

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboarded = useSettingsStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/welcome",
    element: <Onboarding />,
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
