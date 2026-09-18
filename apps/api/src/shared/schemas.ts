import { z } from "zod";

export const userCreateSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(12).max(128),
});
