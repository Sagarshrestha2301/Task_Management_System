import { Router } from "express";
import {
  healthCheck,
  readinessCheck,
} from "@/modules/health/health.controller";
import { withAuth } from "@/modules/auth/auth.middleware";

export function createApiRouter() {
  const router = Router();

  router.use("/health", healthCheck);
  router.use("/v1", withAuth);

  return router;
}
