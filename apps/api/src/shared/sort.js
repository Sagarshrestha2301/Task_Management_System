import { z } from "zod";
export const sortSchema = z.object({
  sort: z
    .enum(["updatedAt", "dueDate", "priority", "createdAt", "title"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
