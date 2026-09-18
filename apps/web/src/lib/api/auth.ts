import { API_BASE_URL } from "./config";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    requestId: string;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }
  return response.json();
}

export async function registerUser(data: {
  displayName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(response);
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(response);
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }
}

export async function getSession(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/session`, {
    credentials: "include",
  });
  return handleResponse<AuthResponse>(response);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }
}

export async function forgotPassword(data: { email: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error.message);
  }
}
