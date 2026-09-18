import { FolderKanban, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";

export function Projects() {
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

export function ProjectDetail() {
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
