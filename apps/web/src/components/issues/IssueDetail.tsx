import { useState } from "react";
import { useParams } from "react-router";
import { X, MessageSquare, Paperclip, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { useIssue } from "@/hooks/useIssues";
import { CommentsThread } from "@/components/issues/CommentsThread";
import { AttachmentsList } from "@/components/issues/AttachmentsList";
import { LoadingState, EmptyState } from "@/components/ui/Feedback";

interface IssueDetailProps {
  projectId: string;
  onClose: () => void;
}

export function IssueDetail({ projectId, onClose }: IssueDetailProps) {
  const { issueId } = useParams<{ issueId: string }>();
  const { data, isLoading, error } = useIssue(projectId, issueId!);

  const [activeTab, setActiveTab] = useState<
    "details" | "comments" | "attachments"
  >("details");

  if (isLoading) return <LoadingState message="Loading issue..." />;
  if (error || !data?.issue)
    return (
      <EmptyState
        title="Issue not found"
        description="The issue you're looking for doesn't exist or you don't have access."
        onClose={onClose}
      />
    );

  const issue = data.issue;

  return (
    <Sheet
      open
      onOpenChange={onClose}
      side="right"
      className="max-w-2xl w-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <span className="text-sm font-medium text-text-muted">
                #{issue.issueNumber}
              </span>
              <h2 className="text-lg font-semibold text-text truncate max-w-[300px]">
                {issue.title}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex border-b border-border" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "details"}
            onClick={() => setActiveTab("details")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === "details"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            )}
          >
            Details
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "comments"}
            onClick={() => setActiveTab("comments")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === "comments"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            )}
          >
            <MessageSquare className="h-4 w-4 inline mr-1" /> Comments
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "attachments"}
            onClick={() => setActiveTab("attachments")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === "attachments"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            )}
          >
            <Paperclip className="h-4 w-4 inline mr-1" /> Attachments
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "details" && <IssueDetailsPanel issue={issue} />}
          {activeTab === "comments" && <CommentsThread issueId={issue.id} />}
          {activeTab === "attachments" && (
            <AttachmentsList issueId={issue.id} />
          )}
        </div>
      </div>
    </Sheet>
  );
}

function IssueDetailsPanel({ issue }: { issue: any }) {
  const priorityColors = {
    LOW: "bg-gray-100 text-gray-700 border-gray-200",
    MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    URGENT: "bg-red-100 text-red-700 border-red-200",
  };

  const statusColors = {
    TODO: "bg-gray-100 text-gray-700 border-gray-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    IN_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
    DONE: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            statusColors[issue.status as keyof typeof statusColors] ||
              "default",
          )}
        >
          {issue.status.replace("_", " ")}
        </span>
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            priorityColors[issue.priority as keyof typeof priorityColors] ||
              "default",
          )}
        >
          {issue.priority}
        </span>
      </div>

      {issue.description && (
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">
            Description
          </h3>
          <p className="text-text whitespace-pre-wrap">{issue.description}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Assignee</h3>
          {issue.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
                <span className="text-sm font-medium text-accent">
                  {issue.assignee.name[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-text">{issue.assignee.name}</p>
                <p className="text-sm text-text-muted">
                  {issue.assignee.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-text-muted">Unassigned</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Due Date</h3>
          {issue.dueDate ? (
            <p className="text-text">
              {new Date(issue.dueDate).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-text-muted">No due date</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Labels</h3>
          {issue.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {issue.labels.map(
                ({
                  label,
                }: {
                  label: { id: string; name: string; colorKey: string | null };
                }) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-border bg-surface-muted text-text"
                  >
                    {label.name}
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="text-text-muted">No labels</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Created</h3>
          <p className="text-text">
            {new Date(issue.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Updated</h3>
          <p className="text-text">
            {new Date(issue.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-text-muted mb-2">Activity</h3>
        <p className="text-sm text-text-muted">Version: {issue.version}</p>
      </div>
    </div>
  );
}
