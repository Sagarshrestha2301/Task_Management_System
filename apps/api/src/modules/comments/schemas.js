import { z } from "zod";
export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});
export const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});
export const commentParamsSchema = z.object({
  projectId: z.string().uuid(),
  issueId: z.string().uuid(),
  commentId: z.string().uuid(),
});
export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
