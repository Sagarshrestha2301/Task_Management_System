import { Router } from "express";
import { healthCheck, readinessCheck } from "./health/health.controller.js";
import { createAuthRouter } from "./auth/auth.routes.js";
import { withAuth } from "./auth/auth.middleware.js";
export function createApiRouter() {
    const router = Router();
    router.use("/health", healthCheck);
    router.use("/health/ready", readinessCheck);
    router.use("/v1/auth", createAuthRouter());
    router.use("/v1", withAuth);
    return router;
}
