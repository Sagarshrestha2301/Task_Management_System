import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = (req as unknown as { id?: string }).id ?? "unknown";
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
      requestId,
    },
  });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = (req as unknown as { id?: string }).id ?? "unknown";
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      requestId,
      message: err.message,
    }),
  );
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "An unexpected error occurred.",
      requestId,
    },
  });
}
