import { API_BASE_URL } from "./config";

export interface Attachment {
  id: string;
  issueId: string;
  uploadedById: string;
  uploadedBy: { id: string; name: string; email: string };
  originalName: string;
  storageKey: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
  deletedAt: string | null;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Request failed");
  }
  return response.json();
}

export async function fetchAttachments(
  issueId: string,
): Promise<{ attachments: Attachment[] }> {
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/attachments`,
    { credentials: "include" },
  );
  return handleResponse(response);
}

export async function uploadAttachment(
  issueId: string,
  file: File,
): Promise<{ attachment: Attachment }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/attachments`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );
  return handleResponse(response);
}

export async function downloadAttachment(
  issueId: string,
  attachmentId: string,
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/attachments/download?attachmentId=${attachmentId}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to download attachment");
  }
  return response.blob();
}

export async function deleteAttachment(
  issueId: string,
  attachmentId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/issues/${issueId}/attachments`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ attachmentId }),
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Failed to delete attachment");
  }
}
