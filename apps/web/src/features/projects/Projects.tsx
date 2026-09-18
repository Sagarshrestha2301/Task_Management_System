import { useState } from "react";
import { FolderKanban, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/Feedback";
import { useProjects, useCreateProject } from "@/hooks/useProjects";

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(80),
  description: z.string().trim().max(2000).optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export function Projects() {
  const { data, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      await createProjectMutation.mutateAsync(data);
      setIsCreateOpen(false);
      reset();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const filteredProjects = data?.projects
    ?.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ?.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Projects</h1>
          <p className="text-text-muted">All your projects in one place</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="search"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 pl-10 pr-4 rounded-md bg-surface-muted border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-danger">Failed to load projects</p>
        </div>
      ) : filteredProjects?.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              title={searchQuery ? "No projects found" : "No projects yet"}
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : "Create your first project to start organizing work"
              }
              action={
                <Button onClick={() => setIsCreateOpen(true)}>
                  Create Project
                </Button>
              }
              icon={<FolderKanban className="h-12 w-12" />}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects!.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Project Name"
              placeholder="My Project"
              {...register("name")}
              error={errors.name?.message}
              required
            />
            <Input
              label="Description (optional)"
              placeholder="Brief description..."
              {...register("description")}
              error={errors.description?.message}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  reset();
                  setIsCreateOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createProjectMutation.isPending}>
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text truncate">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
              <span>{project._count?.issues ?? 0} issues</span>
              <span>{project._count?.members ?? 0} members</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-5 w-3/4 bg-surface-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-surface-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-surface-muted animate-pulse rounded" />
          <div className="flex gap-4 mt-3">
            <div className="h-4 w-20 bg-surface-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-surface-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
