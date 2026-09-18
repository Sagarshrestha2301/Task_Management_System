import { Router } from "express";
import { healthCheck, readinessCheck } from "./health.controller.js";
export function createHealthRouter() {
    const router = Router();
    router.get("/health", healthCheck);
    router.get("/health/ready", readinessCheck);
    return router;
}
