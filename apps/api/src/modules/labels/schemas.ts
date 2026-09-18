import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().trim().min(1).max(40),
  colorKey: z.string().trim().max(30).optional(),
});

export const updateLabelSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  colorKey: z.string().trim().max(30).optional(),
});
