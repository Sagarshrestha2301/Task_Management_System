import type { Request, Response, NextFunction } from "express";
import { generateRequestId } from "../lib/request-id.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = generateRequestId();
  (req as unknown as { id: string }).id = requestId;
  res.setHeader("X-Request-ID", requestId);

  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      }),
    );
  });

  next();
}
