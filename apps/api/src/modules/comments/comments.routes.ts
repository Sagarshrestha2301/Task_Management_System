import { Router } from "express";
import {
  createComment,
  listComments,
  getComment,
  updateComment,
  deleteComment,
} from "./comments.controller.js";

export function createCommentsRouter() {
  const router = Router();

  router.post("/", createComment);
  router.get("/", listComments);
  router.get("/:commentId", getComment);
  router.patch("/:commentId", updateComment);
  router.delete("/:commentId", deleteComment);

  return router;
}
