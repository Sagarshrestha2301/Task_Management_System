import { z } from "zod";

export const APP_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL",
} as const;

export function makeErrorResponse(
  code: string,
  message: string,
  requestId: string,
  fields?: Record<string, string>,
) {
  return {
    error: {
      code,
      message,
      requestId,
      ...(fields && { fields }),
    },
  };
}
