import { Router } from "express";
import {
  healthCheck,
  readinessCheck,
  metricsCheck,
} from "./health.controller.js";
export function createHealthRouter() {
  const router = Router();
  router.get("/health", healthCheck);
  router.get("/health/ready", readinessCheck);
  router.get("/metrics", metricsCheck);
  return router;
}
