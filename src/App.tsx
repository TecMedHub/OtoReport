import { createHashRouter, RouterProvider } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "@/hooks/useWorkspace";
import { ToastProvider } from "@/components/ui/Toast";
import { WorkspaceSetup } from "@/components/setup/WorkspaceSetup";
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
        path: "settings",
        lazy: () => import("@/pages/Settings").then((m) => ({ Component: m.Settings })),
      },
    ],
  },
]);

function AppContent() {
  const { workspacePath, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!workspacePath) {
    return <WorkspaceSetup />;
  }

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </ToastProvider>
  );
}

export default App;
