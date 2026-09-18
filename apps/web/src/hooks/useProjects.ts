import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectsApi from "@/lib/api/projects";

const PROJECTS_KEY = ["projects"];
const PROJECT_KEY = (projectId: string) => ["projects", projectId];
const MEMBERS_KEY = (projectId: string) => ["projects", projectId, "members"];
const INVITATIONS_KEY = (projectId: string) => [
  "projects",
  projectId,
  "invitations",
];

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: projectsApi.fetchProjects,
    retry: false,
    throwOnError: false,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: PROJECT_KEY(projectId),
    queryFn: () => projectsApi.fetchProject(projectId),
    enabled: !!projectId,
    retry: false,
    throwOnError: false,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: projectsApi.UpdateProjectInput) =>
      projectsApi.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useArchiveProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectsApi.archiveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectsApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: MEMBERS_KEY(projectId),
    queryFn: () => projectsApi.fetchProjectMembers(projectId),
    enabled: !!projectId,
    retry: false,
    throwOnError: false,
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: projectsApi.InviteMemberInput) =>
      projectsApi.addProjectMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY(projectId) });
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      projectsApi.removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY(projectId) });
    },
  });
}

export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "OWNER" | "MEMBER";
    }) => projectsApi.updateProjectMemberRole(projectId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEY(projectId) });
    },
  });
}

export function useSendInvitation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: projectsApi.InviteMemberInput) =>
      projectsApi.sendProjectInvitation(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY(projectId) });
    },
  });
}

export function useInvitations(projectId: string) {
  return useQuery({
    queryKey: INVITATIONS_KEY(projectId),
    queryFn: () => projectsApi.fetchInvitations(projectId),
    enabled: !!projectId,
    retry: false,
    throwOnError: false,
  });
}

export function useRevokeInvitation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      projectsApi.revokeInvitation(projectId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_KEY(projectId) });
    },
  });
}
