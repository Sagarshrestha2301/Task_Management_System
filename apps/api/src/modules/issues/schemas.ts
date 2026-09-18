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
