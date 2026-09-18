import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Search,
  Plus,
  Bell,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";

export function Dashboard() {
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
