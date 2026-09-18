import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(2000).optional(),
});
