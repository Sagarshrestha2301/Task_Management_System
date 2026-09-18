import { useParams } from "react-router";
import { useProject } from "@/hooks/useProjects";
import { LoadingState, EmptyState } from "@/components/ui/Feedback";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function ProjectDetail() {
  const { projectId } = useParams();
  const { data, isLoading, error } = useProject(projectId!);

  if (isLoading) return <LoadingState message="Loading project..." />;
  if (error)
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist or you don't have access."
      />
    );
  if (!data?.project)
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist or you don't have access."
      />
    );

  const project = data.project;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{project.name}</h1>
          {project.description && (
            <p className="text-text-muted mt-1">{project.description}</p>
          )}
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
