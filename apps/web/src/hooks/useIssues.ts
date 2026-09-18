import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as issuesApi from "@/lib/api/issues";

const ISSUES_KEY = (projectId: string, params?: issuesApi.IssueQueryParams) => [
  "issues",
  projectId,
  params,
];
const ISSUE_KEY = (projectId: string, issueId: string) => [
  "issues",
  projectId,
  issueId,
];

export function useIssues(
  projectId: string,
  params?: issuesApi.IssueQueryParams,
) {
  return useQuery({
    queryKey: ISSUES_KEY(projectId, params),
    queryFn: () => issuesApi.fetchIssues(projectId, params),
    enabled: !!projectId,
    placeholderData: (previous) => previous,
  });
}

export function useIssue(projectId: string, issueId: string) {
  return useQuery({
    queryKey: ISSUE_KEY(projectId, issueId),
    queryFn: () => issuesApi.fetchIssue(projectId, issueId),
    enabled: !!projectId && !!issueId,
  });
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: issuesApi.CreateIssueInput) =>
      issuesApi.createIssue(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
    },
  });
}

export function useUpdateIssue(projectId: string, issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: issuesApi.UpdateIssueInput) =>
      issuesApi.updateIssue(projectId, issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId, issueId],
      });
    },
  });
}

export function useDeleteIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueId: string) => issuesApi.deleteIssue(projectId, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
    },
  });
}

export function useAddIssueLabels(projectId: string, issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelIds: string[]) =>
      issuesApi.addIssueLabels(projectId, issueId, labelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId, issueId],
      });
    },
  });
}

export function useRemoveIssueLabel(projectId: string, issueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      issuesApi.removeIssueLabel(projectId, issueId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId, issueId],
      });
    },
  });
}

export function useMoveIssue(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: issuesApi.MoveIssueInput & { issueId: string }) =>
      issuesApi.moveIssue(projectId, data.issueId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId, variables.issueId],
      });
    },
  });
}
