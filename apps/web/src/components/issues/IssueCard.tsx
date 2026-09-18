import { Clock, User, Tag, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";

interface IssueCardProps {
  issue: {
    id: string;
    issueNumber: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignee: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    } | null;
    dueDate: string | null;
    labels: { label: { id: string; name: string; colorKey: string | null } }[];
    version: number;
  };
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export function IssueCard({ issue, onClick, onDragStart }: IssueCardProps) {
  const isOverdue =
    issue.dueDate &&
    new Date(issue.dueDate) < new Date() &&
    issue.status !== "DONE";

  const priorityVariants = {
    LOW: "outline" as const,
    MEDIUM: "default" as const,
    HIGH: "warning" as const,
    URGENT: "danger" as const,
  };

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      className={cn(
        "bg-surface border border-border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        isOverdue && "border-red-300 bg-red-50",
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-text-muted">
          #{issue.issueNumber}
        </span>
        <Badge
          variant={
            priorityVariants[issue.priority as keyof typeof priorityVariants] ||
            "default"
          }
        >
          {issue.priority}
        </Badge>
      </div>

      <h4 className="font-medium text-text mb-1 line-clamp-2">{issue.title}</h4>

      {issue.description && (
        <p className="text-sm text-text-muted mb-2 line-clamp-2">
          {issue.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {issue.labels.slice(0, 3).map(({ label }) => (
          <Badge key={label.id} variant="outline" className="text-xs">
            {label.name}
          </Badge>
        ))}
        {issue.labels.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{issue.labels.length - 3}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          {issue.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback>{issue.assignee.name[0]}</AvatarFallback>
            </Avatar>
          )}
          {issue.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-600" : "text-text-muted",
              )}
            >
              <Clock className="h-3 w-3" />
              {format(new Date(issue.dueDate), "MMM d")}
            </span>
          )}
        </div>
        {isOverdue && issue.status !== "DONE" && (
          <AlertTriangle
            className="h-4 w-4 text-red-500"
            aria-label="Overdue"
          />
        )}
      </div>
    </div>
  );
}
