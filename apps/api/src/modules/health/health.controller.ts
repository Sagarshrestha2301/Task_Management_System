import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

export function healthCheck(_req: Request, res: Response, _next: NextFunction) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

export async function readinessCheck(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: "ok" },
      },
    });
  } catch (err) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: "failed", error: String(err) },
      },
    });
  }
}

export async function metricsCheck(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const mem = process.memoryUsage();
  const uptime = process.uptime();

  res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.send(
    `# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime.toFixed(2)}
# HELP process_memory_bytes Memory usage in bytes
# TYPE process_memory_bytes gauge
process_memory_bytes{type="rss"} ${mem.rss}
process_memory_bytes{type="heapUsed"} ${mem.heapUsed}
process_memory_bytes{type="heapTotal"} ${mem.heapTotal}
process_memory_bytes{type="external"} ${mem.external}
# HELP process_cpu_seconds_total CPU time used in seconds
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total{type="user"} ${(process.cpuUsage().user / 1e6).toFixed(3)}
process_cpu_seconds_total{type="system"} ${(process.cpuUsage().system / 1e6).toFixed(3)}
# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`,
  );
}
