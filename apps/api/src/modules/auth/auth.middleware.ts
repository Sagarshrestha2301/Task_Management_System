import type { Request, Response, NextFunction } from "express";

export function withAuth(req: Request, _res: Response, next: NextFunction) {
  next();
}
