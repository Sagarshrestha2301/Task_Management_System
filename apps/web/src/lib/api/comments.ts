import { API_BASE_URL } from "./config";

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  author: { id: string; name: string; email: string; avatarUrl: string | null };
  body: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedComments {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCommentInput {
  body: string;
}

export interface UpdateCommentInput {
  body: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Request failed");
  }
  return response.json();
}

export async function fetchComments(
  issueId: string,
  params?: { page?: number; limit?: number },
): Promise<{
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/comments?${searchParams}`,
    { credentials: "include" },
  );
  return handleResponse(response);
}

export async function createComment(
  issueId: string,
  body: string,
): Promise<{ comment: Comment }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body }),
    },
  );
  return handleResponse(response);
}

export async function updateComment(
  issueId: string,
  commentId: string,
  body: string,
): Promise<{ comment: Comment }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/comments/${commentId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body }),
    },
  );
  return handleResponse(response);
}

export async function deleteComment(
  issueId: string,
  commentId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/comments/${commentId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to delete comment");
  }
}
