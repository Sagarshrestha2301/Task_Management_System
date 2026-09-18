import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject,
  deleteProject,
  listMembers,
  addMember,
  removeMember,
  updateMemberRole,
  sendInvitation,
  listInvitations,
  revokeInvitation,
} from "./projects.controller.js";

export function createProjectsRouter() {
  const router = Router();

  router.post("/", createProject);
  router.get("/", listProjects);
  router.get("/:projectId", getProject);
  router.patch("/:projectId", updateProject);
  router.post("/:projectId/archive", archiveProject);
  router.delete("/:projectId", deleteProject);

  router.get("/:projectId/members", listMembers);
  router.post("/:projectId/members", addMember);
  router.delete("/:projectId/members", removeMember);
  router.patch("/:projectId/members/:userId/role", updateMemberRole);

  router.post("/:projectId/invitations", sendInvitation);
  router.get("/:projectId/invitations", listInvitations);
  router.delete("/:projectId/invitations", revokeInvitation);

  return router;
}
