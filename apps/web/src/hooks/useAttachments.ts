import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as attachmentsApi from "@/lib/api/attachments";

const ATTACHMENTS_KEY = (issueId: string) => ["attachments", issueId];

export function useAttachments(issueId: string) {
  return useQuery({
    queryKey: ATTACHMENTS_KEY(issueId),
    queryFn: () => attachmentsApi.fetchAttachments(issueId),
    enabled: !!issueId,
  });
}

export function useUploadAttachment(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsApi.uploadAttachment(issueId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTACHMENTS_KEY(issueId) });
    },
  });
}

export function useDeleteAttachment(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentsApi.deleteAttachment(issueId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTACHMENTS_KEY(issueId) });
    },
  });
}
