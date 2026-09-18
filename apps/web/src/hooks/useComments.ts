import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as commentsApi from "@/lib/api/comments";

const COMMENTS_KEY = (issueId: string) => ["comments", issueId];

export function useComments(issueId: string) {
  return useInfiniteQuery({
    queryKey: COMMENTS_KEY(issueId),
    queryFn: ({ pageParam }) =>
      commentsApi.fetchComments(issueId, { page: pageParam, limit: 25 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!issueId,
  });
}

export function useCreateComment(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentsApi.createComment(issueId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
    },
  });
}

export function useUpdateComment(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      commentsApi.updateComment(issueId, commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
    },
  });
}

export function useDeleteComment(issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      commentsApi.deleteComment(issueId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
    },
  });
}
