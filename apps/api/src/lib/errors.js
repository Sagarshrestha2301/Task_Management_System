export const APP_ERROR_CODES = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    UNAUTHENTICATED: "UNAUTHENTICATED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL: "INTERNAL",
};
export function makeErrorResponse(code, message, requestId, fields) {
    return {
        error: {
            code,
            message,
            requestId,
            ...(fields && { fields }),
        },
    };
}
