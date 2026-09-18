import { useState } from "react";
import { Send, Edit, Trash2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/useComments";

interface CommentsThreadProps {
  issueId: string;
}

export function CommentsThread({ issueId }: CommentsThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useComments(issueId);
  const createComment = useCreateComment(issueId);
  const updateComment = useUpdateComment(issueId);
  const deleteComment = useDeleteComment(issueId);

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync(newComment.trim());
      setNewComment("");
    } catch (err) {
      console.error("Failed to create comment:", err);
    }
  };

  const startEdit = (comment: any) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
  };

  const saveEdit = async (commentId: string) => {
    try {
      await updateComment.mutateAsync({ commentId, body: editBody.trim() });
      setEditingId(null);
      setEditBody("");
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            No comments yet. Start the conversation!
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isEditing={editingId === comment.id}
                editBody={editBody}
                onEditBodyChange={setEditBody}
                onStartEdit={() => startEdit(comment)}
                onSaveEdit={() => saveEdit(comment.id)}
                onCancelEdit={cancelEdit}
                onDelete={() => handleDelete(comment.id)}
                showMenu={showMenu === comment.id}
                onMenuToggle={() =>
                  setShowMenu(showMenu === comment.id ? null : comment.id)
                }
              />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2 text-sm text-text-muted hover:text-text"
              >
                {isFetchingNextPage ? "Loading..." : "Load more comments"}
              </button>
            )}
          </>
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
            disabled={createComment.isPending}
          />
          <Button
            type="submit"
            loading={createComment.isPending}
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function CommentItem({
  comment,
  isEditing,
  editBody,
  onEditBodyChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  showMenu,
  onMenuToggle,
}: any) {
  const isAuthor = true; // TODO: compare with current user

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-accent">
          {comment.author?.name?.[0] ?? "U"}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-text">{comment.author?.name}</span>
          <span className="text-text-muted">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {isAuthor && (
            <Dropdown
              trigger={
                <MoreVertical className="h-4 w-4 text-text-muted hover:text-text cursor-pointer" />
              }
              content={
                <>
                  <DropdownItem onClick={onStartEdit}>Edit</DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem
                    onClick={() => onDelete(comment.id)}
                    destructive
                  >
                    Delete
                  </DropdownItem>
                </>
              }
            />
          )}
        </div>
        {isEditing ? (
          <div className="flex gap-2 mt-2">
            <textarea
              value={editBody}
              onChange={(e) => onEditBodyChange(e.target.value)}
              className="flex-1 min-h-[60px] p-2 rounded border border-border bg-surface text-text resize-none focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSaveEdit(comment.id);
                }
              }}
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onSaveEdit(comment.id)}
              loading={false}
            >
              Save
            </Button>
          </div>
        ) : (
          <p className="mt-1 text-text whitespace-pre-wrap">{comment.body}</p>
        )}
      </div>
    </div>
  );
}
