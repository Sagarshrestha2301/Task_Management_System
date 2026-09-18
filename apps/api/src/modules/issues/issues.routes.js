import { Router } from "express";
import { uploadRateLimiter } from "../../middleware/rate-limiter.js";
import {
  createIssue,
  listIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  addLabels,
  removeLabel,
  moveIssue,
} from "./issues.controller.js";
export function createIssuesRouter() {
  const router = Router();
  router.post("/", createIssue);
  router.get("/", listIssues);
  router.get("/:issueId", getIssue);
  router.patch("/:issueId", updateIssue);
  router.delete("/:issueId", deleteIssue);
  router.post("/:issueId/labels", addLabels);
  router.delete("/:issueId/labels", removeLabel);
  router.post("/:issueId/move", moveIssue);
  router.use("/:issueId/attachments", uploadRateLimiter);
  return router;
}
