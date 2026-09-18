import { z } from "zod";

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

export type IssueQueryInput = z.infer<typeof issueQuerySchema>;
