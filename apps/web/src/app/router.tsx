import { createBrowserRouter, RouterProvider } from "react-router";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "@/features/auth/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";
import { ProtectedRoutes, PublicRoutes } from "@/app/routes";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { Projects } from "@/features/projects/Projects";
import { ProjectDetail } from "@/features/projects/ProjectDetail";
import { Settings } from "@/features/settings/Settings";
import { ErrorPage } from "@/features/error/ErrorPage";
import { IssueDetailRoute } from "@/features/issues/IssueDetailRoute";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <ProtectedRoutes />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
          <AppShell>
            <Dashboard />
          </AppShell>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "projects", element: <Projects /> },
          { path: "projects/:projectId", element: <ProjectDetail /> },
          { path: "settings", element: <Settings /> },
          {
            path: "projects/:projectId/issues/:issueId",
            element: <IssueDetailRoute />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoutes />,
    children: [
      {
        path: "/login",
        element: (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <LoginForm />
          </div>
        ),
      },
      {
        path: "/register",
        element: (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <RegisterForm />
          </div>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <ForgotPasswordForm />
          </div>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <ResetPasswordForm />
          </div>
        ),
      },
    ],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
