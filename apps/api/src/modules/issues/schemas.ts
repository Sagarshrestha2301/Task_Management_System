import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  version: z.number().int().positive().optional(),
});

export const issueParamsSchema = z.object({
  projectId: z.string().uuid(),
  issueId: z.string().uuid(),
});

export const issueQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  labelId: z.string().uuid().optional(),
  due: z.enum(["overdue", "today", "upcoming", "none"]).optional(),
  sort: z
    .enum(["updatedAt", "dueDate", "priority", "createdAt", "title"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const addLabelsSchema = z.object({
  labelIds: z.array(z.string().uuid()).min(1),
});

export const removeLabelSchema = z.object({
  labelId: z.string().uuid(),
});

export const reorderIssueSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  position: z.number().int().min(0),
  version: z.number().int().positive(),
});
