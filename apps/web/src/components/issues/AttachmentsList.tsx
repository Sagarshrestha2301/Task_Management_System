import { useState } from "react";
import { Paperclip, Download, Trash2, Eye, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks/useAttachments";

interface AttachmentsListProps {
  issueId: string;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024;

export function AttachmentsList({ issueId }: AttachmentsListProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data, isLoading } = useAttachments(issueId);
  const uploadMutation = useUploadAttachment(issueId);
  const deleteMutation = useDeleteAttachment(issueId);

  const attachments = data?.attachments ?? [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Invalid file type. Allowed: JPEG, PNG, WebP, PDF");
      return;
    }
    if (file.size > MAX_SIZE) {
      alert("File too large. Maximum 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Delete this attachment?")) return;
    try {
      await deleteMutation.mutateAsync(attachmentId);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      const blob = await downloadAttachment(issueId, attachment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const downloadAttachment = async (
    issueId: string,
    attachmentId: string,
  ): Promise<Blob> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/v1/issues/${issueId}/attachments/download?attachmentId=${attachmentId}`,
      { credentials: "include" },
    );
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 p-4">
        <div className="h-16 bg-surface-muted rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        dragOver && "border-accent bg-accent-soft",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text">Attachments</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Paperclip className="h-4 w-4 mr-1" /> Add File
        </Button>
      </div>

      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {selectedFile && (
        <div className="mb-4 p-3 bg-surface-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedFile.type.startsWith("image/") ? (
              <Image className="h-6 w-6 text-accent" />
            ) : (
              <Paperclip className="h-6 w-6 text-accent" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-text-muted">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button onClick={handleUpload} loading={uploadMutation.isPending}>
              Upload
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {attachments.length === 0 && (
          <p className="text-center text-text-muted py-8">
            No attachments yet. Drag & drop or click to add files.
          </p>
        )}
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg"
          >
            {attachment.mimeType.startsWith("image/") ? (
              <Image className="h-8 w-8 text-accent" />
            ) : (
              <Paperclip className="h-8 w-8 text-accent" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text truncate">
                {attachment.originalName}
              </p>
              <p className="text-sm text-text-muted">
                {(attachment.byteSize / 1024).toFixed(1)} KB •{" "}
                {attachment.mimeType}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(attachment.id)}
                loading={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
