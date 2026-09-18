import { API_BASE_URL } from "./config";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  _count?: { issues: number; members: number };
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  role: "OWNER" | "MEMBER";
  joinedAt: string;
}

export interface Invitation {
  id: string;
  projectId: string;
  email: string;
  role: "OWNER" | "MEMBER";
  secretHash: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdBy: string;
  creator: { id: string; name: string; email: string };
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface InviteMemberInput {
  email: string;
  role?: "OWNER" | "MEMBER";
}

export interface UpdateMemberRoleInput {
  role: "OWNER" | "MEMBER";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Request failed");
  }
  return response.json();
}

export async function fetchProjects(): Promise<{ projects: Project[] }> {
  const response = await fetch(`${API_BASE_URL}/v1/projects`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function fetchProject(
  projectId: string,
): Promise<{ project: Project & { members: ProjectMember[]; labels: any[] } }> {
  const response = await fetch(`${API_BASE_URL}/v1/projects/${projectId}`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function createProject(
  data: CreateProjectInput,
): Promise<{ project: Project }> {
  const response = await fetch(`${API_BASE_URL}/v1/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectInput,
): Promise<{ project: Project }> {
  const response = await fetch(`${API_BASE_URL}/v1/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function archiveProject(projectId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/archive`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to archive project");
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to delete project");
  }
}

export async function fetchProjectMembers(
  projectId: string,
): Promise<{ members: ProjectMember[] }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/members`,
    { credentials: "include" },
  );
  return handleResponse(response);
}

export async function addProjectMember(
  projectId: string,
  data: InviteMemberInput,
): Promise<{ member: ProjectMember }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/members`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
}

export async function removeProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/members`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId }),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to remove member");
  }
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: "OWNER" | "MEMBER",
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/members/${userId}/role`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to update member role");
  }
}

export async function sendProjectInvitation(
  projectId: string,
  data: InviteMemberInput,
): Promise<{ invitation: Invitation; secret: string }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/invitations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
}

export async function fetchInvitations(
  projectId: string,
): Promise<{ invitations: Invitation[] }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/invitations`,
    { credentials: "include" },
  );
  return handleResponse(response);
}

export async function revokeInvitation(
  projectId: string,
  invitationId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/invitations`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ invitationId }),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to revoke invitation");
  }
}
