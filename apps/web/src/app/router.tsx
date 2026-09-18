import { createBrowserRouter, RouterProvider } from "react-router";
import { AppShell } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Plus,
  Bell,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/Feedback";

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
    path: "/",
    element: (
      <AppShell>
        <Dashboard />
      </AppShell>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/:projectId", element: <ProjectDetail /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
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

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
          <p className="text-text-muted">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/projects/new">
            <Button>New Project</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Projects"
          value="3"
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatCard
          title="Assigned Issues"
          value="7"
          icon={<LayoutDashboard className="h-5 w-5" />}
        />
        <StatCard
          title="Overdue"
          value="2"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Completed"
          value="12"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-medium text-text">Recent Projects</h3>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No projects yet"
              description="Create your first project to get started"
              action={
                <a href="/projects/new">
                  <Button size="sm">Create Project</Button>
                </a>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium text-text">Assigned to You</h3>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No assigned issues"
              description="Issues assigned to you will appear here"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Projects</h1>
          <p className="text-text-muted">All your projects in one place</p>
        </div>
        <a href="/projects/new">
          <Button>New Project</Button>
        </a>
      </div>

      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No projects yet"
            description="Create your first project to start organizing work"
            action={
              <a href="/projects/new">
                <Button>Create Project</Button>
              </a>
            }
            icon={<FolderKanban className="h-12 w-12" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectDetail() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Project Name</h1>
          <p className="text-text-muted">Project description goes here</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Board</Button>
          <Button variant="secondary">List</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No issues yet"
            description="Create your first issue to start tracking work"
            action={<Button>Create Issue</Button>}
            icon={<FolderKanban className="h-12 w-12" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Settings() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-text">Settings</h1>

      <Card>
        <CardHeader>
          <h3 className="font-medium text-text">Profile</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Display Name"
              placeholder="John Doe"
              defaultValue="John Doe"
            />
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              defaultValue="john@example.com"
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-medium text-text">Security</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="secondary">Change Password</Button>
          <Button variant="ghost" className="text-danger">
            Sign out everywhere
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-text">Welcome back</h1>
          <p className="text-text-muted mt-1">Sign in to your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </form>
          <div className="text-center text-sm text-text-muted">
            Don't have an account?{" "}
            <a href="/register" className="text-accent hover:underline">
              Sign up
            </a>
          </div>
          <div className="text-center text-sm text-text-muted">
            <a href="/forgot-password" className="text-accent hover:underline">
              Forgot password?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-text">Create account</h1>
          <p className="text-text-muted mt-1">Start managing your projects</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <Input label="Display Name" placeholder="John Doe" required />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              helperText="At least 12 characters"
            />
            <Button className="w-full" type="submit">
              Create account
            </Button>
          </form>
          <div className="text-center text-sm text-text-muted">
            Already have an account?{" "}
            <a href="/login" className="text-accent hover:underline">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-text">Forgot password</h1>
          <p className="text-text-muted mt-1">
            Enter your email to reset your password
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Button className="w-full" type="submit">
              Send reset link
            </Button>
          </form>
          <div className="text-center text-sm text-text-muted">
            <a href="/login" className="text-accent hover:underline">
              Back to sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-text">Reset password</h1>
          <p className="text-text-muted mt-1">Enter your new password</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              required
              helperText="At least 12 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <Button className="w-full" type="submit">
              Reset password
            </Button>
          </form>
          <div className="text-center text-sm text-text-muted">
            <a href="/login" className="text-accent hover:underline">
              Back to sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorPage() {
  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center">
        <ErrorState
          title="Something went wrong"
          description="An unexpected error occurred. Please try again."
          action={
            <Button onClick={() => window.location.reload()}>Reload</Button>
          }
        />
      </div>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning";
}) {
  const variants = {
    default: "bg-surface border-border",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
  };

  return (
    <div className={cn("p-4 rounded-lg border", variants[variant])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-text mt-1">{value}</p>
        </div>
        <div className="p-2 bg-accent-soft rounded-lg text-accent">{icon}</div>
      </div>
    </div>
  );
}
