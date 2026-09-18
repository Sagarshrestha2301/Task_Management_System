import { useState, useCallback, useRef } from "react";
import { Plus, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { IssueCard } from "./IssueCard";
import { EmptyState } from "@/components/ui/Feedback";
import { useIssues, useMoveIssue } from "@/hooks/useIssues";

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

interface KanbanColumnProps {
  projectId: string;
  status: (typeof STATUSES)[number];
  issues: any[];
  onIssueClick: (issue: any) => void;
  moveIssue: (
    issueId: string,
    data: {
      status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
      position: number;
      version: number;
    },
  ) => Promise<void>;
  isMoving: boolean;
}

function KanbanColumn({
  projectId,
  status,
  issues,
  onIssueClick,
  moveIssue,
  isMoving,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const issueId = e.dataTransfer.getData("application/json");
      if (!issueId) return;

      const issue = issues.find((i) => i.id === issueId);
      if (!issue || issue.status === status) return;

      const position = issues.filter((i) => i.status === status).length;

      try {
        await moveIssue(issueId, { status, position, version: issue.version });
      } catch (err) {
        console.error("Failed to move issue:", err);
      }
    },
    [status, issues, moveIssue],
  );

  return (
    <div
      ref={columnRef}
      className={cn(
        "flex flex-col min-h-[400px] max-h-[600px] bg-surface-muted/50 rounded-lg",
        dragOver && "bg-accent-soft border-2 border-accent",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="list"
      aria-label={`${STATUS_LABELS[status]} column`}
    >
      <CardHeader className="px-3 py-2 bg-transparent border-none">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text">{STATUS_LABELS[status]}</h3>
          <Badge variant="outline">{issues.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="space-y-2 p-3 min-h-[300px] overflow-y-auto"
          role="list"
          aria-label={`${STATUS_LABELS[status]} issues`}
        >
          {issues.map((issue, index) => (
            <div key={issue.id} style={{ zIndex: issues.length - index }}>
              <IssueCard
                issue={issue}
                onClick={() => onIssueClick(issue)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/json", issue.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
              />
            </div>
          ))}
          {issues.length === 0 && (
            <div
              className={cn(
                "h-20 rounded-lg border-2 border-dashed flex items-center justify-center",
                dragOver ? "border-accent bg-accent-soft" : "border-border",
              )}
            >
              <span className="text-sm text-text-muted">Drop issues here</span>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}

interface KanbanBoardProps {
  projectId: string;
  issues: any[];
  onIssueClick: (issue: any) => void;
  isLoading: boolean;
}

export function KanbanBoard({
  projectId,
  issues,
  onIssueClick,
  isLoading,
}: KanbanBoardProps) {
  const moveIssueMutation = useMoveIssue(projectId);
  const [isMoving, setIsMoving] = useState(false);

  const moveIssue = useCallback(
    async (
      issueId: string,
      data: {
        status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
        position: number;
        version: number;
      },
    ) => {
      setIsMoving(true);
      try {
        await moveIssueMutation.mutateAsync({ issueId, ...data });
      } finally {
        setIsMoving(false);
      }
    },
    [moveIssueMutation],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <Card key={status} className="min-h-[400px]">
            <CardContent className="p-3">
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-surface-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const issuesByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status] = issues.filter((issue) => issue.status === status);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          projectId={projectId}
          status={status}
          issues={issuesByStatus[status] || []}
          onIssueClick={onIssueClick}
          moveIssue={moveIssue}
          isMoving={isMoving}
        />
      ))}
    </div>
  );
}
