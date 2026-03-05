import { createHashRouter, RouterProvider } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "@/hooks/useWorkspace";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/components/ui/Toast";
import { KonamiEasterEgg } from "@/components/KonamiEasterEgg";
import { WorkspaceSetup } from "@/components/setup/WorkspaceSetup";
import { ProfileSelector } from "@/components/setup/ProfileSelector";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dashboard } from "@/pages/Dashboard";

const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: "patients",
        lazy: () => import("@/pages/Patients").then((m) => ({ Component: m.Patients })),
      },
      {
        path: "patients/:id",
        lazy: () =>
          import("@/pages/PatientDetail").then((m) => ({ Component: m.PatientDetail })),
      },
      {
        path: "new-report",
        lazy: () => import("@/pages/NewReport").then((m) => ({ Component: m.NewReport })),
      },
      {
        path: "history",
        lazy: () =>
          import("@/pages/ReportHistory").then((m) => ({ Component: m.ReportHistory })),
      },
      {
        path: "findings-library",
        lazy: () =>
          import("@/pages/FindingsLibrary").then((m) => ({ Component: m.FindingsLibrary })),
      },
      {
        path: "contribute/:findingKey",
        lazy: () =>
          import("@/pages/ContributeFinding").then((m) => ({ Component: m.ContributeFinding })),
      },
      {
        path: "settings",
        lazy: () => import("@/pages/Settings").then((m) => ({ Component: m.Settings })),
      },
    ],
  },
]);

function AppContent() {
  const { workspacePath, loading, profiles, profileSelected } = useWorkspace();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!workspacePath) {
    return <WorkspaceSetup />;
  }

  if (profiles.length > 1 && !profileSelected) {
    return <ProfileSelector />;
  }

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <WorkspaceProvider>
          <AppContent />
          <KonamiEasterEgg />
        </WorkspaceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
