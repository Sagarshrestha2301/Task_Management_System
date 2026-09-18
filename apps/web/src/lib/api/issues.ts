import { API_BASE_URL } from "./config";

export interface Issue {
  id: string;
  projectId: string;
  issueNumber: number;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  dueDate: string | null;
  position: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  labels: {
    id: string;
    label: { id: string; name: string; colorKey: string | null };
  }[];
  _count?: { comments: number; attachments: number };
}

export interface PaginatedIssues {
  issues: Issue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IssueQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  labelId?: string;
  due?: "overdue" | "today" | "upcoming" | "none";
  sort?: "updatedAt" | "dueDate" | "priority" | "createdAt" | "title";
  order?: "asc" | "desc";
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string | null;
  dueDate?: string | null;
  version?: number;
}

export interface AddLabelsInput {
  labelIds: string[];
}

export interface MoveIssueInput {
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  position: number;
  version: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Request failed");
  }
  return response.json();
}

export async function fetchIssues(
  projectId: string,
  params?: IssueQueryParams,
): Promise<PaginatedIssues> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
  }
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues?${searchParams}`,
    { credentials: "include" },
  );
  return handleResponse(response);
}

export async function fetchIssue(
  projectId: string,
  issueId: string,
): Promise<{ issue: Issue }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues/${issueId}`,
    { credentials: "include" },
  );
  return handleResponse(response);
}

export async function createIssue(
  projectId: string,
  data: CreateIssueInput,
): Promise<{ issue: Issue }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
}

export async function updateIssue(
  projectId: string,
  issueId: string,
  data: UpdateIssueInput,
): Promise<{ issue: Issue }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues/${issueId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
}

export async function deleteIssue(
  projectId: string,
  issueId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues/${issueId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to delete issue");
  }
}

export async function addIssueLabels(
  projectId: string,
  issueId: string,
  labelIds: string[],
): Promise<{ issue: Issue }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues/${issueId}/labels`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ labelIds }),
    },
  );
  return handleResponse(response);
}

export async function removeIssueLabel(
  projectId: string,
  issueId: string,
  labelId: string,
): Promise<{ issue: Issue }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues/${issueId}/labels`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ labelId }),
    },
  );
  return handleResponse(response);
}

export async function moveIssue(
  projectId: string,
  issueId: string,
  data: MoveIssueInput,
): Promise<{ issue: Issue }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/projects/${projectId}/issues/${issueId}/move`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  return handleResponse(response);
}
