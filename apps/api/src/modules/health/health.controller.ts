import type { Request, Response, NextFunction } from "express";

export function healthCheck(_req: Request, res: Response, _next: NextFunction) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

export function readinessCheck(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.json({ status: "ready", timestamp: new Date().toISOString() });
}
